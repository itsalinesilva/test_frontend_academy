/**
 * COMUNIDADE — fórum e eventos, de várias pessoas (P-1, P-2 · ADR-003).
 *
 * O fórum gravava no navegador de quem escrevia: um tópico publicado nunca
 * chegava a outra pessoa, e a "comunidade" era de uma pessoa só. Os eventos
 * não tinham sequer como ser criados — a lista estava sempre vazia.
 *
 * Aqui, como nas salas: KV do servidor, uma chave por item (duas respostas ao
 * mesmo tempo nunca se sobrescrevem; a contagem de respostas é contada, não
 * guardada), e autoria sempre da sessão assinada.
 */
import { ArmazemKV, Pessoa, Resultado, lerJson, todasAsChaves } from './salas';

export const CATEGORIAS_DO_FORUM = ['ANALYSIS', 'HARMONY', 'REPERTOIRE', 'INSTRUMENTS', 'PEDAGOGY', 'LOUNGE'] as const;
export type CategoriaDoForum = (typeof CATEGORIAS_DO_FORUM)[number];

export interface Topico {
  id: string;
  categoria: CategoriaDoForum;
  titulo: string;
  autor: Pessoa;
  criadoEm: string;
  fixado: boolean;
  trancado: boolean;
  /** Oculto pela moderação: some das listas, e o autor ainda o vê como oculto. */
  oculto: boolean;
}

export interface Resposta {
  id: string;
  topicoId: string;
  autor: Pessoa;
  corpo: string;
  em: string;
  oculta: boolean;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'MASTERCLASS' | 'RECITAL' | 'ENCONTRO' | 'OFICINA';
  inicio: string;
  fim: string;
  link?: string;
  vagas?: number;
  anfitriao: Pessoa;
  criadoEm: string;
  cancelado: boolean;
}

export const LIMITES_DA_COMUNIDADE = { titulo: 160, corpo: 10000, descricao: 3000 };

const falha = (status: number, codigo: string, mensagem: string): Resultado<never> => ({ ok: false, status, codigo, mensagem });
const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() && v.trim().length <= max ? v.trim() : null;

const K = {
  topico: (id: string) => `forum:topico:${id}`,
  topicos: 'forum:topico:',
  resposta: (topico: string, em: string, id: string) => `forum:resp:${topico}:${em}:${id}`,
  respostas: (topico: string) => `forum:resp:${topico}:`,
  evento: (id: string) => `evento:${id}`,
  eventos: 'evento:',
  inscricao: (evento: string, sub: string) => `inscricao:${evento}:${sub}`,
  inscricoes: (evento: string) => `inscricao:${evento}:`,
};

export class ServicoDaComunidade {
  constructor(
    private readonly kv: ArmazemKV,
    private readonly agora: () => Date = () => new Date(),
    private readonly novoId: () => string = () => crypto.randomUUID()
  ) {}

  // ------------------------------------------------------------- fórum ---

  private async respostasDe(topicoId: string): Promise<Resposta[]> {
    return (await Promise.all((await todasAsChaves(this.kv, K.respostas(topicoId))).map((k) => lerJson<Resposta>(this.kv, k))))
      .filter((r): r is Resposta => r !== null)
      .sort((a, b) => a.em.localeCompare(b.em));
  }

  async topicos(
    quem: Pessoa | null,
    categoria?: string
  ): Promise<Resultado<Array<Topico & { respostas: number; ultimaAtividade: string }>>> {
    const topicos = (await Promise.all((await todasAsChaves(this.kv, K.topicos)).map((k) => lerJson<Topico>(this.kv, k))))
      .filter((t): t is Topico => t !== null)
      .filter((t) => !categoria || t.categoria === categoria)
      /** O oculto some — menos para quem o escreveu. */
      .filter((t) => !t.oculto || t.autor.sub === quem?.sub);
    const comContagem = await Promise.all(
      topicos.map(async (t) => {
        const rs = (await this.respostasDe(t.id)).filter((r) => !r.oculta);
        /** A abertura é a primeira mensagem; "respostas" são as que vieram depois. */
        return { ...t, respostas: Math.max(0, rs.length - 1), ultimaAtividade: rs.at(-1)?.em ?? t.criadoEm };
      })
    );
    return {
      ok: true,
      valor: comContagem.sort((a, b) => Number(b.fixado) - Number(a.fixado) || b.ultimaAtividade.localeCompare(a.ultimaAtividade)),
    };
  }

