import { EntityId } from './types';
import { ChairId } from './chair';

/**
 * CASA — a população nichada.
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
 * Casa trata de **gente**: a população nichada de um lugar ou de um tempo.
 * Casa dos violinistas, Casa dos pianistas, **Casa dos historiadores**.
 * A generalização importa — uma Casa não é só instrumento. Quem estuda
 * história da música forma uma Casa tanto quanto quem toca violino.
 *
 * O QUE UMA CASA É
 * ----------------
 *   • um **corpus pedagógico próprio** — quem toca violino estuda uma
 *     progressão de repertório, de arco e de estudos técnicos; o historiador
 *     estuda outra coisa, e nenhuma das duas é teoria musical genérica. Os
 *     títulos de cada corpus ficam no registro editorial, fora do pacote —
 *     ver `docs/harness/82_HOUSE_CORPUS.md`;
 *   • uma **progressão própria**, em etapas;
 *   • um **recorte de comparação**: é dentro da Casa que a liga faz sentido.
 *     "O melhor aluno da plataforma" diz pouco; "o melhor da Casa dos
 *     violinistas" diz muito.
 *
 * O QUE UMA CASA NÃO TEM
 * ----------------------
 * **Coordenada no mapa.** Casa é gente, e gente não é ponto no Atlas. Quem
 * tem coordenada é o mundo — o cruzamento de era com região.
 *
 * Ver `docs/harness/75_ATLAS_TAXONOMY.md`.
 */

/**
 * Natureza da Casa.
 *
 * Existe para que "Casa dos historiadores" e "Casa dos violinistas" possam
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
   * Uma Casa `ANUNCIADA` aparece na lista, fechada, com o motivo escrito —
   * e **nunca** é preenchida com conteúdo inventado para a tela não parecer
   * vazia.
   */
  ANNOUNCED = 'ANNOUNCED',
}

/**
 * Quanto corpus uma Casa tem, e quanto dele já foi processado.
 *
 * AQUI HAVIA UMA BIBLIOGRAFIA, E ELA IA AO AR
 * -------------------------------------------
 * `HouseSource` carregava título, autor, volume e caminho de arquivo de cada
 * método usado no preparo da Casa. O comentário do campo dizia "referência
 * interna, nunca publicada" — e ela era publicada, porque `src/data/` entra
 * no pacote que o navegador baixa. A Casa dos violinistas levava quatro
 * métodos protegidos, com nome de autor e caminho de PDF, para dentro do
 * `dist/`.
 *
 * São duas coisas erradas ao mesmo tempo. A plataforma transmite conteúdo
 * **autoral** e não cita a bibliografia do estudo interno — regra de produto.
 * E proveniência de corpus é **trabalho editorial**, que pela separação das
 * três categorias de armazenamento nunca vai para o cliente.
 *
 * O registro não se perdeu: vive em `docs/harness/82_HOUSE_CORPUS.md`, que
 * não é empacotado. O que fica aqui é a única parte que a tela usa — quanto
 * há, e quanto está pronto.
 */
export interface HouseCorpus {
  /** Quantas obras compõem o corpus previsto para esta Casa. */
  obras: number;
  /** Quantas já foram processadas pela ingestão. */
  ingeridas: number;
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

  /** Quanto corpus esta Casa tem, e quanto já está pronto. */
  corpus: HouseCorpus;

  /**
   * Trilha curricular da Casa. Ausente enquanto `status !== ABERTA` — é o
   * que mantém o espaço declarado sem fabricar um curso que não existe.
   */
  curriculumPathId?: EntityId;

  /**
   * Eras em que esta Casa tem repertório ou produção relevante.
   * É por aqui que a população cruza com o tempo do Atlas.
   */
  relevantEraIds: EntityId[];

  /** Regiões onde esta Casa tem tradição documentada. */
  relevantRegiaoIds: EntityId[];

  /** Competências específicas da Casa. */
  techniqueSkillIds: EntityId[];

