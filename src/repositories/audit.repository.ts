import { AuditEvent } from '../domain/audit';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>;
  listRecent(limit?: number): Promise<AuditEvent[]>;
}

export class PersistentAuditRepository implements AuditRepository {
  private storage: StorageAdapter;
  private storageKey = 'audit_events_immutable_log';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  public async append(event: AuditEvent): Promise<void> {
    const list = (await this.storage.getItem<AuditEvent[]>(this.storageKey)) || [];
    list.unshift(event);
    // Keep last 500 audit events in local authority
    const capped = list.slice(0, 500);
    await this.storage.setItem(this.storageKey, capped);
  }

  public async listRecent(limit = 50): Promise<AuditEvent[]> {
    const list = (await this.storage.getItem<AuditEvent[]>(this.storageKey)) || [];
    return list.slice(0, limit);
  }
}

export const auditRepository = new PersistentAuditRepository();
