import { describe, it, expect } from 'vitest';
import { RuleBasedTheoryEngineAdapter } from '../src/adapters/engines/theory/rule-based-theory.adapter';

describe('Theory Engine Adapter (Edinburgh Lectures 1-2 Basis)', () => {
  const adapter = new RuleBasedTheoryEngineAdapter();

  it('calcula o intervalo de Quinta Perfeita (7 semitons) e Quarta Perfeita (5 semitons)', async () => {
    const fifth = await adapter.analyzeInterval('C', 'G');
    expect(fifth.semitones).toBe(7);
    expect(fifth.quality).toBe('PERFECT');
    expect(fifth.number).toBe(5);
    expect(fifth.isConsonant).toBe(true);

    const fourth = await adapter.analyzeInterval('C', 'F');
    expect(fourth.semitones).toBe(5);
    expect(fourth.quality).toBe('PERFECT');
    expect(fourth.number).toBe(4);
  });

  it('calcula intervalo de Terça Maior (4 semitons) e Terça Menor (3 semitons)', async () => {
    const majorThird = await adapter.analyzeInterval('C', 'E');
    expect(majorThird.semitones).toBe(4);
    expect(majorThird.quality).toBe('MAJOR');

    const minorThird = await adapter.analyzeInterval('A', 'C');
    expect(minorThird.semitones).toBe(3);
    expect(minorThird.quality).toBe('MINOR');
  });

  it('identifica corretamente tríade Maior (C - E - G) e tríade Menor (A - C - E)', async () => {
    const cMajor = await adapter.analyzeChord(['C', 'E', 'G']);
    expect(cMajor.quality).toBe('MAJOR');
    expect(cMajor.root).toBe('C');

    const aMinor = await adapter.analyzeChord(['A', 'C', 'E']);
    expect(aMinor.quality).toBe('MINOR');
    expect(aMinor.root).toBe('A');
  });

  it('gera escala de Dó Maior seguindo a fórmula T-T-st-T-T-T-st', async () => {
    const cMajorScale = await adapter.generateScale('C', 'MAJOR');
    expect(cMajorScale.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']);
  });
});
