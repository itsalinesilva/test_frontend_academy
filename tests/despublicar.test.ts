// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { definirCamadaPublicada } from '../src/repositories/camada-publicada';
import { EditorialService } from '../src/services/application/editorial.service';
import { PersistentEditorialRepository } from '../src/repositories/editorial.repository';
import { PersistentAcademyRepository } from '../src/repositories/academy.repository';
import { PersistentBookletRepository } from '../src/repositories/booklet.repository';
import { SEED_LESSONS } from '../src/data/seed-academy-content';
import { LIVRETOS_PADRAO } from '../src/data/seed-booklets';
import { LessonBlock } from '../src/domain/academy';
import { EditorialLesson } from '../src/domain/editorial-edit';
import { lerPacote, VERSAO_DO_PACOTE } from '../src/domain/pacote-editorial';

/**
 * EE-21f — DESPUBLICAR.
 *
 * O pacote só sabia acrescentar: reverter uma correção já publicada, apagar
 * um artigo ou excluir um livreto funcionava no navegador de quem fez, e o
 * item VOLTAVA na leitura seguinte, porque a camada publicada ainda o trazia.
 */

function alvo() {
  for (const l of SEED_LESSONS) {
    for (const s of l.variants.TRADITIONAL?.sections ?? []) {
      const b = (s.blocks ?? []).find((x: LessonBlock) => x.kind === 'MARKDOWN');
      if (b) return { licao: l, secaoId: s.id, bloco: b as Extract<LessonBlock, { kind: 'MARKDOWN' }> };
    }
  }
  throw new Error('sem bloco markdown no seed');
}

const novoServico = () => new EditorialService(new PersistentEditorialRepository());
const blocoLido = async (lessonId: string, secaoId: string, blocoId: string) => {
  const l = await new PersistentAcademyRepository().findLessonById(lessonId);
  return l!.variants.TRADITIONAL!.sections.find((s) => s.id === secaoId)!.blocks!.find((b) => b.id === blocoId) as {
    markdown: string;
  };
};

/** Publica o que está neste navegador e passa para "outro navegador" com o pacote. */
async function publicarEAbrirNoutro(servico: EditorialService) {
  const { json } = await servico.exportarPacote('Aline');
  localStorage.clear();
  definirCamadaPublicada(json);
}

beforeEach(() => {
  localStorage.clear();
  definirCamadaPublicada(null);
});
afterEach(() => definirCamadaPublicada(null));

describe('🔴 reverter o que JÁ ESTAVA publicado', () => {
  it('a correção publicada, revertida, some — aqui e no navegador de quem recebe o pacote novo', async () => {
    const { licao, secaoId, bloco } = alvo();
    const editor = novoServico();
    await editor.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId,
      bloco: { ...bloco, markdown: 'CORREÇÃO QUE SERÁ DESFEITA' },
      publicado: bloco,
      editadaPor: 'Aline',
    });
    await publicarEAbrirNoutro(editor);
    expect((await blocoLido(licao.id, secaoId, bloco.id)).markdown).toBe('CORREÇÃO QUE SERÁ DESFEITA');

    /** Quem publicou decide desfazer. */
    const [edicao] = await novoServico().edicoes();
    await novoServico().reverter(edicao.id);
    expect((await blocoLido(licao.id, secaoId, bloco.id)).markdown, 'a correção voltou').toBe(bloco.markdown);
    expect(await novoServico().pendentes(), 'a remoção precisa virar pendência').toBe(1);

    /** E o pacote novo leva a remoção. */
    const { resumo } = await novoServico().exportarPacote('Aline');
    expect(resumo.removidos).toBe(1);
    await publicarEAbrirNoutro(novoServico());
    expect((await blocoLido(licao.id, secaoId, bloco.id)).markdown).toBe(bloco.markdown);
  });

  it('editar de novo DEPOIS da remoção traz o item de volta — a mais nova vence', async () => {
    const { licao, secaoId, bloco } = alvo();
    const salvar = (markdown: string) =>
      novoServico().salvarBloco({
        lessonId: licao.id,
        variante: 'TRADITIONAL',
        secaoId,
        bloco: { ...bloco, markdown },
        publicado: bloco,
        editadaPor: 'Aline',
      });

    await salvar('Primeira.');
    await publicarEAbrirNoutro(novoServico());
    const [e] = await novoServico().edicoes();
    await novoServico().reverter(e.id);
    await new Promise((r) => setTimeout(r, 5));
    await salvar('Voltou, diferente.');

    expect((await blocoLido(licao.id, secaoId, bloco.id)).markdown).toBe('Voltou, diferente.');
    /** A remoção local foi esquecida: não conta como pendência à toa. */
    const { resumo } = await novoServico().exportarPacote();
    expect(resumo.removidos).toBe(0);
  });
});

