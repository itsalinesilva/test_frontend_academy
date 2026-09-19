import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { CheckCircle2, BookOpen, MessageSquare, Clock } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<'todas' | 'nao_lidas'>('todas');
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Tarefa Avaliada pelo Docente',
      message: 'Sua submissão de Harmonia SATB (Lição 03) recebeu parecer do Prof. Gabriel Carvalho.',
      time: 'Há 15 minutos',
      unread: true,
      category: 'Acadêmico',
      link: '/rooms/sala-chopin',
      icon: CheckCircle2,
    },
    {
      id: 'notif-2',
      title: 'Nova Lição Disponível no Currículo',
      message: 'O Módulo II de Contraponto Modal foi liberado para sua turma.',
      time: 'Há 2 horas',
      unread: true,
      category: 'Academia',
      link: '/academia/course/contraponto-modal',
      icon: BookOpen,
    },
    {
      id: 'notif-3',
      title: 'Menção em Discussão do Fórum',
      message: 'Aline Silva mencionou você no tópico sobre a Fuga BWV 1001.',
      time: 'Há 1 dia',
      unread: false,
      category: 'Comunidade',
      link: '/community/topic/analise-bach-bwv-1001',
      icon: MessageSquare,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = filter === 'nao_lidas' ? notifications.filter((n) => n.unread) : notifications;

  return (
    <ScreenContainer
      id="notifications"
      title="Central de Notificações"
      subtitle="Avisos pedagógicos, avaliações de tarefas, menções e atualizações do currículo."
      badgeLabel={`${notifications.filter((n) => n.unread).length} Não Lidas`}
      badgeVariant="brand"
      primaryAction={{
        label: 'Marcar Todas como Lidas',
        icon: CheckCircle2,
        onClick: markAllAsRead,
      }}
      emptyProps={{
        title: 'Nenhuma notificação recebida',
        description: 'Você está em dia com todas as suas disciplinas, tarefas e comunicados.',
        actionLabel: 'Ver Meu Aprendizado',
        onAction: () => navigate('/academia/my-learning'),
      }}
    >
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Filter bar */}
        <div className="flex items-center justify-between p-2 bg-white border border-stone-200 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('todas')}
              className={`px-3 py-1 rounded ${filter === 'todas' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('nao_lidas')}
              className={`px-3 py-1 rounded ${filter === 'nao_lidas' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Não Lidas ({notifications.filter((n) => n.unread).length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const IconComp = item.icon;
            return (
              <Card
                key={item.id}
                id={`notif-${item.id}`}
                variant={item.unread ? 'default' : 'muted'}
                padding="md"
                interactive
                onClick={() => navigate(item.link)}
                className={`cursor-pointer transition-all flex items-start gap-3.5 ${
                  item.unread ? 'border-red-200 bg-red-50/10' : ''
                }`}
              >
                <div className={`p-2 rounded-full mt-0.5 shrink-0 ${item.unread ? 'bg-red-100 text-anil-800' : 'bg-stone-200 text-stone-600'}`}>
                  <IconComp className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{item.title}</span>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-anil-800 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </ScreenContainer>
  );
};
