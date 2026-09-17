import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyAssessment,
  AcademyQuiz,
  UserAcademyProgress,
} from '../../../domain/academy';
import {
  Clock,
  Layers,
  ArrowRight,
  Play,
  HelpCircle,
  Volume2,
  Music,
} from 'lucide-react';

export const CourseCurriculumScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<string, AcademyLesson[]>>({});
  const [quizzes, setQuizzes] = useState<AcademyQuiz[]>([]);
  const [finalAssessment, setFinalAssessment] = useState<AcademyAssessment | null>(null);
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);

  useEffect(() => {
    const loadCurriculum = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!courseId) return;
      try {
        const session = await authService.getActiveSession();
        // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
        // anterior misturava dados de visitantes anonimos com os da
        // fundadora (CLAUDE_AUDIT.md T-05).
        if (!session) return;
        const userId = session.user.id;

        const [c, qzs] = await Promise.all([
          academyService.getCourse(courseId),
          academyService.getQuizzesForCourse(courseId),
        ]);

        if (c) {
          setCourse(c);
          setQuizzes(qzs);

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

          const prog = await academyService.getUserProgress(userId, c.id);
          setProgress(prog);
        }
      } catch (err) {
        console.error('Error loading curriculum:', err);
      }
    };

    loadCurriculum();
  }, [courseId]);

  const totalLessons = Object.values(moduleLessons).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <ScreenContainer
      id={`course-curriculum-${courseId}`}
      title={`Ementa & Grade Curricular Completa`}
      subtitle={`${course?.title || 'Curso Acadêmico'} • ${course?.workloadHours}h Totais`}
      badgeLabel="Programa Curricular Oficial"
      badgeVariant="brand"
      primaryAction={{
        label: progress ? 'Continuar Curso' : 'Ir para Detalhes do Curso',
        icon: Play,
        onClick: () => navigate(`/academy/course/${courseId}`),
      }}
      secondaryActions={[
        {
          label: 'Ver Detalhes do Curso',
          onClick: () => navigate(`/academy/course/${courseId}`),
        },
        {
          label: 'Meu Progresso',
          onClick: () => navigate(`/academy/course/${courseId}/progress`),
        },
      ]}
    >
      <div className="space-y-8">
        {/* Header Summary Banner */}
        <Card variant="muted" padding="lg" className="border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                Estrutura Pedagógica & Matriz de Conteúdo
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                {course?.title}
              </h2>
              <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                {course?.curriculumSummary || course?.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-l border-stone-200 pl-6 shrink-0">
              <div>
                <span className="text-xs text-stone-500 block">Módulos</span>
                <span className="font-serif font-bold text-xl text-stone-900">{modules.length}</span>
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Lições</span>
                <span className="font-serif font-bold text-xl text-stone-900">{totalLessons}</span>
              </div>
              <div>
                <span className="text-xs text-stone-500 block">Workload</span>
                <span className="font-serif font-bold text-xl text-stone-900">{course?.workloadHours}h</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Modules & Syllabus Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-stone-700" />
              Módulos Curriculares Detalhados
            </h3>
            <span className="text-xs font-mono text-stone-500">
              Total de {modules.length} Módulos Canônicos
            </span>
          </div>

          {modules.map((mod, modIdx) => {
            const lessons = moduleLessons[mod.id] || [];
            const modQuiz = quizzes.find((q) => q.moduleId === mod.id);

            return (
              <Card
                key={mod.id}
                id={`curriculum-module-${mod.id}`}
                variant="default"
                padding="lg"
                className="space-y-5 border-stone-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] font-mono rounded font-semibold">
                        MÓDULO {modIdx + 1}
                      </span>
                      <span className="text-xs text-stone-500">• {lessons.length} Lições Formativas</span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-stone-950 mt-1">
                      {mod.title}
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/academy/course/${courseId}/module/${mod.id}`)}
                  >
                    Ver Página do Módulo
                  </Button>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {mod.description}
                </p>

                {/* Lessons inside module */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono uppercase text-stone-500 font-semibold block">
                    Lições e Conteúdos Multimodais:
                  </span>
                  {lessons.map((les, lesIdx) => {
                    const isDone = progress?.completedLessonIds.includes(les.id);
                    return (
                      <div
                        key={les.id}
                        id={`curriculum-lesson-${les.id}`}
                        onClick={() => navigate(`/academy/lesson/${les.id}`)}
                        className="p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {isDone ? '✓' : `${modIdx + 1}.${lesIdx + 1}`}
                          </span>
                          <div>
                            <span className="font-serif font-semibold text-sm text-stone-900 block">
                              {les.variants.TRADITIONAL.title}
                            </span>
                            <span className="text-xs text-stone-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {les.durationMinutes} minutos
                              </span>
                              <span className="flex items-center gap-1">
                                <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                                Áudio Guiado
                              </span>
                              {les.variants.TRADITIONAL.scoreSnippet && (
                                <span className="flex items-center gap-1 text-red-800">
                                  <Music className="w-3.5 h-3.5" />
                                  Partitura
                                </span>
                              )}
                              <span>• {les.activityIds.length} Atividade Prática</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/academy/lesson/${les.id}/interactive`);
                            }}
                          >
                            Modo Interativo
                          </Button>
                          <Button size="sm" variant={isDone ? 'outline' : 'primary'}>
                            {isDone ? 'Revisar' : 'Acessar'}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formative Quiz check if present */}
                {modQuiz && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-900 block">{modQuiz.title}</span>
                        <span className="text-stone-600">Checagem de compreensão • {modQuiz.questions.length} questões</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/academy/quiz/${modQuiz.id}`)}
                    >
                      Iniciar Quiz
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Final Summative Exam */}
          {finalAssessment && (
            <Card variant="default" padding="lg" className="border-red-200 bg-red-50/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Badge variant="brand" size="sm">Exame Final Somativo</Badge>
                  <h4 className="font-serif font-bold text-lg text-stone-950">
                    {finalAssessment.title}
                  </h4>
                  <p className="text-xs text-stone-600 max-w-xl">
                    {finalAssessment.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-stone-500 block">Corte Mínimo</span>
                  <span className="font-mono font-bold text-red-800 text-lg">
                    {finalAssessment.passingScorePercentage}%
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  id="btn-curriculum-assessment"
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/academy/assessment/${finalAssessment.id}`)}
                >
                  Realizar Exame Oficial ({finalAssessment.questions.length} Questões)
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
};
