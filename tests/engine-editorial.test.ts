import { describe, it, expect, beforeEach } from 'vitest';
import { EditorialService } from '../src/services/application/editorial.service';
import { EditorialRepository } from '../src/repositories/editorial.repository';
import {
  EditorialEdit,
  EditorialLesson,
  applyEdits,
  editId,
  isEditableBlock,
  isMusicalBlock,
  isTextualBlock,
  problemasDoBloco,
} from '../src/domain/editorial-edit';
import { lerPacote, fundirEdicoes, VERSAO_DO_PACOTE } from '../src/domain/pacote-editorial';
import { EdicaoDeArtigo } from '../src/domain/editorial-artigo';
import { AcademyLesson, LessonBlock } from '../src/domain/academy';

/**
 * A ENGINE EDITORIAL.
 *
 * 🔴 O QUE ESTAVA FALTANDO, E O QUE CADA PARTE GUARDA
 * ---------------------------------------------------
 * A camada editorial existia e sabia corrigir **texto**. `isTextualBlock`
 * decidia o que tinha lápis, e deixava de fora exatamente o que faz a
 * plataforma ser de música: pentagrama, teclado, exemplo sonoro, laboratórios
 * e diagrama. Uma pauta com nota errada só podia ser corrigida mudando o
 * código — e quem revisa conteúdo não é quem publica código.
 *
 * Também não sabia **acrescentar nem remover** bloco: só trocar o conteúdo de
 * um que já existia.
 *
 * E `EditorialLesson` — criar lição do zero — existia no domínio com
 * `mergeCreatedLessons`, e **nada os chamava**: nenhum repositório, nenhum
 * serviço, nenhuma tela. Capacidade projetada e desligada é pior que ausente,
 * porque parece presente.
 *
 * Por fim, nada disso saía do navegador. Sem pacote exportável, a "engine
 * editorial" era um rascunho com aparência de publicação.
 */

/** Repositório de memória: o serviço é testado sem navegador. */
class RepoDeMemoria implements EditorialRepository {
  public edicoes: EditorialEdit[] = [];
  public licoes: EditorialLesson[] = [];
  public arts: EdicaoDeArtigo[] = [];

  async todas() {
    return this.edicoes;
  }
  async daLicao(lessonId: string) {
    return this.edicoes.filter((e) => e.lessonId === lessonId);
  }
  async salvar(e: EditorialEdit) {
    const i = this.edicoes.findIndex((x) => x.id === e.id);
    const anterior = i >= 0 ? this.edicoes[i].anterior : e.anterior;
    const gravada = { ...e, anterior };
    if (i >= 0) this.edicoes[i] = gravada;
    else this.edicoes.push(gravada);
    return gravada;
  }
  async reverter(id: string) {
    this.edicoes = this.edicoes.filter((e) => e.id !== id);
  }
  async historico(limite = 100) {
    return this.edicoes.slice(0, limite);
  }
  async licoesCriadas() {
    return this.licoes;
  }
  async salvarLicaoCriada(l: EditorialLesson) {
    const i = this.licoes.findIndex((x) => x.id === l.id);
    if (i >= 0) this.licoes[i] = l;
    else this.licoes.push(l);
    return l;
  }
  async removerLicaoCriada(id: string) {
    this.licoes = this.licoes.filter((l) => l.id !== id);
  }
  async artigos() {
    return this.arts;
  }
  async salvarArtigo(a: EdicaoDeArtigo) {
    const i = this.arts.findIndex((x) => x.id === a.id);
    const anterior = i >= 0 ? this.arts[i].anterior : a.anterior;
    const gravada = { ...a, anterior };
    if (i >= 0) this.arts[i] = gravada;
    else this.arts.push(gravada);
    return gravada;
  }
  async removerArtigo(artigoId: string) {
    this.arts = this.arts.filter((a) => a.artigoId !== artigoId);
  }
  async substituirTudo(entrada: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
  }) {
    this.edicoes = entrada.edicoes;
    this.licoes = entrada.licoesCriadas;
    this.arts = entrada.artigos;
  }
}

