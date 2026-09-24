import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { ForumCategory } from '../../../domain/community';
import {
  CategoriaDoForum,
  TopicoNaLista,
  comunidadeService,
  motivoDaComunidade,
} from '../../../services/application/comunidade.service';
import { MessageSquare, Calendar, Filter, Plus, ArrowRight } from 'lucide-react';

/**
 * Fórum da comunidade.
 *
 * A tela listava dois debates escritos no código, um deles atribuído à
 * fundadora do Conservatório, com "8 respostas" e "14 apoios" que ninguém
 * deu. E "Publicar no fórum" fechava o formulário, limpava o campo e não
 * gravava nada — quem escrevesse via o próprio texto sumir.
 *
 * Agora o tópico é gravado com a autoria de quem escreveu, e a contagem de
 * respostas vem das respostas. Fórum sem ninguém é fórum vazio, e é isso que
 * a tela mostra até a primeira pessoa escrever.
 *
 * P-1: e é gravado NO SERVIDOR. Antes ficava no navegador de quem escreveu —
 * a "comunidade" era de uma pessoa só.
 */
const CATEGORIAS: { valor: ForumCategory | 'todos'; label: string }[] = [
  { valor: 'todos', label: 'Todos os debates' },
  { valor: ForumCategory.ANALYSIS, label: 'Análises de obras' },
  { valor: ForumCategory.HARMONY, label: 'Harmonia' },
  { valor: ForumCategory.REPERTOIRE, label: 'Repertório' },
];

const ROTULO_DA_CATEGORIA: Record<string, string> = {
  [ForumCategory.ANALYSIS]: 'Análise',
  [ForumCategory.HARMONY]: 'Harmonia',
  [ForumCategory.REPERTOIRE]: 'Repertório',
  [ForumCategory.INSTRUMENTS]: 'Instrumentos',
  [ForumCategory.PEDAGOGY]: 'Pedagogia',
  [ForumCategory.LOUNGE]: 'Conversa',
};

const desdeQuando = (iso: string): string => {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return new Date(iso).toLocaleDateString('pt-BR');
};

