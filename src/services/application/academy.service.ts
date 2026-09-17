import {
  Program,
  LearningPath,
  AcademyCategory,
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyActivity,
  AcademyAssessment,
  AcademyQuiz,
  UserAcademyProgress,
  ActivityAttempt,
  ActivityAttemptResult,
  AssessmentSubmission,
  AcademicCertificateRecord,
  AcademicHistoryEntry,
  AudienceVariant,
} from '../../domain/academy';
import { AcademyRepository, academyRepository } from '../../repositories/academy.repository';
import { profileService, ProfileService } from './profile.service';
import { analyticsService } from '../../infrastructure/telemetry/analytics-service';
import { AnalyticsEventType } from '../../domain/analytics';
import { canonicalJson, sha256Hex } from '../../domain/integrity';
import { NotFoundError } from '../../domain/errors';

export class AcademyService {
  private repo: AcademyRepository;
  private profileSvc: ProfileService;

  constructor(
    repo: AcademyRepository = academyRepository,
    profSvc: ProfileService = profileService
  ) {
    this.repo = repo;
    this.profileSvc = profSvc;
  }

  // -------------------------------------------------------------------------
  // Retrieval & Catalog Queries
  // -------------------------------------------------------------------------

  public async getCategories(): Promise<AcademyCategory[]> {
    return this.repo.listCategories();
  }

  public async getCategory(id: string): Promise<AcademyCategory | null> {
    return this.repo.findCategoryById(id);
  }

  public async getPrograms(): Promise<Program[]> {
    return this.repo.listPrograms();
  }

  public async getProgram(id: string): Promise<Program | null> {
    return this.repo.findProgramById(id);
  }

  public async getPaths(): Promise<LearningPath[]> {
    return this.repo.listPaths();
  }

  public async getPath(id: string): Promise<LearningPath | null> {
    return this.repo.findPathById(id);
  }

  public async getCourses(): Promise<AcademyCourse[]> {
    return this.repo.listCourses();
  }

  public async getCourse(id: string): Promise<AcademyCourse | null> {
    return this.repo.findCourseById(id);
  }

  public async getModules(courseId: string): Promise<AcademyModule[]> {
    return this.repo.listModulesByCourse(courseId);
  }

  public async getModule(moduleId: string): Promise<AcademyModule | null> {
    return this.repo.findModuleById(moduleId);
  }

  public async getLessons(moduleId: string): Promise<AcademyLesson[]> {
    return this.repo.listLessonsByModule(moduleId);
  }

  public async getLesson(lessonId: string): Promise<AcademyLesson | null> {
    return this.repo.findLessonById(lessonId);
  }

  public async getActivities(lessonId: string): Promise<AcademyActivity[]> {
    return this.repo.listActivitiesByLesson(lessonId);
  }

  public async getActivity(activityId: string): Promise<AcademyActivity | null> {
    return this.repo.findActivityById(activityId);
  }

  public async getQuizzesForCourse(courseId: string): Promise<AcademyQuiz[]> {
    return this.repo.listQuizzesByCourse(courseId);
  }

  public async getQuiz(quizId: string): Promise<AcademyQuiz | null> {
    return this.repo.findQuizById(quizId);
  }

