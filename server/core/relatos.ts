/**
 * RELATOS DE EXERCÍCIO — "Reportar um problema" chega a alguém (L-7a).
 *
 * A tela de exercício sempre soube perguntar, e promete "vamos revisar este
 * exercício". Sem servidor, o relato ficaria no navegador de quem reportou,
 * onde ninguém da equipe o veria — por isso o botão ficou desligado.
 *
 * O servidor da plataforma (Cloudflare Pages Functions) não tinha onde
 * guardar nada que sobrevivesse: até o log de auditoria vive em memória. O
 * relato precisa de armazenamento durável, e usa o KV da Cloudflare, ligado
 * pelo nome `RELATOS`. Sem essa ligação a API responde que não está
 * configurada — e a tela diz que o relato NÃO foi enviado, em vez de fingir.
 */

/** O pedaço do KV da Cloudflare que o relato usa. */
export interface ArmazemDeRelatos {
  put(chave: string, valor: string): Promise<void>;
  get(chave: string): Promise<string | null>;
  list(opcoes: { prefix: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
}

export interface Relato {
  id: string;
  exerciseId: string;
  /** O enunciado, para quem revisa saber de que pergunta se trata sem abrir nada. */
  enunciado: string;
  /** O que a pessoa escreveu. Opcional: o clique já é informação. */
  comentario?: string;
  autorSubject: string;
  autorEmail: string;
  em: string;
}

export const LIMITE_DO_COMENTARIO = 500;

export function problemasDoRelato(corpo: unknown): string[] {
  const c = corpo as Partial<Relato> | null;
  if (!c || typeof c !== 'object') return ['O relato veio vazio.'];
  const p: string[] = [];
  if (typeof c.exerciseId !== 'string' || !c.exerciseId.trim()) p.push('Falta o exercício do relato.');
  if (typeof c.enunciado !== 'string' || !c.enunciado.trim()) p.push('Falta o enunciado do exercício.');
  if (c.comentario !== undefined && (typeof c.comentario !== 'string' || c.comentario.length > LIMITE_DO_COMENTARIO)) {
    p.push(`O comentário passa de ${LIMITE_DO_COMENTARIO} caracteres.`);
  }
  return p;
}

/** Chave ordenável pelo tempo: listar pelo prefixo devolve do mais antigo ao mais novo. */
export function chaveDoRelato(em: string, id: string): string {
  return `relato:${em}:${id}`;
}
