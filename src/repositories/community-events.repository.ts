import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { CommunityEvent } from '../domain/community';

/**
 * Eventos da Academia e as inscrições neles.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * `CommunityEvent` estava no domínio e nenhuma linha o consumia. A tela de
 * eventos listava duas masterclasses escritas no próprio arquivo — com
 * professora inventada, data de outubro de 2026 e "48 inscritos" —, e o botão
 * "Garantir participação" chamava `alert('Inscrição confirmada no evento…')`.
 *
 * Esse alerta é a pior categoria de defeito do produto: ele não só deixa de
 * fazer, como **afirma que fez**. O aluno lê "inscrição confirmada", fecha a
 * aba, e não está inscrito em nada.
 *
 * Aqui a inscrição é gravada, é do aluno que a fez, e a contagem de inscritos
 * é contada — não digitada.
 */
export interface InscricaoEmEvento {
  eventoId: string;
  userId: string;
  inscritaEm: string;
}

export interface CommunityEventsRepository {
  listar(): Promise<CommunityEvent[]>;
  porId(id: string): Promise<CommunityEvent | null>;
  salvar(evento: CommunityEvent): Promise<CommunityEvent>;

  inscrever(eventoId: string, userId: string): Promise<InscricaoEmEvento>;
  cancelarInscricao(eventoId: string, userId: string): Promise<void>;
  estaInscrito(eventoId: string, userId: string): Promise<boolean>;
  inscricoesDoUsuario(userId: string): Promise<InscricaoEmEvento[]>;
  totalDeInscritos(eventoId: string): Promise<number>;
}

export class PersistentCommunityEventsRepository implements CommunityEventsRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVES = {
    EVENTOS: 'amd_community_events_v1',
    INSCRICOES: 'amd_community_event_signups_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private eventos(): CommunityEvent[] {
    return this.storage.get<CommunityEvent[]>(this.CHAVES.EVENTOS) ?? [];
  }

  private inscricoes(): InscricaoEmEvento[] {
    return this.storage.get<InscricaoEmEvento[]>(this.CHAVES.INSCRICOES) ?? [];
  }

  public async listar(): Promise<CommunityEvent[]> {
    return this.eventos()
      .filter((e) => e.status !== 'CANCELLED')
      .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));
  }

  public async porId(id: string): Promise<CommunityEvent | null> {
    return this.eventos().find((e) => e.id === id) ?? null;
  }

  public async salvar(evento: CommunityEvent): Promise<CommunityEvent> {
    const atuais = this.eventos();
    const i = atuais.findIndex((e) => e.id === evento.id);
    if (i >= 0) atuais[i] = evento;
    else atuais.push(evento);
    this.storage.set(this.CHAVES.EVENTOS, atuais);
    return evento;
  }

  /**
   * Inscrever é idempotente.
   *
   * Clicar duas vezes não inscreve duas vezes nem infla a contagem — e é o
   * que acontece de verdade quando a rede demora e a pessoa insiste.
   */
  public async inscrever(eventoId: string, userId: string): Promise<InscricaoEmEvento> {
    const atuais = this.inscricoes();
    const ja = atuais.find((i) => i.eventoId === eventoId && i.userId === userId);
    if (ja) return ja;

    const nova: InscricaoEmEvento = {
      eventoId,
      userId,
      inscritaEm: new Date().toISOString(),
    };
    this.storage.set(this.CHAVES.INSCRICOES, [...atuais, nova]);
    return nova;
  }

  public async cancelarInscricao(eventoId: string, userId: string): Promise<void> {
    this.storage.set(
      this.CHAVES.INSCRICOES,
      this.inscricoes().filter((i) => !(i.eventoId === eventoId && i.userId === userId))
    );
  }

  public async estaInscrito(eventoId: string, userId: string): Promise<boolean> {
    return this.inscricoes().some((i) => i.eventoId === eventoId && i.userId === userId);
  }

  /** Só as inscrições de quem perguntou. Nunca as de outro aluno. */
  public async inscricoesDoUsuario(userId: string): Promise<InscricaoEmEvento[]> {
    return this.inscricoes().filter((i) => i.userId === userId);
  }

  /** A contagem é contada. Era um número escrito à mão ao lado de "inscritos". */
  public async totalDeInscritos(eventoId: string): Promise<number> {
    return this.inscricoes().filter((i) => i.eventoId === eventoId).length;
  }
}

export const communityEventsRepository: CommunityEventsRepository =
  new PersistentCommunityEventsRepository();
