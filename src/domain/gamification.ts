import { EntityId, ISOTimestamp } from './types';

/**
 * GAMIFICATION & CULTURAL WORLDS DOMAIN
 * Historical eras, composer lineages, guided tours, cultural passports, stamps, and milestones.
 */

export enum PassportStampType {
  WORK_ANALYZED = 'WORK_ANALYZED',
  WORK_PERFORMED = 'WORK_PERFORMED',
  COURSE_MASTERED = 'COURSE_MASTERED',
  TOUR_COMPLETED = 'TOUR_COMPLETED',
  EXAM_HONORS = 'EXAM_HONORS',
}

export interface MusicalWorld {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  eraId: EntityId;
  aestheticTheme: string;
  mapCoordinates: { x: number; y: number };
  unlockedByDefault: boolean;
  requiredBadgeIds: EntityId[];
  totalWorksCount: number;
}

export interface MusicalEra {
  id: EntityId;
  slug: string;
  name: string;
  periodYears: string; // e.g. "1600 - 1750"
  description: string;
  keyCharacteristics: string[];
  famousSchools: string[];
  primaryAestheticColors: { primary: string; accent: string };
  order: number;
}

export interface HistoricalMaster {
  id: EntityId;
  eraId: EntityId;
  name: string;
  shortName: string; // e.g. "J.S. Bach"
  birthYear: number;
  deathYear: number;
  country: string;
  biography: string;
  portraitUrl: string;
  majorWorks: string[];
  pedagogicalLineage: string;
  influenceGraphIds: EntityId[]; // Composers who influenced or were influenced
}

export interface WorldTourStop {
  order: number;
  workId: EntityId;
  workTitle: string;
  masterId: EntityId;
  masterName: string;
  learningObjective: string;
}

export interface WorldTour {
  id: EntityId;
  worldId: EntityId;
  title: string;
  description: string;
  stops: WorldTourStop[];
  xpReward: number;
  badgeRewardId?: EntityId;
  estimatedMinutes: number;
}

export interface CulturalPassport {
  id: EntityId;
  userId: EntityId;
  passportNumber: string;
  issueDate: ISOTimestamp;
  totalStamps: number;
  completedTours: number;
  rankTitle: string; // e.g. "Peregrino Barroco", "Mestre Humanista"
  favoriteEraId?: EntityId;
  updatedAt: ISOTimestamp;
}

export interface PassportEntry {
  id: EntityId;
  passportId: EntityId;
  userId: EntityId;
  worldId: EntityId;
  eraId: EntityId;
  workId?: EntityId;
  workTitle?: string;
  stampType: PassportStampType;
  stampGraphicCode: string;
  stampedAt: ISOTimestamp;
  evidenceId?: EntityId;
  evaluatorSignature?: string;
}

export interface ProgressionMilestone {
  id: EntityId;
  userId: EntityId;
  category: 'PRACTICE' | 'ACADEMIC' | 'COMPOSITION' | 'COMMUNITY' | 'WORLD_ATLAS';
  title: string;
  description: string;
  thresholdValue: number;
  reachedValue: number;
  isCompleted: boolean;
  completedAt?: ISOTimestamp;
}

// ═══════════════════════════════════════════════════════════════════════════
// EIXO DO INSTRUMENTO — ILHAS DO ATLAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * O Atlas tem DOIS eixos que se cruzam, não um só.
 *
 *   Eixo temporal   → `MusicalWorld` / `MusicalEra`  (Barroco, Classicismo…)
 *   Eixo instrumental → `InstrumentIsland`            (Violino, Piano…)
 *
 * Eles se encontram na OBRA: a Chaconne da Partita BWV 1004 pertence ao
 * mundo Barroco e à ilha do Violino ao mesmo tempo. Quem a estuda carimba o
 * passaporte nos dois eixos.
 *
 * Por que uma ilha e não apenas um filtro: a trilha orientada a instrumento
 * é **um curso à parte**, com corpus, progressão e pedagogia próprios. O
 * violino tem Suzuki, Hans Sitt, Maia Bang, Laoureux e All for Strings —
 * nada disso é teoria musical, e nada disso cabe como faceta de busca.
 *
 * Convenção de descoberta: cada ilha corresponde a uma pasta
 * `framework_knowledge/knowledge-<slug>/`. Enquanto a pasta não existir, a
 * ilha permanece `PLANNED` — declarada no mapa, visivelmente fechada, nunca
 * simulada com conteúdo inventado.
 */
