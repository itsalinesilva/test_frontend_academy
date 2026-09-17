import {
  TheoryEngineAdapter,
  IntervalAnalysisResult,
  ChordAnalysisResult,
  ScaleGenerationResult,
} from './theory-engine.interface';
import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export class RuleBasedTheoryEngineAdapter implements TheoryEngineAdapter {
  public readonly engineName = 'RuleBasedTheoryEngine';
  public readonly implementationType = EngineImplementationType.NODE_AUTHORITY;

  public async getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }> {
    return {
      status: EngineExecutionStatus.READY,
      latencyMs: 1,
    };
  }

  private noteToPitchClass(note: string): number {
    const clean = note.trim().toUpperCase().replace(/\d+$/, '');
    const map: Record<string, number> = {
      C: 0,
      'C#': 1,
      DB: 1,
      D: 2,
      'D#': 3,
      EB: 3,
      E: 4,
      F: 5,
      'F#': 6,
      GB: 6,
      G: 7,
      'G#': 8,
      AB: 8,
      A: 9,
      'A#': 10,
      BB: 10,
      B: 11,
    };
    return map[clean] ?? 0;
  }

  public async analyzeInterval(note1: string, note2: string): Promise<IntervalAnalysisResult> {
    const p1 = this.noteToPitchClass(note1);
    const p2 = this.noteToPitchClass(note2);
    const semitones = (p2 - p1 + 12) % 12;

    const intervalTable: Record<
      number,
      { quality: 'PERFECT' | 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED'; number: number; name: string; isConsonant: boolean }
    > = {
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
    };

    const entry = intervalTable[semitones] || {
      quality: 'PERFECT',
      number: 1,
      name: 'Intervalo Desconhecido',
      isConsonant: false,
    };

    return {
      semitones,
      quality: entry.quality,
      number: entry.number,
      name: entry.name,
      isConsonant: entry.isConsonant,
    };
  }

  public async analyzeChord(notes: string[]): Promise<ChordAnalysisResult> {
    if (notes.length < 3) {
      return {
        root: notes[0] || 'C',
        quality: 'MAJOR',
        inversion: 'ROOT_POSITION',
        notes,
      };
    }

    const pcs = notes.map((n) => this.noteToPitchClass(n));
    const root = notes[0];
    const diff1 = (pcs[1] - pcs[0] + 12) % 12;
    const diff2 = (pcs[2] - pcs[0] + 12) % 12;

    let quality: 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED' = 'MAJOR';
    if (diff1 === 4 && diff2 === 7) {
      quality = 'MAJOR';
    } else if (diff1 === 3 && diff2 === 7) {
      quality = 'MINOR';
    } else if (diff1 === 3 && diff2 === 6) {
      quality = 'DIMINISHED';
    } else if (diff1 === 4 && diff2 === 8) {
      quality = 'AUGMENTED';
    }

    return {
      root,
      quality,
      inversion: 'ROOT_POSITION',
      notes,
    };
  }

  public async generateScale(
    tonic: string,
    mode: 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR'
  ): Promise<ScaleGenerationResult> {
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startIdx = this.noteToPitchClass(tonic);

    const majorSteps = [2, 2, 1, 2, 2, 2, 1];
    const natMinorSteps = [2, 1, 2, 2, 1, 2, 2];
    const harmMinorSteps = [2, 1, 2, 2, 1, 3, 1];

    const steps =
      mode === 'MAJOR' ? majorSteps : mode === 'HARMONIC_MINOR' ? harmMinorSteps : natMinorSteps;

    const scaleNotes: string[] = [];
    let cur = startIdx;
    scaleNotes.push(chromatic[cur % 12]);

    for (let i = 0; i < 7; i++) {
      cur += steps[i];
      scaleNotes.push(chromatic[cur % 12]);
    }

    return {
      tonic,
      mode,
      notes: scaleNotes,
      keySignatureSharpsOrFlats: 0,
    };
  }
}
