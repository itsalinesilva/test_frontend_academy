import { EntityId, ISOTimestamp, UserRole } from './types';

export type VisibilityLevel = 'public' | 'connections' | 'room_members' | 'private';

export type ProfileSectionKey =
  | 'home'
  | 'about'
  | 'activity'
  | 'experience'
  | 'skills'
  | 'education'
  | 'achievements'
  | 'credentials'
  | 'portfolio'
  | 'projects'
  | 'recordings'
  | 'scores'
  | 'practice'
  | 'learning_history'
  | 'passports'
  | 'badges'
  | 'community'
  | 'rooms'
  | 'events'
  // Legacy compatibility keys
  | 'academic'
  | 'studio'
  | 'worlds'
  | 'teacher';

export interface ProfileSectionConfig {
  key: ProfileSectionKey;
  label: string;
  enabled: boolean;
  visibility: VisibilityLevel;
  order: number;
}

export type OfficialLinkType =
  | 'website'
  | 'lattes'
  | 'orcid'
  | 'youtube'
  | 'spotify'
  | 'github'
  | 'other';

export interface ProfileOfficialLink {
  id: EntityId;
  type: OfficialLinkType;
  label: string;
  url: string;
  isPublic: boolean;
}

// ---------------------------------------------------------
// Evidence Domain (Docs 08 & 30)
// ---------------------------------------------------------
export type EvidenceSource =
  | 'academy'
  | 'practice'
  | 'studio'
  | 'rooms'
  | 'community'
  | 'manual';

export type ArtifactType =
  | 'audio'
  | 'video'
  | 'score'
  | 'midi'
  | 'project'
  | 'image'
  | 'document'
  | 'external_url';

export interface Evidence {
  id: EntityId;
  userId: EntityId;
  source: EvidenceSource;
  sourceEntityId: EntityId;
  title: string;
  description: string;
  artifactType: ArtifactType;
  artifactUrl: string;
  sha256Hash: string;
  evaluator?: {
    id: EntityId;
    name: string;
    title: string;
    decision: 'aprovado' | 'aprovado_com_louvor' | 'revisar';
    feedbackNotes?: string;
  };
  skills: string[];
  instruments: string[];
  metadata: Record<string, any>;
  visibility: VisibilityLevel;
  createdAt: ISOTimestamp;
}

// ---------------------------------------------------------
// Portfolio Item Domain (Doc 08)
// ---------------------------------------------------------
export type PortfolioItemCategory =
  | 'musica'
  | 'gravacao'
  | 'video'
  | 'partitura'
  | 'projeto'
  | 'composicao'
  | 'producao';

