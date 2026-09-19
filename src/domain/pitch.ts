/**
 * Alturas — as primitivas que todo o resto usa.
 *
 * Isto estava trancado dentro de `RuleBasedTheoryEngineAdapter`, como campos
 * privados. Funcionava enquanto só o motor analisava; no momento em que o
 * gerador de exercícios precisou das mesmas tabelas, havia duas escolhas:
 * copiá-las ou extraí-las.
 *
 * Copiar teria produzido duas verdades sobre o que é uma terça maior. Elas
 * concordariam no começo e divergiriam na primeira correção feita só de um
 * lado — e o aluno veria o exercício dizer uma coisa e a análise dizer outra,
 * sem nada quebrar.
 *
 * Aqui é onde mora a resposta. O motor de teoria importa daqui, e o gerador
 * também.
 */

/** Classe de altura: dó = 0, dó♯ = 1, … si = 11. */
export type PitchClass = number;

export const PITCH_CLASS: Record<string, PitchClass> = {
  C: 0, 'C#': 1, DB: 1, D: 2, 'D#': 3, EB: 3, E: 4, 'E#': 5, FB: 4,
  F: 5, 'F#': 6, GB: 6, G: 7, 'G#': 8, AB: 8, A: 9, 'A#': 10, BB: 10,
  B: 11, 'B#': 0, CB: 11,
};

/** Os nomes em português, que é o que o aluno lê. */
export const NOTE_NAME_PT: Record<PitchClass, string> = {
  0: 'dó', 1: 'dó sustenido', 2: 'ré', 3: 'mi bemol', 4: 'mi', 5: 'fá',
  6: 'fá sustenido', 7: 'sol', 8: 'lá bemol', 9: 'lá', 10: 'si bemol', 11: 'si',
};

/** As sete naturais, na ordem da escala. */
export const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export const NATURAL_NAME_PT: Record<string, string> = {
  C: 'dó', D: 'ré', E: 'mi', F: 'fá', G: 'sol', A: 'lá', B: 'si',
};

export function pitchClassOf(note: string): PitchClass {
  const clean = note.trim().toUpperCase().replace(/-?\d+$/, '');
  return PITCH_CLASS[clean] ?? 0;
}

