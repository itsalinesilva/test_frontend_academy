/**
 * Integridade criptográfica de evidências.
 *
 * MOTIVO DESTE MÓDULO
 * -------------------
 * Até aqui o campo `sha256Hash` das evidências era produzido assim:
 *
 *     `sha256:${Math.random().toString(16)}${Date.now().toString(16)}`
 *
 * Ou seja: um número aleatório com o texto "sha256:" colado na frente. Não
 * era derivado do conteúdo, não era SHA-256 e não detectava adulteração
 * alguma — dois registros idênticos recebiam hashes diferentes e um registro
 * adulterado mantinha o seu. A interface, por cima disso, afirmava
 * "prova matemática de integridade" e "Integridade confirmada!".
 *
 * Numa plataforma cujo diferencial declarado é a credencial verificável, uma
 * afirmação falsa de segurança é pior do que a ausência dela. Este módulo
 * calcula o hash de verdade, sobre o conteúdo, com Web Crypto.
 */

/**
 * Serialização canônica: chaves ordenadas em toda a profundidade.
 *
 * Sem isto o mesmo conteúdo produziria hashes diferentes só porque as
 * propriedades foram escritas em outra ordem. Mesma técnica do
 * `server/core/audit-log.ts`.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const entradas = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`);
  return `{${entradas.join(',')}}`;
}

/** SHA-256 hexadecimal de um texto, via Web Crypto. */
export async function sha256Hex(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Campos que entram no hash de uma evidência.
 *
 * O hash cobre o que identifica o trabalho e quem o avaliou. Não cobre
 * `visibility` nem `id`: mudar a visibilidade de uma evidência é decisão do
 * autor sobre quem a vê, não uma alteração do que foi feito, e invalidar o
 * hash nesse caso produziria falso positivo de adulteração.
 */
export interface EvidenciaHashavel {
  userId: string;
  source: string;
  sourceEntityId?: string;
  title: string;
  description?: string;
  artifactType: string;
  artifactUrl?: string;
  skills?: string[];
  instruments?: string[];
  evaluator?: { name: string; decision: string } | undefined;
  createdAt: string;
}

/** Hash canônico de uma evidência, no formato `sha256:<64 hex>`. */
export async function computeEvidenceHash(ev: EvidenciaHashavel): Promise<string> {
  const conteudo = canonicalJson({
    userId: ev.userId,
    source: ev.source,
    sourceEntityId: ev.sourceEntityId ?? null,
    title: ev.title,
    description: ev.description ?? null,
    artifactType: ev.artifactType,
    artifactUrl: ev.artifactUrl ?? null,
    skills: [...(ev.skills ?? [])].sort(),
    instruments: [...(ev.instruments ?? [])].sort(),
    evaluator: ev.evaluator
      ? { name: ev.evaluator.name, decision: ev.evaluator.decision }
      : null,
    createdAt: ev.createdAt,
  });
  return `sha256:${await sha256Hex(conteudo)}`;
}

export type ResultadoIntegridade = 'valida' | 'adulterada' | 'nao_verificavel';

/**
 * Recalcula o hash e compara com o registrado.
 *
 * `nao_verificavel` existe para registros gravados antes desta correção: o
 * valor antigo não tem o formato de um SHA-256 e não há o que comparar.
 * Chamar isso de "adulterado" seria acusar o dado errado; chamar de "válido"
 * repetiria a mentira. Então é uma terceira resposta, dita como tal.
 */
export async function verifyEvidenceIntegrity(
  ev: EvidenciaHashavel & { sha256Hash: string }
): Promise<ResultadoIntegridade> {
  if (!/^sha256:[0-9a-f]{64}$/.test(ev.sha256Hash)) {
    return 'nao_verificavel';
  }
  const recalculado = await computeEvidenceHash(ev);
  return recalculado === ev.sha256Hash ? 'valida' : 'adulterada';
}
