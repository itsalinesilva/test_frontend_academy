/**
 * Autoridade administrativa — resolução exclusivamente server-side.
 *
 * CORREÇÃO DE CLAUDE_AUDIT.md S-01 e S-02:
 *  - S-01: `verifyAdmin` recebia um e-mail no corpo da requisição e nunca
 *    validava o token. Agora a entrada é uma sessão já verificada
 *    criptograficamente; não existe caminho que aceite e-mail do cliente.
 *  - S-02: a allowlist era uma constante em `src/`, e portanto ia para o
 *    bundle do navegador. Agora vem de variável de ambiente do servidor e
 *    este módulo vive fora de `src/`.
 */

import { SessionClaims } from './session';

export enum AdminRoleType {
  FOUNDER_SUPERADMIN = 'FOUNDER_SUPERADMIN',
  SYSTEM_GOVERNOR = 'SYSTEM_GOVERNOR',
  CURATOR_ADMIN = 'CURATOR_ADMIN',
}

export const ADMIN_CAPABILITIES = [
  'admin.console.access',
  'admin.users.manage',
  'admin.roles.manage',
  'admin.audit.view',
  'admin.flags.manage',
  'admin.engines.inspect',
  'admin.content.curate',
  'admin.moderation.execute',
] as const;

export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number];

export interface AdminGrant {
  readonly isAdmin: boolean;
  readonly roleType?: AdminRoleType;
  readonly level?: number;
  readonly capabilities: readonly AdminCapability[];
  readonly reason?: string;
}

const DENIED: AdminGrant = {
  isAdmin: false,
  capabilities: [],
  reason: 'A identidade autenticada não consta na relação institucional de administradores.',
};

/**
 * Administradores do fluxo padrão: as contas da fundadora.
 *
 * Não são segredo e não são credencial — quem se apresentar com um destes
 * e-mails ainda precisa provar posse da conta Google, com token verificado
 * por assinatura RS256 contra o JWKS. A lista só decide o que fazer DEPOIS
 * dessa prova.
 *
 * Existe para que a plataforma da fundadora funcione sem configuração
 * adicional. Qualquer outro deployment deve definir `ADMIN_ALLOWLIST`, que
 * substitui esta lista por completo.
 */
const FUNDADORA: readonly string[] = [
  'alinealv.silv@gmail.com',
  'office.alinesilva@gmail.com',
];

/**
 * Lê a allowlist do ambiente. Formato: e-mails separados por vírgula.
 *
 * `ADMIN_ALLOWLIST` definida substitui integralmente o padrão — inclusive
 * quando resulta em lista vazia, caso em que NINGUÉM é administrador. Só a
 * ausência completa da variável recai sobre as contas da fundadora; uma
 * variável presente e malformada não silencia a intenção de quem a definiu.
 */
export function parseAdminAllowlist(raw: string | undefined): string[] {
  if (raw === undefined) {
    return [...FUNDADORA];
  }
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0 && entry.includes('@'));
}

/**
 * Resolve privilégio administrativo a partir de uma sessão JÁ VERIFICADA.
 *
 * Não existe sobrecarga que aceite apenas um e-mail: isso é deliberado.
 * O tipo torna a falha S-01 inexpressável.
 */
export function resolveAdminGrant(
  session: Pick<SessionClaims, 'email'>,
  allowlist: readonly string[]
): AdminGrant {
  const email = session.email.trim().toLowerCase();
  if (!email || allowlist.length === 0) {
    return DENIED;
  }
  if (!allowlist.includes(email)) {
    return DENIED;
  }

  return {
    isAdmin: true,
    roleType: AdminRoleType.FOUNDER_SUPERADMIN,
    level: 100,
    capabilities: ADMIN_CAPABILITIES,
  };
}

/** Verifica uma capacidade administrativa específica. */
export function grantHasCapability(grant: AdminGrant, capability: AdminCapability): boolean {
  return grant.isAdmin && grant.capabilities.includes(capability);
}