export enum InstrumentIslandStatus {
  /** Corpus presente e currículo publicado. Navegável. */
  AVAILABLE = 'AVAILABLE',
  /** Corpus presente, currículo em construção. Visível, não navegável. */
  IN_PREPARATION = 'IN_PREPARATION',
  /** Declarada no mapa, sem corpus. Marca o lugar sem prometer conteúdo. */
  PLANNED = 'PLANNED',
}

/** Uma fonte pedagógica do corpus de um instrumento, com proveniência. */
export interface InstrumentMethodSource {
  id: EntityId;
  /** Título como consta na obra. */
  title: string;
  author: string;
  /** Volume dentro do método, quando houver. */
  volume?: string;
  /** Caminho relativo em `framework_knowledge/`. Referência local, nunca publicada. */
  corpusPath: string;
  /**
   * Papel pedagógico. Um método de repertório (Suzuki) e um caderno de
   * estudos técnicos (Hans Sitt) não se substituem.
   */
  role: 'REPERTOIRE' | 'TECHNIQUE' | 'ETUDES' | 'METHOD' | 'SCALES';
  /** `false` enquanto a ingestão (COMANDO 8) não tiver processado a obra. */
  isIngested: boolean;
}

/**
 * Ilha de instrumento — território do Atlas com currículo próprio.
 */
export interface InstrumentIsland {
  id: EntityId;
  /** Casa com a pasta `knowledge-<slug>` do acervo. */
  slug: string;
  name: string;
  family: string;
  status: InstrumentIslandStatus;
  description: string;
  mapCoordinates: { x: number; y: number };

  /** Corpus pedagógico disponível para esta ilha. */
  sources: InstrumentMethodSource[];

  /**
   * Trilha curricular da ilha. Ausente enquanto `status !== AVAILABLE` —
   * é o que mantém o espaço aberto sem fabricar um curso que não existe.
   */
  curriculumPathId?: EntityId;

  /**
   * Eras em que este instrumento tem repertório canônico relevante.
   * É por aqui que o eixo instrumental cruza o temporal.
   */
  relevantEraIds: EntityId[];

  /** Competências técnicas específicas do instrumento. */
  techniqueSkillIds: EntityId[];
}

/**
 * Cruzamento dos dois eixos: uma obra situada simultaneamente numa era e
 * numa ilha. É a unidade que o passaporte carimba.
 */
export interface AtlasWorkPlacement {
  workId: EntityId;
  eraId: EntityId;
  /** Ausente para obras sem instrumento solista definido. */
  instrumentIslandId?: EntityId;
  composerId: EntityId;
  /** Nível dentro da progressão da ilha, quando aplicável. */
  islandStage?: number;
}

/** Carimbos do eixo instrumental. Complementam `PassportStampType`. */
export enum IslandStampType {
  /** Primeira visita à ilha. */
  ISLAND_VISITED = 'ISLAND_VISITED',
  /** Etapa da progressão do instrumento concluída. */
  STAGE_COMPLETED = 'STAGE_COMPLETED',
  /** Estudo técnico dominado, com evidência aferida. */
  ETUDE_MASTERED = 'ETUDE_MASTERED',
  /** Obra de repertório executada e avaliada. */
  REPERTOIRE_PERFORMED = 'REPERTOIRE_PERFORMED',
}
