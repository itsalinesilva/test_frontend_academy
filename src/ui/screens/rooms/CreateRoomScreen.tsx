import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { roomsRepository, criarSala } from '../../../repositories/rooms.repository';
import { ModalidadeDeSala } from '../../../domain/teacher';
import { ArrowLeft, PlusCircle } from 'lucide-react';

/**
 * Criação de sala.
 *
 * O envio deste formulário chamava `setTimeout(400)`, escrevia "Registrando
 * sala…" e navegava de volta. Não gravava nada. O professor voltava ao
 * diretório e a sala que ele acabara de criar não estava lá — e não estava
 * porque nunca existiu.
 *
 * Agora grava. O que o formulário coleta é o que a sala tem; o resto dos
 * campos nasce zerado, e não preenchido com número bonito.
 */
export const CreateRoomScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, nome, carregando } = useCurrentUser();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ModalidadeDeSala>('CLASSE_REGULAR');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!userId) {
      setErro('Entre na sua conta para criar uma sala.');
      return;
    }

    setIsSubmitting(true);
    setErro(null);
    try {
      const sala = criarSala({
        nome: title,
        modalidade: type,
        capacidade: Number(capacity) || 20,
        ementa: description,
        teacherId: userId,
        teacherName: nome ?? 'Docente do Conservatório',
      });
      await roomsRepository.salvar(sala);
      navigate(`/rooms/${sala.slug}`);
    } catch {
      setErro('Não foi possível registrar a sala. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      id="create-room"
      title="Criar Nova Sala Acadêmica"
      subtitle="Exclusivo para docentes e mestres titulares credenciados na Academia."
      badgeLabel="Prerrogativa Docente"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar às Salas',
        icon: ArrowLeft,
        onClick: () => navigate('/rooms'),
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleSubmit}>
          <Card variant="default" padding="lg" className="space-y-4">
            {erro && <ErrorState id="create-room-error" title="Falha ao criar a sala" message={erro} />}

            <div className="space-y-1">
              <label htmlFor="sala-nome" className="text-xs font-semibold text-stone-700 block">
                Nome da sala ou disciplina *
              </label>
              <input
                id="sala-nome"
                type="text"
                required
                placeholder="Ex.: Contraponto e fuga ao teclado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="sala-modalidade" className="text-xs font-semibold text-stone-700 block">
                  Modalidade pedagógica
                </label>
                <select
                  id="sala-modalidade"
                  value={type}
                  onChange={(e) => setType(e.target.value as ModalidadeDeSala)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300 bg-white"
                >
                  <option value="CLASSE_REGULAR">Classe regular semestral</option>
                  <option value="MASTERCLASS">Masterclass</option>
                  <option value="LABORATORIO">Laboratório de análise</option>
                  <option value="TURMA_INFANTIL">Turma infantil supervisionada</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="sala-capacidade" className="text-xs font-semibold text-stone-700 block">
                  Capacidade máxima de alunos
                </label>
                <input
                  id="sala-capacidade"
                  type="number"
                  min="2"
                  max="100"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="sala-ementa" className="text-xs font-semibold text-stone-700 block">
                Ementa e metodologia da sala
              </label>
              <textarea
                id="sala-ementa"
                rows={4}
                placeholder="Objetivos, repertório a ser trabalhado e frequência dos encontros."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/rooms')}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting || carregando || !title.trim()}
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                {isSubmitting ? 'Registrando a sala…' : 'Criar sala'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </ScreenContainer>
  );
};
