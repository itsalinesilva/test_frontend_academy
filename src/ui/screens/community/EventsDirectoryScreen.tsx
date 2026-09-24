import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  Evento,
  TipoDeEvento,
  comunidadeService,
  motivoDaComunidade,
} from '../../../services/application/comunidade.service';
import { ArrowLeft, CalendarPlus, Users } from 'lucide-react';

/**
 * Eventos (P-2).
 *
 * Esta tela listou duas masterclasses inventadas, com um `alert` dizendo
 * "inscrição confirmada" sem gravar nada; depois passou a ler um repositório
 * no navegador — e ninguém tinha como criar evento, então a lista estava
 * sempre vazia, e quem se inscrevesse só contava no próprio navegador.
 *
 * Agora o evento vive no servidor: quem tem conta marca um evento, todo mundo
 * o vê, e a inscrição é contada lá, com limite de vagas.
 */
const TIPOS: Record<TipoDeEvento, string> = {
  MASTERCLASS: 'Masterclass',
  RECITAL: 'Recital',
  ENCONTRO: 'Encontro',
  OFICINA: 'Oficina',
};

const quando = (inicio: string, fim: string) => {
  const d = new Date(inicio);
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}, ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}–${new Date(fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const campo = 'w-full rounded border border-stone-300 bg-white p-2 text-sm';

export const EventsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, ehAdmin } = useCurrentUser();
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [emCurso, setEmCurso] = useState<string | null>(null);
  const [marcando, setMarcando] = useState(false);
  const [novo, setNovo] = useState({ titulo: '', descricao: '', tipo: 'ENCONTRO' as TipoDeEvento, inicio: '', fim: '', link: '', vagas: '' });

  const carregar = useCallback(() => {
    comunidadeService
      .eventos()
      .then((e) => {
        setEventos(e);
        setErro(null);
      })
      .catch((e) => {
        setErro(motivoDaComunidade(e));
        setEventos([]);
      });
  }, []);
  useEffect(carregar, [carregar, userId]);

  const agir = async (id: string, f: () => Promise<unknown>) => {
    if (!userId) {
      navigate('/auth/login?voltar=%2Fcommunity%2Fevents');
      return;
    }
    setEmCurso(id);
    try {
      await f();
      carregar();
    } catch (e) {
      setErro(motivoDaComunidade(e));
    } finally {
      setEmCurso(null);
    }
  };

  const marcar = async (e: React.FormEvent) => {
    e.preventDefault();
    await agir('novo', () =>
      comunidadeService.criarEvento({
        titulo: novo.titulo,
        descricao: novo.descricao,
        tipo: novo.tipo,
        inicio: new Date(novo.inicio).toISOString(),
        fim: new Date(novo.fim).toISOString(),
        link: novo.link || undefined,
        vagas: novo.vagas ? Number(novo.vagas) : undefined,
      })
    );
    setMarcando(false);
    setNovo({ titulo: '', descricao: '', tipo: 'ENCONTRO', inicio: '', fim: '', link: '', vagas: '' });
  };

  const agora = new Date().toISOString();
  const proximos = (eventos ?? []).filter((e) => e.fim >= agora && !e.cancelado);

  return (
    <ScreenContainer
      id="community-events"
      title="Eventos"
      subtitle="Masterclasses, recitais, oficinas e encontros marcados pela comunidade."
      badgeLabel="Comunidade"
      badgeVariant="neutral"
      primaryAction={
        userId
          ? { label: marcando ? 'Fechar' : 'Marcar evento', icon: CalendarPlus, onClick: () => setMarcando((v) => !v) }
          : { label: 'Entrar para marcar evento', icon: CalendarPlus, onClick: () => navigate('/auth/login?voltar=%2Fcommunity%2Fevents') }
      }
      secondaryActions={[{ label: 'Voltar ao fórum', icon: ArrowLeft, onClick: () => navigate('/community') }]}
      state={eventos === null ? 'loading' : proximos.length === 0 && !marcando ? 'empty' : 'populated'}
      emptyProps={{
        title: erro ? 'Não deu para abrir os eventos' : 'Nenhum evento marcado',
        description: erro ?? 'Marque o primeiro: uma masterclass, um recital, um encontro de estudo.',
        actionLabel: userId ? 'Marcar evento' : 'Entrar',
        onAction: () => (userId ? setMarcando(true) : navigate('/auth/login?voltar=%2Fcommunity%2Fevents')),
      }}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {erro && eventos && eventos.length > 0 && <p role="alert" className="text-xs text-red-800">{erro}</p>}

        {marcando && (
          <form onSubmit={marcar} aria-label="Marcar evento">
            <Card variant="default" padding="lg" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs sm:col-span-2">
                Título
                <input className={campo} value={novo.titulo} maxLength={160} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} />
              </label>
              <label className="text-xs">
                Tipo
                <select className={campo} value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value as TipoDeEvento })}>
                  {Object.entries(TIPOS).map(([v, r]) => (
                    <option key={v} value={v}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                Vagas (opcional)
                <input type="number" min={1} className={campo} value={novo.vagas} onChange={(e) => setNovo({ ...novo, vagas: e.target.value })} />
              </label>
              <label className="text-xs">
                Começa
                <input type="datetime-local" className={campo} value={novo.inicio} onChange={(e) => setNovo({ ...novo, inicio: e.target.value })} />
              </label>
              <label className="text-xs">
                Termina
                <input type="datetime-local" className={campo} value={novo.fim} onChange={(e) => setNovo({ ...novo, fim: e.target.value })} />
              </label>
              <label className="text-xs sm:col-span-2">
                Link da transmissão ou chamada (opcional)
                <input type="url" className={campo} placeholder="https://" value={novo.link} onChange={(e) => setNovo({ ...novo, link: e.target.value })} />
              </label>
              <label className="text-xs sm:col-span-2">
                Descrição
                <textarea rows={3} className={campo} maxLength={3000} value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" size="sm" disabled={!novo.titulo.trim() || !novo.inicio || !novo.fim || emCurso === 'novo'}>
                  {emCurso === 'novo' ? 'Marcando…' : 'Marcar evento'}
                </Button>
              </div>
            </Card>
          </form>
        )}

        {proximos.map((e) => {
          const lotado = !!e.vagas && e.inscritos >= e.vagas && !e.inscrito;
          return (
            <Card key={e.id} variant="default" padding="lg" className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="neutral" size="sm">{TIPOS[e.tipo]}</Badge>
                <span className="flex items-center gap-1 font-mono text-xs text-stone-500">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {e.inscritos}
                  {e.vagas ? ` de ${e.vagas}` : ''} {e.inscritos === 1 ? 'inscrito' : 'inscritos'}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">{e.titulo}</h3>
              <p className="text-xs text-stone-600">
                {quando(e.inicio, e.fim)} · com {e.anfitriao.nome}
              </p>
              {e.descricao && <p className="whitespace-pre-line text-sm text-stone-700">{e.descricao}</p>}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  size="sm"
                  variant={e.inscrito ? 'outline' : 'primary'}
                  disabled={emCurso === e.id || lotado}
                  onClick={() => void agir(e.id, () => (e.inscrito ? comunidadeService.desinscrever(e.id) : comunidadeService.inscrever(e.id)))}
                >
                  {lotado ? 'Vagas esgotadas' : e.inscrito ? 'Cancelar inscrição' : 'Quero participar'}
                </Button>
                {e.inscrito && e.link && (
                  <a href={e.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-anil-700 underline">
                    Link do evento
                  </a>
                )}
                {(ehAdmin || e.meu) && (
                  <button type="button" className="text-xs text-red-700" onClick={() => void agir(e.id, () => comunidadeService.cancelarEvento(e.id))}>
                    Cancelar evento
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </ScreenContainer>
  );
};