describe('cada tipo de item publicado pode sair', () => {
  it('lição criada', async () => {
    const base = SEED_LESSONS[0];
    const criada: EditorialLesson = {
      id: 'les_criada_despublicar',
      moduleId: base.moduleId,
      courseId: base.courseId,
      order: 99,
      title: 'Lição a despublicar',
      blocks: [{ kind: 'MARKDOWN', id: 'b1', markdown: 'Texto.' }],
      durationMinutes: 10,
      criadaPor: 'Aline',
      criadaEm: '2026-09-22T12:00:00.000Z',
    };
    await novoServico().salvarLicaoCriada(criada);
    await publicarEAbrirNoutro(novoServico());
    expect((await new PersistentAcademyRepository().listLessonsByModule(base.moduleId)).map((l) => l.id)).toContain(
      criada.id
    );

    await novoServico().removerLicaoCriada(criada.id);
    await publicarEAbrirNoutro(novoServico());
    expect(
      (await new PersistentAcademyRepository().listLessonsByModule(base.moduleId)).map((l) => l.id)
    ).not.toContain(criada.id);
  });

  it('seção de livro: volta ao texto de partida', async () => {
    const livro = {
      id: 'livro_x',
      cursoId: 'c',
      tipo: 'LEITURA' as const,
      titulo: 't',
      subtitulo: 's',
      autoria: 'a',
      instituicao: 'i',
      edicao: 'e',
      ano: 2026,
      geradoEm: '',
      secoes: [{ id: 'prefacio', papel: 'PREFACIO' as const, origem: 'EDITAVEL' as const, titulo: 'Prefácio', conteudo: 'Partida.', ordem: 0 }],
    };
    await novoServico().salvarSecaoDeLivro({ livro, secaoId: 'prefacio', conteudo: 'Escrito.', editadaPor: 'Aline' });
    await publicarEAbrirNoutro(novoServico());
    await novoServico().reverterSecaoDeLivro('livro_x', 'prefacio');
    await publicarEAbrirNoutro(novoServico());

    const [lido] = await novoServico().livrosComEdicoes([livro]);
    expect(lido.secoes[0].conteudo).toBe('Partida.');
  });

  it('livreto publicado, excluído, não volta na leitura seguinte', async () => {
    const original = LIVRETOS_PADRAO[0];
    const corrigido = { ...original, titulo: 'LIVRETO PUBLICADO', updatedAt: '2026-09-22T12:00:00.000Z' };
    definirCamadaPublicada(
      JSON.stringify({
        versao: VERSAO_DO_PACOTE,
        exportadoEm: '2026-09-22T12:00:00.000Z',
        edicoes: [],
        licoesCriadas: [],
        artigos: [],
        livretos: [corrigido],
        secoesDeLivro: [],
        removidos: [],
      })
    );
    const repo = new PersistentBookletRepository();
    expect((await repo.buscarLivretoDoCurso(original.cursoId))!.titulo).toBe('LIVRETO PUBLICADO');

    await repo.excluirLivreto(original.id);
    expect(await new PersistentBookletRepository().buscarLivreto(original.id)).toBeNull();
    expect((await novoServico().exportarPacote()).resumo.removidos).toBe(1);
  });
});

describe('o pacote', () => {
  it('versão 4 é recusada: ela não sabe dizer o que foi removido', () => {
    const v4 = JSON.stringify({ versao: 4, edicoes: [], licoesCriadas: [], artigos: [], livretos: [], secoesDeLivro: [] });
    expect((lerPacote(v4) as { motivo: string }).motivo).toMatch(/versão 4/);
  });

  it('remoção sem tipo, ou sem data, é recusada e diz isso', () => {
    const base = { versao: VERSAO_DO_PACOTE, edicoes: [], licoesCriadas: [], artigos: [], livretos: [], secoesDeLivro: [] };
    expect((lerPacote(JSON.stringify({ ...base, removidos: [{ id: 'x', removidoEm: 'y' }] })) as { motivo: string }).motivo).toMatch(
      /tipo/
    );
    expect(
      (lerPacote(JSON.stringify({ ...base, removidos: [{ tipo: 'ARTIGO', id: 'x' }] })) as { motivo: string }).motivo
    ).toMatch(/data/);
  });

  it('o arquivo publicado no repositório está na versão corrente', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('node:fs') as typeof import('node:fs');
    const r = lerPacote(fs.readFileSync('public/editorial/pacote.json', 'utf8'));
    expect(r.ok, (r as { motivo?: string }).motivo).toBe(true);
  });
});
