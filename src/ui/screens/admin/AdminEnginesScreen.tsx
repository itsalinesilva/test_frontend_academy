import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { ArrowLeft, RefreshCw, Cpu } from 'lucide-react';

export const AdminEnginesScreen: React.FC = () => {
  const { navigate } = useRouter();

  const engines = [
    {
      id: 'theory-engine',
      name: 'Motor de Teoria Musical & SATB',
      version: 'v2.4.0 (Canônico)',
      latency: '1.2 ms',
      status: 'Operacional',
      health: '100%',
      description: 'Validação de regras harmônicas, detecção de paralelismos proibidos e cálculo de acordes.',
    },
    {
      id: 'audio-dsp-engine',
      name: 'Motor de Áudio & Pitch DSP',
      version: 'v1.8.2 (WebAudio)',
      latency: '4.8 ms',
      status: 'Operacional',
      health: '99.8%',
      description: 'Detecção de frequência fundamental (YIN/Autocorrelação) e análise espectral de áudio.',
    },
    {
      id: 'score-notation-engine',
      name: 'Motor de Partituras & Notação',
      version: 'v3.1.0 (VexFlow Core)',
      latency: '2.5 ms',
      status: 'Operacional',
      health: '100%',
      description: 'Renderização vetorial SVG de partituras e importação/exportação de arquivos MusicXML.',
    },
    {
      id: 'knowledge-graph-engine',
      name: 'Grafo de Conhecimento Musicológico',
      version: 'v1.2.0',
      latency: '8.4 ms',
      status: 'Operacional',
      health: '100%',
      description: 'Indexação semântica de compositores, obras, épocas históricas e linhagens pedagógicas.',
    },
  ];

  return (
    <ScreenContainer
      id="admin-engines"
      title="Gateway de Motores Analíticos"
      subtitle="Monitoramento em tempo real da integridade, latência e disponibilidade dos motores de cálculo musical."
      badgeLabel="Engines Gateway"
      badgeVariant="brand"
      primaryAction={{
        label: 'Executar Diagnóstico Geral',
        icon: RefreshCw,
        onClick: () => alert('Diagnóstico executado: Todos os 4 motores responderam em menos de 10ms.'),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Console',
          icon: ArrowLeft,
          onClick: () => navigate('/admin'),
        },
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engines.map((eng) => (
            <Card key={eng.id} variant="default" padding="lg" className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-800" />
                  <h3 className="font-serif font-bold text-sm text-stone-900">{eng.name}</h3>
                </div>
                <Badge variant="brand" size="sm">
                  {eng.status}
                </Badge>
              </div>

              <p className="text-xs text-stone-600">{eng.description}</p>

              <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-2 text-[11px] font-mono text-stone-500">
                <div>
                  <span className="block text-stone-400">Versão</span>
                  <span className="text-stone-800">{eng.version}</span>
                </div>
                <div>
                  <span className="block text-stone-400">Latência</span>
                  <span className="text-emerald-700 font-bold">{eng.latency}</span>
                </div>
                <div>
                  <span className="block text-stone-400">Disponibilidade</span>
                  <span className="text-stone-800">{eng.health}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
