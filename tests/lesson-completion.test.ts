import { describe, it, expect } from 'vitest';
import {
  CompletionContext,
  STREAK_GOALS,
  shouldOfferStreakGoal,
  daysToStreakGoal,
  completionSequence,
} from '../src/domain/lesson-completion';
import {
  MusicExercise,
  ExerciseType,
  STREAK_FOR_COMBO,
  startLesson,
  responder,
  queueReview,
} from '../src/domain/music-exercise';
import { COMPLETIONS_TO_JOIN_LEAGUE } from '../src/domain/progress-economy';

/**
 * O encerramento da lição.
 *
 * A regra que estes casos guardam é uma só: **nenhuma tela de conquista sem
 * conquista**. Não existe "Ofensiva: 0 dias" nem "Melhor sequência: 1".
 *
 * Uma tela comemorando o que não aconteceu ensina a pessoa a pular a
 * sequência inteira — e aí a conquista real, quando vier, também será pulada.
 */

const ex = (id: string): MusicExercise => ({
  id,
  type: ExerciseType.IDENTIFY_BY_EAR,
  tag: 'PRACTICE',
  band: 'FOUNDATION',
  prompt: 'Ouça e identifique o intervalo',
  choices: [
    { id: 'a', label: '3ª maior' },
    { id: 'b', label: '5ª justa' },
  ],
  correctIds: ['b'],
  explanation: 'Sete semitons — a proporção 3:2 que torna a quinta consonante.',
});

const licaoDe = (quantos: number) =>
  startLesson('lic', Array.from({ length: quantos }, (_, i) => ex(`e${i}`)));

/** Uma lição terminada, com o resultado que se pedir. */
const terminada = (correct: number, wrong = 0) => {
  let l = licaoDe(correct + wrong);
  for (let i = 0; i < correct; i++) l = responder(l, true);
  for (let i = 0; i < wrong; i++) l = responder(l, false);
  // Refaz o que errou, senão a lição não fecha.
  for (let i = 0; i < wrong; i++) {
    l = queueReview(l);
    l = responder(l, true);
  }
  return l;
};

const contexto = (parcial: Partial<CompletionContext> = {}): CompletionContext => ({
  xpBefore: 5000,
  streakDays: 4,
  sustainedDayNow: false,
  metDailyGoalNow: false,
  completionsBefore: 40,
  ...parcial,
});

const chaves = (l = terminada(3), c = contexto()) =>
  completionSequence(l, c).map((q) => q.chave);

describe('quem saiu no meio não colheu', () => {
  it('lição inacabada não encerra', () => {
    let l = licaoDe(5);
    l = responder(l, true);
    expect(completionSequence(l, contexto())).toEqual([]);
  });

  it('lição com erro ainda não refeito não encerra', () => {
    // A pendência de revisão mantém a lição aberta — ver exercicio-musical.
    let l = licaoDe(2);
    l = responder(l, false);
    l = responder(l, true);
    expect(completionSequence(l, contexto())).toEqual([]);
  });
});

describe('nenhuma tela de conquista sem conquista', () => {
  it('a lição mais simples rende só experiência e precisão', () => {
    expect(chaves()).toEqual(['XP', 'ACCURACY']);
  });

  it('sequência curta não vira tela', () => {
    expect(chaves(terminada(STREAK_FOR_COMBO - 1))).not.toContain('SEQUENCE');
  });

  it('sequência a partir do limiar vira tela', () => {
    expect(chaves(terminada(STREAK_FOR_COMBO))).toContain('SEQUENCE');
  });

  it('ofensiva não repete quando o dia já estava sustentado', () => {
    // Mostrar "4 dias" a cada lição do mesmo dia é ruído, não conquista.
    expect(chaves(terminada(3), contexto({ sustainedDayNow: false }))).not.toContain(
      'STREAK'
    );
  });

  it('ofensiva aparece quando foi esta lição que sustentou o dia', () => {
    expect(chaves(terminada(3), contexto({ sustainedDayNow: true }))).toContain('STREAK');
  });

  it('meta do dia só aparece quando se cumpriu agora', () => {
    expect(chaves(terminada(3), contexto({ metDailyGoalNow: false }))).not.toContain(
      'DAILY_GOAL'
    );
    expect(chaves(terminada(3), contexto({ metDailyGoalNow: true }))).toContain('DAILY_GOAL');
  });

  it('nível só aparece quando se subiu de nível', () => {
    // 5000 de XP com mais algumas dezenas não vira nível novo.
    expect(chaves(terminada(3), contexto({ xpBefore: 5000 }))).not.toContain('LEVEL');
    // A um passo de fechar o nível 1, qualquer acerto já basta.
    expect(chaves(terminada(3), contexto({ xpBefore: 99 }))).toContain('LEVEL');
  });

  it('toda conquista tem valor e legenda — nenhuma tela muda', () => {
    const tudo = completionSequence(
      terminada(STREAK_FOR_COMBO),
      contexto({
        xpBefore: 99,
        sustainedDayNow: true,
        metDailyGoalNow: true,
        completionsBefore: COMPLETIONS_TO_JOIN_LEAGUE - 1,
      })
    );
    expect(tudo.length).toBeGreaterThan(4);
    for (const q of tudo) {
      expect(q.valor.length, q.chave).toBeGreaterThan(0);
      expect(q.legenda.length, q.chave).toBeGreaterThan(20);
    }
  });
});