const AGORA = '2026-09-20T12:00:00.000Z';

const md = (id: string, texto: string): LessonBlock => ({
  kind: 'MARKDOWN',
  id,
  markdown: texto,
});

const pauta = (id: string, notas: string[]): LessonBlock => ({
  kind: 'STAFF',
  id,
  clef: 'treble',
  notes: notas,
});

function licaoDeTeste(): AcademyLesson {
  return {
    id: 'les_teste',
    moduleId: 'mod_teste',
    courseId: 'crs_teste',
    order: 1,
    canonicalContentId: 'canon_teste',
    durationMinutes: 20,
    objectives: [],
    skills: [],
    activityIds: [],
    variants: {
      TRADITIONAL: {
        title: 'Lição de teste',
        summary: '',
        introduction: '',
        sections: [
          {
            id: 's1',
            title: 'Seção 1',
            contentMarkdown: '',
            blocks: [md('b1', 'primeiro'), md('b2', 'segundo')],
          },
        ],
        audioSamples: [],
        illustrations: [],
      },
      /**
       * A variante infantil é obrigatória no contrato, e entra vazia aqui de
       * propósito: os casos são sobre a adulta, e uma KIDS com conteúdo faria
       * `applyEdits` percorrer duas seções quando o caso fala de uma.
       */
      KIDS: {
        title: 'Lição de teste',
        summary: '',
        introduction: '',
        sections: [],
        audioSamples: [],
        illustrations: [],
      },
    },
    createdAt: AGORA,
    updatedAt: AGORA,
  } as AcademyLesson;
}

let repo: RepoDeMemoria;
let servico: EditorialService;

beforeEach(() => {
  repo = new RepoDeMemoria();
  servico = new EditorialService(repo);
});

describe('🔴 bloco MUSICAL também se edita', () => {
  it('pentagrama, teclado, exemplo sonoro e laboratórios são editáveis', () => {
    /**
     * Este é o caso que reprovaria a versão anterior inteira. Sem ele, uma
     * pauta com a nota errada só se conserta mudando o código.
     */
    const musicais: LessonBlock[] = [
      pauta('b', ['C4']),
      { kind: 'KEYBOARD', id: 'b', highlightNotes: ['C4'] },
      { kind: 'AUDIO_EXAMPLE', id: 'b', title: 'Exemplo', notes: ['C4'], playMode: 'SEQUENCE' },
      { kind: 'DIAGRAM', id: 'b', title: 'Ciclo', diagram: 'CIRCLE_OF_FIFTHS' },
      { kind: 'INTERVAL_LAB', id: 'b', title: 'Lab', lowerNote: 'C4', upperNote: 'E4' },
      { kind: 'CHORD_LAB', id: 'b', title: 'Lab', notes: ['C4', 'E4', 'G4'] },
      { kind: 'SCALE_LAB', id: 'b', title: 'Lab', tonic: 'C4', mode: 'MAJOR' },
    ];

    for (const b of musicais) {
      expect(isMusicalBlock(b), `${b.kind} não é reconhecido como musical`).toBe(true);
      expect(isEditableBlock(b), `${b.kind} não é editável`).toBe(true);
    }
  });

  it('o texto continua editável — a extensão não tirou nada', () => {
    for (const b of [md('b', 'x'), { kind: 'CALLOUT' as const, id: 'b', type: 'info' as const, title: 't', text: 'x' }]) {
      expect(isTextualBlock(b)).toBe(true);
      expect(isEditableBlock(b)).toBe(true);
    }
  });

  it('o marcador de vídeo NÃO é editável, e isso é decisão', () => {
    /**
     * A plataforma não hospeda vídeo (ADR-004). Um editor para ele produziria
     * campo que não leva a lugar nenhum.
     */
    const v: LessonBlock = { kind: 'VIDEO_PLACEHOLDER', id: 'b', topic: 'Aula' };
    expect(isEditableBlock(v)).toBe(false);
  });
});

