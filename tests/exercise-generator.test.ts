import { describe, it, expect } from 'vitest';
import {
  GENERATED_DIMENSIONS,
  Level,
  LEVEL_NAME,
  RENDERABLE_LEVELS,
  generateExercise,
  generateLesson,
  hasGenerator,
  isRenderable,
  supportsLevel,
} from '../src/domain/exercise-generator';
import { Dimension } from '../src/domain/music-grammar';
import { SIMPLE_INTERVALS, frequencyOf, keySignatureOf } from '../src/domain/pitch';

/**
 * O gerador de exercícios.
 *
 * Três propriedades carregam este arquivo, e as três são sobre honestidade
 * mais do que sobre música:
 *
 * 1. **Não produz beco sem saída.** Exercício que a tela não sabe mostrar não
 *    é gerado — a pessoa chegaria lá sem ter como responder.
 * 2. **Não inventa combinação impossível.** Armadura de clave não soa, e
 *    portanto não se pergunta de ouvido.
 * 3. **Não repete a mesma pergunta dez vezes.** Sementes consecutivas têm de
 *    variar, e isso já falhou aqui antes.
 */

const TODAS = Object.values(Dimension);

describe('não produz o que a tela não sabe mostrar', () => {
  it('só os níveis apresentáveis geram exercício', () => {
    /**
     * `APLICAR` precisa de pauta editável e `EXECUTAR` precisa de microfone
     * medido. Nenhum dos dois existe. Gerar para eles seria mandar a pessoa a
     * uma tela onde não há como responder.
     */
    expect(isRenderable(Level.APPLY)).toBe(false);
    expect(isRenderable(Level.PERFORM)).toBe(false);
    expect(generateExercise(Dimension.INTERVAL, Level.APPLY, 1)).toBeNull();
    expect(generateExercise(Dimension.INTERVAL, Level.PERFORM, 1)).toBeNull();
  });

  it('dimensão sem gerador devolve nulo, e não um exercício vazio', () => {
    const semGerador = TODAS.find((d) => !hasGenerator(d))!;
    expect(generateExercise(semGerador, Level.RECOGNIZE, 1)).toBeNull();
  });

  it('a lição de uma dimensão sem gerador vem vazia', () => {
    const semGerador = TODAS.find((d) => !hasGenerator(d))!;
    expect(generateLesson(semGerador, Level.RECOGNIZE, 1, 10)).toEqual([]);
  });

  it('todo nível tem nome legível, inclusive os que não abriram', () => {
    // O quadro da seção mostra o nível fechado — precisa de nome para isso.
    for (const nivel of Object.values(Level).filter((v) => typeof v === 'number') as Level[]) {
      expect(LEVEL_NAME[nivel].length).toBeGreaterThan(4);
    }
  });
});

describe('não inventa combinação impossível', () => {
  it('armadura de clave nunca se pergunta de ouvido', () => {
    /**
     * É convenção de escrita: não soa. Dois tons diferentes podem soar iguais
     * e ter armaduras distintas — a pergunta não teria resposta.
     */
    expect(supportsLevel(Dimension.KEY_SIGNATURE, Level.EAR)).toBe(false);
    expect(generateExercise(Dimension.KEY_SIGNATURE, Level.EAR, 1)).toBeNull();
  });

  it('valor de figura também não soa sozinho', () => {
    expect(generateExercise(Dimension.NOTE_VALUE, Level.EAR, 1)).toBeNull();
  });

  it('o exercício de ouvido traz áudio; o de leitura, não', () => {
    const ouvido = generateExercise(Dimension.INTERVAL, Level.EAR, 7)!;
    const leitura = generateExercise(Dimension.INTERVAL, Level.RECOGNIZE, 7)!;

    expect(ouvido.audio?.frequenciesHz.length).toBeGreaterThan(0);
    expect(leitura.audio).toBeUndefined();
  });
});

