/**
 * A CÓPIA DE SEGURANÇA DOS DADOS DO ALUNO (ADR-001.A · AUD-20).
 *
 * A decisão de arquitetura é local-first: os dados vivem no `localStorage`, e
 * a durabilidade vem de um JSON no Google Drive da própria pessoa, na pasta
 * oculta da aplicação (`drive.appdata`). No celular, quem preferir pode
 * guardar só no aparelho.
 *
 * Estava decidido e não existia: limpar o navegador apagava tudo, e trocar de
 * aparelho recomeçava do zero.
 *
 * Este módulo é puro — não fala com o Drive nem com o navegador. Decide O QUE
 * entra na cópia e COMO ela volta, que é onde mora o risco:
 *
 *   1. Num aparelho compartilhado, o `localStorage` guarda registros de outras
 *      pessoas nas mesmas chaves (o caderno é uma lista com a partitura de
 *      todos que usaram ali). Copiar a chave inteira mandaria o trabalho de
 *      outra pessoa para o MEU Drive. Todo registro com dono que não é quem
 *      faz a cópia fica de fora.
 *   2. Sessão, lista de contas do aparelho e preferências do aparelho nunca
 *      entram: não são da pessoa, são do navegador.
 *   3. Restaurar não pode apagar o que outra pessoa tem no aparelho: os
 *      registros dela continuam, e os meus voltam por cima.
 */

export const VERSAO_DA_COPIA = 1;
export const NOME_DO_ARQUIVO = 'muscicapa-dados.json';

/** Chaves (sem o prefixo `amd_`) que nunca vão para a cópia. */
export const CHAVES_DE_FORA = [
  'current_auth_session',
  'users_collection',
  'preferencias_v1',
  'copia_estado_v1',
] as const;

/** Campos que dizem de quem é um registro. */
const CAMPOS_DE_DONO = ['userId', 'autorId', 'ownerId', 'ownerSubject', 'studentId'] as const;

export interface CopiaDeSeguranca {
  versao: number;
  geradaEm: string;
  /** Quem é o dono da cópia — restaurar a cópia de outra pessoa é recusado. */
  dono: string;
  /** chave (sem prefixo) → valor já decodificado de JSON */
  dados: Record<string, unknown>;
}

function donoDe(item: unknown): string | undefined {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return undefined;
  for (const campo of CAMPOS_DE_DONO) {
    const v = (item as Record<string, unknown>)[campo];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

/**
 * Tira do valor os registros de outras pessoas.
 *
 * Lista: fica o item sem dono (conteúdo, configuração) e o item cujo dono sou
 * eu. Objeto indexado por id (`{ id: registro }`): a mesma regra, valor a
 * valor. Qualquer outra coisa passa inteira.
 */
export function soODe(valor: unknown, userId: string): unknown {
  if (Array.isArray(valor)) {
    return valor.filter((item) => {
      const dono = donoDe(item);
      return dono === undefined || dono === userId;
    });
  }
  if (valor && typeof valor === 'object') {
    const dono = donoDe(valor);
    if (dono !== undefined) return dono === userId ? valor : undefined;
    const entradas = Object.entries(valor as Record<string, unknown>);
    const comDono = entradas.filter(([, v]) => donoDe(v) !== undefined);
    if (comDono.length === 0) return valor;
    return Object.fromEntries(entradas.filter(([, v]) => {
      const d = donoDe(v);
      return d === undefined || d === userId;
    }));
  }
  return valor;
}

/** Monta a cópia a partir do que o `localStorage` guarda (chaves já sem prefixo, valores em texto). */
export function montarCopia(
  guardado: Record<string, string>,
  userId: string,
  agora: Date = new Date()
): CopiaDeSeguranca {
  const dados: Record<string, unknown> = {};
  for (const [chave, texto] of Object.entries(guardado)) {
    if ((CHAVES_DE_FORA as readonly string[]).includes(chave)) continue;
    let valor: unknown;
    try {
      valor = JSON.parse(texto);
    } catch {
      continue;
    }
    const meu = soODe(valor, userId);
    if (meu === undefined) continue;
    if (Array.isArray(meu) && meu.length === 0 && Array.isArray(valor) && valor.length > 0) continue;
    dados[chave] = meu;
  }
  return { versao: VERSAO_DA_COPIA, geradaEm: agora.toISOString(), dono: userId, dados };
}

export type ResultadoDaLeitura =
  | { ok: true; copia: CopiaDeSeguranca }
  | { ok: false; motivo: string };

/** Lê e confere uma cópia vinda de fora (Drive ou arquivo escolhido pela pessoa). */
export function lerCopia(texto: string, userId: string): ResultadoDaLeitura {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'O arquivo não é uma cópia da plataforma: não é JSON.' };
  }
  const c = bruto as Partial<CopiaDeSeguranca>;
  if (!c || typeof c !== 'object' || typeof c.dados !== 'object' || c.dados === null || typeof c.versao !== 'number') {
    return { ok: false, motivo: 'O arquivo não é uma cópia da plataforma.' };
  }
  if (c.versao > VERSAO_DA_COPIA) {
    return { ok: false, motivo: 'A cópia foi feita por uma versão mais nova da plataforma. Atualize a página.' };
  }
  if (c.dono !== userId) {
    return { ok: false, motivo: 'Esta cópia é de outra conta. Entre com a conta que a gerou.' };
  }
  return { ok: true, copia: c as CopiaDeSeguranca };
}

/**
 * Funde a cópia com o que o aparelho já tem.
 *
 * Por chave: listas se juntam por `id` — o registro da cópia vence o local de
 * mesmo id, e os registros de outras pessoas do aparelho ficam. Objetos
 * indexados se juntam da mesma forma. Valor simples: vale o da cópia.
 */
export function fundirCopia(
  local: Record<string, string>,
  copia: CopiaDeSeguranca
): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, daCopia] of Object.entries(copia.dados)) {
    const texto = local[chave];
    let atual: unknown;
    try {
      atual = texto === undefined ? undefined : JSON.parse(texto);
    } catch {
      atual = undefined;
    }
    saida[chave] = JSON.stringify(fundirValor(atual, daCopia));
  }
  return saida;
}

function idDe(item: unknown): string | undefined {
  return item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string'
    ? (item as { id: string }).id
    : undefined;
}

function fundirValor(atual: unknown, daCopia: unknown): unknown {
  if (Array.isArray(atual) && Array.isArray(daCopia)) {
    const temIds = daCopia.every((i) => idDe(i) !== undefined) && atual.every((i) => idDe(i) !== undefined);
    if (!temIds) return daCopia;
    const porId = new Map(atual.map((i) => [idDe(i)!, i]));
    for (const i of daCopia) porId.set(idDe(i)!, i);
    return [...porId.values()];
  }
  if (
    atual && daCopia && typeof atual === 'object' && typeof daCopia === 'object' &&
    !Array.isArray(atual) && !Array.isArray(daCopia) && donoDe(daCopia) === undefined
  ) {
    return { ...(atual as object), ...(daCopia as object) };
  }
  return daCopia;
}
