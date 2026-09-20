import { Faceta } from './catalog-facets';

/**
 * O FUNIL DO ACERVO — a árvore de filtragem, em ordem e por etapa.
 *
 * 🔴 O QUE HAVIA
 * --------------
 * Todos os eixos apareciam **de uma vez**, numa grade de seletores: era, meio,
 * instrumento da edição, gênero, região, tonalidade, sub-período, instrumento
 * praticado, movimento, situação, licença. Onze caixas lado a lado, sem ordem,
 * sem hierarquia, e várias que nem se aplicam ao que está sendo listado.
 *
 * Quem chega não sabe por onde começar, e a tela vira um painel de controle em
 * vez de um caminho. Pior: como cada eixo se recalcula sobre os outros, mexer
 * num deles muda seis, e a sensação é de que a tela se move sozinha.
 *
 * O QUE ISTO É
 * ------------
 * Um **funil**: etapas numeradas, na ordem em que um catálogo musical estreita
 * a busca. Cada etapa pergunta uma coisa, e só aparece quando faz sentido para
 * o que se está procurando.
 *
 *   1. O QUE — obra, pessoa, movimento. Decide todo o resto.
 *   2. QUANDO — a era. É o recorte que mais divide um acervo histórico.
 *   3. ONDE — a região.
 *   4. POR ONDE SAI O SOM — o meio.
 *   5. COMO SE ORGANIZA — a forma.
 *   6. O DETALHE — tonalidade, instrumento da edição, tessitura.
 *
 * A ordem não é estética. Ela é a ordem em que as perguntas se respondem: não
 * dá para escolher "tonalidade" antes de saber se você procura obra ou pessoa,
 * e "instrumento da edição" só existe onde há edição.
 */

/** O que se procura. Primeira pergunta, e a que decide todas as outras. */
export type AlvoDaBusca =
  | 'OBRAS'
  | 'COMPOSITORES'
  | 'MOVIMENTOS'
  /**
   * 🔴 PARTITURAS e ANTIGUIDADE existiam no serviço e não tinham lugar na
   * tela: mil trezentas e quarenta e nove edições e oito registros da
   * Antiguidade, catalogados, e invisíveis.
   */
  | 'PARTITURAS'
  | 'ANTIGUIDADE'
  | 'PENDENTES';

export interface EtapaDoFunil {
  /** Ordem de afunilamento, começando em 1. */
  numero: number;
  /** A pergunta, e não o nome do campo: "Quando" em vez de "periodId". */
  pergunta: string;
  /** Os campos de faceta que esta etapa reúne. */
  campos: string[];
  /** Em que alvos esta etapa faz sentido. */
  alvos: AlvoDaBusca[];
}

/**
 * As etapas, em ordem.
 *
 * Uma etapa pode reunir mais de um eixo quando eles respondem à mesma pergunta
 * em granularidades diferentes — "meio" e "instrumento da edição" são os dois
 * *por onde sai o som*, um grosso e um fino, e separá-los em duas etapas faria
 * a pessoa responder duas vezes à mesma coisa.
 */
export const ETAPAS: EtapaDoFunil[] = [
  {
    /**
     * A SELEÇÃO DA FONTE É A PRIMEIRA ETAPA, e não um detalhe.
     *
     * Num acervo de vinte e cinco mil obras, "por onde começo" é a pergunta
     * de quem chega — e a catalogação de origem tem duas listas curadas que
     * respondem exatamente isso. Enterrá-las no fim do funil seria oferecê-las
     * a quem já sabe procurar.
     */
    numero: 1,
    pergunta: 'Por onde começar',
    campos: ['selecao'],
    alvos: ['OBRAS'],
  },
  {
    numero: 2,
    pergunta: 'Quando',
    campos: ['eraId', 'subPeriodo'],
    alvos: ['OBRAS', 'COMPOSITORES', 'MOVIMENTOS', 'PARTITURAS'],
  },
  {
    numero: 3,
    pergunta: 'Onde',
    campos: ['regionId'],
    alvos: ['OBRAS', 'COMPOSITORES', 'MOVIMENTOS'],
  },
  {
    numero: 4,
    pergunta: 'Por onde sai o som',
    campos: ['meio', 'instrumentoPraticado'],
    alvos: ['OBRAS', 'COMPOSITORES', 'PARTITURAS'],
  },
  {
    numero: 5,
    pergunta: 'Como se organiza',
    campos: ['generoId', 'movimento'],
    alvos: ['OBRAS', 'COMPOSITORES'],
  },
  {
    numero: 6,
    pergunta: 'O detalhe',
    campos: ['key', 'situacao', 'licenca'],
    alvos: ['OBRAS', 'COMPOSITORES', 'PARTITURAS', 'PENDENTES'],
  },
];

export interface EtapaMontada extends EtapaDoFunil {
  facetas: Faceta[];
  /** Quantos recortes desta etapa a pessoa já escolheu. */
  escolhidos: number;
}

/**
 * Distribui as facetas do serviço pelas etapas, na ordem do funil.
 *
 * Faceta sem etapa declarada **não some**: entra na última, "o detalhe". Um
 * eixo novo no serviço passa a aparecer sozinho, e não desaparece porque
 * ninguém lembrou de cadastrá-lo aqui — sumiço silencioso é o defeito que este
 * projeto mais persegue.
 */
export function montarFunil(
  alvo: AlvoDaBusca,
  facetas: Faceta[],
  escolhas: Record<string, string>
): EtapaMontada[] {
  const usadas = new Set<string>();

  const etapas = ETAPAS.filter((e) => e.alvos.includes(alvo)).map((e) => {
    const minhas = facetas.filter((f) => {
      if (!e.campos.includes(f.campo)) return false;
      usadas.add(f.campo);
      return true;
    });

    return {
      ...e,
      facetas: minhas,
      escolhidos: minhas.filter((f) => escolhas[f.campo]).length,
    };
  });

  const orfas = facetas.filter((f) => !usadas.has(f.campo));
  if (orfas.length > 0) {
    const ultima = etapas[etapas.length - 1];
    if (ultima) {
      ultima.facetas = [...ultima.facetas, ...orfas];
      ultima.escolhidos += orfas.filter((f) => escolhas[f.campo]).length;
    }
  }

  /** Etapa sem nenhum eixo com opção não é oferecida: seria um passo vazio. */
  return etapas.filter((e) => e.facetas.some((f) => f.opcoes.length > 0));
}

/** Quantos recortes estão ativos, para o funil dizer sem abrir. */
export function quantosRecortes(escolhas: Record<string, string>): number {
  return Object.values(escolhas).filter(Boolean).length;
}

/**
 * O rótulo do alvo, na voz de quem procura.
 *
 * "Obras" e "o que você procura: obras" dizem a mesma coisa; o segundo cabe
 * numa pergunta e o primeiro cabe numa aba. Aqui é aba.
 */
export const ROTULO_DO_ALVO: Record<AlvoDaBusca, string> = {
  OBRAS: 'Obras',
  COMPOSITORES: 'Pessoas',
  PARTITURAS: 'Partituras',
  MOVIMENTOS: 'Movimentos',
  ANTIGUIDADE: 'Antiguidade',
  PENDENTES: 'A resolver',
};
