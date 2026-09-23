import { MedicaoReal } from './practice-measurement';
import { EntityId, ISOTimestamp } from './types';

/**
 * PRACTICE DOMAIN
 * Skill loops, microcompetencies, telemetry, streaks, XP, mastery, and rankings.
 */

export enum SkillCategory {
  EAR_TRAINING = 'EAR_TRAINING',
  SIGHT_READING = 'SIGHT_READING',
  RHYTHM = 'RHYTHM',
  THEORY = 'THEORY',
  TECHNIQUE = 'TECHNIQUE',
  POLYPHONY = 'POLYPHONY',
}

export enum PracticeModality {
  KEYBOARD = 'teclado',
  VIRTUAL_INSTRUMENT = 'instrumento virtual',
  VOICE = 'voz',
  RHYTHM = 'ritmo',
  READING = 'leitura',
  PERCEPTION = 'percepção',
  THEORY = 'teoria',
  EAR_TRAINING = 'treinamento auditivo',
  REPERTOIRE = 'repertório',
  TECHNIQUE = 'técnica',
}

export enum ExerciseType {
  INTERVAL = 'INTERVAL',
  CHORD = 'CHORD',
  SCALE = 'SCALE',
  RHYTHMIC_DICTATION = 'RHYTHMIC_DICTATION',
  SIGHT_SINGING = 'SIGHT_SINGING',
  PITCH_MATCH = 'PITCH_MATCH',
  VOICE_LEADING = 'VOICE_LEADING',
  RHYTHM_TAP = 'RHYTHM_TAP',
  KEYBOARD_EXECUTION = 'KEYBOARD_EXECUTION',
  REPERTOIRE_PHRASE = 'REPERTOIRE_PHRASE',
}

export enum RankingLeague {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  CONSERVATORY = 'CONSERVATORY',
}

export interface PracticeMeasurement {
  pitch: {
    targetNote: string;
    detectedNote: string;
    deviationCents: number;
    centsAccuracy: number; // 0..100
  };
  timing: {
    deviationMs: number;
    timingScore: number; // 0..100
  };
  rhythm: {
    stabilityScore: number; // 0..100
    subdivisionAccuracy: number; // 0..100
  };
  tempo: {
    targetBpm: number;
    recordedBpm: number;
    stabilityVariance: number;
  };
  accuracy: number; // Global accuracy % (0..100)
  intonation: number; // Intonation purity (0..100)
  duration: {
    targetSeconds: number;
    recordedSeconds: number;
    sustainScore: number; // 0..100
  };
  consistency: number; // Variance across bars / attempts (0..100)
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso';
  score: number; // Final weighted score (0..1000)
}

export interface MicroSkill {
  id: EntityId;
  skillId: EntityId;
  code: string;
  name: string;
  description: string;
  category: SkillCategory;
  modality: PracticeModality;
  rubric: string;
  targetMetric: string;
  criteria: string[];
  xpBonus: number;
}

