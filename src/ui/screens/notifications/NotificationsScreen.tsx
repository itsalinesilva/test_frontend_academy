import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Central, lerCentral, marcarTodasComoLidas } from '../../../services/application/notificacoes.service';
import { Award, CheckCheck, Heart, MessageSquare, TrendingUp, Users, CalendarDays, FileText } from 'lucide-react';

/**
 * A central de notificações (AUD-10).
 *
 * Esta tela já mostrou três avisos escritos à mão ("parecer do Prof. Gabriel
 * Carvalho", que não existe) e depois, com honestidade, nenhum — porque a
 * plataforma não emitia aviso algum. Agora emite: certificado, nível de
 * habilidade, e o que acontece nas suas salas (post novo, comentário no seu
 * post, curtida, encontro marcado, pedido aprovado).
 */
const ICONE = {
  CERTIFICADO: Award,
  NIVEL: TrendingUp,
  SALA_POST: FileText,
  SALA_COMENTARIO: MessageSquare,
  SALA_CURTIDA: Heart,
  SALA_ENCONTRO: CalendarDays,
  SALA_APROVADO: Users,
} as const;

export const NotificationsScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();
  const [central, setCentral] = useState<Central | null>(null);

  const ler = useCallback(() => {
    if (!userId) return;
    void lerCentral(userId).then(setCentral);
  }, [userId]);
  useEffect(ler, [ler]);

  return (
    <ScreenContainer
      id="notifications"
      title="Notificações"
      subtitle="Certificados, níveis e o que acontece nas suas salas."
      badgeLabel={central ? (central.naoLidos ? `${central.naoLidos} não lidas` : 'Tudo lido') : undefined}
      badgeVariant="neutral"
      primaryAction={
        central && central.naoLidos > 0
          ? {
              label: 'Marcar todas como lidas',
              icon: CheckCheck,
              onClick: () => {
                marcarTodasComoLidas(userId!);
                ler();
              },
            }
          : undefined
      }
      state={central === null ? 'loading' : central.avisos.length === 0 ? 'empty' : 'populated'}
      emptyProps={{
        title: 'Você não tem notificações',
        description:
          'Aparecem aqui os certificados que você conquistar, as habilidades que subirem de nível e o que acontecer nas salas em que você está.',
        actionLabel: 'Ver as salas',
        onAction: () => navigate('/rooms'),
      }}
    >
      {central && (
        <div className="mx-auto max-w-2xl space-y-2">
          {central.salasIndisponiveis && (
            <p role="status" className="text-xs text-amber-800">
              {central.salasIndisponiveis}
            </p>
          )}
          {central.avisos.map((a) => {
            const Icone = ICONE[a.tipo];
            return (
              <Card
                key={a.id}
                variant="default"
                padding="md"
                interactive
                onClick={() => navigate(a.link)}
                className={a.lido ? 'opacity-75' : 'border-anil-300'}
              >
                <div className="flex items-start gap-3">
                  <Icone className="mt-0.5 h-4 w-4 shrink-0 text-anil-800" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">
                      {!a.lido && <span className="sr-only">Não lida: </span>}
                      {a.titulo}
                    </p>
                    <p className="truncate text-xs text-stone-600">{a.texto}</p>
                    <p className="mt-1 text-[11px] text-stone-500">{new Date(a.em).toLocaleString('pt-BR')}</p>
                  </div>
                  {!a.lido && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-anil-700" aria-hidden="true" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
};