  async abrir(quem: Pessoa, corpo: unknown): Promise<Resultado<Topico>> {
    const c = (corpo ?? {}) as Record<string, unknown>;
    const titulo = texto(c.titulo, LIMITES_DA_COMUNIDADE.titulo);
    const abertura = texto(c.corpo, LIMITES_DA_COMUNIDADE.corpo);
    if (!titulo) return falha(400, 'TITULO_INVALIDO', `O tópico precisa de título (até ${LIMITES_DA_COMUNIDADE.titulo} caracteres).`);
    if (!abertura) return falha(400, 'CORPO_INVALIDO', 'O tópico precisa de texto.');
    const categoria = (CATEGORIAS_DO_FORUM as readonly string[]).includes(String(c.categoria))
      ? (c.categoria as CategoriaDoForum)
      : 'LOUNGE';
    const em = this.agora().toISOString();
    const t: Topico = { id: this.novoId(), categoria, titulo, autor: quem, criadoEm: em, fixado: false, trancado: false, oculto: false };
    await this.kv.put(K.topico(t.id), JSON.stringify(t));
    const r: Resposta = { id: this.novoId(), topicoId: t.id, autor: quem, corpo: abertura, em, oculta: false };
    await this.kv.put(K.resposta(t.id, em, r.id), JSON.stringify(r));
    return { ok: true, valor: t, status: 201 };
  }

  async topico(quem: Pessoa | null, id: string): Promise<Resultado<{ topico: Topico; mensagens: Resposta[] }>> {
    const t = await lerJson<Topico>(this.kv, K.topico(id));
    if (!t || (t.oculto && t.autor.sub !== quem?.sub)) return falha(404, 'TOPICO_NAO_EXISTE', 'Este tópico não existe.');
    const mensagens = (await this.respostasDe(id)).filter((r) => !r.oculta || r.autor.sub === quem?.sub);
    return { ok: true, valor: { topico: t, mensagens } };
  }

  async responder(quem: Pessoa, topicoId: string, corpo: unknown): Promise<Resultado<Resposta>> {
    const t = await lerJson<Topico>(this.kv, K.topico(topicoId));
    if (!t || t.oculto) return falha(404, 'TOPICO_NAO_EXISTE', 'Este tópico não existe.');
    if (t.trancado) return falha(409, 'TOPICO_TRANCADO', 'Este tópico foi fechado para respostas.');
    const conteudo = texto((corpo as Record<string, unknown> | null)?.corpo, LIMITES_DA_COMUNIDADE.corpo);
    if (!conteudo) return falha(400, 'CORPO_INVALIDO', 'A resposta precisa de texto.');
    const em = this.agora().toISOString();
    const r: Resposta = { id: this.novoId(), topicoId, autor: quem, corpo: conteudo, em, oculta: false };
    await this.kv.put(K.resposta(topicoId, em, r.id), JSON.stringify(r));
    return { ok: true, valor: r, status: 201 };
  }

  /** Moderação (P-4): ocultar, fixar, trancar. Quem chama já passou pela checagem de admin. */
  async moderarTopico(id: string, acao: 'ocultar' | 'mostrar' | 'fixar' | 'trancar' | 'destrancar'): Promise<Resultado<Topico>> {
    const t = await lerJson<Topico>(this.kv, K.topico(id));
    if (!t) return falha(404, 'TOPICO_NAO_EXISTE', 'Este tópico não existe.');
    const novo: Topico = {
      ...t,
      oculto: acao === 'ocultar' ? true : acao === 'mostrar' ? false : t.oculto,
      fixado: acao === 'fixar' ? !t.fixado : t.fixado,
      trancado: acao === 'trancar' ? true : acao === 'destrancar' ? false : t.trancado,
    };
    await this.kv.put(K.topico(id), JSON.stringify(novo));
    return { ok: true, valor: novo };
  }

  async moderarResposta(topicoId: string, respostaId: string, oculta: boolean): Promise<Resultado<Resposta>> {
    const chave = (await todasAsChaves(this.kv, K.respostas(topicoId))).find((k) => k.endsWith(`:${respostaId}`));
    const r = chave ? await lerJson<Resposta>(this.kv, chave) : null;
    if (!chave || !r) return falha(404, 'RESPOSTA_NAO_EXISTE', 'Esta resposta não existe.');
    const nova = { ...r, oculta };
    await this.kv.put(chave, JSON.stringify(nova));
    return { ok: true, valor: nova };
  }

