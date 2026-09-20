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

/**
 * Mundo — o cruzamento de uma era com uma regiao.
 *
 * Tinha `eraId` e nao tinha regiao, e com isso "Barroco" era um mundo so —
 * quando Barroco alemao e Barroco italiano sao territorios distintos, com
 * escolas distintas. Ver `75_ATLAS_TAXONOMY.md`.
 */
export interface MusicalWorld {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  eraId: EntityId;
  regionId: EntityId;
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

/**
 * O eixo da população saiu deste arquivo.
 *
 * `InstrumentIsland` virou `Tribo`, em `src/domain/tribo.ts`. A mudança não
 * foi de rótulo: **ilha dá ideia de lugar**, e lugar, no Conservatório, é
 * assunto do Atlas — que já trata de onde (região) e de quando (era). Dois
 * vocabulários competindo pelo mesmo significado foi o que o catálogo de
 * taxonomia pegou.
 *
 * Tribo trata de gente: a população nichada de um lugar ou de um tempo.
 * E a generalização é o ganho — quem estuda história da música forma uma
 * tribo tanto quanto quem toca violino, e isso não cabia em "ilha de
 * instrumento".
 *
 * Ver `docs/harness/75_ATLAS_TAXONOMY.md`.
 */

/**
 * Cruzamento dos eixos: uma obra situada numa era, numa regiao e no corpus
 * de uma tribo. E a unidade que o passaporte carimba.
 */
export interface AtlasWorkPlacement {
  workId: EntityId;
  eraId: EntityId;
  /** Ausente para obras sem recorte geografico definido. */
  regionId?: EntityId;
  /** Ausente para obras sem instrumento ou disciplina solista definidos. */
  houseId?: EntityId;
  composerId: EntityId;
  /**
   * Genero da obra: missa, motete, madrigal, opera, suite.
   *
   * ERA UM EIXO DE FILTRO SEM CAMPO.
   * `AtlasFilter` declarava `genreId` desde sempre, e `AtlasWorkPlacement` nao
   * tinha onde guardar genero nenhum — o filtro passava e o repositorio o
   * ignorava em silencio. Quem filtrasse por "opera" receberia a lista
   * inteira, sem nenhum sinal de que o recorte nao foi aplicado.
   *
   * Opcional porque nem toda obra do acervo tem genero canonico: um estudo
   * tecnico ou uma escala nao sao genero, sao material.
   */
  generoId?: EntityId;
  /** Nivel dentro da progressao da Casa, quando aplicavel. */
  etapaDaCasa?: number;
}
