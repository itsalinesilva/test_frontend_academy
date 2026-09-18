import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { CourseCard } from '../../components/domain/CourseCard';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { Program, LearningPath, AcademyCourse } from '../../../domain/academy';
import { Award, ArrowRight, Search, Layers, GraduationCap } from 'lucide-react';

export const AcademyCatalogScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [contentType, setContentType] = useState<'all' | 'courses' | 'paths' | 'programs'>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [progs, pths, crss] = await Promise.all([
          academyService.getPrograms(),
          academyService.getPaths(),
          academyService.getCourses(),
        ]);
        setPrograms(progs);
        setPaths(pths);
        setCourses(crss);
      } catch (e) {
        console.error('Error loading catalog:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredPrograms = programs.filter((p) => {
    if (contentType !== 'all' && contentType !== 'programs') return false;
    const match = `${p.title} ${p.subtitle} ${p.description} ${p.competencies.join(' ')}`.toLowerCase();
    return !normalizedSearch || match.includes(normalizedSearch);
  });

  const filteredPaths = paths.filter((pth) => {
    if (contentType !== 'all' && contentType !== 'paths') return false;
    if (selectedLevel !== 'todos' && pth.level.toLowerCase() !== selectedLevel.toLowerCase()) return false;
    const match = `${pth.title} ${pth.subtitle} ${pth.description} ${pth.skills.join(' ')}`.toLowerCase();
    return !normalizedSearch || match.includes(normalizedSearch);
  });

  const filteredCourses = courses.filter((c) => {
    if (contentType !== 'all' && contentType !== 'courses') return false;
    if (selectedLevel !== 'todos' && c.level.toLowerCase() !== selectedLevel.toLowerCase()) return false;
    const match = `${c.title} ${c.subtitle} ${c.description} ${c.authorName} ${c.competencies.join(' ')}`.toLowerCase();
    return !normalizedSearch || match.includes(normalizedSearch);
  });

  const totalResults = filteredPrograms.length + filteredPaths.length + filteredCourses.length;

  return (
    <PageLayout
      id="academy-catalog"
      form="catalog"
      density="catalog"
      asideLabel="Filtros do catálogo"
      state={isLoading ? 'loading' : totalResults === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando o catálogo acadêmico…"
      emptyProps={{
        title: 'Nenhum resultado encontrado',
        description: searchTerm
          ? `Não há registros para "${searchTerm}" com os filtros aplicados.`
          : 'Não há registros com os filtros aplicados.',
        actionLabel: 'Limpar filtros',
        onAction: () => {
          setSearchTerm('');
          setContentType('all');
          setSelectedLevel('todos');
        },
      }}
    >
      {/* Filtros no trilho FIXO: acompanham a rolagem dos resultados, em vez
          de sair da tela assim que a pessoa comeca a percorrer a lista. */}
      <PageLayout.Aside>
        {/* Search & Filter Toolbar */}
        <div
          id="academy-catalog-toolbar"
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white border border-stone-200 rounded-xl shadow-2xs"
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              id="academy-catalog-search-input"
              type="text"
              placeholder="Buscar por disciplina, trilha, autor ou competência…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none w-full font-sans"
            />
          </div>

          {/* Controls: Type and Level */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type selector */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setContentType('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  contentType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setContentType('programs')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  contentType === 'programs' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Programas ({programs.length})
              </button>
              <button
                type="button"
                onClick={() => setContentType('paths')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  contentType === 'paths' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Trilhas ({paths.length})
              </button>
              <button
                type="button"
                onClick={() => setContentType('courses')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  contentType === 'courses' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Disciplinas ({courses.length})
              </button>
            </div>

            {/* Level selector */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs">
              <span className="text-[11px] text-stone-500 font-mono px-2">Nível:</span>
              {['todos', 'fundamental', 'intermediario', 'avancado'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    selectedLevel === lvl ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageLayout.Aside>

      <PageLayout.Main>
        <div className="space-y-6">
          <p className="font-mono text-xs text-stone-500" role="status" aria-live="polite">
            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
          </p>

        {/* Results Sections */}
        {(
          <>
            {/* 1. Programs */}
        {filteredPrograms.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-anil-800" />
              Programas Formativos Integrados ({filteredPrograms.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPrograms.map((prog) => (
                <Card
                  key={prog.id}
                  id={`prog-${prog.id}`}
                  variant="default"
                  padding="lg"
                  className="space-y-4 flex flex-col justify-between hover:border-stone-400 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="sm">Programa</Badge>
                      <span className="text-xs font-mono text-stone-500">{prog.workloadHours} horas</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-stone-900">{prog.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{prog.description}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-mono">{prog.pathIds.length} Trilhas</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/academy/program/${prog.id}`)}
                    >
                      Acessar Programa
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 2. Paths */}
        {filteredPaths.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-stone-700" />
              Trilhas de Aprendizagem ({filteredPaths.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredPaths.map((path) => (
                <Card
                  key={path.id}
                  id={`path-${path.id}`}
                  variant="default"
                  padding="md"
                  className="space-y-3 flex flex-col justify-between hover:border-stone-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" size="sm">{path.level}</Badge>
                      <span className="text-xs font-mono text-stone-500">{path.workloadHours}h</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">{path.title}</h3>
                    <p className="text-xs text-stone-600 line-clamp-2">{path.description}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => navigate(`/academy/path/${path.id}`)}
                  >
                    <span>Ver Cursos ({path.courseIds.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 3. Courses */}
        {filteredCourses.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-stone-700" />
              Disciplinas Acadêmicas ({filteredCourses.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={`course-${course.id}`}
                  title={course.title}
                  description={course.subtitle}
                  instructorName={course.authorName}
                  level={course.level}
                  durationHours={course.workloadHours}
                  modulesCount={course.moduleIds.length}
                  onActionClick={() => navigate(`/academy/course/${course.id}`)}
                />
              ))}
            </div>
          </div>
        )}
          </>
        )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