export interface PortfolioItem {
  id: EntityId;
  userId: EntityId;
  title: string;
  category: PortfolioItemCategory;
  context: string;
  objective: string;
  userRoleInProject: string; // e.g. "Compositor e Intérprete ao Piano", "Violinista Solo", "Arranjador"
  skills: string[];
  instruments: string[];
  workReferences?: string; // e.g. "J.S. Bach - BWV 1001"
  processNotes?: string;
  resultSummary?: string;
  evidenceIds: EntityId[];
  artifactUrl?: string;
  audioPreviewUrl?: string;
  scorePreviewSnippet?: string;
  visibility: VisibilityLevel;
  version: string;
  isFeatured: boolean;
  orderIndex: number;
  publishedAt: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ---------------------------------------------------------
// Academic Lens Data
// ---------------------------------------------------------
export interface AcademicCompetency {
  id: EntityId;
  name: string;
  domain: 'harmonia' | 'contraponto' | 'analise' | 'percepcao' | 'acustica' | 'historia';
  level: 'iniciante' | 'intermediario' | 'avancado' | 'mestre';
  evaluatedScore: number; // 0 - 100
  verifiedBy: string;
}

export interface AcademicCertificate {
  id: EntityId;
  courseTitle: string;
  issueDate: ISOTimestamp;
  workloadHours: number;
  digitalSignatureHash: string;
  institution: string;
  status: 'valido' | 'revogado';
  downloadUrl?: string;
}

export interface AcademicPathProgress {
  pathId: EntityId;
  title: string;
  totalModules: number;
  completedModules: number;
  percentage: number;
  status: 'em_andamento' | 'concluida';
}

export interface AcademicLensData {
  enrolledCourses: {
    id: EntityId;
    title: string;
    instructor: string;
    progressPercentage: number;
    hoursStudied: number;
    status: 'em_andamento' | 'concluido';
  }[];
  learningPaths: AcademicPathProgress[];
  certificates: AcademicCertificate[];
  competencies: AcademicCompetency[];
  totalStudyHours: number;
}

// ---------------------------------------------------------
// Practice Lens Data
// ---------------------------------------------------------
export interface PracticeSkill {
  id: EntityId;
  name: string;
  /** Opcional: o domínio medido (MasteryRecord) não traz categoria, e inventar uma seria o defeito de AUD-7. */
  category?: 'ritmo' | 'afinacao' | 'tecnica_arco' | 'polifonia' | 'leitura_primeira_vista';
  currentLevel: number; // 1 - 5, a escala do MasteryRecord
  accuracyRate: number; // percentage
  totalAttempts?: number;
  weeklyMinutes?: number;
}

export interface RepertoireItem {
  id: EntityId;
  workTitle: string;
  composer: string;
  instrument: string;
  status: 'em_estudo' | 'polido' | 'gravado' | 'apresentado';
  recordedEvidenceId?: EntityId;
  lastPracticedAt: ISOTimestamp;
}

export interface PracticeAchievement {
  id: EntityId;
  title: string;
  description: string;
  badgeIcon: string;
  unlockedAt: ISOTimestamp;
}

export interface PracticeLensData {
  skills: PracticeSkill[];
  repertoire: RepertoireItem[];
  achievements: PracticeAchievement[];
  totalPracticeSessions: number;
  currentStreakDays: number;
  longestStreakDays: number;
  recentExercises: {
    id: EntityId;
    title: string;
    toolUsed: string;
    accuracyScore: number;
    completedAt: ISOTimestamp;
  }[];
}

// ---------------------------------------------------------
// Worlds & Credentials Lens Data (Doc 03)
// ---------------------------------------------------------
export interface WorldPassport {
  id: EntityId;
  worldName: string; // e.g. "Mundo Barroco", "Mundo Clássico", "Mundo Romântico"
  era: string;
  stampsCount: number;
  masteryPercentage: number;
  unlockedAt: ISOTimestamp;
}

export interface Microcredential {
  id: EntityId;
  title: string;
  issuer: string;
  verificationHash: string;
  issuedAt: ISOTimestamp;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface WorldsLensData {
  passports: WorldPassport[];
  badges: {
    id: EntityId;
    name: string;
    category: string;
    icon: string;
    unlockedAt: ISOTimestamp;
  }[];
  microcredentials: Microcredential[];
  institutionalRankContext?: {
    academicTier: string;
    peerGroupPercentile: number;
  };
}

// ---------------------------------------------------------
// Community Lens Data
// ---------------------------------------------------------
export interface CommunityLensData {
  posts: {
    id: EntityId;
    title: string;
    summary: string;
    publishedAt: ISOTimestamp;
    upvotes: number;
    commentsCount: number;
  }[];
  forumParticipations: {
    topicId: EntityId;
    topicTitle: string;
    category: string;
    repliesCount: number;
    isAcceptedAnswer: boolean;
  }[];
  eventsAttended: {
    id: EntityId;
    title: string;
    date: ISOTimestamp;
    role: 'ouvinte' | 'palestrante' | 'performer';
  }[];
  connectionsCount: number;
}

// ---------------------------------------------------------
// Rooms Lens Data (Student vs Teacher)
// ---------------------------------------------------------
export interface RoomParticipation {
  roomId: EntityId;
  roomName: string;
  teacherName: string;
  role: 'aluno' | 'ouvinte';
  coursesCount: number;
  lessonsCount: number;
  assignmentsSubmitted: number;
  nextEvent?: {
    title: string;
    date: ISOTimestamp;
  };
}

export interface TeacherRoomProfile {
  ownRoomId: EntityId;
  roomName: string;
  tagline: string;
  heroImageUrl?: string;
  description: string;
  enrolledStudentsCount: number;
  coursesOffered: {
    id: EntityId;
    title: string;
    level: string;
    enrolledCount: number;
  }[];
  upcomingClassesAndEvents: {
    id: EntityId;
    title: string;
    date: ISOTimestamp;
    type: 'aula_ao_vivo' | 'masterclass' | 'audicao';
  }[];
  guidedProjects: {
    id: EntityId;
    title: string;
    studentName: string;
    status: 'em_andamento' | 'concluido';
  }[];
  teacherAnnouncements: {
    id: EntityId;
    title: string;
    date: ISOTimestamp;
    content: string;
  }[];
  exposeStudentCount: boolean;
  exposeUpcomingLives: boolean;
  exposeGuidedProjects: boolean;
}

export interface RoomsLensData {
  attendedRooms: RoomParticipation[];
  teacherProfile?: TeacherRoomProfile;
}

// ---------------------------------------------------------
// Modern Professional Dimension Entities
// ---------------------------------------------------------
export interface ProfileExperienceItem {
  id: EntityId;
  role: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  category: 'performance' | 'docencia' | 'orquestra' | 'pesquisa' | 'producao';
}

export interface ProfileEducationItem {
  id: EntityId;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  thesisOrProjectTitle?: string;
  advisor?: string;
  honors?: string;
}

export interface ProfileAchievementItem {
  id: EntityId;
  title: string;
  issuer: string;
  year: number;
  category: 'premio' | 'concurso' | 'bolsa' | 'publicacao' | 'distincao';
  description: string;
  verificationUrl?: string;
}

/**
 * Recital, masterclass, conferência — o que o músico apresentou em público.
 *
 * Este tipo nasceu porque a aba de eventos do perfil trazia três apresentações
 * FIXAS no código: um recital de cravo, um simpósio na USP e um concerto no
 * Theatro Municipal. Todo perfil da plataforma exibia essa carreira, incluindo
 * o de quem tinha acabado de criar a conta.
 *
 * Agora a aba lê daqui. Quem não apresentou nada ainda vê que não apresentou
 * nada — que é a informação certa, e a que deixa o registro dele valer alguma
 * coisa quando existir.
 */
export interface ProfileEventItem {
  id: EntityId;
  title: string;
  /** Recital, masterclass, conferência, concerto de câmara. */
  kind: string;
  /** Papel exercido: solista, continuísta, palestrante, regente. */
  role: string;
  /** Data em ISO, para poder ordenar e comparar com hoje. */
  date: ISOTimestamp;
  venue: string;
  description: string;
  /** Programa, gravação ou página do evento. */
  referenceUrl?: string;
}

export interface ProfileRecordingItem {
  id: EntityId;
  title: string;
  workReference: string;
  composer: string;
  duration: string;
  audioUrl?: string;
  waveformSnippet?: number[];
  recordingDate: string;
  acousticSpace: string;
  instrumentUsed: string;
  visibility: VisibilityLevel;
}

export interface ProfileScoreItem {
  id: EntityId;
  title: string;
  workReference: string;
  composer: string;
  type: 'edicao_critica' | 'arranjo' | 'composicao_original' | 'transcricao';
  keySignature: string;
  timeSignature: string;
  pagesCount: number;
  previewUrl?: string;
  clefs: string[];
  visibility: VisibilityLevel;
  publishedAt: string;
}

export interface ProfileProjectItem {
  id: EntityId;
  title: string;
  subtitle: string;
  status: 'em_andamento' | 'concluido' | 'planejamento';
  role: string;
  collaborators: string[];
  description: string;
  startDate: string;
  endDate?: string;
  externalLink?: string;
}

export interface ProfileConnectionItem {
  id: EntityId;
  targetUserId: EntityId;
  name: string;
  headline: string;
  avatarUrl?: string;
  primaryInstrument: string;
  role: string;
  connectedAt: string;
  status: 'connected' | 'pending';
}

// ---------------------------------------------------------
// Aggregated Full Profile Projection
// ---------------------------------------------------------
export interface UnifiedProfileRecord {
  userId: EntityId;
  displayName: string;
  title: string;
  headline: string;
  biography: string;
  avatarUrl?: string;
  avatarSource: 'google' | 'custom' | 'initials';
  primaryRole: UserRole;
  assignedRoles: UserRole[];
  instruments: string[];
  musicalInterests: string[];
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado' | 'conservatorio';
  officialLinks: ProfileOfficialLink[];
  overallVisibility: VisibilityLevel;
  sectionsConfig: ProfileSectionConfig[];

  // Header attributes
  specialties?: string[];
  location?: string;
  currentStatus?: string;
  capabilities?: string[];

  // Modern Professional Profile Dimensions
  experiences?: ProfileExperienceItem[];
  educationList?: ProfileEducationItem[];
  achievementsList?: ProfileAchievementItem[];
  recordingsList?: ProfileRecordingItem[];
  scoresList?: ProfileScoreItem[];
  projectsList?: ProfileProjectItem[];
  eventsList?: ProfileEventItem[];
  connectionsList?: ProfileConnectionItem[];

  // Lenses
  academic: AcademicLensData;
  practice: PracticeLensData;
  portfolio: PortfolioItem[];
  evidences: Evidence[];
  worlds: WorldsLensData;
  community: CommunityLensData;
  rooms: RoomsLensData;

  updatedAt: ISOTimestamp;
}
