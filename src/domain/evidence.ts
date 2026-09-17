import { EntityId, ISOTimestamp } from './types';
import { VisibilityScope } from './identity';

/**
 * EVIDENCE & PORTFOLIO DOMAIN
 * Immutable musical artifacts, credentials, microcredentials, badges, and verified portfolio items.
 */

export enum EvidenceSource {
  ACADEMY = 'ACADEMY',
  PRACTICE = 'PRACTICE',
  STUDIO = 'STUDIO',
  ROOMS = 'ROOMS',
  COMMUNITY = 'COMMUNITY',
  HISTORICAL_ATLAS = 'HISTORICAL_ATLAS',
}

export enum ArtifactType {
  AUDIO_RECORDING = 'AUDIO_RECORDING',
  MUSICXML_SCORE = 'MUSICXML_SCORE',
  ASSESSMENT_SUBMISSION = 'ASSESSMENT_SUBMISSION',
  EVALUATOR_RUBRIC = 'EVALUATOR_RUBRIC',
  ACADEMIC_DIPLOMA = 'ACADEMIC_DIPLOMA',
  PERFORMANCE_VIDEO = 'PERFORMANCE_VIDEO',
}

export enum PortfolioCategory {
  PERFORMANCE = 'PERFORMANCE',
  COMPOSITION = 'COMPOSITION',
  THEORETICAL_ANALYSIS = 'THEORETICAL_ANALYSIS',
  ACADEMIC_CREDENTIAL = 'ACADEMIC_CREDENTIAL',
  PEDAGOGY = 'PEDAGOGY',
}

export enum CredentialType {
  CERTIFICATE = 'CERTIFICATE',
  DIPLOMA = 'DIPLOMA',
  MICROCREDENTIAL = 'MICROCREDENTIAL',
  TEACHING_LICENSE = 'TEACHING_LICENSE',
}

export interface StoredArtifact {
  id: EntityId;
  evidenceId: EntityId;
  type: ArtifactType;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: 'LOCAL' | 'GCS' | 'IPFS_PIN';
  checksumSha256: string;
  metadataJson: Record<string, string | number | boolean>;
  createdAt: ISOTimestamp;
}

export interface MusicalEvidence {
  id: EntityId;
  userId: EntityId;
  source: EvidenceSource;
  sourceEntityId: EntityId;
  title: string;
  description: string;
  artifactType: ArtifactType;
  artifactUrl: string;
  skills: string[];
  instruments: string[];
  evaluatorName?: string;
  evaluatorUserId?: EntityId;
  evaluatorGrade?: number;
  evaluatorNotes?: string;
  checksumSha256: string;
  visibility: VisibilityScope;
  auditLogId?: EntityId;
  createdAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

export interface PortfolioItem {
  id: EntityId;
  userId: EntityId;
  evidenceId: EntityId;
  category: PortfolioCategory;
  title: string;
  description: string;
  featuredOrder: number;
  isPublic: boolean;
  visibility: VisibilityScope;
  publishedAt: ISOTimestamp;
  curatorNotes?: string;
}

export interface AcademicCredential {
  id: EntityId;
  userId: EntityId;
  type: CredentialType;
  issuerInstitution: string;
  title: string;
  description: string;
  workloadHours?: number;
  competencies: string[];
  issuedAt: ISOTimestamp;
  expiresAt?: ISOTimestamp;
  verificationCode: string;
  digitalSignatureSha256: string;
  verificationUrl: string;
  status: 'ACTIVE' | 'REVOKED';
  revokedAt?: ISOTimestamp;
  revocationReason?: string;
}

export interface MicrocredentialRecord {
  id: EntityId;
  userId: EntityId;
  skillId: EntityId;
  credentialId?: EntityId;
  level: number;
  verifiedByEvaluatorId?: EntityId;
  evidenceIds: EntityId[];
  issuedAt: ISOTimestamp;
}

export interface BadgeDefinition {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'STREAK' | 'PRACTICE_HOURS' | 'COURSE_COMPLETION' | 'POLYPHONY_MASTERY' | 'COMMUNITY_LEADER';
  criteriaDescription: string;
  requiredMetric: string;
  thresholdValue: number;
}

export interface UserAchievement {
  id: EntityId;
  userId: EntityId;
  badgeId: EntityId;
  badgeSlug: string;
  badgeName: string;
  unlockedAt: ISOTimestamp;
  progressPercentage: number;
  isDisplayedOnProfile: boolean;
}
