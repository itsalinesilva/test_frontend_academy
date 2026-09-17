import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export interface PitchDetectionResult {
  pitchHz: number;
  noteName: string;
  centsDeviation: number;
  clarity: number;
}

export interface AudioBufferAnalysisRequest {
  sampleRate: number;
  channelData: Float32Array;
  windowSize?: number;
}

export interface AudioEngineAdapter {
  readonly engineName: string;
  readonly implementationType: EngineImplementationType;

  getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }>;
  detectPitch(buffer: Float32Array, sampleRate: number): Promise<PitchDetectionResult | null>;
  generateReferenceTone(frequencyHz: number, durationSeconds: number): Promise<AudioBuffer | null>;
}
