/**
 * PESSOAS — cartão público, diretório, busca e "seguir" (P-3 · ADR-003).
 *
 * O perfil de outra pessoa, o diretório e as conexões liam o `localStorage`:
 * só apareciam as contas que já tinham entrado NAQUELE navegador. Na prática,
 * ninguém encontrava ninguém.
 *
 * Aqui cada pessoa publica o próprio CARTÃO — a projeção pública que o app já
 * calcula a partir da privacidade de cada seção. Perfil privado não publica:
 * apaga. A ADR-003 pede índice automático ao entrar, nunca cadastro manual; é
 * o que o app faz, a cada leitura do próprio perfil.
 *
 * O servidor confia no CONTEÚDO do cartão (é a pessoa publicando o que é
 * dela) mas nunca na IDENTIDADE: o dono vem da sessão, e um `userId` já ligado
 * a outra pessoa é recusado.
 */
import { ArmazemKV, Pessoa, Resultado, lerJson, todasAsChaves } from './salas';

export interface Cartao {
  sub: string;
  userId: string;
  nome: string;
  titulo: string;
  instrumentos: string[];
  avatarUrl?: string;
  /** A projeção pública inteira, como o app a monta — já sem o que é privado. */
  projecao: Record<string, unknown>;
  atualizadoEm: string;
}

const LIMITE_DO_CARTAO = 64 * 1024;
const falha = (status: number, codigo: string, mensagem: string): Resultado<never> => ({ ok: false, status, codigo, mensagem });

const K = {
  cartao: (sub: string) => `pessoa:${sub}`,
  cartoes: 'pessoa:',
  porUserId: (userId: string) => `pessoa-id:${userId}`,
  segue: (quem: string, alvo: string) => `segue:${quem}:${alvo}`,
  seguidos: (quem: string) => `segue:${quem}:`,
  seguidor: (alvo: string, quem: string) => `seguidor:${alvo}:${quem}`,
  seguidores: (alvo: string) => `seguidor:${alvo}:`,
};

/** Tira do cartão qualquer campo que pareça contato — a projeção não deveria ter, e o servidor confere. */
function semContato(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(semContato);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .filter(([k]) => !/^(email|e-mail|telefone|phone|cpf|endereco|address)$/i.test(k))
        .map(([k, x]) => [k, semContato(x)])
    );
  }
  return v;
}

export class ServicoDePessoas {
  constructor(
    private readonly kv: ArmazemKV,
    private readonly agora: () => Date = () => new Date()
  ) {}

  private async subDe(userId: string): Promise<string | null> {
    return this.kv.get(K.porUserId(userId));
  }

  /** Publica (ou, com `projecao: null`, retira) o cartão de quem está na sessão. */
  async publicar(quem: Pessoa, corpo: unknown): Promise<Resultado<{ publicado: boolean }>> {
    const c = (corpo ?? {}) as { userId?: unknown; projecao?: unknown };
    if (typeof c.userId !== 'string' || !c.userId) return falha(400, 'SEM_USERID', 'Falta o identificador do perfil.');
    const dono = await this.subDe(c.userId);
    if (dono && dono !== quem.sub) return falha(409, 'USERID_DE_OUTRA_PESSOA', 'Este perfil é de outra pessoa.');

    if (c.projecao === null) {
      await this.kv.delete(K.cartao(quem.sub));
      return { ok: true, valor: { publicado: false } };
    }
    if (!c.projecao || typeof c.projecao !== 'object') return falha(400, 'SEM_PROJECAO', 'Falta o conteúdo do cartão.');
    const projecao = semContato(c.projecao) as Record<string, unknown>;
    if (JSON.stringify(projecao).length > LIMITE_DO_CARTAO) {
      return falha(413, 'CARTAO_GRANDE', 'O perfil público passou do tamanho que o diretório guarda.');
    }
    const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
    const cartao: Cartao = {
      sub: quem.sub,
      userId: c.userId,
      nome: txt(projecao.displayName, 120) || quem.nome,
      titulo: txt(projecao.title, 160),
      instrumentos: Array.isArray(projecao.instruments)
        ? (projecao.instruments as unknown[]).map((i) => (typeof i === 'string' ? i : txt((i as { name?: unknown })?.name, 60))).filter(Boolean).slice(0, 10)
        : [],
      avatarUrl: /^https:\/\//.test(txt(projecao.avatarUrl, 500)) ? txt(projecao.avatarUrl, 500) : undefined,
      projecao,
      atualizadoEm: this.agora().toISOString(),
    };
    await this.kv.put(K.cartao(quem.sub), JSON.stringify(cartao));
    await this.kv.put(K.porUserId(c.userId), quem.sub);
    return { ok: true, valor: { publicado: true } };
  }

  /** O diretório e a busca — a busca roda aqui, e o índice nunca vai inteiro ao navegador (ADR-003). */
  async buscar(q: string): Promise<Resultado<Array<Omit<Cartao, 'projecao' | 'sub'>>>> {
    const termo = q
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
    const todos = (await Promise.all((await todasAsChaves(this.kv, K.cartoes)).map((k) => lerJson<Cartao>(this.kv, k))))
      .filter((c): c is Cartao => c !== null)
      .filter((c) => {
        if (!termo) return true;
        const onde = [c.nome, c.titulo, ...c.instrumentos].join(' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        return onde.includes(termo);
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .slice(0, 50);
    return { ok: true, valor: todos.map(({ projecao: _p, sub: _s, ...resto }) => resto) };
  }

  async cartao(quem: Pessoa | null, userId: string): Promise<Resultado<{ projecao: Record<string, unknown>; seguidores: number; sigo: boolean; souEu: boolean }>> {
    const sub = await this.subDe(userId);
    const c = sub ? await lerJson<Cartao>(this.kv, K.cartao(sub)) : null;
    if (!sub || !c) return falha(404, 'PERFIL_NAO_EXISTE', 'Este perfil não existe ou não é público.');
    const seguidores = (await todasAsChaves(this.kv, K.seguidores(sub))).length;
    const sigo = !!quem && !!(await this.kv.get(K.segue(quem.sub, sub)));
    return { ok: true, valor: { projecao: c.projecao, seguidores, sigo, souEu: quem?.sub === sub } };
  }

  async seguir(quem: Pessoa, userId: string, seguir: boolean): Promise<Resultado<{ sigo: boolean; seguidores: number }>> {
    const sub = await this.subDe(userId);
    if (!sub || !(await this.kv.get(K.cartao(sub)))) return falha(404, 'PERFIL_NAO_EXISTE', 'Este perfil não existe ou não é público.');
    if (sub === quem.sub) return falha(409, 'A_SI_MESMA', 'Não dá para seguir o próprio perfil.');
    if (seguir) {
      const em = this.agora().toISOString();
      await this.kv.put(K.segue(quem.sub, sub), em);
      await this.kv.put(K.seguidor(sub, quem.sub), JSON.stringify({ ...quem, em }));
    } else {
      await this.kv.delete(K.segue(quem.sub, sub));
      await this.kv.delete(K.seguidor(sub, quem.sub));
    }
    return { ok: true, valor: { sigo: seguir, seguidores: (await todasAsChaves(this.kv, K.seguidores(sub))).length } };
  }
}
