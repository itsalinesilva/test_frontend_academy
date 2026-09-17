/**
 * Domain Types - Academia Musical Digital
 * Canonical Domain Model definitions based on docs 00, 04, 32, 63
 */

export type EntityId = string;
export type ISOTimestamp = string;

export enum UserRole {
  ALUNO = 'ALUNO',
  MUSICO = 'MUSICO',
  PROFESSOR = 'PROFESSOR',
  CRIANCA = 'CRIANCA',
  ADMIN = 'ADMIN',
}

export enum AppMode {
  TRADITIONAL = 'traditional',
  KIDS = 'kids',
}

export enum UserCapability {
  // Identity & Profile
  VIEW_OWN_PROFILE = 'identity.profile.view_own',
  EDIT_OWN_PROFILE = 'identity.profile.edit_own',
  VIEW_PUBLIC_PROFILE = 'identity.profile.view_public',
  
  // Learning & Academy
  ENROLL_COURSE = 'academy.course.enroll',
  VIEW_LESSON = 'academy.lesson.view',
  SUBMIT_ACTIVITY = 'academy.activity.submit',
  VIEW_CERTIFICATE = 'academy.certificate.view',
  CREATE_COURSE = 'academy.course.create',
  PUBLISH_COURSE = 'academy.course.publish',

  // Practice & Skill Builder
  START_PRACTICE_SESSION = 'practice.session.start',
  SUBMIT_PRACTICE_ATTEMPT = 'practice.attempt.submit',
  VIEW_PRACTICE_METRICS = 'practice.metrics.view',

  // Rooms & Teaching
  JOIN_ROOM = 'room.membership.join',
  CREATE_ROOM = 'room.management.create',
  ASSIGN_EXERCISE = 'room.assignment.create',
  GRADE_SUBMISSION = 'room.submission.grade',

  // Community & Social
  VIEW_COMMUNITY_FEED = 'community.feed.view',
  CREATE_COMMUNITY_POST = 'community.post.create',
  REPORT_CONTENT = 'community.moderation.report',
  MODERATE_CONTENT = 'community.moderation.moderate',

  // Tools & Engines
  USE_METRONOME = 'tool.metronome.use',
  USE_TUNER = 'tool.tuner.use',
  USE_SCORE_EDITOR = 'tool.score.edit',
  USE_DAW_STUDIO = 'tool.daw.use',

  // Administration & Governance
  ACCESS_ADMIN_CONSOLE = 'admin.console.access',
  MANAGE_USERS = 'admin.users.manage',
  MANAGE_ROLES = 'admin.roles.manage',
  VIEW_AUDIT_LOGS = 'admin.audit.view',
  MANAGE_FEATURE_FLAGS = 'admin.flags.manage',
  INSPECT_ENGINE_HEALTH = 'admin.engines.inspect',
}

export interface User {
  id: EntityId;
  email: string;
  name: string;
  avatarUrl?: string;
  primaryRole: UserRole;
  assignedRoles: UserRole[];
  isEmailVerified: boolean;
  authProvider?: 'google';
  /**
   * `sub` do Google — identidade estável e imutável, chave canônica do
   * usuário. Sobrevive à troca de e-mail da conta.
   */
  googleSubject?: string;
  linkedAccounts?: Array<{
    provider: 'google';
    email: string;
    linkedAt: ISOTimestamp;
  }>;
  guardianId?: EntityId;
  isFounderAdmin?: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface GuardianRelationship {
  guardianEmail: string;
  guardianName?: string;
  guardianPhone?: string;
  relationship?: string;
  parentalConsentGiven: boolean;
  consentTimestamp?: ISOTimestamp;
}

export interface ChildAccountControls {
  isKidModeActive: boolean;
  maxDailyScreenMinutes?: number;
  restrictedChat: boolean;
  contentFilterLevel: 'strict' | 'standard';
}

export interface ProfilePrivacySettings {
  visibility: 'public' | 'institutional' | 'private';
  showAcademicHistory: boolean;
  showPracticeLog: boolean;
  showPortfolio: boolean;
  allowCommunityInteraction: boolean;
}

export interface Profile {
  userId: EntityId;
  displayName: string;
  title?: string;
  biography: string;
  headline?: string;
  avatarSource?: 'google' | 'custom' | 'initials';
  avatarUrl?: string;
  mode?: AppMode;
  instruments: string[];
  musicalInterests: string[];
  goals?: string[];
  experienceLevel?: 'iniciante' | 'intermediario' | 'avancado' | 'conservatorio';
  preferences?: {
    tuningStandard?: '440hz' | '432hz';
    notationSystem?: 'syllabic' | 'alphabetical';
    preferredClef?: 'g_treble' | 'f_bass' | 'c_alto';
    notificationsEnabled?: boolean;
  };
  isPublic: boolean;
  privacySettings?: ProfilePrivacySettings;
  guardian?: GuardianRelationship;
  childControls?: ChildAccountControls;
  onboardingCompleted?: boolean;
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
  updatedAt: ISOTimestamp;
}

export enum CourseLevel {
  FUNDAMENTAL = 'FUNDAMENTAL',
  INTERMEDIARIO = 'INTERMEDIARIO',
  AVANCADO = 'AVANCADO',
  MESTRADO = 'MESTRADO',
}

export interface Course {
  id: EntityId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  workloadHours: number;
  authorId: EntityId;
  authorName: string;
  modulesCount: number;
  lessonsCount: number;
  isPublished: boolean;
  provenance: {
    source: string;
    citation: string;
    curatorNotes: string;
  };
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface CourseModule {
  id: EntityId;
  courseId: EntityId;
  order: number;
  title: string;
  description: string;
  lessonsCount: number;
}

export interface Lesson {
  id: EntityId;
  moduleId: EntityId;
  courseId: EntityId;
  order: number;
  title: string;
  summary: string;
  contentMarkdown: string;
  durationMinutes: number;
  provenanceRef?: string;
}

export interface UserCourseProgress {
  userId: EntityId;
  courseId: EntityId;
  enrolledAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  completedLessonIds: EntityId[];
  lastAccessedLessonId?: EntityId;
  progressPercentage: number;
}

