import { EntityId, ISOTimestamp } from './types';

/**
 * TEACHER DOMAIN
 * Pedagogical chairs, teacher-owned rooms, assignments, masterclasses, and student oversight.
 */

export enum AssignmentSubmissionFormat {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  SCORE = 'SCORE',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
}

export enum AssignmentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  GRADED = 'GRADED',
}

export interface TeacherProfile {
  id: EntityId;
  userId: EntityId;
  academicTitle: string; // e.g. "Prof. Dr.", "Mestre em Cravo Histórico"
  institutionalAffiliation?: string;
  bioFormal: string;
  pedagogicalLineage: string; // e.g. "Herdeiro da tradição de Claudio Arrau"
  officeHours: string;
  publishedWorks: string[];
  cvLattesUrl?: string;
  isVerifiedTeacher: boolean;
  verifiedAt?: ISOTimestamp;
  totalStudentsTaught: number;
  activeRoomsCount: number;
  updatedAt: ISOTimestamp;
}

/**
 * Modalidade pedagógica da sala.
 *
 * A turma infantil é uma modalidade à parte porque o que vale nela é
 * diferente: exige supervisão e herda as restrições do modo Kids.
 */
export type ModalidadeDeSala =
  | 'CLASSE_REGULAR'
  | 'MASTERCLASS'
  | 'LABORATORIO'
  | 'TURMA_INFANTIL';

export interface TeacherRoomDetail {
  id: EntityId;
  teacherId: EntityId;
  teacherName: string;
  name: string;
  slug: string;
  modalidade: ModalidadeDeSala;
  /** Teto de alunos. A matrícula pára aqui, senão a sala deixa de ser turma. */
  capacidade: number;
  description: string;
  bannerUrl?: string;
  welcomeMessage: string;
  syllabusDocumentUrl?: string;
  announcements: {
    id: string;
    title: string;
    body: string;
    publishedAt: ISOTimestamp;
    pinned: boolean;
  }[];
  nextSessionDate?: ISOTimestamp;
  activeAssignmentCount: number;
  studentCount: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface AcademicClass {
  id: EntityId;
  teacherRoomId: EntityId;
  name: string;
  academicTerm: string; // e.g. "2026.2"
  scheduleDescription: string;
  studentIds: EntityId[];
  syllabusOverview: string;
  createdAt: ISOTimestamp;
}

export interface StudentRoomMembership {
  id: EntityId;
  classId?: EntityId;
  teacherRoomId: EntityId;
  studentId: EntityId;
  studentName: string;
  enrolledAt: ISOTimestamp;
  attendanceRate: number; // 0..100
  currentGradeAverage?: number;
  teacherPrivateNotes?: string;
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED';
}

export interface AssignmentRubricCriterion {
  id: string;
  title: string;
  maxPoints: number;
  description: string;
}

export interface RoomAssignment {
  id: EntityId;
  teacherRoomId: EntityId;
  title: string;
  instructionsMarkdown: string;
  dueDate: ISOTimestamp;
  targetRepertoireId?: EntityId;
  requiredFormat: AssignmentSubmissionFormat;
  maxPoints: number;
  rubric: AssignmentRubricCriterion[];
  status: AssignmentStatus;
  createdAt: ISOTimestamp;
}

export interface AssignmentSubmissionRecord {
  id: EntityId;
  assignmentId: EntityId;
  studentId: EntityId;
  studentName: string;
  submittedAt: ISOTimestamp;
  evidenceId: EntityId;
  submissionFormat: AssignmentSubmissionFormat;
  submissionUrl: string;
  studentComment?: string;
  gradePoints?: number;
  teacherFeedback?: string;
  gradedByTeacherId?: EntityId;
  gradedAt?: ISOTimestamp;
}

export interface TeachingMaterial {
  id: EntityId;
  teacherRoomId: EntityId;
  title: string;
  type: 'PDF_SCORE' | 'AUDIO_GUIDE' | 'ANALYSIS_DOC' | 'VIDEO_LECTURE';
  fileUrl: string;
  sizeBytes: number;
  description?: string;
  uploadedAt: ISOTimestamp;
}

export interface RoomLiveClass {
  id: EntityId;
  teacherRoomId: EntityId;
  title: string;
  agenda: string;
  liveMeetingUrl?: string;
  recordingUrl?: string;
  startAt: ISOTimestamp;
  endAt: ISOTimestamp;
  attendedUserIds: EntityId[];
  status: 'UPCOMING' | 'LIVE' | 'RECORDED' | 'CANCELLED';
}

export interface RoomCourseAttachment {
  id: EntityId;
  teacherRoomId: EntityId;
  courseId: EntityId;
  customSyllabusAddendum?: string;
  isMandatory: boolean;
  passingGradeOverride?: number;
  attachedAt: ISOTimestamp;
}

export interface RoomLessonPlan {
  id: EntityId;
  roomCourseId: EntityId;
  lessonId: EntityId;
  teacherNotes: string;
  supplementaryMaterialIds: EntityId[];
  assignedWeekNumber: number;
}

export interface RoomExerciseAssignment {
  id: EntityId;
  teacherRoomId: EntityId;
  exerciseId: EntityId;
  assignedDate: ISOTimestamp;
  dueDate?: ISOTimestamp;
  targetAccuracyPercentage: number;
  minimumPassAttempts: number;
}
