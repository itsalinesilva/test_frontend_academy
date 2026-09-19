/**
 * Proxy de cliente para a autoridade administrativa.
 *
 * CORREÇÃO DE CLAUDE_AUDIT.md S-02.
 *
 * A versão anterior declarava "não expor lógica administrativa ao cliente"
 * e, na linha seguinte, importava `AdminAuthorization` de `src/server/` —
 * levando a allowlist de e-mails para dentro do bundle do navegador
 * (verificado: 6 ocorrências em `dist/assets/index-*.js`). Pior, o bloco
 * `catch` caía num fallback local, de modo que em produção — onde o
 * middleware do Vite não existe — a autorização era 100% client-side.
 *
 * Agora este arquivo não conhece nenhum e-mail, nenhuma regra e nenhum
 * módulo de servidor. Ele apenas pergunta. E falha fechado: se a rede cair,
 * o acesso é NEGADO, nunca concedido.
 */

import { AuditRecord } from '../../contracts/admin-contracts';

const API_BASE = '/api/v1';

export interface AdminVerificationResult {
  authorized: boolean;
  roleType?: string;
  level?: number;
  capabilities: readonly string[];
  reason?: string;
  verifiedAt: string;
}

const DENIED = (reason: string): AdminVerificationResult => ({
  authorized: false,
  capabilities: [],
  reason,
  verifiedAt: new Date().toISOString(),
});

export class AdminService {
  /**
   * Pergunta ao servidor se a SESSÃO ATUAL tem privilégio administrativo.
   *
   * Note a ausência de parâmetro de e-mail: a identidade vem exclusivamente
   * do token de sessão assinado. Isso torna a falha S-01 inexpressável a
   * partir do cliente.
   */
  public async verifyAuthorization(accessToken: string | null): Promise<AdminVerificationResult> {
    if (!accessToken) {
      return DENIED('Nenhuma sessão autenticada.');
    }

    try {
      const response = await fetch(`${API_BASE}/admin/verify`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const body = (await response.json()) as { data: Omit<AdminVerificationResult, 'authorized'> & { isAdmin: boolean } };
        return {
          authorized: body.data.isAdmin,
          roleType: body.data.roleType,
          level: body.data.level,
          capabilities: body.data.capabilities || [],
          verifiedAt: body.data.verifiedAt,
        };
      }

      const errorBody = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      return DENIED(errorBody?.error?.message || 'Acesso administrativo negado pelo servidor.');
    } catch {
      // Falha fechada. Indisponibilidade da autoridade NUNCA concede acesso.
      return DENIED(
        'Não foi possível contatar o servidor de autoridade. Acesso administrativo negado por precaução.'
      );
    }
  }

  /** Consulta o log de auditoria encadeado. Exige `admin.audit.view`. */
  public async fetchAuditLogs(
    accessToken: string | null,
    limit = 50
  ): Promise<{ logs: AuditRecord[]; integrity: { valid: boolean; brokenAtSeq?: number } }> {
    if (!accessToken) {
      throw new Error('Nenhuma sessão autenticada.');
    }

    const response = await fetch(`${API_BASE}/admin/audit-logs?limit=${encodeURIComponent(String(limit))}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      throw new Error(errorBody?.error?.message || 'Acesso negado aos registros de auditoria.');
    }

    const body = (await response.json()) as {
      data: { logs: AuditRecord[]; integrity: { valid: boolean; brokenAtSeq?: number } };
    };
    return { logs: body.data.logs, integrity: body.data.integrity };
  }
}

export const adminService = new AdminService();
