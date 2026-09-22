import { describe, it, expect } from 'vitest';
import { SEED_ARTICLES } from '../src/data/seed-articles';
import {
  citacoesSemMotivo,
  niveisForaDeOrdem,
  obrasInexistentes,
} from '../src/domain/article';
import { todasAsObras } from '../src/data/acervo-unificado';
import { FONTES_PROIBIDAS } from '../scripts/verify-no-citations.mjs';

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

describe('todo artigo aponta para obra que existe', () => {
  it('NENHUMA CITAÇÃO APONTA PARA FORA DO ACERVO', async () => {
    /**
     * 🔴 O UNIVERSO DA CONFERÊNCIA ERA MENOR QUE O ACERVO.
     *
     * Aqui se conferia contra `obrasDoRepertorio` — as **17** obras próprias,
     * as que a plataforma reproduz. Enquanto os artigos só citavam essas, o
     * caso passava; passou a acusar no primeiro artigo que cita o catálogo,
     * que tem 31.952.
     *
     * O que "fora do acervo" quer dizer é fora do CATÁLOGO, e não fora do
     * repertório tocável. Um artigo que percorre obra catalogada e não
     * reproduzível continua sendo um percurso válido: a ficha dela diz onde a
     * partitura está.
     */
    const IDS = new Set((await todasAsObras(EM_2026)).map((o) => o.id));

    /** Não-vacuidade: conferir contra um conjunto vazio aprovaria qualquer coisa. */
    expect(IDS.size, 'o acervo veio vazio — o caso passaria à toa').toBeGreaterThan(1000);

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

  it('o percurso de violino tem os cinco níveis, sem buraco', () => {
    /**
     * Eram três, e os três tocavam aqui dentro. Os níveis 4 e 5 entraram como
     * **destino declarado**: peças cuja partitura o acervo localizou e que a
     * plataforma não reproduz.
     *
     * A mudança é do percurso, e não do teste — o que se cobra continua sendo
     * que os níveis formem uma sequência **sem buraco**. Um percurso que pula
     * do 3 para o 5 manda quem estuda atravessar um degrau que ninguém
     * escreveu.
     */
    const p = SEED_ARTICLES.find((a) => a.id === 'art_percurso_violino_nivelado')!;
    const niveis = [...new Set(p.obras.map((o) => o.nivel))].sort((a, b) => (a ?? 0) - (b ?? 0));

    expect(niveis).toEqual([1, 2, 3, 4, 5]);

    /** Todo nível com pelo menos duas peças: um nível de peça única é um exemplo, não um degrau. */
    for (const n of niveis) {
      expect(
        p.obras.filter((o) => o.nivel === n).length,
        `o nível ${n} tem uma peça só`
      ).toBeGreaterThan(1);
    }
  });
});

describe('o artigo é autoral, e a fonte da curadoria é nomeada', () => {
  it('🔴 NENHUM TEXTO CITA A BIBLIOGRAFIA DE ESTUDO', () => {
    /**
     * ESTE CASO MANTINHA UMA SEGUNDA LISTA, E ELA DIVERGIU.
     *
     * Havia aqui um vetor escrito à mão — Open Opus, Wikidata, IMSLP,
     * MusicBrainz, Mutopia, Suzuki — proibindo **nomear fonte nenhuma**. Duas
     * coisas estavam misturadas nele, e só uma é regra:
     *
     * O que não pode entrar é a **bibliografia de estudo**: os livros de
     * terceiros que a gente lê para escrever conteúdo. Citá-los pendura a
     * plataforma num texto que ela não pode reproduzir. Essa lista vive em
     * `verify-no-citations.mjs`, roda no build, e é a que vale.
     *
     * O que **deve** entrar é o nome de quem fez a curadoria que o artigo usa.
     * Um artigo que diz "os oito mais buscados" sem dizer **onde** assina um
     * juízo que ninguém aqui apurou — e foi exatamente esse o erro que esta
     * suíte passou uma sessão inteira corrigindo. Atribuir é o conserto, e
     * proibir o nome tornava o conserto impossível.
     *
     * Agora há uma lista só, e ela é a do verificador.
     */
    for (const a of SEED_ARTICLES) {
      const texto = [a.titulo, a.subtitulo, a.resumo, ...a.secoes.map((s) => s.markdown)].join(' ');
      for (const p of FONTES_PROIBIDAS) {
        expect(texto.includes(p), `"${a.titulo}" cita a bibliografia de estudo: "${p}"`).toBe(false);
      }
    }
  });

  it('a lista de proibidos não está vazia — o caso passaria à toa', () => {
    expect(FONTES_PROIBIDAS.length).toBeGreaterThan(10);
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
