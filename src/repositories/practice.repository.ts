import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import {
  SkillTree,
  Skill,
  MicroSkill,
  Exercise,
  ExerciseAttempt,
  PracticeSession,
  PracticeResult,
  MasteryRecord,
  StreakTracker,
  DailyGoal,
  RankingLeaderboardEntry,
  RankingLeague,
} from '../domain/practice';
import {
  SEED_SKILL_TREES,
  SEED_SKILLS,
  SEED_EXERCISES,
  sequenciaInicial,
  metaDoDia,
  RANKING_INICIAL,
} from '../data/seed-practice-content';

export interface PracticeRepository {
  // Trees & Skills
  listSkillTrees(): Promise<SkillTree[]>;
  findSkillTreeById(id: string): Promise<SkillTree | null>;
  listSkills(treeId?: string): Promise<Skill[]>;
  findSkillById(id: string): Promise<Skill | null>;
  findMicroSkillById(id: string): Promise<MicroSkill | null>;

  // Exercises
  listExercises(skillId?: string): Promise<Exercise[]>;
  findExerciseById(id: string): Promise<Exercise | null>;

  // Sessions
  saveSession(session: PracticeSession): Promise<PracticeSession>;
  findSessionById(id: string): Promise<PracticeSession | null>;
  listSessionsByUser(userId: string): Promise<PracticeSession[]>;

  // Attempts
  saveAttempt(attempt: ExerciseAttempt): Promise<ExerciseAttempt>;
  listAttemptsBySession(sessionId: string): Promise<ExerciseAttempt[]>;
  findAttemptById(id: string): Promise<ExerciseAttempt | null>;

  // Results
  saveResult(result: PracticeResult): Promise<PracticeResult>;
  findResultById(id: string): Promise<PracticeResult | null>;
  listResultsByUser(userId: string): Promise<PracticeResult[]>;

  // Mastery
  getMastery(userId: string, skillId: string): Promise<MasteryRecord | null>;
  listMasteriesByUser(userId: string): Promise<MasteryRecord[]>;
  saveMastery(mastery: MasteryRecord): Promise<MasteryRecord>;

  // Gamification: Streak, Daily Goal & Rankings
  getStreak(userId: string): Promise<StreakTracker>;
  saveStreak(streak: StreakTracker): Promise<StreakTracker>;
  getDailyGoal(userId: string): Promise<DailyGoal>;
  saveDailyGoal(goal: DailyGoal): Promise<DailyGoal>;
  getLeaderboard(period?: string, league?: RankingLeague): Promise<RankingLeaderboardEntry[]>;
}

export class PersistentPracticeRepository implements PracticeRepository {
  private storage: LocalStorageAdapter;

  private readonly STORAGE_KEYS = {
    TREES: 'amd_practice_trees_v1',
    SKILLS: 'amd_practice_skills_v1',
    EXERCISES: 'amd_practice_exercises_v1',
    SESSIONS: 'amd_practice_sessions_v1',
    ATTEMPTS: 'amd_practice_attempts_v1',
    RESULTS: 'amd_practice_results_v1',
    MASTERY: 'amd_practice_mastery_v1',
    STREAK: 'amd_practice_streak_v1',
    GOALS: 'amd_practice_daily_goals_v1',
    LEADERBOARD: 'amd_practice_leaderboard_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
    this.initializeSeeds();
  }

  private initializeSeeds(): void {
    if (!this.storage.get<SkillTree[]>(this.STORAGE_KEYS.TREES)) {
      this.storage.set(this.STORAGE_KEYS.TREES, SEED_SKILL_TREES);
    }
    if (!this.storage.get<Skill[]>(this.STORAGE_KEYS.SKILLS)) {
      this.storage.set(this.STORAGE_KEYS.SKILLS, SEED_SKILLS);
    }
    if (!this.storage.get<Exercise[]>(this.STORAGE_KEYS.EXERCISES)) {
      this.storage.set(this.STORAGE_KEYS.EXERCISES, SEED_EXERCISES);
    }
    /**
     * Sequência, meta e ranking NÃO são semeados.
     *
     * São dados do aluno, e dado do aluno nasce do que o aluno fez. Semear
     * aqui era o que fazia a conta recém-criada exibir uma semana de estudo
     * inexistente.
     */
  }

  public async listSkillTrees(): Promise<SkillTree[]> {
    return this.storage.get<SkillTree[]>(this.STORAGE_KEYS.TREES) || SEED_SKILL_TREES;
  }

  public async findSkillTreeById(id: string): Promise<SkillTree | null> {
    const trees = await this.listSkillTrees();
    return trees.find((t) => t.id === id || t.slug === id) || null;
  }

  public async listSkills(treeId?: string): Promise<Skill[]> {
    const skills = this.storage.get<Skill[]>(this.STORAGE_KEYS.SKILLS) || SEED_SKILLS;
    if (treeId) {
      return skills.filter((s) => s.treeId === treeId);
    }
    return skills;
  }

  public async findSkillById(id: string): Promise<Skill | null> {
    const skills = await this.listSkills();
    return skills.find((s) => s.id === id || s.code === id) || null;
  }

  public async findMicroSkillById(id: string): Promise<MicroSkill | null> {
    const skills = await this.listSkills();
    for (const s of skills) {
      if (s.microSkills) {
        const found = s.microSkills.find((m) => m.id === id || m.code === id);
        if (found) return found;
      }
    }
    return null;
  }

  public async listExercises(skillId?: string): Promise<Exercise[]> {
    const exercises = this.storage.get<Exercise[]>(this.STORAGE_KEYS.EXERCISES) || SEED_EXERCISES;
    if (skillId) {
      return exercises.filter((e) => e.skillId === skillId);
    }
    return exercises;
  }