  // ----------------------------------------------------------- eventos ---

  async eventos(quem: Pessoa | null): Promise<Resultado<Array<Evento & { inscritos: number; inscrito: boolean }>>> {
    const es = (await Promise.all((await todasAsChaves(this.kv, K.eventos)).map((k) => lerJson<Evento>(this.kv, k))))
      .filter((e): e is Evento => e !== null);
    const com = await Promise.all(
      es.map(async (e) => {
        const inscricoes = await todasAsChaves(this.kv, K.inscricoes(e.id));
        return { ...e, inscritos: inscricoes.length, inscrito: !!quem && inscricoes.includes(K.inscricao(e.id, quem.sub)) };
      })
    );
    return { ok: true, valor: com.sort((a, b) => a.inicio.localeCompare(b.inicio)) };
  }

  async criarEvento(quem: Pessoa, corpo: unknown): Promise<Resultado<Evento>> {
    const c = (corpo ?? {}) as Record<string, unknown>;
    const titulo = texto(c.titulo, LIMITES_DA_COMUNIDADE.titulo);
    if (!titulo) return falha(400, 'TITULO_INVALIDO', 'O evento precisa de título.');
    const data = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
    const inicio = data(c.inicio);
    const fim = data(c.fim);
    if (!inicio || !fim) return falha(400, 'DATA_INVALIDA', 'O evento precisa de início e fim.');
    if (fim <= inicio) return falha(400, 'DATA_INVALIDA', 'O fim precisa vir depois do início.');
    const tipos = ['MASTERCLASS', 'RECITAL', 'ENCONTRO', 'OFICINA'] as const;
    const e: Evento = {
      id: this.novoId(),
      titulo,
      descricao: typeof c.descricao === 'string' ? c.descricao.trim().slice(0, LIMITES_DA_COMUNIDADE.descricao) : '',
      tipo: tipos.includes(c.tipo as never) ? (c.tipo as Evento['tipo']) : 'ENCONTRO',
      inicio,
      fim,
      /** Só http(s): outro esquema num botão seria porta para `javascript:`. */
      link: typeof c.link === 'string' && /^https?:\/\//.test(c.link.trim()) ? c.link.trim().slice(0, 500) : undefined,
      vagas: Number.isInteger(c.vagas) && (c.vagas as number) > 0 ? Math.min(c.vagas as number, 10000) : undefined,
      anfitriao: quem,
      criadoEm: this.agora().toISOString(),
      cancelado: false,
    };
    await this.kv.put(K.evento(e.id), JSON.stringify(e));
    return { ok: true, valor: e, status: 201 };
  }

  /** Inscrever alterna. Lotado recusa; cancelado recusa; o anfitrião não precisa se inscrever. */
  async inscrever(quem: Pessoa, eventoId: string): Promise<Resultado<{ inscrito: boolean }>> {
    const e = await lerJson<Evento>(this.kv, K.evento(eventoId));
    if (!e) return falha(404, 'EVENTO_NAO_EXISTE', 'Este evento não existe.');
    if (e.cancelado) return falha(409, 'EVENTO_CANCELADO', 'Este evento foi cancelado.');
    const chave = K.inscricao(eventoId, quem.sub);
    if (await this.kv.get(chave)) {
      await this.kv.delete(chave);
      return { ok: true, valor: { inscrito: false } };
    }
    if (e.vagas && (await todasAsChaves(this.kv, K.inscricoes(eventoId))).length >= e.vagas) {
      return falha(409, 'EVENTO_LOTADO', 'As vagas deste evento acabaram.');
    }
    await this.kv.put(chave, JSON.stringify({ ...quem, em: this.agora().toISOString() }));
    return { ok: true, valor: { inscrito: true } };
  }

  async cancelarEvento(quem: Pessoa, eventoId: string, ehAdmin: boolean): Promise<Resultado<Evento>> {
    const e = await lerJson<Evento>(this.kv, K.evento(eventoId));
    if (!e) return falha(404, 'EVENTO_NAO_EXISTE', 'Este evento não existe.');
    if (e.anfitriao.sub !== quem.sub && !ehAdmin) return falha(403, 'SO_O_ANFITRIAO', 'Só quem marcou o evento o cancela.');
    const novo = { ...e, cancelado: true };
    await this.kv.put(K.evento(eventoId), JSON.stringify(novo));
    return { ok: true, valor: novo };
  }
}
