import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { Dimension } from '../domain/music-grammar';
import { StreakGoal } from '../domain/lesson-completion';

/**
 * O que o percurso de cada pessoa guarda.
 *
 * DADO DO ALUNO — nunca republicável
 * ----------------------------------
 * Esta chave fica do lado do progresso, e não do conteúdo. Nada que publique
 * catálogo pode toca-la: os nós que alguém concluiu são história dela, e
 * republicar o Practice não pode apaga-la. Ver `72_QUALITY_SWEEP.md`,
 * na regra das três categorias de armazenamento.
 *
 * TUDO É POR USUÁRIO
 * ------------------
 * Toda leitura filtra por `userId`, e não é formalidade: já houve aqui um
 * `listMasteriesByUser(_userId)` que ignorava o identificador e devolvia a
 * maestria de todo mundo. Uma leitura sem filtro é vazamento entre alunos, e
 * `scripts/qa/seguranca.mjs` falha se ela aparecer.
 */

export interface PathRecord {
  userId: string;
  /** Nós já concluídos, na ordem em que foram. */
  completed: Dimension[];
  /** `null` enquanto a pessoa não escolheu — e não se inventa uma para ela. */
  streakGoal: StreakGoal | null;
  updatedAt: string;
}

/**
 * O que a pessoa achou de um exercício.
 *
 * Existe porque a tela oferece `muito fácil` / `muito difícil` / reportar — e
 * um botão que coleta opinião sem registrá-la em lugar nenhum é pior que não
 * perguntar: cria a impressão de que alguém está ouvindo.
 */
export interface ExerciseVerdict {
  userId: string;
  exerciseId: string;
  verdict: 'EASY' | 'HARD' | 'REPORTED';
  em: string;
}

export interface PathRepository {
  forUser(userId: string): Promise<PathRecord>;
  completeNode(userId: string, dimensao: Dimension): Promise<PathRecord>;
  setStreakGoal(userId: string, meta: StreakGoal): Promise<PathRecord>;
  recordVerdict(v: ExerciseVerdict): Promise<void>;
  verdictsForUser(userId: string): Promise<ExerciseVerdict[]>;
}

export class PersistentPathRepository implements PathRepository {
  private readonly CHAVE = 'amd_practice_percurso_v1';
  private readonly CHAVE_VEREDITOS = 'amd_practice_vereditos_v1';

  constructor(private storage: LocalStorageAdapter = new LocalStorageAdapter()) {}

  private registros(): PathRecord[] {
    return this.storage.get<PathRecord[]>(this.CHAVE) ?? [];
  }

  /**
   * O percurso de quem ainda não tem um.
   *
   * Registro novo nasce **vazio**: nenhum nó concluído e nenhuma meta. Dar um
   * nó de graça para a tela não parecer vazia seria creditar estudo que não
   * houve.
   */
  public async forUser(userId: string): Promise<PathRecord> {
    const found = this.registros().find((r) => r.userId === userId);
    if (found) return found;

    return {
      userId,
      completed: [],
      streakGoal: null,
      updatedAt: new Date().toISOString(),
    };
  }

  private async gravar(record: PathRecord): Promise<PathRecord> {
    const updated = { ...record, updatedAt: new Date().toISOString() };
    const others = this.registros().filter((r) => r.userId !== record.userId);
    this.storage.set(this.CHAVE, [...others, updated]);
    return updated;
  }

  /** Concluir duas vezes o mesmo nó não o duplica. */
  public async completeNode(userId: string, dimensao: Dimension): Promise<PathRecord> {
    const record = await this.forUser(userId);
    if (record.completed.includes(dimensao)) return record;

    return this.gravar({ ...record, completed: [...record.completed, dimensao] });
  }

  public async setStreakGoal(
    userId: string,
    meta: StreakGoal
  ): Promise<PathRecord> {
    const record = await this.forUser(userId);
    return this.gravar({ ...record, streakGoal: meta });
  }

  private vereditos(): ExerciseVerdict[] {
    return this.storage.get<ExerciseVerdict[]>(this.CHAVE_VEREDITOS) ?? [];
  }

  /**
   * Um veredito por pessoa e por exercício.
   *
   * Trocar de ideia substitui; não empilha. Duas opiniões da mesma pessoa
   * sobre o mesmo exercício fariam a contagem pesar quem clicou duas vezes.
   */
  public async recordVerdict(v: ExerciseVerdict): Promise<void> {
    const others = this.vereditos().filter(
      (a) => !(a.userId === v.userId && a.exerciseId === v.exerciseId)
    );
    this.storage.set(this.CHAVE_VEREDITOS, [...others, v]);
  }

  public async verdictsForUser(userId: string): Promise<ExerciseVerdict[]> {
    return this.vereditos().filter((v) => v.userId === userId);
  }
}

export const pathRepository: PathRepository = new PersistentPathRepository();
