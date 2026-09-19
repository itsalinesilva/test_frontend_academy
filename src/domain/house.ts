import { EntityId } from './types';

/**
 * TRIBO — a população nichada.
 *
 * O QUE MUDOU, E POR QUE
 * ----------------------
 * Este domínio se chamava `InstrumentIsland`: "ilha de instrumento". A
 * palavra estava errada, e o erro não era de rótulo.
 *
 * **Ilha dá ideia de lugar** — e lugar, no Conservatório, é assunto do Atlas.
 * O Atlas trata de **onde** (região) e **quando** (era). Ter uma terceira
 * coisa também chamada de território punha dois vocabulários a competir pelo
 * mesmo significado, e foi por isso que o catálogo de taxonomia pegou a
 * contradição.
 *
 * Tribo trata de **gente**: a população nichada de um lugar ou de um tempo.
 * Tribo dos violinistas, tribo dos pianistas, **tribo dos historiadores**.
 * A generalização importa — uma tribo não é só instrumento. Quem estuda
 * história da música forma uma tribo tanto quanto quem toca violino.
 *
 * O QUE UMA TRIBO É
 * -----------------
 *   • um **corpus pedagógico próprio** — o violino tem Suzuki, Hans Sitt,
 *     Laoureux; o historiador tem outro conjunto, e nenhum dos dois é teoria
 *     musical genérica;
 *   • uma **progressão própria**, em etapas;
 *   • um **recorte de comparação**: é dentro da tribo que a liga faz sentido.
 *     "O melhor aluno da plataforma" diz pouco; "o melhor da tribo dos
 *     violinistas" diz muito.
 *
 * O QUE UMA TRIBO NÃO TEM
 * -----------------------
 * **Coordenada no mapa.** Tribo é gente, e gente não é ponto no Atlas. Quem
 * tem coordenada é o mundo — o cruzamento de era com região.
 *
 * Ver `docs/harness/75_ATLAS_TAXONOMY.md`.
 */

/**
 * Natureza da tribo.
 *
 * Existe para que "tribo dos historiadores" e "tribo dos violinistas" possam
 * conviver sem que uma finja ser a outra: a primeira não tem instrumento, e
 * cobrar-lhe um produziria campo vazio em todo lugar.
 */
export enum HouseNature {
  /** Reunida em torno de um instrumento. */
  INSTRUMENT = 'INSTRUMENT',
  /** Reunida em torno de um campo de estudo. */
  DISCIPLINE = 'DISCIPLINE',
  /** Reunida em torno de uma prática — reger, compor, arranjar. */
  CRAFT = 'CRAFT',
}

export enum HouseStatus {
  /** Corpus presente e progressão publicada. Aberta. */
  OPEN = 'OPEN',
  /** Corpus presente, progressão em construção. Visível, não navegável. */
  IN_PREPARATION = 'IN_PREPARATION',
  /**
   * Declarada, sem corpus. Marca o lugar sem prometer conteúdo.
   *
   * Uma tribo `ANUNCIADA` aparece na lista, fechada, com o motivo escrito —
   * e **nunca** é preenchida com conteúdo inventado para a tela não parecer
   * vazia.
   */
  ANNOUNCED = 'ANNOUNCED',
}

/** Uma fonte pedagógica do corpus de uma tribo, com proveniência. */
export interface HouseSource {
  id: EntityId;
  /** Título como consta na obra. */
  title: string;
  author: string;
  /** Volume dentro do método, quando houver. */
  volume?: string;
  /** Caminho relativo no acervo. Referência interna, nunca publicada. */
  corpusPath: string;
  /**
   * Papel pedagógico. Um método de repertório e um caderno de estudos
   * técnicos não se substituem.
   */
  role: 'REPERTORIO' | 'TECNICA' | 'ESTUDOS' | 'METODO' | 'ESCALAS' | 'REFERENCIA';
  /** `false` enquanto a ingestão não tiver processado a obra. */
  isIngested: boolean;
}

export interface House {
  id: EntityId;
  /** Casa com a pasta do acervo, quando houver. */
  slug: string;
  name: string;
  nature: HouseNature;
  /**
   * Agrupamento dentro da natureza: família do instrumento, ou área do
   * campo de estudo. "Cordas friccionadas", "Musicologia".
   */
  agrupamento: string;
  status: HouseStatus;
  description: string;

  /** Corpus pedagógico disponível para esta tribo. */
  sources: HouseSource[];

  /**
   * Trilha curricular da tribo. Ausente enquanto `status !== ABERTA` — é o
   * que mantém o espaço declarado sem fabricar um curso que não existe.
   */
  curriculumPathId?: EntityId;

  /**
   * Eras em que esta tribo tem repertório ou produção relevante.
   * É por aqui que a população cruza com o tempo do Atlas.
   */
  relevantEraIds: EntityId[];

  /** Regiões onde esta tribo tem tradição documentada. */
  relevantRegiaoIds: EntityId[];

  /** Competências específicas da tribo. */
  techniqueSkillIds: EntityId[];
}

/** Carimbos de passaporte do eixo da tribo. */
export enum HouseStamp {
  /** Primeiro contato com a tribo. */
  HOUSE_VISITED = 'HOUSE_VISITED',
  /** Etapa da progressão concluída. */
  ETAPA_CONCLUIDA = 'ETAPA_CONCLUIDA',
  /** Estudo técnico dominado, com evidência aferida. */
  ESTUDO_DOMINADO = 'ESTUDO_DOMINADO',
  /** Obra de repertório executada e avaliada. */
  REPERTORIO_EXECUTADO = 'REPERTORIO_EXECUTADO',
}

/** Tribos efetivamente navegáveis. */
export function openHouses(houses: House[]): House[] {
  return houses.filter((t) => t.status === HouseStatus.OPEN);
}

/**
 * Fontes já processadas pela ingestão.
 *
 * **Base de qualquer contagem exibida.** Mostrar "15 obras" quando nenhuma
 * foi processada seria anunciar acervo que a plataforma não alcança.
 */
export function processedSources(house: House): number {
  return house.sources.filter((s) => s.isIngested).length;
}
