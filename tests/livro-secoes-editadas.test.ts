// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  LivroDoConservatorio,
  SecaoEditadaDoLivro,
  aplicarSecoesEditadas,
  idDaSecaoEditada,
  problemasDaSecao,
} from '../src/domain/book';
import { EditorialService } from '../src/services/application/editorial.service';
import { PersistentEditorialRepository } from '../src/repositories/editorial.repository';
import { lerPacote, VERSAO_DO_PACOTE } from '../src/domain/pacote-editorial';

/**
 * EE-19 — AS SEÇÕES ESCRITAS DO LIVRO.
 *
 * O modelo já previa que regenerar preservasse o prefácio, e o livro é
 * regenerado a cada leitura. Sem um lugar onde o texto ficasse, a previsão
 * não tinha o que preservar: a tela dizia "editável" sobre uma seção que
 * esquecia o que fosse escrito nela.
 */

const livro = (): LivroDoConservatorio => ({
  id: 'livro_teoria_leitura',
  cursoId: 'c1',
  tipo: 'LEITURA',
  titulo: 'Teoria',
  subtitulo: 'Fundamentos',
  autoria: 'Aline Alves Silva',
  instituicao: 'Conservatório Muscicapa',
  edicao: 'Primeira edição',
  ano: 2026,
  geradoEm: '2026-09-22T00:00:00.000Z',
  secoes: [
    { id: 'capa', papel: 'CAPA', origem: 'EDITAVEL', titulo: 'Capa', conteudo: '# Teoria', ordem: 0 },
    { id: 'prefacio', papel: 'PREFACIO', origem: 'EDITAVEL', titulo: 'Prefácio', conteudo: 'Texto de partida.', ordem: 1 },
    { id: 'sumario', papel: 'SUMARIO', origem: 'GERADA', titulo: 'Sumário', conteudo: '1. Intervalos', ordem: 2 },
    { id: 'cap-1', papel: 'CAPITULO', origem: 'GERADA', titulo: 'Intervalos', conteudo: '# Capítulo 1', ordem: 3 },
  ],
});

const edicao = (secaoId: string, conteudo: string, editadaEm = '2026-09-22T10:00:00.000Z'): SecaoEditadaDoLivro => ({
  id: idDaSecaoEditada('livro_teoria_leitura', secaoId),
  livroId: 'livro_teoria_leitura',
  secaoId,
  conteudo,
  editadaPor: 'Aline',
  editadaEm,
});

const secao = (id: string) => livro().secoes.find((s) => s.id === id);

describe('a leitura aplica o que foi escrito', () => {
  it('o prefácio escrito substitui o texto de partida', () => {
    const lido = aplicarSecoesEditadas(livro(), [edicao('prefacio', 'Meu prefácio.')]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('Meu prefácio.');
  });

  it('título, papel e ordem continuam os do livro — só o texto viaja', () => {
    const lido = aplicarSecoesEditadas(livro(), [edicao('prefacio', 'Meu prefácio.')]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')).toMatchObject({
      titulo: 'Prefácio',
      papel: 'PREFACIO',
      ordem: 1,
    });
  });

  it('🔴 edição que aponta para seção GERADA é ignorada — o livro não diverge do curso', () => {
    const lido = aplicarSecoesEditadas(livro(), [edicao('cap-1', 'Capítulo reescrito à mão')]);
    expect(lido.secoes.find((s) => s.id === 'cap-1')!.conteudo).toBe('# Capítulo 1');
  });

  it('edição de outro livro não toca este', () => {
    const outra = { ...edicao('prefacio', 'De outro livro'), livroId: 'livro_outro', id: 'livro_outro::prefacio' };
    const lido = aplicarSecoesEditadas(livro(), [outra]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('Texto de partida.');
  });
});

describe('o que impede gravar', () => {
  it('seção gerada é recusada, e a recusa diz onde corrigir', () => {
    expect(problemasDaSecao(secao('sumario'), 'x')[0]).toMatch(/corrija a lição/);
  });

  it('seção vazia é recusada — inclusive a que só tem comentário', () => {
    expect(problemasDaSecao(secao('prefacio'), '   ')).toHaveLength(1);
    expect(problemasDaSecao(secao('prefacio'), '<!-- EDITÁVEL -->\n\n')).toHaveLength(1);
  });

  it('seção inexistente é recusada', () => {
    expect(problemasDaSecao(undefined, 'x')[0]).toMatch(/não existe/);
  });

  it('seção editável com texto passa', () => {
    expect(problemasDaSecao(secao('prefacio'), 'Um prefácio.')).toEqual([]);
  });
});

describe('o serviço grava, relê e reverte', () => {
  let servico: EditorialService;

  beforeEach(() => {
    localStorage.clear();
    servico = new EditorialService(new PersistentEditorialRepository());
  });

  it('🔴 o que se grava volta na leitura seguinte — era exatamente o que se perdia', async () => {
    await servico.salvarSecaoDeLivro({
      livro: livro(),
      secaoId: 'prefacio',
      conteudo: 'Escrito hoje.',
      editadaPor: 'Aline',
    });

    /** Um serviço NOVO, como numa leitura nova: nada em memória. */
    const outro = new EditorialService(new PersistentEditorialRepository());
    const [lido] = await outro.livrosComEdicoes([livro()]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('Escrito hoje.');
  });

  it('gravar duas vezes deixa UMA edição', async () => {
    const base = { livro: livro(), secaoId: 'prefacio', editadaPor: 'Aline' };
    await servico.salvarSecaoDeLivro({ ...base, conteudo: 'Primeira.' });
    await servico.salvarSecaoDeLivro({ ...base, conteudo: 'Segunda.' });

    const todas = await servico.secoesDeLivro();
    expect(todas).toHaveLength(1);
    expect(todas[0].conteudo).toBe('Segunda.');
  });

  it('recusa capítulo, recusa vazio, recusa sem autoria', async () => {
    await expect(
      servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'cap-1', conteudo: 'x', editadaPor: 'Aline' })
    ).rejects.toThrow(/nasce do curso/);
    await expect(
      servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'prefacio', conteudo: '  ', editadaPor: 'Aline' })
    ).rejects.toThrow(/vazia/);
    await expect(
      servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'prefacio', conteudo: 'x', editadaPor: ' ' })
    ).rejects.toThrow(/autoria/);
    expect(await servico.secoesDeLivro()).toEqual([]);
  });

  it('reverter devolve o texto de partida', async () => {
    await servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'prefacio', conteudo: 'Escrito.', editadaPor: 'Aline' });
    await servico.reverterSecaoDeLivro('livro_teoria_leitura', 'prefacio');

    const [lido] = await servico.livrosComEdicoes([livro()]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('Texto de partida.');
  });

  it('a seção escrita conta como pendente — ela ainda não chegou a ninguém', async () => {
    expect(await servico.pendentes()).toBe(0);
    await servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'capa', conteudo: '# Nova capa', editadaPor: 'Aline' });
    expect(await servico.pendentes()).toBe(1);
  });
});

