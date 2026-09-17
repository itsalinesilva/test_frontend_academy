/**
 * Server-Side AdminRole Definition
 *
 * CANONICAL RULE: This file is part of the server-side authority domain.
 * It contains the strict administrative role enumerations, hierarchy, and capabilities.
 * DO NOT leak administrative validation rules or allowlists to the client.
 */

export enum AdminRoleType {
  FOUNDER_SUPERADMIN = 'FOUNDER_SUPERADMIN',
  SYSTEM_GOVERNOR = 'SYSTEM_GOVERNOR',
  CURATOR_ADMIN = 'CURATOR_ADMIN',
}

/**
 * Strict Server-Side Authorized Admin Allowlist
 * Only these two canonical emails are recognized as administrators by the server.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  'alinealv.silv@gmail.com',
  'office.alinesilva@gmail.com',
] as const;

export type AuthorizedAdminEmail = (typeof AUTHORIZED_ADMIN_EMAILS)[number];

export interface AdminRoleConfig {
  roleType: AdminRoleType;
  title: string;
  level: number;
  capabilities: string[];
}

export class AdminRole {
  private static roleDefinitions: Record<AuthorizedAdminEmail, AdminRoleConfig> = {
    'alinealv.silv@gmail.com': {
      roleType: AdminRoleType.FOUNDER_SUPERADMIN,
      title: 'Fundadora & Curadora Soberana',
      level: 100,
      capabilities: [
        'admin.console.access',
        'admin.users.manage',
        'admin.roles.manage',
        'admin.audit.view',
        'admin.flags.manage',
        'admin.engines.inspect',
        'admin.content.curate',
        'admin.moderation.execute',
      ],
    },
    'office.alinesilva@gmail.com': {
      roleType: AdminRoleType.SYSTEM_GOVERNOR,
      title: 'Administração & Governança Institucional',
      level: 100,
      capabilities: [
        'admin.console.access',
        'admin.users.manage',
        'admin.roles.manage',
        'admin.audit.view',
        'admin.flags.manage',
        'admin.engines.inspect',
        'admin.content.curate',
        'admin.moderation.execute',
      ],
    },
  };

  /**
   * Evaluates if a given email is in the authorized admin allowlist.
   * This is executed strictly server-side.
   */
  public static isAuthorizedEmail(email: string): boolean {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    return AUTHORIZED_ADMIN_EMAILS.some(
      (authorized) => authorized.toLowerCase() === normalized
    );
  }

  /**
   * Retrieves the administrative role configuration for an authorized email.
   * Returns null if the email is not an authorized administrator.
   */
  public static getAdminConfig(email: string): AdminRoleConfig | null {
    if (!this.isAuthorizedEmail(email)) return null;
    const normalized = email.trim().toLowerCase() as AuthorizedAdminEmail;
    return this.roleDefinitions[normalized] || {
      roleType: AdminRoleType.SYSTEM_GOVERNOR,
      title: 'Administrador da Academia',
      level: 90,
      capabilities: [
        'admin.console.access',
        'admin.users.manage',
        'admin.audit.view',
      ],
    };
  }

  /**
   * Validates if a specific administrative capability is granted.
   */
  public static hasCapability(email: string, capability: string): boolean {
    const config = this.getAdminConfig(email);
    if (!config) return false;
    return config.capabilities.includes(capability);
  }
}
