// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  carregarCamadaPublicada,
  definirCamadaPublicada,
  estadoDaCamada,
} from '../src/repositories/camada-publicada';
import { EditorialService } from '../src/services/application/editorial.service';
import { PersistentEditorialRepository } from '../src/repositories/editorial.repository';
import { PersistentAcademyRepository } from '../src/repositories/academy.repository';
import { PersistentBookletRepository } from '../src/repositories/booklet.repository';
import { SEED_LESSONS } from '../src/data/seed-academy-content';
import { LIVRETOS_PADRAO } from '../src/data/seed-booklets';
import { LessonBlock } from '../src/domain/academy';
import { EditorialLesson } from '../src/domain/editorial-edit';

/**
 * EE-21 — O PACOTE COMMITADO CHEGA AO ALUNO.
 *
 * O desenho era "exportar → commit → aluno", e a última seta não existia:
 * nenhum código lia o arquivo commitado. Estes casos percorrem a seta inteira
 * — exportar num navegador, publicar, e ler noutro que nunca editou nada.
 */

const vazio = () =>
  JSON.stringify({
    versao: 4,
    exportadoEm: '2026-09-22T00:00:00.000Z',
    edicoes: [],
    licoesCriadas: [],
    artigos: [],
    livretos: [],
    secoesDeLivro: [],
  });

/** Uma lição do seed com um bloco markdown, para corrigir. */
function alvo() {
  for (const l of SEED_LESSONS) {
    const v = l.variants.TRADITIONAL;
    for (const s of v?.sections ?? []) {
      const b = (s.blocks ?? []).find((x: LessonBlock) => x.kind === 'MARKDOWN');
      if (b) return { licao: l, secaoId: s.id, bloco: b as Extract<LessonBlock, { kind: 'MARKDOWN' }> };
    }
  }
  throw new Error('nenhuma lição do seed tem bloco markdown');
}

beforeEach(() => {
  localStorage.clear();
  definirCamadaPublicada(null);
});

afterEach(() => {
  definirCamadaPublicada(null);
});

describe('ler o arquivo publicado', () => {
  it('arquivo ausente é AUSENTE, e não erro — inclusive quando o SPA devolve HTML', async () => {
    const html = (async () => new Response('<!doctype html><html></html>', { status: 200 })) as typeof fetch;
    expect((await carregarCamadaPublicada(html)).tipo).toBe('ausente');

    const naoAchou = (async () => new Response('', { status: 404 })) as typeof fetch;
    expect((await carregarCamadaPublicada(naoAchou)).tipo).toBe('ausente');
  });

  it('🔴 pacote commitado que não se lê é RECUSADO, com o motivo — não ignorado', async () => {
    const antigo = (async () =>
      new Response(JSON.stringify({ versao: 3, edicoes: [], licoesCriadas: [], artigos: [], livretos: [] }))) as typeof fetch;
    const r = await carregarCamadaPublicada(antigo);
    expect(r.tipo).toBe('recusada');
    expect((r as { motivo: string }).motivo).toMatch(/versão 3/);
  });

  it('rede que não responde não segura a plataforma: abre como ausente', async () => {
    const pendurado = ((_: unknown, init?: RequestInit) =>
      new Promise((_r, rej) => init?.signal?.addEventListener('abort', () => rej(new Error('abort'))))) as typeof fetch;
    expect((await carregarCamadaPublicada(pendurado, 20)).tipo).toBe('ausente');
  });

  it('pacote válido é carregado', async () => {
    const ok = (async () => new Response(vazio())) as typeof fetch;
    expect((await carregarCamadaPublicada(ok)).tipo).toBe('carregada');
    expect(estadoDaCamada().tipo).toBe('carregada');
  });
});

describe('🔴 a seta inteira: editar, exportar, publicar, e o aluno ler', () => {
  it('a correção de um bloco chega à lição que o ALUNO lê, noutro navegador', async () => {
    const { licao, secaoId, bloco } = alvo();
    const editor = new EditorialService(new PersistentEditorialRepository());

    await editor.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId,
      bloco: { ...bloco, markdown: 'TEXTO CORRIGIDO E PUBLICADO' },
      publicado: bloco,
      editadaPor: 'Aline',
    });
    const { json } = await editor.exportarPacote('Aline');

    /** Outro navegador: nada local. Só o arquivo commitado. */
    localStorage.clear();
    definirCamadaPublicada(json);

    const lida = await new PersistentAcademyRepository().findLessonById(licao.id);
    const blocos = lida!.variants.TRADITIONAL!.sections.find((s) => s.id === secaoId)!.blocks!;
    expect(blocos.find((b) => b.id === bloco.id)).toMatchObject({ markdown: 'TEXTO CORRIGIDO E PUBLICADO' });
  });

  it('a lição CRIADA pela curadoria aparece no módulo do aluno', async () => {
    const base = SEED_LESSONS[0];
    const criada: EditorialLesson = {
      id: 'les_criada_teste',
      moduleId: base.moduleId,
      courseId: base.courseId,
      order: 99,
      title: 'Lição escrita pela curadoria',
      blocks: [{ kind: 'MARKDOWN', id: 'b1', markdown: 'Conteúdo novo.' }],
      durationMinutes: 10,
      criadaPor: 'Aline',
      criadaEm: '2026-09-22T12:00:00.000Z',
    };
    const editor = new EditorialService(new PersistentEditorialRepository());
    await editor.salvarLicaoCriada(criada);
    const { json } = await editor.exportarPacote('Aline');

    localStorage.clear();
    definirCamadaPublicada(json);

    const doModulo = await new PersistentAcademyRepository().listLessonsByModule(base.moduleId);
    expect(doModulo.map((l) => l.id)).toContain('les_criada_teste');
  });

  it('o livreto corrigido e publicado é o que o aluno recebe', async () => {
    const original = LIVRETOS_PADRAO[0];
    const corrigido = { ...original, titulo: 'LIVRETO CORRIGIDO', updatedAt: '2026-09-22T12:00:00.000Z' };
    definirCamadaPublicada(JSON.stringify({ ...JSON.parse(vazio()), livretos: [corrigido] }));

    const lido = await new PersistentBookletRepository().buscarLivretoDoCurso(original.cursoId);
    expect(lido!.titulo).toBe('LIVRETO CORRIGIDO');
  });
});

