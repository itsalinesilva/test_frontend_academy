/**
 * Log de auditoria encadeado — autoridade de servidor.
 *
 * CORREÇÃO DE CLAUDE_AUDIT.md S-07. A implementação anterior:
 *  - assinava com `Math.random()`, o que não é assinatura;
 *  - persistia em `window.localStorage` dentro de um módulo de servidor,
 *    onde `window` é `undefined` — ou seja, não persistia nada;
 *  - semeava 2 registros falsos datados como se fossem atos reais;
 *  - expunha `resetForTesting()` público num log declarado imutável.
 *
 * Agora cada registro carrega um HMAC-SHA256 que cobre o próprio conteúdo
 * E a assinatura do registro anterior. Alterar ou remover qualquer elo
 * quebra a verificação de toda a cadeia a partir dele.
 */

export type AuditSeverity = 'INFO' | 'WARNING' | 'SECURITY' | 'CRITICAL';

export interface AuditRecord {
  readonly seq: number;
  readonly id: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorSubject: string;
  readonly actorEmail: string;
  readonly severity: AuditSeverity;
  readonly details: string;
  readonly metadata?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  /** HMAC-SHA256 sobre o conteúdo canônico + assinatura anterior. */
  readonly signature: string;
  readonly previousSignature: string;
}

export interface AuditEntryInput {
  action: string;
  actorSubject?: string;
  actorEmail?: string;
  severity: AuditSeverity;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const GENESIS_SIGNATURE = 'genesis';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Serialização canônica: chaves ordenadas, para que a assinatura não dependa
 * da ordem de inserção das propriedades.
 */
function canonicalize(record: Omit<AuditRecord, 'signature'>): string {
  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    ordered[key] = (record as unknown as Record<string, unknown>)[key];
  }
  return JSON.stringify(ordered);
}

export class ChainedAuditLog {
  private records: AuditRecord[] = [];
  private lastSignature = GENESIS_SIGNATURE;
  private readonly maxRecords: number;
  private key: CryptoKey | null = null;

  constructor(private readonly signingSecret: string, maxRecords = 2000) {
    this.maxRecords = maxRecords;
  }

  private async getKey(): Promise<CryptoKey> {
    if (!this.key) {
      if (!this.signingSecret || this.signingSecret.length < 32) {
        throw new Error('AUDIT_SIGNING_SECRET ausente ou com menos de 32 caracteres.');
      }
      this.key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(this.signingSecret) as unknown as ArrayBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
    }
    return this.key;
  }

  private async sign(payload: string): Promise<string> {
    const key = await this.getKey();
    const mac = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload) as unknown as ArrayBuffer
    );
    return toHex(mac);
  }

  public async record(entry: AuditEntryInput): Promise<AuditRecord> {
    const seq = this.records.length > 0 ? this.records[0].seq + 1 : 1;
    const unsigned: Omit<AuditRecord, 'signature'> = {
      seq,
      id: `aud_${seq}_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      actorSubject: entry.actorSubject || 'anonymous',
      actorEmail: entry.actorEmail || 'unidentified',
      severity: entry.severity,
      details: entry.details,
      metadata: entry.metadata,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      previousSignature: this.lastSignature,
    };

    const signature = await this.sign(canonicalize(unsigned));
    const record: AuditRecord = { ...unsigned, signature };

    this.records.unshift(record);
    this.lastSignature = signature;

    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }
    return record;
  }

  public getRecent(limit = 100): readonly AuditRecord[] {
    return this.records.slice(0, Math.min(limit, this.maxRecords));
  }

  /**
   * Reverifica a cadeia inteira. Qualquer alteração de conteúdo, remoção de
   * elo ou reordenação faz esta função apontar o índice comprometido.
   */
  public async verifyChain(): Promise<{ valid: boolean; brokenAtSeq?: number }> {
    const chronological = [...this.records].reverse();
    let previous = chronological.length > 0 ? chronological[0].previousSignature : GENESIS_SIGNATURE;

    for (const record of chronological) {
      if (record.previousSignature !== previous) {
        return { valid: false, brokenAtSeq: record.seq };
      }
      const { signature, ...unsigned } = record;
      const expected = await this.sign(canonicalize(unsigned));
      if (expected !== signature) {
        return { valid: false, brokenAtSeq: record.seq };
      }
      previous = signature;
    }
    return { valid: true };
  }
}