describe('🔴 a validação recusa o que quebraria a lição', () => {
  it('pauta com nota fora da notação científica é recusada, com o motivo', () => {
    /**
     * Gravar "dó" em vez de "C4" produz pentagrama vazio na lição — e quem
     * gravou já saiu da tela quando o aluno encontra.
     */
    const problemas = problemasDoBloco(pauta('b', ['C4', 'dó', 'H9']));

    expect(problemas.length).toBeGreaterThan(0);
    expect(problemas.join(' '), 'a recusa não diz qual nota está errada').toContain('dó');
    expect(problemas.join(' '), 'a recusa não ensina o formato').toMatch(/C4/);
  });

  it('bloco musical sem nota nenhuma é recusado', () => {
    expect(problemasDoBloco(pauta('b', [])).join(' ')).toMatch(/nenhuma nota/i);
  });

  it('fórmula de compasso inválida é recusada', () => {
    const b: LessonBlock = { kind: 'STAFF', id: 'b', clef: 'treble', notes: ['C4'], timeSignature: 'quatro' };
    expect(problemasDoBloco(b).join(' ')).toMatch(/compasso/i);
  });

  it('verificação sem explicação é recusada — ela é a parte que ensina', () => {
    const b: LessonBlock = {
      kind: 'CHECKPOINT',
      id: 'b',
      question: 'Qual?',
      options: ['a', 'b'],
      correctIndex: 0,
      explanation: '   ',
    };
    expect(problemasDoBloco(b).join(' ')).toMatch(/explicação/i);
  });

  it('verificação cuja resposta certa não existe é recusada', () => {
    const b: LessonBlock = {
      kind: 'CHECKPOINT',
      id: 'b',
      question: 'Qual?',
      options: ['a', 'b'],
      correctIndex: 7,
      explanation: 'porque sim',
    };
    expect(problemasDoBloco(b).join(' ')).toMatch(/não existe/i);
  });

  it('bloco válido passa sem reclamação', () => {
    expect(problemasDoBloco(pauta('b', ['C4', 'E4', 'G4']))).toEqual([]);
    expect(problemasDoBloco(md('b', 'texto'))).toEqual([]);
  });

  it('🔴 o serviço RECUSA gravar bloco inválido', () => {
    /** Validar no domínio e não chamar na gravação seria validação decorativa. */
    return expect(
      servico.salvarBloco({
        lessonId: 'les_teste',
        variante: 'TRADITIONAL',
        secaoId: 's1',
        bloco: pauta('b1', ['NAO_E_NOTA']),
        publicado: pauta('b1', ['C4']),
        editadaPor: 'Aline',
      })
    ).rejects.toThrow(/notação científica/i);
  });

  it('o serviço recusa edição sem autoria', () => {
    return expect(
      servico.salvarBloco({
        lessonId: 'les_teste',
        variante: 'TRADITIONAL',
        secaoId: 's1',
        bloco: md('b1', 'ok'),
        publicado: md('b1', 'antes'),
        editadaPor: '  ',
      })
    ).rejects.toThrow(/autoria/i);
  });
});

