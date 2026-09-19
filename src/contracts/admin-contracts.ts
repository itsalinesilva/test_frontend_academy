/**
 * Contratos de transporte do domínio administrativo.
 *
 * Estes tipos descrevem o FORMATO dos dados que chegam do servidor.
 * Eles não contêm regra de autorização alguma — a regra vive exclusivamente
 * em `server/core/admin-authority.ts`, fora de `src/` e fora do bundle.
 */

export type AuditSeverity = 'INFO' | 'WARNING' | 'SECURITY' | 'CRITICAL';

/** Registro do log encadeado, como devolvido pela autoridade. */
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
  readonly signature: string;
  readonly previousSignature: string;
}

/** Resultado da reverificação criptográfica da cadeia de auditoria. */
export interface AuditChainIntegrity {
  readonly valid: boolean;
  readonly brokenAtSeq?: number;
}

/** Identidade verificada devolvida pelo servidor após o login Google. */
export interface VerifiedIdentityDto {
  readonly subject: string;
  readonly email: string;
  readonly name?: string;
  readonly pictureUrl?: string;
}

/** Concessão administrativa resolvida server-side. */
export interface AdminGrantDto {
  readonly isAdmin: boolean;
  readonly roleType?: string;
  readonly level?: number;
  readonly capabilities: readonly string[];
}

/** Resposta canônica de `POST /api/v1/auth/session`. */
export interface AuthoritySessionDto {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly identity: VerifiedIdentityDto;
  readonly admin: AdminGrantDto;
}
