import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export interface ScoreMeasure {
  number: number;
  timeSignature: string;
  clef: 'TREBLE' | 'BASS' | 'ALTO';
  keySignature: string;
  elements: Array<{
    type: 'NOTE' | 'REST';
    pitch?: string;
    duration: string; // '4n', '8n', '16n', etc.
  }>;
}

export interface ScoreData {
  id: string;
  title: string;
  composer: string;
  tempoBpm: number;
  measures: ScoreMeasure[];
}

export interface ScoreValidationResult {
  isValid: boolean;
  errors: Array<{ measureNumber: number; message: string }>;
}

export interface ScoreEngineAdapter {
  readonly engineName: string;
  readonly implementationType: EngineImplementationType;

  getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }>;
  validateScore(score: ScoreData): Promise<ScoreValidationResult>;
  exportToMusicXml(score: ScoreData): Promise<string>;
}
