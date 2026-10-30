import { EntityId, ISOTimestamp } from './types';
import { AUTORIA_PADRAO, INSTITUICAO } from './book';

/**
 * ARTIGO — o lugar da curadoria e da auditoria.
 *
 * POR QUE ELE EXISTE, E POR QUE NÃO VIROU CAMPO DE CATÁLOGO
 * --------------------------------------------------------
 * As fontes trazem recortes de **opinião editorial**: listas de recomendados,
 * de influentes, de entrada no repertório. São juízos úteis, e são juízos de
 * terceiro.
 *
 * Se um desses recortes virasse filtro do acervo, a plataforma estaria
 * assinando embaixo de uma opinião que não é dela, sobre obras que são dela
 * catalogar. Pior: o rótulo afirmaria uma relação que o dado não carrega — uma
 * lista de "recomendados" não é linhagem, nem escola, nem influência.
 *
 * O artigo resolve isso. Ele é **autoral**: usa o que as fontes trazem como
 * insumo e diz o que o Conservatório conclui. O catálogo continua neutro, e a
 * curadoria continua existindo — separada, assinada, e com o estatuto claro.
 *
 * O QUE UM ARTIGO PODE SER
 * ------------------------
 * Auditoria de repertório, percurso de estudo nivelado, recorte por
 * influência, ensaio sobre uma era. O que ele **não** é: ficha de obra. Nada
 * que um artigo afirme muda o que o catálogo diz.
 *
 * AS FONTES NÃO SÃO CITADAS NO TEXTO
 * ----------------------------------
 * O artigo é conteúdo autoral, como o resto da plataforma. A origem dos dados
 * fica registrada no CÓDIGO — `docs/harness/85_SOURCES_AND_COVERAGE.md` —, e
 * não no texto que o aluno lê.
 *
 * Isso não conflita com o link oficial que a ficha de uma obra mostra: lá o
 * assunto é **onde o item está disponível**, que é informação de catálogo.
 * Aqui o assunto é de quem é a opinião, e a resposta é: nossa.
 */

export type TipoDeArtigo =
  /** Levantamento do que o acervo tem, e do que falta. */
  | 'AUDITORIA'
  /** Ordem sugerida de estudo, com obras do acervo. */
  | 'PERCURSO'
  /** Recorte temático: uma era, um movimento, uma escola. */
  | 'ENSAIO';

/** Uma seção do artigo. Markdown, como o resto do conteúdo. */
export interface SecaoDoArtigo {
  id: string;
  titulo: string;
  markdown: string;
  ordem: number;
}

/**
 * Uma obra citada pelo artigo, com o motivo da citação.
 *
 * O motivo é **obrigatório**. Uma lista de obras sem justificativa é uma lista
 * de opiniões escondidas: quem lê não sabe se aquela peça está ali por ser
 * fácil, por ser representativa, ou porque alguém gostou dela.
 */
export interface ObraCitada {
  obraId: EntityId;
  /** Por que esta obra entra aqui, escrito para quem lê. */
  motivo: string;
  /** Posição no percurso, quando o artigo é um percurso nivelado. */
  nivel?: number;
}

/**
 * Uma pessoa que o artigo percorre — compositor, editor, compilador.
 *
 * `papel` existe porque nem todo nome citado compôs: Pierre Laforge editou,
 * Mário de Andrade compilou, Spix e von Martius coletaram. Chamar os três de
 * compositor seria atribuir obra a quem não a escreveu.
 */
export interface PessoaCitada {
  pessoaId: EntityId;
  motivo: string;
  papel?: 'COMPOSITOR' | 'EDITOR' | 'COMPILADOR' | 'INTERPRETE';
}

/** Uma coletânea que o artigo percorre. */
export interface ColetaneaCitada {
  coletaneaId: EntityId;
  motivo: string;
}

