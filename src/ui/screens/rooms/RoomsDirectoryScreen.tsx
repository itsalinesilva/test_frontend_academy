import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Users, Plus, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const RoomsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<'todas' | 'minhas' | 'publicas'>('todas');

  const rooms = [
    {
      id: 'sala-chopin',
      title: 'Cátedra Chopin: Prática e Interpretação Romântica',
      teacher: 'Prof. Gabriel Carvalho',
      type: 'Classe Regular',
      membersCount: 16,
      nextSession: 'Terça-feira às 18:00',
      description: 'Estudo dos Prelúdios Op. 28 e Baladas, com foco em rubato histórico e articulação cantabile.',
    },
    {
      id: 'laboratorio-contraponto',
      title: 'Oficina de Contraponto Rigoroso & Fuga',
      teacher: 'Profa. Dra. Clara Schumann',
      type: 'Laboratório Avançado',
      membersCount: 8,
      nextSession: 'Quinta-feira às 19:30',
      description: 'Correção síncrona de exercícios semanais em quatro vozes com aplicação direta das regras de Fux.',
    },
    {
      id: 'iniciacao-infantil-musical',
      title: 'Jardim Musical: Percepção Lúdica para Crianças',
      teacher: 'Profa. Mariana Bastos',
      type: 'Módulo Kids Supervisionado',
      membersCount: 12,
      nextSession: 'Sábado às 10:00',
      description: 'Jogos rítmicos, reconhecimento de timbres orquestrais e iniciação auditiva para o público infantil.',
    },
  ];

  return (
    <ScreenContainer
      id="rooms-directory"
      title="Salas de Aula & Mestres"
      subtitle="Espaços acadêmicos para orientação docente, envio de tarefas semanais e masterclasses síncronas."
      badgeLabel="Orientação Pedagógica"
      badgeVariant="brand"
      primaryAction={{
        label: 'Criar Nova Sala',
        icon: Plus,
        onClick: () => navigate('/rooms/create'),
      }}
      emptyProps={{
        title: 'Nenhuma sala de aula disponível',
        description: 'Você não está matriculado em nenhuma sala e não há turmas públicas abertas no momento.',
        actionLabel: 'Ver Currículo da Academia',
        onAction: () => navigate('/academy'),
      }}
    >
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex items-center justify-between p-2 bg-white border border-stone-200 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('todas')}
              className={`px-3 py-1 rounded ${filter === 'todas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Todas as Salas
            </button>
            <button
              type="button"
              onClick={() => setFilter('minhas')}
              className={`px-3 py-1 rounded ${filter === 'minhas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Minhas Turmas
            </button>
          </div>
          <span className="text-stone-500 font-mono hidden sm:inline">Turmas com certificação docente</span>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              id={`room-card-${room.id}`}
              variant="default"
              padding="lg"
              interactive
              className="space-y-3 flex flex-col justify-between"
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{room.type}</Badge>
                  <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-stone-400" /> {room.membersCount} alunos
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  {room.title}
                </h3>

                <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {room.teacher}
                </p>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {room.description}
                </p>

                <div className="pt-2 border-t border-stone-100 text-xs font-mono text-stone-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" /> Próximo encontro: {room.nextSession}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-mono">Presença Obrigatória</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/rooms/${room.id}`);
                  }}
                >
                  Acessar Sala <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
