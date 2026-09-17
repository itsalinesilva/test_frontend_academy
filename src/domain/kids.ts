import { EntityId, ISOTimestamp } from './types';

/**
 * KIDS & MINOR PROTECTION DOMAIN
 * Parental oversight, strict verification, consent registers, and restricted child modes.
 */

export enum GuardianRelationshipType {
  PARENT = 'PARENT',
  LEGAL_TUTOR = 'LEGAL_TUTOR',
  SCHOOL_DIRECTOR = 'SCHOOL_DIRECTOR',
}

export enum ConsentScope {
  ACCOUNT_CREATION = 'ACCOUNT_CREATION',
  AUDIO_RECORDING = 'AUDIO_RECORDING',
  COMMUNITY_PARTICIPATION = 'COMMUNITY_PARTICIPATION',
  DATA_COLLECTION = 'DATA_COLLECTION',
}

export interface LegalGuardian {
  id: EntityId;
  userId: EntityId;
  relationship: GuardianRelationshipType;
  phone: string;
  address?: string;
  isIdentityVerified: boolean;
  verifiedAt?: ISOTimestamp;
  documentProofHash?: string;
  createdAt: ISOTimestamp;
}

export interface ChildStudentProfile {
  id: EntityId;
  userId: EntityId;
  guardianId: EntityId;
  birthDate: string; // YYYY-MM-DD
  schoolGrade?: string;
  preferredAvatar: string;
  maxDailyStudyMinutes: number;
  isChatDisabled: boolean;
  allowOnlyCuratedRepertoire: boolean;
  strictParentalSupervision: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface GuardianConsentRecord {
  id: EntityId;
  guardianId: EntityId;
  childUserId: EntityId;
  consentScope: ConsentScope;
  documentHash: string;
  consentGivenAt: ISOTimestamp;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  revokedAt?: ISOTimestamp;
}

export interface ChildSafetyPolicy {
  id: EntityId;
  version: string;
  effectiveDate: ISOTimestamp;
  policyDocumentUrl: string;
  requiredParentalVerification: boolean;
  coppaAndLgpdCompliant: boolean;
  emergencyContactEmail: string;
}

export interface ChildVisibilitySetting {
  id: EntityId;
  childProfileId: EntityId;
  hideFromGlobalSearch: boolean;
  blockDirectMessages: boolean;
  anonymizePublicLeaderboards: boolean;
  allowTeacherRoomOnly: boolean;
  updatedAt: ISOTimestamp;
}
