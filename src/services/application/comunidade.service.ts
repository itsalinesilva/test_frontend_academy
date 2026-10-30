import { apiClient } from '../../infrastructure/api/api-client';

/**
 * Fórum e eventos, do lado do app (P-1, P-2). Quem guarda e decide é o
 * servidor (`server/core/comunidade.ts`): é dado de várias pessoas (ADR-003).
 * Os tipos espelham os do servidor; autoria nunca sai daqui.
 */
export interface PessoaDaComunidade {
  sub: string;
  nome: string;
}
export type CategoriaDoForum = 'ANALYSIS' | 'HARMONY' | 'REPERTOIRE' | 'INSTRUMENTS' | 'PEDAGOGY' | 'LOUNGE';

export interface Topico {
  id: string;
  categoria: CategoriaDoForum;
  titulo: string;
  autor: PessoaDaComunidade;
  criadoEm: string;
  fixado: boolean;
  trancado: boolean;
  oculto: boolean;
}
export interface TopicoNaLista extends Topico {
  respostas: number;
  ultimaAtividade: string;
}
export interface Resposta {
  id: string;
  topicoId: string;
  autor: PessoaDaComunidade;
  corpo: string;
  em: string;
  oculta: boolean;
}
export type TipoDeEvento = 'MASTERCLASS' | 'RECITAL' | 'ENCONTRO' | 'OFICINA';
export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoDeEvento;
  inicio: string;
  fim: string;
  link?: string;
  vagas?: number;
  anfitriao: PessoaDaComunidade;
  criadoEm: string;
  cancelado: boolean;
  inscritos: number;
  inscrito: boolean;
  /** O evento é de quem pergunta — o servidor sabe; o app não compara ids. */
  meu: boolean;
}

const e = encodeURIComponent;

export const comunidadeService = {
  topicos: (categoria?: CategoriaDoForum) =>
    apiClient.get<TopicoNaLista[]>(`/forum/topicos${categoria ? `?categoria=${e(categoria)}` : ''}`),
  abrir: (d: { titulo: string; corpo: string; categoria: CategoriaDoForum }) => apiClient.post<Topico>('/forum/topicos', d),
  topico: (id: string) => apiClient.get<{ topico: Topico; mensagens: Resposta[] }>(`/forum/topicos/${e(id)}`),
  responder: (id: string, corpo: string) => apiClient.post<Resposta>(`/forum/topicos/${e(id)}/respostas`, { corpo }),

  eventos: () => apiClient.get<Evento[]>('/eventos'),
  criarEvento: (d: { titulo: string; descricao: string; tipo: TipoDeEvento; inicio: string; fim: string; link?: string; vagas?: number }) =>
    apiClient.post<Evento>('/eventos', d),
  inscrever: (id: string) => apiClient.post<{ inscrito: boolean }>(`/eventos/${e(id)}/inscrever`, {}),
  desinscrever: (id: string) => apiClient.post<{ inscrito: boolean }>(`/eventos/${e(id)}/desinscrever`, {}),
  cancelarEvento: (id: string) => apiClient.post<Evento>(`/eventos/${e(id)}/cancelar`, {}),

  /** Moderação — o servidor recusa quem não é administração. */
  moderarTopico: (id: string, acao: 'ocultar' | 'mostrar' | 'fixar' | 'trancar' | 'destrancar') =>
    apiClient.post<Topico>(`/founder/forum/topicos/${e(id)}/${acao}`, {}),
  moderarResposta: (topico: string, resposta: string, acao: 'ocultar' | 'mostrar') =>
    apiClient.post<Resposta>(`/founder/forum/topicos/${e(topico)}/${e(resposta)}/${acao}`, {}),
};

export function motivoDaComunidade(erro: unknown): string {
  const m = erro instanceof Error ? erro.message : '';
  if (/não está ligada/.test(m)) return 'A comunidade ainda não está ligada neste servidor.';
  if (/Failed to fetch|NETWORK|tempo limite/.test(m)) return 'Sem conexão com o servidor. Tente de novo.';
  return m || 'Algo deu errado. Tente de novo.';
}
