// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAcademyRepository } from '../src/repositories/academy.repository';
import { PersistentEditorialRepository } from '../src/repositories/editorial.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { bookService } from '../src/services/application/book.service';
import { bookletService } from '../src/services/application/booklet.service';
import {
  aplicarEdicoes,
  idDaEdicao,
  textoDoBloco,
  blocoEhTextual,
  EdicaoEditorial,
} from '../src/domain/edicao-editorial';
import { SEED_LESSONS, SEED_COURSES, SEED_MODULES } from '../src/data/seed-academy-content';
import { LIVRETOS_PADRAO } from '../src/data/seed-booklets';
import { AcademyLesson, LessonBlock } from '../src/domain/academy';

/**
 * A pergunta que este arquivo responde:
 *
 *   **"Eu vejo um erro gramatical, vou até ele e conserto — e isso atualiza o
 *   livro da biblioteca?"**
 *
 * São três garantias, e nenhuma delas é óbvia:
 *
 *  1. a correção é gravada e volta na leitura seguinte;
 *  2. **publicar uma versão nova do catálogo não a apaga** — este é o que
 *     poderia falhar em silêncio, e o que destruiria o trabalho de revisão
 *     sem ninguém perceber;
 *  3. o livro da biblioteca é gerado a partir da lição corrigida, e não da
 *     publicada. Se os dois divergissem, o aluno leria uma coisa na tela e
 *     outra no livro, sem saber qual vale.
 */

const EDITOR = 'usr_editora';

/** Uma lição com bloco de prosa, para as correções terem onde acontecer. */
function primeiraLicaoComProsa(): {
  licao: AcademyLesson;
  secaoId: string;
  bloco: Extract<LessonBlock, { kind: 'MARKDOWN' }>;
} {
  for (const licao of SEED_LESSONS) {
    for (const secao of licao.variants.TRADITIONAL.sections) {
      const bloco = (secao.blocks ?? []).find((b) => b.kind === 'MARKDOWN');
      if (bloco) {
        return {
          licao,
          secaoId: secao.id,
          bloco: bloco as Extract<LessonBlock, { kind: 'MARKDOWN' }>,
        };
      }
    }
  }
  throw new Error('nenhuma lição do catálogo tem bloco de prosa');
}

const { licao: LICAO, secaoId: SECAO, bloco: BLOCO } = primeiraLicaoComProsa();

const ALVO = {
  tipo: 'BLOCO' as const,
  variante: 'TRADITIONAL' as const,
  secaoId: SECAO,
  blocoId: BLOCO.id,
};

const TEXTO_CORRIGIDO = 'Este parágrafo foi corrigido pela revisão editorial.';

