// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Staff, NoteItem, alturaNaPauta } from '../../src/ui/components/domain/Staff';
import { FiguraDoExercicio } from '../../src/ui/components/practice/FiguraDoExercicio';
import { Level, generateExercise } from '../../src/domain/exercise-generator';
import { Dimension } from '../../src/domain/music-grammar';

/**
 * 🔴 A NOTA ESTÁ NA ALTURA DELA.
 *
 * A pauta desenhava TODA nota na linha do meio. "Que nota está escrita na
 * pauta?" mostrava a mesma cabeça de nota qualquer que fosse a resposta, e os
 * testes passavam: contavam cabeças, nunca a posição delas. Aqui a pergunta é
 * a de quem lê — está no lugar certo?
 */

const nota = (s: string, i = 0): NoteItem => {
  const m = /^([A-G])([#b]?)(\d)$/.exec(s)!;
  return {
    id: `${s}-${i}`,
    step: m[1] as NoteItem['step'],
    octave: Number(m[3]),
    duration: 'quarter',
    accidental: m[2] === '#' ? 'sharp' : m[2] === 'b' ? 'flat' : undefined,
  };
};

const yDe = (container: HTMLElement, n: string) =>
  Number(container.querySelector(`[data-nota="${n}"]`)!.getAttribute('data-y'));

describe('a regra das claves', () => {
  it('clave de sol: Mi4 na linha de baixo, Si4 no meio, Fá5 em cima', () => {
    expect(alturaNaPauta(nota('E4'), 'treble')).toBe(78);
    expect(alturaNaPauta(nota('B4'), 'treble')).toBe(54);
    expect(alturaNaPauta(nota('F5'), 'treble')).toBe(30);
  });

  it('clave de fá: Sol2 embaixo, Ré3 no meio, Lá3 em cima', () => {
    expect(alturaNaPauta(nota('G2'), 'bass')).toBe(78);
    expect(alturaNaPauta(nota('D3'), 'bass')).toBe(54);
    expect(alturaNaPauta(nota('A3'), 'bass')).toBe(30);
  });

  it('clave de dó: Dó4 na linha do meio', () => {
    expect(alturaNaPauta(nota('C4'), 'alto')).toBe(54);
  });

  it('🔴 a MESMA posição é outra nota em outra clave — é o que o exercício de nomear cobra', () => {
    expect(alturaNaPauta(nota('B4'), 'treble')).toBe(alturaNaPauta(nota('D3'), 'bass'));
  });
});

describe('o desenho', () => {
  it('🔴 notas diferentes ficam em alturas diferentes, e a mais aguda fica mais alto', () => {
    const { container } = render(<Staff notes={['C4', 'E4', 'G4', 'C5'].map(nota)} />);
    const ys = ['C4', 'E4', 'G4', 'C5'].map((n) => yDe(container, n));
    expect(new Set(ys).size).toBe(4);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
  });

  it('Dó4 na clave de sol leva LINHA SUPLEMENTAR — sem ela, seria Lá3', () => {
    const { container } = render(<Staff notes={[nota('C4')]} />);
    const grupo = container.querySelector('[data-nota="C4"]')!;
    const suplementar = [...grupo.querySelectorAll('line')].filter(
      (l) => Number(l.getAttribute('y1')) === 90 && l.getAttribute('y1') === l.getAttribute('y2')
    );
    expect(suplementar).toHaveLength(1);
  });

  it('o sustenido e o bemol aparecem escritos', () => {
    const { container } = render(<Staff notes={[nota('F#4'), nota('Bb4', 1)]} />);
    expect(container.querySelector('[data-nota="F#4"] text')!.textContent).toBe('♯');
    expect(container.querySelector('[data-nota="Bb4"] text')!.textContent).toBe('♭');
  });

  it('🔴 o acorde sai EMPILHADO — em fila, seria um arpejo', () => {
    const { container } = render(<Staff acorde notes={['C4', 'E4', 'G4'].map(nota)} />);
    const xs = [...container.querySelectorAll('ellipse')].map((e) => e.getAttribute('cx'));
    expect(new Set(xs).size).toBe(1);
  });

  it('as barras de compasso vêm da duração das notas', () => {
    const quatro = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map(nota);
    const { container } = render(<Staff notes={quatro} timeSignature="4/4" />);
    const barras = [...container.querySelectorAll('svg > g:not([data-nota]) > line')];
    expect(barras, 'oito semínimas em 4/4 são dois compassos').toHaveLength(2);
  });
});

describe('🔴 as perguntas do Laboratório têm resposta pela leitura', () => {
  it('a nota do exercício é desenhada na altura da RESPOSTA', () => {
    for (const seed of [1, 2, 3, 5, 8, 13, 21, 34]) {
      const e = generateExercise(Dimension.NOTE, Level.RECOGNIZE, seed)!;
      if (e.figura?.kind !== 'STAFF') continue;
      const escrita = e.figura.notes[0];
      const { container, unmount } = render(<FiguraDoExercicio figura={e.figura} />);
      const [, letra, , oitava] = /^([A-G])([#b]?)(\d)$/.exec(escrita)!;
      expect(yDe(container, escrita)).toBe(
        alturaNaPauta({ step: letra as NoteItem['step'], octave: Number(oitava) }, e.figura.clef)
      );
      unmount();
    }
  });

  it('notas diferentes sorteadas saem em lugares diferentes da pauta', () => {
    const alturas = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const e = generateExercise(Dimension.NOTE, Level.RECOGNIZE, seed)!;
      if (e.figura?.kind !== 'STAFF' || e.figura.clef !== 'treble') continue;
      const { container, unmount } = render(<FiguraDoExercicio figura={e.figura} />);
      alturas.add(Number(container.querySelector('[data-y]')!.getAttribute('data-y')));
      unmount();
    }
    expect(alturas.size, 'a pauta mostra sempre o mesmo lugar').toBeGreaterThan(3);
  });

  it('o acorde do exercício sai empilhado', () => {
    const e = generateExercise(Dimension.CHORD, Level.RECOGNIZE, 1)!;
    expect(e.figura).toMatchObject({ kind: 'STAFF', simultaneas: true });
    const { container } = render(<FiguraDoExercicio figura={e.figura!} />);
    const xs = [...container.querySelectorAll('ellipse')].map((el) => el.getAttribute('cx'));
    expect(new Set(xs).size).toBeLessThanOrEqual(2); // a segunda, quando há, vai para o outro lado da haste
  });
});
