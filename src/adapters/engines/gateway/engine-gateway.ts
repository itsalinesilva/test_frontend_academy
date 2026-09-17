import { AudioEngineAdapter } from '../audio/audio-engine.interface';
import { WebAudioEngineAdapter } from '../audio/web-audio.adapter';
import { TheoryEngineAdapter } from '../theory/theory-engine.interface';
import { RuleBasedTheoryEngineAdapter } from '../theory/rule-based-theory.adapter';
import { ScoreEngineAdapter } from '../score/score-engine.interface';
import { CanonicalScoreEngineAdapter } from '../score/canonical-score.adapter';
import { PracticeScoringEngineAdapter } from '../practice/practice-scoring.interface';
import { RuleBasedPracticeScoringAdapter } from '../practice/rule-based-practice.adapter';
import { EngineExecutionStatus } from '../../../contracts/tool-contracts';
import { logger } from '../../../infrastructure/logging/logger';

export interface EngineHealthReport {
  audioEngine: { name: string; type: string; status: EngineExecutionStatus; latencyMs: number };
  theoryEngine: { name: string; type: string; status: EngineExecutionStatus; latencyMs: number };
  scoreEngine: { name: string; type: string; status: EngineExecutionStatus; latencyMs: number };
  practiceEngine: { name: string; type: string; status: EngineExecutionStatus; latencyMs: number };
  allHealthy: boolean;
}

export class EngineGateway {
  private audioEngine: AudioEngineAdapter;
  private theoryEngine: TheoryEngineAdapter;
  private scoreEngine: ScoreEngineAdapter;
  private practiceEngine: PracticeScoringEngineAdapter;

  constructor(
    audioEngine?: AudioEngineAdapter,
    theoryEngine?: TheoryEngineAdapter,
    scoreEngine?: ScoreEngineAdapter,
    practiceEngine?: PracticeScoringEngineAdapter
  ) {
    this.audioEngine = audioEngine || new WebAudioEngineAdapter();
    this.theoryEngine = theoryEngine || new RuleBasedTheoryEngineAdapter();
    this.scoreEngine = scoreEngine || new CanonicalScoreEngineAdapter();
    this.practiceEngine = practiceEngine || new RuleBasedPracticeScoringAdapter();
  }

  public registerAudioEngine(adapter: AudioEngineAdapter): void {
    logger.info(`EngineGateway: Registrando AudioEngine [${adapter.engineName} - ${adapter.implementationType}]`);
    this.audioEngine = adapter;
  }

  public registerTheoryEngine(adapter: TheoryEngineAdapter): void {
    logger.info(`EngineGateway: Registrando TheoryEngine [${adapter.engineName} - ${adapter.implementationType}]`);
    this.theoryEngine = adapter;
  }

  public registerScoreEngine(adapter: ScoreEngineAdapter): void {
    logger.info(`EngineGateway: Registrando ScoreEngine [${adapter.engineName} - ${adapter.implementationType}]`);
    this.scoreEngine = adapter;
  }

  public registerPracticeEngine(adapter: PracticeScoringEngineAdapter): void {
    logger.info(`EngineGateway: Registrando PracticeEngine [${adapter.engineName} - ${adapter.implementationType}]`);
    this.practiceEngine = adapter;
  }

  public getAudioEngine(): AudioEngineAdapter {
    return this.audioEngine;
  }

  public getTheoryEngine(): TheoryEngineAdapter {
    return this.theoryEngine;
  }

  public getScoreEngine(): ScoreEngineAdapter {
    return this.scoreEngine;
  }

  public getPracticeEngine(): PracticeScoringEngineAdapter {
    return this.practiceEngine;
  }

  public async getHealthReport(): Promise<EngineHealthReport> {
    const [audioHealth, theoryHealth, scoreHealth, practiceHealth] = await Promise.all([
      this.audioEngine.getHealth(),
      this.theoryEngine.getHealth(),
      this.scoreEngine.getHealth(),
      this.practiceEngine.getHealth(),
    ]);

    const allHealthy =
      audioHealth.status === EngineExecutionStatus.READY &&
      theoryHealth.status === EngineExecutionStatus.READY &&
      scoreHealth.status === EngineExecutionStatus.READY &&
      practiceHealth.status === EngineExecutionStatus.READY;

    return {
      audioEngine: {
        name: this.audioEngine.engineName,
        type: this.audioEngine.implementationType,
        status: audioHealth.status,
        latencyMs: audioHealth.latencyMs,
      },
      theoryEngine: {
        name: this.theoryEngine.engineName,
        type: this.theoryEngine.implementationType,
        status: theoryHealth.status,
        latencyMs: theoryHealth.latencyMs,
      },
      scoreEngine: {
        name: this.scoreEngine.engineName,
        type: this.scoreEngine.implementationType,
        status: scoreHealth.status,
        latencyMs: scoreHealth.latencyMs,
      },
      practiceEngine: {
        name: this.practiceEngine.engineName,
        type: this.practiceEngine.implementationType,
        status: practiceHealth.status,
        latencyMs: practiceHealth.latencyMs,
      },
      allHealthy,
    };
  }
}

export const engineGateway = new EngineGateway();
