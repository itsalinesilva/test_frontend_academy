import { LessonInProgress, isLessonComplete, accuracy } from './music-exercise';

/**
 * A economia de progresso, em código.
 *
 * `docs/harness/76_PROGRESS_ECONOMY.md` §2 se declara **a autoridade**:
 * valor que não está lá não é atribuído. Até agora, porém, a tabela existia
 * só como prosa — e foi exatamente por isso que o perfil pôde divergir dela e
 * anunciar 1920 de XP e nível 12 a quem nunca praticou.
 *
 * Aqui os mesmos valores existem como constante única. O documento continua
 * sendo a autoridade sobre *quanto vale cada coisa*; este módulo é o único
 * lugar autorizado a dizer esse número ao resto do sistema, e
 * `scripts/qa/economia.mjs` falha se os dois discordarem.
 *
 * AS QUATRO MOEDAS NÃO SE MISTURAM (§1)
 * -------------------------------------
 * **XP** mede esforço e nunca zera. **Score** mede qualidade. **Ofensiva**
 * mede constância e zera ao pular um dia. **Débito** mede erro e só sai
 * quitando.
 *
 * Uma moeda só apagaria a diferença entre quem pratica muito e erra muito e
 * quem pratica pouco e acerta — e essa diferença é informação verdadeira
 * sobre a pessoa.
 */

/** §2 — a tabela de contagem. Nenhum outro lugar declara valor de XP. */
export const XP = {
  // Academy — estudo
  LESSON_COMPLETED: 10,
  CHECKPOINT_CORRECT: 5,
  ACTIVITY_COMPLETED: 15,
  MOCK_EXAM_COMPLETED: 25,
  FINAL_EXAM_PASSED: 100,
  FINAL_EXAM_FAILED: 25,
  COURSE_COMPLETED_XP: 250,
  CERTIFICATE_ISSUED: 50,

  // Practice — treino
  EXERCISE_CORRECT: 25,
  EXERCISE_WRONG: 5,
  ROUND_COMPLETED: 20,
  DAILY_MISSION: 50,
  /** Missão que pede sessão inteira sem erro, ou a volta em outro período. */
  DAILY_MISSION_MAJOR: 75,
  DAILY_GOAL: 30,

  // Atlas — exploração
  WORK_ANALYZED_XP: 40,
  TOUR_COMPLETED_XP: 120,

  // Comunidade
  TOPIC_OPENED: 10,
  REPLY_POSTED: 5,
  REPLY_ACCEPTED: 30,
  REVIEW_WRITTEN: 15,
} as const;

/**
 * Errar também paga (§2).
 *
 * Cinco contra vinte e cinco: acertar vale muito mais, mas quem errou
 * praticou. XP mede esforço, e zerar o erro ensinaria a não tentar o que
 * ainda não se domina — que é justamente o que mais precisa ser tentado.
 */
export const EXERCISES_PER_ROUND = 10;

/** §6 — ninguém entra na liga antes disto. */
export const COMPLETIONS_TO_JOIN_LEAGUE = 3;

/**
 * Nível.
 *
 * Cada nível custa mais que o anterior — `100 × n`. É a única progressão que
 * não precisa de tabela nova a cada faixa, e mantém o nível como leitura de
 * esforço acumulado, não de mérito: ninguém *perde* nível.
 */
export const BASE_LEVEL_COST = 100;

export interface LevelInfo {
  nivel: number;
  /** Quanto do nível atual já foi vencido. */
  xpInLevel: number;
  /** Quanto o nível atual custa por inteiro. */
  levelXp: number;
}

export function levelCost(nivel: number): number {
  return BASE_LEVEL_COST * nivel;
}

export function levelOf(totalXp: number): LevelInfo {
  let nivel = 1;
  let restante = Math.max(0, Math.floor(totalXp));

  while (restante >= levelCost(nivel)) {
    restante -= levelCost(nivel);
    nivel += 1;
  }

  return { nivel, xpInLevel: restante, levelXp: levelCost(nivel) };
}

/**
 * O que uma lição do Practice rende.
 *
 * A rodada só paga o bônus quando de fato teve dez exercícios **e** terminou.
 * Pagar o bônus a quem saiu no meio seria pagar por rodada que não houve.
 */
export function lessonXp(lesson: LessonInProgress): number {
  const porResposta =
    lesson.correct * XP.EXERCISE_CORRECT + lesson.wrong * XP.EXERCISE_WRONG;

  const rodadaInteira =
    isLessonComplete(lesson) && lesson.queue.length >= EXERCISES_PER_ROUND
      ? XP.ROUND_COMPLETED
      : 0;

  return porResposta + rodadaInteira;
}

/**
 * Score da lição — qualidade, e não esforço.
 *
 * `null` quando não houve resposta: é diferente de zero por cento. A tela
 * precisa distinguir "ainda não praticou" de "errou tudo", e foi confundir os
 * dois que fez o perfil anunciar 86% de precisão a quem nunca tocou.
 */
export function lessonScore(lesson: LessonInProgress): number | null {
  const p = accuracy(lesson);
  return p === null ? null : Math.round(p * 10);
}
