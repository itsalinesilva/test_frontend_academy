import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Privacidade, motivo, salasService } from '../../../services/application/salas.service';
import { ArrowLeft, PlusCircle } from 'lucide-react';

/**
 * Criar sala (AUD-9).
 *
 * No molde do Skool, qualquer pessoa com conta abre a sua comunidade, e quem
 * cria é o dono. Antes, só "professor" criava — e não havia como alguém se
 * tornar professor (AUD-12): na prática, ninguém além da administração.
 *
 * A sala nasce no servidor, e por isso outra pessoa a encontra.
 */
const CATEGORIAS_SUGERIDAS = 'Avisos, Dúvidas, Partituras, Gravações';

export const CreateRoomScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, carregando } = useCurrentUser();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [privacidade, setPrivacidade] = useState<Privacidade>('publica');
  const [categorias, setCategorias] = useState(CATEGORIAS_SUGERIDAS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    if (!userId) {
      setErro('Entre na sua conta para criar uma sala.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const sala = await salasService.criar({
        nome,
        descricao,
        privacidade,
        categorias: categorias.split(',').map((c) => c.trim()).filter(Boolean),
      });
      navigate(`/rooms/${sala.slug}`);
    } catch (err) {
      setErro(motivo(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScreenContainer
      id="create-room"
      title="Criar sala"
      subtitle="Uma comunidade para a sua turma, grupo de estudo ou coro. Você é quem cuida dela."
      badgeLabel="Nova sala"
      badgeVariant="brand"
      primaryAction={{ label: 'Voltar às salas', icon: ArrowLeft, onClick: () => navigate('/rooms') }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={enviar}>
          <Card variant="default" padding="lg" className="space-y-4">
            {erro && <ErrorState id="create-room-error" title="Não deu para criar a sala" message={erro} />}

            <div className="space-y-1">
              <label htmlFor="sala-nome" className="text-xs font-semibold text-stone-700 block">
                Nome da sala *
              </label>
              <input
                id="sala-nome"
                type="text"
                required
                maxLength={80}
                placeholder="Ex.: Contraponto às quintas"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-stone-700">Quem vê a sala</legend>
              <label className="flex items-start gap-2 text-xs">
                <input type="radio" name="privacidade" checked={privacidade === 'publica'} onChange={() => setPrivacidade('publica')} className="mt-0.5 accent-anil-800" />
                <span><strong>Pública</strong> — qualquer pessoa lê a conversa; para participar, entra com um clique.</span>
              </label>
              <label className="flex items-start gap-2 text-xs">
                <input type="radio" name="privacidade" checked={privacidade === 'privada'} onChange={() => setPrivacidade('privada')} className="mt-0.5 accent-anil-800" />
                <span><strong>Privada</strong> — só membros leem; quem pede para entrar espera você aprovar.</span>
              </label>
            </fieldset>

            <div className="space-y-1">
              <label htmlFor="sala-categorias" className="text-xs font-semibold text-stone-700 block">
                Categorias da conversa, separadas por vírgula
              </label>
              <input
                id="sala-categorias"
                type="text"
                value={categorias}
                onChange={(e) => setCategorias(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="sala-descricao" className="text-xs font-semibold text-stone-700 block">
                Sobre a sala
              </label>
              <textarea
                id="sala-descricao"
                rows={4}
                maxLength={2000}
                placeholder="Para quem é, o que se estuda, com que frequência vocês se encontram."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/rooms')}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={enviando || carregando || !nome.trim()}>
                <PlusCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                {enviando ? 'Criando…' : 'Criar sala'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </ScreenContainer>
  );
};
