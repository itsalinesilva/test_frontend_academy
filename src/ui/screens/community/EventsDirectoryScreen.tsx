import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';
import { communityEventsRepository } from '../../../repositories/community-events.repository';
import { CommunityEvent } from '../../../domain/community';
import { Calendar, Clock, Users, ArrowLeft, Check } from 'lucide-react';

/**
 * Eventos da Academia.
 *
 * Esta tela listava duas masterclasses escritas no código, com professora
 * inventada e contagem de inscritos inventada. O botão "Garantir
 * participação" chamava `alert('Inscrição confirmada no evento…')` — não
 * gravava nada e **dizia ao aluno que tinha gravado**.
 *
 * Agora a lista vem do repositório, a inscrição é gravada em nome de quem
 * está logado, e a contagem é contada. Enquanto o Conservatório não marcar
 * evento, a tela diz que não há evento marcado.
 */
interface EventoNaTela {
  evento: CommunityEvent;
  inscritos: number;
  euEstouInscrito: boolean;
}

const formatarDia = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const formatarHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const EventsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useUsuarioAtual();
  const [itens, setItens] = useState<EventoNaTela[] | null>(null);
  const [emCurso, setEmCurso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const eventos = await communityEventsRepository.listar();
    const compostos = await Promise.all(
      eventos.map(async (evento) => ({
        evento,
        inscritos: await communityEventsRepository.totalDeInscritos(evento.id),
        euEstouInscrito: userId
          ? await communityEventsRepository.estaInscrito(evento.id, userId)
          : false,
      }))
    );
    setItens(compostos);
  }, [userId]);

  useEffect(() => {
    carregar().catch(() => setItens([]));
  }, [carregar]);

  const alternarInscricao = async (item: EventoNaTela) => {
    if (!userId) {
      navigate('/auth/login?voltar=/community/events');
      return;
    }
    setEmCurso(item.evento.id);
    try {
      if (item.euEstouInscrito) {
        await communityEventsRepository.cancelarInscricao(item.evento.id, userId);
      } else {
        await communityEventsRepository.inscrever(item.evento.id, userId);
      }
      await carregar();
    } finally {
      setEmCurso(null);
    }
  };

  return (
    <ScreenContainer
      id="community-events"
      title="Eventos e recitais da Academia"
      subtitle="Masterclasses ao vivo, bancas de avaliação e recitais comentados."
      badgeLabel="Programação"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao fórum',
        icon: ArrowLeft,
        onClick: () => navigate('/community'),
      }}
      emptyProps={{
        title: 'Nenhum evento programado',
        description:
          'Não há masterclasses nem recitais marcados no momento. Quando houver, eles aparecem aqui com data, horário e inscrição.',
        actionLabel: 'Ver o fórum',
        onAction: () => navigate('/community'),
      }}
      state={itens === null ? 'loading' : itens.length === 0 ? 'empty' : 'populated'}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(itens ?? []).map((item) => {
          const { evento, inscritos, euEstouInscrito } = item;
          const lotado =
            evento.maxAttendees !== undefined && inscritos >= evento.maxAttendees && !euEstouInscrito;

          return (
            <Card
              key={evento.id}
              variant="default"
              padding="lg"
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">
                    {evento.type}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-xs text-stone-500">
                    <Users className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    {inscritos}
                    {evento.maxAttendees !== undefined && ` de ${evento.maxAttendees}`} inscritos
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold leading-snug text-stone-900">
                  {evento.title}
                </h3>

                <p className="text-xs font-medium text-stone-700">Orientação: {evento.hostName}</p>

                {evento.description && (
                  <p className="text-xs leading-relaxed text-stone-600">{evento.description}</p>
                )}

                <div className="space-y-1 border-t border-stone-100 pt-2 font-mono text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    <time dateTime={evento.scheduledStartTime}>
                      {formatarDia(evento.scheduledStartTime)}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    <span>
                      {formatarHora(evento.scheduledStartTime)} às{' '}
                      {formatarHora(evento.scheduledEndTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="font-mono text-xs text-stone-500">
                  {euEstouInscrito
                    ? 'Você está inscrito'
                    : lotado
                      ? 'Sem vagas'
                      : 'Inscrição aberta'}
                </span>
                <Button
                  variant={euEstouInscrito ? 'outline' : 'primary'}
                  size="sm"
                  disabled={lotado || emCurso === evento.id}
                  onClick={() => alternarInscricao(item)}
                >
                  {euEstouInscrito && <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />}
                  {euEstouInscrito ? 'Cancelar inscrição' : 'Inscrever-me'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </ScreenContainer>
  );
};
