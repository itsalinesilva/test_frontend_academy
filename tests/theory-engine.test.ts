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

/**
 * REGRESSÕES DE 2026-09-17.
 *
 * Três defeitos encontrados ao ligar o motor aos laboratórios da lição.
 * Todos produziam informação musicalmente FALSA, apresentada ao estudante
 * como verdade — o pior tipo de defeito num produto acadêmico.
 */
describe('Theory Engine — regressões de correção musical', () => {
  const engine = new RuleBasedTheoryEngineAdapter();

  it('reconhece a OITAVA, em vez de reduzi-la a uníssono', async () => {
    // O motor descartava o dígito da oitava: C3→C4 devolvia
    // "Uníssono Perfeito, 0 semitons". A lição sobre a razão 2:1 exibiria
    // exatamente o oposto do que ensina.
    const r = await engine.analyzeInterval('C3', 'C4');
    expect(r.semitones).toBe(12);
    expect(r.number).toBe(8);
    expect(r.name).toBe('Oitava Justa');
    expect(r.isConsonant).toBe(true);
  });

  it('reconhece intervalos compostos acima da oitava', async () => {
    const nona = await engine.analyzeInterval('C4', 'D5');
    expect(nona.semitones).toBe(14);
    expect(nona.number).toBe(9);
    expect(nona.name).toContain('Nona');

    const decima = await engine.analyzeInterval('C4', 'E5');
    expect(decima.semitones).toBe(16);
    expect(decima.number).toBe(10);
  });

  it('mantém a redução por classe de altura quando não há oitava', async () => {
    const r = await engine.analyzeInterval('C', 'G');
    expect(r.semitones).toBe(7);
    expect(r.name).toBe('Quinta Perfeita');
  });

  it('calcula a armadura de clave pelo ciclo das quintas', async () => {
    // Era `0` fixo: Sol maior aparecia como "sem acidentes".
    expect((await engine.generateScale('C', 'MAJOR')).keySignatureSharpsOrFlats).toBe(0);
    expect((await engine.generateScale('G', 'MAJOR')).keySignatureSharpsOrFlats).toBe(1);
    expect((await engine.generateScale('D', 'MAJOR')).keySignatureSharpsOrFlats).toBe(2);
    expect((await engine.generateScale('F', 'MAJOR')).keySignatureSharpsOrFlats).toBe(-1);
    expect((await engine.generateScale('Bb', 'MAJOR')).keySignatureSharpsOrFlats).toBe(-2);
  });

  it('dá à menor a armadura de sua relativa maior', async () => {
    expect((await engine.generateScale('A', 'NATURAL_MINOR')).keySignatureSharpsOrFlats).toBe(0);
    expect((await engine.generateScale('E', 'NATURAL_MINOR')).keySignatureSharpsOrFlats).toBe(1);
    // Na menor harmônica o 7º grau elevado é acidente ocorrente,
    // não entra na armadura.
    expect((await engine.generateScale('A', 'HARMONIC_MINOR')).keySignatureSharpsOrFlats).toBe(0);
  });

  it('grafa com bemóis as tonalidades bemolizadas', async () => {
    const fa = await engine.generateScale('F', 'MAJOR');
    expect(fa.notes).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F']);
    const sol = await engine.generateScale('G', 'MAJOR');
    expect(sol.notes).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G']);
  });

  it('identifica a INVERSÃO da tríade e a fundamental real', async () => {
    // Era sempre ROOT_POSITION, com a primeira nota tomada por fundamental.
    const fundamental = await engine.analyzeChord(['C4', 'E4', 'G4']);
    expect(fundamental.inversion).toBe('ROOT_POSITION');
    expect(fundamental.root).toBe('C4');

    const primeira = await engine.analyzeChord(['E4', 'G4', 'C5']);
    expect(primeira.inversion).toBe('FIRST_INVERSION');
    expect(primeira.quality).toBe('MAJOR');
    expect(engineRootPitchClass(primeira.root)).toBe(0); // fundamental é Dó

    const segunda = await engine.analyzeChord(['G3', 'C4', 'E4']);
    expect(segunda.inversion).toBe('SECOND_INVERSION');
    expect(engineRootPitchClass(segunda.root)).toBe(0);
  });

  it('identifica as tríades primárias de Dó maior', async () => {
    const i = await engine.analyzeChord(['C4', 'E4', 'G4']);
    const iv = await engine.analyzeChord(['F4', 'A4', 'C5']);
    const v = await engine.analyzeChord(['G4', 'B4', 'D5']);
    expect([i.quality, iv.quality, v.quality]).toEqual(['MAJOR', 'MAJOR', 'MAJOR']);
    expect([i.inversion, iv.inversion, v.inversion]).toEqual([
      'ROOT_POSITION', 'ROOT_POSITION', 'ROOT_POSITION',
    ]);
  });
});

/** Extrai a classe de altura de uma nota como "C5" para asserção. */
function engineRootPitchClass(note: string): number {
  const map: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  return map[note.replace(/-?\d+$/, '').toUpperCase()] ?? -1;
}
