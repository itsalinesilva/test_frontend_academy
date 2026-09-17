import {
  User,
  Profile,
  UserRole,
  AppMode,
  UserCapability,
  ProfilePrivacySettings,
  GuardianRelationship,
  ChildAccountControls,
} from '../domain/types';
import { UserEntitlement } from '../domain/entitlements';

export interface LoginRequest {
  email: string;
  password?: string;
  provider?: 'local' | 'google';
}

export interface GoogleOAuthRequest {
  email: string;
  name: string;
  avatarUrl?: string;
  idToken?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  selectedRole?: UserRole;
  password?: string;
  guardianEmail?: string;
  authProvider?: 'email' | 'google';
  avatarUrl?: string;
  initialMode?: AppMode;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
}

export interface LinkAccountRequest {
  userId: string;
  provider: 'google' | 'email';
  email: string;
  name?: string;
  avatarUrl?: string;
  password?: string;
}

export interface OnboardingCompletionRequest {
  displayName: string;
  avatarSource?: 'google' | 'custom' | 'initials';
  avatarUrl?: string;
  mode: AppMode;
  instruments: string[];
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado' | 'conservatorio';
  goals: string[];
  musicalInterests: string[];
  preferences: {
    tuningStandard: '440hz' | '432hz';
    notationSystem: 'syllabic' | 'alphabetical';
    preferredClef: 'g_treble' | 'f_bass' | 'c_alto';
    notificationsEnabled: boolean;
  };
  privacySettings: ProfilePrivacySettings;
  guardian?: GuardianRelationship;
  childControls?: ChildAccountControls;
  title?: string;
  biography?: string;
  selectedRole?: UserRole;
}

export interface PostAuthResult {
  user: User;
  profile: Profile;
  capabilities: UserCapability[];
  entitlements: UserEntitlement[];
  mode: AppMode;
  progress: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalStudyHours: number;
    streakDays: number;
    totalSessions: number;
  };
  destination: string;
}

export interface AuthSessionResponse {
  user: User;
  profile: Profile;
  capabilities: UserCapability[];
  entitlements: UserEntitlement[];
  mode: AppMode;
  accessToken: string;
  expiresAt: string;
}

export interface SwitchRoleRequest {
  newRole: UserRole;
}

