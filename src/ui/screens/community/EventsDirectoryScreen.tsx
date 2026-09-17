import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Calendar, Clock, Users, ArrowLeft } from 'lucide-react';

export const EventsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();

  const events = [
    {
      id: 'masterclass-polifonia-bach',
      title: 'Masterclass: Articulação Histórica no Violino Barroco',
      host: 'Profa. Dra. Helene Becker',
      date: '24 de Outubro de 2026',
      time: '19:00 BRT',
      type: 'Ao Vivo / Sala Virtual',
      enrolled: 48,
    },
    {
      id: 'recital-alunos-piano',
      title: 'Recital Comentado: Miniaturas de Chopin e Schumann',
      host: 'Cátedra de Teclados Históricos',
      date: '02 de Novembro de 2026',
      time: '20:30 BRT',
      type: 'Recital Acadêmico',
      enrolled: 112,
    },
  ];

  return (
    <ScreenContainer
      id="community-events"
      title="Eventos & Recitais da Academia"
      subtitle="Masterclasses síncronas, bancas de avaliação e recitais comentados ao vivo."
      badgeLabel="Programação Oficial"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao Fórum',
        icon: ArrowLeft,
        onClick: () => navigate('/community'),
      }}
      emptyProps={{
        title: 'Nenhum evento programado',
        description: 'Não há eventos acadêmicos ao vivo previstos para as próximas duas semanas.',
        actionLabel: 'Ver Fórum',
        onAction: () => navigate('/community'),
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <Card key={evt.id} variant="default" padding="lg" className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="neutral" size="sm">{evt.type}</Badge>
                <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" /> {evt.enrolled} inscritos
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                {evt.title}
              </h3>

              <p className="text-xs font-medium text-stone-700">Orientação: {evt.host}</p>

              <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600 font-mono">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.time}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">Vagas Limitadas</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert(`Inscrição confirmada no evento: ${evt.title}`)}
              >
                Garantir Participação
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};
