import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import {
  Program,
  LearningPath,
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyActivity,
  AcademyAssessment,
  AcademyCategory,
  AcademyQuiz,
  UserAcademyProgress,
  ActivityAttempt,
  AssessmentSubmission,
  AcademicCertificateRecord,
  AcademicHistoryEntry,
} from '../domain/academy';
import { aplicarEdicoes, aplicarEdicoesEmLote, EdicaoEditorial } from '../domain/edicao-editorial';
import {
  SEED_CATEGORIES,
  SEED_PROGRAMS,
  SEED_PATHS,
  SEED_COURSES,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ACTIVITIES,
  SEED_ASSESSMENTS,
  SEED_QUIZZES,
} from '../data/seed-academy-content';

export interface AcademyRepository {
  // Categories
  listCategories(): Promise<AcademyCategory[]>;
  findCategoryById(id: string): Promise<AcademyCategory | null>;

  // Programs & Paths
  listPrograms(): Promise<Program[]>;
  findProgramById(id: string): Promise<Program | null>;
  listPaths(): Promise<LearningPath[]>;
  findPathById(id: string): Promise<LearningPath | null>;

  // Courses & Modules
  listCourses(): Promise<AcademyCourse[]>;
  findCourseById(id: string): Promise<AcademyCourse | null>;
  findCourseBySlug(slug: string): Promise<AcademyCourse | null>;
  listModulesByCourse(courseId: string): Promise<AcademyModule[]>;
  findModuleById(id: string): Promise<AcademyModule | null>;

  // Lessons
  listLessons(): Promise<AcademyLesson[]>;
  listLessonsByModule(moduleId: string): Promise<AcademyLesson[]>;
  listLessonsByCourse(courseId: string): Promise<AcademyLesson[]>;
  findLessonById(id: string): Promise<AcademyLesson | null>;

  // Activities, Quizzes & Assessments
  listActivitiesByLesson(lessonId: string): Promise<AcademyActivity[]>;
  findActivityById(id: string): Promise<AcademyActivity | null>;
  listQuizzesByCourse(courseId: string): Promise<AcademyQuiz[]>;
  findQuizById(id: string): Promise<AcademyQuiz | null>;
  findAssessmentById(id: string): Promise<AcademyAssessment | null>;
  findAssessmentByCourseId(courseId: string): Promise<AcademyAssessment | null>;

  // User Progress
  getProgress(userId: string, courseId: string): Promise<UserAcademyProgress | null>;
  listUserProgress(userId: string): Promise<UserAcademyProgress[]>;
  saveProgress(progress: UserAcademyProgress): Promise<UserAcademyProgress>;

  // Activity Attempts
  saveActivityAttempt(attempt: ActivityAttempt): Promise<ActivityAttempt>;
  listActivityAttempts(userId: string, activityId?: string): Promise<ActivityAttempt[]>;

  // Assessment Submissions
  saveAssessmentSubmission(submission: AssessmentSubmission): Promise<AssessmentSubmission>;
  getAssessmentSubmission(id: string): Promise<AssessmentSubmission | null>;
  listAssessmentSubmissions(userId: string, assessmentId?: string): Promise<AssessmentSubmission[]>;

  // Certificates
  saveCertificate(cert: AcademicCertificateRecord): Promise<AcademicCertificateRecord>;
  findCertificateById(id: string): Promise<AcademicCertificateRecord | null>;
  listCertificatesByUser(userId: string): Promise<AcademicCertificateRecord[]>;

  // Academic History
  logHistoryEntry(entry: AcademicHistoryEntry): Promise<AcademicHistoryEntry>;
  listHistoryByUser(userId: string): Promise<AcademicHistoryEntry[]>;
}

export class PersistentAcademyRepository implements AcademyRepository {
  private storage: LocalStorageAdapter;

  private readonly STORAGE_KEYS = {
    CATEGORIES: 'amd_academy_categories_v1',
    PROGRAMS: 'amd_academy_programs_v1',
    PATHS: 'amd_academy_paths_v1',
    COURSES: 'amd_academy_courses_v1',
    MODULES: 'amd_academy_modules_v1',
    LESSONS: 'amd_academy_lessons_v1',
    ACTIVITIES: 'amd_academy_activities_v1',
    QUIZZES: 'amd_academy_quizzes_v1',
    ASSESSMENTS: 'amd_academy_assessments_v1',
    PROGRESS: 'amd_academy_user_progress_v1',
    ATTEMPTS: 'amd_academy_activity_attempts_v1',
    SUBMISSIONS: 'amd_academy_assessment_submissions_v1',
    CERTIFICATES: 'amd_academy_certificates_v1',
    HISTORY: 'amd_academy_history_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
    this.initializeSeedData();
  }

