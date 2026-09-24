/**
 * SALAS — comunidades de estudo no molde do Skool (AUD-9 · ADR-003).
 *
 * Uma sala reúne: a COMUNIDADE (posts por categoria, curtidas, comentários,
 * fixados), a SALA DE AULA (os cursos da Academia que o dono escolheu), a
 * AGENDA (encontros com data e link), os MEMBROS, o RANKING (pontos por
 * curtida recebida, com níveis) e o SOBRE.
 *
 * É dado de várias pessoas ao mesmo tempo — e por isso vive no KV do
 * servidor, e não no Drive de ninguém: o `drive.appdata` de uma pessoa não é
 * legível por outra (ADR-003). O dado PESSOAL continua no Drive de cada um.
 *
 * Uma chave por item. Duas pessoas curtindo o mesmo post escrevem em chaves
 * diferentes (`…:curtida:<post>:<quem>`) e nunca se sobrescrevem — foi o que
 * decidiu KV em vez de um arquivo único.
 *
 * Toda autoria vem da SESSÃO assinada; o corpo da requisição nunca diz quem é.
 */

export interface ArmazemKV {
  put(chave: string, valor: string): Promise<void>;
  get(chave: string): Promise<string | null>;
  delete(chave: string): Promise<void>;
  list(opcoes: { prefix: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete?: boolean;
    cursor?: string;
  }>;
}

export interface Pessoa {
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
  /** Cursos da Academia na sala de aula, pela ordem do dono. */
  cursos: string[];
  dono: Pessoa;
  criadaEm: string;
}

export interface Membro extends Pessoa {
  papel: Papel;
  status: 'ativo' | 'pendente';
  entrouEm: string;
  /** Quando o pedido foi aprovado — vira aviso para quem pediu. */
  aprovadoEm?: string;
}

export interface Post {
  id: string;
  salaId: string;
  autor: Pessoa;
  categoria: string;
  titulo: string;
  corpo: string;
  fixado: boolean;
  em: string;
}

export interface Comentario {
  id: string;
  postId: string;
  autor: Pessoa;
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
  /** Quando foi marcado — é o que o aviso usa; `inicio` é quando acontece. */
  criadoEm?: string;
}

/** O que vale como aviso das salas para uma pessoa. */
export interface Novidade {
  id: string;
  tipo: 'SALA_POST' | 'SALA_COMENTARIO' | 'SALA_CURTIDA' | 'SALA_ENCONTRO' | 'SALA_APROVADO';
  titulo: string;
  texto: string;
  link: string;
  em: string;
}

/** A curtida guarda quem curtiu, de quem é o post e quando — o ranking e os avisos leem daqui. */
interface Curtida {
  autor: string;
  de: string;
  nomeDe: string;
  em: string;
}
function lerCurtida(valor: string | null): Curtida | null {
  if (!valor) return null;
  try {
    return JSON.parse(valor) as Curtida;
  } catch {
    /** Formato antigo: o valor era só o autor do post. */
    return { autor: valor, de: '', nomeDe: '', em: '' };
  }
}

/**
 * NÍVEIS — os limiares do Skool (1 curtida = 1 ponto). A referência foi
 * escolhida de propósito: quem vem de lá reconhece a escada.
 */
export const LIMIARES_DE_NIVEL = [0, 5, 20, 65, 155, 515, 2015, 8015, 33015];
export function nivelDosPontos(pontos: number): number {
  let n = 1;
  LIMIARES_DE_NIVEL.forEach((lim, i) => {
    if (pontos >= lim) n = i + 1;
  });
  return n;
}

export const LIMITES = { nome: 80, descricao: 2000, titulo: 140, corpo: 5000, comentario: 2000, categorias: 8 };

export type Resultado<T> = { ok: true; valor: T; status?: number } | { ok: false; status: number; codigo: string; mensagem: string };
const falha = (status: number, codigo: string, mensagem: string): Resultado<never> => ({ ok: false, status, codigo, mensagem });

export function slugDe(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

const K = {
  sala: (id: string) => `sala:${id}`,
  slug: (slug: string) => `sala-slug:${slug}`,
  diretorio: (em: string, id: string) => `salas:${em}:${id}`,
  membro: (sala: string, sub: string) => `sala:${sala}:membro:${sub}`,
  membros: (sala: string) => `sala:${sala}:membro:`,
  minhas: (sub: string) => `membro-de:${sub}:`,
  minha: (sub: string, sala: string) => `membro-de:${sub}:${sala}`,
  post: (sala: string, id: string) => `sala:${sala}:post:${id}`,
  posts: (sala: string) => `sala:${sala}:post:`,
  comentario: (sala: string, post: string, em: string, id: string) => `sala:${sala}:com:${post}:${em}:${id}`,
  comentarios: (sala: string, post: string) => `sala:${sala}:com:${post}:`,
  curtida: (sala: string, post: string, sub: string) => `sala:${sala}:curtida:${post}:${sub}`,
  curtidas: (sala: string) => `sala:${sala}:curtida:`,
  encontro: (sala: string, inicio: string, id: string) => `sala:${sala}:encontro:${inicio}:${id}`,
  encontros: (sala: string) => `sala:${sala}:encontro:`,
};

export async function todasAsChaves(kv: ArmazemKV, prefix: string): Promise<string[]> {
  const nomes: string[] = [];
  let cursor: string | undefined;
  do {
    const r = await kv.list({ prefix, cursor, limit: 1000 });
    nomes.push(...r.keys.map((k) => k.name));
    cursor = r.list_complete === false ? r.cursor : undefined;
  } while (cursor);
  return nomes;
}

export async function lerJson<T>(kv: ArmazemKV, chave: string): Promise<T | null> {
  const t = await kv.get(chave);
  return t ? (JSON.parse(t) as T) : null;
}

const texto = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() && v.trim().length <= max ? v.trim() : null;

export class ServicoDeSalas {
  constructor(
    private readonly kv: ArmazemKV,
    private readonly agora: () => Date = () => new Date(),
    private readonly novoId: () => string = () => crypto.randomUUID()
  ) {}

  private async membro(salaId: string, sub: string): Promise<Membro | null> {
    return lerJson<Membro>(this.kv, K.membro(salaId, sub));
  }

  private async sala(idOuSlug: string): Promise<Sala | null> {
    const direta = await lerJson<Sala>(this.kv, K.sala(idOuSlug));
    if (direta) return direta;
    const id = await this.kv.get(K.slug(idOuSlug));
    return id ? lerJson<Sala>(this.kv, K.sala(id)) : null;
  }

  /** Quem pode ler a comunidade: sala pública = todos; privada = membros ativos. */
  private async podeLer(sala: Sala, quem: Pessoa | null): Promise<boolean> {
    if (sala.privacidade === 'publica') return true;
    if (!quem) return false;
    return (await this.membro(sala.id, quem.sub))?.status === 'ativo';
  }

  private async ehAtivo(salaId: string, quem: Pessoa | null): Promise<Membro | null> {
    if (!quem) return null;
    const m = await this.membro(salaId, quem.sub);
    return m?.status === 'ativo' ? m : null;
  }

  // ------------------------------------------------------------ salas ---

  async criar(quem: Pessoa, corpo: unknown): Promise<Resultado<Sala>> {
    const c = (corpo ?? {}) as Record<string, unknown>;
    const nome = texto(c.nome, LIMITES.nome);
    if (!nome) return falha(400, 'NOME_INVALIDO', `Dê um nome à sala (até ${LIMITES.nome} caracteres).`);
    const descricao = typeof c.descricao === 'string' ? c.descricao.trim().slice(0, LIMITES.descricao) : '';
    const privacidade: Privacidade = c.privacidade === 'privada' ? 'privada' : 'publica';
    const categorias = normalizarCategorias(c.categorias);

    let slug = slugDe(nome) || 'sala';
    if (await this.kv.get(K.slug(slug))) slug = `${slug}-${this.novoId().slice(0, 6)}`;

    const em = this.agora().toISOString();
    const sala: Sala = { id: this.novoId(), slug, nome, descricao, privacidade, categorias, cursos: [], dono: quem, criadaEm: em };
    await this.kv.put(K.sala(sala.id), JSON.stringify(sala));
    await this.kv.put(K.slug(slug), sala.id);
    await this.kv.put(K.diretorio(em, sala.id), '');
    const dono: Membro = { ...quem, papel: 'dono', status: 'ativo', entrouEm: em };
    await this.kv.put(K.membro(sala.id, quem.sub), JSON.stringify(dono));
    await this.kv.put(K.minha(quem.sub, sala.id), '');
    return { ok: true, valor: sala, status: 201 };
  }

  async editar(quem: Pessoa, idOuSlug: string, corpo: unknown): Promise<Resultado<Sala>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (sala.dono.sub !== quem.sub) return falha(403, 'SO_O_DONO', 'Só quem criou a sala muda o que ela é.');
    const c = (corpo ?? {}) as Record<string, unknown>;
    const nova: Sala = {
      ...sala,
      descricao: typeof c.descricao === 'string' ? c.descricao.trim().slice(0, LIMITES.descricao) : sala.descricao,
      privacidade: c.privacidade === 'privada' || c.privacidade === 'publica' ? c.privacidade : sala.privacidade,
      categorias: c.categorias !== undefined ? normalizarCategorias(c.categorias) : sala.categorias,
      cursos: Array.isArray(c.cursos) ? c.cursos.filter((x): x is string => typeof x === 'string').slice(0, 30) : sala.cursos,
    };
    await this.kv.put(K.sala(sala.id), JSON.stringify(nova));
    return { ok: true, valor: nova };
  }

  /** O diretório: todas as salas, com o número de membros. Sem conteúdo de sala privada. */
  async diretorio(quem: Pessoa | null): Promise<Resultado<Array<Sala & { membros: number; souMembro: boolean }>>> {
    const chaves = (await todasAsChaves(this.kv, 'salas:')).reverse();
    const minhas = quem ? new Set((await todasAsChaves(this.kv, K.minhas(quem.sub))).map((k) => k.split(':').pop()!)) : new Set<string>();
    const salas = await Promise.all(
      chaves.map(async (k) => {
        const id = k.split(':').pop()!;
        const s = await lerJson<Sala>(this.kv, K.sala(id));
        if (!s) return null;
        const membros = await this.contarAtivos(id);
        return { ...s, membros, souMembro: minhas.has(id) };
      })
    );
    return { ok: true, valor: salas.filter((s): s is NonNullable<typeof s> => s !== null) };
  }

  private async contarAtivos(salaId: string): Promise<number> {
    const chaves = await todasAsChaves(this.kv, K.membros(salaId));
    const ms = await Promise.all(chaves.map((k) => lerJson<Membro>(this.kv, k)));
    return ms.filter((m) => m?.status === 'ativo').length;
  }

  /** O "Sobre": o que qualquer pessoa vê da sala, e a situação de quem pergunta. */
  async sobre(quem: Pessoa | null, idOuSlug: string): Promise<Resultado<{ sala: Sala; membros: number; eu: Membro | null; podeLer: boolean }>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const eu = quem ? await this.membro(sala.id, quem.sub) : null;
    return { ok: true, valor: { sala, membros: await this.contarAtivos(sala.id), eu, podeLer: await this.podeLer(sala, quem) } };
  }

