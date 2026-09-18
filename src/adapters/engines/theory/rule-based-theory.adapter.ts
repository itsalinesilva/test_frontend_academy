import {
  TheoryEngineAdapter,
  IntervalAnalysisResult,
  ChordAnalysisResult,
  ScaleGenerationResult,
} from './theory-engine.interface';
import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';
import { SIMPLE_INTERVALS, absolutePitchOf, pitchClassOf } from '../../../domain/pitch';

/**
 * Motor de teoria musical baseado em regras.
 *
 * CORREÇÕES DE 2026-09-17 — três defeitos encontrados ao ligar o motor aos
 * laboratórios da lição. Todos produziam informação musicalmente FALSA, que
 * seria apresentada a um estudante como verdade:
 *
 *  1. `analyzeInterval` descartava a oitava. `noteToPitchClass` removia o
 *     dígito da nota, de modo que C3→C4 devolvia "Uníssono Perfeito, 0
 *     semitons" em vez de "Oitava Justa, 12". A lição sobre a razão 2:1
 *     exibiria exatamente o oposto do que ensina.
 *
 *  2. `keySignatureSharpsOrFlats` era `0` fixo. Sol maior aparecia como
 *     "sem acidentes", quando tem um sustenido.
 *
 *  3. `analyzeChord` devolvia sempre `ROOT_POSITION` e tomava a primeira
 *     nota como fundamental. Qualquer inversão era identificada errado.
 */
export class RuleBasedTheoryEngineAdapter implements TheoryEngineAdapter {
  public readonly engineName = 'RuleBasedTheoryEngine';
  public readonly implementationType = EngineImplementationType.NODE_AUTHORITY;