  /**
   * Versão do catálogo publicado.
   *
   * POR QUE ISTO EXISTE
   * -------------------
   * O catálogo era gravado no localStorage apenas quando a chave não existia.
   * Consequência: quem já tinha aberto a plataforma continuava vendo o
   * catálogo antigo para sempre — inclusive três cursos fabricados que foram
   * apagados do código e permaneceram na tela, porque a chave já estava lá.
   *
   * Agora o catálogo carrega uma versão. Quando ela muda, o conteúdo
   * publicado é reescrito por cima do que estava gravado.
   *
   * Incrementar ao alterar cursos, módulos, lições, programas ou categorias.
   */
  private static readonly VERSAO_DO_CATALOGO = 5;

  private readonly CHAVE_DA_VERSAO = 'amd_academy_catalog_version';

  /**
   * Chaves de CONTEÚDO — o que o Conservatório publica. São reescritas a cada
   * versão nova. As chaves de PROGRESSO, TENTATIVAS, SUBMISSÕES, CERTIFICADOS
   * e HISTÓRICO nunca aparecem aqui: são do aluno, e nenhuma publicação de
   * conteúdo pode apagá-las.
   */
  private conteudoPublicado(): [string, unknown][] {
    return [
      [this.STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES],
      [this.STORAGE_KEYS.PROGRAMS, SEED_PROGRAMS],
      [this.STORAGE_KEYS.PATHS, SEED_PATHS],
      [this.STORAGE_KEYS.COURSES, SEED_COURSES],
      [this.STORAGE_KEYS.MODULES, SEED_MODULES],
      [this.STORAGE_KEYS.LESSONS, SEED_LESSONS],
      [this.STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES],
      [this.STORAGE_KEYS.QUIZZES, SEED_QUIZZES],
      [this.STORAGE_KEYS.ASSESSMENTS, SEED_ASSESSMENTS],
    ];
  }

  private initializeSeedData(): void {
    const gravada = this.storage.get<number>(this.CHAVE_DA_VERSAO);
    const desatualizado = gravada !== PersistentAcademyRepository.VERSAO_DO_CATALOGO;

    for (const [chave, valor] of this.conteudoPublicado()) {
      if (desatualizado || !this.storage.get(chave)) {
        this.storage.set(chave, valor);
      }
    }

    if (desatualizado) {
      this.storage.set(this.CHAVE_DA_VERSAO, PersistentAcademyRepository.VERSAO_DO_CATALOGO);
    }
  }

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  public async listCategories(): Promise<AcademyCategory[]> {
    return this.storage.get<AcademyCategory[]>(this.STORAGE_KEYS.CATEGORIES) || SEED_CATEGORIES;
  }

  public async findCategoryById(id: string): Promise<AcademyCategory | null> {
    const list = await this.listCategories();
    return list.find((c) => c.id === id || c.slug === id) || null;
  }

  // -------------------------------------------------------------------------
  // Programs & Paths
  // -------------------------------------------------------------------------
  public async listPrograms(): Promise<Program[]> {
    return this.storage.get<Program[]>(this.STORAGE_KEYS.PROGRAMS) || SEED_PROGRAMS;
  }

  public async findProgramById(id: string): Promise<Program | null> {
    const list = await this.listPrograms();
    return list.find((p) => p.id === id || p.slug === id) || null;
  }

  public async listPaths(): Promise<LearningPath[]> {
    return this.storage.get<LearningPath[]>(this.STORAGE_KEYS.PATHS) || SEED_PATHS;
  }

  public async findPathById(id: string): Promise<LearningPath | null> {
    const list = await this.listPaths();
    return list.find((p) => p.id === id || p.slug === id) || null;
  }

  // -------------------------------------------------------------------------
  // Courses & Modules
  // -------------------------------------------------------------------------
  public async listCourses(): Promise<AcademyCourse[]> {
    return this.storage.get<AcademyCourse[]>(this.STORAGE_KEYS.COURSES) || SEED_COURSES;
  }

  public async findCourseById(id: string): Promise<AcademyCourse | null> {
    const list = await this.listCourses();
    return list.find((c) => c.id === id || c.slug === id) || null;
  }

  public async findCourseBySlug(slug: string): Promise<AcademyCourse | null> {
    const list = await this.listCourses();
    return list.find((c) => c.slug === slug || c.id === slug) || null;
  }