describe('a entrada na liga é notícia uma vez só', () => {
  it('a conclusão que completa o mínimo anuncia a entrada', () => {
    expect(
      chaves(terminada(3), contexto({ completionsBefore: COMPLETIONS_TO_JOIN_LEAGUE - 1 }))
    ).toContain('LEAGUE_ENTRY');
  });

  it('antes do mínimo, não anuncia', () => {
    expect(chaves(terminada(3), contexto({ completionsBefore: 0 }))).not.toContain(
      'LEAGUE_ENTRY'
    );
  });

  it('depois de já estar na liga, não anuncia de novo', () => {
    expect(
      chaves(terminada(3), contexto({ completionsBefore: COMPLETIONS_TO_JOIN_LEAGUE }))
    ).not.toContain('LEAGUE_ENTRY');
  });
});

describe('a ordem vai do que se fez para o que mudou', () => {
  it('experiência vem antes de nível, ofensiva e liga', () => {
    /**
     * Ir do geral ao particular faria a conquista maior chegar antes de a
     * pessoa saber por quê.
     */
    const ordem = chaves(
      terminada(3),
      contexto({ xpBefore: 99, sustainedDayNow: true, completionsBefore: 2 })
    );
    expect(ordem.indexOf('XP')).toBe(0);
    expect(ordem.indexOf('LEVEL')).toBeGreaterThan(ordem.indexOf('ACCURACY'));
    expect(ordem.indexOf('LEAGUE_ENTRY')).toBe(ordem.length - 1);
  });
});

describe('a experiência conta o erro', () => {
  it('a legenda diz quantos acertos e quantos erros houve', () => {
    const [xp] = completionSequence(terminada(3, 2), contexto());
    expect(xp.legenda).toMatch(/erro/i);
  });

  it('lição sem erro nenhum não fala de erro', () => {
    const [xp] = completionSequence(terminada(4), contexto());
    expect(xp.legenda).not.toMatch(/\d+ wrong/);
  });
});

describe('a meta de ofensiva é escolhida, não imposta', () => {
  it('as metas oferecidas são de prazo crescente', () => {
    expect([...STREAK_GOALS]).toEqual([7, 14, 30]);
  });

  it('não se propõe meta no primeiro dia', () => {
    // Pedir compromisso a quem ainda não sabe se vai voltar.
    expect(shouldOfferStreakGoal(1, null)).toBe(false);
  });

  it('propõe-se a quem já voltou uma vez', () => {
    expect(shouldOfferStreakGoal(2, null)).toBe(true);
  });

  it('não se insiste com quem já escolheu', () => {
    expect(shouldOfferStreakGoal(9, 7)).toBe(false);
  });

  it('sem meta, não há distância para meta nenhuma', () => {
    // A tela não deve inventar uma meta só para ter o que mostrar.
    expect(daysToStreakGoal(5, null)).toBeNull();
  });

  it('a distância para a meta não fica negativa', () => {
    expect(daysToStreakGoal(9, 7)).toBe(0);
    expect(daysToStreakGoal(3, 7)).toBe(4);
  });
});
