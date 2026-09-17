import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ArrowLeft, PlusCircle, ShieldCheck } from 'lucide-react';

export const CreateRoomScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('classe_regular');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/rooms');
    }, 400);
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
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 border-b border-stone-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verificação de Titularidade Docente Aprovada</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Nome da Sala / Disciplina *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cátedra Bach: Fuga e Contraponto no Cravo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Modalidade Pedagógica
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300 bg-white"
                >
                  <option value="classe_regular">Classe Regular Semestral</option>
                  <option value="masterclass">Masterclass Especial</option>
                  <option value="laboratorio">Laboratório de Análise</option>
                  <option value="kids">Turma Infantil Supervisionada</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Capacidade Máxima (Alunos)
                </label>
                <input
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
              <label className="text-xs font-semibold text-stone-700 block">
                Ementa e Metodologia da Sala
              </label>
              <textarea
                rows={4}
                placeholder="Descreva os objetivos, repertório a ser trabalhado e frequência dos encontros..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/rooms')}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !title.trim()}>
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                {isSubmitting ? 'Registrando Sala...' : 'Instanciar Sala Acadêmica'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </ScreenContainer>
  );
};
