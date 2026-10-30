import {
  CanonicalComposer,
  CanonicalWork,
  KnowledgeSource,
} from '../../domain/music-knowledge';

/**
 * A PORTA DAS FONTES DE CONHECIMENTO MUSICAL.
 *
 * A INVARIANTE QUE ESTA PORTA EXISTE PARA MANTER
 * ----------------------------------------------
 * **A interface nunca fala com uma fonte externa.** Ela consome apenas
 * entidade canônica já reconciliada. Uma tela que chamasse o Wikidata direto
 * ficaria refém do formato dele, quebraria quando ele mudasse, e espalharia
 * pelo produto a decisão de o que é confiável — que é decisão de uma camada
 * só.
 *
 * NENHUM ADAPTADOR ESCREVE NO DOMÍNIO
 * -----------------------------------
 * Todos devolvem **candidatos**. Quem reconcilia é o `MusicKnowledgeService`,
 * porque reconciliar exige ver as fontes lado a lado: o Wikidata dá a data de
 * morte, o MusicBrainz confirma a autoria, e quando os dois discordam alguém
 * precisa decidir com o conflito à vista.
 *
 * Um adaptador que escrevesse direto tornaria isso impossível — a última
 * fonte a responder ganharia, e ninguém saberia que houve disputa.
 *
 * `fetch` É INJETADO
 * ------------------
 * Não por gosto de abstração: é o que permite provar o adaptador sem rede. Um
 * adaptador que só pode ser testado com internet é um adaptador que ninguém
 * testa — e aí ele vira mais um verificador verde por cegueira.
 */

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** O que um adaptador devolve: candidato, nunca verdade final. */
export interface ComposerCandidate {
  /** Nome como a fonte o escreve. A normalização é da camada de cima. */
  name: string;
  sortName?: string;
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  biographyPt?: string;
  biographyEn?: string;
  portraitUrl?: string;
  movements?: string[];
  externalIds: CanonicalComposer['externalIds'];
  /** Quanto a fonte merece crédito NESTE candidato, de 0 a 1. */
  confidence: number;
}

export interface WorkCandidate {
  titlePt?: string;
  titleEn?: string;
  /** Nome do compositor como a fonte o escreve, para reconciliar depois. */
  composerName?: string;
  date?: string;
  genre?: string;
  instrumentation?: string[];
  movements?: string[];
  externalIds: CanonicalWork['externalIds'];
  confidence: number;
}

export interface KnowledgeAdapter {
  readonly source: KnowledgeSource;

  /**
   * A fonte está acessível?
   *
   * Serve para o pente fino e para a tela de administração distinguirem
   * "não achei nada" de "não consegui perguntar" — que são coisas muito
   * diferentes e costumam aparecer iguais.
   */
  disponivel(): Promise<boolean>;

  /** Compositores que batem com o termo. Lista vazia é resposta legítima. */
  buscarCompositores(termo: string, limite?: number): Promise<ComposerCandidate[]>;

  /** Obras de um compositor, pelo identificador que ESTA fonte usa. */
  buscarObrasDoCompositor(idNaFonte: string, limite?: number): Promise<WorkCandidate[]>;
}

/**
 * Erro de fonte externa, separado dos erros do domínio.
 *
 * Rede fora do ar não é obra inexistente. Confundir os dois faria o acervo
 * "perder" obras toda vez que a conexão oscilasse.
 */
export class KnowledgeSourceError extends Error {
  constructor(
    public readonly source: KnowledgeSource,
    mensagem: string,
    public readonly causa?: unknown
  ) {
    super(`[${source}] ${mensagem}`);
    this.name = 'KnowledgeSourceError';
  }
}
