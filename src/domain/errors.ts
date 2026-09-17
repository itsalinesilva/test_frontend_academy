/**
 * Domain Errors - Academia Musical Digital
 * Error hierarchy for domain, authorization, validation and engines
 */

export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'DOMAIN_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Acesso não autenticado. Faça login para prosseguir.', details?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Ação não permitida para o seu nível de acesso.', details?: Record<string, unknown>) {
    super(message, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends DomainError {
  constructor(entityName: string, entityId: string) {
    super(`Registro não encontrado: ${entityName} (${entityId})`, 'NOT_FOUND', { entityName, entityId });
  }
}

export class ValidationError extends DomainError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', { fieldErrors });
    this.fieldErrors = fieldErrors;
  }
}

export class EngineAdapterError extends DomainError {
  public readonly engineName: string;

  constructor(engineName: string, message: string, details?: Record<string, unknown>) {
    super(`Falha no motor de processamento musical [${engineName}]: ${message}`, 'ENGINE_ADAPTER_ERROR', {
      engineName,
      ...details,
    });
    this.engineName = engineName;
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message = 'Conflito de concorrência ou versão desatualizada.', details?: Record<string, unknown>) {
    super(message, 'CONCURRENCY_ERROR', details);
  }
}
