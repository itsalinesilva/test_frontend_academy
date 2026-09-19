import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCategory, AcademyCourse } from '../../../domain/academy';
import {
  Clock,
  Award,
  ArrowRight,
  GraduationCap,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

export const CategoryDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const categoryId = params.id;

  const [category, setCategory] = useState<AcademyCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [allCategories, setAllCategories] = useState<AcademyCategory[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadCategoryData = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!categoryId) return;
      try {
        const [cats, allCrs] = await Promise.all([
          academyService.getCategories(),
          academyService.getCourses(),
        ]);

        setAllCategories(cats);
        const cat = cats.find((c) => c.id === categoryId || c.slug === categoryId);
        if (cat) {
          setCategory(cat);
          const filteredCourses = allCrs.filter(
            (c) => c.categoryId === cat.id || (cat.featuredCourseIds && cat.featuredCourseIds.includes(c.id))
          );
          setCourses(filteredCourses.length > 0 ? filteredCourses : allCrs.slice(0, 2));
        } else {
          // fallback to first
          setCategory(cats[0] || null);
          setCourses(allCrs.slice(0, 2));
        }
      } catch (err) {
        console.error('Error loading category:', err);
      }
      setIsLoading(false);
    };

    loadCategoryData();
  }, [categoryId]);

  const filteredCourses = courses.filter((c) => {
    const matchesLevel = selectedLevel === 'all' || c.level.toLowerCase() === selectedLevel.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  return (
    <PageLayout
      id="categorydetail"
      form="catalog"
      density="catalog"
      asideLabel="Filtros da catedra"
      state={isLoading ? 'loading' : !category ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Catedra
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Disciplinas</dt>
              <dd className="font-mono font-bold">{courses.length}</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/academia/catalog')}>
            Catalogo completo
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      <div className="space-y-8">
        {/* Category Hero / Header Banner */}
        <Card variant="muted" padding="lg" className="border-stone-200 bg-gradient-to-r from-stone-50 via-white to-stone-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold uppercase bg-stone-200 text-stone-800 rounded">
                  Cátedra Curricular
                </span>
                <span className="text-xs text-stone-500">• {courses.length} Disciplinas Credenciadas</span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-stone-950">
                {category?.name}
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed max-w-2xl font-sans">
                {category?.description}
              </p>

              {/* Skills Tags */}
              <div className="pt-2">
                <span className="text-xs font-mono uppercase text-stone-500 font-semibold block mb-1.5">
                  Competências Desenvolvidas nesta Cátedra:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {category?.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 text-xs rounded-md shadow-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs text-stone-500 font-medium">Grau de Proficiência</span>
                <Badge variant="brand" size="sm">Universitário</Badge>
              </div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs text-stone-500 font-medium">Formatos Pedagógicos</span>
                <span className="text-xs font-semibold text-stone-800">Partituras & Laboratório</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Certificação</span>
                <span className="text-xs font-mono font-semibold text-emerald-700">Digital Canônica</span>
              </div>
              <Button
                id="btn-cat-search"
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => navigate('/academia/search')}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Buscar nas Disciplinas
              </Button>
            </div>
          </div>
        </Card>

        {/* Categories Carousel Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-600" />
              Navegar por outras Cátedras
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {allCategories.map((c) => {
              const isCurrent = c.id === category?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/academia/category/${c.id}`)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold">Nível:</span>
            <div className="flex gap-1">
              {['all', 'fundamental', 'intermediario', 'avancado'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 text-xs rounded font-medium capitalize transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-anil-800 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
        aria-label="Filtrar nesta categoria"
              type="text"
              placeholder="Filtrar nesta categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-400 font-sans"
            />
          </div>
        </div>

        {/* Course Catalog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Disciplinas Acadêmicas ({filteredCourses.length})
            </h3>
            <span className="text-xs text-stone-500">
              Ordenadas por plano curricular canônico
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <Card variant="muted" padding="lg" className="text-center py-12">
              <p className="text-stone-500 text-sm">Nenhuma disciplina encontrada com os filtros selecionados.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
              >
                Limpar Filtros
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((crs) => (
                <Card
                  key={crs.id}
                  id={`course-card-${crs.id}`}
                  variant="default"
                  padding="lg"
                  className="space-y-4 hover:border-stone-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="sm">{crs.level}</Badge>
                      <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {crs.workloadHours}h estimadas
                      </span>
                    </div>

                    <h4
                      onClick={() => navigate(`/academia/course/${crs.id}`)}
                      className="font-serif font-bold text-base text-stone-950 hover:text-anil-800 cursor-pointer transition-colors"
                    >
                      {crs.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {crs.subtitle || crs.description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 border-t border-stone-100">
                      <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        {crs.authorAvatarUrl ? (
                          <img src={crs.authorAvatarUrl} alt={crs.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5 m-auto text-stone-600" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-stone-800">
                        {crs.authorName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Certificado Emitido
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/academia/course/${crs.id}`)}
                    >
                      Ver Detalhes do Curso
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
