import { describe, it, expect, beforeEach } from 'vitest';
import { ToolService } from '../src/services/tool/tool.service';
import { ToolSdk } from '../src/services/tool/tool.sdk';
import { EngineGateway } from '../src/adapters/engines/gateway/engine-gateway';
import { EntitlementService } from '../src/infrastructure/entitlements/entitlement-service';
import { AnalyticsService } from '../src/infrastructure/telemetry/analytics-service';
import { AuthService } from '../src/services/application/auth.service';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { PersistentUserRepository } from '../src/repositories/user.repository';
import { PersistentProfileRepository } from '../src/repositories/profile.repository';
import { FOUNDER_ADMIN_EMAILS } from '../src/domain/capabilities';
import { EngineExecutionStatus } from '../src/contracts/tool-contracts';

describe('Tool UI -> Tool SDK -> Tool Service -> Engine Adapter Flow', () => {
  let toolSdkInstance: ToolSdk;
  let auth: AuthService;

  beforeEach(async () => {
    const memStorage = new MemoryStorageAdapter();
    const userRepo = new PersistentUserRepository(memStorage);
    const profileRepo = new PersistentProfileRepository(memStorage);
    auth = new AuthService(userRepo, profileRepo, memStorage);

    // Login with founder
    await auth.login({ email: FOUNDER_ADMIN_EMAILS[0] });

    const gateway = new EngineGateway();
    const entitlements = new EntitlementService();
    const analytics = new AnalyticsService();
    const service = new ToolService(gateway, entitlements, analytics, auth);

    toolSdkInstance = new ToolSdk(service);
  });

  it('executa análise teórica de acordes através do Tool SDK', async () => {
    const result = await toolSdkInstance.analyzeChordTheory(['C', 'E', 'G']);

    expect(result.status).toBe(EngineExecutionStatus.COMPLETED);
    expect(result.toolId).toBe('theory_analyzer_v1');
    expect(result.confidenceScore).toBe(1.0);
    expect((result.data as { quality: string }).quality).toBe('MAJOR');
    expect((result.data as { root: string }).root).toBe('C');
  });

  it('avalia tentativa de prática através do Tool SDK', async () => {
    const result = await toolSdkInstance.evaluatePracticeAttempt({
      targetPitch: 'A4',
      detectedPitch: 'A4',
      targetBpm: 120,
      recordedBpm: 120,
      durationSeconds: 10,
    });

    expect(result.status).toBe(EngineExecutionStatus.COMPLETED);
    expect((result.data as { isPassing: boolean }).isPassing).toBe(true);
    expect((result.data as { accuracyPercentage: number }).accuracyPercentage).toBe(100);
  });
});
