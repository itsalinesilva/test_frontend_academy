import { EntityId, ISOTimestamp } from './types';

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SECURITY = 'SECURITY',
  CRITICAL = 'CRITICAL',
}

export enum AuditAction {
  USER_LOGIN = 'auth.login',
  USER_LOGOUT = 'auth.logout',
  USER_REGISTER = 'auth.register',
  GOOGLE_OAUTH_LOGIN = 'auth.google.login',
  ROLE_GRANTED = 'admin.role.granted',
  ROLE_REVOKED = 'admin.role.revoked',
  FEATURE_FLAG_TOGGLED = 'admin.flag.toggled',
  CONTENT_MODERATED = 'moderation.content.actioned',
  ENGINE_CONFIG_UPDATED = 'engine.config.updated',
  LESSON_PROGRESS_OVERRIDDEN = 'admin.progress.override',
  SECURITY_ACCESS_DENIED = 'security.access.denied',
  PROFILE_INITIALIZED = 'identity.profile.initialized',
  ONBOARDING_COMPLETED = 'identity.onboarding.completed',
  GUARDIAN_LINKED = 'identity.guardian.linked',
  CHILD_CONTROLS_UPDATED = 'identity.child_controls.updated',
  ENTITLEMENT_CHECKED = 'entitlement.evaluated',
  ENTITLEMENT_GRANTED = 'admin.entitlement.granted',
  ENTITLEMENT_REVOKED = 'admin.entitlement.revoked',
  ACCOUNT_LINKED = 'auth.account.linked',
  PASSWORD_RESET = 'auth.password.reset',
}

export interface AuditEvent {
  id: EntityId;
  action: AuditAction;
  actorId: EntityId;
  actorEmail: string;
  targetId?: EntityId;
  targetType?: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  timestamp: ISOTimestamp;
}
