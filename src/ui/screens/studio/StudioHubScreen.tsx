import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Plus, Sliders, Mic, FileMusic } from 'lucide-react';

export const StudioHubScreen: React.FC = () => {
  const { navigate } = useRouter();

  /**
   * NAO ha lista de projetos, e esta linha e a correcao.
   *
   * Havia dois projetos escritos neste arquivo — "Arranjo Coral SATB" com 4
   * pistas e "Tomada de Audio - Violino Solo BWV 1001" com 2 —, cada um com
   * andamento, tonalidade e "Ha 1 dia" de ultima modificacao. Nenhum existia:
   * o Estudio nao tem repositorio de projetos, e `DawProjectScreen` tambem
   * nao grava nada.
   *
   * Quem abrisse o Estudio via dois trabalhos seus que nunca fez, e ao clicar
   * caia numa mesa de mixagem vazia.
   *
   * Persistir projeto do Estudio e recurso de verdade, e esta aberto em
   * `D.3` do CLAUDE_TODO. Ate la, o Estudio mostra as ferramentas que tem e
   * diz que nao ha projeto — que e a informacao correta.
   */

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
        description:
          'As ferramentas abaixo funcionam agora. Guardar o projeto entre sessões ainda não — por isso nada aparece aqui.',
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

        <p className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
          As três ferramentas acima abrem e funcionam. O que ainda não existe é
          guardar o trabalho entre sessões: ao fechar a aba, o projeto se perde.
          Por isso não há lista de projetos recentes.
        </p>
      </div>
    </ScreenContainer>
  );
};
