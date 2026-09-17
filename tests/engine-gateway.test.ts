import { describe, it, expect } from 'vitest';
import { EngineGateway } from '../src/adapters/engines/gateway/engine-gateway';
import { EngineExecutionStatus, EngineImplementationType } from '../src/contracts/tool-contracts';

describe('Engine Gateway & Adapters', () => {
  it('inicializa com os 4 motores padrão e reporta status saudável', async () => {
    const gateway = new EngineGateway();
    const report = await gateway.getHealthReport();

    expect(report.allHealthy).toBe(true);
    expect(report.audioEngine.status).toBe(EngineExecutionStatus.READY);
    expect(report.theoryEngine.status).toBe(EngineExecutionStatus.READY);
    expect(report.scoreEngine.status).toBe(EngineExecutionStatus.READY);
    expect(report.practiceEngine.status).toBe(EngineExecutionStatus.READY);
  });

  it('permite registrar um novo adapter sem afetar a assinatura de consumo', async () => {
    const gateway = new EngineGateway();

    // Mock an external Python engine adapter
    const pythonScoreAdapter = {
      engineName: 'PythonRemoteScoreEngine',
      implementationType: EngineImplementationType.PYTHON_REMOTE_MICROSERVICE,
      getHealth: async () => ({ status: EngineExecutionStatus.READY, latencyMs: 25 }),
      validateScore: async () => ({ isValid: true, errors: [] }),
      exportToMusicXml: async () => '<xml>remote</xml>',
    };

    gateway.registerScoreEngine(pythonScoreAdapter);
    const report = await gateway.getHealthReport();

    expect(report.scoreEngine.name).toBe('PythonRemoteScoreEngine');
    expect(report.scoreEngine.type).toBe(EngineImplementationType.PYTHON_REMOTE_MICROSERVICE);
    expect(report.scoreEngine.latencyMs).toBe(25);
  });
});
