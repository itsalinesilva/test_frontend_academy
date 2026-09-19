import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { LearningPath, AcademyCourse, UserAcademyProgress } from '../../../domain/academy';
import { Award, Clock, ArrowRight, CheckCircle2, GraduationCap, ArrowLeft } from 'lucide-react';

export const PathDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const pathId = params.id;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, UserAcademyProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPathData = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!pathId) return;
      try {
        const session = await authService.getActiveSession();
        // O catalogo e publico; so o progresso exige sessao. A guarda anterior
        // bloqueava ambos, escondendo o catalogo de visitantes anonimos.
        const userId = session?.user.id;

        const p = await academyService.getPath(pathId);
        if (p) {
          setPath(p);
          const allCourses = await academyService.getCourses();
          const matched = allCourses.filter((c) => p.courseIds.includes(c.id));
          setCourses(matched);

          const userProgresses = userId ? await academyService.listUserEnrollments(userId) : [];
          const map: Record<string, UserAcademyProgress> = {};
          userProgresses.forEach((up) => {
            map[up.courseId] = up;
          });
          setEnrollments(map);
        }
      } catch (err) {
        console.error('Error loading path:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPathData();
  }, [pathId]);

  if (!path && !isLoading) {
    return (
      <ScreenContainer
        id="path-not-found"
        title="Trilha Acadêmica"
        subtitle="Trilha não localizada."
        emptyProps={{
          title: 'Trilha não encontrada',
          description: `O identificador [${pathId}] não corresponde a uma trilha ativa.`,
          actionLabel: 'Voltar ao Catálogo',
          onAction: () => navigate('/academy/catalog'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id={`path-detail-${pathId}`}
      title={path?.title || 'Carregando Trilha...'}
      subtitle={path?.subtitle || ''}
      badgeLabel={`Nível ${path?.level || ''}`}
      badgeVariant="brand"
      primaryAction={{
        label: courses.length > 0 ? 'Iniciar Primeira Disciplina' : 'Ver Catálogo',
        icon: ArrowRight,
        onClick: () => {
          if (courses.length > 0) {
            navigate(`/academy/course/${courses[0].id}`);
          }
        },
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Catálogo',
          icon: ArrowLeft,
          onClick: () => navigate('/academy/catalog'),
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Path Overview & Sequenced Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="lg" className="space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Sobre a Trilha
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              {path?.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-600 pt-2 border-t border-stone-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Carga: {path?.workloadHours} horas estimadas
              </span>
              <span>•</span>
              <span>{courses.length} Disciplinas Sequenciadas</span>
            </div>
          </Card>

          {/* Courses List */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-anil-800" />
              Disciplinas da Trilha
            </h2>

            <div className="space-y-4">
              {courses.map((course, idx) => {
                const enrollment = enrollments[course.id];

                return (
                  <Card
                    key={course.id}
                    id={`path-course-card-${course.id}`}
                    variant="default"
                    padding="lg"
                    className="space-y-4 hover:border-stone-400 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-[11px] font-mono rounded font-semibold">
                            Disciplina 0{idx + 1}
                          </span>
                          <Badge variant={enrollment ? 'brand' : 'neutral'} size="sm">
                            {enrollment ? 'Matriculado' : course.level}
                          </Badge>
                        </div>
                        <h3 className="font-serif font-bold text-base text-stone-900">
                          {course.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-stone-500 shrink-0">
                        {course.workloadHours} horas
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {course.subtitle}
                    </p>

                    {enrollment && (
                      <div className="space-y-1.5 p-3 bg-stone-50 rounded-md border border-stone-200">
                        <div className="flex justify-between text-xs text-stone-700">
                          <span>Seu Progresso nesta Disciplina:</span>
                          <span className="font-mono font-semibold">{enrollment.progressPercentage}%</span>
                        </div>
                        <ProgressBar
                          id={`progress-path-course-${course.id}`}
                          value={enrollment.progressPercentage}
                          max={100}
                          sizeVariant="sm"
                          variant="primary"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                      <span className="text-xs text-stone-500 font-sans">
                        Prof. {course.authorName}
                      </span>
                      <Button
                        size="sm"
                        variant={enrollment ? 'primary' : 'outline'}
                        onClick={() => navigate(`/academy/course/${course.id}`)}
                      >
                        {enrollment ? 'Continuar Disciplina' : 'Ver Ementa'}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills & Objectives */}
        <div className="space-y-6">
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-anil-800" />
              Competências Desenvolvidas
            </h3>
            <div className="space-y-2">
              {path?.skills.map((skill, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
