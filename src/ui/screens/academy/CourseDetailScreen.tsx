import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { LockedState } from '../../components/feedback/LockedState';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyAssessment,
  AcademyQuiz,
  UserAcademyProgress,
  LearningPath,
} from '../../../domain/academy';
import {
  Award,
  CheckCircle2,
  Play,
  FileText,
  UserCheck,
  Download,
  HelpCircle,
  ArrowRight,
  GraduationCap,
  Layers,
  Clock,
  Globe,
  Music,
  Activity,
  Sparkles,
} from 'lucide-react';

export const CourseDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<string, AcademyLesson[]>>({});
  const [finalAssessment, setFinalAssessment] = useState<AcademyAssessment | null>(null);
  const [quizzes, setQuizzes] = useState<AcademyQuiz[]>([]);
  const [relatedPath, setRelatedPath] = useState<LearningPath | null>(null);
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadCourse = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!courseId) return;
      try {
        const session = await authService.getActiveSession();
        // O catalogo e publico; so o progresso exige sessao. A guarda anterior
        // bloqueava ambos, escondendo o catalogo de visitantes anonimos.
        const userId = session?.user.id;
    if (!userId) {
      // Matricula exige identidade. Sem sessao, o caminho e autenticar-se —
      // nao falhar em silencio nem gravar sob outra conta.
      navigate('/auth/login');
      return;
    }

        const [c, qzs, allPaths] = await Promise.all([
          academyService.getCourse(courseId),
          academyService.getQuizzesForCourse(courseId),
          academyService.getPaths(),
        ]);

        if (c) {
          setCourse(c);
          setQuizzes(qzs);

          // find related path that contains this course
          const matchedPath = allPaths.find((p) => p.courseIds.includes(c.id));
          if (matchedPath) {
            setRelatedPath(matchedPath);
          }

          const mods = await academyService.getModules(c.id);
          setModules(mods);

          const lessonMap: Record<string, AcademyLesson[]> = {};
          await Promise.all(
            mods.map(async (m) => {
              const lessons = await academyService.getLessons(m.id);
              lessonMap[m.id] = lessons;
            })
          );
          setModuleLessons(lessonMap);

          if (c.finalAssessmentId) {
            const asm = await academyService.getAssessment(c.finalAssessmentId);
            setFinalAssessment(asm);
          }

          const userProgress = userId ? await academyService.getUserProgress(userId, c.id) : null;
          setProgress(userProgress);
        }
      } catch (err) {
        console.error('Error loading course:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleEnrollOrContinue = async () => {
    const session = await authService.getActiveSession();
    // O catalogo e publico; so o progresso exige sessao. A guarda anterior
    // bloqueava ambos, escondendo o catalogo de visitantes anonimos.
    const userId = session?.user.id;

    // Matrícula exige identidade. Sem sessão o caminho é autenticar-se — não
    // falhar em silêncio, e muito menos gravar sob outra conta.
    if (!userId) {
      navigate('/auth/login');
      return;
    }
    if (!course) return;

    if (!progress) {
      setIsEnrolling(true);
      try {
        const newProgress = await academyService.enrollCourse(userId, course.id);
        setProgress(newProgress);
        if (newProgress.lastAccessedLessonId) {
          navigate(`/academy/lesson/${newProgress.lastAccessedLessonId}`);
        }
      } finally {
        setIsEnrolling(false);
      }
    } else {
      if (progress.lastAccessedLessonId) {
        navigate(`/academy/lesson/${progress.lastAccessedLessonId}`);
      } else if (modules.length > 0 && modules[0].lessonIds.length > 0) {
        navigate(`/academy/lesson/${modules[0].lessonIds[0]}`);
      }
    }
  };

  if (!course && !isLoading) {
    return (
      <PageLayout
        id="course-not-found"
        form="focus"
        state="empty"
        emptyProps={{
          title: 'Disciplina não encontrada',
          description: `O identificador [${courseId}] não corresponde a uma disciplina ativa do currículo.`,
          actionLabel: 'Voltar ao Catálogo',
          onAction: () => navigate('/academy/catalog'),
        }}
      >
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  const isEnrolled = !!progress;
  const isCompleted = isEnrolled && (progress.progressPercentage === 100 || !!progress.completedAt);
  const totalLessons = Object.values(moduleLessons).reduce((acc, l) => acc + l.length, 0);

  return (
    <PageLayout
      id={`course-detail-${courseId}`}
      form="detail"
      density="catalog"
      state={isLoading ? 'loading' : 'content'}
      loadingMessage="Carregando a disciplina e sua grade curricular…"
    >
      <PageLayout.Hero>
        {/* Identidade da disciplina — wireframes/01 §4 */}
        <Card variant="muted" padding="lg" className="border-stone-200 bg-gradient-to-r from-stone-50 via-white to-stone-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold uppercase bg-stone-200 text-stone-800 rounded">
                  {course?.categoryId ? `CÁTEDRA: ${course.categoryId.replace('cat_', '').toUpperCase()}` : 'CÁTEDRA CANÔNICA'}
                </span>
                <span className="text-xs text-stone-500 font-mono">• Código: {course?.id}</span>
                <span className="text-xs text-stone-500">• Idioma: Português</span>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950 leading-tight">
                {course?.title}
              </h1>

              <p className="text-sm text-stone-700 leading-relaxed font-sans max-w-3xl">
                {course?.description}
              </p>

              {/* Author Strip */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
                  {course?.authorAvatarUrl ? (
                    <img src={course.authorAvatarUrl} alt={course.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-5 h-5 m-auto text-stone-600" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Ministrado por:</span>
                  <span className="font-serif font-bold text-sm text-stone-900 block">
                    {course?.authorName}
                  </span>
                  {course?.authorBio && (
                    <span className="text-xs text-stone-600 line-clamp-1">
                      {course.authorBio}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Key Facts Card */}
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                  <span className="text-stone-500">Nível</span>
                  <Badge variant="brand" size="sm">{course?.level}</Badge>
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                  <span className="text-stone-500">Carga Estimada</span>
                  <span className="font-semibold text-stone-900">{course?.workloadHours} horas</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                  <span className="text-stone-500">Estrutura</span>
                  <span className="font-semibold text-stone-900">{modules.length} Módulos • {totalLessons} Lições</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Certificado</span>
                  <span className="font-mono font-semibold text-emerald-700">Digital Auditado</span>
                </div>
              </div>

              <Button
                id="btn-course-enroll-main"
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={handleEnrollOrContinue}
              >
                {isCompleted ? 'Ver Certificado' : isEnrolled ? 'Continuar Curso' : 'Matricular-se Grátis'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </Card>

      </PageLayout.Hero>

      <PageLayout.Tabs
        id="course-detail-tabs"
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'curriculum', label: 'Grade Curricular', badge: modules.length || undefined },
          { id: 'skills', label: 'Competências', badge: course?.skills?.length || undefined },
          { id: 'materials', label: 'Materiais', badge: course?.materials?.length || undefined },
          { id: 'references', label: 'Bibliografia' },
        ]}
      />

      <PageLayout.Main>
          <div className="space-y-8">
            {/* 1. Progress banner if enrolled */}
            {isEnrolled && (
              <Card variant="muted" padding="md" className="space-y-2 border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
                  <span className="flex items-center gap-1.5 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Status da Matrícula: {isCompleted ? 'Disciplina Concluída com Louvor' : 'Em Andamento'}
                  </span>
                  <span className="font-mono font-semibold">{progress?.progressPercentage || 0}%</span>
                </div>
                <ProgressBar
                  id="course-detail-progress"
                  value={progress?.progressPercentage || 0}
                  max={100}
                  sizeVariant="sm"
                  variant="primary"
                />
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-stone-500">
                    {progress?.completedLessonIds.length} de {totalLessons} lições concluídas
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/academy/course/${courseId}/progress`)}
                  >
                    Abrir Painel de Progresso Completo
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            )}

            {/* 2. Objetivos de Aprendizagem & Competências */}
            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-800" />
                Objetivos Acadêmicos & Competências Canônicas
              </h2>
              <ul className="space-y-2.5 text-sm text-stone-700">
                {course?.objectives.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-stone-100">
                <span className="text-xs font-mono uppercase text-stone-500 font-semibold block mb-2">
                  Competências Canônicas Desenvolvidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {course?.competencies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs rounded-md font-sans"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* 3. Learning Outcomes (O que você aprenderá) */}
            {course?.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card variant="default" padding="lg" className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-800" />
                  Resultados Esperados de Aprendizagem (Outcomes)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                  {course.learningOutcomes.map((loc, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 border border-stone-100 rounded-lg flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{loc}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 4. Grade Curricular & Módulos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-stone-700" />
                    Conteúdo do Curso ({modules.length} Módulos • {totalLessons} Lições)
                  </h2>
                  <p className="text-xs text-stone-600">
                    {course?.curriculumSummary}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/academy/course/${courseId}/curriculum`)}
                >
                  Ver Ementa Detalhada
                </Button>
              </div>

              <div className="space-y-5">
                {modules.map((module, modIdx) => {
                  const lessons = moduleLessons[module.id] || [];
                  const modQuiz = quizzes.find((q) => q.moduleId === module.id);

                  return (
                    <Card
                      key={module.id}
                      id={`module-card-${module.id}`}
                      variant="default"
                      padding="lg"
                      className="space-y-4 border-stone-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                            Módulo 0{modIdx + 1}
                          </span>
                          <h3 className="font-serif font-bold text-base text-stone-900">
                            {module.title}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-stone-500">
                          {lessons.length} Lições Formativas
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {module.description}
                      </p>

                      {/* Lessons list */}
                      <div className="space-y-2 pt-1">
                        {lessons.map((lesson, lesIdx) => {
                          const isLessonCompleted = progress?.completedLessonIds.includes(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              id={`lesson-row-${lesson.id}`}
                              onClick={() => navigate(`/academy/lesson/${lesson.id}`)}
                              className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                                    isLessonCompleted
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {isLessonCompleted ? '✓' : lesIdx + 1}
                                </span>
                                <div>
                                  <span className="font-serif font-semibold text-sm text-stone-900 block">
                                    {lesson.variants.TRADITIONAL.title}
                                  </span>
                                  <span className="text-xs text-stone-500 flex items-center gap-2">
                                    <span>{lesson.durationMinutes} min</span>
                                    <span>•</span>
                                    <span>{lesson.activityIds.length} Atividade Prática</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/academy/lesson/${lesson.id}/interactive`);
                                  }}
                                >
                                  Interativo
                                </Button>
                                <Button size="sm" variant={isLessonCompleted ? 'outline' : 'primary'}>
                                  {isLessonCompleted ? 'Revisar' : 'Acessar'}
                                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quiz row inside module if present */}
                      {modQuiz && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                            <div>
                              <span className="font-semibold text-stone-900">{modQuiz.title}</span>
                              <span className="text-stone-600 block">
                                Checagem formativa • {modQuiz.questions.length} questões ({modQuiz.estimatedMinutes} min)
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/academy/quiz/${modQuiz.id}`)}
                          >
                            Responder Quiz
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {/* Final Assessment */}
                {finalAssessment && (
                  <Card
                    variant="default"
                    padding="lg"
                    className="space-y-3 border-red-200 bg-red-50/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <Badge variant="brand" size="sm">Exame Somativo Oficial</Badge>
                        <h3 className="font-serif font-bold text-base text-stone-900">
                          {finalAssessment.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-stone-600">
                        Corte Mínimo: {finalAssessment.passingScorePercentage}%
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {finalAssessment.description}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <Button
                        id="btn-take-final-assessment"
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/academy/assessment/${finalAssessment.id}`)}
                      >
                        Realizar Exame Canônico ({finalAssessment.questions.length} Questões)
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* 5. Referências Bibliográficas & Citações Canônicas */}
          </div>
      </PageLayout.Main>

      {/* Trilho fixo de matrícula e relações — wireframes/01 §4 */}
      <PageLayout.Aside>
          <div className="space-y-4">
            {/*
              CTA de matrícula no TRILHO FIXO.
              Antes vivia em `ScreenContainer.primaryAction`, no topo da página,
              e desaparecia assim que o usuário rolava para ler a grade — que é
              justamente quando ele decide se matricular. No wireframe
              (01_ACADEMY_COURSERA §4) o trilho acompanha a rolagem.
            */}
            <Card variant="default" padding="md" className="space-y-3 border-stone-300 shadow-sm">
              {isEnrolled ? (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-stone-700">Seu progresso</span>
                      <span className="font-mono text-sm font-bold text-stone-900">
                        {progress?.progressPercentage ?? 0}%
                      </span>
                    </div>
                    <ProgressBar
                      id="course-rail-progress"
                      value={progress?.progressPercentage ?? 0}
                      max={100}
                      label={`Progresso na disciplina ${course?.title ?? ''}`}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() =>
                      isCompleted
                        ? navigate(`/academy/completion/${course?.id}`)
                        : handleEnrollOrContinue()
                    }
                  >
                    {isCompleted ? (
                      <><GraduationCap className="mr-1.5 h-4 w-4" /> Ver certificado</>
                    ) : (
                      <><Play className="mr-1.5 h-4 w-4" /> Continuar</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Disciplina gratuita. A matrícula libera lições, atividades e a avaliação final.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={isEnrolling}
                    onClick={handleEnrollOrContinue}
                  >
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    {isEnrolling ? 'Processando matrícula…' : 'Matricular-se'}
                  </Button>
                </>
              )}

              <dl className="space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <dt className="sr-only">Carga horária</dt>
                  <dd>{course?.workloadHours}h de carga horária</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <dt className="sr-only">Estrutura</dt>
                  <dd>{modules.length} módulos · {totalLessons} lições</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <dt className="sr-only">Certificação</dt>
                  <dd>Certificado ao concluir</dd>
                </div>
              </dl>
            </Card>

            {/*
              Conteúdo bloqueado sem matrícula: a estrutura permanece visível
              — é ela que sustenta a decisão de se matricular — mas o acesso
              é explicitamente condicionado, com o caminho para desbloquear.
            */}
            {!isEnrolled && (
              <LockedState
                id="course-locked-notice"
                title="Conteúdo bloqueado"
                description="A grade curricular está visível, mas as lições exigem matrícula."
                requirementText="Matricule-se para liberar lições, atividades e avaliação."
              />
            )}
            {/* Conexão com Trilha de Aprendizagem (Path Relation) */}
            {relatedPath && (
              <Card variant="default" padding="md" className="space-y-3 border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-500 font-mono uppercase font-semibold text-[10px]">
                  <Layers className="w-3.5 h-3.5 text-red-800" />
                  <span>Trilha Formativa Integrada</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {relatedPath.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {relatedPath.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => navigate(`/academy/path/${relatedPath.id}`)}
                >
                  Ver Trilha Completa
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            )}

            {/* Conexão com Mundos & Obras Canônicas (Worlds Relation) */}
            {course?.worldRef && (
              <Card variant="default" padding="md" className="space-y-3 border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-500 font-mono uppercase font-semibold text-[10px]">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>Conexão com os Mundos Canônicos</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {course.worldRef.composer}
                </h4>
                <p className="text-xs text-stone-600">
                  Obra de Estudo: <strong>{course.worldRef.workTitle}</strong>
                </p>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Período Histórico / Estilo: {course.worldRef.period}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => navigate('/worlds')}
                >
                  Explorar no Atlas dos Mundos
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            )}

            {/* Laboratório Prático Vinculado (Related Practice) */}
            {course?.relatedPractice && (
              <Card variant="muted" padding="md" className="space-y-3 border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-500 font-mono uppercase font-semibold text-[10px]">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Laboratório de Prática Deliberada</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {course.relatedPractice.title}
                </h4>
                <p className="text-xs text-stone-600">
                  Instrumento: <strong>{course.relatedPractice.instrument}</strong> • Foco: {course.relatedPractice.focus}
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => navigate('/practice')}
                >
                  Abrir Central de Prática
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            )}

            {/* Partitura Urtext Vinculada (Related Score) */}
            {course?.relatedScore && (
              <Card variant="default" padding="md" className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-500 font-mono uppercase font-semibold text-[10px]">
                  <Music className="w-3.5 h-3.5 text-red-800" />
                  <span>Partitura Urtext Conectada</span>
                </div>
                <h4 className="font-serif font-bold text-stone-900">
                  {course.relatedScore.title}
                </h4>
                <span className="text-stone-500 block">
                  {course.relatedScore.composer} • Clave: {course.relatedScore.clef}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center mt-2"
                  onClick={() => navigate('/score')}
                >
                  Acessar Acervo Urtext
                </Button>
              </Card>
            )}

            {/* Certificação Digital & Credenciais */}
            <Card variant="default" padding="md" className="space-y-3 border-stone-200">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-800" />
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Certificação Digital Canônica
                </h3>
              </div>
              <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Critério de Aprovação:</strong> {course?.assessmentPolicy}
                </p>
                <p>
                  <strong>Diploma:</strong> {course?.certificatePolicy}
                </p>
                {course?.certificateInfo && (
                  <p className="text-[11px] text-stone-500 font-mono">
                    Acreditação: {course.certificateInfo.accreditation}
                  </p>
                )}
              </div>
            </Card>

            {/* Pré-requisitos */}
            <Card variant="default" padding="md" className="space-y-2">
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-stone-500" />
                Pré-Requisitos Formais
              </h3>
              <ul className="space-y-1 text-xs text-stone-600">
                {course?.prerequisites.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </Card>

            {/* Materiais Complementares */}
            <Card variant="default" padding="md" className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-800" />
                Materiais de Apoio ({course?.materials.length || 0})
              </h3>
              <div className="space-y-2">
                {course?.materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 bg-stone-50 border border-stone-200 rounded-md text-xs space-y-1"
                  >
                    <div className="font-medium text-stone-900 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="line-clamp-1">{mat.title}</span>
                    </div>
                    {mat.sizeOrRef && (
                      <span className="text-[11px] text-stone-500 font-mono block">
                        {mat.sizeOrRef}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Proveniência */}
          </div>
      </PageLayout.Aside>
    </PageLayout>
  );
};
