/**
 * Server-Side AdminAuthorization Engine
 *
 * CANONICAL RULE: "A resolução de admin deve acontecer SERVER-SIDE.
 * Nunca confiar apenas no frontend. Não expor lógica administrativa ao cliente."
 *
 * This class is the sole authority for validating administrator access.
 * It intercepts client requests, ignores any self-asserted client roles,
 * and verifies identity against the immutable server allowlist.
 */

import { AdminRole, AdminRoleType } from './AdminRole';
import { auditLog } from './AuditLog';

export interface AdminVerificationResult {
  authorized: boolean;
  role?: AdminRoleType;
  title?: string;
  level?: number;
  reason?: string;
  verifiedAt: string;
}

export interface SecurityContext {
  userId?: string;
  email?: string;
  sessionToken?: string;
  ipAddress?: string;
  userAgent?: string;
  requestedRoute?: string;
}

export class AdminAuthorization {
  /**
   * Authoritatively verifies whether a subject holds institutional admin privileges.
   * NEVER trusts claims made solely by the frontend (such as role strings in request bodies).
   */
  public static async verifyAdmin(context: SecurityContext): Promise<AdminVerificationResult> {
    const email = context.email ? context.email.trim().toLowerCase() : '';
    const timestamp = new Date().toISOString();

    if (!email) {
      await auditLog.record({
        action: 'security.admin.attempt.unidentified',
        actorId: context.userId || 'anonymous',
        actorEmail: 'anonymous@unknown',
        severity: 'WARNING',
        details: `Tentativa de verificação administrativa sem e-mail ou identidade comprovada. Rota: ${context.requestedRoute || '/admin'}`,
        metadata: { requestedRoute: context.requestedRoute },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        authorized: false,
        reason: 'Identidade institucional não autenticada no servidor.',
        verifiedAt: timestamp,
      };
    }

    // Strict Server-Side Evaluation against immutable allowlist
    const isAuthorized = AdminRole.isAuthorizedEmail(email);

    if (!isAuthorized) {
      await auditLog.record({
        action: 'security.admin.attempt.denied',
        actorId: context.userId || 'unauthorized',
        actorEmail: email,
        severity: 'SECURITY',
        details: `Acesso administrativo recusado para o e-mail '${email}'. O usuário não possui outorga de administrador no servidor.`,
        metadata: {
          requestedRoute: context.requestedRoute,
          attemptedRole: 'ADMIN',
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        authorized: false,
        reason: 'O e-mail informado não consta na lista institucional de administradores autorizados.',
        verifiedAt: timestamp,
      };
    }

    // Success: Admin authorized by server
    const config = AdminRole.getAdminConfig(email);

    await auditLog.record({
      action: 'security.admin.access.granted',
      actorId: context.userId || 'admin_user',
      actorEmail: email,
      severity: 'INFO',
      details: `Autorização administrativa concedida pelo servidor para '${email}' (${config?.title}).`,
      metadata: {
        roleType: config?.roleType,
        level: config?.level,
        requestedRoute: context.requestedRoute,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      authorized: true,
      role: config?.roleType,
      title: config?.title,
      level: config?.level,
      verifiedAt: timestamp,
    };
  }

  /**
   * Asserts administrative authorization, throwing an error or rejecting if unauthorized.
   */
  public static async requireAdmin(context: SecurityContext): Promise<AdminVerificationResult> {
    const result = await this.verifyAdmin(context);
    if (!result.authorized) {
      const err = new Error(result.reason || 'Acesso administrativo negado pelo servidor.');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }
    return result;
  }

  /**
   * Validates if the authenticated admin has a specific sub-capability.
   */
  public static async requireCapability(
    context: SecurityContext,
    capability: string
  ): Promise<boolean> {
    const verification = await this.verifyAdmin(context);
    if (!verification.authorized || !context.email) {
      return false;
    }
    return AdminRole.hasCapability(context.email, capability);
  }
}
