import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyAssessment,
  UserAcademyProgress,
  AssessmentSubmission,
} from '../../../domain/academy';
import {
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const CourseProgressScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const courseId = params.id || 'crs_fomt_01';

  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<string, AcademyLesson[]>>({});
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [finalAssessment, setFinalAssessment] = useState<AcademyAssessment | null>(null);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const session = await authService.getActiveSession();
        const userId = session?.user.id || 'usr_founder_1';

        const [c, prog, subs] = await Promise.all([
          academyService.getCourse(courseId),
          academyService.getUserProgress(userId, courseId),
          academyService.getAssessmentSubmissions(userId),
        ]);

        if (c) {
          setCourse(c);
          setProgress(prog);
          setSubmissions(subs);

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
        }
      } catch (err) {
        console.error('Error loading course progress:', err);
      }
    };

    loadProgressData();
  }, [courseId]);

  const completedLessonIds = progress?.completedLessonIds || [];
  const totalLessonsCount = Object.values(moduleLessons).reduce((acc, l) => acc + l.length, 0);
  const progressPct = progress?.progressPercentage || 0;
  const isCompleted = progressPct === 100 || !!progress?.completedAt;

  const finalExamSubmission = submissions.find(
    (s) => finalAssessment && s.assessmentId === finalAssessment.id
  );

  return (
    <ScreenContainer
      id={`course-progress-${courseId}`}
      title={`Progresso Acadêmico do Curso`}
      subtitle={`${course?.title || 'Curso'} • Acompanhamento Curricular em Tempo Real`}
      badgeLabel={isCompleted ? 'Curso Concluído ✓' : `${progressPct}% Concluído`}
      badgeVariant={isCompleted ? 'brand' : 'neutral'}
      primaryAction={{
        label: isCompleted
          ? 'Ver Certificado Oficial'
          : progress?.lastAccessedLessonId
          ? 'Continuar Onde Parou'
          : 'Retomar Curso',
        icon: isCompleted ? GraduationCap : Play,
        onClick: () => {
          if (isCompleted) {
            navigate(`/academy/completion/${courseId}`);
          } else if (progress?.lastAccessedLessonId) {
            navigate(`/academy/lesson/${progress.lastAccessedLessonId}`);
          } else {
            navigate(`/academy/course/${courseId}`);
          }
        },
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Curso',
          icon: ArrowLeft,
          onClick: () => navigate(`/academy/course/${courseId}`),
        },
        {
          label: 'Ementa Completa',
          onClick: () => navigate(`/academy/course/${courseId}/curriculum`),
        },
      ]}
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Progress Dashboard Card */}
        <Card variant="muted" padding="lg" className="border-stone-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-stone-500 font-semibold">
                Status da Formação Acadêmica
              </span>
              <h2 className="font-serif font-bold text-2xl text-stone-900">
                {course?.title}
              </h2>
              <p className="text-xs text-stone-600">
                Cátedra: {course?.authorName} • Carga Horária: {course?.workloadHours} horas
              </p>
            </div>

            <div className="flex items-center gap-6 border-l border-stone-200 pl-6 shrink-0">
              <div className="text-center">
                <span className="font-serif font-bold text-3xl text-stone-900 block">
                  {progressPct}%
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Geral Concluído</span>
              </div>
              <div className="text-center">
                <span className="font-serif font-bold text-3xl text-emerald-800 block">
                  {completedLessonIds.length}/{totalLessonsCount}
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Lições Finalizadas</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-200">
            <div className="flex justify-between text-xs text-stone-600 font-medium">
              <span>Integralização dos Módulos e Lições</span>
              <span className="font-mono">{progressPct}%</span>
            </div>
            <ProgressBar
              id="course-progress-bar"
              value={progressPct}
              max={100}
              sizeVariant="md"
              variant="primary"
            />
          </div>
        </Card>

        {/* Requirements & Milestone Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" padding="md" className="space-y-2">
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold block">1. Lições Formativas</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">
                {completedLessonIds.length} de {totalLessonsCount} Concluídas
              </span>
              {completedLessonIds.length === totalLessonsCount ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-stone-400" />
              )}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Necessário concluir todas as lições para desbloquear o Exame Final.
            </p>
          </Card>

          <Card variant="default" padding="md" className="space-y-2">
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold block">2. Exame Somativo</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">
                {finalExamSubmission ? `Nota: ${finalExamSubmission.scorePercentage}%` : 'Pendente'}
              </span>
              {finalExamSubmission?.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Corte de aprovação: {course?.assessmentPolicy || '75% no Exame Final'}.
            </p>
          </Card>

          <Card variant="default" padding="md" className="space-y-2">
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold block">3. Certificado Digital</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">
                {isCompleted ? 'Emitido com Louvor' : 'Aguardando Aprovação'}
              </span>
              <GraduationCap className={`w-5 h-5 ${isCompleted ? 'text-red-800' : 'text-stone-400'}`} />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Emissão criptográfica com hash SHA-256 e proveniência auditável.
            </p>
          </Card>
        </div>

        {/* Modules & Lessons Detail Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-stone-700" />
              Detalhamento de Progresso por Módulo
            </h3>
          </div>

          <div className="space-y-4">
            {modules.map((m, mIdx) => {
              const lessons = moduleLessons[m.id] || [];
              const completedInMod = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
              const isModCompleted = lessons.length > 0 && completedInMod === lessons.length;

              return (
                <Card
                  key={m.id}
                  id={`progress-module-${m.id}`}
                  variant="default"
                  padding="lg"
                  className="space-y-4 border-stone-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          isModCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {isModCompleted ? '✓' : `0${mIdx + 1}`}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-stone-900">
                          {m.title}
                        </h4>
                        <span className="text-xs text-stone-500">
                          {completedInMod} de {lessons.length} Lições Concluídas
                        </span>
                      </div>
                    </div>

                    <Badge variant={isModCompleted ? 'brand' : 'neutral'} size="sm">
                      {isModCompleted ? 'Módulo Concluído' : 'Em Curso'}
                    </Badge>
                  </div>

                  {/* Lessons in this module */}
                  <div className="space-y-2">
                    {lessons.map((les) => {
                      const isLesDone = completedLessonIds.includes(les.id);
                      return (
                        <div
                          key={les.id}
                          onClick={() => navigate(`/academy/lesson/${les.id}`)}
                          className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                                isLesDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isLesDone ? '✓' : '•'}
                            </span>
                            <span className="font-medium text-stone-900">
                              {les.variants.TRADITIONAL.title}
                            </span>
                            <span className="text-stone-400">({les.durationMinutes} min)</span>
                          </div>

                          <span className="font-mono text-[11px] text-stone-500 flex items-center gap-1">
                            {isLesDone ? (
                              <span className="text-emerald-700 font-semibold">Concluído</span>
                            ) : (
                              <span>Pendente</span>
                            )}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
