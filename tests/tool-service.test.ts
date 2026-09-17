import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToolService } from '../src/services/tool/tool.service';
import { ToolSdk } from '../src/services/tool/tool.sdk';
import { EngineGateway } from '../src/adapters/engines/gateway/engine-gateway';
import { EntitlementService } from '../src/infrastructure/entitlements/entitlement-service';
import { AnalyticsService } from '../src/infrastructure/telemetry/analytics-service';
import { AuthService } from '../src/services/application/auth.service';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { PersistentUserRepository } from '../src/repositories/user.repository';
import { PersistentProfileRepository } from '../src/repositories/profile.repository';
import { EngineExecutionStatus } from '../src/contracts/tool-contracts';
import { UserRole, AppMode } from '../src/domain/types';

describe('Tool UI -> Tool SDK -> Tool Service -> Engine Adapter Flow', () => {
  let toolSdkInstance: ToolSdk;
  let auth: AuthService;

  beforeEach(async () => {
    const memStorage = new MemoryStorageAdapter();
    const userRepo = new PersistentUserRepository(memStorage);
    const profileRepo = new PersistentProfileRepository(memStorage);
    auth = new AuthService(userRepo, profileRepo, memStorage);

    // `getActiveSession()` revalida a sessão contra a autoridade a cada
    // chamada e FALHA FECHADA quando o servidor não responde — é o
    // comportamento correto, e sem este stub nenhum serviço a jusante
    // consegue operar em teste unitário. Aqui a autoridade confirma a
    // sessão e devolve a outorga administrativa.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({ data: { admin: { isAdmin: true, level: 100, capabilities: [] } } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );

    // Não existe mais `login()` com e-mail: a autenticação é federada e
    // verificada no servidor. Para um teste unitário de ferramentas,
    // injetamos diretamente uma sessão já autenticada no armazenamento.
    const now = Math.floor(Date.now() / 1000);
    const user = await userRepo.save({
      id: 'usr_test_admin',
      googleSubject: 'sub_test_admin',
      email: 'identidade.teste@exemplo.org',
      name: 'Identidade de Teste',
      primaryRole: UserRole.ADMIN,
      assignedRoles: [UserRole.ADMIN, UserRole.ALUNO],
      isEmailVerified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await memStorage.setItem('current_auth_session', {
      user,
      profile: { userId: user.id, displayName: user.name, mode: AppMode.TRADITIONAL, updatedAt: new Date().toISOString() },
      capabilities: [],
      entitlements: [],
      mode: AppMode.TRADITIONAL,
      accessToken: 'test-session-token',
      expiresAt: new Date((now + 3600) * 1000).toISOString(),
      isAdmin: true,
      adminCapabilities: [],
    });

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

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
