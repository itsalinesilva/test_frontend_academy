import { AuditEvent, AuditAction, AuditSeverity } from '../../domain/audit';
import { logger } from '../logging/logger';
import { auditRepository } from '../../repositories/audit.repository';

export interface AuditSink {
  persist(event: AuditEvent): Promise<void>;
}

export class PersistentAuditSink implements AuditSink {
  public async persist(event: AuditEvent): Promise<void> {
    logger.info(`[Audit] ${event.action} by ${event.actorEmail} (${event.severity})`, 'AuditService');
    try {
      await auditRepository.append(event);
    } catch (err) {
      logger.error('Failed to append audit event to persistent log', 'AuditService', err);
    }
  }
}

export class AuditService {
  private sink: AuditSink;

  constructor(sink: AuditSink = new PersistentAuditSink()) {
    this.sink = sink;
  }

  public setSink(sink: AuditSink): void {
    this.sink = sink;
  }

  public async logEvent(
    action: AuditAction,
    actor: { id: string; email: string },
    severity: AuditSeverity,
    options?: {
      targetId?: string;
      targetType?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}_${Math.random()}`,
      action,
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: options?.targetId,
      targetType: options?.targetType,
      severity,
      metadata: options?.metadata || {},
      timestamp: new Date().toISOString(),
    };

    await this.sink.persist(event);
    return event;
  }
}

export const auditService = new AuditService();
