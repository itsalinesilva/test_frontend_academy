import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { apiClient } from '../../../infrastructure/api/api-client';
import { ArrowLeft } from 'lucide-react';

/**
 * A fila de moderação (P-4 · AUD-14).
 *
 * Esta tela já afirmou "Comunidade em Plena Conformidade" sem ninguém ter
 * conferido nada, e depois, com honestidade, que a moderação não existia —
 * não havia como denunciar. Agora há: tópico, resposta do fórum e post de
 * sala têm "Denunciar", e a fila chega aqui agrupada por alvo (dez denúncias
 * do mesmo post são um item, com a contagem). Ocultar esconde o conteúdo para
 * todo mundo menos quem o escreveu; descartar fecha sem mexer. As duas
 * decisões ficam na denúncia e na trilha de auditoria.
 */
interface Item {
  id: string;
  alvo: { tipo: 'forum-topico' | 'forum-resposta' | 'sala-post'; id: string; topicoId?: string; salaId?: string; resumo: string };
  motivo: string;
  autor: { nome: string };
  em: string;
  vezes: number;
  status: string;
  decisao?: { por: string; em: string };
}

const TIPO = { 'forum-topico': 'Tópico do fórum', 'forum-resposta': 'Resposta do fórum', 'sala-post': 'Post de sala' } as const;

export const AdminModerationScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [aba, setAba] = useState<'aberta' | 'ocultada' | 'descartada'>('aberta');
  const [itens, setItens] = useState<Item[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setItens(null);
    apiClient
      .get<Item[]>(`/founder/denuncias?status=${aba}`)
      .then((x) => {
        setItens(x);
        setErro(null);
      })
      .catch((e) => {
        setErro(e instanceof Error ? e.message : 'A fila não chegou.');
        setItens([]);
      });
  }, [aba]);
  useEffect(carregar, [carregar]);

  const decidir = (id: string, acao: 'ocultar' | 'descartar') =>
    void apiClient
      .post(`/founder/denuncias/${encodeURIComponent(id)}/${acao}`, {})
      .then(carregar)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível.'));

  const abrir = (i: Item) =>
    navigate(i.alvo.tipo === 'sala-post' ? '/rooms' : `/community/topic/${i.alvo.topicoId ?? i.alvo.id}`);

  return (
    <ScreenContainer
      id="admin-moderation"
      title="Moderação"
      subtitle="As denúncias da comunidade — fórum e salas —, agrupadas pelo que foi denunciado."
      badgeLabel={itens && aba === 'aberta' ? `${itens.length} em aberto` : 'Moderação'}
      badgeVariant="neutral"
      primaryAction={{ label: 'Voltar ao console', icon: ArrowLeft, onClick: () => navigate('/founder') }}
      state={itens === null ? 'loading' : 'populated'}
    >
      <div className="space-y-4">
        <div role="tablist" aria-label="Situação das denúncias" className="flex gap-1 border-b border-stone-200">
          {(['aberta', 'ocultada', 'descartada'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={aba === s}
              onClick={() => setAba(s)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${aba === s ? 'border-anil-800 font-semibold' : 'border-transparent text-stone-600'}`}
            >
              {{ aberta: 'Em aberto', ocultada: 'Ocultadas', descartada: 'Descartadas' }[s]}
            </button>
          ))}
        </div>

        {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
        {itens && itens.length === 0 && !erro && (
          <p className="text-sm text-stone-600">
            {aba === 'aberta' ? 'Nenhuma denúncia esperando decisão.' : 'Nada aqui ainda.'}
          </p>
        )}

        {(itens ?? []).map((i) => (
          <Card key={i.id} variant="default" padding="md" className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs">
                <Badge variant="neutral" size="sm">{TIPO[i.alvo.tipo]}</Badge>
                <strong className="text-stone-900">{i.motivo}</strong>
              </span>
              <span className="font-mono text-[11px] text-stone-500">
                {i.vezes} {i.vezes === 1 ? 'denúncia' : 'denúncias'} · primeira em {new Date(i.em).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-stone-800">"{i.alvo.resumo}"</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <button type="button" onClick={() => abrir(i)} className="text-anil-700 underline">
                Ver no lugar
              </button>
              {aba === 'aberta' ? (
                <>
                  <button type="button" onClick={() => decidir(i.id, 'ocultar')} className="font-semibold text-red-700">
                    Ocultar
                  </button>
                  <button type="button" onClick={() => decidir(i.id, 'descartar')} className="text-stone-700">
                    Descartar
                  </button>
                </>
              ) : (
                i.decisao && <span className="text-stone-500">Decidido por {i.decisao.por} em {new Date(i.decisao.em).toLocaleString('pt-BR')}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};
