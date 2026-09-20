import { describe, it, expect } from 'vitest';
import { SEED_ARTICLES } from '../src/data/seed-articles';
import {
  citacoesSemMotivo,
  niveisForaDeOrdem,
  obrasInexistentes,
} from '../src/domain/article';
import { obrasDoRepertorio } from '../src/data/seed-acervo';

/**
 * OS ARTIGOS — curadoria autoral, separada do catálogo.
 *
 * As fontes trazem recortes de opinião editorial: listas de recomendados, de
 * entrada no repertório. São juízos de terceiro, e não entram em campo de
 * catalogação — se virassem filtro, a plataforma estaria assinando embaixo de
 * uma opinião que não é dela.
 *
 * O artigo é onde essa curadoria vive, com o estatuto claro: texto nosso, que
 * usa as fontes como insumo e conclui o que conclui.
 *
 * O que estes casos protegem é o artigo **não prometer o que não existe** —
 * percurso que aponta para obra fora do acervo é caminho que o aluno descobre
 * quebrado no meio.
 */

const EM_2026 = new Date('2026-06-15T12:00:00.000Z');
const IDS = new Set(obrasDoRepertorio(EM_2026).map((o) => o.id));

describe('todo artigo aponta para obra que existe', () => {
  it('NENHUMA CITAÇÃO APONTA PARA FORA DO ACERVO', () => {
    for (const a of SEED_ARTICLES) {
      expect(obrasInexistentes(a, IDS), `"${a.titulo}" cita obra inexistente`).toEqual([]);
    }
  });

  it('a verificação não é vazia — há obras citadas', () => {
    /**
     * Sem esta linha, um artigo sem citação nenhuma passaria no caso acima
     * medindo nada. Foi assim que um teste da ponte nasceu vazio nesta suíte.
     */
    const total = SEED_ARTICLES.reduce((n, a) => n + a.obras.length, 0);
    expect(total).toBeGreaterThan(5);
  });
});

describe('toda obra citada explica por quê', () => {
  it('nenhuma citação sem motivo', () => {
    /**
     * Lista de obras sem justificativa é lista de opiniões escondidas: quem lê
     * não sabe se a peça está ali por ser fácil, por ser representativa, ou
     * porque alguém gostou dela.
     */
    for (const a of SEED_ARTICLES) {
      expect(citacoesSemMotivo(a), `"${a.titulo}" tem citação sem motivo`).toEqual([]);
    }
  });
});

describe('o percurso nivelado está em ordem', () => {
  it('os níveis não pulam nem repetem fora de ordem', () => {
    for (const a of SEED_ARTICLES) {
      expect(niveisForaDeOrdem(a), `"${a.titulo}" tem níveis fora de ordem`).toBe(false);
    }
  });

  it('o percurso de violino tem os três níveis', () => {
    const p = SEED_ARTICLES.find((a) => a.id === 'art_percurso_violino_nivelado')!;
    expect([...new Set(p.obras.map((o) => o.nivel))].sort()).toEqual([1, 2, 3]);
  });
});

describe('o artigo é autoral, e não cita fonte', () => {
  it('NENHUM TEXTO NOMEIA UMA FONTE EXTERNA', () => {
    /**
     * A origem dos dados é registro de engenharia e fica em
     * `85_SOURCES_AND_COVERAGE.md`. O texto que o aluno lê é do Conservatório.
     */
    const proibidos = ['Open Opus', 'Wikidata', 'IMSLP', 'MusicBrainz', 'Mutopia', 'Suzuki'];

    for (const a of SEED_ARTICLES) {
      const texto = [a.titulo, a.subtitulo, a.resumo, ...a.secoes.map((s) => s.markdown)].join(' ');
      for (const p of proibidos) {
        expect(texto.includes(p), `"${a.titulo}" cita "${p}"`).toBe(false);
      }
    }
  });

  it('a autoria e a instituição vêm preenchidas', () => {
    for (const a of SEED_ARTICLES) {
      expect(a.autoria.length).toBeGreaterThan(3);
      expect(a.instituicao).toContain('Muscicapa');
    }
  });

  it('toda seção tem texto de verdade, e não rótulo', () => {
    for (const a of SEED_ARTICLES) {
      for (const s of a.secoes) {
        expect(s.markdown.length, `"${a.titulo}" § "${s.titulo}"`).toBeGreaterThan(200);
      }
    }
  });

  it('o resumo diz o que o artigo conclui', () => {
    // Resumo curto vira rótulo, e rótulo não ajuda quem decide se vale abrir.
    for (const a of SEED_ARTICLES) {
      expect(a.resumo.length, a.titulo).toBeGreaterThan(120);
    }
  });
});
