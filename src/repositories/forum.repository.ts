import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { ForumTopic, ForumPost, ForumCategory, TopicStatus } from '../domain/community';

/**
 * Fórum da comunidade.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * `ForumTopic` e `ForumPost` estavam no domínio e nada os consumia. A tela do
 * fórum listava dois debates escritos no próprio arquivo — atribuídos à
 * fundadora do Conservatório e a um "Lucas Mendes", com contagem de respostas
 * e de curtidas inventadas — e o botão "Publicar no fórum" apenas fechava o
 * formulário e limpava o campo.
 *
 * Quem escrevesse um tópico veria o próprio texto desaparecer e dois debates
 * alheios que nunca existiram permanecerem no lugar.
 *
 * Aqui o tópico é gravado, tem autoria de quem o escreveu, e a contagem de
 * respostas é contada a partir das respostas que existem.
 */
export interface ForumRepository {
  listarTopicos(categoria?: ForumCategory): Promise<ForumTopic[]>;
  topicoPorId(id: string): Promise<ForumTopic | null>;
  salvarTopico(topico: ForumTopic): Promise<ForumTopic>;

  respostasDoTopico(topicoId: string): Promise<ForumPost[]>;
  salvarResposta(resposta: ForumPost): Promise<ForumPost>;
}

export class PersistentForumRepository implements ForumRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVES = {
    TOPICOS: 'amd_forum_topics_v1',
    RESPOSTAS: 'amd_forum_posts_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private topicos(): ForumTopic[] {
    return this.storage.get<ForumTopic[]>(this.CHAVES.TOPICOS) ?? [];
  }

  private respostas(): ForumPost[] {
    return this.storage.get<ForumPost[]>(this.CHAVES.RESPOSTAS) ?? [];
  }

  public async listarTopicos(categoria?: ForumCategory): Promise<ForumTopic[]> {
    const vivos = this.topicos().filter((t) => !t.isDeleted);
    const filtrados = categoria ? vivos.filter((t) => t.tags.includes(categoria)) : vivos;
    /** Fixados primeiro; depois o que teve atividade mais recente. */
    return filtrados.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.lastActivityAt.localeCompare(a.lastActivityAt);
    });
  }

  public async topicoPorId(id: string): Promise<ForumTopic | null> {
    return this.topicos().find((t) => (t.id === id || t.slug === id) && !t.isDeleted) ?? null;
  }

  public async salvarTopico(topico: ForumTopic): Promise<ForumTopic> {
    const atuais = this.topicos();
    const i = atuais.findIndex((t) => t.id === topico.id);
    if (i >= 0) atuais[i] = topico;
    else atuais.push(topico);
    this.storage.set(this.CHAVES.TOPICOS, atuais);
    return topico;
  }

  public async respostasDoTopico(topicoId: string): Promise<ForumPost[]> {
    return this.respostas()
      .filter((p) => p.topicId === topicoId && !p.isDeleted)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Gravar a resposta atualiza o tópico.
   *
   * A contagem de respostas e a data da última atividade são consequência de
   * responder, não campos que alguém digita. Mantê-las aqui evita que a tela
   * que esquecer de atualizá-las deixe o fórum mentindo sobre si mesmo.
   */
  public async salvarResposta(resposta: ForumPost): Promise<ForumPost> {
    const atuais = this.respostas();
    const i = atuais.findIndex((p) => p.id === resposta.id);
    if (i >= 0) atuais[i] = resposta;
    else atuais.push(resposta);
    this.storage.set(this.CHAVES.RESPOSTAS, atuais);

    const topico = await this.topicoPorId(resposta.topicId);
    if (topico) {
      await this.salvarTopico({
        ...topico,
        replyCount: atuais.filter((p) => p.topicId === topico.id && !p.isDeleted).length,
        lastActivityAt: resposta.createdAt,
        updatedAt: resposta.createdAt,
      });
    }
    return resposta;
  }
}

/** Identificador legível a partir do título, para o endereço do tópico. */
export function slugDoTopico(titulo: string): string {
  const base = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base || 'topico'}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface DadosDoNovoTopico {
  titulo: string;
  corpo: string;
  categoria: ForumCategory;
  authorId: string;
  authorName: string;
}

/**
 * Monta tópico e primeira mensagem.
 *
 * Um tópico sem o texto de abertura é um título solto; quem clicasse nele
 * encontraria uma discussão vazia. Os dois nascem juntos.
 */
export function criarTopico(dados: DadosDoNovoTopico): { topico: ForumTopic; abertura: ForumPost } {
  const agora = new Date().toISOString();
  const slug = slugDoTopico(dados.titulo);
  const topico: ForumTopic = {
    id: `tpc_${slug}`,
    forumId: dados.categoria,
    authorId: dados.authorId,
    authorName: dados.authorName,
    title: dados.titulo.trim(),
    slug,
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    status: TopicStatus.OPEN,
    viewCount: 0,
    replyCount: 0,
    tags: [dados.categoria],
    lastActivityAt: agora,
    createdAt: agora,
    updatedAt: agora,
    isDeleted: false,
  };

  const abertura: ForumPost = {
    id: `pst_${slug}_1`,
    topicId: topico.id,
    authorId: dados.authorId,
    authorName: dados.authorName,
    contentMarkdown: dados.corpo.trim(),
    attachments: [],
    upvoteCount: 0,
    downvoteCount: 0,
    isAcceptedSolution: false,
    isHiddenByModeration: false,
    createdAt: agora,
    updatedAt: agora,
    isDeleted: false,
  };

  return { topico, abertura };
}

export const forumRepository: ForumRepository = new PersistentForumRepository();
