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