function correcao(texto = TEXTO_CORRIGIDO, motivo?: string): EdicaoEditorial {
  return {
    id: idDaEdicao(LICAO.id, ALVO),
    licaoId: LICAO.id,
    alvo: ALVO,
    conteudo: { ...BLOCO, markdown: texto },
    anterior: BLOCO,
    editadaPor: EDITOR,
    editadaEm: new Date().toISOString(),
    motivo,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('a correção chega à lição', () => {
  it('a camada aplicada troca o texto do bloco, e só dele', () => {
    const corrigida = aplicarEdicoes(LICAO, [correcao()]);
    const secao = corrigida.variants.TRADITIONAL.sections.find((s) => s.id === SECAO)!;
    const alvo = secao.blocks!.find((b) => b.id === BLOCO.id) as typeof BLOCO;

    expect(alvo.markdown).toBe(TEXTO_CORRIGIDO);

    // os demais blocos da mesma seção continuam intactos
    const outros = secao.blocks!.filter((b) => b.id !== BLOCO.id);
    const originais = LICAO.variants.TRADITIONAL.sections.find((s) => s.id === SECAO)!
      .blocks!.filter((b) => b.id !== BLOCO.id);
    expect(outros).toEqual(originais);
  });

  it('lição sem edição nenhuma volta idêntica, sem cópia desnecessária', () => {
    expect(aplicarEdicoes(LICAO, [])).toBe(LICAO);
  });

  it('a edição de uma lição não vaza para outra', () => {
    const outra = SEED_LESSONS.find((l) => l.id !== LICAO.id)!;
    expect(aplicarEdicoes(outra, [correcao()])).toBe(outra);
  });

  it('o repositório grava e devolve a correção', async () => {
    const repo = new PersistentEditorialRepository(new LocalStorageAdapter());
    await repo.salvar(correcao());

    const outra = new PersistentEditorialRepository(new LocalStorageAdapter());
    const lidas = await outra.daLicao(LICAO.id);
    expect(lidas).toHaveLength(1);
    expect((lidas[0].conteudo as typeof BLOCO).markdown).toBe(TEXTO_CORRIGIDO);
  });

  it('corrigir duas vezes o mesmo trecho deixa UMA edição, com o texto atual', async () => {
    const repo = new PersistentEditorialRepository(new LocalStorageAdapter());
    await repo.salvar(correcao('primeira tentativa'));
    await repo.salvar(correcao('segunda e definitiva'));

    const lidas = await repo.daLicao(LICAO.id);
    expect(lidas).toHaveLength(1);
    expect((lidas[0].conteudo as typeof BLOCO).markdown).toBe('segunda e definitiva');
  });

  it('desfazer devolve o texto PUBLICADO, não a correção anterior', async () => {
    /**
     * Sem isto, depois de três correções "reverter" devolveria a segunda
     * versão — e o botão deixaria de significar "voltar ao que o
     * Conservatório publicou".
     */
    const repo = new PersistentEditorialRepository(new LocalStorageAdapter());
    await repo.salvar(correcao('primeira'));
    await repo.salvar(correcao('segunda'));

    const [gravada] = await repo.daLicao(LICAO.id);
    expect((gravada.anterior as typeof BLOCO).markdown).toBe(BLOCO.markdown);
  });

  it('reverter apaga a edição e a lição volta a ser a publicada', async () => {
    const repo = new PersistentEditorialRepository(new LocalStorageAdapter());
    const c = correcao();
    await repo.salvar(c);
    await repo.reverter(c.id);

    expect(await repo.daLicao(LICAO.id)).toEqual([]);
    expect(aplicarEdicoes(LICAO, await repo.todas())).toBe(LICAO);
  });

  it('o histórico guarda quem corrigiu, quando e por quê', async () => {
    const repo = new PersistentEditorialRepository(new LocalStorageAdapter());
    await repo.salvar(correcao(TEXTO_CORRIGIDO, 'concordância verbal no segundo período'));

    const [h] = await repo.historico();
    expect(h.editadaPor).toBe(EDITOR);
    expect(h.motivo).toBe('concordância verbal no segundo período');
    expect(Date.parse(h.editadaEm)).not.toBeNaN();
  });
});

describe('toda leitura de lição já vem corrigida', () => {
  it('buscar a lição pelo identificador devolve o texto corrigido', async () => {
    const editorial = new PersistentEditorialRepository(new LocalStorageAdapter());
    await editorial.salvar(correcao());

    const academy = new PersistentAcademyRepository(new LocalStorageAdapter());
    const lida = await academy.findLessonById(LICAO.id);

    const secao = lida!.variants.TRADITIONAL.sections.find((s) => s.id === SECAO)!;
    const bloco = secao.blocks!.find((b) => b.id === BLOCO.id) as typeof BLOCO;
    expect(bloco.markdown).toBe(TEXTO_CORRIGIDO);
  });

  it('listar as lições do módulo também devolve o texto corrigido', async () => {
    const editorial = new PersistentEditorialRepository(new LocalStorageAdapter());
    await editorial.salvar(correcao());

    const academy = new PersistentAcademyRepository(new LocalStorageAdapter());
    const lista = await academy.listLessonsByModule(LICAO.moduleId);
    const lida = lista.find((l) => l.id === LICAO.id)!;

    const secao = lida.variants.TRADITIONAL.sections.find((s) => s.id === SECAO)!;
    const bloco = secao.blocks!.find((b) => b.id === BLOCO.id) as typeof BLOCO;
    expect(bloco.markdown).toBe(TEXTO_CORRIGIDO);
  });
});

describe('publicar catálogo não destrói revisão de texto', () => {
  it('a correção sobrevive à republicação do catálogo', async () => {
    /**
     * `conteudoPublicado()` reescreve as chaves de conteúdo quando a versão
     * muda — e `LESSONS` está entre elas. Se a edição morasse na mesma chave,
     * bastaria publicar um capítulo novo em QUALQUER curso para apagar, em
     * silêncio, toda a revisão gramatical já feita.
     */
    const editorial = new PersistentEditorialRepository(new LocalStorageAdapter());
    await editorial.salvar(correcao());

    window.localStorage.setItem('amd_academy_catalog_version', '"versao-anterior"');
    new PersistentAcademyRepository(new LocalStorageAdapter()); // republica

    const academy = new PersistentAcademyRepository(new LocalStorageAdapter());
    const lida = await academy.findLessonById(LICAO.id);
    const secao = lida!.variants.TRADITIONAL.sections.find((s) => s.id === SECAO)!;
    const bloco = secao.blocks!.find((b) => b.id === BLOCO.id) as typeof BLOCO;

    expect(bloco.markdown, 'a republicação apagou a correção editorial').toBe(TEXTO_CORRIGIDO);
  });

  it('a chave editorial não está entre as que a publicação reescreve', async () => {
    const editorial = new PersistentEditorialRepository(new LocalStorageAdapter());
    await editorial.salvar(correcao());

    window.localStorage.setItem('amd_academy_catalog_version', '"outra"');
    new PersistentAcademyRepository(new LocalStorageAdapter());

    /**
     * `LocalStorageAdapter` prefixa tudo com `amd_`, então a chave declarada
     * como `amd_academy_editorial_v1` é gravada com o prefixo repetido. Feio,
     * mas é a convenção de toda a base — e o teste confere a chave REAL, não
     * a que seria bonita.
     */
    expect(window.localStorage.getItem('amd_amd_academy_editorial_v1')).not.toBeNull();
  });
});

describe('o livro da biblioteca acompanha a correção', () => {
  it('corrigir a lição corrige o livro, sem segunda etapa', async () => {
    const editorial = new PersistentEditorialRepository(new LocalStorageAdapter());
    await editorial.salvar(correcao());

    const academy = new PersistentAcademyRepository(new LocalStorageAdapter());
    const curso = SEED_COURSES.find((c) => c.id === LICAO.courseId)!;
    const modulos = SEED_MODULES.filter((m) => m.courseId === curso.id).sort(
      (a, b) => a.order - b.order
    );
    const licoes = await academy.listLessonsByCourse(curso.id);
    const livreto = LIVRETOS_PADRAO.find((l) => l.cursoId === curso.id) ?? null;

    const { leitura } = bookService.gerar({ curso, modulos, licoes, livreto });
    const texto = leitura.secoes.map((s) => `${s.titulo}\n${s.conteudo}`).join('\n');

    expect(texto, 'o livro não trouxe a correção').toContain(TEXTO_CORRIGIDO);
  });
});

describe('o que é editável, e o que não é', () => {
  it('prosa, destaque, verificação e lâminas são editáveis como texto', () => {
    for (const kind of ['MARKDOWN', 'CALLOUT', 'CHECKPOINT', 'SLIDES'] as const) {
      expect(blocoEhTextual({ kind } as LessonBlock), kind).toBe(true);
    }
  });

  it('laboratório sonoro, pauta e diagrama não são editáveis como texto', () => {
    /**
     * São gerados a partir de notas musicais. Editá-los como texto produziria
     * um diagrama quebrado, não uma correção.
     */
    for (const kind of ['INTERVAL_LAB', 'SCALE_LAB', 'STAFF', 'DIAGRAM', 'KEYBOARD'] as const) {
      expect(blocoEhTextual({ kind } as LessonBlock), kind).toBe(false);
    }
  });

  it('o texto legível de um bloco permite achar o erro pela frase', () => {
    // Quem revisa procura "aquela frase", não o identificador do bloco.
    expect(textoDoBloco(BLOCO)).toContain(BLOCO.markdown.slice(0, 20));

    const verificacao: LessonBlock = {
      kind: 'CHECKPOINT',
      id: 'chk',
      question: 'Quantos semitons há numa terça maior?',
      options: ['3', '4'],
      correctIndex: 1,
      explanation: 'A terça maior tem quatro semitons.',
    };
    const texto = textoDoBloco(verificacao);
    expect(texto).toContain('terça maior');
    expect(texto).toContain('quatro semitons');
  });
});

describe('o livreto — exercícios, simulados e provas — também é editável', () => {
  it('o livreto gravado volta com a alteração', async () => {
    /**
     * A tela `/admin/booklets` já editava e gravava. O que faltava era o
     * caso que prova isso, para que a capacidade não se perca numa
     * refatoração.
     */
    const original = LIVRETOS_PADRAO[0];
    const alterado = {
      ...original,
      capitulos: original.capitulos.map((c, i) =>
        i === 0 ? { ...c, titulo: 'Título revisado pela edição' } : c
      ),
    };

    await bookletService.salvarLivreto(alterado);
    const lido = await bookletService.buscarLivretoDoCurso(original.cursoId);

    expect(lido?.capitulos[0].titulo).toBe('Título revisado pela edição');
  });
});
