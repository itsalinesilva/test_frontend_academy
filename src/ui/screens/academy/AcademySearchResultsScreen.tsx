import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCourse, AcademyCategory } from '../../../domain/academy';
import {
  Search,
  Clock,
  Award,
  ArrowRight,
  GraduationCap,
  X,
} from 'lucide-react';

export const AcademySearchResultsScreen: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const searchPart = currentPath.includes('?')
    ? currentPath.split('?')[1]
    : typeof window !== 'undefined'
    ? window.location.search.replace(/^\?/, '')
    : '';
  const urlParams = new URLSearchParams(searchPart);
  const initialQuery = urlParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'workload' | 'name'>('relevance');

  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [categories, setCategories] = useState<AcademyCategory[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [cats, searchRes] = await Promise.all([
          academyService.getCategories(),
          academyService.searchCatalog(searchQuery),
        ]);
        setCategories(cats);
        setCourses(searchRes.courses);
      } catch (err) {
        console.error('Error in search results:', err);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || c.level.toLowerCase() === selectedLevel.toLowerCase();
    return matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'workload') return b.workloadHours - a.workloadHours;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <PageLayout
      id="academysearchresults"
      form="catalog"
      density="catalog"
      asideLabel="Filtrar resultados"
      state={'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Resultados
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/academia/search')}>
            Nova busca
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      <div className="space-y-6">
        {/* Top Search Filter Bar */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
        aria-label="Refinar termo de busca"
              type="text"
              placeholder="Refinar termo de busca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-stone-900 w-full focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-stone-100">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase text-stone-500 font-semibold">Cátedra:</span>
              <select
        aria-label="Cátedra"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs text-stone-800"
              >
                <option value="all">Todas as Cátedras</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase text-stone-500 font-semibold">Nível:</span>
              <select
        aria-label="Nível"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs text-stone-800"
              >
                <option value="all">Todos os Níveis</option>
                <option value="fundamental">Fundamental</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase text-stone-500 font-semibold">Ordenar:</span>
              <select
        aria-label="Ordenar"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'workload' | 'name')}
                className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs text-stone-800"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="workload">Maior Carga Horária</option>
                <option value="name">Alfabética (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Disciplinas Correspondentes ({filteredCourses.length})
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              Filtro ativo: {selectedCategory === 'all' ? 'Todas as Categorias' : selectedCategory}
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <Card variant="muted" padding="lg" className="text-center py-12">
              <p className="text-stone-500 text-sm">
                Nenhum resultado acadêmico corresponde à consulta &quot;{searchQuery}&quot;.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
              >
                Redefinir Filtros
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((crs) => (
                <Card
                  key={crs.id}
                  id={`search-result-course-${crs.id}`}
                  variant="default"
                  padding="lg"
                  className="space-y-4 hover:border-stone-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="sm">{crs.level}</Badge>
                      <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {crs.workloadHours} horas
                      </span>
                    </div>

                    <h4
                      onClick={() => navigate(`/academia/course/${crs.id}`)}
                      className="font-serif font-bold text-base text-stone-950 hover:text-anil-800 cursor-pointer"
                    >
                      {crs.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {crs.description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 border-t border-stone-100">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                      <span className="text-xs font-medium text-stone-800">
                        {crs.authorName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Certificação Digital
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/academia/course/${crs.id}`)}
                    >
                      Ver Disciplina
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
