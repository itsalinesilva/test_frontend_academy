/**
 * Roteador de API agnóstico de runtime.
 *
 * Recebe e devolve `Request`/`Response` padrão, de modo que o MESMO código
 * atenda o dev server (Vite) e a produção (Cloudflare Pages Functions).
 * Isso fecha o buraco B-01 do CLAUDE_AUDIT.md: hoje os endpoints vivem num
 * hook `configureServer` do Vite e simplesmente deixam de existir em produção.
 */

import { verifyGoogleIdToken, IdentityVerificationError } from './google-identity';
import { issueSession, verifySession, extractBearerToken, SessionClaims } from './session';
import { parseAdminAllowlist, resolveAdminGrant, grantHasCapability, AdminGrant } from './admin-authority';
import { ChainedAuditLog } from './audit-log';

export interface ServerEnv {
  GOOGLE_OAUTH_CLIENT_ID?: string;
  ADMIN_ALLOWLIST?: string;
  SESSION_SIGNING_SECRET?: string;
  AUDIT_SIGNING_SECRET?: string;
  ALLOWED_ORIGIN?: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

let auditLogInstance: ChainedAuditLog | null = null;
function getAuditLog(env: ServerEnv): ChainedAuditLog {
  if (!auditLogInstance) {
    auditLogInstance = new ChainedAuditLog(env.AUDIT_SIGNING_SECRET || '');
  }
  return auditLogInstance;
}

/** Usado apenas por testes. */
export function resetAuditLogForTesting(): void {
  auditLogInstance = null;
}

function corsHeaders(env: ServerEnv): Record<string, string> {
  // Sem curinga: a origem permitida é explícita e configurada.
  const origin = env.ALLOWED_ORIGIN || 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, env: ServerEnv): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(env),
    },
  });
}

function fail(code: string, message: string, status: number, env: ServerEnv): Response {
  return json({ error: { code, message } }, status, env);
}

/** Toda configuração obrigatória é validada antes de qualquer decisão de acesso. */
function assertConfigured(env: ServerEnv): string | null {
  if (!env.GOOGLE_OAUTH_CLIENT_ID) return 'GOOGLE_OAUTH_CLIENT_ID';
  if (!env.SESSION_SIGNING_SECRET) return 'SESSION_SIGNING_SECRET';
  if (!env.AUDIT_SIGNING_SECRET) return 'AUDIT_SIGNING_SECRET';
  return null;
}

/**
 * Autentica a requisição. Falha fechada: qualquer anomalia resulta em
 * ausência de sessão, nunca em sessão parcial.
 */
async function authenticate(
  request: Request,
  env: ServerEnv
): Promise<{ session: SessionClaims; grant: AdminGrant } | null> {
  const token = extractBearerToken(request.headers.get('Authorization'));
  if (!token) return null;
  try {
    const session = await verifySession(token, env.SESSION_SIGNING_SECRET || '');
    const grant = resolveAdminGrant(session, parseAdminAllowlist(env.ADMIN_ALLOWLIST));
    return { session, grant };
  } catch {
    return null;
  }
}

