import { EntityId, ISOTimestamp, CourseLevel } from './types';

export type AudienceVariant = 'TRADITIONAL' | 'KIDS';

export enum PublicationStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssessmentGradingStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

// ---------------------------------------------------------------------------
// 1. Program & Path
// ---------------------------------------------------------------------------

export interface Program {
  id: EntityId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  workloadHours: number;
  estimatedMonths: number;
  pathIds: EntityId[];
  prerequisites: string[];
  competencies: string[];
  targetAudience: string;
  certificateTitle: string;
  isPublished: boolean;
  status?: PublicationStatus;
  version?: string;
  provenanceRef: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted?: boolean;
  deletedAt?: ISOTimestamp;
}

export interface LearningPath {
  id: EntityId;
  programId: EntityId;
  order: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  courseIds: EntityId[];
  workloadHours: number;
  level: CourseLevel;
  skills: string[];
  createdAt?: ISOTimestamp;
  updatedAt?: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// 2. Course & Module
// ---------------------------------------------------------------------------

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'score' | 'audio' | 'link';
  url: string;
  sizeOrRef?: string;
}

export interface AcademyCategory {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  iconName?: string;
  color?: string;
  courseCount?: number;
  featuredCourseIds?: string[];
  skills: string[];
}

export interface AcademyCourse {
  id: EntityId;
  slug: string;
  pathId?: EntityId;
  programId?: EntityId;
  categoryId?: EntityId;
  categoryName?: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  workloadHours: number;
  authorId: EntityId;
  authorName: string;
  authorTitle: string;
  authorBio?: string;
  authorAvatarUrl?: string;
  objectives: string[];
  competencies: string[];
  skills?: string[];
  prerequisites: string[];
  materials: CourseMaterial[];
  references?: {
    title: string;
    author: string;
    year?: string;
    citation: string;
  }[];
  curriculumSummary: string;
  assessmentPolicy: string;
  certificatePolicy: string;
  certificateInfo?: {
    title: string;
    accreditation: string;
    criteria: string;
  };
  moduleIds: EntityId[];
  finalAssessmentId?: EntityId;
  isPublished: boolean;
  status?: PublicationStatus;
  version?: string;
  learningOutcomes?: string[];
  worldRef?: {
    workId: string;
    workTitle: string;
    composer: string;
    period: string;
  };
  relatedPractice?: {
    sessionId: string;
    title: string;
    instrument: string;
    type: string;
    focus: string;
    exerciseId?: string;
  };
  relatedScore?: {
    scoreId: string;
    title: string;
    composer: string;
    clef: string;
  };
  provenance: {
    source: string;
    citation: string;
    curatorNotes: string;
  };
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted?: boolean;
  deletedAt?: ISOTimestamp;
}

