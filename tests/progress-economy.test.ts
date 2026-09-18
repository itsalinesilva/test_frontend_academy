import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  XP,
  BASE_LEVEL_COST,
  COMPLETIONS_TO_JOIN_LEAGUE,
  EXERCISES_PER_ROUND,
  levelCost,
  levelOf,
  lessonXp,
  lessonScore,
} from '../src/domain/progress-economy';
import {
  MusicExercise,
  ExerciseType,
  startLesson,
  responder,
  pular,
} from '../src/domain/music-exercise';

/**
 * A economia de progresso.
 *
 * O documento §2 se declara a autoridade sobre quanto vale cada coisa. Até
 * agora ele existia só como prosa — e foi por isso que o perfil de prática
 * pôde anunciar 1920 de XP e nível 12 a quem nunca praticou, sem que nada
 * quebrasse.
 *
 * Estes casos guardam o que a prosa não guarda sozinha.
 */

const ex = (id: string): MusicExercise => ({
  id,
  tipo: ExerciseType.IDENTIFY_BY_EAR,
  tag: 'PRACTICE',
  faixa: 'FOUNDATION',
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

describe('errar também paga', () => {
  it('o erro vale menos que o acerto, mas não vale zero', () => {
    /**
     * XP mede ESFORÇO. Zerar o erro ensinaria a não tentar o que ainda não se
     * domina — que é justamente o que mais precisa ser tentado.
     */
    expect(XP.EXERCISE_WRONG).toBeGreaterThan(0);
    expect(XP.EXERCISE_WRONG).toBeLessThan(XP.EXERCISE_CORRECT);
  });

  it('uma lição toda errada ainda rende XP', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, false);
    expect(lessonXp(l)).toBe(4 * XP.EXERCISE_WRONG);
  });

  it('pular não rende nada — quem pulou não praticou', () => {
    let l = licaoDe(3);
    l = pular(l);
    l = pular(l);
    expect(lessonXp(l)).toBe(0);
  });
});

describe('o bônus de rodada é da rodada que houve', () => {
  it('dez exercícios terminados pagam o bônus', () => {
    let l = licaoDe(EXERCISES_PER_ROUND);
    for (let i = 0; i < EXERCISES_PER_ROUND; i++) l = responder(l, true);
    expect(lessonXp(l)).toBe(
      EXERCISES_PER_ROUND * XP.EXERCISE_CORRECT + XP.ROUND_COMPLETED
    );
  });

  it('sair no meio não paga bônus de rodada', () => {
    // Pagar por rodada que não houve seria pagar pela intenção.
    let l = licaoDe(EXERCISES_PER_ROUND);
    for (let i = 0; i < 4; i++) l = responder(l, true);
    expect(lessonXp(l)).toBe(4 * XP.EXERCISE_CORRECT);
  });

  it('lição curta não vira rodada só por terminar', () => {
    let l = licaoDe(3);
    for (let i = 0; i < 3; i++) l = responder(l, true);
    expect(lessonXp(l)).toBe(3 * XP.EXERCISE_CORRECT);
  });

  it('terminar com pendência de revisão ainda aberta não paga o bônus', () => {
    let l = licaoDe(EXERCISES_PER_ROUND);
    l = responder(l, false);
    for (let i = 1; i < EXERCISES_PER_ROUND; i++) l = responder(l, true);
    // O errado ainda não foi refeito: a rodada não fechou.
    expect(lessonXp(l)).toBe(
      XP.EXERCISE_WRONG + (EXERCISES_PER_ROUND - 1) * XP.EXERCISE_CORRECT
    );
  });
});

describe('nível', () => {
  it('começa em 1, com nada', () => {
    expect(levelOf(0)).toEqual({ nivel: 1, xpInLevel: 0, levelXp: BASE_LEVEL_COST });
  });

  it('cada nível custa mais que o anterior', () => {
    for (let n = 1; n < 20; n++) {
      expect(levelCost(n + 1)).toBeGreaterThan(levelCost(n));
    }
  });

  it('1920 de XP é nível 6 — e não 12, como o perfil já afirmou', () => {
    const n = levelOf(1920);
    expect(n.nivel).toBe(6);
    expect(n.xpInLevel).toBe(420);
    expect(n.levelXp).toBe(600);
  });

  it('o XP dentro do nível nunca alcança o custo do nível', () => {
    // Se alcançasse, a barra apareceria cheia sem subir de nível.
    for (const xp of [0, 1, 99, 100, 101, 299, 300, 5000, 12345]) {
      const n = levelOf(xp);
      expect(n.xpInLevel, `${xp} de XP`).toBeLessThan(n.levelXp);
      expect(n.xpInLevel).toBeGreaterThanOrEqual(0);
    }
  });

  it('nível nunca regride com mais XP', () => {
    let anterior = 0;
    for (let xp = 0; xp < 8000; xp += 37) {
      const n = levelOf(xp).nivel;
      expect(n).toBeGreaterThanOrEqual(anterior);
      anterior = n;
    }
  });

  it('XP negativo ou quebrado não derruba a conta', () => {
    expect(levelOf(-500).nivel).toBe(1);
    expect(levelOf(150.9).nivel).toBe(2);
  });
});

describe('score é qualidade, e ausência de prática não é zero', () => {
  it('sem resposta, não há score', () => {
    // `null` e 0 são coisas diferentes: "não praticou" e "errou tudo".
    expect(lessonScore(licaoDe(3))).toBeNull();
  });

  it('acertar tudo dá o score cheio', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, true);
    expect(lessonScore(l)).toBe(1000);
  });

  it('errar tudo dá zero, que é diferente de não ter score', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, false);
    expect(lessonScore(l)).toBe(0);
  });
});

describe('o documento e o código dizem o mesmo número', () => {
  /**
   * `76_ECONOMIA_DE_PROGRESSO.md` é a autoridade; este módulo é o único lugar
   * do código autorizado a repetir os números dela. Divergência silenciosa
   * entre os dois foi exatamente o que deixou o perfil mentir.
   */
  const doc = readFileSync(
    resolve(__dirname, '../docs/harness/76_ECONOMIA_DE_PROGRESSO.md'),
    'utf-8'
  );

  it('toda constante citada na tabela vale ali o que vale aqui', () => {
    const citadas = [...doc.matchAll(/\|\s*([^|]*?)\s*\|\s*(\d+)\s*\|[^|]*\|[^|]*\|[^|]*`XP\.([A-Z_]+)`/g)];
    expect(citadas.length, 'a tabela deixou de citar as constantes').toBeGreaterThan(8);

    for (const [, evento, valor, constante] of citadas) {
      expect(XP[constante as keyof typeof XP], `${evento} → XP.${constante}`).toBe(Number(valor));
    }
  });

  it('a regra de entrada na liga é a mesma dos dois lados', () => {
    expect(doc).toContain(`**${COMPLETIONS_TO_JOIN_LEAGUE} lições ou exercícios**`);
  });

  it('o custo do nível declarado no documento é o do código', () => {
    expect(doc).toContain(`**${BASE_LEVEL_COST} × n**`);
  });
});
