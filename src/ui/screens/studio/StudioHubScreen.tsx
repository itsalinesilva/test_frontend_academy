import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Plus, Sliders, Mic, FileMusic, ArrowRight, Clock } from 'lucide-react';

export const StudioHubScreen: React.FC = () => {
  const { navigate } = useRouter();

  const projects = [
    {
      id: 'arranjo-satb-coral',
      title: 'Arranjo Coral SATB - Coral de Bach',
      type: 'Partitura & Síntese',
      tracksCount: 4,
      lastModified: 'Há 1 dia',
      tempo: '64 BPM',
      key: 'Ré menor',
    },
    {
      id: 'gravacao-violino-estudo',
      title: 'Tomada de Áudio - Violino Solo BWV 1001',
      type: 'Produção Multitrack',
      tracksCount: 2,
      lastModified: 'Há 3 dias',
      tempo: '72 BPM',
      key: 'Sol menor',
    },
  ];

  return (
    <ScreenContainer
      id="studio-hub"
      title="Estúdio & Criação Musical"
      subtitle="Ambiente integrado de composição, edição de partituras (Score) e produção de áudio digital (DAW)."
      badgeLabel="Motor de Criação"
      badgeVariant="brand"
      primaryAction={{
        label: 'Novo Projeto de Áudio',
        icon: Plus,
        onClick: () => navigate('/studio/project/novo-projeto'),
      }}
      secondaryActions={[
        {
          label: 'Editor de Partituras',
          icon: FileMusic,
          onClick: () => navigate('/studio/score'),
        },
        {
          label: 'Laboratório de Voz & Afinação',
          icon: Mic,
          onClick: () => navigate('/studio/voice-ear'),
        },
      ]}
      emptyProps={{
        title: 'Nenhum projeto de produção criado',
        description: 'Inicie uma sessão na DAW multitrack ou crie uma nova partitura na notação canônica.',
        actionLabel: 'Criar Primeiro Projeto',
        onAction: () => navigate('/studio/project/novo-projeto'),
      }}
    >
      <div className="space-y-6">
        {/* Quick Tools Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/project/arranjo-satb-coral')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <Sliders className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">DAW & Multitrack</p>
              <p className="text-xs text-stone-500">Timeline, mixer e instrumentos virtuais</p>
            </div>
          </Card>

          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/score')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <FileMusic className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Editor de Partituras</p>
              <p className="text-xs text-stone-500">Notação em pauta e importação MusicXML</p>
            </div>
          </Card>

          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/voice-ear')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <Mic className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Voz, Afinador & Ouvido</p>
              <p className="text-xs text-stone-500">Treinamento de pitch e intervalos em tempo real</p>
            </div>
          </Card>
        </div>

        {/* Recent Projects List */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Projetos Recentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <Card
                key={proj.id}
                id={`project-card-${proj.id}`}
                variant="default"
                padding="lg"
                interactive
                className="space-y-3 flex flex-col justify-between"
                onClick={() => navigate(`/studio/project/${proj.id}`)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral" size="sm">{proj.type}</Badge>
                    <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {proj.lastModified}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {proj.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-mono text-stone-600">
                    <span>{proj.tracksCount} pistas ativas</span>
                    <span>•</span>
                    <span>{proj.tempo}</span>
                    <span>•</span>
                    <span>{proj.key}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-mono">Autosave Ativo</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/studio/project/${proj.id}`);
                    }}
                  >
                    Abrir no Estúdio <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
