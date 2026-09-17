import { UserRole, UserCapability } from './types';

/**
 * Role-to-Capabilities Mapping Matrix
 * Strictly authoritative as per docs 00, 05, 31, 32
 */
export const ROLE_CAPABILITIES_MAP: Record<UserRole, UserCapability[]> = {
  [UserRole.ALUNO]: [
    UserCapability.VIEW_OWN_PROFILE,
    UserCapability.EDIT_OWN_PROFILE,
    UserCapability.VIEW_PUBLIC_PROFILE,
    UserCapability.ENROLL_COURSE,
    UserCapability.VIEW_LESSON,
    UserCapability.SUBMIT_ACTIVITY,
    UserCapability.VIEW_CERTIFICATE,
    UserCapability.START_PRACTICE_SESSION,
    UserCapability.SUBMIT_PRACTICE_ATTEMPT,
    UserCapability.VIEW_PRACTICE_METRICS,
    UserCapability.JOIN_ROOM,
    UserCapability.VIEW_COMMUNITY_FEED,
    UserCapability.CREATE_COMMUNITY_POST,
    UserCapability.REPORT_CONTENT,
    UserCapability.USE_METRONOME,
    UserCapability.USE_TUNER,
  ],
  [UserRole.MUSICO]: [
    UserCapability.VIEW_OWN_PROFILE,
    UserCapability.EDIT_OWN_PROFILE,
    UserCapability.VIEW_PUBLIC_PROFILE,
    UserCapability.ENROLL_COURSE,
    UserCapability.VIEW_LESSON,
    UserCapability.SUBMIT_ACTIVITY,
    UserCapability.VIEW_CERTIFICATE,
    UserCapability.START_PRACTICE_SESSION,
    UserCapability.SUBMIT_PRACTICE_ATTEMPT,
    UserCapability.VIEW_PRACTICE_METRICS,
    UserCapability.JOIN_ROOM,
    UserCapability.VIEW_COMMUNITY_FEED,
    UserCapability.CREATE_COMMUNITY_POST,
    UserCapability.REPORT_CONTENT,
    UserCapability.USE_METRONOME,
    UserCapability.USE_TUNER,
    UserCapability.USE_SCORE_EDITOR,
    UserCapability.USE_DAW_STUDIO,
  ],
  [UserRole.PROFESSOR]: [
    UserCapability.VIEW_OWN_PROFILE,
    UserCapability.EDIT_OWN_PROFILE,
    UserCapability.VIEW_PUBLIC_PROFILE,
    UserCapability.ENROLL_COURSE,
    UserCapability.VIEW_LESSON,
    UserCapability.SUBMIT_ACTIVITY,
    UserCapability.VIEW_CERTIFICATE,
    UserCapability.CREATE_COURSE,
    UserCapability.PUBLISH_COURSE,
    UserCapability.START_PRACTICE_SESSION,
    UserCapability.SUBMIT_PRACTICE_ATTEMPT,
    UserCapability.VIEW_PRACTICE_METRICS,
    UserCapability.JOIN_ROOM,
    UserCapability.CREATE_ROOM,
    UserCapability.ASSIGN_EXERCISE,
    UserCapability.GRADE_SUBMISSION,
    UserCapability.VIEW_COMMUNITY_FEED,
    UserCapability.CREATE_COMMUNITY_POST,
    UserCapability.REPORT_CONTENT,
    UserCapability.USE_METRONOME,
    UserCapability.USE_TUNER,
    UserCapability.USE_SCORE_EDITOR,
    UserCapability.USE_DAW_STUDIO,
  ],
  [UserRole.CRIANCA]: [
    UserCapability.VIEW_OWN_PROFILE,
    UserCapability.ENROLL_COURSE,
    UserCapability.VIEW_LESSON,
    UserCapability.SUBMIT_ACTIVITY,
    UserCapability.START_PRACTICE_SESSION,
    UserCapability.SUBMIT_PRACTICE_ATTEMPT,
    UserCapability.VIEW_PRACTICE_METRICS,
    UserCapability.JOIN_ROOM,
    UserCapability.USE_METRONOME,
    UserCapability.USE_TUNER,
    // Social community feed is restricted for child profiles unless guardian approves
  ],
  [UserRole.ADMIN]: Object.values(UserCapability),
};

/**
 * Hardcoded initial founder admin allowlist as per Doc 00 and AGENTS.md
 */
export const FOUNDER_ADMIN_EMAILS = [
  'alinealv.silv@gmail.com',
  'office.alinesilva@gmail.com',
] as const;

export function isFounderAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return FOUNDER_ADMIN_EMAILS.some((founder) => founder.toLowerCase() === normalized);
}