  // ---------------------------------------------------------- membros ---

  /** Entrar: sala pública, na hora; sala privada, fica pedindo até o dono aprovar. */
  async entrar(quem: Pessoa, idOuSlug: string): Promise<Resultado<Membro>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const ja = await this.membro(sala.id, quem.sub);
    if (ja) return { ok: true, valor: ja };
    const m: Membro = {
      ...quem,
      papel: 'membro',
      status: sala.privacidade === 'publica' ? 'ativo' : 'pendente',
      entrouEm: this.agora().toISOString(),
    };
    await this.kv.put(K.membro(sala.id, quem.sub), JSON.stringify(m));
    await this.kv.put(K.minha(quem.sub, sala.id), '');
    return { ok: true, valor: m, status: 201 };
  }

  async sair(quem: Pessoa, idOuSlug: string): Promise<Resultado<null>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (sala.dono.sub === quem.sub) return falha(409, 'DONO_NAO_SAI', 'Quem criou a sala não pode sair dela.');
    await this.kv.delete(K.membro(sala.id, quem.sub));
    await this.kv.delete(K.minha(quem.sub, sala.id));
    return { ok: true, valor: null };
  }

  async membros(quem: Pessoa | null, idOuSlug: string): Promise<Resultado<Membro[]>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const eu = await this.ehAtivo(sala.id, quem);
    if (!eu) return falha(403, 'SO_MEMBROS', 'A lista de membros é de quem está na sala.');
    const todos = (await Promise.all((await todasAsChaves(this.kv, K.membros(sala.id))).map((k) => lerJson<Membro>(this.kv, k))))
      .filter((m): m is Membro => m !== null)
      /** Pedidos pendentes só aparecem para quem pode aprovar. */
      .filter((m) => m.status === 'ativo' || eu.papel !== 'membro');
    return { ok: true, valor: todos.sort((a, b) => a.entrouEm.localeCompare(b.entrouEm)) };
  }

  /** Aprovar pedido, tornar moderador ou remover. Dono e moderadores; papel de moderador, só o dono. */
  async decidirMembro(
    quem: Pessoa,
    idOuSlug: string,
    alvoSub: string,
    acao: 'aprovar' | 'remover' | 'moderador' | 'membro'
  ): Promise<Resultado<Membro | null>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const eu = await this.ehAtivo(sala.id, quem);
    if (!eu || eu.papel === 'membro') return falha(403, 'SO_QUEM_CUIDA', 'Só quem cuida da sala decide sobre membros.');
    const alvo = await this.membro(sala.id, alvoSub);
    if (!alvo) return falha(404, 'MEMBRO_NAO_EXISTE', 'Esta pessoa não está na sala.');
    if (alvo.papel === 'dono') return falha(409, 'DONO_INTOCAVEL', 'Quem criou a sala não pode ser removido nem rebaixado.');
    if ((acao === 'moderador' || acao === 'membro') && eu.papel !== 'dono') {
      return falha(403, 'SO_O_DONO', 'Só quem criou a sala nomeia moderadores.');
    }
    if (acao === 'remover') {
      await this.kv.delete(K.membro(sala.id, alvoSub));
      await this.kv.delete(K.minha(alvoSub, sala.id));
      return { ok: true, valor: null };
    }
    const novo: Membro =
      acao === 'aprovar'
        ? { ...alvo, status: 'ativo', aprovadoEm: this.agora().toISOString() }
        : { ...alvo, papel: acao === 'moderador' ? 'moderador' : 'membro' };
    await this.kv.put(K.membro(sala.id, alvoSub), JSON.stringify(novo));
    return { ok: true, valor: novo };
  }

  // -------------------------------------------------------- comunidade ---

  async posts(
    quem: Pessoa | null,
    idOuSlug: string
  ): Promise<Resultado<Array<Post & { curtidas: number; curtiEu: boolean; comentarios: number }>>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.podeLer(sala, quem))) return falha(403, 'SALA_PRIVADA', 'O que se conversa nesta sala é só de quem está nela.');
    const posts = (await Promise.all((await todasAsChaves(this.kv, K.posts(sala.id))).map((k) => lerJson<Post>(this.kv, k))))
      .filter((p): p is Post => p !== null);
    const curtidas = await todasAsChaves(this.kv, K.curtidas(sala.id));
    const comentarios = await todasAsChaves(this.kv, `sala:${sala.id}:com:`);
    return {
      ok: true,
      valor: posts
        .map((p) => {
          const minhas = curtidas.filter((k) => k.startsWith(K.curtida(sala.id, p.id, '')));
          return {
            ...p,
            curtidas: minhas.length,
            curtiEu: !!quem && minhas.includes(K.curtida(sala.id, p.id, quem.sub)),
            comentarios: comentarios.filter((k) => k.startsWith(K.comentarios(sala.id, p.id))).length,
          };
        })
        /** Fixados primeiro; depois, do mais novo ao mais antigo — como no Skool. */
        .sort((a, b) => Number(b.fixado) - Number(a.fixado) || b.em.localeCompare(a.em)),
    };
  }

  async publicar(quem: Pessoa, idOuSlug: string, corpo: unknown): Promise<Resultado<Post>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.ehAtivo(sala.id, quem))) return falha(403, 'SO_MEMBROS', 'Entre na sala para publicar.');
    const c = (corpo ?? {}) as Record<string, unknown>;
    const titulo = texto(c.titulo, LIMITES.titulo);
    const conteudo = texto(c.corpo, LIMITES.corpo);
    if (!titulo) return falha(400, 'TITULO_INVALIDO', `O post precisa de título (até ${LIMITES.titulo} caracteres).`);
    if (!conteudo) return falha(400, 'CORPO_INVALIDO', `O post precisa de texto (até ${LIMITES.corpo} caracteres).`);
    const categoria = typeof c.categoria === 'string' && sala.categorias.includes(c.categoria) ? c.categoria : sala.categorias[0] ?? 'Geral';
    const post: Post = { id: this.novoId(), salaId: sala.id, autor: quem, categoria, titulo, corpo: conteudo, fixado: false, em: this.agora().toISOString() };
    await this.kv.put(K.post(sala.id, post.id), JSON.stringify(post));
    return { ok: true, valor: post, status: 201 };
  }

  async apagarPost(quem: Pessoa, idOuSlug: string, postId: string): Promise<Resultado<null>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const post = await lerJson<Post>(this.kv, K.post(sala.id, postId));
    if (!post) return falha(404, 'POST_NAO_EXISTE', 'Este post não existe.');
    const eu = await this.ehAtivo(sala.id, quem);
    if (post.autor.sub !== quem.sub && (!eu || eu.papel === 'membro')) {
      return falha(403, 'NAO_E_SEU', 'Só quem escreveu, ou quem cuida da sala, apaga o post.');
    }
    await this.kv.delete(K.post(sala.id, postId));
    for (const k of [...(await todasAsChaves(this.kv, K.comentarios(sala.id, postId))), ...(await todasAsChaves(this.kv, K.curtida(sala.id, postId, '')))]) {
      await this.kv.delete(k);
    }
    return { ok: true, valor: null };
  }

  async fixar(quem: Pessoa, idOuSlug: string, postId: string): Promise<Resultado<Post>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const eu = await this.ehAtivo(sala.id, quem);
    if (!eu || eu.papel === 'membro') return falha(403, 'SO_QUEM_CUIDA', 'Só quem cuida da sala fixa posts.');
    const post = await lerJson<Post>(this.kv, K.post(sala.id, postId));
    if (!post) return falha(404, 'POST_NAO_EXISTE', 'Este post não existe.');
    const novo = { ...post, fixado: !post.fixado };
    await this.kv.put(K.post(sala.id, postId), JSON.stringify(novo));
    return { ok: true, valor: novo };
  }

  /** Curtir alterna. Curtir o próprio post não conta: pontos assim seriam de graça. */
  async curtir(quem: Pessoa, idOuSlug: string, postId: string): Promise<Resultado<{ curti: boolean }>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.ehAtivo(sala.id, quem))) return falha(403, 'SO_MEMBROS', 'Entre na sala para curtir.');
    const post = await lerJson<Post>(this.kv, K.post(sala.id, postId));
    if (!post) return falha(404, 'POST_NAO_EXISTE', 'Este post não existe.');
    if (post.autor.sub === quem.sub) return falha(409, 'PROPRIO_POST', 'Não dá para curtir o próprio post.');
    const chave = K.curtida(sala.id, postId, quem.sub);
    if (await this.kv.get(chave)) {
      await this.kv.delete(chave);
      return { ok: true, valor: { curti: false } };
    }
    /** O valor guarda o autor do post (o ranking conta sem reler post nenhum) e quando (o aviso). */
    const curtida: Curtida = { autor: post.autor.sub, de: quem.sub, nomeDe: quem.nome, em: this.agora().toISOString() };
    await this.kv.put(chave, JSON.stringify(curtida));
    return { ok: true, valor: { curti: true } };
  }

  async comentarios(quem: Pessoa | null, idOuSlug: string, postId: string): Promise<Resultado<Comentario[]>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.podeLer(sala, quem))) return falha(403, 'SALA_PRIVADA', 'O que se conversa nesta sala é só de quem está nela.');
    const cs = await Promise.all((await todasAsChaves(this.kv, K.comentarios(sala.id, postId))).map((k) => lerJson<Comentario>(this.kv, k)));
    return { ok: true, valor: cs.filter((c): c is Comentario => c !== null).sort((a, b) => a.em.localeCompare(b.em)) };
  }

  async comentar(quem: Pessoa, idOuSlug: string, postId: string, corpo: unknown): Promise<Resultado<Comentario>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.ehAtivo(sala.id, quem))) return falha(403, 'SO_MEMBROS', 'Entre na sala para comentar.');
    if (!(await this.kv.get(K.post(sala.id, postId)))) return falha(404, 'POST_NAO_EXISTE', 'Este post não existe.');
    const t = texto((corpo as Record<string, unknown> | null)?.corpo, LIMITES.comentario);
    if (!t) return falha(400, 'COMENTARIO_INVALIDO', `O comentário precisa de texto (até ${LIMITES.comentario} caracteres).`);
    const em = this.agora().toISOString();
    const c: Comentario = { id: this.novoId(), postId, autor: quem, corpo: t, em };
    await this.kv.put(K.comentario(sala.id, postId, em, c.id), JSON.stringify(c));
    return { ok: true, valor: c, status: 201 };
  }

  // ------------------------------------------------------------ agenda ---

  async encontros(quem: Pessoa | null, idOuSlug: string): Promise<Resultado<Encontro[]>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.podeLer(sala, quem))) return falha(403, 'SALA_PRIVADA', 'A agenda desta sala é só de quem está nela.');
    const es = await Promise.all((await todasAsChaves(this.kv, K.encontros(sala.id))).map((k) => lerJson<Encontro>(this.kv, k)));
    return { ok: true, valor: es.filter((e): e is Encontro => e !== null).sort((a, b) => a.inicio.localeCompare(b.inicio)) };
  }

  async marcarEncontro(quem: Pessoa, idOuSlug: string, corpo: unknown): Promise<Resultado<Encontro>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    const eu = await this.ehAtivo(sala.id, quem);
    if (!eu || eu.papel === 'membro') return falha(403, 'SO_QUEM_CUIDA', 'Só quem cuida da sala marca encontros.');
    const c = (corpo ?? {}) as Record<string, unknown>;
    const titulo = texto(c.titulo, LIMITES.titulo);
    if (!titulo) return falha(400, 'TITULO_INVALIDO', 'O encontro precisa de título.');
    const inicio = typeof c.inicio === 'string' && !Number.isNaN(Date.parse(c.inicio)) ? new Date(c.inicio).toISOString() : null;
    if (!inicio) return falha(400, 'DATA_INVALIDA', 'O encontro precisa de data e hora.');
    const duracaoMin = Number.isFinite(Number(c.duracaoMin)) ? Math.min(Math.max(Math.round(Number(c.duracaoMin)), 5), 480) : 60;
    /** Só link http(s): outro esquema num botão da sala seria porta para `javascript:`. */
    const link = typeof c.link === 'string' && /^https?:\/\//.test(c.link.trim()) ? c.link.trim().slice(0, 500) : undefined;
    const e: Encontro = {
      id: this.novoId(),
      titulo,
      inicio,
      duracaoMin,
      link,
      descricao: typeof c.descricao === 'string' ? c.descricao.trim().slice(0, 1000) || undefined : undefined,
      criadoEm: this.agora().toISOString(),
    };
    await this.kv.put(K.encontro(sala.id, inicio, e.id), JSON.stringify(e));
    return { ok: true, valor: e, status: 201 };
  }

  // ----------------------------------------------------------- ranking ---

  /** Pontos = curtidas recebidas (menos as de quem saiu, que continuam valendo: a contribuição aconteceu). */
  async ranking(quem: Pessoa | null, idOuSlug: string): Promise<Resultado<Array<Pessoa & { pontos: number; nivel: number }>>> {
    const sala = await this.sala(idOuSlug);
    if (!sala) return falha(404, 'SALA_NAO_EXISTE', 'Esta sala não existe.');
    if (!(await this.podeLer(sala, quem))) return falha(403, 'SALA_PRIVADA', 'O ranking desta sala é só de quem está nela.');
    const pontos = new Map<string, number>();
    for (const k of await todasAsChaves(this.kv, K.curtidas(sala.id))) {
      const autor = lerCurtida(await this.kv.get(k))?.autor;
      if (autor) pontos.set(autor, (pontos.get(autor) ?? 0) + 1);
    }
    const membros = (await Promise.all((await todasAsChaves(this.kv, K.membros(sala.id))).map((k) => lerJson<Membro>(this.kv, k))))
      .filter((m): m is Membro => m?.status === 'ativo');
    return {
      ok: true,
      valor: membros
        .map((m) => ({ sub: m.sub, nome: m.nome, pontos: pontos.get(m.sub) ?? 0, nivel: nivelDosPontos(pontos.get(m.sub) ?? 0) }))
        .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome)),
    };
  }

  // ---------------------------------------------------------- avisos ---

  /**
   * AVISOS DAS SALAS (AUD-10): o que aconteceu, desde `desde`, nas salas em que
   * a pessoa está — e que não foi ela quem fez.
   */
  async novidades(quem: Pessoa, desde: string): Promise<Resultado<Novidade[]>> {
    const saida: Novidade[] = [];
    const salaIds = (await todasAsChaves(this.kv, K.minhas(quem.sub))).map((k) => k.split(':').pop()!);
    for (const salaId of salaIds) {
      const sala = await lerJson<Sala>(this.kv, K.sala(salaId));
      const eu = await lerJson<Membro>(this.kv, K.membro(salaId, quem.sub));
      if (!sala || !eu) continue;
      const onde = `/rooms/${sala.slug}`;
      if (eu.aprovadoEm && eu.aprovadoEm > desde) {
        saida.push({ id: `apr_${salaId}`, tipo: 'SALA_APROVADO', titulo: `Você entrou em ${sala.nome}`, texto: 'Seu pedido foi aprovado.', link: onde, em: eu.aprovadoEm });
      }
      if (eu.status !== 'ativo') continue;

      const posts = (await Promise.all((await todasAsChaves(this.kv, K.posts(salaId))).map((k) => lerJson<Post>(this.kv, k)))).filter((p): p is Post => !!p);
      const meus = new Map(posts.filter((p) => p.autor.sub === quem.sub).map((p) => [p.id, p]));
      for (const p of posts) {
        if (p.autor.sub !== quem.sub && p.em > desde) {
          saida.push({ id: `post_${p.id}`, tipo: 'SALA_POST', titulo: `${p.autor.nome} publicou em ${sala.nome}`, texto: p.titulo, link: onde, em: p.em });
        }
      }
      for (const [postId, p] of meus) {
        for (const k of await todasAsChaves(this.kv, K.comentarios(salaId, postId))) {
          const c = await lerJson<Comentario>(this.kv, k);
          if (c && c.autor.sub !== quem.sub && c.em > desde) {
            saida.push({ id: `com_${c.id}`, tipo: 'SALA_COMENTARIO', titulo: `${c.autor.nome} comentou seu post`, texto: `"${p.titulo}" — ${c.corpo.slice(0, 80)}`, link: onde, em: c.em });
          }
        }
        for (const k of await todasAsChaves(this.kv, K.curtida(salaId, postId, ''))) {
          const c = lerCurtida(await this.kv.get(k));
          if (c?.em && c.em > desde && c.de !== quem.sub) {
            saida.push({ id: `cur_${postId}_${c.de}`, tipo: 'SALA_CURTIDA', titulo: `${c.nomeDe || 'Alguém'} curtiu seu post`, texto: p.titulo, link: onde, em: c.em });
          }
        }
      }
      for (const k of await todasAsChaves(this.kv, K.encontros(salaId))) {
        const e = await lerJson<Encontro>(this.kv, k);
        if (e?.criadoEm && e.criadoEm > desde) {
          saida.push({ id: `enc_${e.id}`, tipo: 'SALA_ENCONTRO', titulo: `Encontro marcado em ${sala.nome}`, texto: `${e.titulo} — ${new Date(e.inicio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, link: onde, em: e.criadoEm });
        }
      }
    }
    return { ok: true, valor: saida.sort((a, b) => b.em.localeCompare(a.em)).slice(0, 100) };
  }
}

function normalizarCategorias(v: unknown): string[] {
  const lista = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean) : [];
  const unicas = [...new Set(lista.map((x) => x.slice(0, 40)))].slice(0, LIMITES.categorias);
  return unicas.length ? unicas : ['Geral'];
}

/** KV em memória — o desenvolvimento local e os testes usam; produção usa o KV da Cloudflare. */
export class KVEmMemoria implements ArmazemKV {
  private m = new Map<string, string>();
  async put(k: string, v: string) {
    this.m.set(k, v);
  }
  async get(k: string) {
    return this.m.get(k) ?? null;
  }
  async delete(k: string) {
    this.m.delete(k);
  }
  async list({ prefix, limit = 1000, cursor }: { prefix: string; limit?: number; cursor?: string }) {
    const todas = [...this.m.keys()].filter((k) => k.startsWith(prefix)).sort();
    const inicio = cursor ? Number(cursor) : 0;
    const fatia = todas.slice(inicio, inicio + limit);
    const fim = inicio + fatia.length >= todas.length;
    return { keys: fatia.map((name) => ({ name })), list_complete: fim, cursor: fim ? undefined : String(inicio + fatia.length) };
  }
}