export interface ArtigoDoConservatorio {
  id: EntityId;
  tipo: TipoDeArtigo;
  titulo: string;
  subtitulo: string;
  /**
   * O resumo que aparece na listagem. Diz o que o artigo conclui, e não o que
   * ele vai discutir — quem procura no acervo quer saber se vale abrir.
   */
  resumo: string;
  autoria: string;
  instituicao: string;
  secoes: SecaoDoArtigo[];
  /** Obras do acervo que o artigo percorre, com o motivo de cada uma. */
  obras: ObraCitada[];
  /**
   * 🔴 AS PESSOAS E AS COLETÂNEAS QUE O ARTIGO PERCORRE.
   *
   * Faltavam, e a falta aparecia como número errado: o card dizia "22 obras
   * citadas" sobre um artigo que percorre vinte coletâneas, quarenta e uma
   * peças e quinze autorias. A métrica não estava inflada — estava **cega**,
   * contando um dos três tipos de referência e chamando o resultado de total.
   *
   * Pior que o número: o que não é indexado **não vira caminho**. Um artigo que
   * nomeia Chiquinha Gonzaga no texto e não a liga obriga quem lê a sair dali e
   * procurar de novo, com o nome na memória. Referência que não leva a lugar
   * nenhum é citação de papel.
   */
  pessoas: PessoaCitada[];
  coletaneas: ColetaneaCitada[];
  /** Era, região, movimento ou casa a que o artigo se liga. */
  etiquetas: string[];
  publicadoEm: ISOTimestamp;
  atualizadoEm: ISOTimestamp;
}

/**
 * O artigo cita obra que existe no acervo?
 *
 * Artigo que aponta para obra inexistente é um percurso que não se pode
 * percorrer — e o aluno descobre isso no meio do caminho, que é o pior lugar.
 */
export function obrasInexistentes(
  artigo: ArtigoDoConservatorio,
  idsDoAcervo: Set<string>
): string[] {
  return artigo.obras.map((o) => o.obraId).filter((id) => !idsDoAcervo.has(id));
}

/** Toda obra citada explica por quê. */
export function citacoesSemMotivo(artigo: ArtigoDoConservatorio): string[] {
  const curto = (m: string) => m.trim().length < 15;
  return [
    ...artigo.obras.filter((o) => curto(o.motivo)).map((o) => o.obraId),
    ...artigo.pessoas.filter((p) => curto(p.motivo)).map((p) => p.pessoaId),
    ...artigo.coletaneas.filter((c) => curto(c.motivo)).map((c) => c.coletaneaId),
  ];
}

/**
 * Quantas referências o artigo tem, por tipo.
 *
 * Existe para a tela **não somar tudo num número só**. "Trinta e sete
 * referências" esconde se são trinta e sete obras ou trinta e sete nomes, e as
 * duas coisas dizem coisas diferentes sobre o que o artigo é.
 */
export function referenciasDoArtigo(artigo: ArtigoDoConservatorio): {
  obras: number;
  pessoas: number;
  coletaneas: number;
  total: number;
} {
  const obras = artigo.obras.length;
  const pessoas = artigo.pessoas.length;
  const coletaneas = artigo.coletaneas.length;
  return { obras, pessoas, coletaneas, total: obras + pessoas + coletaneas };
}

/**
 * Um percurso nivelado está em ordem?
 *
 * Nível que pula ou repete fora de ordem confunde quem segue o percurso, e o
 * defeito não aparece na leitura — só na prática, quando o aluno chega ao
 * nível 4 sem ter passado pelo 3.
 */
export function niveisForaDeOrdem(artigo: ArtigoDoConservatorio): boolean {
  const niveis = artigo.obras.map((o) => o.nivel).filter((n): n is number => n !== undefined);
  if (niveis.length === 0) return false;

  const distintos = [...new Set(niveis)].sort((a, b) => a - b);
  return distintos.some((n, i) => n !== i + 1);
}

/** Molde com a identidade editorial já preenchida. */
export function novoArtigo(
  base: Omit<
    ArtigoDoConservatorio,
    'autoria' | 'instituicao' | 'publicadoEm' | 'atualizadoEm' | 'pessoas' | 'coletaneas'
  > &
    Partial<Pick<ArtigoDoConservatorio, 'pessoas' | 'coletaneas'>>
): ArtigoDoConservatorio {
  const agora = new Date().toISOString();
  return {
    /**
     * Pessoas e coletâneas nascem vazias quando o artigo não as declara — e
     * vazio aqui é **zero referências daquele tipo**, que é diferente de campo
     * ausente. A tela conta os três, e um `undefined` faria a contagem
     * estourar em vez de dizer zero.
     */
    pessoas: [],
    coletaneas: [],
    ...base,
    autoria: AUTORIA_PADRAO,
    instituicao: INSTITUICAO,
    publicadoEm: agora,
    atualizadoEm: agora,
  };
}
