// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Level, generateExercise, supportsLevel } from '../src/domain/exercise-generator';
import { Dimension } from '../src/domain/music-grammar';
import { MusicExercise } from '../src/domain/music-exercise';
import { absolutePitchOf, frequencyOf, keySignatureOf, NATURAL_NAME_PT } from '../src/domain/pitch';
import { FiguraDoExercicio } from '../src/ui/components/practice/FiguraDoExercicio';

/**
 * LAB-1 — A MÚSICA DAS QUINZE DIMENSÕES NOVAS ESTÁ CERTA?
 *
 * `nexo-das-perguntas.test.ts` confere a FORMA: resposta fora do enunciado,
 * figura presente, português. Não confere se a clave trocada dá mesmo aquela
 * nota, nem se a cadência é mesmo autêntica. Aqui cada resposta é REFEITA a
 * partir da figura, por conta própria, sem perguntar ao gerador.
 */

const SEMENTES = Array.from({ length: 150 }, (_, i) => i + 1);
const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const grau = (n: string) => Number(n.slice(-1)) * 7 + LETRAS.indexOf(n[0]);
const nome = (n: string) => {
  const m = /^([A-G])([#b]?)/.exec(n)!;
  return NATURAL_NAME_PT[m[1]] + ({ '#': ' sustenido', b: ' bemol', '': '' } as Record<string, string>)[m[2]];
};
const certa = (e: MusicExercise) => e.choices.find((c) => e.correctIds.includes(c.id))!.label;
const staff = (e: MusicExercise) => {
  if (e.figura?.kind !== 'STAFF') throw new Error(`${e.id}: esperava pauta`);
  return e.figura;
};

function cada(d: Dimension, fn: (e: MusicExercise, level: Level) => void) {
  for (const level of [Level.RECOGNIZE, Level.NAME]) {
    for (const s of SEMENTES) {
      const e = generateExercise(d, level, s);
      if (e) fn(e, level);
    }
  }
}

describe('leitura', () => {
  it('CLAVE: a resposta é a nota que a MESMA posição tem na outra clave', () => {
    const base: Record<string, number> = { treble: grau('E4'), bass: grau('G2') };
    cada(Dimension.CLEF, (e) => {
      const f = staff(e);
      const outra = f.clef === 'treble' ? 'bass' : 'treble';
      const g = base[outra] + (grau(f.notes[0]) - base[f.clef]);
      expect(certa(e)).toBe(NATURAL_NAME_PT[LETRAS[((g % 7) + 7) % 7]]);
    });
  });

  it('CLAVE: a leitura na clave errada está entre as alternativas — é o erro que ensina', () => {
    cada(Dimension.CLEF, (e) => {
      expect(e.choices.map((c) => c.label)).toContain(nome(staff(e).notes[0]));
    });
  });

  it('ALTERAÇÃO: a resposta é a nota escrita, com o acidente', () => {
    cada(Dimension.ACCIDENTAL, (e) => {
      expect(certa(e)).toBe(nome(staff(e).notes[0]));
      expect(staff(e).notes[0]).toMatch(/[#b]/);
    });
  });

  it('COMPASSO: as notas enchem exatamente um compasso da fórmula', () => {
    const vale = { whole: 4, half: 2, quarter: 1, eighth: 0.5 };
    cada(Dimension.TIME_SIGNATURE, (e) => {
      const f = staff(e);
      const [n, d] = f.timeSignature!.split('/').map(Number);
      const soma = f.duracoes!.reduce((a, x) => a + vale[x], 0);
      expect(soma).toBeCloseTo((n * 4) / d);
      expect(certa(e)).toMatch(n % 3 === 0 && d === 8 ? /composto/ : /simples/);
    });
  });

  it('RITMO: a célula enche EXATAMENTE o compasso de 2/4 — sem nota sobrando fora', () => {
    const vale = { whole: 4, half: 2, quarter: 1, eighth: 0.5 };
    cada(Dimension.RHYTHM, (e) => {
      const soma = staff(e).duracoes!.reduce((a, x) => a + vale[x], 0);
      expect(soma, `${certa(e)}: ${soma} tempos em 2/4`).toBe(2);
    });
  });

  it('RITMO: a síncope prolonga sobre o forte; o contratempo tem pausa no forte', () => {
    cada(Dimension.RHYTHM, (e) => {
      const f = staff(e);
      if (certa(e) === 'contratempo') expect(f.notes[0]).toBe('_');
      if (certa(e) === 'síncope') expect(f.duracoes!.slice(0, 2)).toEqual(['eighth', 'quarter']);
      expect(certa(e)).not.toBe('quiáltera');
    });
  });
});

describe('harmonia', () => {
  /** A escala maior de um tom, como classes de altura. */
  const doTom = (tonica: string) => {
    const t = absolutePitchOf(`${tonica}4`)! % 12;
    return new Set([0, 2, 4, 5, 7, 9, 11].map((s) => (t + s) % 12));
  };
  const tonicaDoPrompt = (p: string) => {
    const nomePt = /tom de (\S+) maior/.exec(p)![1];
    return Object.entries(NATURAL_NAME_PT).find(([, v]) => v === nomePt)![0];
  };

  it('FUNÇÃO: o acorde é diatônico ao tom, e a função bate com o grau', () => {
    const FUNCAO = ['tônica', 'subdominante', 'tônica', 'subdominante', 'dominante', 'tônica', 'dominante'];
    cada(Dimension.HARMONIC_FUNCTION, (e) => {
      const tonica = tonicaDoPrompt(e.prompt);
      const escala = doTom(tonica);
      const notas = staff(e).notes;
      for (const n of notas) expect(escala.has(absolutePitchOf(n)! % 12), `${n} fora de ${tonica}`).toBe(true);
      const g = (grau(notas[0]) - grau(`${tonica}4`) + 70) % 7;
      /** O terceiro grau é ambíguo (tônica ou dominante) e não é sorteado. */
      expect(g).not.toBe(2);
      expect(certa(e)).toBe(FUNCAO[g]);
    });
  });

  it('CADÊNCIA: dois acordes; autêntica e plagal terminam na tônica, a suspensiva na dominante', () => {
    cada(Dimension.CADENCE, (e) => {
      const f = staff(e);
      expect(f.grupos).toEqual([3, 3]);
      const tonica = tonicaDoPrompt(e.prompt);
      const raizFinal = (grau(f.notes[3]) - grau(`${tonica}4`) + 70) % 7;
      const raizInicial = (grau(f.notes[0]) - grau(`${tonica}4`) + 70) % 7;
      const esperado =
        raizInicial === 4 && raizFinal === 0
          ? 'autêntica'
          : raizInicial === 3 && raizFinal === 0
            ? 'plagal'
            : raizInicial === 0 && raizFinal === 4
              ? 'suspensiva'
              : raizInicial === 4 && raizFinal === 5
                ? 'deceptiva'
                : '?';
      expect(certa(e)).toBe(esperado);
    });
  });

  it('CONDUÇÃO: o movimento, refeito das notas, é o da resposta — e as vozes não se cruzam', () => {
    cada(Dimension.VOICE_LEADING, (e) => {
      const [g1, a1, g2, a2] = staff(e).notes.map(grau);
      expect(a1).toBeGreaterThan(g1);
      expect(a2, `${e.id}: as vozes se cruzaram`).toBeGreaterThan(g2);
      const dg = g2 - g1;
      const da = a2 - a1;
      const esperado =
        dg === 0 || da === 0
          ? 'movimento oblíquo'
          : Math.sign(dg) !== Math.sign(da)
            ? 'movimento contrário'
            : dg === da
              ? 'movimento paralelo'
              : 'movimento direto';
      expect(certa(e)).toBe(esperado);
    });
  });

  it('MODULAÇÃO: a resposta é vizinha do tom da tônica escrita, e nenhum distrator é', () => {
    cada(Dimension.MODULATION, (e) => {
      const tonica = staff(e).notes[0][0];
      const arm = keySignatureOf(tonica, 'MAJOR');
      const armaduraDe = (label: string) => {
        const [n, modo] = label.split(' ');
        const t = Object.entries(NATURAL_NAME_PT).find(([, v]) => v === n)![0];
        return keySignatureOf(t, modo === 'maior' ? 'MAJOR' : 'NATURAL_MINOR');
      };
      for (const c of e.choices) {
        const perto = Math.abs(armaduraDe(c.label) - arm) <= 1;
        expect(perto, `${c.label} em relação a ${tonica} maior`).toBe(c.label === certa(e));
      }
    });
  });
});

describe('transposição e acústica', () => {
  it('TRANSPOSIÇÃO: a resposta está exatamente à distância pedida da primeira nota', () => {
    const DIST: Record<string, number> = {
      'uma segunda maior acima': 2,
      'uma terça maior acima': 4,
      'uma quarta justa acima': 5,
      'uma quinta justa acima': 7,
    };
    cada(Dimension.TRANSPOSITION, (e) => {
      const d = Object.entries(DIST).find(([k]) => e.prompt.includes(k))![1];
      const primeira = absolutePitchOf(staff(e).notes[0])!;
      const alvo = (primeira + d) % 12;
      const resposta = certa(e);
      const [n, ...resto] = resposta.split(' ');
      const letra = Object.entries(NATURAL_NAME_PT).find(([, v]) => v === n)![0];
      const ac = resto.join(' ') === 'sustenido' ? 1 : resto.join(' ') === 'bemol' ? -1 : 0;
      expect((absolutePitchOf(`${letra}4`)! + ac + 12) % 12).toBe(alvo);
    });
  });

  it('ACÚSTICA: a nota aguda vibra (quase) n vezes a grave — o n da resposta', () => {
    const N: Record<string, number> = { segundo: 2, terceiro: 3, quarto: 4, quinto: 5, sexto: 6 };
    cada(Dimension.ACOUSTICS, (e) => {
      const [grave, agudo] = staff(e).notes;
      const razao = frequencyOf(agudo)! / frequencyOf(grave)!;
      const n = N[/o (\S+) harmônico/.exec(certa(e))![1]];
      /** Temperamento igual desvia a terça e a quinta em menos de 1%. */
      expect(Math.abs(razao - n) / n).toBeLessThan(0.01);
    });
  });

  it('ACÚSTICA de ouvido: toca a fundamental e o harmônico da resposta', () => {
    for (const s of SEMENTES) {
      const e = generateExercise(Dimension.ACOUSTICS, Level.EAR, s)!;
      const [f, h] = e.audio!.frequenciesHz;
      const N: Record<string, number> = { segundo: 2, terceiro: 3, quarto: 4, quinto: 5, sexto: 6 };
      expect(h / f).toBeCloseTo(N[/o (\S+) harmônico/.exec(certa(e))![1]]);
    }
  });

  it('ORNAMENTO: o trinado alterna só duas notas vizinhas; o arpejo sobe por terças', () => {
    cada(Dimension.ORNAMENT, (e) => {
      const g = staff(e).notes.map(grau);
      if (certa(e) === 'trinado') {
        expect(new Set(g).size).toBe(2);
        expect(Math.abs(g[1] - g[0])).toBe(1);
      }
      if (certa(e) === 'arpejo') expect([g[1] - g[0], g[2] - g[1]]).toEqual([2, 2]);
    });
  });
});

describe('sinais e ouvido', () => {
  it('o sinal impresso não é a resposta — a resposta é o que ele pede', () => {
    for (const d of [Dimension.TEMPO, Dimension.DYNAMICS, Dimension.EXPRESSION, Dimension.SPECIAL_NOTATION]) {
      cada(d, (e) => {
        expect(e.figura?.kind).toBe('SINAL');
        const texto = (e.figura as { texto: string }).texto;
        expect(certa(e).toLowerCase()).not.toBe(texto.toLowerCase());
      });
    }
  });

  it('o nível de ouvido existe só onde o motor de som é honesto', () => {
    const comOuvido = [Dimension.ACCIDENTAL, Dimension.ORNAMENT, Dimension.ACOUSTICS];
    const semOuvido = [Dimension.DYNAMICS, Dimension.TEMPO, Dimension.CADENCE, Dimension.CLEF];
    for (const d of comOuvido) expect(supportsLevel(d, Level.EAR), d).toBe(true);
    for (const d of semOuvido) expect(supportsLevel(d, Level.EAR), d).toBe(false);
  });
});

describe('🔴 toda figura nova é DESENHADA', () => {
  it.each([
    Dimension.CLEF,
    Dimension.ACCIDENTAL,
    Dimension.TIME_SIGNATURE,
    Dimension.RHYTHM,
    Dimension.TEMPO,
    Dimension.DYNAMICS,
    Dimension.EXPRESSION,
    Dimension.HARMONIC_FUNCTION,
    Dimension.CADENCE,
    Dimension.VOICE_LEADING,
    Dimension.ORNAMENT,
    Dimension.MODULATION,
    Dimension.TRANSPOSITION,
    Dimension.SPECIAL_NOTATION,
    Dimension.ACOUSTICS,
  ])('%s', (d) => {
    const e = generateExercise(d, Level.NAME, 7)!;
    const { container } = render(<FiguraDoExercicio figura={e.figura!} />);
    if (e.figura!.kind === 'SINAL') {
      expect(container.querySelector('[data-sinal]')!.textContent).toBe(e.figura!.texto);
    } else if (e.figura!.kind === 'STAFF') {
      const desenhadas = container.querySelectorAll('[data-nota]').length;
      expect(desenhadas, 'nota que sumiu no caminho').toBe(e.figura!.notes.length);
    }
  });
});
