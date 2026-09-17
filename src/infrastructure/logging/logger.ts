export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private format(levelStr: string, message: string, context?: string, data?: unknown): LogEntry {
    return {
      level: levelStr,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  public debug(message: string, context?: string, data?: unknown): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      const entry = this.format('DEBUG', message, context, data);
      console.info(`[${entry.timestamp}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`, data ?? '');
    }
  }

  public info(message: string, context?: string, data?: unknown): void {
    if (this.currentLevel <= LogLevel.INFO) {
      const entry = this.format('INFO', message, context, data);
      console.info(`[${entry.timestamp}] [INFO] ${context ? `[${context}] ` : ''}${message}`, data ?? '');
    }
  }

  public warn(message: string, context?: string, data?: unknown): void {
    if (this.currentLevel <= LogLevel.WARN) {
      const entry = this.format('WARN', message, context, data);
      console.warn(`[${entry.timestamp}] [WARN] ${context ? `[${context}] ` : ''}${message}`, data ?? '');
    }
  }

  public error(message: string, context?: string, error?: unknown): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      const entry = this.format('ERROR', message, context, error);
      console.error(`[${entry.timestamp}] [ERROR] ${context ? `[${context}] ` : ''}${message}`, error ?? '');
    }
  }
}

export const logger = new Logger();
