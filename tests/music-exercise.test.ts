import { describe, it, expect } from 'vitest';
import {
  ExerciseType,
  MusicExercise,
  LIVES_PER_LESSON,
  STREAK_FOR_COMBO,
  TAG_TEXT,
  requiresMicrophone,
  startLesson,
  currentExercise,
  answer,
  skip,
  isLessonComplete,
  queueReview,
  isInCombo,
  progress,
  accuracy,
} from '../src/domain/music-exercise';

/**
 * O laço da lição.
 *
 * A mecânica mais bem resolvida da referência é a que estes casos protegem:
 * **o erro não termina a lição**. O exercício errado volta mais tarde, na
 * mesma sessão, marcado como revisão — e a lição só fecha quando o que se
 * errou foi refeito.
 *
 * Isso não é punição: é repetição espaçada dentro da sessão. O erro vira a
 * matéria da própria lição.
 *
 * Mapeamento em `docs/parity/VOL2_ASTRA_DUOLINGO.md` §B9.5.
 */

const ex = (id: string, type = ExerciseType.IDENTIFY_BY_EAR): MusicExercise => ({
  id,
  type,
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
  startLesson(
    'lic_1',
    Array.from({ length: quantos }, (_, i) => ex(`e${i}`))
  );

describe('a lição começa inteira, e em zero', () => {
  it('começa com as cinco vidas e nenhum acerto', () => {
    const l = licaoDe(3);
    expect(l.lives).toBe(LIVES_PER_LESSON);
    expect(l.correct).toBe(0);
    expect(l.wrong).toBe(0);
    expect(l.streak).toBe(0);
  });

  it('a precisão é nula antes da primeira resposta', () => {
    // `null` é diferente de zero por cento: a tela precisa distinguir
    // "ainda não respondeu" de "errou tudo".
    expect(accuracy(licaoDe(3))).toBeNull();
  });

  it('o primeiro exercício da fila é o atual', () => {
    expect(currentExercise(licaoDe(3))?.id).toBe('e0');
  });
});

describe('o erro não termina a lição', () => {
  it('errar enfileira o exercício para refazer', () => {
    const l = answer(licaoDe(3), false);
    expect(l.toRedo).toEqual(['e0']);
    expect(l.wrong).toBe(1);
    expect(l.lives).toBe(LIVES_PER_LESSON - 1);
  });

  it('a lição NÃO fecha enquanto houver pendência', () => {
    let l = licaoDe(2);
    l = answer(l, false); // e0 errado
    l = answer(l, true); // e1 certo
    expect(l.index).toBe(2);
    expect(isLessonComplete(l), 'fechou com pendência aberta').toBe(false);
  });

  it('o errado volta ao fim da fila, marcado como revisão', () => {
    let l = licaoDe(2);
    l = answer(l, false);
    l = answer(l, true);
    l = queueReview(l);

    expect(l.queue).toHaveLength(3);
    expect(l.queue[2].id).toBe('e0');
    expect(l.queue[2].tag).toBe('REVIEW');
  });

  it('acertar na revisão tira o exercício da pendência, e a lição fecha', () => {
    let l = licaoDe(2);
    l = answer(l, false);
    l = answer(l, true);
    l = queueReview(l);
    l = answer(l, true); // refez o e0

    expect(l.toRedo).toEqual([]);
    expect(isLessonComplete(l)).toBe(true);
  });

  it('errar de novo na revisão mantém a pendência', () => {
    // Sem isto, um erro repetido sairia da fila e a lição fecharia com o
    // conteúdo ainda não aprendido.
    let l = licaoDe(1);
    l = answer(l, false);
    l = queueReview(l);
    l = answer(l, false);
    expect(l.toRedo).toEqual(['e0']);
  });

  it('o mesmo exercício não entra duas vezes na pendência', () => {
    let l = licaoDe(1);
    l = answer(l, false);
    l = queueReview(l);
    l = answer(l, false);
    expect(l.toRedo).toHaveLength(1);
  });

  it('preparar revisão sem pendência não muda nada', () => {
    let l = licaoDe(1);
    l = answer(l, true);
    expect(queueReview(l)).toBe(l);
  });
});

describe('as vidas acabam, e o estudo continua', () => {
  it('as vidas não ficam negativas', () => {
    /**
     * Ao chegarem a zero, o estudo NÃO trava — o que acumula a partir daí é
     * o índice de débito. Interromper quem está estudando é punir a
     * tentativa. Ver `76_PROGRESS_ECONOMY.md` §5.
     */
    let l = licaoDe(10);
    for (let i = 0; i < 8; i++) l = answer(l, false);
    expect(l.lives).toBe(0);
    expect(l.wrong).toBe(8);
  });

  it('com zero vidas ainda se responde', () => {
    let l = licaoDe(10);
    for (let i = 0; i < 6; i++) l = answer(l, false);
    l = answer(l, true);
    expect(l.correct).toBe(1);
  });
});

describe('combo de acertos', () => {
  it('a sequência cresce a cada acerto e zera ao errar', () => {
    let l = licaoDe(10);
    l = answer(l, true);
    l = answer(l, true);
    expect(l.streak).toBe(2);

    l = answer(l, false);
    expect(l.streak).toBe(0);
  });

  it('a melhor sequência da lição fica registrada', () => {
    let l = licaoDe(10);
    for (let i = 0; i < 4; i++) l = answer(l, true);
    l = answer(l, false);
    l = answer(l, true);

    expect(l.bestStreak).toBe(4);
    expect(l.streak).toBe(1);
  });

  it('o combo acende a partir do limiar declarado', () => {
    // É o que muda a cor da barra de progresso, como na referência.
    let l = licaoDe(10);
    for (let i = 0; i < STREAK_FOR_COMBO - 1; i++) l = answer(l, true);
    expect(isInCombo(l)).toBe(false);

    l = answer(l, true);
    expect(isInCombo(l)).toBe(true);
  });

  it('errar apaga o combo', () => {
    let l = licaoDe(10);
    for (let i = 0; i < STREAK_FOR_COMBO; i++) l = answer(l, true);
    l = answer(l, false);
    expect(isInCombo(l)).toBe(false);
  });
});

describe('pular não pune, mas também não acerta', () => {
  it('pular não consome vida nem conta erro', () => {
    const l = skip(licaoDe(3));
    expect(l.lives).toBe(LIVES_PER_LESSON);
    expect(l.wrong).toBe(0);
    expect(l.correct).toBe(0);
  });

  it('pular quebra a sequência', () => {
    // Não seria honesto manter o combo de quem não respondeu.
    let l = licaoDe(3);
    l = answer(l, true);
    l = skip(l);
    expect(l.streak).toBe(0);
  });

  it('pular não enfileira para revisão', () => {
    // Quem pulou não errou: não há erro a corrigir.
    expect(skip(licaoDe(3)).toRedo).toEqual([]);
  });
});

describe('progresso e precisão', () => {
  it('o progresso vai de zero a um', () => {
    let l = licaoDe(4);
    expect(progress(l)).toBe(0);
    l = answer(l, true);
    expect(progress(l)).toBe(0.25);
  });

  it('entrar em revisão faz a barra recuar — e isso é honesto', () => {
    /**
     * A fila cresce, então a fração cai. Mostrar 100% e depois pedir mais
     * exercícios seria pior: a barra passaria a mentir justamente quando a
     * pessoa achasse que tinha acabado.
     */
    let l = licaoDe(2);
    l = answer(l, false);
    l = answer(l, true);
    const antes = progress(l);

    l = queueReview(l);
    expect(progress(l)).toBeLessThan(antes);
  });

  it('a precisão é a fração de acertos sobre respondidas', () => {
    let l = licaoDe(4);
    l = answer(l, true);
    l = answer(l, false);
    l = answer(l, true);
    l = answer(l, true);
    expect(accuracy(l)).toBe(75);
  });

  it('pular não entra na conta da precisão', () => {
    let l = licaoDe(3);
    l = answer(l, true);
    l = skip(l);
    expect(accuracy(l)).toBe(100);
  });
});

describe('os tipos de exercício', () => {
  it('há tipo que a referência não tem: tocar, cantar e bater o ritmo', () => {
    /**
     * Clicar na alternativa certa prova que a pessoa RECONHECE. Tocar a nota
     * certa prova que ela SABE. É onde a plataforma deixa de ser "Duolingo de
     * música" e passa a ser outra coisa.
     */
    expect(requiresMicrophone(ExerciseType.PLAY)).toBe(true);
    expect(requiresMicrophone(ExerciseType.SING)).toBe(true);
    expect(requiresMicrophone(ExerciseType.TAP_RHYTHM)).toBe(true);
  });

  it('os tipos de apontar não exigem microfone', () => {
    // A tela precisa saber antes de abrir, para não pedir permissão à toa.
    for (const t of [
      ExerciseType.READ_NOTATION,
      ExerciseType.IDENTIFY_BY_EAR,
      ExerciseType.MATCH_PAIRS,
      ExerciseType.POINT_ON_FINGERBOARD,
    ]) {
      expect(requiresMicrophone(t), t).toBe(false);
    }
  });

  it('toda etiqueta tem texto legível', () => {
    for (const [chave, texto] of Object.entries(TAG_TEXT)) {
      expect(texto.length, chave).toBeGreaterThan(6);
    }
  });

  it('a etiqueta de revisão diz o que aconteceu, e não só que é revisão', () => {
    // "Corrija o erro de antes" situa; "Revisão" não diz de quê.
    expect(TAG_TEXT.REVIEW).toMatch(/erro/i);
  });
});

describe('o exercício se explica depois de respondido', () => {
  it('todo exercício traz explicação com conteúdo', () => {
    // É a parte que ensina. Sem ela, acertar e errar informam o mesmo: nada.
    const e = ex('e1');
    expect(e.explanation.length).toBeGreaterThan(25);
  });

  it('a alternativa correta está entre as oferecidas', () => {
    const e = ex('e1');
    for (const id of e.correctIds) {
      expect(e.choices.some((a) => a.id === id)).toBe(true);
    }
  });
});