/** Índice absoluto em semitons. `null` quando a nota não traz oitava. */
export function absolutePitchOf(note: string): number | null {
  const m = note.trim().toUpperCase().match(/^([A-G][#B]?)(-?\d+)$/);
  if (!m) return null;
  const pc = PITCH_CLASS[m[1]];
  if (pc === undefined) return null;
  return (Number(m[2]) + 1) * 12 + pc;
}

/**
 * Frequência da nota, em hertz.
 *
 * Referência ajustável porque A=440 **não é universal**: repertório barroco
 * histórico usa 415, e um afinador que só conhece 440 é inútil para quem toca
 * com orquestra de época.
 */
export function frequencyOf(note: string, referenceHz = 440): number | null {
  const absolute = absolutePitchOf(note);
  if (absolute === null) return null;
  // A4 = 69 no índice absoluto usado aqui.
  return referenceHz * Math.pow(2, (absolute - 69) / 12);
}

export type IntervalQuality = 'PERFECT' | 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED';

export interface SimpleInterval {
  quality: IntervalQuality;
  /** O número: 1 para uníssono, 3 para terça, 5 para quinta. */
  number: number;
  /** Como se lê em português. */
  name: string;
  isConsonant: boolean;
}

/** Intervalos simples, do uníssono à oitava. */
export const SIMPLE_INTERVALS: Record<number, SimpleInterval> = {
  0: { quality: 'PERFECT', number: 1, name: 'Uníssono Perfeito', isConsonant: true },
  1: { quality: 'MINOR', number: 2, name: 'Segunda Menor', isConsonant: false },
  2: { quality: 'MAJOR', number: 2, name: 'Segunda Maior', isConsonant: false },
  3: { quality: 'MINOR', number: 3, name: 'Terça Menor', isConsonant: true },
  4: { quality: 'MAJOR', number: 3, name: 'Terça Maior', isConsonant: true },
  5: { quality: 'PERFECT', number: 4, name: 'Quarta Perfeita', isConsonant: true },
  6: { quality: 'DIMINISHED', number: 5, name: 'Trítono (Quinta Diminuta)', isConsonant: false },
  7: { quality: 'PERFECT', number: 5, name: 'Quinta Perfeita', isConsonant: true },
  8: { quality: 'MINOR', number: 6, name: 'Sexta Menor', isConsonant: true },
  9: { quality: 'MAJOR', number: 6, name: 'Sexta Maior', isConsonant: true },
  10: { quality: 'MINOR', number: 7, name: 'Sétima Menor', isConsonant: false },
  11: { quality: 'MAJOR', number: 7, name: 'Sétima Maior', isConsonant: false },
  12: { quality: 'PERFECT', number: 8, name: 'Oitava Justa', isConsonant: true },
};

export type ScaleMode = 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR';

/** Os passos de cada modo, em semitons a partir da tônica. */
export const SCALE_STEPS: Record<ScaleMode, number[]> = {
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  NATURAL_MINOR: [0, 2, 3, 5, 7, 8, 10],
  HARMONIC_MINOR: [0, 2, 3, 5, 7, 8, 11],
};

export const SCALE_NAME_PT: Record<ScaleMode, string> = {
  MAJOR: 'maior',
  NATURAL_MINOR: 'menor natural',
  HARMONIC_MINOR: 'menor harmônica',
};

export type ChordQuality = 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED' | 'DOMINANT_SEVENTH';

/** Os intervalos de cada tríade e tétrade, a partir da fundamental. */
export const CHORD_SHAPES: Record<ChordQuality, number[]> = {
  MAJOR: [0, 4, 7],
  MINOR: [0, 3, 7],
  DIMINISHED: [0, 3, 6],
  AUGMENTED: [0, 4, 8],
  DOMINANT_SEVENTH: [0, 4, 7, 10],
};

export const CHORD_NAME_PT: Record<ChordQuality, string> = {
  MAJOR: 'maior',
  MINOR: 'menor',
  DIMINISHED: 'diminuto',
  AUGMENTED: 'aumentado',
  DOMINANT_SEVENTH: 'com sétima da dominante',
};

/**
 * Valores de figura, em frações de semibreve.
 *
 * A figura é escrita; a duração em segundos depende do andamento, e por isso
 * não mora aqui.
 */
export interface NoteValue {
  id: string;
  name: string;
  /** Fração da semibreve: semínima = 1/4. */
  fraction: number;
}

export const NOTE_VALUES: readonly NoteValue[] = [
  { id: 'semibreve', name: 'semibreve', fraction: 1 },
  { id: 'minima', name: 'mínima', fraction: 1 / 2 },
  { id: 'seminima', name: 'semínima', fraction: 1 / 4 },
  { id: 'colcheia', name: 'colcheia', fraction: 1 / 8 },
  { id: 'semicolcheia', name: 'semicolcheia', fraction: 1 / 16 },
  { id: 'fusa', name: 'fusa', fraction: 1 / 32 },
] as const;

/**
 * Quantas alterações a armadura tem, e de que tipo.
 *
 * Positivo é sustenido, negativo é bemol — o ciclo de quintas. `0` é dó maior
 * ou lá menor, que não têm armadura.
 */
export function keySignatureOf(tonic: string, mode: ScaleMode): number {
  const pc = pitchClassOf(tonic);
  // Relativo menor está três semitons abaixo do maior de mesma armadura.
  const majorPc = mode === 'MAJOR' ? pc : (pc + 3) % 12;
  const ORDER: Record<number, number> = {
    0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6,
    1: -5, 8: -4, 3: -3, 10: -2, 5: -1,
  };
  return ORDER[majorPc] ?? 0;
}
