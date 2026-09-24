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
import { ArmazemDeRelatos, Relato, chaveDoRelato, problemasDoRelato } from './relatos';
import { ArmazemKV, Pessoa, Resultado, ServicoDeSalas } from './salas';
import { ServicoDaComunidade } from './comunidade';

export interface ServerEnv {
  GOOGLE_OAUTH_CLIENT_ID?: string;
  ADMIN_ALLOWLIST?: string;
  SESSION_SIGNING_SECRET?: string;
  AUDIT_SIGNING_SECRET?: string;
  ALLOWED_ORIGIN?: string;
  /** KV da Cloudflare para os relatos de exercício (L-7a). Sem ele, a API diz que não há onde guardar. */
  RELATOS?: ArmazemDeRelatos;
  /** KV da Cloudflare para as salas (AUD-9, ADR-003). Sem ele, a API diz que as salas não estão ligadas. */
  SALAS?: ArmazemKV;
  /** KV da Cloudflare para fórum, eventos e pessoas (P-1..P-3, ADR-003). */
  COMUNIDADE?: ArmazemKV;
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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

  // --------------------------------------------------------------- SALAS ---
  // ---------------------------------------------------------- COMUNIDADE ---
  if (
    path.startsWith('/api/v1/forum/') ||
    path === '/api/v1/eventos' ||
    path.startsWith('/api/v1/eventos/') ||
    path.startsWith('/api/v1/founder/forum/')
  ) {
    if (!env.COMUNIDADE) {
      return fail('COMUNIDADE_NAO_CONFIGURADA', 'A comunidade ainda não está ligada neste servidor.', 503, env);
    }
    const authed = await authenticate(request, env);
    const quem: Pessoa | null = authed
      ? { sub: authed.session.sub, nome: authed.session.name || authed.session.email.split('@')[0] }
      : null;
    const c = new ServicoDaComunidade(env.COMUNIDADE);
    const metodo = request.method;
    let corpo: unknown = null;
    if (metodo === 'POST') {
      try {
        corpo = await request.json();
      } catch {
        corpo = null;
      }
    }
    const responder = (r: Resultado<unknown>) =>
      r.ok ? json({ data: r.valor }, r.status ?? 200, env) : fail(r.codigo, r.mensagem, r.status, env);
    const exigir = (): Response | null =>
      quem ? null : fail('UNAUTHENTICATED', 'Entre na sua conta para participar da comunidade.', 401, env);
    const p = path.split('/').filter(Boolean).slice(2).map(decodeURIComponent);

    /** Moderação: só a administração que o SERVIDOR reconhece — nunca um papel dito pelo cliente. */
    if (p[0] === 'founder') {
      if (!authed) return fail('UNAUTHENTICATED', 'Autentique-se.', 401, env);
      if (!authed.grant.isAdmin) return fail('FORBIDDEN', 'Só a administração modera.', 403, env);
      const [, , recurso, id, acao, alvo] = p;
      if (recurso === 'topicos' && id && metodo === 'POST' && ['ocultar', 'mostrar', 'fixar', 'trancar', 'destrancar'].includes(acao ?? '')) {
        await audit.record({
          action: `moderation.forum.${acao}`,
          actorSubject: authed.session.sub,
          actorEmail: authed.session.email,
          severity: 'WARNING',
          details: `Tópico ${id}: ${acao}.`,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
        return responder(await c.moderarTopico(id, acao as 'ocultar'));
      }
      if (recurso === 'topicos' && id && acao && alvo && metodo === 'POST' && ['ocultar', 'mostrar'].includes(alvo)) {
        await audit.record({
          action: `moderation.forum.resposta.${alvo}`,
          actorSubject: authed.session.sub,
          actorEmail: authed.session.email,
          severity: 'WARNING',
          details: `Resposta ${acao} do tópico ${id}: ${alvo}.`,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
        return responder(await c.moderarResposta(id, acao, alvo === 'ocultar'));
      }
      return fail('NOT_FOUND', 'Rota de moderação desconhecida.', 404, env);
    }

    if (p[0] === 'forum' && p[1] === 'topicos') {
      const [, , id, sub] = p;
      if (!id && metodo === 'GET') return responder(await c.topicos(quem, url.searchParams.get('categoria') ?? undefined));
      if (!id && metodo === 'POST') return exigir() ?? responder(await c.abrir(quem!, corpo));
      if (id && !sub && metodo === 'GET') return responder(await c.topico(quem, id));
      if (id && sub === 'respostas' && metodo === 'POST') return exigir() ?? responder(await c.responder(quem!, id, corpo));
    }
    if (p[0] === 'eventos') {
      const [, id, acao] = p;
      if (!id && metodo === 'GET') return responder(await c.eventos(quem));
      if (!id && metodo === 'POST') return exigir() ?? responder(await c.criarEvento(quem!, corpo));
      if (id && acao === 'inscrever' && metodo === 'POST') return exigir() ?? responder(await c.inscrever(quem!, id));
      if (id && acao === 'cancelar' && metodo === 'POST') {
        return exigir() ?? responder(await c.cancelarEvento(quem!, id, authed!.grant.isAdmin));
      }
    }
    return fail('NOT_FOUND', 'Rota da comunidade desconhecida.', 404, env);
  }

  if (path === '/api/v1/salas-novidades' && request.method === 'GET') {
    if (!env.SALAS) return fail('SALAS_NAO_CONFIGURADAS', 'As salas ainda não estão ligadas neste servidor.', 503, env);
    const authed = await authenticate(request, env);
    if (!authed) return fail('UNAUTHENTICATED', 'Entre na sua conta para ver os avisos.', 401, env);
    const pedido = url.searchParams.get('desde') ?? '';
    /** Sem marco, os últimos trinta dias: o bastante para quem volta de férias, sem varrer a história. */
    const desde = Number.isNaN(Date.parse(pedido)) ? new Date(Date.now() - 30 * 864e5).toISOString() : new Date(pedido).toISOString();
    const r = await new ServicoDeSalas(env.SALAS).novidades(
      { sub: authed.session.sub, nome: authed.session.name || authed.session.email.split('@')[0] },
      desde
    );
    return r.ok ? json({ data: r.valor }, 200, env) : fail(r.codigo, r.mensagem, r.status, env);
  }

  if (path === '/api/v1/salas' || path.startsWith('/api/v1/salas/')) {
    if (!env.SALAS) {
      return fail('SALAS_NAO_CONFIGURADAS', 'As salas ainda não estão ligadas neste servidor.', 503, env);
    }
    const authed = await authenticate(request, env);
    const quem: Pessoa | null = authed
      ? { sub: authed.session.sub, nome: authed.session.name || authed.session.email.split('@')[0] }
      : null;
    const servico = new ServicoDeSalas(env.SALAS);
    const partes = path.slice('/api/v1/salas'.length).split('/').filter(Boolean).map(decodeURIComponent);
    const metodo = request.method;
    let corpo: unknown = null;
    if (metodo === 'POST' || metodo === 'PATCH') {
      try {
        corpo = await request.json();
      } catch {
        corpo = null;
      }
    }
    const responder = (r: Resultado<unknown>) =>
      r.ok ? json({ data: r.valor }, r.status ?? 200, env) : fail(r.codigo, r.mensagem, r.status, env);
    /** Ler pode ser anônimo (sala pública); escrever, nunca. */
    const exigir = (): Response | null =>
      quem ? null : fail('UNAUTHENTICATED', 'Entre na sua conta para participar das salas.', 401, env);

    const [sala, recurso, alvo, acao] = partes;
    if (!sala) {
      if (metodo === 'GET') return responder(await servico.diretorio(quem));
      if (metodo === 'POST') return exigir() ?? responder(await servico.criar(quem!, corpo));
    } else if (!recurso) {
      if (metodo === 'GET') return responder(await servico.sobre(quem, sala));
      if (metodo === 'PATCH') return exigir() ?? responder(await servico.editar(quem!, sala, corpo));
    } else if (recurso === 'entrar' && metodo === 'POST') {
      return exigir() ?? responder(await servico.entrar(quem!, sala));
    } else if (recurso === 'sair' && metodo === 'POST') {
      return exigir() ?? responder(await servico.sair(quem!, sala));
    } else if (recurso === 'membros') {
      if (!alvo && metodo === 'GET') return responder(await servico.membros(quem, sala));
      if (alvo && metodo === 'POST' && ['aprovar', 'remover', 'moderador', 'membro'].includes(acao ?? '')) {
        return exigir() ?? responder(await servico.decidirMembro(quem!, sala, alvo, acao as 'aprovar'));
      }
    } else if (recurso === 'posts') {
      if (!alvo && metodo === 'GET') return responder(await servico.posts(quem, sala));
      if (!alvo && metodo === 'POST') return exigir() ?? responder(await servico.publicar(quem!, sala, corpo));
      if (alvo && !acao && metodo === 'DELETE') return exigir() ?? responder(await servico.apagarPost(quem!, sala, alvo));
      if (alvo && acao === 'curtir' && metodo === 'POST') return exigir() ?? responder(await servico.curtir(quem!, sala, alvo));
      if (alvo && acao === 'fixar' && metodo === 'POST') return exigir() ?? responder(await servico.fixar(quem!, sala, alvo));
      if (alvo && acao === 'comentarios' && metodo === 'GET') return responder(await servico.comentarios(quem, sala, alvo));
      if (alvo && acao === 'comentarios' && metodo === 'POST') {
        return exigir() ?? responder(await servico.comentar(quem!, sala, alvo, corpo));
      }
    } else if (recurso === 'encontros') {
      if (metodo === 'GET') return responder(await servico.encontros(quem, sala));
      if (metodo === 'POST') return exigir() ?? responder(await servico.marcarEncontro(quem!, sala, corpo));
    } else if (recurso === 'ranking' && metodo === 'GET') {
      return responder(await servico.ranking(quem, sala));
    }
    return fail('NOT_FOUND', 'Rota de sala desconhecida.', 404, env);
  }

  // ------------------------------------------------------------- RELATOS ---
  if (path === '/api/v1/relatos' && request.method === 'POST') {
    const authed = await authenticate(request, env);
    /** Com sessão: relato anônimo é convite a spam, e quem revisa precisa poder perguntar de volta. */
    if (!authed) return fail('UNAUTHENTICATED', 'Entre para reportar um problema.', 401, env);
    if (!env.RELATOS) {
      return fail('RELATOS_NAO_CONFIGURADO', 'O servidor ainda não tem onde guardar relatos.', 503, env);
    }

    let corpo: unknown;
    try {
      corpo = await request.json();
    } catch {
      return fail('INVALID_BODY', 'Corpo da requisição não é JSON válido.', 400, env);
    }
    const problemas = problemasDoRelato(corpo);
    if (problemas.length) return fail('RELATO_INVALIDO', problemas.join(' '), 400, env);

    const c = corpo as Pick<Relato, 'exerciseId' | 'enunciado' | 'comentario'>;
    const em = new Date().toISOString();
    const relato: Relato = {
      id: crypto.randomUUID(),
      exerciseId: c.exerciseId.trim(),
      enunciado: c.enunciado.trim().slice(0, 300),
      comentario: c.comentario?.trim() || undefined,
      /** A autoria vem da SESSÃO assinada, e nunca do corpo: o corpo diria o que quisesse. */
      autorSubject: authed.session.sub,
      autorEmail: authed.session.email,
      em,
    };
    await env.RELATOS.put(chaveDoRelato(em, relato.id), JSON.stringify(relato));
    return json({ data: { id: relato.id, recebidoEm: em } }, 201, env);
  }

  if (path === '/api/v1/founder/relatos' && request.method === 'GET') {
    const authed = await authenticate(request, env);
    if (!authed) return fail('UNAUTHENTICATED', 'Autentique-se para ler os relatos.', 401, env);
    if (!authed.grant.isAdmin) {
      await audit.record({
        action: 'security.relatos.denied',
        actorSubject: authed.session.sub,
        actorEmail: authed.session.email,
        severity: 'SECURITY',
        details: `Leitura de relatos recusada para '${authed.session.email}'.`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return fail('FORBIDDEN', 'Só a administração lê os relatos.', 403, env);
    }
    if (!env.RELATOS) {
      return fail('RELATOS_NAO_CONFIGURADO', 'O servidor ainda não tem onde guardar relatos.', 503, env);
    }

    const { keys } = await env.RELATOS.list({ prefix: 'relato:', limit: 200 });
    const relatos = (
      await Promise.all(keys.map(async (k) => JSON.parse((await env.RELATOS!.get(k.name)) ?? 'null') as Relato | null))
    )
      .filter((r): r is Relato => r !== null)
      .sort((a, b) => b.em.localeCompare(a.em));
    return json({ data: { relatos, count: relatos.length } }, 200, env);
  }

  return fail('NOT_FOUND', 'Endpoint da autoridade não encontrado.', 404, env);
}
