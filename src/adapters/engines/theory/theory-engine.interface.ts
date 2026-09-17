import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export interface IntervalAnalysisResult {
  semitones: number;
  quality: 'PERFECT' | 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED';
  number: number;
  name: string;
  isConsonant: boolean;
}

export interface ChordAnalysisResult {
  root: string;
  quality: 'MAJOR' | 'MINOR' | 'DIMINISHED' | 'AUGMENTED';
  inversion: 'ROOT_POSITION' | 'FIRST_INVERSION' | 'SECOND_INVERSION';
  notes: string[];
  romanNumeral?: string;
}

export interface ScaleGenerationResult {
  tonic: string;
  mode: string;
  notes: string[];
  keySignatureSharpsOrFlats: number;
}

export interface TheoryEngineAdapter {
  readonly engineName: string;
  readonly implementationType: EngineImplementationType;

  getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }>;
  analyzeInterval(note1: string, note2: string): Promise<IntervalAnalysisResult>;
  analyzeChord(notes: string[]): Promise<ChordAnalysisResult>;
  generateScale(tonic: string, mode: 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR'): Promise<ScaleGenerationResult>;
}