describe('🔴 ACRESCENTAR e REMOVER bloco — o que a camada não sabia fazer', () => {
  it('a lista nova de blocos entra na lição', async () => {
    const licao = licaoDeTeste();

    await servico.salvarBlocosDaSecao({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId: 's1',
      blocos: [md('b1', 'primeiro'), pauta('b3', ['C4', 'E4']), md('b2', 'segundo')],
      publicados: [md('b1', 'primeiro'), md('b2', 'segundo')],
      editadaPor: 'Aline',
    });

    const lida = await servico.licaoComEdicoes(licao);
    const blocos = lida.variants.TRADITIONAL!.sections[0].blocks!;

    expect(blocos.map((b) => b.id)).toEqual(['b1', 'b3', 'b2']);
    expect(blocos[1].kind).toBe('STAFF');
  });

  it('remover um bloco o tira da leitura', async () => {
    const licao = licaoDeTeste();

    await servico.salvarBlocosDaSecao({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId: 's1',
      blocos: [md('b2', 'segundo')],
      publicados: [md('b1', 'primeiro'), md('b2', 'segundo')],
      editadaPor: 'Aline',
    });

    const lida = await servico.licaoComEdicoes(licao);
    expect(lida.variants.TRADITIONAL!.sections[0].blocks!.map((b) => b.id)).toEqual(['b2']);
  });

  it('🔴 a ESTRUTURA entra antes do CONTEÚDO', async () => {
    /**
     * Se a correção de um bloco fosse aplicada primeiro, ela pousaria sobre a
     * lista antiga e sumiria quando a lista nova substituísse tudo. Quem
     * editasse um parágrafo e depois acrescentasse um pentagrama perderia o
     * parágrafo — sem nada acusar.
     */
    const licao = licaoDeTeste();

    await servico.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'CORRIGIDO'),
      publicado: md('b1', 'primeiro'),
      editadaPor: 'Aline',
    });

    await servico.salvarBlocosDaSecao({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId: 's1',
      blocos: [md('b1', 'primeiro'), md('b2', 'segundo'), pauta('b9', ['G4'])],
      publicados: [md('b1', 'primeiro'), md('b2', 'segundo')],
      editadaPor: 'Aline',
    });

    const lida = await servico.licaoComEdicoes(licao);
    const blocos = lida.variants.TRADITIONAL!.sections[0].blocks!;

    expect(blocos.length, 'o pentagrama acrescentado sumiu').toBe(3);
    expect(
      (blocos[0] as { markdown: string }).markdown,
      'a correção do parágrafo foi perdida ao acrescentar o pentagrama'
    ).toBe('CORRIGIDO');
  });

  it('identificador repetido é recusado', async () => {
    /** Id repetido faz a correção de um bloco pousar nos dois. */
    await expect(
      servico.salvarBlocosDaSecao({
        lessonId: 'les_teste',
        variante: 'TRADITIONAL',
        secaoId: 's1',
        blocos: [md('b1', 'a'), md('b1', 'b')],
        publicados: [],
        editadaPor: 'Aline',
      })
    ).rejects.toThrow(/mesmo identificador/i);
  });

  it('a lista com bloco inválido é recusada inteira', async () => {
    await expect(
      servico.salvarBlocosDaSecao({
        lessonId: 'les_teste',
        variante: 'TRADITIONAL',
        secaoId: 's1',
        blocos: [md('b1', 'ok'), pauta('b2', ['ERRADO'])],
        publicados: [],
        editadaPor: 'Aline',
      })
    ).rejects.toThrow(/notação científica/i);
  });
});

describe('a correção de bloco continua funcionando, e reverte', () => {
  it('a edição aparece na leitura', async () => {
    const licao = licaoDeTeste();

    await servico.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'texto novo'),
      publicado: md('b1', 'primeiro'),
      editadaPor: 'Aline',
      motivo: 'erro de concordância',
    });

    const lida = await servico.licaoComEdicoes(licao);
    expect((lida.variants.TRADITIONAL!.sections[0].blocks![0] as { markdown: string }).markdown).toBe(
      'texto novo'
    );
  });

  it('🔴 reverter devolve o PUBLICADO, e não a versão anterior', async () => {
    const licao = licaoDeTeste();
    const base = {
      lessonId: licao.id,
      variante: 'TRADITIONAL' as const,
      secaoId: 's1',
      editadaPor: 'Aline',
    };

    await servico.salvarBloco({ ...base, bloco: md('b1', 'v2'), publicado: md('b1', 'primeiro') });
    await servico.salvarBloco({ ...base, bloco: md('b1', 'v3'), publicado: md('b1', 'v2') });

    const id = editId(licao.id, {
      tipo: 'BLOCO',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      blocoId: 'b1',
    });
    await servico.reverter(id);

    const lida = await servico.licaoComEdicoes(licao);
    expect(
      (lida.variants.TRADITIONAL!.sections[0].blocks![0] as { markdown: string }).markdown,
      'reverter parou numa versão intermediária'
    ).toBe('primeiro');
  });

  it('editar duas vezes o mesmo bloco deixa UMA edição', async () => {
    const base = {
      lessonId: 'les_teste',
      variante: 'TRADITIONAL' as const,
      secaoId: 's1',
      editadaPor: 'Aline',
    };

    await servico.salvarBloco({ ...base, bloco: md('b1', 'a'), publicado: md('b1', 'x') });
    await servico.salvarBloco({ ...base, bloco: md('b1', 'b'), publicado: md('b1', 'a') });

    expect((await servico.edicoes()).length).toBe(1);
  });

  it('lição sem edição nenhuma volta idêntica', async () => {
    const licao = licaoDeTeste();
    expect(applyEdits(licao, [])).toBe(licao);
  });
});

