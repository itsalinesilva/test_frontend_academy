/**
 * CONTAS E LIMITES — o que o servidor sabe de cada pessoa que entrou (P-5, P-15).
 *
 * O console listava "as contas deste navegador" e não tinha ação nenhuma
 * (AUD-12): a administração não sabia quem usava a plataforma nem podia
 * suspender ninguém. Agora cada login registra a conta aqui — automático,
 * como pede a ADR-003 —, e suspender faz o servidor recusar a sessão daquela
 * pessoa em TODA rota (a checagem mora em `authenticate`).
 *
 * O que fica guardado é o mínimo para administrar: nome, e-mail, primeiro e
 * último acesso. Os dados de estudo da pessoa continuam no Drive dela.
 */
import { ArmazemKV, Resultado, lerJson, todasAsChaves } from './salas';

export interface Conta {
  sub: string;
  email: string;
  nome: string;
  primeiroAcesso: string;
  ultimoAcesso: string;
  acessos: number;
  suspensa?: { em: string; por: string; motivo: string };
}

const K = {
  conta: (sub: string) => `conta:${sub}`,
  contas: 'conta:',
  limite: (chave: string, janela: number) => `limite:${chave}:${janela}`,
};

export async function registrarAcesso(kv: ArmazemKV, id: { sub: string; email: string; nome: string }, agora = new Date()): Promise<Conta> {
  const antes = await lerJson<Conta>(kv, K.conta(id.sub));
  const em = agora.toISOString();
  const conta: Conta = antes
    ? { ...antes, email: id.email, nome: id.nome || antes.nome, ultimoAcesso: em, acessos: antes.acessos + 1 }
    : { sub: id.sub, email: id.email, nome: id.nome, primeiroAcesso: em, ultimoAcesso: em, acessos: 1 };
  await kv.put(K.conta(id.sub), JSON.stringify(conta));
  return conta;
}

export async function lerConta(kv: ArmazemKV, sub: string): Promise<Conta | null> {
  return lerJson<Conta>(kv, K.conta(sub));
}

export async function contaSuspensa(kv: ArmazemKV | undefined, sub: string): Promise<boolean> {
  if (!kv) return false;
  return !!(await lerJson<Conta>(kv, K.conta(sub)))?.suspensa;
}

export async function listarContas(kv: ArmazemKV, q = ''): Promise<Resultado<Conta[]>> {
  const termo = q.toLowerCase().trim();
  const contas = (await Promise.all((await todasAsChaves(kv, K.contas)).map((k) => lerJson<Conta>(kv, k))))
    .filter((c): c is Conta => c !== null)
    .filter((c) => !termo || c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo))
    .sort((a, b) => b.ultimoAcesso.localeCompare(a.ultimoAcesso));
  return { ok: true, valor: contas };
}

export async function suspender(
  kv: ArmazemKV,
  sub: string,
  por: string,
  motivo: unknown,
  suspensa: boolean,
  agora = new Date()
): Promise<Resultado<Conta>> {
  const c = await lerJson<Conta>(kv, K.conta(sub));
  if (!c) return { ok: false, status: 404, codigo: 'CONTA_NAO_EXISTE', mensagem: 'Esta conta nunca entrou na plataforma.' };
  if (suspensa && (typeof motivo !== 'string' || !motivo.trim())) {
    return { ok: false, status: 400, codigo: 'SEM_MOTIVO', mensagem: 'Diga o motivo da suspensão — ele fica na trilha de auditoria.' };
  }
  const nova: Conta = suspensa
    ? { ...c, suspensa: { em: agora.toISOString(), por, motivo: String(motivo).trim().slice(0, 500) } }
    : { ...c, suspensa: undefined };
  await kv.put(K.conta(sub), JSON.stringify(nova));
  return { ok: true, valor: nova };
}

/**
 * LIMITE DE TAXA (P-15): no máximo `max` escritas por janela de `segundos`,
 * por chave (pessoa + rota). O KV não tem incremento atômico, então o limite é
 * aproximado — o bastante para conter enxurrada, que é o que se quer aqui.
 */
export async function dentroDoLimite(
  kv: ArmazemKV | undefined,
  chave: string,
  max: number,
  segundos: number,
  agora = Date.now()
): Promise<boolean> {
  if (!kv) return true;
  const janela = Math.floor(agora / (segundos * 1000));
  const k = K.limite(chave, janela);
  const n = Number((await kv.get(k)) ?? '0');
  if (n >= max) return false;
  await kv.put(k, String(n + 1), { expirationTtl: Math.max(60, segundos * 2) });
  return true;
}