  public async findExerciseById(id: string): Promise<Exercise | null> {
    const exercises = await this.listExercises();
    return exercises.find((e) => e.id === id) || null;
  }

  public async saveSession(session: PracticeSession): Promise<PracticeSession> {
    const sessions = this.storage.get<PracticeSession[]>(this.STORAGE_KEYS.SESSIONS) || [];
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    this.storage.set(this.STORAGE_KEYS.SESSIONS, sessions);
    return session;
  }

  public async findSessionById(id: string): Promise<PracticeSession | null> {
    const sessions = this.storage.get<PracticeSession[]>(this.STORAGE_KEYS.SESSIONS) || [];
    return sessions.find((s) => s.id === id) || null;
  }

  public async listSessionsByUser(userId: string): Promise<PracticeSession[]> {
    const sessions = this.storage.get<PracticeSession[]>(this.STORAGE_KEYS.SESSIONS) || [];
    return sessions.filter((s) => s.userId === userId);
  }

  public async saveAttempt(attempt: ExerciseAttempt): Promise<ExerciseAttempt> {
    const attempts = this.storage.get<ExerciseAttempt[]>(this.STORAGE_KEYS.ATTEMPTS) || [];
    const idx = attempts.findIndex((a) => a.id === attempt.id);
    if (idx >= 0) {
      attempts[idx] = attempt;
    } else {
      attempts.push(attempt);
    }
    this.storage.set(this.STORAGE_KEYS.ATTEMPTS, attempts);
    return attempt;
  }

  public async listAttemptsBySession(sessionId: string): Promise<ExerciseAttempt[]> {
    const attempts = this.storage.get<ExerciseAttempt[]>(this.STORAGE_KEYS.ATTEMPTS) || [];
    return attempts.filter((a) => a.sessionId === sessionId);
  }

  public async findAttemptById(id: string): Promise<ExerciseAttempt | null> {
    const attempts = this.storage.get<ExerciseAttempt[]>(this.STORAGE_KEYS.ATTEMPTS) || [];
    return attempts.find((a) => a.id === id) || null;
  }

  public async saveResult(result: PracticeResult): Promise<PracticeResult> {
    const results = this.storage.get<PracticeResult[]>(this.STORAGE_KEYS.RESULTS) || [];
    const idx = results.findIndex((r) => r.id === result.id);
    if (idx >= 0) {
      results[idx] = result;
    } else {
      results.push(result);
    }
    this.storage.set(this.STORAGE_KEYS.RESULTS, results);
    return result;
  }

  public async findResultById(id: string): Promise<PracticeResult | null> {
    const results = this.storage.get<PracticeResult[]>(this.STORAGE_KEYS.RESULTS) || [];
    return results.find((r) => r.id === id) || null;
  }

  public async listResultsByUser(userId: string): Promise<PracticeResult[]> {
    const results = this.storage.get<PracticeResult[]>(this.STORAGE_KEYS.RESULTS) || [];
    return results.filter((r) => r.userId === userId);
  }

  public async getMastery(userId: string, skillId: string): Promise<MasteryRecord | null> {
    const list = this.storage.get<MasteryRecord[]>(this.STORAGE_KEYS.MASTERY) || [];
    return list.find((m) => m.userId === userId && m.skillId === skillId) || null;
  }

  /**
   * O parâmetro se chamava `_userId` e era ignorado: o método devolvia o
   * domínio de habilidade de TODAS as pessoas que já usaram aquele navegador.
   *
   * Num produto sem banco, em que o armazenamento é o do dispositivo, é assim
   * que o dado de um aluno chega ao outro — sem invasão nenhuma, bastando
   * dividir o computador de casa ou da escola.
   */
  public async listMasteriesByUser(userId: string): Promise<MasteryRecord[]> {
    const list = this.storage.get<MasteryRecord[]>(this.STORAGE_KEYS.MASTERY) || [];
    return list.filter((m) => m.userId === userId);
  }

  public async saveMastery(mastery: MasteryRecord): Promise<MasteryRecord> {
    const list = this.storage.get<MasteryRecord[]>(this.STORAGE_KEYS.MASTERY) || [];
    const idx = list.findIndex((m) => m.userId === mastery.userId && m.skillId === mastery.skillId);
    if (idx >= 0) {
      list[idx] = mastery;
    } else {
      list.push(mastery);
    }
    this.storage.set(this.STORAGE_KEYS.MASTERY, list);
    return mastery;
  }

  public async getStreak(userId: string): Promise<StreakTracker> {
    const stored = this.storage.get<StreakTracker>(this.STORAGE_KEYS.STREAK);
    if (stored && stored.userId === userId) {
      return stored;
    }
    return sequenciaInicial(userId);
  }

  public async saveStreak(streak: StreakTracker): Promise<StreakTracker> {
    this.storage.set(this.STORAGE_KEYS.STREAK, streak);
    return streak;
  }

  public async getDailyGoal(userId: string): Promise<DailyGoal> {
    const stored = this.storage.get<DailyGoal>(this.STORAGE_KEYS.GOALS);
    if (stored && stored.userId === userId) {
      return stored;
    }
    return metaDoDia(userId);
  }

  public async saveDailyGoal(goal: DailyGoal): Promise<DailyGoal> {
    this.storage.set(this.STORAGE_KEYS.GOALS, goal);
    return goal;
  }

  public async getLeaderboard(
    _period: string = 'WEEKLY',
    league: RankingLeague = RankingLeague.CONSERVATORY
  ): Promise<RankingLeaderboardEntry[]> {
    const list = this.storage.get<RankingLeaderboardEntry[]>(this.STORAGE_KEYS.LEADERBOARD) || RANKING_INICIAL;
    return list.filter((l) => l.league === league || !league);
  }
}

export const practiceRepository = new PersistentPracticeRepository();