  public async getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }> {
    return { status: EngineExecutionStatus.READY, latencyMs: 1 };
  }

  /** Delegado a `domain/pitch.ts`, que e a fonte unica. */
  private noteToPitchClass(note: string): number {
    return pitchClassOf(note);
  }

  /** Índice absoluto em semitons. `null` quando a nota não traz oitava. */
  private noteToAbsolute(note: string): number | null {
    return absolutePitchOf(note);
  }

  /**
   * Analisa o intervalo entre duas alturas.
   *
   * Quando ambas trazem oitava, a distância é absoluta — e portanto
   * intervalos compostos (acima da oitava) são reconhecidos como tais.
   * Sem oitava, reduz-se à classe de altura, como antes.
   */
  public async analyzeInterval(note1: string, note2: string): Promise<IntervalAnalysisResult> {
    const a = this.noteToAbsolute(note1);
    const b = this.noteToAbsolute(note2);

    const semitones =
      a !== null && b !== null
        ? Math.abs(b - a)
        : (this.noteToPitchClass(note2) - this.noteToPitchClass(note1) + 12) % 12;

    if (semitones <= 12) {
      const e = SIMPLE_INTERVALS[semitones];
      return { semitones, quality: e.quality, number: e.number, name: e.name, isConsonant: e.isConsonant };
    }

    // Intervalo composto: reduz à oitava e acrescenta 7 graus por oitava.
    const octaves = Math.floor(semitones / 12);
    const reduced = semitones % 12;
    const base = SIMPLE_INTERVALS[reduced];
    const compoundNumber = base.number + 7 * octaves;

    const ORDINALS: Record<number, string> = {
      8: 'Oitava', 9: 'Nona', 10: 'Décima', 11: 'Décima Primeira', 12: 'Décima Segunda',
      13: 'Décima Terceira', 14: 'Décima Quarta', 15: 'Décima Quinta',
    };
    const QUALITY_PT: Record<IntervalAnalysisResult['quality'], string> = {
      PERFECT: 'Justa', MAJOR: 'Maior', MINOR: 'Menor',
      DIMINISHED: 'Diminuta', AUGMENTED: 'Aumentada',
    };
    const ordinal = ORDINALS[compoundNumber] || `${compoundNumber}ª`;

    return {
      semitones,
      quality: base.quality,
      number: compoundNumber,
      name: `${ordinal} ${QUALITY_PT[base.quality]}`,
      isConsonant: base.isConsonant,
    };
  }

  /**
   * Identifica a tríade e sua inversão.
   *
   * Testa as três rotações possíveis das classes de altura: aquela que
   * forma terças empilhadas revela a fundamental real. A inversão decorre
   * de qual nota está no BAIXO — isto é, a mais grave do conjunto.
   */
  public async analyzeChord(notes: string[]): Promise<ChordAnalysisResult> {
    if (notes.length < 3) {
      return { root: notes[0] || 'C', quality: 'MAJOR', inversion: 'ROOT_POSITION', notes };
    }

    // O baixo é a nota mais grave quando há oitava; senão, a primeira dada.
    const withAbs = notes.map((n) => ({ note: n, abs: this.noteToAbsolute(n) }));
    const allHaveOctave = withAbs.every((x) => x.abs !== null);
    const bass = allHaveOctave
      ? withAbs.reduce((lo, x) => (x.abs! < lo.abs! ? x : lo)).note
      : notes[0];

    const uniquePcs = [...new Set(notes.map((n) => this.noteToPitchClass(n)))].sort((x, y) => x - y);

    const TRIADS: Array<{
      shape: [number, number];
      quality: ChordAnalysisResult['quality'];
    }> = [
      { shape: [4, 7], quality: 'MAJOR' },
      { shape: [3, 7], quality: 'MINOR' },
      { shape: [3, 6], quality: 'DIMINISHED' },
      { shape: [4, 8], quality: 'AUGMENTED' },
    ];

    if (uniquePcs.length === 3) {
      for (let r = 0; r < 3; r++) {
        const rootPc = uniquePcs[r];
        const i1 = (uniquePcs[(r + 1) % 3] - rootPc + 12) % 12;
        const i2 = (uniquePcs[(r + 2) % 3] - rootPc + 12) % 12;
        const match = TRIADS.find((t) => t.shape[0] === i1 && t.shape[1] === i2);
        if (!match) continue;

        const rootNote = notes.find((n) => this.noteToPitchClass(n) === rootPc) || notes[0];
        const bassPc = this.noteToPitchClass(bass);
        const bassInterval = (bassPc - rootPc + 12) % 12;

        const inversion: ChordAnalysisResult['inversion'] =
          bassInterval === 0
            ? 'ROOT_POSITION'
            : bassInterval === match.shape[0]
            ? 'FIRST_INVERSION'
            : 'SECOND_INVERSION';

        return { root: rootNote, quality: match.quality, inversion, notes };
      }
    }

    // Não é tríade reconhecível: devolve o que se sabe, sem inventar qualidade.
    return { root: bass, quality: 'MAJOR', inversion: 'ROOT_POSITION', notes };
  }

  /**
   * Armadura de clave pelo ciclo das quintas.
   * Positivo = sustenidos · negativo = bemóis.
   * A menor natural e a harmônica compartilham a armadura da relativa maior
   * (o sétimo grau elevado é acidente ocorrente, não vai na armadura).
   */
  private keySignatureFor(tonicPc: number, mode: 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR'): number {
    // Índice = classe de altura; valor = acidentes da tonalidade maior.
    const MAJOR_SIGNATURES: Record<number, number> = {
      0: 0,   // Dó
      7: 1,   // Sol
      2: 2,   // Ré
      9: 3,   // Lá
      4: 4,   // Mi
      11: 5,  // Si
      6: 6,   // Fá#
      1: 7,   // Dó#
      5: -1,  // Fá
      10: -2, // Si♭
      3: -3,  // Mi♭
      8: -4,  // Lá♭
    };
    // Menor: usa a armadura da relativa maior (tônica + 3 semitons).
    const referencePc = mode === 'MAJOR' ? tonicPc : (tonicPc + 3) % 12;
    return MAJOR_SIGNATURES[referencePc] ?? 0;
  }

  public async generateScale(
    tonic: string,
    mode: 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR'
  ): Promise<ScaleGenerationResult> {
    const tonicPc = this.noteToPitchClass(tonic);
    const signature = this.keySignatureFor(tonicPc, mode);

    // Grafia coerente com a armadura: tonalidades bemolizadas usam bemóis.
    const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const names = signature < 0 ? FLAT_NAMES : SHARP_NAMES;

    const STEPS: Record<typeof mode, number[]> = {
      MAJOR: [2, 2, 1, 2, 2, 2, 1],
      NATURAL_MINOR: [2, 1, 2, 2, 1, 2, 2],
      HARMONIC_MINOR: [2, 1, 2, 2, 1, 3, 1],
    };

    const notes: string[] = [names[tonicPc % 12]];
    let cur = tonicPc;
    for (const step of STEPS[mode]) {
      cur += step;
      notes.push(names[cur % 12]);
    }

    return { tonic, mode, notes, keySignatureSharpsOrFlats: signature };
  }
}