  /**
   * O INSTRUMENTO QUE ESTA CASA REÚNE, no vocabulário do catálogo.
   *
   * É o que faz a Casa **recortar o mapa** em vez de ser um rótulo: escolher
   * "Violinistas" passa a mostrar quem tocava violino naquela era.
   *
   * Ausente nas Casas que não se organizam por instrumento — historiadores,
   * teóricos, compositores. Elas continuam declaradas, e a interface diz que
   * ainda não recortam, em vez de oferecer um controle que não faz nada.
   *
   * `agrupamento` diz "Cordas friccionadas", que é texto para ler. Este campo
   * é identificador para cruzar, e os dois não se substituem.
   */
  instrumentoId?: EntityId;

  /**
   * A cadeira que alimenta esta Casa, quando já existe curso que chegue ao
   * Laboratório.
   *
   * Ausente **não** é omissão: é o caminho sedimentado. A Casa dos pianistas
   * está declarada, com nome e agrupamento, e sem cadeira porque ainda não há
   * curso de piano. No dia em que houver, é este campo que liga um ao outro —
   * e é a partir dele que o modo Casa passa a se oferecer.
   */
  cadeiraId?: ChairId;
}

/**
 * Os filtros que o modo Casa pode oferecer, DERIVADOS do que a Casa declara.
 *
 * Não há campo novo dizendo "esta Casa filtra por era". Haveria duas fontes
 * para o mesmo fato, e elas divergiriam — é o defeito que a auditoria de
 * setembro catalogou em dois lugares diferentes. O filtro existe quando há o
 * que filtrar, e ponto.
 *
 * É assim que a orientação do Atlas se habilita por Casa: a Casa diz em que
 * eras e regiões tem repertório, e o modo Casa oferece exatamente esses
 * recortes. Casa sem era declarada não ganha um filtro de era vazio.
 */
export interface FiltrosDoModoCasa {
  porEra: boolean;
  porRegiao: boolean;
  porCompetencia: boolean;
}

export function filtrosDoModoCasa(house: House): FiltrosDoModoCasa {
  return {
    porEra: house.relevantEraIds.length > 0,
    porRegiao: house.relevantRegiaoIds.length > 0,
    porCompetencia: house.techniqueSkillIds.length > 0,
  };
}

/**
 * A Casa tem modo Casa?
 *
 * Exige as duas coisas: uma cadeira que a alimente, e corpus de verdade. Só
 * cadeira daria um modo vazio; só corpus daria um modo sem curso que leve
 * ninguém até ele.
 */
export function temModoCasa(house: House): boolean {
  return house.cadeiraId !== undefined && house.corpus.obras > 0;
}

/**
 * O status bate com o corpus?
 *
 * `IN_PREPARATION` significa, pela definição acima, **corpus presente**. Duas
 * Casas estavam marcadas assim com zero obras — a lista dizia "em preparo"
 * sobre um preparo que não tinha começado. É a mesma família de defeito das
 * telas que anunciavam número que ninguém contou.
 */
export function statusCoerenteComCorpus(house: House): boolean {
  if (house.status === HouseStatus.ANNOUNCED) return house.corpus.obras === 0;
  return house.corpus.obras > 0;
}

/** Carimbos de passaporte do eixo da Casa. */
export enum HouseStamp {
  /** Primeiro contato com a Casa. */
  HOUSE_VISITED = 'HOUSE_VISITED',
  /** Etapa da progressão concluída. */
  ETAPA_CONCLUIDA = 'ETAPA_CONCLUIDA',
  /** Estudo técnico dominado, com evidência aferida. */
  ESTUDO_DOMINADO = 'ESTUDO_DOMINADO',
  /** Obra de repertório executada e avaliada. */
  REPERTORIO_EXECUTADO = 'REPERTORIO_EXECUTADO',
}

/** Casas efetivamente navegáveis. */
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
  return house.corpus.ingeridas;
}
