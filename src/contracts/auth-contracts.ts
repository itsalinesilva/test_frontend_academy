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

/**
 * Única credencial aceita pela plataforma (ADR-001.A).
 *
 * `idToken` é o JWT assinado pelo Google; `nonce` é o valor de uso único
 * gerado pelo cliente e conferido pelo servidor contra a claim do token.
 *
 * Não existe `LoginRequest` com senha, `RegisterRequest`,
 * `PasswordRecoveryRequest` nem `ResetPasswordRequest`: com autenticação
 * exclusivamente federada, essa superfície não é remendada — ela deixa de
 * existir. Ver CLAUDE_AUDIT.md S-03/S-05.
 */
export interface GoogleAuthenticationRequest {
  idToken: string;
  nonce?: string;
}

export interface LinkAccountRequest {
  userId: string;
  provider: 'google';
  email: string;
  name?: string;
  avatarUrl?: string;
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
  /** JWS HS256 emitido e assinado pelo servidor de autoridade. */
  accessToken: string;
  expiresAt: string;
  /**
   * Resolvido SERVER-SIDE a partir da allowlist em variável de ambiente.
   * Nunca inferido no cliente, nunca derivado de `user.primaryRole`.
   */
  isAdmin: boolean;
  adminCapabilities: readonly string[];
}

export interface SwitchRoleRequest {
  newRole: UserRole;
}

