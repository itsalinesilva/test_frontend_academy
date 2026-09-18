import { LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';
import { AvaliacaoDeCurso, Estrelas } from '../domain/reviews';
import { StudyRecord, IsoDay, recordStudy } from '../domain/study-attendance';

/**
 * Avaliações de curso e frequência de estudo.
 *
 * Os dois vivem no mesmo repositório porque têm a mesma natureza: são
 * **produzidos pelo aluno**, não publicados pelo Conservatório. Por isso
 * nenhum dos dois tem seed, e nenhum é sobrescrito quando o catálogo muda de
 * versão.
 *
 * Nascer vazio aqui é o estado correto, não uma pendência.
 */

export interface ReviewsRepository {
  listarPorCurso(courseId: string): Promise<AvaliacaoDeCurso[]>;
  listarTodas(): Promise<AvaliacaoDeCurso[]>;
  forUser(userId: string, courseId: string): Promise<AvaliacaoDeCurso | null>;
  salvar(a: AvaliacaoDeCurso): Promise<AvaliacaoDeCurso>;
  remover(id: string): Promise<void>;

  frequencia(userId: string): Promise<StudyRecord[]>;
  recordStudy(userId: string, dia: IsoDay, minutos: number): Promise<StudyRecord[]>;
}

export class PersistentReviewsRepository implements ReviewsRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVES = {
    AVALIACOES: 'amd_course_reviews_v1',
    FREQUENCIA: 'amd_study_attendance_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private todas(): AvaliacaoDeCurso[] {
    return this.storage.get<AvaliacaoDeCurso[]>(this.CHAVES.AVALIACOES) ?? [];
  }

  public async listarTodas(): Promise<AvaliacaoDeCurso[]> {
    return this.todas();
  }

  public async listarPorCurso(courseId: string): Promise<AvaliacaoDeCurso[]> {
    return this.todas()
      .filter((a) => a.courseId === courseId)
      .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  }

  public async forUser(userId: string, courseId: string): Promise<AvaliacaoDeCurso | null> {
    return this.todas().find((a) => a.userId === userId && a.courseId === courseId) ?? null;
  }

  public async salvar(a: AvaliacaoDeCurso): Promise<AvaliacaoDeCurso> {
    const atuais = this.todas();
    // Uma avaliação por aluno por curso: reavaliar substitui, não acumula.
    const outras = atuais.filter((x) => !(x.userId === a.userId && x.courseId === a.courseId));
    this.storage.set(this.CHAVES.AVALIACOES, [...outras, a]);
    return a;
  }

  public async remover(id: string): Promise<void> {
    this.storage.set(
      this.CHAVES.AVALIACOES,
      this.todas().filter((a) => a.id !== id)
    );
  }

  private mapaDeFrequencia(): Record<string, StudyRecord[]> {
    return this.storage.get<Record<string, StudyRecord[]>>(this.CHAVES.FREQUENCIA) ?? {};
  }

  public async frequencia(userId: string): Promise<StudyRecord[]> {
    return this.mapaDeFrequencia()[userId] ?? [];
  }

  public async recordStudy(
    userId: string,
    dia: IsoDay,
    minutos: number
  ): Promise<StudyRecord[]> {
    const mapa = this.mapaDeFrequencia();
    const atualizados = recordStudy(mapa[userId] ?? [], dia, minutos);
    this.storage.set(this.CHAVES.FREQUENCIA, { ...mapa, [userId]: atualizados });
    return atualizados;
  }
}

export const reviewsRepository: ReviewsRepository = new PersistentReviewsRepository();

/** Identificador de avaliação, estável e único por aluno e curso. */
export function idDeAvaliacao(userId: string, courseId: string): string {
  return `rev_${courseId}_${userId}`;
}

export function montarAvaliacao(dados: {
  userId: string;
  courseId: string;
  autor: string;
  anonima: boolean;
  estrelas: Estrelas;
  comentario: string;
  concluiuOCurso: boolean;
  agora?: string;
}): AvaliacaoDeCurso {
  return {
    id: idDeAvaliacao(dados.userId, dados.courseId),
    courseId: dados.courseId,
    userId: dados.userId,
    autor: dados.autor,
    anonima: dados.anonima,
    estrelas: dados.estrelas,
    comentario: dados.comentario.trim(),
    criadaEm: dados.agora ?? new Date().toISOString(),
    concluiuOCurso: dados.concluiuOCurso,
  };
}