export const CommunityFeedScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();
  const [filtro, setFiltro] = useState<ForumCategory | 'todos'>('todos');
  const [topicos, setTopicos] = useState<TopicoNaLista[] | null>(null);
  const [erroDaLista, setErroDaLista] = useState<string | null>(null);

  const [escrevendo, setEscrevendo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [categoria, setCategoria] = useState<ForumCategory>(ForumCategory.ANALYSIS);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(() => {
    comunidadeService
      .topicos(filtro === 'todos' ? undefined : (filtro as CategoriaDoForum))
      .then((t) => {
        setTopicos(t);
        setErroDaLista(null);
      })
      .catch((e) => {
        setErroDaLista(motivoDaComunidade(e));
        setTopicos([]);
      });
  }, [filtro]);

  useEffect(carregar, [carregar]);

  const publicar = async () => {
    if (!titulo.trim() || !corpo.trim()) return;
    if (!userId) {
      setErro('Entre na sua conta para publicar no fórum.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await comunidadeService.abrir({ titulo, corpo, categoria: categoria as CategoriaDoForum });
      setTitulo('');
      setCorpo('');
      setEscrevendo(false);
      carregar();
    } catch (e) {
      setErro(motivoDaComunidade(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScreenContainer
      id="community-feed"
      title="Comunidade acadêmica"
      subtitle="Debates teóricos, análises de repertório e dúvidas sobre as lições."
      badgeLabel="Fórum"
      badgeVariant="neutral"
      /**
       * Visitante nao publica, entao a acao principal dele nao pode ser
       * "Escrever publicacao": seria um botao que existe para nao funcionar.
       */
      primaryAction={
        userId
          ? {
              label: escrevendo ? 'Fechar editor' : 'Escrever publicação',
              icon: Plus,
              onClick: () => setEscrevendo((v) => !v),
            }
          : {
              label: 'Entrar para participar',
              icon: Plus,
              onClick: () => navigate('/auth/login'),
            }
      }
      secondaryActions={[
        {
          label: 'Eventos',
          icon: Calendar,
          onClick: () => navigate('/community/events'),
        },
      ]}
      emptyProps={
        userId
          ? {
              title: erroDaLista ? 'Não deu para abrir o fórum' : 'Nenhum tópico ainda',
              description:
                erroDaLista ?? 'A comunidade começa com a primeira pergunta. Escreva uma dúvida de lição ou uma análise de obra.',
              actionLabel: 'Escrever publicação',
              onAction: () => setEscrevendo(true),
            }
          : {
              title: erroDaLista ? 'Não deu para abrir o fórum' : 'Nenhum tópico ainda',
              description:
                erroDaLista ?? 'A Comunidade é o corpo social do Conservatório. Entre para abrir o primeiro tópico.',
              actionLabel: 'Entrar',
              onAction: () => navigate('/auth/login'),
            }
      }
      state={topicos === null ? 'loading' : topicos.length === 0 && !escrevendo ? 'empty' : 'populated'}
    >
      <div className="space-y-6">
        {!userId && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <VisitorInvitation
              space="Comunidade"
              summary="O corpo social do Conservatório: quem estuda, quem ensina e quem pratica."
              steps={[
                {
                  title: 'Leia tudo sem conta',
                  description: 'Os tópicos são abertos — dá para acompanhar antes de entrar.',
                },
                {
                  title: 'Entre para responder e abrir tópico',
                  description: 'Com a conta Google, sem senha.',
                },
                {
                  /* Prometia "Clubes do seu Grêmio", que não existem. O que existe são as Salas. */
                  title: 'Entre numa sala — ou crie a sua',
                  description: 'Salas são comunidades de estudo abertas pelos próprios usuários.',
                },
              ]}
              primaryLabel="Entrar na Comunidade"
              onPrimary={() => navigate('/auth/login')}
              secondaryLabel="Ver os cursos primeiro"
              onSecondary={() => navigate('/academia')}
            />
          </div>
        )}

        {escrevendo && (
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">Nova publicação</h3>

            {erro && <ErrorState id="forum-error" title="Não foi publicado" message={erro} />}

            <div className="space-y-1">
              <label htmlFor="forum-titulo" className="block text-xs font-semibold text-stone-700">
                Título *
              </label>
              <input
                id="forum-titulo"
                type="text"
                placeholder="A pergunta ou a tese, em uma linha"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded border border-stone-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="forum-categoria" className="block text-xs font-semibold text-stone-700">
                Categoria
              </label>
              <select
                id="forum-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ForumCategory)}
                className="w-full rounded border border-stone-300 bg-white p-2.5 text-sm"
              >
                {Object.entries(ROTULO_DA_CATEGORIA).map(([valor, label]) => (
                  <option key={valor} value={valor}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="forum-corpo" className="block text-xs font-semibold text-stone-700">
                Texto *
              </label>
              <textarea
                id="forum-corpo"
                rows={4}
                placeholder="Contexto, compassos da partitura ou o fundamento da sua questão."
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                className="w-full rounded border border-stone-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEscrevendo(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={enviando || !titulo.trim() || !corpo.trim()}
                onClick={publicar}
              >
                {enviando ? 'Publicando…' : 'Publicar'}
              </Button>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrar debates">
            <Filter className="ml-2 h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
            {CATEGORIAS.map((c) => (
              <button
                key={c.valor}
                type="button"
                role="tab"
                aria-selected={filtro === c.valor}
                onClick={() => setFiltro(c.valor)}
                className={`rounded px-2.5 py-1 text-xs ${
                  filtro === c.valor ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {(topicos ?? []).map((topico) => (
            <Card
              key={topico.id}
              id={`topic-card-${topico.id}`}
              variant="default"
              padding="lg"
              interactive
              onClick={() => navigate(`/community/topic/${topico.id}`)}
              className="cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={topico.autor.nome} size="sm" />
                  <span className="text-xs font-semibold text-stone-900">{topico.autor.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  {topico.fixado && (
                    <Badge variant="brand" size="sm">
                      Fixado
                    </Badge>
                  )}
                  <Badge variant="neutral" size="sm">
                    {ROTULO_DA_CATEGORIA[topico.categoria] ?? topico.categoria}
                  </Badge>
                  <span className="font-mono text-xs text-stone-400">
                    {desdeQuando(topico.ultimaAtividade)}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-stone-900">{topico.titulo}</h3>

              <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  {topico.respostas === 0
                    ? 'Sem respostas'
                    : `${topico.respostas} resposta${topico.respostas > 1 ? 's' : ''}`}
                </span>

                <span className="inline-flex items-center gap-1 font-medium text-anil-800 hover:underline">
                  Ver discussão <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
