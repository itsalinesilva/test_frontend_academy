import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { AudienceToggle } from '../../components/domain/AudienceToggle';
import { LessonBlockRenderer } from '../../components/academy/LessonBlocks';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyLesson,
  AcademyCourse,
  AcademyModule,
  AcademyActivity,
  AudienceVariant,
  UserAcademyProgress,
  LessonBlock,
  LessonSection,
} from '../../../domain/academy';
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Target,
  Clock,
  Lock,
  ListTree,
} from 'lucide-react';

/**
 * Ambiente de aula.
 *
 * RECOMPOSIÇÃO (wireframes/01_ACADEMY_COURSERA §5):
 *
 * 1. **Sumário do curso fixo à esquerda.** É ele que faz a tela parecer uma
 *    aula em vez de um artigo: a pessoa sempre sabe onde está na disciplina
 *    e alcança qualquer lição sem voltar.
 *
 * 2. **Blocos interativos intercalados no texto.** A versão anterior
 *    separava o conteúdo em abas — leitura, áudio, partitura, vídeo — o que
 *    afastava a demonstração da afirmação que ela demonstra. Agora o
 *    laboratório aparece exatamente onde o conceito é introduzido, e os
 *    resultados vêm dos motores reais de teoria e áudio.
 *
 * 3. **CTA de prática contextual.** Aponta para a habilidade correspondente,
 *    não para `/practice` genérico — é o que cumpre a regra constitucional 1
 *    (Curso → Prática) em vez de apenas sugeri-la.
 */

/** Converte o formato legado (`contentMarkdown` + `callout`) em blocos. */
function sectionToBlocks(section: LessonSection): LessonBlock[] {
  if (section.blocks?.length) return section.blocks;
  const blocks: LessonBlock[] = [
    { kind: 'MARKDOWN', id: `${section.id}-md`, markdown: section.contentMarkdown },
  ];
  if (section.callout) {
    blocks.push({
      kind: 'CALLOUT',
      id: `${section.id}-callout`,
      type: section.callout.type,
      title: section.callout.title,
      text: section.callout.text,
    });
  }
  return blocks;
}