  public async listModulesByCourse(courseId: string): Promise<AcademyModule[]> {
    const list = this.storage.get<AcademyModule[]>(this.STORAGE_KEYS.MODULES) || SEED_MODULES;
    return list
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  public async findModuleById(id: string): Promise<AcademyModule | null> {
    const list = this.storage.get<AcademyModule[]>(this.STORAGE_KEYS.MODULES) || SEED_MODULES;
    return list.find((m) => m.id === id) || null;
  }

  // -------------------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------------------
  /**
   * Lições publicadas, JÁ COM a camada editorial aplicada.
   *
   * Toda leitura passa por aqui, e é de propósito: se a aplicação da camada
   * ficasse a cargo de quem chama, bastaria uma tela esquecer de aplicá-la
   * para o aluno ler o texto errado que alguém já corrigiu — e para o livro
   * da biblioteca divergir da lição, sem ninguém saber qual dos dois vale.
   *
   * A chave editorial NÃO está em `conteudoPublicado()`. Publicar uma versão
   * nova do catálogo não apaga correção de texto.
   */
  private edicoes(): EdicaoEditorial[] {
    return this.storage.get<EdicaoEditorial[]>('amd_academy_editorial_v1') ?? [];
  }

  private licoesPublicadas(): AcademyLesson[] {
    return this.storage.get<AcademyLesson[]>(this.STORAGE_KEYS.LESSONS) || SEED_LESSONS;
  }

  public async listLessons(): Promise<AcademyLesson[]> {
    return aplicarEdicoesEmLote(this.licoesPublicadas(), this.edicoes());
  }

  public async listLessonsByModule(moduleId: string): Promise<AcademyLesson[]> {
    return aplicarEdicoesEmLote(
      this.licoesPublicadas().filter((l) => l.moduleId === moduleId),
      this.edicoes()
    ).sort((a, b) => a.order - b.order);
  }

  public async listLessonsByCourse(courseId: string): Promise<AcademyLesson[]> {
    return aplicarEdicoesEmLote(
      this.licoesPublicadas().filter((l) => l.courseId === courseId),
      this.edicoes()
    ).sort((a, b) => a.order - b.order);
  }

  public async findLessonById(id: string): Promise<AcademyLesson | null> {
    const licao = this.licoesPublicadas().find((l) => l.id === id);
    return licao ? aplicarEdicoes(licao, this.edicoes()) : null;
  }

  // -------------------------------------------------------------------------
  // Activities & Assessments
  // -------------------------------------------------------------------------
  public async listActivitiesByLesson(lessonId: string): Promise<AcademyActivity[]> {
    const list = this.storage.get<AcademyActivity[]>(this.STORAGE_KEYS.ACTIVITIES) || SEED_ACTIVITIES;
    return list.filter((a) => a.lessonId === lessonId);
  }

  public async findActivityById(id: string): Promise<AcademyActivity | null> {
    const list = this.storage.get<AcademyActivity[]>(this.STORAGE_KEYS.ACTIVITIES) || SEED_ACTIVITIES;
    return list.find((a) => a.id === id) || null;
  }

  public async listQuizzesByCourse(courseId: string): Promise<AcademyQuiz[]> {
    const list = this.storage.get<AcademyQuiz[]>(this.STORAGE_KEYS.QUIZZES) || SEED_QUIZZES;
    return list.filter((q) => q.courseId === courseId);
  }

  public async findQuizById(id: string): Promise<AcademyQuiz | null> {
    const list = this.storage.get<AcademyQuiz[]>(this.STORAGE_KEYS.QUIZZES) || SEED_QUIZZES;
    return list.find((q) => q.id === id) || null;
  }

  public async findAssessmentById(id: string): Promise<AcademyAssessment | null> {
    const list = this.storage.get<AcademyAssessment[]>(this.STORAGE_KEYS.ASSESSMENTS) || SEED_ASSESSMENTS;
    return list.find((a) => a.id === id) || null;
  }

  public async findAssessmentByCourseId(courseId: string): Promise<AcademyAssessment | null> {
    const list = this.storage.get<AcademyAssessment[]>(this.STORAGE_KEYS.ASSESSMENTS) || SEED_ASSESSMENTS;
    return list.find((a) => a.courseId === courseId) || null;
  }

  // -------------------------------------------------------------------------
  // Progress
  // -------------------------------------------------------------------------
  public async getProgress(userId: string, courseId: string): Promise<UserAcademyProgress | null> {
    const all = this.storage.get<UserAcademyProgress[]>(this.STORAGE_KEYS.PROGRESS) || [];
    return all.find((p) => p.userId === userId && p.courseId === courseId) || null;
  }

  public async listUserProgress(userId: string): Promise<UserAcademyProgress[]> {
    const all = this.storage.get<UserAcademyProgress[]>(this.STORAGE_KEYS.PROGRESS) || [];
    return all.filter((p) => p.userId === userId);
  }

  public async saveProgress(progress: UserAcademyProgress): Promise<UserAcademyProgress> {
    const all = this.storage.get<UserAcademyProgress[]>(this.STORAGE_KEYS.PROGRESS) || [];
    const index = all.findIndex((p) => p.userId === progress.userId && p.courseId === progress.courseId);
    if (index >= 0) {
      all[index] = progress;
    } else {
      all.push(progress);
    }
    this.storage.set(this.STORAGE_KEYS.PROGRESS, all);
    return progress;
  }

  // -------------------------------------------------------------------------
  // Activity Attempts
  // -------------------------------------------------------------------------
  public async saveActivityAttempt(attempt: ActivityAttempt): Promise<ActivityAttempt> {
    const all = this.storage.get<ActivityAttempt[]>(this.STORAGE_KEYS.ATTEMPTS) || [];
    all.push(attempt);
    this.storage.set(this.STORAGE_KEYS.ATTEMPTS, all);
    return attempt;
  }

  public async listActivityAttempts(userId: string, activityId?: string): Promise<ActivityAttempt[]> {
    const all = this.storage.get<ActivityAttempt[]>(this.STORAGE_KEYS.ATTEMPTS) || [];
    return all.filter((a) => a.userId === userId && (!activityId || a.activityId === activityId));
  }

  // -------------------------------------------------------------------------
  // Assessment Submissions
  // -------------------------------------------------------------------------
  public async saveAssessmentSubmission(submission: AssessmentSubmission): Promise<AssessmentSubmission> {
    const all = this.storage.get<AssessmentSubmission[]>(this.STORAGE_KEYS.SUBMISSIONS) || [];
    all.push(submission);
    this.storage.set(this.STORAGE_KEYS.SUBMISSIONS, all);
    return submission;
  }

  public async getAssessmentSubmission(id: string): Promise<AssessmentSubmission | null> {
    const all = this.storage.get<AssessmentSubmission[]>(this.STORAGE_KEYS.SUBMISSIONS) || [];
    return all.find((s) => s.id === id) || null;
  }

  public async listAssessmentSubmissions(userId: string, assessmentId?: string): Promise<AssessmentSubmission[]> {
    const all = this.storage.get<AssessmentSubmission[]>(this.STORAGE_KEYS.SUBMISSIONS) || [];
    return all.filter((s) => s.userId === userId && (!assessmentId || s.assessmentId === assessmentId));
  }

  // -------------------------------------------------------------------------
  // Certificates
  // -------------------------------------------------------------------------
  public async saveCertificate(cert: AcademicCertificateRecord): Promise<AcademicCertificateRecord> {
    const all = this.storage.get<AcademicCertificateRecord[]>(this.STORAGE_KEYS.CERTIFICATES) || [];
    const existingIndex = all.findIndex((c) => c.id === cert.id);
    if (existingIndex >= 0) {
      all[existingIndex] = cert;
    } else {
      all.push(cert);
    }
    this.storage.set(this.STORAGE_KEYS.CERTIFICATES, all);
    return cert;
  }

  public async findCertificateById(id: string): Promise<AcademicCertificateRecord | null> {
    const all = this.storage.get<AcademicCertificateRecord[]>(this.STORAGE_KEYS.CERTIFICATES) || [];
    return all.find((c) => c.id === id || c.verificationCode === id) || null;
  }

  public async listCertificatesByUser(userId: string): Promise<AcademicCertificateRecord[]> {
    const all = this.storage.get<AcademicCertificateRecord[]>(this.STORAGE_KEYS.CERTIFICATES) || [];
    return all.filter((c) => c.userId === userId);
  }

  // -------------------------------------------------------------------------
  // History Entries (Audit log)
  // -------------------------------------------------------------------------
  public async logHistoryEntry(entry: AcademicHistoryEntry): Promise<AcademicHistoryEntry> {
    const all = this.storage.get<AcademicHistoryEntry[]>(this.STORAGE_KEYS.HISTORY) || [];
    all.unshift(entry); // newest first
    this.storage.set(this.STORAGE_KEYS.HISTORY, all);
    return entry;
  }

  public async listHistoryByUser(userId: string): Promise<AcademicHistoryEntry[]> {
    const all = this.storage.get<AcademicHistoryEntry[]>(this.STORAGE_KEYS.HISTORY) || [];
    return all.filter((h) => h.userId === userId);
  }
}

export const academyRepository = new PersistentAcademyRepository();