describe('o pacote leva as seções escritas', () => {
  let servico: EditorialService;

  beforeEach(() => {
    localStorage.clear();
    servico = new EditorialService(new PersistentEditorialRepository());
  });

  it('🔴 exportar e importar noutra máquina traz o prefácio junto', async () => {
    await servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'prefacio', conteudo: 'Viajou.', editadaPor: 'Aline' });
    const { json, resumo } = await servico.exportarPacote('Aline');
    expect(resumo.secoesDeLivro).toBe(1);

    localStorage.clear();
    const outraMaquina = new EditorialService(new PersistentEditorialRepository());
    const r = await outraMaquina.importarPacote(json);

    expect(r.ok).toBe(true);
    expect(r.secoesDeLivro!.adicionadas).toBe(1);
    const [lido] = await outraMaquina.livrosComEdicoes([livro()]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('Viajou.');
  });

  it('pacote antigo não apaga o prefácio de hoje', async () => {
    await servico.salvarSecaoDeLivro({ livro: livro(), secaoId: 'prefacio', conteudo: 'De hoje.', editadaPor: 'Aline' });

    const pacote = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      exportadoEm: '2020-01-01T00:00:00.000Z',
      edicoes: [],
      licoesCriadas: [],
      artigos: [],
      livretos: [],
      secoesDeLivro: [edicao('prefacio', 'De 2020.', '2020-01-01T00:00:00.000Z')],
      removidos: [],
    });

    const r = await servico.importarPacote(pacote);
    expect(r.secoesDeLivro!.mantidas).toBe(1);
    const [lido] = await servico.livrosComEdicoes([livro()]);
    expect(lido.secoes.find((s) => s.id === 'prefacio')!.conteudo).toBe('De hoje.');
  });

  it('pacote da versão 3 é recusado: ele não sabe dizer se havia seções escritas', () => {
    const v3 = JSON.stringify({ versao: 3, edicoes: [], licoesCriadas: [], artigos: [], livretos: [] });
    const r = lerPacote(v3) as { ok: false; motivo: string };
    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/versão 3/);
  });

  it('pacote sem a lista de seções é recusado, e diz isso', () => {
    const sem = JSON.stringify({ versao: VERSAO_DO_PACOTE, edicoes: [], licoesCriadas: [], artigos: [], livretos: [] });
    expect((lerPacote(sem) as { motivo: string }).motivo).toMatch(/seções dos livros/);
  });

  it('seção sem livroId no pacote é recusada', () => {
    const torta = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      edicoes: [],
      licoesCriadas: [],
      artigos: [],
      livretos: [],
      secoesDeLivro: [{ id: 'x', secaoId: 'prefacio', conteudo: 'x', editadaEm: '2026-01-01' }],
      removidos: [],
    });
    expect((lerPacote(torta) as { motivo: string }).motivo).toMatch(/livroId/);
  });
});
