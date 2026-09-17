import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCourse, AcademyModule, AcademyLesson } from '../../../domain/academy';
import { CheckCircle2, ArrowRight, ArrowLeft, BookOpen, Clock } from 'lucide-react';

export const ModuleDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const courseId = params.courseId;
  const moduleId = params.moduleId;

  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [module, setModule] = useState<AcademyModule | null>(null);
  const [lessons, setLessons] = useState<AcademyLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModule = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!courseId || !moduleId) return;
      try {
        const [c, m, lsns] = await Promise.all([
          academyService.getCourse(courseId),
          academyService.getModule(moduleId),
          academyService.getLessons(moduleId),
        ]);
        setCourse(c);
        setModule(m);
        setLessons(lsns);
      } catch (e) {
        console.error('Error loading module:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [courseId, moduleId]);

  if (!module && !isLoading) {
    return (
      <ScreenContainer
        id="module-not-found"
        title="Módulo Acadêmico"
        subtitle="Módulo não localizado."
        emptyProps={{
          title: 'Módulo não encontrado',
          description: `O módulo [${moduleId}] não pertence a esta disciplina.`,
          actionLabel: 'Voltar ao Curso',
          onAction: () => navigate(`/academy/course/${courseId}`),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id={`module-detail-${moduleId}`}
      title={module?.title || 'Módulo Acadêmico'}
      subtitle={`Disciplina: ${course?.title || 'Curso'}`}
      badgeLabel={`Módulo 0${module?.order || 1}`}
      badgeVariant="brand"
      primaryAction={{
        label: lessons.length > 0 ? 'Iniciar 1ª Lição do Módulo' : 'Ver Curso',
        icon: ArrowRight,
        onClick: () => {
          if (lessons.length > 0) {
            navigate(`/academy/lesson/${lessons[0].id}`);
          } else {
            navigate(`/academy/course/${courseId}`);
          }
        },
      }}
      secondaryActions={[
        {
          label: 'Voltar à Disciplina',
          icon: ArrowLeft,
          onClick: () => navigate(`/academy/course/${courseId}`),
        },
      ]}
    >
      <div className="space-y-6 max-w-4xl">
        <Card variant="default" padding="lg" className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Visão Geral do Módulo
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            {module?.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold block">
              Objetivos Modulares:
            </span>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {module?.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-800" />
            Lições Deste Módulo ({lessons.length})
          </h2>

          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <Card
                key={lesson.id}
                id={`module-lesson-card-${lesson.id}`}
                variant="default"
                padding="md"
                className="flex items-center justify-between hover:border-stone-400 cursor-pointer transition-colors"
                onClick={() => navigate(`/academy/lesson/${lesson.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center text-xs font-mono font-semibold">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">
                      {lesson.variants.TRADITIONAL.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} min
                      </span>
                      <span>•</span>
                      <span>{lesson.activityIds.length} Atividade Prática</span>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="ghost">
                  Acessar Lição
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
