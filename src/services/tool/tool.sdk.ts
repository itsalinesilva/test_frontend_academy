import { toolService, ToolService } from './tool.service';
import { ToolExecutionResult } from '../../contracts/tool-contracts';

/**
 * Tool SDK - Clean Client-facing SDK for Tool UIs
 * Decouples any Tool UI component from backend engines and adapters.
 */
export class ToolSdk {
  private service: ToolService;

  constructor(service: ToolService = toolService) {
    this.service = service;
  }

  public async analyzeAudioPitch(buffer: Float32Array, sampleRate: number): Promise<ToolExecutionResult> {
    return this.service.executeTunerAnalysis(buffer, sampleRate);
  }

  public async analyzeChordTheory(notes: string[]): Promise<ToolExecutionResult> {
    return this.service.executeTheoryAnalysis(notes);
  }

  public async evaluatePracticeAttempt(params: {
    targetPitch: string;
    detectedPitch: string;
    targetBpm: number;
    recordedBpm: number;
    durationSeconds: number;
  }): Promise<ToolExecutionResult> {
    return this.service.executePracticeEvaluation({
      toolId: 'practice_evaluator_v1',
      userId: 'client_active_user',
      timestamp: new Date().toISOString(),
      parameters: params,
    });
  }
}

export const toolSdk = new ToolSdk();
