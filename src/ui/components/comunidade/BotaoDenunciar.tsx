import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { apiClient } from '../../../infrastructure/api/api-client';

/**
 * Denunciar (P-4). Serve a tópico, resposta do fórum e post de sala.
 *
 * O motivo é escolhido de uma lista curta — texto livre numa denúncia vira
 * outro lugar para o mesmo abuso. Repetir a denúncia não soma: o servidor
 * guarda uma por pessoa e por alvo.
 */
export type AlvoDaDenuncia =
  | { tipo: 'forum-topico'; id: string; resumo: string }
  | { tipo: 'forum-resposta'; id: string; topicoId: string; resumo: string }
  | { tipo: 'sala-post'; id: string; salaId: string; resumo: string };

export const MOTIVOS_DE_DENUNCIA = ['Ofensa ou assédio', 'Spam ou propaganda', 'Conteúdo impróprio', 'Informação falsa', 'Outro'];

export const BotaoDenunciar: React.FC<{ alvo: AlvoDaDenuncia }> = ({ alvo }) => {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'enviada' | { erro: string }>('parado');

  if (estado === 'enviada') {
    return (
      <span role="status" className="text-[11px] text-stone-500">
        Denúncia recebida. A administração vai olhar.
      </span>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={`Denunciar: ${alvo.resumo}`}
        className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-red-700"
      >
        <Flag className="h-3 w-3" aria-hidden="true" /> Denunciar
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-[11px]">
      <label className="sr-only" htmlFor={`motivo-${alvo.id}`}>
        Motivo da denúncia
      </label>
      <select id={`motivo-${alvo.id}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="rounded border border-stone-300 p-1">
        <option value="">Motivo…</option>
        {MOTIVOS_DE_DENUNCIA.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!motivo || estado === 'enviando'}
        onClick={() => {
          setEstado('enviando');
          apiClient
            .post('/denuncias', { alvo, motivo })
            .then(() => setEstado('enviada'))
            .catch((e) => setEstado({ erro: e instanceof Error ? e.message : 'Não foi enviada.' }));
        }}
        className="font-semibold text-red-700 disabled:opacity-40"
      >
        Enviar denúncia
      </button>
      <button type="button" onClick={() => setAberto(false)} className="text-stone-600">
        Cancelar
      </button>
      {typeof estado === 'object' && (
        <span role="alert" className="text-red-800">
          {estado.erro}
        </span>
      )}
    </span>
  );
};
