import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';

export const MusicGraphScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedNode, setSelectedNode] = useState<string>('bach');

  const nodes = [
    { id: 'buxtehude', name: 'Dietrich Buxtehude', role: 'Mestre & Precursor', era: 'Barroco Médio' },
    { id: 'bach', name: 'Johann Sebastian Bach', role: 'Síntese Polifônica', era: 'Barroco Tardio' },
    { id: 'cpe-bach', name: 'C. P. E. Bach', role: 'Estilo Sensível (Empfindsamkeit)', era: 'Pré-Clássico' },
    { id: 'mozart', name: 'W. A. Mozart', role: 'Classicismo Vienense', era: 'Classicismo' },
    { id: 'beethoven', name: 'Ludwig van Beethoven', role: 'Transição & Expansão', era: 'Romantismo' },
  ];

  return (
    <ScreenContainer
      id="music-graph"
      title="Grafo de Relações Musicais"
      subtitle="Visualização topológica de influências genealógicas, linhagens pedagógicas e evolução das formas musicais."
      badgeLabel="Grafo de Conhecimento"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao Atlas',
        icon: ArrowLeft,
        onClick: () => navigate('/worlds'),
      }}
      emptyProps={{
        title: 'Grafo sem nós carregados',
        description: 'Não foram localizadas conexões para o filtro de época atual.',
        actionLabel: 'Recarregar Grafo',
        onAction: () => setSelectedNode('bach'),
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Graph Canvas Simulator */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-stone-900 rounded-lg p-6 min-h-[420px] flex flex-col justify-between text-stone-100 relative overflow-hidden border border-stone-800">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="font-mono text-xs text-stone-300">Navegação em Rede Relacional</span>
              </div>
              <div className="flex items-center gap-1 bg-stone-800/80 rounded p-1">
                <button type="button" className="p-1 text-stone-400 hover:text-white rounded" title="Aumentar zoom">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 text-stone-400 hover:text-white rounded" title="Diminuir zoom">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Visual Graph Node Network */}
            <div className="my-8 flex flex-wrap items-center justify-center gap-6 z-10">
              {nodes.map((node) => {
                const isSelected = selectedNode === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-3 rounded-lg border transition-all text-left max-w-xs ${
                      isSelected
                        ? 'bg-red-950/80 border-red-700 ring-2 ring-red-600 text-white shadow-lg'
                        : 'bg-stone-800/90 border-stone-700 text-stone-300 hover:bg-stone-800 hover:border-stone-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-bold">{node.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400">
                        {node.era}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">{node.role}</p>
                  </button>
                );
              })}
            </div>

            {/* Bottom Status */}
            <div className="text-[11px] font-mono text-stone-500 z-10 flex items-center justify-between">
              <span>Arco Selecionado: Linhagem Polifônica Norte-Alemã → Classicismo</span>
              <span>5 Nós • 8 Arestas Direcionadas</span>
            </div>
          </div>
        </div>

        {/* Right Col: Inspector of Selected Node */}
        <div className="space-y-4">
          <Card variant="default" padding="lg" className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Detalhes do Vértice
            </h3>
            <p className="text-xs text-stone-500 font-mono">ID: {selectedNode}</p>

            <div className="space-y-2 text-xs text-stone-700 pt-2 border-t border-stone-100">
              <p>
                <strong className="text-stone-900">Influenciou diretamente:</strong> Carl Philipp Emanuel Bach, W. A. Mozart (estudo dos motetos e fugas), Felix Mendelssohn (redescoberta em 1829).
              </p>
              <p>
                <strong className="text-stone-900">Formas associadas:</strong> Fuga, Prelúdio coral, Tocata, Sonata de Igreja, Concerto Grosso.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/worlds/work/bwv-1001')}
              >
                Explorar Obras Vinculadas <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