export async function handleApiRequest(
  request: Request,
  env: ServerEnv,
  context: RequestContext = {}
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(env) });
  }

  if (!path.startsWith('/api/v1/')) {
    return fail('NOT_FOUND', 'Rota fora do escopo da API.', 404, env);
  }

  const missing = assertConfigured(env);
  if (missing) {
    // Não revelamos detalhes de configuração ao cliente, mas também não
    // degradamos para um modo "permissivo" — a API simplesmente não opera.
    return fail(
      'SERVER_NOT_CONFIGURED',
      'O servidor de autoridade não está configurado. Contate a administração.',
      503,
      env
    );
  }

  const audit = getAuditLog(env);

  // ---------------------------------------------------------------- AUTH ---
  if (path === '/api/v1/auth/session' && request.method === 'POST') {
    let body: { idToken?: string; nonce?: string };
    try {
      body = (await request.json()) as { idToken?: string; nonce?: string };
    } catch {
      return fail('INVALID_BODY', 'Corpo da requisição não é JSON válido.', 400, env);
    }

    try {
      const identity = await verifyGoogleIdToken(
        body.idToken || '',
        env.GOOGLE_OAUTH_CLIENT_ID as string,
        body.nonce
      );

      const grant = resolveAdminGrant(identity, parseAdminAllowlist(env.ADMIN_ALLOWLIST));
      const { token, claims } = await issueSession(
        identity,
        { isAdmin: grant.isAdmin, level: grant.level },
        env.SESSION_SIGNING_SECRET as string
      );

      await audit.record({
        action: 'auth.session.issued',
        actorSubject: identity.googleSubject,
        actorEmail: identity.email,
        severity: grant.isAdmin ? 'SECURITY' : 'INFO',
        details: `Sessão emitida para '${identity.email}'${grant.isAdmin ? ' com privilégio administrativo' : ''}.`,
        metadata: { isAdmin: grant.isAdmin },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return json(
        {
          data: {
            accessToken: token,
            expiresAt: new Date(claims.exp * 1000).toISOString(),
            identity: {
              subject: claims.sub,
              email: claims.email,
              name: claims.name,
              pictureUrl: claims.picture,
            },
            admin: {
              isAdmin: grant.isAdmin,
              roleType: grant.roleType,
              level: grant.level,
              capabilities: grant.capabilities,
            },
          },
        },
        200,
        env
      );
    } catch (error) {
      const code = error instanceof IdentityVerificationError ? error.code : 'AUTHENTICATION_FAILED';
      await audit.record({
        action: 'auth.session.rejected',
        severity: 'SECURITY',
        details: `Tentativa de autenticação recusada (${code}).`,
        metadata: { code },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return fail(code, 'Não foi possível validar a identidade Google apresentada.', 401, env);
    }
  }

  if (path === '/api/v1/auth/session' && request.method === 'GET') {
    const authed = await authenticate(request, env);
    if (!authed) {
      return fail('UNAUTHENTICATED', 'Sessão ausente, expirada ou inválida.', 401, env);
    }
    return json(
      {
        data: {
          identity: {
            subject: authed.session.sub,
            email: authed.session.email,
            name: authed.session.name,
            pictureUrl: authed.session.picture,
          },
          expiresAt: new Date(authed.session.exp * 1000).toISOString(),
          admin: {
            isAdmin: authed.grant.isAdmin,
            roleType: authed.grant.roleType,
            level: authed.grant.level,
            capabilities: authed.grant.capabilities,
          },
        },
      },
      200,
      env
    );
  }

  if (path === '/api/v1/auth/session' && request.method === 'DELETE') {
    const authed = await authenticate(request, env);
    if (authed) {
      await audit.record({
        action: 'auth.session.revoked',
        actorSubject: authed.session.sub,
        actorEmail: authed.session.email,
        severity: 'INFO',
        details: `Encerramento de sessão de '${authed.session.email}'.`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
    return json({ data: { revoked: true } }, 200, env);
  }

  // --------------------------------------------------------------- ADMIN ---
  if (path === '/api/v1/admin/verify' && request.method === 'GET') {
    const authed = await authenticate(request, env);
    if (!authed) {
      return fail('UNAUTHENTICATED', 'Autentique-se para verificar privilégios.', 401, env);
    }
    if (!authed.grant.isAdmin) {
      await audit.record({
        action: 'security.admin.denied',
        actorSubject: authed.session.sub,
        actorEmail: authed.session.email,
        severity: 'SECURITY',
        details: `Acesso administrativo recusado para '${authed.session.email}'.`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return fail('FORBIDDEN', authed.grant.reason || 'Acesso administrativo negado.', 403, env);
    }
    return json(
      {
        data: {
          isAdmin: true,
          roleType: authed.grant.roleType,
          level: authed.grant.level,
          capabilities: authed.grant.capabilities,
          verifiedAt: new Date().toISOString(),
        },
      },
      200,
      env
    );
  }

  if (path === '/api/v1/admin/audit-logs' && request.method === 'GET') {
    const authed = await authenticate(request, env);
    if (!authed) {
      return fail('UNAUTHENTICATED', 'Autentique-se para consultar a auditoria.', 401, env);
    }
    if (!grantHasCapability(authed.grant, 'admin.audit.view')) {
      await audit.record({
        action: 'security.audit.denied',
        actorSubject: authed.session.sub,
        actorEmail: authed.session.email,
        severity: 'SECURITY',
        details: `Consulta ao log de auditoria recusada para '${authed.session.email}'.`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return fail('FORBIDDEN', 'Capacidade `admin.audit.view` não concedida.', 403, env);
    }

    const rawLimit = Number(url.searchParams.get('limit') || '50');
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 500) : 50;
    const logs = audit.getRecent(limit);
    const integrity = await audit.verifyChain();

    return json({ data: { logs, count: logs.length, integrity } }, 200, env);
  }

  return fail('NOT_FOUND', 'Endpoint da autoridade não encontrado.', 404, env);
}