export const LessonReaderScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const lessonId = params.id;

  const [variant, setVariant] = useState<AudienceVariant>('TRADITIONAL');
  const [lesson, setLesson] = useState<AcademyLesson | null>(null);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [module, setModule] = useState<AcademyModule | null>(null);
  const [moduleLessons, setModuleLessons] = useState<AcademyLesson[]>([]);
  const [activities, setActivities] = useState<AcademyActivity[]>([]);
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const l = await academyService.getLesson(lessonId);
      if (!l) {
        setLesson(null);
        return;
      }
      setLesson(l);

      const session = await authService.getActiveSession();
      const [c, m, acts, prog, siblings] = await Promise.all([
        academyService.getCourse(l.courseId),
        academyService.getModule(l.moduleId),
        academyService.getActivities(l.id),
        session ? academyService.getUserProgress(session.user.id, l.courseId) : Promise.resolve(null),
        academyService.getLessons(l.moduleId),
      ]);
      setCourse(c);
      setModule(m);
      setActivities(acts);
      setProgress(prog);
      setModuleLessons(siblings);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  const isCompleted = !!progress?.completedLessonIds.includes(lessonId ?? '');
  const content = lesson ? lesson.variants[variant] || lesson.variants.TRADITIONAL : null;

  const { previous, next } = useMemo(() => {
    const i = moduleLessons.findIndex((l) => l.id === lessonId);
    return {
      previous: i > 0 ? moduleLessons[i - 1] : null,
      next: i >= 0 && i < moduleLessons.length - 1 ? moduleLessons[i + 1] : null,
    };
  }, [moduleLessons, lessonId]);

  const handleComplete = async () => {
    const session = await authService.getActiveSession();
    if (!session || !lesson) return;
    setIsMarkingComplete(true);
    try {
      setProgress(await academyService.completeLesson(session.user.id, lesson.id));
      if (next) navigate(`/academy/lesson/${next.id}`);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Rota sem parâmetro válido: estado explícito, sem substituir por lição fixa.
  if (!lessonId) {
    return (
      <PageLayout
        id="lesson-missing-id"
        form="focus"
        state="error"
        errorProps={{
          title: 'Lição não identificada',
          message: 'O endereço acessado não indica qual lição abrir.',
          onRetry: () => navigate('/academy/catalog'),
        }}
      >
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  // Sem matrícula a lição não abre — mas a pessoa descobre POR QUE e COMO
  // desbloquear, em vez de bater numa porta muda (wireframes/01 §4).
  const isLocked = !isLoading && !loadFailed && !!lesson && !progress;

  const pageState = isLoading
    ? 'loading'
    : loadFailed
    ? 'error'
    : !lesson || !content
    ? 'empty'
    : isLocked
    ? 'locked'
    : 'content';

  return (
    <PageLayout
      id={`lesson-${lessonId}`}
      form="detail"
      density="editorial"
      state={pageState}
      asideLabel="Conteúdo do curso"
      loadingMessage="Carregando a lição e seus laboratórios…"
      errorProps={{
        title: 'Não foi possível abrir a lição',
        message: 'Houve uma falha ao carregar o conteúdo acadêmico.',
        onRetry: () => void loadLesson(),
      }}
      lockedProps={{
        title: 'Matricule-se para acessar esta lição',
        description: course
          ? `Esta lição pertence à disciplina "${course.title}". A matrícula é gratuita e libera todo o conteúdo do curso.`
          : 'A matrícula na disciplina libera o conteúdo desta lição.',
        requirementText: 'Matrícula na disciplina',
        unlockActionLabel: 'Ver a disciplina',
        onUnlockAction: () => course && navigate(`/academy/course/${course.id}`),
      }}
      emptyProps={{
        title: 'Lição não encontrada',
        description: `O identificador [${lessonId}] não corresponde a uma lição do currículo.`,
        actionLabel: 'Voltar ao catálogo',
        onAction: () => navigate('/academy/catalog'),
      }}
    >
      {/* ------------------------------------------------- SUMÁRIO FIXO --- */}
      <PageLayout.Aside>
        <div className="space-y-3">
          <Card variant="default" padding="md" className="space-y-3">
            <div className="flex items-center gap-1.5 text-stone-500">
              <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                Conteúdo do curso
              </p>
            </div>

            {course && (
              <button
                type="button"
                onClick={() => navigate(`/academy/course/${course.id}`)}
                className="block text-left font-serif text-sm font-bold text-stone-900 hover:underline"
              >
                {course.title}
              </button>
            )}

            {progress && (
              <div className="space-y-1">
                <ProgressBar
                  id="lesson-course-progress"
                  value={progress.progressPercentage}
                  max={100}
                  label={`Progresso no curso: ${progress.progressPercentage}%`}
                />
                <p className="font-mono text-[11px] text-stone-500">
                  {progress.progressPercentage}% concluído
                </p>
              </div>
            )}

            <nav aria-label="Lições do módulo" className="space-y-0.5 border-t border-stone-100 pt-2">
              {module && (
                <p className="px-1 pb-1 font-mono text-[10px] uppercase text-stone-400">
                  {module.title}
                </p>
              )}
              {moduleLessons.map((l, i) => {
                const done = !!progress?.completedLessonIds.includes(l.id);
                const current = l.id === lessonId;
                const locked = !progress && i > 0;
                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={locked}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => navigate(`/academy/lesson/${l.id}`)}
                    className={[
                      'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors',
                      current ? 'bg-red-50 font-semibold text-red-900' : 'text-stone-700 hover:bg-stone-50',
                      locked && 'cursor-not-allowed text-stone-400',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    ) : locked ? (
                      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-center font-mono text-[10px] leading-4">
                        {i + 1}
                      </span>
                    )}
                    <span className="line-clamp-2">
                      {l.variants[variant]?.title || l.variants.TRADITIONAL.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card variant="default" padding="md" className="space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
              <span>{lesson?.durationMinutes} min de leitura estimada</span>
            </div>
          </Card>
        </div>
      </PageLayout.Aside>

      {/* -------------------------------------------------- CORPO DA AULA --- */}
      <PageLayout.Main>
        <article className="space-y-8">
          <header className="space-y-3 border-b border-stone-200 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              {module && <Badge variant="neutral">{module.title}</Badge>}
              {isCompleted && <Badge variant="brand">Concluída</Badge>}
              <div className="ml-auto">
                <AudienceToggle variant={variant} onChange={setVariant} />
              </div>
            </div>

            <h1 className="font-serif text-3xl font-bold leading-tight text-stone-900">
              {content?.title}
            </h1>
            <p className="text-base leading-relaxed text-stone-600">{content?.summary}</p>

            {lesson && lesson.objectives.length > 0 && (
              <ul className="space-y-1 rounded-md bg-stone-50 p-3">
                {lesson.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            )}
          </header>

          {content?.introduction && (
            <p className="text-[17px] leading-relaxed text-stone-800 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.85] first-letter:text-anil-900">
              {content.introduction}
            </p>
          )}

          {/* Seções com blocos interativos intercalados */}
          {content?.sections.map((section) => (
            <PageLayout.Section key={section.id} title={section.title} className="space-y-4">
              {sectionToBlocks(section).map((block) => (
                <LessonBlockRenderer key={block.id} block={block} />
              ))}
            </PageLayout.Section>
          ))}

          {/* Prática vinculada — regra constitucional 1 */}
          {lesson && lesson.skills.length > 0 && (
            <Card variant="accent" padding="lg" className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-anil-800" aria-hidden="true" />
                <h2 className="font-serif text-base font-bold text-stone-900">
                  Pratique esta competência
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-stone-700">
                Esta lição desenvolve {lesson.skills.length === 1 ? 'a competência' : 'as competências'}{' '}
                <strong>{lesson.skills.join(', ')}</strong>. O treinador mede sua precisão e
                registra a evolução no seu perfil.
              </p>
              <div className="flex flex-wrap gap-2">
                {activities.map((a) => (
                  <Button key={a.id} variant="outline" size="sm" onClick={() => navigate(`/academy/activity/${a.id}`)}>
                    {a.variants?.[variant]?.instruction || 'Atividade prática'}
                  </Button>
                ))}
                <Button variant="primary" size="sm" onClick={() => navigate('/practice/skill-tree')}>
                  Abrir no Treinador
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          )}

          {/* Navegação entre lições */}
          <nav
            aria-label="Navegação entre lições"
            className="flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            {previous ? (
              <Button variant="outline" size="sm" onClick={() => navigate(`/academy/lesson/${previous.id}`)}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Lição anterior
              </Button>
            ) : (
              <span />
            )}

            <Button
              variant="primary"
              size="md"
              disabled={isMarkingComplete}
              onClick={handleComplete}
            >
              {isCompleted ? (
                <>Revisada · seguir {next ? 'para a próxima' : 'adiante'}</>
              ) : (
                <>Concluir lição {next && 'e seguir'}</>
              )}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </nav>
        </article>
      </PageLayout.Main>
    </PageLayout>
  );
};
