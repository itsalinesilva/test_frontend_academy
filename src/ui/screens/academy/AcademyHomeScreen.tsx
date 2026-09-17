import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { CourseCard } from '../../components/domain/CourseCard';
import { LessonCard } from '../../components/domain/LessonCard';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { AudienceToggle } from '../../components/domain/AudienceToggle';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { Program, LearningPath, AcademyCourse, UserAcademyProgress, AudienceVariant, AcademyCategory, AcademyLesson } from '../../../domain/academy';
import {
  Search,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  Target,
  Flame,
} from 'lucide-react';

export const AcademyHomeScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [variant, setVariant] = useState<AudienceVariant>('TRADITIONAL');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [categories, setCategories] = useState<AcademyCategory[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<UserAcademyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadFailed, setLoadFailed] = useState(false);
  const [nextLessons, setNextLessons] = useState<AcademyLesson[]>([]);

  useEffect(() => {
    const loadAcademyHomeData = async () => {
      try {
        const session = await authService.getActiveSession();
        // O catalogo e publico; so o progresso exige sessao. A guarda anterior
        // bloqueava ambos, escondendo o catalogo de visitantes anonimos.
        const userId = session?.user.id;

        const [progs, pths, crss, enrolls, cats] = await Promise.all([
          academyService.getPrograms(),
          academyService.getPaths(),
          academyService.getCourses(),
          userId
            ? academyService.listUserEnrollments(userId)
            : Promise.resolve([]),
          academyService.getCategories(),
        ]);

        setPrograms(progs);
        setPaths(pths);
        setCourses(crss);
        setUserEnrollments(enrolls);
        setCategories(cats);

        // "Próximo passo recomendado" (wireframes/01 §2): as lições ainda não
        // concluídas da disciplina em andamento. Sem matrícula, a seção não
        // aparece — nada de sugestão fabricada.
        const active = enrolls.find((e) => e.progressPercentage < 100);
        if (active) {
          const mods = await academyService.getModules(active.courseId);
          const lessonsByModule = await Promise.all(mods.map((m) => academyService.getLessons(m.id)));
          const pending = lessonsByModule
            .flat()
            .filter((l) => !active.completedLessonIds.includes(l.id))
            .slice(0, 3);
          setNextLessons(pending);
        }
      } catch {
        setLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAcademyHomeData();
  }, []);

  const enrolledCourseMap = new Map(userEnrollments.map((e) => [e.courseId, e]));

  return (
    <PageLayout
      id="academy-home"
      form="detail"
      density="catalog"
      state={isLoading ? 'loading' : loadFailed ? 'error' : courses.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando programas, trilhas e disciplinas…"
      errorProps={{
        title: 'Não foi possível carregar a Academia',
        message: 'Houve uma falha ao buscar o catálogo acadêmico.',
        onRetry: () => window.location.reload(),
      }}
      emptyProps={{
        title: 'Catálogo em construção',
        description:
          'Ainda não há disciplinas publicadas. O currículo nasce da ingestão das fontes acadêmicas.',
        actionLabel: 'Conhecer a plataforma',
        onAction: () => navigate('/help'),
      }}
    >
      <PageLayout.Tabs
        id="academy-home-tabs"
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'courses', label: 'Disciplinas', badge: courses.length || undefined },
          { id: 'paths', label: 'Trilhas', badge: paths.length || undefined },
          { id: 'programs', label: 'Programas', badge: programs.length || undefined },
        ]}
      />

      {/* Trilho fixo: continuidade, cruzamento com Prática e certificação */}
      <PageLayout.Aside>
        <div className="space-y-3">
          <Card variant="default" padding="md" className="space-y-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Seu progresso
            </p>
            {userEnrollments.length === 0 ? (
              <>
                <p className="text-xs leading-relaxed text-stone-600">
                  Você ainda não tem matrícula ativa. A matrícula é gratuita e libera lições,
                  atividades e avaliação.
                </p>
                <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/academy/catalog')}>
                  Explorar catálogo
                </Button>
              </>
            ) : (
              <>
                <dl className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <dt>Em andamento</dt>
                    <dd className="font-mono font-bold">
                      {userEnrollments.filter((e) => e.progressPercentage < 100).length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Concluídas</dt>
                    <dd className="font-mono font-bold">
                      {userEnrollments.filter((e) => e.progressPercentage === 100).length}
                    </dd>
                  </div>
                </dl>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/academy/my-learning')}>
                  Meu aprendizado
                </Button>
              </>
            )}
          </Card>

          {/* Cruzamento Curso → Prática (regra constitucional 1) */}
          <Card variant="accent" padding="md" className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-red-800" aria-hidden="true" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                Prática vinculada
              </p>
            </div>
            <p className="text-xs leading-relaxed text-stone-700">
              Cada lição concluída libera o treino da competência correspondente, com medição real.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/practice/skill-tree')}>
              Abrir treinador
            </Button>
          </Card>

          <Card variant="default" padding="md" className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Registro acadêmico
            </p>
            <div className="flex flex-col gap-1.5">
              <button type="button" onClick={() => navigate('/academy/history')} className="text-left text-xs text-stone-700 hover:underline">
                Histórico de atos acadêmicos
              </button>
              <button type="button" onClick={() => navigate('/academy/academic-profile')} className="text-left text-xs text-stone-700 hover:underline">
                Perfil acadêmico
              </button>
            </div>
          </Card>
        </div>
      </PageLayout.Aside>

      <PageLayout.Main>
      <div className="space-y-8">
        {/* Bridge Academy → Practice */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-white rounded-xl border border-red-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-800/80 text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700/50">
                  Loop de Treinamento Musical
                </span>
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> Ofensiva Ativa
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-white mt-1">
                Do Conceito Teórico à Prática Deliberada
              </h3>
              <p className="text-xs text-stone-300 font-sans">
                Acesse o Practice Hub com medições acústicas em tempo real (pitch, timing, ritmo, intonação) e pontuações canônicas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/practice/skill-tree')}
              className="bg-transparent border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-white text-xs"
            >
              Árvore de Habilidades
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/practice')}
              className="bg-red-800 hover:bg-red-700 text-white text-xs flex items-center gap-1"
            >
              <span>Abrir Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {nextLessons.length > 0 && (
          <PageLayout.Section
            title="Próximo passo recomendado"
            description="As lições pendentes da disciplina que você está cursando."
          >
            <div className="space-y-2">
              {nextLessons.map((lesson, i) => (
                <LessonCard
                  key={lesson.id}
                  id={`next-lesson-${lesson.id}`}
                  orderIndex={i + 1}
                  title={lesson.variants[variant]?.title || lesson.variants.TRADITIONAL.title}
                  durationMinutes={lesson.durationMinutes}
                  type="INTERACTIVE"
                  status={i === 0 ? 'IN_PROGRESS' : 'NOT_STARTED'}
                  onSelect={() => navigate(`/academy/lesson/${lesson.id}`)}
                />
              ))}
            </div>
          </PageLayout.Section>
        )}

        {/* Top Header Controls: Search bar & Audience Mode Switch */}
        <div
          id="academy-home-controls"
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white border border-stone-200 rounded-xl shadow-2xs"
        >
          <div
            id="academy-search-bar-trigger"
            onClick={() => navigate('/academy/search')}
            className="flex items-center gap-2.5 flex-1 max-w-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-xs sm:text-sm text-stone-500 font-sans">
              Buscar programas, trilhas, disciplinas, autores ou competências...
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AudienceToggle
              id="home-audience-toggle"
              variant={variant}
              onChange={(v) => setVariant(v)}
            />
          </div>
        </div>

        {isLoading && (
          <div className="py-8 text-center text-xs text-stone-500 font-mono">
            Carregando ecossistema de aprendizagem...
          </div>
        )}

        {/* Continue Learning Banner if user has any active enrollments */}
        {userEnrollments.length > 0 && (
          <div id="continue-learning-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-red-800" />
                Continuar de Onde Parou
              </h2>
              <button
                type="button"
                onClick={() => navigate('/academy/my-learning')}
                className="text-xs text-red-800 hover:text-red-950 font-medium flex items-center gap-1"
              >
                Ver Todas as Matrículas ({userEnrollments.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userEnrollments.slice(0, 2).map((progress) => {
                const course = courses.find((c) => c.id === progress.courseId);
                if (!course) return null;
                const nextLessonId = progress.lastAccessedLessonId || (course.moduleIds.length > 0 ? 'les_fomt_101_1' : undefined);

                return (
                  <Card
                    key={progress.courseId}
                    id={`active-course-card-${course.id}`}
                    variant="default"
                    padding="md"
                    className="flex flex-col justify-between space-y-4 hover:border-stone-400 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="neutral" size="sm">
                          {course.level}
                        </Badge>
                        <span className="text-xs font-mono text-stone-500">
                          {progress.completedLessonIds.length} lições completadas
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-stone-100">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-stone-600">
                          <span>Progresso da Grade</span>
                          <span className="font-mono font-semibold text-stone-900">
                            {progress.progressPercentage}%
                          </span>
                        </div>
                        <ProgressBar
                          id={`progress-bar-${course.id}`}
                          value={progress.progressPercentage}
                          max={100}
                          sizeVariant="sm"
                          variant="primary"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-stone-500 font-sans">
                          {course.authorName}
                        </span>
                        <Button
                          id={`btn-resume-course-${course.id}`}
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            if (nextLessonId) {
                              navigate(`/academy/lesson/${nextLessonId}`);
                            } else {
                              navigate(`/academy/course/${course.id}`);
                            }
                          }}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories / Cátedras Curriculares */}
        {categories.length > 0 && (
          <div id="academic-categories-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-800" />
                  Cátedras & Áreas de Conhecimento
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  Especializações acadêmicas canônicas com currículos, bibliografia e exames somativos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  variant="default"
                  padding="md"
                  className="hover:border-stone-400 cursor-pointer transition-all space-y-3"
                  onClick={() => navigate(`/academy/category/${cat.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-mono rounded font-semibold uppercase">
                      Cátedra
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-950 hover:text-red-800 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">
                      {cat.skills.length} Competências
                    </span>
                    <span className="text-xs text-red-800 font-semibold flex items-center gap-0.5">
                      Explorar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Academic Programs (Architecture Level 1) */}
        <div id="academic-programs-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                Programas Acadêmicos Integrados
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Ciclos curriculares completos projetados para formação integral e certificação formal.
              </p>
            </div>
            <Button
              id="btn-view-all-catalog"
              variant="outline"
              size="sm"
              onClick={() => navigate('/academy/catalog')}
            >
              Catálogo Completo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Card
                key={program.id}
                id={`program-card-${program.id}`}
                variant="default"
                padding="lg"
                className="flex flex-col justify-between space-y-5 hover:border-stone-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="brand" size="sm">
                      Programa Integrado
                    </Badge>
                    <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {program.workloadHours} horas
                      </span>
                      <span>•</span>
                      <span>{program.estimatedMonths} meses</span>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                    {program.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {program.description}
                  </p>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                    <span className="text-xs font-semibold uppercase font-mono text-stone-700 tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-red-800" />
                      Competências Centrais:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-stone-700">
                      {program.competencies.slice(0, 4).map((comp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                  <span className="text-xs text-stone-500 font-mono">
                    {program.pathIds.length} Trilhas Formativas
                  </span>
                  <Button
                    id={`btn-open-program-${program.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/academy/program/${program.id}`)}
                  >
                    Ver Programa & Trilhas
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Paths (Architecture Level 2) */}
        <div id="learning-paths-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                Trilhas Formativas Graduadas
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Sequências estruturadas de disciplinas por eixo temático e nível de complexidade.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {paths.map((path) => (
              <Card
                key={path.id}
                id={`path-card-${path.id}`}
                variant="default"
                padding="md"
                className="flex flex-col justify-between space-y-4 hover:border-stone-400 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral" size="sm">
                      Nível {path.level}
                    </Badge>
                    <span className="text-xs font-mono text-stone-500">
                      {path.workloadHours}h
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {path.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {path.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {path.skills.slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[11px] rounded font-sans"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  id={`btn-open-path-${path.id}`}
                  size="sm"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate(`/academy/path/${path.id}`)}
                >
                  <span>Explorar Trilha ({path.courseIds.length} Cursos)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Courses Grid (Architecture Level 3) */}
        <div id="courses-catalog-preview-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                Disciplinas Acadêmicas em Destaque
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Aulas auditadas com áudio demonstrativo, partituras interativas e validação de competências.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/academy/catalog')}
              className="text-xs sm:text-sm font-semibold text-red-800 hover:text-red-950 flex items-center gap-1"
            >
              Ver Todas ({courses.length})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const enrollment = enrolledCourseMap.get(course.id);
              return (
                <CourseCard
                  key={course.id}
                  id={`course-card-${course.id}`}
                  title={course.title}
                  description={course.subtitle}
                  instructorName={course.authorName}
                  level={course.level}
                  durationHours={course.workloadHours}
                  modulesCount={course.moduleIds.length}
                  provenanceCitation={course.provenance?.source}
                  progressPercent={enrollment?.progressPercentage}
                  isEnrolled={Boolean(enrollment)}
                  onActionClick={() => navigate(`/academy/course/${course.id}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