  public async submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: Record<string, string>
  ): Promise<{
    scorePercentage: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    feedback: Record<string, { correct: boolean; explanation: string }>;
  }> {
    const quiz = await this.repo.findQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz Formativo', quizId);
    }

    let correctCount = 0;
    const totalCount = quiz.questions.length;
    const feedback: Record<string, { correct: boolean; explanation: string }> = {};

    for (const q of quiz.questions) {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctOptionId;
      if (isCorrect) correctCount++;
      feedback[q.id] = {
        correct: isCorrect,
        explanation: q.explanation,
      };
    }

    const scorePercentage = Math.round((correctCount / Math.max(1, totalCount)) * 100);
    const passed = scorePercentage >= quiz.passingScorePercentage;

    // Log history entry
    await this.logAcademicHistory(
      userId,
      'activity_attempt',
      passed ? 'Quiz Formativo Concluído com Sucesso' : 'Tentativa de Quiz Formativo Realizada',
      {
        quizId,
        quizTitle: quiz.title,
        courseId: quiz.courseId,
        scorePercentage,
        passed,
      }
    );

    return {
      scorePercentage,
      passed,
      correctCount,
      totalCount,
      feedback,
    };
  }

  public async getAssessment(assessmentId: string): Promise<AcademyAssessment | null> {
    return this.repo.findAssessmentById(assessmentId);
  }

  public async getAssessmentForCourse(courseId: string): Promise<AcademyAssessment | null> {
    return this.repo.findAssessmentByCourseId(courseId);
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  public async searchCatalog(query: string, filters?: { level?: string; tag?: string }): Promise<{
    programs: Program[];
    paths: LearningPath[];
    courses: AcademyCourse[];
  }> {
    const q = (query || '').toLowerCase().trim();
    const [allPrograms, allPaths, allCourses] = await Promise.all([
      this.repo.listPrograms(),
      this.repo.listPaths(),
      this.repo.listCourses(),
    ]);

    const matchingPrograms = allPrograms.filter((p) => {
      const matchText = `${p.title} ${p.subtitle} ${p.description} ${p.competencies.join(' ')}`.toLowerCase();
      return !q || matchText.includes(q);
    });

    const matchingPaths = allPaths.filter((pth) => {
      const matchText = `${pth.title} ${pth.subtitle} ${pth.description} ${pth.skills.join(' ')}`.toLowerCase();
      const matchLevel = !filters?.level || pth.level.toLowerCase() === filters.level.toLowerCase();
      return (!q || matchText.includes(q)) && matchLevel;
    });

    const matchingCourses = allCourses.filter((c) => {
      const matchText = `${c.title} ${c.subtitle} ${c.description} ${c.competencies.join(' ')} ${c.skills?.join(' ') || ''}`.toLowerCase();
      const matchLevel = !filters?.level || c.level.toLowerCase() === filters.level.toLowerCase();
      return (!q || matchText.includes(q)) && matchLevel;
    });

    return {
      programs: matchingPrograms,
      paths: matchingPaths,
      courses: matchingCourses,
    };
  }

  // -------------------------------------------------------------------------
  // Enrollments & Progress Tracking
  // -------------------------------------------------------------------------

  public async enrollCourse(userId: string, courseId: string): Promise<UserAcademyProgress> {
    const course = await this.repo.findCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Curso da Academia', courseId);
    }

    const existing = await this.repo.getProgress(userId, courseId);
    if (existing) {
      return existing;
    }

    const modules = await this.repo.listModulesByCourse(courseId);
    const firstLessonId = modules.length > 0 && modules[0].lessonIds.length > 0 ? modules[0].lessonIds[0] : undefined;

    const newProgress: UserAcademyProgress = {
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedLessonIds: [],
      completedActivityIds: [],
      passedAssessmentIds: [],
      lastAccessedLessonId: firstLessonId,
      progressPercentage: 0,
      studyTimeMinutes: 0,
    };

    const saved = await this.repo.saveProgress(newProgress);

    // Audit & Telemetry
    await this.repo.logHistoryEntry({
      id: `hist_enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'course_enrolled',
      contentId: courseId,
      contentTitle: course.title,
      contentVersion: '1.0',
      skills: course.competencies,
      details: `Matrícula formal na disciplina acadêmica: ${course.title}`,
      timestamp: new Date().toISOString(),
    });

    await analyticsService.track(AnalyticsEventType.INTERACTION, 'course_enrollment', {
      userId,
      courseId,
      courseTitle: course.title,
    });

    return saved;
  }

  public async getUserProgress(userId: string, courseId: string): Promise<UserAcademyProgress | null> {
    return this.repo.getProgress(userId, courseId);
  }

  public async listUserEnrollments(userId: string): Promise<UserAcademyProgress[]> {
    return this.repo.listUserProgress(userId);
  }

  // -------------------------------------------------------------------------
  // Lesson Completion
  // -------------------------------------------------------------------------

  public async completeLesson(userId: string, lessonId: string): Promise<UserAcademyProgress> {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lição da Academia', lessonId);
    }

    let progress = await this.repo.getProgress(userId, lesson.courseId);
    if (!progress) {
      progress = await this.enrollCourse(userId, lesson.courseId);
    }

    if (!progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds.push(lessonId);
    }
    progress.lastAccessedLessonId = lessonId;
    progress.studyTimeMinutes += lesson.durationMinutes;

    // Recalculate course percentage
    const modules = await this.repo.listModulesByCourse(lesson.courseId);
    const allLessonIds = modules.flatMap((m) => m.lessonIds);
    const totalLessons = allLessonIds.length || 1;
    progress.progressPercentage = Math.min(100, Math.round((progress.completedLessonIds.length / totalLessons) * 100));

    const saved = await this.repo.saveProgress(progress);

    // Academic History Entry
    await this.repo.logHistoryEntry({
      id: `hist_les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'lesson_completed',
      contentId: lessonId,
      contentTitle: lesson.variants.TRADITIONAL.title,
      contentVersion: '1.0',
      skills: lesson.skills,
      details: `Conclusão da lição: ${lesson.variants.TRADITIONAL.title}`,
      timestamp: new Date().toISOString(),
    });

    // Analytics event
    await analyticsService.track(AnalyticsEventType.LESSON_PROGRESS, 'lesson_completed', {
      userId,
      courseId: lesson.courseId,
      lessonId,
      progressPercentage: progress.progressPercentage,
    });

    return saved;
  }

  // -------------------------------------------------------------------------
  // Activity Evaluation & Event Emission (Progress, Skill, Evidence, Analytics)
  // -------------------------------------------------------------------------

  public async submitActivity(
    userId: string,
    activityId: string,
    givenAnswer: string,
    variant: AudienceVariant = 'TRADITIONAL'
  ): Promise<ActivityAttemptResult> {
    const activity = await this.repo.findActivityById(activityId);
    if (!activity) {
      throw new NotFoundError('Atividade da Academia', activityId);
    }

    const previousAttempts = await this.repo.listActivityAttempts(userId, activityId);
    const attemptNumber = previousAttempts.length + 1;

    const isCorrect = activity.correctAnswer.trim().toLowerCase() === givenAnswer.trim().toLowerCase();
    const activeVariantContent = activity.variants[variant] || activity.variants.TRADITIONAL;
    const score = isCorrect ? 100 : 0;
    const feedback = isCorrect ? activeVariantContent.feedbackCorrect : activeVariantContent.feedbackIncorrect;

    const attempt: ActivityAttempt = {
      id: `att_${activityId}_${Date.now()}_${attemptNumber}`,
      activityId,
      userId,
      courseId: activity.courseId,
      lessonId: activity.lessonId,
      attemptNumber,
      givenAnswer,
      isCorrect,
      score,
      skillsEvaluated: activity.skills,
      feedback,
      timestamp: new Date().toISOString(),
    };

    await this.repo.saveActivityAttempt(attempt);

    // Update Progress
    let progress = await this.repo.getProgress(userId, activity.courseId);
    if (!progress) {
      progress = await this.enrollCourse(userId, activity.courseId);
    }

    if (isCorrect && !progress.completedActivityIds.includes(activityId)) {
      progress.completedActivityIds.push(activityId);
      await this.repo.saveProgress(progress);
    }

    // 1. EVENT: Academic History Entry
    await this.repo.logHistoryEntry({
      id: `hist_act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'activity_attempt',
      contentId: activityId,
      contentTitle: activeVariantContent.question,
      contentVersion: '1.0',
      score,
      skills: activity.skills,
      details: isCorrect
        ? `Atividade resolvida com êxito na tentativa ${attemptNumber}`
        : `Tentativa ${attemptNumber} com resposta alternativa incorreta`,
      timestamp: new Date().toISOString(),
    });

    // 2. EVENT: Analytics Event
    await analyticsService.track(AnalyticsEventType.TOOL_USAGE, 'activity_submitted', {
      userId,
      activityId,
      courseId: activity.courseId,
      isCorrect,
      score,
      attemptNumber,
      variant,
    });

    // 3. EVENT: Evidence Portfolio Ingestion on Mastery (When correct)
    let evidenceId: string | undefined;
    if (isCorrect) {
      try {
        const evidenceRes = await this.profileSvc.ingestEvidence({
          userId,
          source: 'academy',
          sourceEntityId: activityId,
          title: `Atividade Auditada: ${activity.skills.join(', ')}`,
          description: `Demonstração determinística de competência em "${activity.skills.join(' / ')}". Resolvido na tentativa ${attemptNumber} com nota máxima.`,
          artifactType: 'project',
          artifactUrl: `/academy/activity/${activityId}`,
          skills: activity.skills,
          evaluator: {
            id: 'eval_auto_validator',
            name: 'Motor Canônico de Validação Teórica',
            title: 'Sistema de Avaliação Automatizada da Conservatório Muscicapa',
            decision: 'aprovado_com_louvor',
            feedbackNotes: feedback,
          },
        });
        evidenceId = evidenceRes.evidence.id;
      } catch (err) {
        // Fallback gracefully if profile service is busy
        console.warn('[AcademyService] Evidence registration deferred:', err);
      }
    }

    return {
      attempt,
      isCorrect,
      passed: isCorrect,
      feedback,
      progress,
      scoreEarned: score,
      evidenceId,
    };
  }

  // -------------------------------------------------------------------------
  // Summative Assessment Evaluation
  // -------------------------------------------------------------------------

  public async submitAssessment(
    userId: string,
    assessmentId: string,
    answers: Record<string, string> // questionId -> optionId
  ): Promise<{
    submission: AssessmentSubmission;
    passed: boolean;
    certificate?: AcademicCertificateRecord;
  }> {
    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Avaliação Acadêmica', assessmentId);
    }

    const previousSubmissions = await this.repo.listAssessmentSubmissions(userId, assessmentId);
    const attemptNumber = previousSubmissions.length + 1;

    let correctCount = 0;
    const competenciesScore: Record<string, { correct: number; total: number }> = {};
    const detailedFeedback: AssessmentSubmission['detailedFeedback'] = [];

    assessment.questions.forEach((q) => {
      const givenOptionId = answers[q.id] || '';
      const isCorrect = givenOptionId === q.correctOptionId;
      if (isCorrect) correctCount++;

      if (!competenciesScore[q.skill]) {
        competenciesScore[q.skill] = { correct: 0, total: 0 };
      }
      competenciesScore[q.skill].total += 1;
      if (isCorrect) {
        competenciesScore[q.skill].correct += 1;
      }

      detailedFeedback.push({
        questionId: q.id,
        prompt: q.prompt,
        givenOptionId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        skill: q.skill,
        explanation: q.explanation,
      });
    });

    const totalQuestions = assessment.questions.length || 1;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= assessment.passingScorePercentage;

    const compScoreNormalized: Record<string, number> = {};
    Object.entries(competenciesScore).forEach(([skill, val]) => {
      compScoreNormalized[skill] = Math.round((val.correct / val.total) * 100);
    });

    const submission: AssessmentSubmission = {
      id: `sub_${assessmentId}_${Date.now()}_${attemptNumber}`,
      assessmentId,
      courseId: assessment.courseId,
      userId,
      attemptNumber,
      answers,
      scorePercentage,
      passed,
      competenciesScore: compScoreNormalized,
      detailedFeedback,
      timestamp: new Date().toISOString(),
    };

    await this.repo.saveAssessmentSubmission(submission);

    // Update Progress
    let progress = await this.repo.getProgress(userId, assessment.courseId);
    if (!progress) {
      progress = await this.enrollCourse(userId, assessment.courseId);
    }

    if (passed && !progress.passedAssessmentIds.includes(assessmentId)) {
      progress.passedAssessmentIds.push(assessmentId);
    }

    // Log History
    await this.repo.logHistoryEntry({
      id: `hist_asm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'assessment_submitted',
      contentId: assessmentId,
      contentTitle: assessment.title,
      contentVersion: '1.0',
      score: scorePercentage,
      skills: assessment.competenciesTested,
      details: passed
        ? `Exame formal aprovado com ${scorePercentage}% (tentativa ${attemptNumber})`
        : `Exame formal não atingiu a nota de corte (${scorePercentage}% obtido, mínimo ${assessment.passingScorePercentage}%)`,
      timestamp: new Date().toISOString(),
    });

    // Check Course Completion and Issue Certificate if applicable
    let certificate: AcademicCertificateRecord | undefined;
    const course = await this.repo.findCourseById(assessment.courseId);

    if (passed && course) {
      progress.completedAt = new Date().toISOString();
      progress.progressPercentage = 100;
      await this.repo.saveProgress(progress);

      // Generate or retrieve certificate
      certificate = await this.issueCertificate(userId, course.id);
    }

    // Analytics
    await analyticsService.track(AnalyticsEventType.LESSON_PROGRESS, 'assessment_submitted', {
      userId,
      assessmentId,
      courseId: assessment.courseId,
      scorePercentage,
      passed,
      attemptNumber,
    });

    return {
      submission,
      passed,
      certificate,
    };
  }

  // -------------------------------------------------------------------------
  // Certificate Issuance & Ingestion
  // -------------------------------------------------------------------------

  public async issueCertificate(userId: string, courseId: string): Promise<AcademicCertificateRecord> {
    const course = await this.repo.findCourseById(courseId);
    if (!course) {
      throw new NotFoundError('Curso', courseId);
    }

    const existingCerts = await this.repo.listCertificatesByUser(userId);
    const existing = existingCerts.find((c) => c.courseId === courseId);
    if (existing) {
      return existing;
    }

    // O codigo de verificacao identifica o documento; o hash prova o conteudo.
    const verificationCode = `CMU-${new Date().getFullYear()}-${course.slug.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issuedAt = new Date().toISOString();

    // Hash real, sobre os campos do certificado. O comentario acima desta
    // linha dizia "deterministic" enquanto o valor vinha de `Math.random()`:
    // dois certificados identicos recebiam hashes diferentes e um certificado
    // adulterado mantinha o seu (CLAUDE_AUDIT.md P-07).
    const integrityHash = `sha256:${await sha256Hex(
      canonicalJson({
        userId,
        courseId,
        courseTitle: course.title,
        workloadHours: course.workloadHours,
        verificationCode,
        competencies: [...course.competencies].sort(),
        instructorName: course.authorName,
        issuedAt,
      })
    )}`;

    const cert: AcademicCertificateRecord = {
      id: `cert_${courseId}_${Date.now()}`,
      userId,
      studentName: 'Estudante Acadêmico', // will be enriched from profile
      courseId,
      courseTitle: course.title,
      programTitle: 'Programa Integrado de Fundamentos Musicais',
      workloadHours: course.workloadHours,
      verificationCode,
      sha256Hash: integrityHash,
      issuedAt,
      instructorName: course.authorName,
      instructorTitle: course.authorTitle,
      competencies: course.competencies,
      institution: 'Conservatório Muscicapa - Cátedra Livre de Teoria e Prática',
    };

    // Enrich with user name if available
    try {
      const profile = await this.profileSvc.getProfile(userId);
      if (profile.displayName) {
        cert.studentName = profile.displayName;
      }
    } catch {
      // Keep default
    }

    const savedCert = await this.repo.saveCertificate(cert);

    // Register into History
    await this.repo.logHistoryEntry({
      id: `hist_cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: 'certificate_issued',
      contentId: savedCert.id,
      contentTitle: `Certificado Acadêmico: ${course.title}`,
      contentVersion: '1.0',
      skills: course.competencies,
      details: `Emissão do Certificado Oficial com código [${verificationCode}] e autenticação [${integrityHash}]`,
      timestamp: new Date().toISOString(),
    });

    // Ingest into Profile Evidence
    try {
      await this.profileSvc.ingestEvidence({
        userId,
        source: 'academy',
        sourceEntityId: savedCert.id,
        title: `Certificado de Conclusão: ${course.title}`,
        description: `Certificado oficial conferido pela Conservatório Muscicapa. Carga horária auditada de ${course.workloadHours} horas. Código: ${verificationCode}`,
        artifactType: 'document',
        artifactUrl: `/academy/certificate/${savedCert.id}`,
        skills: course.competencies,
        evaluator: {
          id: course.authorId,
          name: course.authorName,
          title: course.authorTitle,
          decision: 'aprovado_com_louvor',
          feedbackNotes: `Aprovação canônica em todos os módulos e no exame final da disciplina.`,
        },
      });
    } catch (e) {
      console.warn('[AcademyService] Certificate evidence sync warning:', e);
    }

    return savedCert;
  }

  public async getCertificate(certificateId: string): Promise<AcademicCertificateRecord | null> {
    return this.repo.findCertificateById(certificateId);
  }

  public async listUserCertificates(userId: string): Promise<AcademicCertificateRecord[]> {
    return this.repo.listCertificatesByUser(userId);
  }

  public async getUserAcademicHistory(userId: string): Promise<AcademicHistoryEntry[]> {
    return this.repo.listHistoryByUser(userId);
  }

  public async getAssessmentSubmission(submissionId: string): Promise<AssessmentSubmission | null> {
    return this.repo.getAssessmentSubmission(submissionId);
  }

  public async getAllUserProgress(userId: string): Promise<UserAcademyProgress[]> {
    return this.repo.listUserProgress(userId);
  }

  public async getUserCertificates(userId: string): Promise<AcademicCertificateRecord[]> {
    return this.repo.listCertificatesByUser(userId);
  }

  public async getAssessmentSubmissions(userId: string): Promise<AssessmentSubmission[]> {
    return this.repo.listAssessmentSubmissions(userId);
  }

  public async logAcademicHistory(
    userId: string,
    type: AcademicHistoryEntry['type'],
    details: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.repo.logHistoryEntry({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type,
      contentId: (metadata?.quizId as string) || (metadata?.assessmentId as string) || (metadata?.courseId as string) || 'academy',
      contentTitle: (metadata?.quizTitle as string) || details,
      contentVersion: '1.0',
      skills: [],
      details: `${details} - ${JSON.stringify(metadata || {})}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Compatibility aliases for screens
  public async listUserAuditEntries(userId: string): Promise<AcademicHistoryEntry[]> {
    return this.getUserAcademicHistory(userId);
  }

  public async submitActivityAttempt(
    userId: string,
    activityId: string,
    givenAnswer: string,
    variant: AudienceVariant = 'TRADITIONAL'
  ) {
    return this.submitActivity(userId, activityId, givenAnswer, variant);
  }

  public async getAssessmentAttempt(submissionId: string): Promise<AssessmentSubmission | null> {
    return this.getAssessmentSubmission(submissionId);
  }

  public async submitAssessmentAttempt(
    userId: string,
    assessmentId: string,
    answers: Record<string, string>
  ) {
    return this.submitAssessment(userId, assessmentId, answers);
  }
}

export const academyService = new AcademyService();
