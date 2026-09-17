import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ScoreContainer } from '../../components/domain/ScoreContainer';
import { TimelineContainer } from '../../components/domain/TimelineContainer';
import { BookOpen, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

export const WorkDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const workId = params.id;
  const [activeTab, setActiveTab] = useState<'contexto' | 'escuta' | 'partitura' | 'pratica'>('contexto');

  const work = {
    id: workId,
    title: 'Sonata nº 1 em Sol menor para Violino Solo (BWV 1001)',
    composer: 'Johann Sebastian Bach (1685–1750)',
    era: 'Barroco Tardio',
    compositionDate: '1720 (Köthen)',
    key: 'Sol menor (G minor)',
    movements: ['I. Adagio', 'II. Fuga (Allegro)', 'III. Siciliana', 'IV. Presto'],
    provenance: 'Baseado no manuscrito autógrafo original P 967 preservado na Biblioteca Estatal de Berlim.',
    analysis:
      'A Sonata BWV 1001 inaugura o ciclo dos Seis Solos para Violino sem Baixo Acompanhante. O Adagio inicial é uma elaboração altamente ornamentada sobre um esquema harmônico rigoroso, desafiando o instrumentista a sustentar a polifonia implícita por meio de arpejos e paradas duplas.',
  };

  return (
    <ScreenContainer
      id="work-detail"
      title={work.title}
      subtitle={`Compositor: ${work.composer} • ${work.era} (${work.compositionDate})`}
      badgeLabel={work.key}
      badgeVariant="neutral"
      primaryAction={{
        label: 'Praticar no Simulador',
        icon: Sparkles,
        onClick: () => setActiveTab('pratica'),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Atlas',
          icon: ArrowLeft,
          onClick: () => navigate('/worlds'),
        },
      ]}
      emptyProps={{
        title: 'Obra não localizada no Atlas',
        description: `O registro para [${workId}] não foi localizado no acervo histórico.`,
        actionLabel: 'Ver Todas as Obras',
        onAction: () => navigate('/worlds'),
      }}
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('contexto')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contexto'
                ? 'border-anil-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Contexto & Análise
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('escuta')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'escuta'
                ? 'border-anil-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Escuta Analítica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partitura')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'partitura'
                ? 'border-anil-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Partitura Histórica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pratica')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pratica'
                ? 'border-anil-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Prática & Exercícios
          </button>
        </div>

        {/* Tab 1: Contexto */}
        {activeTab === 'contexto' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="default" padding="lg" className="lg:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Análise Musicológica e Estrutura Formal
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {work.analysis}
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                  Movimentos da Obra:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {work.movements.map((mov, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-stone-200 bg-stone-50 text-xs font-mono text-stone-800"
                    >
                      {mov}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card variant="muted" padding="md" className="space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-anil-800" />
                  <span>Fonte Primária Auditada</span>
                </div>
                <p className="text-xs text-stone-600">
                  {work.provenance}
                </p>
              </Card>

              <Card variant="default" padding="md" className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-900 uppercase">Cursos Conectados</h4>
                <p className="text-xs text-stone-600">
                  Esta obra integra a grade do curso de Contraponto e Prática Instrumental Barroca.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/academy/course/contraponto-modal')}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Ver Curso na Academia
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Escuta */}
        {activeTab === 'escuta' && (
          <div className="space-y-4">
            <TimelineContainer
              id="work-listening-timeline"
              totalDurationSec={320}
              currentPositionSec={45}
            />
            <p className="text-xs text-stone-500 font-mono text-center">
              Gravação de referência com afinação histórica (A = 415 Hz).
            </p>
          </div>
        )}

        {/* Tab 3: Partitura */}
        {activeTab === 'partitura' && (
          <ScoreContainer
            id="work-score-viewer"
            title="BWV 1001 - I. Adagio"
            composer="J. S. Bach"
            keySignature="G Minor"
            timeSignature="4/4"
            tempo={48}
          />
        )}

        {/* Tab 4: Prática */}
        {activeTab === 'pratica' && (
          <Card variant="default" padding="lg" className="space-y-4 max-w-xl mx-auto">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-anil-800" />
              Treino de Afinação e Condução Polifônica
            </h3>
            <p className="text-sm text-stone-700">
              Pratique os compassos 1 a 4 com análise de pitch em tempo real e detecção de afinação das paradas duplas.
            </p>
            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/studio/voice-ear')}
              >
                Abrir Ferramenta de Afinação & Áudio
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ScreenContainer>
  );
};
