import {
  LessonInProgress,
  STREAK_FOR_COMBO,
  isLessonComplete,
  precisao,
} from './music-exercise';
import {
  COMPLETIONS_TO_JOIN_LEAGUE,
  XP,
  levelOf,
  lessonXp,
} from './progress-economy';

/**
 * O que se mostra quando a lição acaba.
 *
 * A referência encerra em etapas — uma conquista por tela, e não um painel
 * com seis números. A razão é que cada tela dá tempo de a conquista *chegar*;
 * um painel único faz todas competirem, e nenhuma é lida.
 *
 * A REGRA DURA
 * ------------
 * **Nenhuma tela de conquista sem conquista.** Não existe "Ofensiva: 0 dias"
 * nem "Melhor sequência: 1". Uma tela comemorando o que não aconteceu ensina
 * a pessoa a pular a sequência inteira — e aí a conquista real, quando vier,
 * também será pulada.
 *
 * Por isso este módulo **decide**, e a tela só desenha o que ele devolveu. Se
 * a lista vier com dois itens, são duas telas.
 */

export type AchievementKey =
  | 'XP'
  | 'ACCURACY'
  | 'SEQUENCE'
  | 'LEVEL'
  | 'STREAK'
  | 'DAILY_GOAL'
  | 'LEAGUE_ENTRY';

export interface Achievement {
  chave: AchievementKey;
  /** O nome da coisa. */
  titulo: string;
  /** O número, já formatado — é o que a pessoa lê primeiro. */
  valor: string;
  /** Uma linha dizendo o que aquilo significa. Nunca vazia. */
  legenda: string;
}

export interface CompletionContext {
  /** XP acumulado antes desta lição — para saber se ela fez subir de nível. */
  xpBefore: number;
  /** Dias de ofensiva depois desta lição. */
  streakDays: number;
  /** Esta lição foi o que sustentou o dia, ou o dia já estava sustentado? */
  sustainedDayNow: boolean;
  /** A meta do dia se cumpriu com esta lição? */
  metDailyGoalNow: boolean;
  /** Quantas lições ou exercícios a pessoa já havia concluído antes desta. */
  completionsBefore: number;
}

/**
 * A sequência de telas do encerramento, em ordem.
 *
 * A ordem não é decorativa: começa no que a lição rendeu — que é o que a
 * pessoa acabou de fazer — e termina no que mudou de lugar no mundo dela
 * (nível, ofensiva, liga). Ir do geral ao particular faria a conquista maior
 * chegar antes de a pessoa saber por quê.
 *
 * Lição não concluída não encerra: quem saiu no meio não colheu.
 */
export function completionSequence(
  licao: LessonInProgress,
  contexto: CompletionContext
): Achievement[] {
  if (!isLessonComplete(licao)) return [];

  const conquistas: Achievement[] = [];
  const ganho = lessonXp(licao);

  conquistas.push({
    chave: 'XP',
    titulo: 'Experiência',
    valor: `+${ganho} XP`,
    legenda:
      licao.wrong > 0
        ? `${licao.correct} acertos e ${licao.wrong} erros — o erro também conta, porque você praticou.`
        : 'Cada resposta certa vale mais, e nenhuma tentativa vale zero.',
  });

  const acerto = precisao(licao);
  if (acerto !== null) {
    conquistas.push({
      chave: 'ACCURACY',
      titulo: 'Precisão',
      valor: `${acerto}%`,
      legenda:
        acerto === 100
          ? 'Lição inteira sem um erro.'
          : 'Proporção de acertos entre o que você respondeu — pular não entra na conta.',
    });
  }

  /** Sequência só é sequência a partir do limiar; "1 seguido" não é notícia. */
  if (licao.bestStreak >= STREAK_FOR_COMBO) {
    conquistas.push({
      chave: 'SEQUENCE',
      titulo: 'Sequência',
      valor: `${licao.bestStreak} seguidos`,
      legenda: 'Foi a maior corrida de acertos desta lição.',
    });
  }

  const antes = levelOf(contexto.xpBefore);
  const agora = levelOf(contexto.xpBefore + ganho);
  if (agora.nivel > antes.nivel) {
    conquistas.push({
      chave: 'LEVEL',
      titulo: 'Novo nível',
      valor: `Nível ${agora.nivel}`,
      legenda: `O próximo custa ${agora.levelXp} de experiência.`,
    });
  }

  /** Só se esta lição sustentou o dia: repetir a ofensiva a cada lição é ruído. */
  if (contexto.sustainedDayNow) {
    conquistas.push({
      chave: 'STREAK',
      titulo: 'Ofensiva',
      valor: contexto.streakDays === 1 ? '1 dia' : `${contexto.streakDays} dias`,
      legenda:
        contexto.streakDays === 1
          ? 'Começou hoje. Volte amanhã e vira dois.'
          : 'Dias seguidos de estudo. Um dia inteiro sem praticar zera.',
    });
  }

  if (contexto.metDailyGoalNow) {
    conquistas.push({
      chave: 'DAILY_GOAL',
      titulo: 'Meta do dia',
      valor: `+${XP.DAILY_GOAL} XP`,
      legenda: 'Você cumpriu o que tinha combinado consigo para hoje.',
    });
  }

  /** A entrada na liga acontece uma vez, e é notícia uma vez. */
  const conclusoesAgora = contexto.completionsBefore + 1;
  if (
    contexto.completionsBefore < COMPLETIONS_TO_JOIN_LEAGUE &&
    conclusoesAgora >= COMPLETIONS_TO_JOIN_LEAGUE
  ) {
    conquistas.push({
      chave: 'LEAGUE_ENTRY',
      titulo: 'Você entrou na liga',
      valor: 'Bronze',
      legenda: 'A classificação é por experiência da semana, de segunda a domingo.',
    });
  }

  return conquistas;
}

/** §3 — a pessoa escolhe a própria meta de constância. */
export const STREAK_GOALS = [7, 14, 30] as const;
export type StreakGoal = (typeof STREAK_GOALS)[number];

/**
 * Convém propor a meta agora?
 *
 * Só quem já tem ofensiva viva e ainda não escolheu meta. Propor no primeiro
 * dia é pedir compromisso a quem ainda não sabe se vai voltar; propor a quem
 * já escolheu é insistir.
 */
export function shouldOfferStreakGoal(
  streakDays: number,
  metaAtual: StreakGoal | null
): boolean {
  return metaAtual === null && streakDays >= 2;
}

/**
 * Quanto falta para a meta.
 *
 * `null` quando não há meta — a tela não deve inventar uma para ter o que
 * mostrar.
 */
export function daysToStreakGoal(
  streakDays: number,
  meta: StreakGoal | null
): number | null {
  if (meta === null) return null;
  return Math.max(0, meta - streakDays);
}
