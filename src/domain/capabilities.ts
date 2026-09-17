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
/**
 * A allowlist de administradores NÃO vive mais aqui.
 *
 * CLAUDE_AUDIT.md S-02: `FOUNDER_ADMIN_EMAILS` e `isFounderAdminEmail()`
 * estavam neste arquivo, dentro de `src/`, e portanto iam para o bundle do
 * navegador — verificado no artefato compilado. Qualquer visitante lia os
 * e-mails da fundadora, e qualquer código de cliente podia decidir "isto é
 * um admin" sozinho.
 *
 * Agora a relação vive em `ADMIN_ALLOWLIST`, variável de ambiente lida
 * apenas por `server/core/admin-authority.ts`. O cliente descobre o
 * privilégio exclusivamente pelo campo `isAdmin` da sessão assinada, e o
 * papel ADMIN em `User.assignedRoles` só é atribuído — ou revogado — a
 * partir dessa resposta do servidor.
 */