describe('🔴 CRIAR lição — a capacidade que estava desligada', () => {
  const nova = (): EditorialLesson => ({
    id: 'les_nova',
    moduleId: 'mod_teste',
    courseId: 'crs_teste',
    order: 3,
    title: 'Lição nova',
    blocks: [md('n1', 'conteúdo')],
    durationMinutes: 15,
    criadaPor: 'Aline',
    criadaEm: AGORA,
  });

  it('grava e volta na listagem', async () => {
    await servico.salvarLicaoCriada(nova());
    const lidas = await servico.licoesCriadas();

    expect(lidas.length).toBe(1);
    expect(lidas[0].title).toBe('Lição nova');
  });

  it('lição sem bloco nenhum é recusada — seria gaveta vazia', async () => {
    await expect(servico.salvarLicaoCriada({ ...nova(), blocks: [] })).rejects.toThrow(
      /incompleta/i
    );
  });

  it('lição sem título é recusada', async () => {
    await expect(servico.salvarLicaoCriada({ ...nova(), title: '  ' })).rejects.toThrow(
      /incompleta/i
    );
  });

  it('lição com bloco musical inválido é recusada', async () => {
    await expect(
      servico.salvarLicaoCriada({ ...nova(), blocks: [pauta('n1', ['ERRADO'])] })
    ).rejects.toThrow(/notação científica/i);
  });

  it('remover tira da listagem', async () => {
    await servico.salvarLicaoCriada(nova());
    await servico.removerLicaoCriada('les_nova');
    expect(await servico.licoesCriadas()).toEqual([]);
  });
});

