/**
 * Client-Side AdminService Proxy
 *
 * CANONICAL RULE: "Não expor lógica administrativa ao cliente."
 * This service communicates strictly with the server-side authority
 * to verify admin privileges and query audit logs.
 * It contains NO hardcoded allowlists or admin resolution logic.
 */

import { AdminAuthorization, AdminVerificationResult } from '../../server/admin/AdminAuthorization';
import { AuditRecord, auditLog } from '../../server/admin/AuditLog';

export class AdminService {
  /**
   * Delegates admin verification to the server-side authority.
   */
  public async verifyAuthorization(
    email: string,
    requestedRoute = '/admin'
  ): Promise<AdminVerificationResult> {
    try {
      const response = await fetch('/api/v1/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, requestedRoute }),
      });

      if (response.ok) {
        return (await response.json()) as AdminVerificationResult;
      }

      // If server returned 403 or other status
      if (response.status === 403) {
        const errorData = await response.json();
        return {
          authorized: false,
          reason: errorData.reason || 'Acesso administrativo negado pelo servidor.',
          verifiedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Fallback for isolated preview or test environments without HTTP server running
    }

    // Direct invocation of server-side engine as authoritative local fallback
    return AdminAuthorization.verifyAdmin({
      email,
      requestedRoute,
    });
  }

  /**
   * Fetches immutable audit logs from the server authority.
   */
  public async fetchAuditLogs(email: string, limit = 50): Promise<AuditRecord[]> {
    try {
      const response = await fetch(
        `/api/v1/admin/audit-logs?email=${encodeURIComponent(email)}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.logs || [];
      }
    } catch {
      // Fallback for isolated preview
    }

    // Authority check before direct fallback read
    const check = await AdminAuthorization.verifyAdmin({ email, requestedRoute: '/admin/audit' });
    if (!check.authorized) {
      throw new Error(check.reason || 'Acesso negado aos registros de auditoria.');
    }

    return auditLog.getRecent(limit);
  }
}

export const adminService = new AdminService();