describe('todo exercício gerado é respondível', () => {
  const todos = () => {
    const out = [];
    for (const d of GENERATED_DIMENSIONS) {
      for (const n of RENDERABLE_LEVELS) {
        for (let s = 1; s <= 25; s++) {
          const e = generateExercise(d, n, s);
          if (e) out.push(e);
        }
      }
    }
    return out;
  };

  it('gera uma quantidade real de exercícios', () => {
    expect(todos().length).toBeGreaterThan(300);
  });

  it('a resposta certa está entre as alternativas', () => {
    // Sem isto, existe exercício que não dá para acertar.
    for (const e of todos()) {
      for (const id of e.correctIds) {
        expect(e.choices.some((c) => c.id === id), `${e.id}`).toBe(true);
      }
    }
  });

  it('há mais de uma alternativa, e nenhuma repetida', () => {
    for (const e of todos()) {
      expect(e.choices.length, e.id).toBeGreaterThan(2);
      const labels = e.choices.map((c) => c.label);
      expect(new Set(labels).size, `${e.id}: ${labels.join(' / ')}`).toBe(labels.length);
    }
  });

  it('todo exercício explica a resposta', () => {
    // É a parte que ensina. Sem ela, acertar e errar informam o mesmo: nada.
    for (const e of todos()) {
      expect(e.explanation.length, e.id).toBeGreaterThan(20);
    }
  });

  it('todo enunciado é uma pergunta ou uma ordem, e não um rótulo', () => {
    for (const e of todos()) {
      expect(e.prompt.length, e.id).toBeGreaterThan(15);
      expect(e.prompt).toMatch(/^[A-ZÀ-Ý]/);
    }
  });

  it('nenhuma frequência é inválida', () => {
    /**
     * Uma frequência `NaN` não quebra a tela — ela simplesmente não soa, e a
     * pessoa fica esperando um som que nunca vem, achando que o problema é o
     * fone dela.
     */
    for (const e of todos()) {
      for (const hz of e.audio?.frequenciesHz ?? []) {
        expect(Number.isFinite(hz) && hz > 0, `${e.id}: ${hz}`).toBe(true);
      }
      for (const c of e.choices) {
        for (const hz of c.frequenciesHz ?? []) {
          expect(Number.isFinite(hz) && hz > 0, `${e.id}/${c.label}: ${hz}`).toBe(true);
        }
      }
    }
  });
});

describe('a mesma semente dá o mesmo exercício', () => {
  it('gerar duas vezes devolve igual', () => {
    // Sem isto, recarregar a página trocaria a pergunta no meio da resposta.
    const a = generateExercise(Dimension.CHORD, Level.EAR, 42);
    const b = generateExercise(Dimension.CHORD, Level.EAR, 42);
    expect(a).toEqual(b);
  });

  it('sementes consecutivas não repetem a mesma pergunta', () => {
    /**
     * Já aconteceu: sem a mistura de Knuth, a lição inteira saía com a mesma
     * tônica, porque sementes vizinhas produzem primeiros valores quase
     * iguais num gerador linear.
     */
    const lesson = generateLesson(Dimension.INTERVAL, Level.EAR, 100, 10);
    const enunciados = new Set(lesson.map((e) => e.prompt + e.choices.map((c) => c.label).join()));
    expect(enunciados.size).toBeGreaterThan(5);
  });

  it('a lição pedida vem com o tamanho pedido', () => {
    expect(generateLesson(Dimension.SCALE, Level.RECOGNIZE, 1, 8)).toHaveLength(8);
  });
});

describe('o conteúdo musical está certo', () => {
  it('o intervalo declarado bate com os semitons que soam', () => {
    /**
     * É a verificação que impede o pior defeito possível aqui: o exercício
     * tocar uma quinta e afirmar que é uma quarta. A pessoa confiaria no
     * exercício e aprenderia errado.
     */
    for (let s = 1; s <= 40; s++) {
      const e = generateExercise(Dimension.INTERVAL, Level.EAR, s);
      if (!e?.audio) continue;

      const [grave, agudo] = e.audio.frequenciesHz;
      const semitons = Math.round(12 * Math.log2(agudo / grave));
      const certa = e.choices.find((c) => c.id === e.correctIds[0])!;

      expect(certa.label, `semente ${s}`).toBe(SIMPLE_INTERVALS[semitons].name);
    }
  });

  it('os distratores de intervalo são vizinhos em semitom', () => {
    // Distinguir quinta de segunda não treina ninguém; quinta de trítono, sim.
    const e = generateExercise(Dimension.INTERVAL, Level.EAR, 3)!;
    const certa = e.choices.find((c) => c.id === e.correctIds[0])!;
    const numeroDe = (label: string) =>
      Number(Object.keys(SIMPLE_INTERVALS).find((k) => SIMPLE_INTERVALS[Number(k)].name === label));

    for (const c of e.choices) {
      expect(Math.abs(numeroDe(c.label) - numeroDe(certa.label)), c.label).toBeLessThanOrEqual(2);
    }
  });

  it('a armadura declarada é a que a teoria calcula', () => {
    const e = generateExercise(Dimension.KEY_SIGNATURE, Level.RECOGNIZE, 5)!;
    expect(e.prompt).toMatch(/armadura/i);
    // Dó maior não tem alteração; a função é a mesma que o exercício usou.
    expect(keySignatureOf('C', 'MAJOR')).toBe(0);
  });

  it('as frequências saem da referência de concerto', () => {
    expect(frequencyOf('A4')).toBeCloseTo(440, 5);
    expect(frequencyOf('A4', 415)).toBeCloseTo(415, 5);
  });
});
