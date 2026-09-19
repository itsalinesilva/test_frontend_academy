import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { roomsRepository } from '../../../repositories/rooms.repository';
import { TeacherRoomDetail, ModalidadeDeSala } from '../../../domain/teacher';
import { FileText, ArrowLeft, Users, Megaphone } from 'lucide-react';

/**
 * Sala de aula.
 *
 * Esta tela **ignorava o identificador da rota** e mostrava sempre a mesma
 * sala escrita no código: uma cátedra de Chopin com professor inventado, um
 * aviso inventado, duas tarefas inventadas — uma delas já "Avaliada com nota
 * 9,5" — e quatro integrantes inventados, entre eles a própria fundadora do
 * Conservatório, listada como aluna de uma turma que não existe.
 *
 * Qualquer endereço `/rooms/<qualquer-coisa>` abria essa mesma ficção.
 *
 * Agora a tela procura a sala de verdade. Se não achar, diz que não achou; se
 * achar, mostra o que a sala tem — inclusive quando o que ela tem é nada,
 * porque foi criada há um minuto.
 */
const NOME_DA_MODALIDADE: Record<ModalidadeDeSala, string> = {
  CLASSE_REGULAR: 'Classe regular',
  MASTERCLASS: 'Masterclass',
  LABORATORIO: 'Laboratório',
  TURMA_INFANTIL: 'Turma infantil',
};

export const RoomDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const roomId = params.id;
  const [activeTab, setActiveTab] = useState<'tarefas' | 'membros'>('tarefas');
  const [sala, setSala] = useState<TeacherRoomDetail | null | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    if (!roomId) {
      setSala(null);
      return;
    }
    roomsRepository
      .porId(roomId)
      .then((s) => {
        if (ativo) setSala(s);
      })
      .catch(() => {
        if (ativo) setSala(null);
      });
    return () => {
      ativo = false;
    };
  }, [roomId]);

  const avisoFixado = sala?.announcements.find((a) => a.pinned) ?? sala?.announcements[0];

  return (
    <ScreenContainer
      id="room-detail"
      title={sala?.name ?? 'Sala de aula'}
      subtitle={
        sala ? `Docente: ${sala.teacherName} • ${NOME_DA_MODALIDADE[sala.modalidade]}` : undefined
      }
      badgeLabel={sala ? `${sala.studentCount} de ${sala.capacidade} alunos` : undefined}
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar às salas',
        icon: ArrowLeft,
        onClick: () => navigate('/rooms'),
      }}
      emptyProps={{
        title: 'Sala não encontrada',
        description: `Nenhuma sala responde por "${roomId ?? ''}". Ela pode ter sido encerrada pelo docente.`,
        actionLabel: 'Ver o diretório de salas',
        onAction: () => navigate('/rooms'),
      }}
      state={sala === undefined ? 'loading' : sala === null ? 'empty' : 'populated'}
    >
      {sala && (
        <div className="space-y-6">
          {avisoFixado ? (
            <Card variant="muted" padding="md" className="space-y-1 border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Aviso do docente</span>
              </div>
              <p className="text-xs font-semibold text-stone-900">{avisoFixado.title}</p>
              <p className="text-xs leading-relaxed text-stone-800">{avisoFixado.body}</p>
            </Card>
          ) : (
            sala.description && (
              <Card variant="muted" padding="md">
                <p className="text-xs leading-relaxed text-stone-800">{sala.description}</p>
              </Card>
            )
          )}

          <div className="flex gap-4 border-b border-stone-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tarefas'}
              onClick={() => setActiveTab('tarefas')}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'tarefas'
                  ? 'border-anil-800 font-semibold text-anil-800'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Tarefas e avaliações
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'membros'}
              onClick={() => setActiveTab('membros')}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'membros'
                  ? 'border-anil-800 font-semibold text-anil-800'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Alunos e docentes
            </button>
          </div>

          {activeTab === 'tarefas' && (
            <EmptyState
              id="room-assignments-empty"
              icon={<FileText className="h-8 w-8 stroke-1" aria-hidden="true" />}
              title={
                sala.activeAssignmentCount === 0
                  ? 'Nenhuma tarefa publicada'
                  : `${sala.activeAssignmentCount} tarefas`
              }
              description="O docente publica aqui as tarefas da turma, com prazo e formato de entrega. Enquanto não houver nenhuma, não há nada a enviar."
            />
          )}

          {activeTab === 'membros' && (
            <Card variant="default" padding="lg" className="space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900">
                Integrantes da turma
              </h3>
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-anil-800 text-xs font-bold text-white">
                  {sala.teacherName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">{sala.teacherName}</p>
                  <p className="font-mono text-[11px] text-stone-500">Docente responsável</p>
                </div>
                <Badge variant="neutral" size="sm" className="ml-auto">
                  Titular
                </Badge>
              </div>
              {sala.studentCount === 0 ? (
                <p className="flex items-center gap-2 py-2 text-xs text-stone-600">
                  <Users className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  Nenhum aluno matriculado ainda. A turma comporta {sala.capacidade}.
                </p>
              ) : (
                <p className="py-2 text-xs text-stone-600">
                  {sala.studentCount} de {sala.capacidade} vagas ocupadas.
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </ScreenContainer>
  );
};