describe('🔴 o PACOTE — como a edição sai do navegador', () => {
  it('exporta o que está gravado, com resumo medido', async () => {
    await servico.salvarBloco({
      lessonId: 'les_teste',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'novo'),
      publicado: md('b1', 'velho'),
      editadaPor: 'Aline',
    });

    const { json, resumo, nomeDoArquivo } = await servico.exportarPacote('Aline');

    expect(resumo.edicoes).toBe(1);
    expect(resumo.licoesAfetadas).toBe(1);
    expect(nomeDoArquivo, 'o arquivo não carrega a data').toMatch(/\d{4}-\d{2}-\d{2}/);
    /** Indentado: o destino é um commit, e diff numa linha só é ilegível. */
    expect(json.includes('\n  '), 'o JSON saiu numa linha só').toBe(true);
  });

  it('o pacote exportado é lido de volta', async () => {
    await servico.salvarBloco({
      lessonId: 'les_teste',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'novo'),
      publicado: md('b1', 'velho'),
      editadaPor: 'Aline',
    });

    const { json } = await servico.exportarPacote('Aline');
    const leitura = lerPacote(json);

    expect(leitura.ok, leitura.ok ? '' : leitura.motivo).toBe(true);
  });

  it('🔴 cada recusa NOMEIA o que está errado', () => {
    /** "Arquivo inválido" faz tentar de novo com o mesmo arquivo. */
    expect(lerPacote('não é json')).toMatchObject({ ok: false });
    expect((lerPacote('{}') as { motivo: string }).motivo).toMatch(/versão/i);

    const semLista = JSON.stringify({ versao: VERSAO_DO_PACOTE });
    expect((lerPacote(semLista) as { motivo: string }).motivo).toMatch(/edições|lições/i);

    const edicaoTorta = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      edicoes: [{ id: 'x' }],
      licoesCriadas: [],
      artigos: [],
      livretos: [],
    });
    expect((lerPacote(edicaoTorta) as { motivo: string }).motivo).toMatch(/lessonId/);
  });

  it('🔴 pacote de outra versão é RECUSADO, e não adivinhado', () => {
    const futuro = JSON.stringify({ versao: 99, edicoes: [], licoesCriadas: [], artigos: [], livretos: [] });
    const r = lerPacote(futuro) as { ok: false; motivo: string };

    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/99/);
    expect(r.motivo, 'não diz o que fazer').toMatch(/atualize/i);
  });

  it('🔴 importar FUNDE, e a mais nova vence', async () => {
    /**
     * Substituir a camada pelo pacote apagaria o trabalho local de quem
     * importou — inclusive correções mais recentes que as do arquivo.
     */
    const id = editId('les_teste', {
      tipo: 'BLOCO',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      blocoId: 'b1',
    });

    const antiga: EditorialEdit = {
      id,
      lessonId: 'les_teste',
      alvo: { tipo: 'BLOCO', variante: 'TRADITIONAL', secaoId: 's1', blocoId: 'b1' },
      conteudo: md('b1', 'DO PACOTE ANTIGO'),
      anterior: md('b1', 'x'),
      editadaPor: 'Outro',
      editadaEm: '2020-01-01T00:00:00.000Z',
    };

    await servico.salvarBloco({
      lessonId: 'les_teste',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'MEU TRABALHO DE HOJE'),
      publicado: md('b1', 'x'),
      editadaPor: 'Aline',
    });

    const pacote = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      exportadoEm: AGORA,
      edicoes: [antiga],
      licoesCriadas: [],
      artigos: [],
      livretos: [],
    });

    const r = await servico.importarPacote(pacote);

    expect(r.ok).toBe(true);
    expect(r.edicoes!.mantidas, 'a edição antiga substituiu a de hoje').toBe(1);

    const lida = await servico.licaoComEdicoes(licaoDeTeste());
    expect((lida.variants.TRADITIONAL!.sections[0].blocks![0] as { markdown: string }).markdown).toBe(
      'MEU TRABALHO DE HOJE'
    );
  });

  it('a fusão conta o que aconteceu, item a item', () => {
    /** "Importado com sucesso" esconde o caso em que nada entrou. */
    const base: EditorialEdit = {
      id: 'a',
      lessonId: 'l',
      alvo: { tipo: 'TITULO_DA_SECAO', variante: 'TRADITIONAL', secaoId: 's' },
      conteudo: 'x',
      anterior: 'y',
      editadaPor: 'q',
      editadaEm: '2026-01-01T00:00:00.000Z',
    };

    const r = fundirEdicoes(
      [base],
      [
        { ...base, conteudo: 'novo', editadaEm: '2026-06-01T00:00:00.000Z' },
        { ...base, id: 'b' },
      ]
    );

    expect(r.substituidas).toBe(1);
    expect(r.adicionadas).toBe(1);
    expect(r.resultado.length).toBe(2);
  });

  it('importar um pacote inválido não mexe no que está gravado', async () => {
    await servico.salvarBloco({
      lessonId: 'les_teste',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'intacto'),
      publicado: md('b1', 'x'),
      editadaPor: 'Aline',
    });

    const r = await servico.importarPacote('lixo');

    expect(r.ok).toBe(false);
    expect((await servico.edicoes()).length, 'a importação falha apagou a camada').toBe(1);
  });

  it('a contagem de pendentes soma edições e lições criadas', async () => {
    expect(await servico.pendentes()).toBe(0);

    await servico.salvarBloco({
      lessonId: 'les_teste',
      variante: 'TRADITIONAL',
      secaoId: 's1',
      bloco: md('b1', 'a'),
      publicado: md('b1', 'x'),
      editadaPor: 'Aline',
    });

    expect(await servico.pendentes()).toBe(1);
  });
});
