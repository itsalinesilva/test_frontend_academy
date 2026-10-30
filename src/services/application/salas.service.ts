import { apiClient } from '../../infrastructure/api/api-client';

/**
 * As salas, do lado do app (AUD-9). O servidor é quem guarda e quem decide
 * (`server/core/salas.ts`): uma sala é de várias pessoas, e por isso vive no
 * KV do servidor e não no Drive de ninguém (ADR-003).
 *
 * Os tipos espelham os do servidor. Nenhum campo de autoria sai daqui: o
 * servidor lê quem é da sessão assinada.
 */
export interface PessoaDaSala {
  sub: string;
  nome: string;
}
export type Privacidade = 'publica' | 'privada';
export type Papel = 'dono' | 'moderador' | 'membro';

export interface Sala {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  privacidade: Privacidade;
  categorias: string[];
  cursos: string[];
  dono: PessoaDaSala;
  criadaEm: string;
}
export interface SalaNoDiretorio extends Sala {
  membros: number;
  souMembro: boolean;
}
export interface Membro extends PessoaDaSala {
  papel: Papel;
  status: 'ativo' | 'pendente';
  entrouEm: string;
}
export interface Post {
  id: string;
  salaId: string;
  autor: PessoaDaSala;
  categoria: string;
  titulo: string;
  corpo: string;
  fixado: boolean;
  em: string;
  curtidas: number;
  curtiEu: boolean;
  comentarios: number;
}
export interface Comentario {
  id: string;
  postId: string;
  autor: PessoaDaSala;
  corpo: string;
  em: string;
}
export interface Encontro {
  id: string;
  titulo: string;
  inicio: string;
  duracaoMin: number;
  link?: string;
  descricao?: string;
}
export type FormatoDeEntrega = 'texto' | 'link' | 'partitura';
export interface Entrega {
  tarefaId: string;
  aluno: PessoaDaSala;
  conteudo: string;
  em: string;
  atrasada: boolean;
  avaliacao?: { nota: number | null; comentario: string; por: string; em: string };
}
export interface Tarefa {
  id: string;
  titulo: string;
  enunciado: string;
  formato: FormatoDeEntrega;
  prazo?: string;
  autor: PessoaDaSala;
  criadaEm: string;
  minhaEntrega: Entrega | null;
  /** Só quem cuida da sala recebe o número. */
  entregas: number | null;
}
export interface NoRanking extends PessoaDaSala {
  pontos: number;
  nivel: number;
}
export interface SobreASala {
  sala: Sala;
  membros: number;
  eu: Membro | null;
  podeLer: boolean;
}

const e = encodeURIComponent;
const base = (sala: string) => `/salas/${e(sala)}`;

export const salasService = {
  diretorio: () => apiClient.get<SalaNoDiretorio[]>('/salas'),
  criar: (d: { nome: string; descricao: string; privacidade: Privacidade; categorias: string[] }) =>
    apiClient.post<Sala>('/salas', d),
  sobre: (sala: string) => apiClient.get<SobreASala>(base(sala)),
  editar: (sala: string, d: Partial<Pick<Sala, 'descricao' | 'privacidade' | 'categorias' | 'cursos'>>) =>
    apiClient.patch<Sala>(base(sala), d),
  entrar: (sala: string) => apiClient.post<Membro>(`${base(sala)}/entrar`, {}),
  sair: (sala: string) => apiClient.post<null>(`${base(sala)}/sair`, {}),
  membros: (sala: string) => apiClient.get<Membro[]>(`${base(sala)}/membros`),
  decidir: (sala: string, sub: string, acao: 'aprovar' | 'remover' | 'moderador' | 'membro') =>
    apiClient.post<Membro | null>(`${base(sala)}/membros/${e(sub)}/${acao}`, {}),
  posts: (sala: string) => apiClient.get<Post[]>(`${base(sala)}/posts`),
  publicar: (sala: string, d: { titulo: string; corpo: string; categoria: string }) =>
    apiClient.post<Post>(`${base(sala)}/posts`, d),
  apagar: (sala: string, post: string) => apiClient.delete<null>(`${base(sala)}/posts/${e(post)}`),
  curtir: (sala: string, post: string) => apiClient.post<{ curti: boolean }>(`${base(sala)}/posts/${e(post)}/curtir`, {}),
  fixar: (sala: string, post: string) => apiClient.post<Post>(`${base(sala)}/posts/${e(post)}/fixar`, {}),
  comentarios: (sala: string, post: string) => apiClient.get<Comentario[]>(`${base(sala)}/posts/${e(post)}/comentarios`),
  comentar: (sala: string, post: string, corpo: string) =>
    apiClient.post<Comentario>(`${base(sala)}/posts/${e(post)}/comentarios`, { corpo }),
  encontros: (sala: string) => apiClient.get<Encontro[]>(`${base(sala)}/encontros`),
  marcar: (sala: string, d: { titulo: string; inicio: string; duracaoMin: number; link?: string; descricao?: string }) =>
    apiClient.post<Encontro>(`${base(sala)}/encontros`, d),
  ranking: (sala: string) => apiClient.get<NoRanking[]>(`${base(sala)}/ranking`),
  tarefas: (sala: string) => apiClient.get<Tarefa[]>(`${base(sala)}/tarefas`),
  proporTarefa: (sala: string, d: { titulo: string; enunciado: string; formato: FormatoDeEntrega; prazo?: string }) =>
    apiClient.post<Tarefa>(`${base(sala)}/tarefas`, d),
  entregar: (sala: string, tarefa: string, conteudo: string) =>
    apiClient.post<Entrega>(`${base(sala)}/tarefas/${e(tarefa)}/entregar`, { conteudo }),
  entregas: (sala: string, tarefa: string) => apiClient.get<Entrega[]>(`${base(sala)}/tarefas/${e(tarefa)}/entregas`),
  avaliar: (sala: string, tarefa: string, aluno: string, d: { nota: number | null; comentario: string }) =>
    apiClient.post<Entrega>(`${base(sala)}/tarefas/${e(tarefa)}/entregas/${e(aluno)}/avaliar`, d),
};

/** A mensagem que a tela mostra. O servidor já escreve em português para a pessoa. */
export function motivo(erro: unknown): string {
  const m = erro instanceof Error ? erro.message : '';
  if (/não estão ligadas|NOT_CONFIGURED|SERVER_NOT_CONFIGURED/.test(m)) {
    return 'As salas ainda não estão ligadas neste servidor.';
  }
  if (/Failed to fetch|NETWORK|tempo limite/.test(m)) return 'Sem conexão com o servidor. Tente de novo.';
  return m || 'Algo deu errado. Tente de novo.';
}
