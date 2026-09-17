import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export interface PracticeAttemptInput {
  targetPitch: string;
  detectedPitch: string;
  targetBpm: number;
  recordedBpm: number;
  durationSeconds: number;
}

export interface PracticeScoringResult {
  accuracyPercentage: number;
  pitchDeviationCents: number;
  rhythmStabilityScore: number;
  feedback: string;
  isPassing: boolean;
}

export interface PracticeScoringEngineAdapter {
  readonly engineName: string;
  readonly implementationType: EngineImplementationType;

  getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }>;
  evaluateAttempt(input: PracticeAttemptInput): Promise<PracticeScoringResult>;
}
