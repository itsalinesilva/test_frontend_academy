import {
  ToolExecutionRequest,
  ToolExecutionResult,
  EngineExecutionStatus,
} from '../../contracts/tool-contracts';
import { engineGateway, EngineGateway } from '../../adapters/engines/gateway/engine-gateway';
import { entitlementService, EntitlementService } from '../../infrastructure/entitlements/entitlement-service';
import { analyticsService, AnalyticsService } from '../../infrastructure/telemetry/analytics-service';
import { UserCapability } from '../../domain/types';
import { authService, AuthService } from '../application/auth.service';
import { EngineAdapterError } from '../../domain/errors';
import { logger } from '../../infrastructure/logging/logger';

export class ToolService {
  private gateway: EngineGateway;
  private entitlements: EntitlementService;
  private analytics: AnalyticsService;
  private auth: AuthService;

  constructor(
    gateway: EngineGateway = engineGateway,
    entitlements: EntitlementService = entitlementService,
    analytics: AnalyticsService = analyticsService,
    auth: AuthService = authService
  ) {
    this.gateway = gateway;
    this.entitlements = entitlements;
    this.analytics = analytics;
    this.auth = auth;
  }

  public async executeTunerAnalysis(buffer: Float32Array, sampleRate: number): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const session = await this.auth.getActiveSession();
    this.entitlements.assertCapability(session?.user || null, UserCapability.USE_TUNER);

    try {
      const adapter = this.gateway.getAudioEngine();
      const result = await adapter.detectPitch(buffer, sampleRate);
      const durationMs = Date.now() - startTime;

      await this.analytics.trackToolUsage('tuner', durationMs, 'SUCCESS');

      return {
        toolId: 'tuner_v1',
        status: EngineExecutionStatus.COMPLETED,
        executionDurationMs: durationMs,
        engineType: adapter.implementationType,
        confidenceScore: result?.clarity ?? 0,
        data: result,
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      logger.error('Falha na execução da ferramenta Afinador', 'ToolService', { err, durationMs });
      throw new EngineAdapterError('AudioEngine', err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  public async executeTheoryAnalysis(notes: string[]): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    try {
      const adapter = this.gateway.getTheoryEngine();
      const result = await adapter.analyzeChord(notes);
      const durationMs = Date.now() - startTime;

      return {
        toolId: 'theory_analyzer_v1',
        status: EngineExecutionStatus.COMPLETED,
        executionDurationMs: durationMs,
        engineType: adapter.implementationType,
        confidenceScore: 1.0,
        data: result,
      };
    } catch (err: unknown) {
      throw new EngineAdapterError('TheoryEngine', err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  public async executePracticeEvaluation(req: ToolExecutionRequest<{
    targetPitch: string;
    detectedPitch: string;
    targetBpm: number;
    recordedBpm: number;
    durationSeconds: number;
  }>): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const session = await this.auth.getActiveSession();
    this.entitlements.assertCapability(session?.user || null, UserCapability.SUBMIT_PRACTICE_ATTEMPT);

    try {
      const adapter = this.gateway.getPracticeEngine();
      const result = await adapter.evaluateAttempt(req.parameters);
      const durationMs = Date.now() - startTime;

      await this.analytics.trackToolUsage('practice_scoring', durationMs, 'SUCCESS');

      return {
        toolId: 'practice_evaluator_v1',
        status: EngineExecutionStatus.COMPLETED,
        executionDurationMs: durationMs,
        engineType: adapter.implementationType,
        confidenceScore: result.accuracyPercentage / 100,
        data: result,
      };
    } catch (err: unknown) {
      throw new EngineAdapterError('PracticeEngine', err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }
}

export const toolService = new ToolService();