export interface AcademyModule {
  id: EntityId;
  courseId: EntityId;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  lessonIds: EntityId[];
  assessmentId?: EntityId;
  createdAt?: ISOTimestamp;
  updatedAt?: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// 3. Lesson (Content vs Presentation Separation)
// ---------------------------------------------------------------------------

/**
 * Blocos interativos intercalados no corpo da lição.
 *
 * MOTIVO: até aqui `LessonSection` só tinha `contentMarkdown`, e toda a
 * mídia vivia no nível da LIÇÃO — os exemplos sonoros, a pauta e as
 * ilustrações eram empilhados à parte, depois do texto. O resultado é uma
 * leitura corrida e pesada, com a demonstração longe da afirmação que ela
 * demonstra.
 *
 * Com blocos, o laboratório fica ONDE o conceito é apresentado: o parágrafo
 * que define a terça maior é seguido imediatamente pelo laboratório em que
 * o aluno ouve, compara e verifica no motor de teoria real.
 *
 * Todo bloco é servido por um motor que JÁ EXISTE no repositório
 * (`adapters/engines/`) — nenhum deles simula resultado.
 */
export type LessonBlock =
  /** Prosa acadêmica. */
  | { kind: 'MARKDOWN'; id: string; markdown: string }
  /** Destaque contextual: nota histórica, atenção, dica. */
  | { kind: 'CALLOUT'; id: string; type: 'info' | 'historical' | 'warning' | 'tip'; title: string; text: string }
  /** Exemplo sonoro sintetizado em tempo real (WebAudio). */
  | { kind: 'AUDIO_EXAMPLE'; id: string; title: string; description?: string; notes: string[]; playMode: 'SEQUENCE' | 'CHORD'; bpm?: number }
  /** Laboratório de intervalo: ouvir, comparar e analisar no motor de teoria. */
  | { kind: 'INTERVAL_LAB'; id: string; title: string; lowerNote: string; upperNote: string; prompt?: string }
  /** Laboratório de acorde: identificação de tríade e inversão. */
  | { kind: 'CHORD_LAB'; id: string; title: string; notes: string[]; prompt?: string }
  /** Laboratório de escala: geração pela fórmula T-T-st-T-T-T-st. */
  | { kind: 'SCALE_LAB'; id: string; title: string; tonic: string; mode: 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR' }
  /** Teclado tocável, com teclas em destaque. */
  | { kind: 'KEYBOARD'; id: string; title?: string; highlightNotes?: string[]; startOctave?: number; octaves?: number }
  /** Pauta canônica renderizada. */
  | { kind: 'STAFF'; id: string; title?: string; clef: 'treble' | 'bass' | 'alto'; timeSignature?: string; notes: string[]; caption?: string }
  /** Diagrama gerado programaticamente (SVG), sem dependência de imagem. */
  | { kind: 'DIAGRAM'; id: string; title: string; diagram: 'CIRCLE_OF_FIFTHS' | 'TONE_SEMITONE' | 'INTERVAL_RULER'; highlight?: string[]; caption?: string }
  /**
   * Verificação de leitura no meio do texto — não ao final.
   * Fonte natural: Bohumil Med, *Livro de Exercícios* (ADR-002).
   */
  | { kind: 'CHECKPOINT'; id: string; question: string; options: string[]; correctIndex: number; explanation: string; sourceRef?: string }
  /**
   * Sequência de lâminas navegáveis — o equivalente ao deck de slides das
   * plataformas acadêmicas. Serve para decompor um raciocínio em passos, sem
   * transformar a página numa parede de texto.
   */
  | { kind: 'SLIDES'; id: string; title: string; slides: Array<{ heading: string; body: string; note?: string }> }
  /**
   * Marcador discreto de aula em vídeo.
   *
   * A plataforma ainda não hospeda vídeo (ADR-004: mídia vive no Drive do
   * autor, e aula institucional em vídeo é plano futuro). Em vez de omitir o
   * ponto ou — pior — fingir um player, registramos com sobriedade onde a
   * aula gravada entrará. Deve ser visualmente discreto: uma linha, nunca um
   * card grande que sugira conteúdo ausente.
   */
  | { kind: 'VIDEO_PLACEHOLDER'; id: string; topic: string };

export interface LessonSection {
  id: string;
  title: string;
  /**
   * @deprecated Preferir `blocks`. Mantido para não quebrar as lições já
   * semeadas: quando `blocks` está ausente, o leitor renderiza este campo
   * como um único bloco MARKDOWN.
   */
  contentMarkdown: string;
  callout?: {
    type: 'info' | 'historical' | 'warning' | 'tip';
    title: string;
    text: string;
  };
  /** Sequência interativa da seção. Quando presente, prevalece. */
  blocks?: LessonBlock[];
}

export interface AudioSample {
  id: string;
  title: string;
  description: string;
  notes: string[];
  frequenciesHz: number[];
  durationSeconds: number;
}

export interface ScoreSnippet {
  id: string;
  title: string;
  clef: 'treble' | 'bass' | 'alto';
  keySignature: string;
  timeSignature: string;
  notesDisplay: string;
  svgNotes?: string;
  caption?: string;
}

export interface MediaIllustration {
  id: string;
  title: string;
  altText: string;
  historicalContext: string;
  caption: string;
  imageUrl?: string;
}

export interface LessonPresentationContent {
  title: string;
  summary: string;
  introduction: string;
  sections: LessonSection[];
  video?: {
    title: string;
    durationMinutes: number;
    description: string;
    transcript: string;
  };
  audioSamples: AudioSample[];
  scoreSnippet?: ScoreSnippet;
  illustrations: MediaIllustration[];
  references: {
    title: string;
    author: string;
    chapterOrLecture: string;
    sourceType: 'book' | 'lecture' | 'open_courseware';
  }[];
}

export interface AcademyLesson {
  id: EntityId;
  moduleId: EntityId;
  courseId: EntityId;
  order: number;
  canonicalContentId: string;
  durationMinutes: number;
  objectives: string[];
  skills: string[];
  provenanceRef: string;
  activityIds: EntityId[];
  variants: Record<AudienceVariant, LessonPresentationContent>;
  status?: PublicationStatus;
  version?: string;
  createdAt?: ISOTimestamp;
  updatedAt?: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// 4. Activity
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'multiple_choice'
  | 'interval_identification'
  | 'scale_degree'
  | 'cadence_analysis'
  | 'rhythm_pattern'
  | 'ear_training';

export interface ActivityOption {
  id: string;
  label: string;
  text?: string;
  explanation: string;
}

export interface ActivityPresentationContent {
  instruction: string;
  contextPrompt: string;
  question: string;
  options: ActivityOption[];
  interactiveNotation?: {
    clef: string;
    notes: string;
    hint?: string;
  };
  audioPrompt?: {
    notes: string[];
    frequenciesHz: number[];
  };
  feedbackCorrect: string;
  feedbackIncorrect: string;
  hints: string[];
}

export interface AcademyActivity {
  id: EntityId;
  lessonId: EntityId;
  courseId: EntityId;
  canonicalId: string;
  type: ActivityType;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  skills: string[];
  correctAnswer: string;
  maxScore?: number;
  validationRule?: { expectedOptionId?: string } | string;
  variants: Record<AudienceVariant, ActivityPresentationContent>;
  createdAt?: ISOTimestamp;
  updatedAt?: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// 5. Assessment
// ---------------------------------------------------------------------------

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  skill: string;
  options: { id: string; label: string; text?: string }[];
  correctOptionId: string;
  explanation: string;
  points?: number;
}

export interface AcademyAssessment {
  id: EntityId;
  courseId: EntityId;
  moduleId?: EntityId;
  title: string;
  description: string;
  passingScorePercentage: number;
  competenciesTested: string[];
  timeLimitMinutes?: number;
  questions: AssessmentQuestion[];
  version?: string;
  createdAt?: ISOTimestamp;
  updatedAt?: ISOTimestamp;
}

export interface AcademyQuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  skill: string;
}

export interface AcademyQuiz {
  id: EntityId;
  courseId: EntityId;
  moduleId?: EntityId;
  lessonId?: EntityId;
  title: string;
  description: string;
  estimatedMinutes: number;
  passingScorePercentage: number;
  questions: AcademyQuizQuestion[];
}

// ---------------------------------------------------------------------------
// 6. Attempts, Results & User Progress
// ---------------------------------------------------------------------------

export interface ActivityAttempt {
  id: EntityId;
  activityId: EntityId;
  userId: EntityId;
  courseId: EntityId;
  lessonId: EntityId;
  attemptNumber: number;
  givenAnswer: string;
  isCorrect: boolean;
  score: number;
  skillsEvaluated: string[];
  feedback: string;
  timestamp: ISOTimestamp;
  passed?: boolean;
  scoreEarned?: number;
  evidenceId?: string;
}

export interface ActivityAttemptResult {
  attempt: ActivityAttempt;
  isCorrect: boolean;
  feedback: string;
  progress: UserAcademyProgress;
  evidenceId?: string;
  passed?: boolean;
  scoreEarned?: number;
}


export interface AssessmentSubmission {
  id: EntityId;
  assessmentId: EntityId;
  courseId: EntityId;
  userId: EntityId;
  attemptNumber: number;
  answers: Record<string, string>;
  scorePercentage: number;
  passed: boolean;
  competenciesScore: Record<string, number>;
  detailedFeedback: {
    questionId: string;
    prompt: string;
    givenOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    skill: string;
    explanation: string;
  }[];
  timestamp: ISOTimestamp;
  percentageScore?: number;
  scoreEarned?: number;
  maxScore?: number;
  certificateId?: string;
}

export type AssessmentAttempt = AssessmentSubmission;

export interface UserAcademyProgress {
  userId: EntityId;
  courseId: EntityId;
  enrolledAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  completedLessonIds: EntityId[];
  completedActivityIds: EntityId[];
  passedAssessmentIds: EntityId[];
  lastAccessedLessonId?: EntityId;
  progressPercentage: number;
  studyTimeMinutes: number;
  updatedAt?: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// 7. Certificate & Academic History
// ---------------------------------------------------------------------------

export interface AcademicCertificateRecord {
  id: EntityId;
  userId: EntityId;
  studentName: string;
  userName?: string;
  courseId: EntityId;
  courseTitle: string;
  programTitle?: string;
  workloadHours: number;
  level?: string;
  scorePercentage?: number;
  verificationCode: string;
  sha256Hash: string;
  cryptographicHash?: string;
  issuedAt: ISOTimestamp;
  instructorName: string;
  instructorTitle: string;
  competencies: string[];
  institution: string;
  status?: 'ISSUED' | 'REVOKED';
  revokedAt?: ISOTimestamp;
  revocationReason?: string;
}

export type AcademyCertificate = AcademicCertificateRecord;

export interface AcademicHistoryEntry {
  id: EntityId;
  userId: EntityId;
  type:
    | 'course_enrolled'
    | 'lesson_completed'
    | 'activity_attempt'
    | 'assessment_submitted'
    | 'course_completed'
    | 'certificate_issued';
  contentId: string;
  contentTitle: string;
  contentVersion: string;
  score?: number;
  skills: string[];
  details: string;
  timestamp: ISOTimestamp;
  auditEventId?: string;
}

export type AuditEntry = AcademicHistoryEntry;
