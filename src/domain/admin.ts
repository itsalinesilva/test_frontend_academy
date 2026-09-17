import { EntityId, ISOTimestamp, UserRole } from './types';
import { AuditSeverity } from './audit';
export { AuditSeverity };

export enum ModerationActionType {
  APPROVED = 'APPROVED',
  FLAGGED = 'FLAGGED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
  BAN_TEMPORARY = 'BAN_TEMPORARY',
  BAN_PERMANENT = 'BAN_PERMANENT',
}

export enum LicenseType {
  CC_BY_SA_4_0 = 'CC_BY_SA_4_0',
  PUBLIC_DOMAIN_PDM = 'PUBLIC_DOMAIN_PDM',
  INSTITUTIONAL_COPYRIGHT = 'INSTITUTIONAL_COPYRIGHT',
  OPEN_MUSIC_ARCHIVE = 'OPEN_MUSIC_ARCHIVE',
}

export interface SystemAuditLog {
  id: EntityId;
  actorId: EntityId;
  actorEmail: string;
  actorIp?: string;
  action: string;
  targetEntityType: string;
  targetEntityId: string;
  severity: AuditSeverity;
  detailsJson: Record<string, unknown>;
  timestamp: ISOTimestamp;
}

export interface ContentModerationAction {
  id: EntityId;
  moderatorId: EntityId;
  moderatorName: string;
  targetContentType: 'POST' | 'COMMENT' | 'USER_BIO' | 'AUDIO_UPLOAD' | 'SCORE_UPLOAD';
  targetContentId: EntityId;
  actionTaken: ModerationActionType;
  reason: string;
  notes?: string;
  timestamp: ISOTimestamp;
}

export interface FeatureFlagConfig {
  id: EntityId;
  key: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number; // 0..100
  allowedUserRoles: UserRole[];
  allowedUserIds: EntityId[];
  updatedAt: ISOTimestamp;
  updatedBy: string;
}

export interface TelemetrySystemMetric {
  id: EntityId;
  metricName: string;
  metricType: 'COUNTER' | 'GAUGE' | 'HISTOGRAM';
  value: number;
  labels: Record<string, string>;
  recordedAt: ISOTimestamp;
}

export interface ContentRevisionRecord {
  id: EntityId;
  entityType: 'COURSE' | 'LESSON' | 'SCORE' | 'EXERCISE';
  entityId: EntityId;
  revisionNumber: number;
  authorId: EntityId;
  changesSummary: string;
  diffPayloadJson?: string;
  approvedByAdminId?: EntityId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: ISOTimestamp;
  decidedAt?: ISOTimestamp;
}

export interface ScholarlySource {
  id: EntityId;
  name: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  urnOrIsbn?: string;
  sourceUrl: string;
  isVerifiedOpenAccess: boolean;
}

export interface CopyrightLicense {
  id: EntityId;
  code: LicenseType;
  name: string;
  licenseUrl: string;
  permitsCommercial: boolean;
  permitsDerivatives: boolean;
  attributionRequired: boolean;
}

export interface CanonicalProvenanceRecord {
  id: EntityId;
  entityType: 'COURSE' | 'LESSON' | 'EXERCISE' | 'REPERTOIRE_WORK';
  entityId: EntityId;
  sourceId: EntityId;
  licenseId: EntityId;
  citationText: string;
  curatorNotes: string;
  verifiedBy: string;
  verifiedAt: ISOTimestamp;
}