export interface Skill {
  id: EntityId;
  code: string;
  category: SkillCategory;
  name: string;
  description: string;
  treeId?: EntityId;
  prerequisiteSkillIds: EntityId[];
  microSkills?: MicroSkill[];
  maxMasteryLevel: number; // e.g. 5
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Exercise {
  id: EntityId;
  skillId: EntityId;
  microSkillId?: EntityId;
  title: string;
  instruction: string;
  type: ExerciseType;
  modality: PracticeModality;
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso';
  virtualInstrument?: 'piano' | 'violin' | 'flute' | 'guitar';
  targetPitch?: string;
  targetBpm?: number;
  rhythmPattern?: number[]; // durations in beats or ms
  expectedNotes?: string[];
  notationSnippet?: {
    clef: string;
    keySignature: string;
    timeSignature: string;
    notesDisplay: string;
  };
  audioPrompt?: {
    notes: string[];
    frequenciesHz: number[];
  };
  toleranceCents: number; // e.g. 15 cents
  tempoBpm?: number;
  maxScore: number;
  xpAwarded: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface ExerciseAttempt {
  id: EntityId;
  exerciseId: EntityId;
  skillId: EntityId;
  microSkillId?: EntityId;
  userId: EntityId;
  sessionId?: EntityId;
  attemptNumber: number;
  givenResponse: string;
  expectedResponse: string;
  isCorrect: boolean;
  accuracyScore: number; // 0..100
  timingDeviationMs?: number;
  pitchDeviationCents?: number;
  /**
   * @deprecated Estrutura antiga, em que toda dimensao era um numero — o que
   * obrigava a inventar um valor quando nao havia o que medir. Substituida
   * por `medicao`, onde ausencia e representavel.
   */
  measurement?: PracticeMeasurement;
  /** Medicao real. `null` em qualquer dimensao significa "nao medida". */
  medicao: MedicaoReal;
  immediateFeedback: {
    headline: string;
    details: string;
    correctiveAction: string;
    isPass: boolean;
    badgeAwarded?: string;
  };
  xpEarned: number;
  timestamp: ISOTimestamp;
}

export interface PracticeSession {
  /**
   * Quantas tentativas entraram na media de acuracia.
   *
   * Diferente de `attemptsCount`: tentativas sem medicao nao entram na media,
   * porque inclui-las como zero rebaixaria a sessao por uma falha de
   * captacao — de microfone mudo, por exemplo.
   */
  attemptsMeasured?: number;
  id: EntityId;
  userId: EntityId;
  modality: PracticeModality;
  toolType: string;
  skillIds: EntityId[];
  exerciseIds: EntityId[];
  startedAt: ISOTimestamp;
  endedAt?: ISOTimestamp;
  durationSeconds: number;
  accuracyScore: number;
  tempoBpm?: number;
  notesAttempted: number;
  notesCorrect: number;
  attemptsCount: number;
  totalXpEarned: number;
  isCompleted: boolean;
}

export interface PracticeResult {
  id: EntityId;
  sessionId: EntityId;
  userId: EntityId;
  skillId: EntityId;
  exerciseTitle: string;
  modality: PracticeModality;
  summaryScore: number; // 0..1000
  /**
   * @deprecated Estrutura antiga, em que toda dimensao era um numero — o que
   * obrigava a inventar um valor quando nao havia o que medir. Substituida
   * por `medicao`, onde ausencia e representavel.
   */
  measurement?: PracticeMeasurement;
  /** Medicao real. `null` em qualquer dimensao significa "nao medida". */
  medicao: MedicaoReal;
  pitchAccuracy: number;
  rhythmAccuracy: number;
  tempoStability: number;
  intonationScore: number;
  consistencyScore: number;
  durationSeconds: number;
  notesAttempted: number;
  notesCorrect: number;
  xpGained: number;
  streakIncremented: boolean;
  masteryAdvancement?: {
    previousLevel: number;
    newLevel: number;
    leveledUp: boolean;
  };
  feedbackPoints: string[];
  recommendations: string[];
  evidenceGeneratedId?: EntityId;
  createdAt: ISOTimestamp;
}

export interface MasteryRecord {
  id: EntityId;
  userId: EntityId;
  skillId: EntityId;
  level: number; // 1 to 5 (1: Novato, 2: Aprendiz, 3: Competente, 4: Mestre, 5: Virtuoso)
  scorePercentage: number;
  totalAttempts: number;
  successfulAttempts: number;
  lastPracticedAt: ISOTimestamp;
  masteredAt?: ISOTimestamp;
}

export interface DailyGoal {
  id: EntityId;
  userId: EntityId;
  date: string; // YYYY-MM-DD
  targetMinutes: number; // e.g. 20
  completedMinutes: number;
  targetXp: number; // e.g. 100
  completedXp: number;
  targetExercises: number; // e.g. 5
  completedExercises: number;
  isCompleted: boolean;
  completedAt?: ISOTimestamp;
}

export interface StreakTracker {
  id: EntityId;
  userId: EntityId;
  currentStreakDays: number;
  longestStreakDays: number;
  /**
   * 🔴 QUANTAS DEFENSIVAS DE SETE DIAS JÁ FECHARAM. É O NÍVEL.
   *
   * Guardado, e não derivado de `currentStreakDays`. Cada defensiva completa
   * vale um nível **a mais, para sempre**: quem fechou três semanas e faltou
   * um dia continua no nível 3, e o que recomeça do dia 1 é a contagem.
   *
   * Derivar de um contador que zera é garantir que o nível zere junto — que é
   * exatamente o que a tela fazia. Ver `domain/defensiva.ts`.
   *
   * Opcional porque as fichas gravadas antes deste campo não o têm; quem lê
   * usa `nivelDaDefensiva`, que nesse caso devolve o mínimo que a sequência
   * atual garante, e nunca rebaixa.
   */
  completedCyclesCount?: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezeDaysAvailable: number;
  calendarHistory: { date: string; completedMinutes: number; xp: number }[];
  updatedAt: ISOTimestamp;
}

export interface UserExperiencePoints {
  id: EntityId;
  userId: EntityId;
  totalXp: number;
  weeklyXp: number;
  monthlyXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  /** `null` enquanto nada foi ganho. */
  lastEarnedAt: ISOTimestamp | null;
}

export interface RankingLeaderboardEntry {
  id: EntityId;
  period: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
  league: RankingLeague;
  userId: EntityId;
  userDisplayName: string;
  userAvatarUrl?: string;
  xp: number;
  rankPosition: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  computedAt: ISOTimestamp;
}

/**
 * O retrato de quem pratica.
 *
 * Tres campos admitem ausencia, e isso e o contrato: este perfil ja anunciou
 * 86% de precisao, liga Conservatorio e nivel 12 a uma conta recem-criada,
 * porque o tipo obrigava a preencher tudo. Onde nao houve pratica nao ha
 * numero — e a tela precisa poder dizer isso.
 *
 * O nome de quem pratica NAO mora aqui: o perfil de pratica nao e a
 * identidade. Quem exibe o nome le da sessao.
 */
export interface PracticeProfile {
  userId: EntityId;
  totalPracticeTimeMinutes: number;
  totalSessionsCount: number;
  totalAttemptsCount: number;
  /** `null` enquanto nao houve resultado — diferente de ter errado tudo. */
  overallAccuracyPercentage: number | null;
  /** `null` antes de `CONCLUSOES_PARA_ENTRAR_NA_LIGA` conclusoes (§6). */
  currentLeague: RankingLeague | null;
  streak: StreakTracker;
  dailyGoal: DailyGoal;
  experience: UserExperiencePoints;
  masteryCount: {
    novato: number;
    aprendiz: number;
    competente: number;
    mestre: number;
    virtuoso: number;
  };
  preferredModalities: { modality: PracticeModality; percentage: number }[];
  recentResults: PracticeResult[];
}
