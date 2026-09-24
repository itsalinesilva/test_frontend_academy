import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { ErrorState } from '../../components/feedback/ErrorState';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  Resposta,
  Topico,
  comunidadeService,
  motivoDaComunidade,
} from '../../../services/application/comunidade.service';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

/**
 * Discussão do fórum.
 *
 * A tela IGNORAVA o identificador da rota e mostrava sempre o mesmo debate
 * escrito no código — uma análise da Fuga BWV 1001 atribuída à fundadora do
 * Conservatório, com "14 apoios", "2 respostas registradas" e uma resposta de
 * um "Prof. Carlos Eduardo" que não existe. As respostas que a pessoa
 * escrevia ficavam só na memória da aba e sumiam ao recarregar.
 *
 * O botão "Reportar à moderação" respondia `alert('Sinalização enviada para a
 * fila de moderação institucional')`. Não há fila de moderação. Prometer que
 * uma denúncia foi encaminhada, quando ela não foi, é pior do que não ter o
 * botão: alguém confia e fica sem proteção nenhuma. Ele saiu, e a moderação
 * está aberta em `CLAUDE_TODO.md` como funcionalidade a construir.
 *
 * Agora a tela lê o tópico de verdade e grava as respostas.
 */
const desdeQuando = (iso: string): string => {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return new Date(iso).toLocaleDateString('pt-BR');
};

export const TopicDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const topicId = params.id;
  const { userId, ehAdmin } = useCurrentUser();

  const [topico, setTopico] = useState<Topico | null | undefined>(undefined);
  const [mensagens, setMensagens] = useState<Resposta[]>([]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    if (!topicId) {
      setTopico(null);
      return;
    }
    const r = await comunidadeService.topico(topicId);
    setTopico(r.topico);
    setMensagens(r.mensagens);
  }, [topicId]);

  useEffect(() => {
    carregar().catch(() => setTopico(null));
  }, [carregar]);

  const responder = async () => {
    if (!texto.trim() || !topico) return;
    if (!userId) {
      setErro('Entre na sua conta para responder.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      /** A autoria vem da sessão, no servidor (P-1). */
      await comunidadeService.responder(topico.id, texto);
      setTexto('');
      await carregar();
    } catch (e) {
      setErro(motivoDaComunidade(e));
    } finally {
      setEnviando(false);
    }
  };

  const abertura = mensagens[0];
  const respostas = mensagens.slice(1);

  return (
    <ScreenContainer
      id="topic-detail"
      title={topico?.titulo ?? 'Discussão'}
      subtitle={topico ? `Aberta por ${topico.autor.nome} ${desdeQuando(topico.criadoEm)}` : undefined}
      badgeLabel={topico?.oculto ? 'Oculto pela moderação' : topico?.trancado ? 'Fechado' : undefined}
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao fórum',
        icon: ArrowLeft,
        onClick: () => navigate('/community'),
      }}
      emptyProps={{
        title: 'Tópico não encontrado',
        description: `Nenhuma discussão responde por "${topicId ?? ''}". Ela pode ter sido removida por quem a abriu.`,
        actionLabel: 'Ver todos os tópicos',
        onAction: () => navigate('/community'),
      }}
      state={topico === undefined ? 'loading' : topico === null ? 'empty' : 'populated'}
    >
      {topico && (
        <div className="mx-auto max-w-4xl space-y-6">
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <Avatar name={topico.autor.nome} size="md" />
                <div>
                  <p className="text-sm font-bold text-stone-900">{topico.autor.nome}</p>
                  <p className="font-mono text-xs text-stone-500">
                    Publicado {desdeQuando(topico.criadoEm)}
                  </p>
                </div>
              </div>
              {ehAdmin && (
                /** P-4 — moderação; o servidor confere a outorga, a tela só não oferece a quem ele recusaria. */
                <span className="flex flex-wrap gap-2 text-xs" aria-label="Moderação">
                  {(['fixar', topico.trancado ? 'destrancar' : 'trancar', topico.oculto ? 'mostrar' : 'ocultar'] as const).map((acao) => (
                    <button
                      key={acao}
                      type="button"
                      onClick={() =>
                        void comunidadeService
                          .moderarTopico(topico.id, acao)
                          .then(carregar)
                          .catch((e) => setErro(motivoDaComunidade(e)))
                      }
                      className="rounded border border-stone-300 px-2 py-0.5 text-stone-700 hover:bg-stone-100"
                    >
                      {{ fixar: topico.fixado ? 'Desafixar' : 'Fixar', trancar: 'Fechar', destrancar: 'Reabrir', ocultar: 'Ocultar', mostrar: 'Mostrar' }[acao]}
                    </button>
                  ))}
                </span>
              )}
              {topico.fixado && <Badge variant="brand">Fixado</Badge>}
            </div>

            {abertura && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">
                {abertura.corpo}
              </p>
            )}

            <p className="border-t border-stone-100 pt-3 text-xs text-stone-500">
              {respostas.length === 0
                ? 'Ainda sem respostas'
                : `${respostas.length} resposta${respostas.length > 1 ? 's' : ''}`}
            </p>
          </Card>

          {respostas.length > 0 && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-serif text-base font-bold text-stone-900">
                <MessageSquare className="h-4 w-4 text-anil-800" aria-hidden="true" />
                Respostas
              </h3>

              {respostas.map((r) => (
                <Card key={r.id} variant="muted" padding="md" className="space-y-2 border-stone-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.autor.nome} size="sm" />
                      <span className="text-xs font-bold text-stone-900">{r.autor.nome}</span>
                      {r.oculta && <span className="text-[11px] text-amber-800">oculta pela moderação</span>}
                    </div>
                    <span className="font-mono text-xs text-stone-400">
                      {desdeQuando(r.em)}
                      {ehAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            void comunidadeService
                              .moderarResposta(topico.id, r.id, r.oculta ? 'mostrar' : 'ocultar')
                              .then(carregar)
                              .catch((e) => setErro(motivoDaComunidade(e)))
                          }
                          className="ml-2 text-stone-600 underline"
                        >
                          {r.oculta ? 'Mostrar' : 'Ocultar'}
                        </button>
                      )}
                    </span>
                  </div>
                  <p className="whitespace-pre-line pl-8 text-xs leading-relaxed text-stone-700">
                    {r.corpo}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {topico.trancado ? (
            <p className="text-xs text-stone-600">Este tópico foi fechado para respostas.</p>
          ) : (
          <Card variant="default" padding="md" className="space-y-3">
            <label
              htmlFor="topic-resposta"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
            >
              Adicionar resposta
            </label>

            {erro && <ErrorState id="topic-error" title="Não foi enviado" message={erro} />}

            <textarea
              id="topic-resposta"
              placeholder="Sua análise ou consideração técnica."
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full rounded border border-stone-300 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-anil-800 sm:text-sm"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={responder}
                disabled={enviando || !texto.trim()}
              >
                <Send className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                {enviando ? 'Enviando…' : 'Enviar resposta'}
              </Button>
            </div>
          </Card>
          )}
        </div>
      )}
    </ScreenContainer>
  );
};