describe('publicado e local convivem', () => {
  it('🔴 o pacote exportado é CUMULATIVO — leva o publicado junto com o novo', async () => {
    /**
     * Commitar um pacote só com as novidades, por cima do anterior, apagaria
     * as correções que já tinham chegado ao aluno.
     */
    const { licao, secaoId, bloco } = alvo();
    const primeiro = new EditorialService(new PersistentEditorialRepository());
    await primeiro.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId,
      bloco: { ...bloco, markdown: 'JÁ PUBLICADO' },
      publicado: bloco,
      editadaPor: 'Aline',
    });
    definirCamadaPublicada((await primeiro.exportarPacote()).json);
    localStorage.clear();

    const segundo = new EditorialService(new PersistentEditorialRepository());
    await segundo.salvarSecaoDeLivro({
      livro: {
        id: 'livro_x',
        cursoId: 'c',
        tipo: 'LEITURA',
        titulo: 't',
        subtitulo: 's',
        autoria: 'a',
        instituicao: 'i',
        edicao: 'e',
        ano: 2026,
        geradoEm: '',
        secoes: [{ id: 'prefacio', papel: 'PREFACIO', origem: 'EDITAVEL', titulo: 'Prefácio', conteudo: 'x', ordem: 0 }],
      },
      secaoId: 'prefacio',
      conteudo: 'Novo prefácio.',
      editadaPor: 'Aline',
    });

    const { resumo } = await segundo.exportarPacote();
    expect(resumo.edicoes, 'a correção já publicada ficou fora do pacote novo').toBe(1);
    expect(resumo.secoesDeLivro).toBe(1);
  });

  it('🔴 depois do commit, o aviso de pendência APAGA — o que chegou não é pendente', async () => {
    const { licao, secaoId, bloco } = alvo();
    const editor = new EditorialService(new PersistentEditorialRepository());
    await editor.salvarBloco({
      lessonId: licao.id,
      variante: 'TRADITIONAL',
      secaoId,
      bloco: { ...bloco, markdown: 'Corrigido.' },
      publicado: bloco,
      editadaPor: 'Aline',
    });
    expect(await editor.pendentes()).toBe(1);

    /** O mesmo navegador, depois do commit: o local continua lá, igual ao publicado. */
    definirCamadaPublicada((await editor.exportarPacote()).json);
    expect(await editor.pendentes()).toBe(0);
  });

  it('editar de novo o que já foi publicado volta a ser pendente, e a nova vence na leitura', async () => {
    const { licao, secaoId, bloco } = alvo();
    const editor = new EditorialService(new PersistentEditorialRepository());
    const salvar = (markdown: string) =>
      editor.salvarBloco({
        lessonId: licao.id,
        variante: 'TRADITIONAL',
        secaoId,
        bloco: { ...bloco, markdown },
        publicado: bloco,
        editadaPor: 'Aline',
      });

    await salvar('Versão publicada.');
    definirCamadaPublicada((await editor.exportarPacote()).json);
    await new Promise((r) => setTimeout(r, 5));
    await salvar('Versão de hoje.');

    expect(await editor.pendentes()).toBe(1);
    const lida = await new PersistentAcademyRepository().findLessonById(licao.id);
    const b = lida!.variants.TRADITIONAL!.sections.find((s) => s.id === secaoId)!.blocks!.find((x) => x.id === bloco.id);
    expect(b).toMatchObject({ markdown: 'Versão de hoje.' });
  });

  it('corrigir de novo algo publicado preserva o ORIGINAL de fábrica para reverter', async () => {
    const { licao, secaoId, bloco } = alvo();
    const editor = new EditorialService(new PersistentEditorialRepository());
    const salvar = (markdown: string, publicado: LessonBlock) =>
      editor.salvarBloco({
        lessonId: licao.id,
        variante: 'TRADITIONAL',
        secaoId,
        bloco: { ...bloco, markdown },
        publicado,
        editadaPor: 'Aline',
      });

    await salvar('Primeira.', bloco);
    definirCamadaPublicada((await editor.exportarPacote()).json);
    localStorage.clear();

    /** A tela passa como "publicado" o que está lendo — que já é a primeira correção. */
    await salvar('Segunda.', { ...bloco, markdown: 'Primeira.' });
    const [edicao] = await editor.edicoes();
    expect(edicao.anterior).toEqual(bloco);
  });
});
