import React, { useEffect, useMemo, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';
import { roomsRepository } from '../../../repositories/rooms.repository';
import { TeacherRoomDetail, ModalidadeDeSala } from '../../../domain/teacher';
import { Users, Plus, ArrowRight, GraduationCap } from 'lucide-react';

/**
 * Diretório de salas.
 *
 * Esta tela listava três salas escritas no próprio arquivo, com professores
 * inventados — inclusive uma "Profa. Dra. Clara Schumann" — e contagem de
 * alunos inventada. Um professor que criasse a sala dele voltava para cá e
 * não a encontrava, porque a criação também não gravava nada.
 *
 * Agora lê o repositório. Enquanto o Conservatório não tiver turma, o
 * diretório está vazio, e diz que está — o que é a informação correta e a
 * única que não desmente o produto no primeiro uso.
 */
const NOME_DA_MODALIDADE: Record<ModalidadeDeSala, string> = {
  CLASSE_REGULAR: 'Classe regular',
  MASTERCLASS: 'Masterclass',
  LABORATORIO: 'Laboratório',
  TURMA_INFANTIL: 'Turma infantil',
};

export const RoomsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useUsuarioAtual();
  const [filtro, setFiltro] = useState<'todas' | 'minhas'>('todas');
  const [salas, setSalas] = useState<TeacherRoomDetail[] | null>(null);

  useEffect(() => {
    let ativo = true;
    roomsRepository
      .listar()
      .then((lista) => {
        if (ativo) setSalas(lista);
      })
      .catch(() => {
        if (ativo) setSalas([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const visiveis = useMemo(() => {
    if (!salas) return [];
    if (filtro === 'minhas') return salas.filter((s) => s.teacherId === userId);
    return salas;
  }, [salas, filtro, userId]);

  return (
    <ScreenContainer
      id="rooms-directory"
      title="Salas de aula e mestres"
      subtitle="Espaços de orientação docente, envio de tarefas e encontros ao vivo."
      badgeLabel="Orientação pedagógica"
      badgeVariant="brand"
      primaryAction={{
        label: 'Criar sala',
        icon: Plus,
        onClick: () => navigate('/rooms/create'),
      }}
      emptyProps={{
        title:
          filtro === 'minhas'
            ? 'Você ainda não criou nenhuma sala'
            : 'Nenhuma sala de aula aberta',
        description:
          filtro === 'minhas'
            ? 'Salas que você criar aparecem aqui, com as tarefas e os encontros de cada turma.'
            : 'Ainda não há turmas abertas no Conservatório. O conteúdo dos cursos está disponível para estudo independente enquanto isso.',
        actionLabel: 'Ver os cursos da Academia',
        onAction: () => navigate('/academy'),
      }}
      state={salas === null ? 'loading' : visiveis.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2 text-xs">
          <div className="flex items-center gap-2" role="tablist" aria-label="Filtrar salas">
            <button
              type="button"
              role="tab"
              aria-selected={filtro === 'todas'}
              onClick={() => setFiltro('todas')}
              className={`rounded px-3 py-1 ${filtro === 'todas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Todas as salas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filtro === 'minhas'}
              onClick={() => setFiltro('minhas')}
              className={`rounded px-3 py-1 ${filtro === 'minhas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Minhas turmas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visiveis.map((sala) => (
            <Card
              key={sala.id}
              id={`room-card-${sala.slug}`}
              variant="default"
              padding="lg"
              interactive
              className="flex flex-col justify-between space-y-3"
              onClick={() => navigate(`/rooms/${sala.slug}`)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">
                    {NOME_DA_MODALIDADE[sala.modalidade]}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-xs text-stone-500">
                    <Users className="h-3 w-3 text-stone-400" aria-hidden="true" />
                    {sala.studentCount} de {sala.capacidade}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold leading-snug text-stone-900">
                  {sala.name}
                </h3>

                <p className="flex items-center gap-1 text-xs font-semibold text-stone-700">
                  <GraduationCap className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  {sala.teacherName}
                </p>

                {sala.description && (
                  <p className="line-clamp-2 text-xs text-stone-600">{sala.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="font-mono text-xs text-stone-500">
                  {sala.activeAssignmentCount === 0
                    ? 'Sem tarefas abertas'
                    : `${sala.activeAssignmentCount} tarefa${sala.activeAssignmentCount > 1 ? 's' : ''} aberta${sala.activeAssignmentCount > 1 ? 's' : ''}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/rooms/${sala.slug}`);
                  }}
                >
                  Acessar <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
