import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Network, Calendar, ArrowRight, Music } from 'lucide-react';

export const WorldsAtlasScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedEra, setSelectedEra] = useState<string>('todos');

  const eras = [
    { id: 'barroco', name: 'Barroco (1600–1750)', worksCount: 142, highlight: 'J. S. Bach, G. F. Händel, A. Vivaldi' },
    { id: 'classico', name: 'Classicismo (1750–1820)', worksCount: 98, highlight: 'W. A. Mozart, J. Haydn, L. v. Beethoven' },
    { id: 'romantico', name: 'Romantismo (1820–1900)', worksCount: 185, highlight: 'F. Chopin, F. Liszt, J. Brahms' },
    { id: 'moderno', name: 'Moderno & Século XX', worksCount: 76, highlight: 'I. Stravinsky, B. Bartók, C. Debussy' },
    { id: 'brasil', name: 'Música Brasileira de Tradição', worksCount: 64, highlight: 'H. Villa-Lobos, C. Guarnieri, E. Nazareth' },
  ];

  const works = [
    {
      id: 'bwv-1001',
      title: 'Sonata nº 1 em Sol menor para Violino Solo (BWV 1001)',
      composer: 'Johann Sebastian Bach',
      era: 'Barroco',
      year: '1720',
      instrument: 'Violino',
      provenance: 'Autógrafo P 967, Staatsbibliothek zu Berlin.',
    },
    {
      id: 'op-28-no-4',
      title: 'Prelúdio em Mi menor, Op. 28 nº 4',
      composer: 'Frédéric Chopin',
      era: 'Romantismo',
      year: '1839',
      instrument: 'Piano',
      provenance: 'Primeira edição francesa (M. Schlesinger, 1839).',
    },
    {
      id: 'bachianas-no-5',
      title: 'Bachianas Brasileiras nº 5: Ária (Cantilena)',
      composer: 'Heitor Villa-Lobos',
      era: 'Música Brasileira',
      year: '1938',
      instrument: 'Voz & 8 Violoncelos',
      provenance: 'Acervo Museu Villa-Lobos / Max Eschig.',
    },
  ];

  return (
    <ScreenContainer
      id="worlds-atlas"
      title="Atlas Musical & Mundos"
      subtitle="Exploração cronológica, geográfica e musicológica do patrimônio musical da humanidade."
      badgeLabel="Patrimônio Histórico"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Explorador em Grafo',
        icon: Network,
        onClick: () => navigate('/worlds/graph'),
      }}
      emptyProps={{
        title: 'Nenhuma obra localizada para este período',
        description: 'Tente selecionar outra era cronológica ou restaurar a visualização completa.',
        actionLabel: 'Ver Todas as Eras',
        onAction: () => setSelectedEra('todos'),
      }}
    >
      <div className="space-y-8">
        {/* Eras Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-800" />
              Eras Cronológicas & Estilos
            </h2>
            <span className="text-xs text-stone-500 font-mono">5 Eras Catalogadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {eras.map((era) => (
              <Card
                key={era.id}
                id={`era-card-${era.id}`}
                variant={selectedEra === era.id ? 'default' : 'muted'}
                padding="md"
                interactive
                onClick={() => setSelectedEra(era.id)}
                className={`cursor-pointer transition-all ${
                  selectedEra === era.id ? 'ring-1 ring-red-800 border-red-800 bg-white' : ''
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-serif font-bold text-stone-900 block truncate">
                    {era.name}
                  </span>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {era.worksCount} obras canônicas
                  </p>
                  <p className="text-[11px] text-stone-600 truncate mt-1">
                    {era.highlight}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Canonical Works */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Music className="w-4 h-4 text-red-800" />
              Obras de Referência com Análise & Áudio
            </h2>
            <span className="text-xs text-stone-500 font-mono">Partituras + Proveniência</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {works.map((work) => (
              <Card
                key={work.id}
                id={`work-card-${work.id}`}
                variant="default"
                padding="lg"
                interactive
                className="space-y-3 flex flex-col justify-between"
                onClick={() => navigate(`/worlds/work/${work.id}`)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral" size="sm">{work.era}</Badge>
                    <span className="text-xs text-stone-500 font-mono">{work.year}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {work.title}
                  </h3>
                  <p className="text-xs font-medium text-stone-700">{work.composer}</p>
                  <p className="text-xs text-stone-500 line-clamp-2 italic">
                    {work.provenance}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-mono">{work.instrument}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/worlds/work/${work.id}`);
                    }}
                  >
                    Estudar Obra <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
