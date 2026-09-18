import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { Search, ArrowRight, BookOpen, Music, Users } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'tudo' | 'cursos' | 'obras' | 'salas'>('tudo');

  const sampleResults = [
    {
      id: 'res-1',
      type: 'Curso',
      title: 'Harmonia e Teoria Fundamental',
      context: 'Academia • Cátedra de Teoria',
      link: '/academy/course/harmonia-fundamental',
      icon: BookOpen,
    },
    {
      id: 'res-2',
      type: 'Obra Canônica',
      title: 'Sonata nº 1 em Sol menor (BWV 1001) - J. S. Bach',
      context: 'Atlas Musical • Período Barroco',
      link: '/worlds/work/bwv-1001',
      icon: Music,
    },
    {
      id: 'res-3',
      type: 'Sala de Aula',
      title: 'Cátedra Chopin: Prática e Interpretação Romântica',
      context: 'Salas & Mestres • Prof. Gabriel Carvalho',
      link: '/rooms/sala-chopin',
      icon: Users,
    },
  ];

  return (
    <ScreenContainer
      id="global-search"
      title="Busca Global na Academia"
      subtitle="Pesquise em todo o catálogo curricular, obras do Atlas, salas de aula e tópicos do fórum."
      badgeLabel="Omnisearch"
      badgeVariant="neutral"
      emptyProps={{
        title: 'Nenhum resultado encontrado',
        description: 'Tente utilizar termos mais amplos ou verificar a grafia do autor ou obra.',
        actionLabel: 'Limpar Termos de Busca',
        onAction: () => setQuery(''),
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="omnisearch-input"
            type="text"
            aria-label="Buscar em toda a plataforma"
            placeholder="Buscar por compositor, título de obra, lição, sala ou termo teórico…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-anil-800 bg-white shadow-sm"
          />
        </div>

        {/* Search Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'tudo', label: 'Tudo' },
            { id: 'cursos', label: 'Cursos & Lições' },
            { id: 'obras', label: 'Obras & Partituras' },
            { id: 'salas', label: 'Salas de Aula' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500">
            Resultados Encontrados ({sampleResults.length})
          </h2>

          <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white overflow-hidden">
            {sampleResults.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.link)}
                  className="w-full p-3.5 text-left hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-stone-100 text-stone-700">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-900">{item.title}</span>
                        <Badge variant="neutral" size="sm">{item.type}</Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{item.context}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
