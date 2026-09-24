/**
 * DENÚNCIAS E FILA DE MODERAÇÃO (P-4 · AUD-14).
 *
 * A tela de moderação dizia, com honestidade, que não havia como denunciar
 * nada. Agora: quem tem conta denuncia um tópico, uma resposta do fórum ou um
 * post de sala, com motivo; cada pessoa denuncia cada coisa uma vez só; a fila
 * é da administração, e cada decisão (ocultar ou descartar) fica registrada
 * na denúncia e na trilha de auditoria.
 */
import { ArmazemKV, Pessoa, Resultado, ServicoDeSalas, lerJson, todasAsChaves } from './salas';
import { ServicoDaComunidade } from './comunidade';

export type TipoDeAlvo = 'forum-topico' | 'forum-resposta' | 'sala-post';

export interface Alvo {
  tipo: TipoDeAlvo;
  id: string;
  /** Resposta do fórum: o tópico dela. */
  topicoId?: string;
  /** Post de sala: a sala dele. */
  salaId?: string;
  /** O que a administração lê na fila sem abrir nada. */
  resumo: string;
}

export interface Denuncia {
  id: string;
  alvo: Alvo;
  motivo: string;
  autor: Pessoa;
  em: string;
  status: 'aberta' | 'ocultada' | 'descartada';
  decisao?: { por: string; em: string };
}

const MOTIVOS = ['Ofensa ou assédio', 'Spam ou propaganda', 'Conteúdo impróprio', 'Informação falsa', 'Outro'];

const K = {
  denuncia: (id: string) => `denuncia:${id}`,
  denuncias: 'denuncia:',
  jaDenunciou: (alvo: Alvo, sub: string) => `denuncia-de:${alvo.tipo}:${alvo.id}:${sub}`,
};

const falha = (status: number, codigo: string, mensagem: string): Resultado<never> => ({ ok: false, status, codigo, mensagem });

export class ServicoDeDenuncias {
  constructor(
    private readonly kv: ArmazemKV,
    private readonly salasKv: ArmazemKV | undefined,
    private readonly agora: () => Date = () => new Date(),
    private readonly novoId: () => string = () => crypto.randomUUID()
  ) {}

  async denunciar(quem: Pessoa, corpo: unknown): Promise<Resultado<{ recebida: boolean }>> {
    const c = (corpo ?? {}) as { alvo?: Partial<Alvo>; motivo?: unknown };
    const a = c.alvo ?? {};
    if (!['forum-topico', 'forum-resposta', 'sala-post'].includes(String(a.tipo)) || typeof a.id !== 'string' || !a.id) {
      return falha(400, 'ALVO_INVALIDO', 'Não deu para saber o que está sendo denunciado.');
    }
    if (a.tipo === 'forum-resposta' && typeof a.topicoId !== 'string') return falha(400, 'ALVO_INVALIDO', 'Falta o tópico da resposta.');
    if (a.tipo === 'sala-post' && typeof a.salaId !== 'string') return falha(400, 'ALVO_INVALIDO', 'Falta a sala do post.');
    const motivo = typeof c.motivo === 'string' && MOTIVOS.includes(c.motivo) ? c.motivo : null;
    if (!motivo) return falha(400, 'MOTIVO_INVALIDO', 'Escolha o motivo da denúncia.');
    const alvo: Alvo = {
      tipo: a.tipo as TipoDeAlvo,
      id: a.id,
      topicoId: a.topicoId,
      salaId: a.salaId,
      resumo: typeof a.resumo === 'string' ? a.resumo.slice(0, 200) : '',
    };
    /** Uma denúncia por pessoa e por alvo: repetir não aumenta o peso de ninguém. */
    if (await this.kv.get(K.jaDenunciou(alvo, quem.sub))) return { ok: true, valor: { recebida: true } };
    const d: Denuncia = { id: this.novoId(), alvo, motivo, autor: quem, em: this.agora().toISOString(), status: 'aberta' };
    await this.kv.put(K.denuncia(d.id), JSON.stringify(d));
    await this.kv.put(K.jaDenunciou(alvo, quem.sub), d.id);
    return { ok: true, valor: { recebida: true }, status: 201 };
  }

  /** A fila, agrupada por alvo: dez denúncias do mesmo post são um item, com contagem. */
  async fila(status = 'aberta'): Promise<Resultado<Array<Denuncia & { vezes: number }>>> {
    const todas = (await Promise.all((await todasAsChaves(this.kv, K.denuncias)).map((k) => lerJson<Denuncia>(this.kv, k))))
      .filter((d): d is Denuncia => d !== null)
      .filter((d) => d.status === status);
    const porAlvo = new Map<string, Denuncia & { vezes: number }>();
    for (const d of todas.sort((a, b) => a.em.localeCompare(b.em))) {
      const chave = `${d.alvo.tipo}:${d.alvo.id}`;
      const ja = porAlvo.get(chave);
      porAlvo.set(chave, ja ? { ...ja, vezes: ja.vezes + 1 } : { ...d, vezes: 1 });
    }
    return { ok: true, valor: [...porAlvo.values()].sort((a, b) => b.vezes - a.vezes || a.em.localeCompare(b.em)) };
  }

  /** Decidir vale para TODAS as denúncias abertas do mesmo alvo. */
  async decidir(por: string, id: string, acao: 'ocultar' | 'descartar'): Promise<Resultado<{ alvo: Alvo; decididas: number }>> {
    const d = await lerJson<Denuncia>(this.kv, K.denuncia(id));
    if (!d) return falha(404, 'DENUNCIA_NAO_EXISTE', 'Esta denúncia não existe.');
    if (acao === 'ocultar') {
      const r =
        d.alvo.tipo === 'forum-topico'
          ? await new ServicoDaComunidade(this.kv).moderarTopico(d.alvo.id, 'ocultar')
          : d.alvo.tipo === 'forum-resposta'
            ? await new ServicoDaComunidade(this.kv).moderarResposta(d.alvo.topicoId!, d.alvo.id, true)
            : this.salasKv
              ? await new ServicoDeSalas(this.salasKv).moderarPost(d.alvo.salaId!, d.alvo.id, true)
              : falha(503, 'SALAS_NAO_CONFIGURADAS', 'As salas não estão ligadas.');
      if (!r.ok) return r;
    }
    const em = this.agora().toISOString();
    const irmas = (await Promise.all((await todasAsChaves(this.kv, K.denuncias)).map((k) => lerJson<Denuncia>(this.kv, k)))).filter(
      (x): x is Denuncia => !!x && x.status === 'aberta' && x.alvo.tipo === d.alvo.tipo && x.alvo.id === d.alvo.id
    );
    for (const x of irmas) {
      await this.kv.put(K.denuncia(x.id), JSON.stringify({ ...x, status: acao === 'ocultar' ? 'ocultada' : 'descartada', decisao: { por, em } }));
    }
    return { ok: true, valor: { alvo: d.alvo, decididas: irmas.length } };
  }
}

export const MOTIVOS_DE_DENUNCIA = MOTIVOS;
