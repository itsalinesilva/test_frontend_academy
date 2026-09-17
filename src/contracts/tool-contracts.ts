export enum ToolCategory {
  TUNER = 'TUNER',
  METRONOME = 'METRONOME',
  SCORE_VIEWER = 'SCORE_VIEWER',
  PRACTICE_EVALUATOR = 'PRACTICE_EVALUATOR',
  THEORY_ANALYZER = 'THEORY_ANALYZER',
}

export enum EngineExecutionStatus {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum EngineImplementationType {
  BUILT_IN_BROWSER = 'BUILT_IN_BROWSER',
  NODE_AUTHORITY = 'NODE_AUTHORITY',
  PYTHON_REMOTE_MICROSERVICE = 'PYTHON_REMOTE_MICROSERVICE',
  DEVELOPMENT_FALLBACK = 'DEVELOPMENT_FALLBACK',
}

export interface ToolMetadata {
  id: string;
  name: string;
  category: ToolCategory;
  version: string;
  requiredCapabilities: string[];
  engineType: EngineImplementationType;
}

export interface ToolExecutionRequest<TPayload = unknown> {
  toolId: string;
  userId: string;
  sessionId?: string;
  timestamp: string;
  parameters: TPayload;
}

export interface ToolExecutionResult<TResult = unknown> {
  toolId: string;
  status: EngineExecutionStatus;
  executionDurationMs: number;
  engineType: EngineImplementationType;
  confidenceScore?: number;
  data: TResult;
  error?: string;
}
