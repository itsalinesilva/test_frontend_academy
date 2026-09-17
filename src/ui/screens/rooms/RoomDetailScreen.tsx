import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { FileText, Video, ArrowLeft, Upload, Clock } from 'lucide-react';

export const RoomDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const roomId = params.id;
  const [activeTab, setActiveTab] = useState<'tarefas' | 'membros' | 'gravações'>('tarefas');

  const room = {
    id: roomId,
    title: 'Cátedra Chopin: Prática e Interpretação Romântica',
    teacher: 'Prof. Gabriel Carvalho',
    type: 'Classe Regular • Cátedra de Teclados',
    announcement:
      'Atenção turma: O envio da gravação do Prelúdio nº 4 em Mi menor encerra-se nesta sexta-feira às 23:59. Lembrem-se de atentar para o rubato nos compassos 16 a 18.',
    assignments: [
      {
        id: 'asg-01',
        title: 'Gravação em Vídeo/Áudio: Prelúdio Op. 28 nº 4',
        dueDate: 'Sexta-feira, 23:59',
        status: 'Pendente de Envio',
        graded: false,
      },
      {
        id: 'asg-02',
        title: 'Análise Formal do Período Inicial (compassos 1–12)',
        dueDate: 'Entregue há 2 dias',
        status: 'Avaliado com Nota 9.5',
        graded: true,
      },
    ],
    members: [
      { name: 'Gabriel Carvalho', role: 'Professor Titular' },
      { name: 'Aline Silva', role: 'Aluna Pesquisadora' },
      { name: 'Lucas Mendes', role: 'Estudante' },
      { name: 'Helena Rocha', role: 'Estudante' },
    ],
  };

  return (
    <ScreenContainer
      id="room-detail"
      title={room.title}
      subtitle={`Docente: ${room.teacher} • ${room.type}`}
      badgeLabel="Turma Ativa"
      badgeVariant="brand"
      primaryAction={{
        label: 'Entrar na Sala Ao Vivo',
        icon: Video,
        onClick: () => alert('Conectando à sessão de videoconferência acadêmica com áudio HD estéreo...'),
      }}
      secondaryActions={[
        {
          label: 'Voltar às Salas',
          icon: ArrowLeft,
          onClick: () => navigate('/rooms'),
        },
      ]}
      emptyProps={{
        title: 'Sala não encontrada',
        description: `O código [${roomId}] não corresponde a uma sala ativa.`,
        actionLabel: 'Ver Diretório de Salas',
        onAction: () => navigate('/rooms'),
      }}
    >
      <div className="space-y-6">
        {/* Urgent Announcement Banner */}
        <Card variant="muted" padding="md" className="border-red-200 bg-red-50/40 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-900">
            <span>Aviso do Docente</span>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed">
            {room.announcement}
          </p>
        </Card>

        {/* Tab Strip */}
        <div className="flex border-b border-stone-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('tarefas')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tarefas'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Tarefas & Avaliações
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('membros')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'membros'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Alunos & Docentes ({room.members.length})
          </button>
        </div>

        {/* Tab 1: Assignments */}
        {activeTab === 'tarefas' && (
          <div className="space-y-4">
            {room.assignments.map((asg) => (
              <Card key={asg.id} variant="default" padding="lg" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-800" />
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      {asg.title}
                    </h3>
                  </div>
                  <Badge variant={asg.graded ? 'brand' : 'neutral'}>
                    {asg.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                  <Clock className="w-3.5 h-3.5" /> Prazo: {asg.dueDate}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    Formatos aceitos: WAV, MP3, PDF com anotações de dedilhado
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Submeter evidência para a tarefa: ${asg.title}`)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> Enviar Evidência
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'membros' && (
          <Card variant="default" padding="lg" className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Integrantes da Classe
            </h3>
            <div className="divide-y divide-stone-100">
              {room.members.map((m, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{m.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">{m.role}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">Membro Ativo</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ScreenContainer>
  );
};
