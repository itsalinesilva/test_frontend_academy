import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { Program, LearningPath, AcademyCourse } from '../../../domain/academy';
import { Search, X, Layers, Award, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

export const AcademySearchScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const doSearch = async () => {
      setIsSearching(true);
      try {
        const results = await academyService.searchCatalog(
          query,
          selectedLevel !== 'todos' ? { level: selectedLevel } : undefined
        );
        setPrograms(results.programs);
        setPaths(results.paths);
        setCourses(results.courses);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(doSearch, 150);
    return () => clearTimeout(timer);
  }, [query, selectedLevel]);

  const totalResults = programs.length + paths.length + courses.length;

  const quickSkills = [
    'Notação Alfabética',
    'Oitavas Acústicas',
    'Escalas Maiores',
    'Tríades Primárias',
    'Contraponto Estrito',
    'Harmonia Funcional',
  ];

  return (
    <ScreenContainer
      id="academy-search-screen"
      title="Busca Curricular & Competências"
      subtitle="Localize disciplinas, trilhas formativas, programas e conceitos teóricos em toda a Academia."
      badgeLabel="Motor de Busca"
      badgeVariant="neutral"
      secondaryActions={[
        {
          label: 'Ver Catálogo Completo',
          onClick: () => navigate('/academy/catalog'),
        },
      ]}
    >
      <div className="space-y-6">
        {/* Search Bar & Quick Tags */}
        <div className="space-y-3 bg-white p-4 border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              id="academy-main-search-input"
              type="text"
              placeholder="Digite um conceito, nota, escala, regra ou professor (ex: oitava, tríade, Schumann, Fux)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none w-full font-sans"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-700"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Skill Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-mono text-stone-500 mr-1">Sugestões:</span>
            {quickSkills.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => setQuery(sk)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  query === sk
                    ? 'bg-stone-900 text-white border-stone-900 font-medium'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-mono">Nível de Dificuldade:</span>
            {['todos', 'fundamental', 'intermediario', 'avancado'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2 py-0.5 rounded capitalize ${
                  selectedLevel === lvl
                    ? 'bg-stone-800 text-white font-medium'
                    : 'text-stone-600 hover:text-stone-900 bg-stone-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>{totalResults} resultado(s) localizado(s)</span>
          {isSearching && <span>Buscando...</span>}
        </div>

        {/* Results List */}
        {totalResults === 0 ? (
          <Card variant="muted" padding="xl" className="text-center space-y-3">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Nenhum item localizado
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Tente buscar por termos como "oitava", "escala", "tríade", "contraponto" ou navegue pelo catálogo completo.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQuery('');
                setSelectedLevel('todos');
              }}
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Courses Matches */}
            {courses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-red-800" />
                  Disciplinas Acadêmicas ({courses.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      variant="default"
                      padding="md"
                      className="space-y-3 flex flex-col justify-between hover:border-stone-400 cursor-pointer transition-colors"
                      onClick={() => navigate(`/academy/course/${course.id}`)}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="neutral" size="sm">{course.level}</Badge>
                          <span className="text-xs font-mono text-stone-500">{course.workloadHours}h</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-stone-900">{course.title}</h4>
                        <p className="text-xs text-stone-600 line-clamp-2">{course.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-red-800 font-medium pt-2 border-t border-stone-100">
                        <span>Acessar Disciplina</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Paths Matches */}
            {paths.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-stone-700" />
                  Trilhas Formativas ({paths.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paths.map((path) => (
                    <Card
                      key={path.id}
                      variant="default"
                      padding="md"
                      className="space-y-2 flex flex-col justify-between hover:border-stone-400 cursor-pointer transition-colors"
                      onClick={() => navigate(`/academy/path/${path.id}`)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="neutral" size="sm">{path.level}</Badge>
                          <span className="text-xs font-mono text-stone-500">{path.workloadHours}h</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900">{path.title}</h4>
                        <p className="text-xs text-stone-600 line-clamp-2">{path.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-700 font-medium pt-1 border-t border-stone-100">
                        <span>Ver Trilha ({path.courseIds.length} cursos)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Programs Matches */}
            {programs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-800" />
                  Programas Integrados ({programs.length})
                </h3>
                <div className="space-y-3">
                  {programs.map((program) => (
                    <Card
                      key={program.id}
                      variant="default"
                      padding="md"
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-stone-400 cursor-pointer transition-colors"
                      onClick={() => navigate(`/academy/program/${program.id}`)}
                    >
                      <div className="space-y-1 max-w-xl">
                        <Badge variant="brand" size="sm">Programa Curricular</Badge>
                        <h4 className="font-serif font-bold text-base text-stone-900">{program.title}</h4>
                        <p className="text-xs text-stone-600 line-clamp-2">{program.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        Ver Programa
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
