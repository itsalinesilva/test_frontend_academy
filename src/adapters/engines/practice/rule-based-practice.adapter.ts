import {
  PracticeScoringEngineAdapter,
  PracticeAttemptInput,
  PracticeScoringResult,
} from './practice-scoring.interface';
import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export class RuleBasedPracticeScoringAdapter implements PracticeScoringEngineAdapter {
  public readonly engineName = 'RuleBasedPracticeScoringEngine';
  public readonly implementationType = EngineImplementationType.NODE_AUTHORITY;

  public async getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }> {
    return {
      status: EngineExecutionStatus.READY,
      latencyMs: 1,
    };
  }

  public async evaluateAttempt(input: PracticeAttemptInput): Promise<PracticeScoringResult> {
    const pitchMatch = input.targetPitch.trim().toUpperCase() === input.detectedPitch.trim().toUpperCase();
    const bpmDiff = Math.abs(input.targetBpm - input.recordedBpm);
    const rhythmScore = Math.max(0, 100 - bpmDiff * 3);

    const accuracy = pitchMatch ? Math.min(100, Math.round(0.7 * 100 + 0.3 * rhythmScore)) : Math.round(0.3 * rhythmScore);
    const isPassing = accuracy >= 70;

    let feedback = 'Excelente execução, afinação e precisão rítmica consistentes.';
    if (!pitchMatch) {
      feedback = `Afinação divergente: esperado ${input.targetPitch}, mas detectado ${input.detectedPitch}.`;
    } else if (bpmDiff > 5) {
      feedback = `Afinação precisa, mas o andamento variou em ${Math.round(bpmDiff)} BPM em relação ao alvo.`;
    }

    return {
      accuracyPercentage: accuracy,
      pitchDeviationCents: pitchMatch ? 0 : 100,
      rhythmStabilityScore: Math.round(rhythmScore),
      feedback,
      isPassing,
    };
  }
}
