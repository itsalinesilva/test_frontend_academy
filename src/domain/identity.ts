import { EntityId, ISOTimestamp, UserRole, UserCapability } from './types';

/**
 * IDENTITY DOMAIN
 * Core identity, authentication, capability-based access control, and user profiles.
 */

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DEACTIVATED = 'DEACTIVATED',
}

export enum AuthProviderType {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  INSTITUTIONAL = 'institutional',
}

export enum CapabilitySensitivity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum VisibilityScope {
  PUBLIC = 'public',
  INSTITUTIONAL = 'institutional',
  CONNECTIONS_ONLY = 'connections_only',
  PRIVATE = 'private',
}

/**
 * User Entity - The primary identity in the system.
 * Foreign Keys: guardianId (optional, points to User)
 * Cardinalities: 1 User -> 0..1 Profile, 1 User -> 0..* Accounts, 1 User -> 0..* Entitlements
 */
export interface UserRecord {
  id: EntityId;
  email: string;
  name: string;
  avatarUrl?: string;
  primaryRole: UserRole;
  assignedRoles: UserRole[];
  status: AccountStatus;
  isEmailVerified: boolean;
  authProvider: AuthProviderType;
  guardianId?: EntityId;
  isFounderAdmin?: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

/**
 * Account Entity - OAuth or credential-based authenticators attached to a User.
 * Foreign Keys: userId -> UserRecord.id
 * Cardinality: * Accounts -> 1 User
 */
export interface Account {
  id: EntityId;
  userId: EntityId;
  provider: AuthProviderType;
  providerAccountId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Role Entity - RBAC definition aggregating Capabilities.
 */
export interface RoleDefinition {
  id: EntityId;
  name: UserRole;
  description: string;
  capabilities: UserCapability[];
  isSystemRole: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Capability Entity - Atomic privilege descriptor.
 */
export interface CapabilityDefinition {
  id: EntityId;
  code: UserCapability;
  domain: 'identity' | 'academy' | 'practice' | 'creation' | 'community' | 'rooms' | 'admin';
  description: string;
  sensitivity: CapabilitySensitivity;
}

/**
 * Identity Profile Privacy Configuration.
 */
export interface IdentityPrivacySettings {
  visibility: VisibilityScope;
  showAcademicHistory: boolean;
  showPracticeLog: boolean;
  showPortfolio: boolean;
  allowCommunityInteraction: boolean;
}

/**
 * Guardian Relationship Link for Child safety.
 */
export interface GuardianLink {
  guardianUserId?: EntityId;
  guardianEmail: string;
  guardianName?: string;
  guardianPhone?: string;
  relationship: 'pai' | 'mae' | 'tutor_legal' | 'diretor_escola';
  consentGiven: boolean;
  consentTimestamp?: ISOTimestamp;
  consentDocumentHash?: string;
}

/**
 * Child Protective Controls.
 */
export interface ChildControls {
  isKidModeActive: boolean;
  maxDailyScreenMinutes?: number;
  restrictedChat: boolean;
  contentFilterLevel: 'strict' | 'standard';
  allowTeacherRoomOnly: boolean;
}

/**
 * Profile Entity - Extended musical persona and public/private identity.
 * Foreign Keys: userId -> UserRecord.id
 * Cardinality: 1 Profile -> 1 User
 */
export interface UserProfile {
  id: EntityId;
  userId: EntityId;
  displayName: string;
  title?: string;
  biography: string;
  headline?: string;
  avatarSource: 'google' | 'custom' | 'initials';
  avatarUrl?: string;
  instruments: string[];
  musicalInterests: string[];
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado' | 'conservatorio';
  isPublic: boolean;
  visibility: VisibilityScope;
  privacySettings: IdentityPrivacySettings;
  guardian?: GuardianLink;
  childControls?: ChildControls;
  onboardingCompleted: boolean;
  academicProgressSummary: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalStudyHours: number;
  };
  practiceSummary: {
    totalSessions: number;
    streakDays: number;
    lastPracticeAt?: ISOTimestamp;
  };
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}
