import type { IncomingMessage, ServerResponse } from 'http';
import { AdminAuthorization } from '../admin/AdminAuthorization';
import { auditLog } from '../admin/AuditLog';

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

export function createApiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.end();
      return;
    }

    if (!url.startsWith('/api/v1/')) {
      return next();
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // 1. POST /api/v1/admin/verify
    if (url === '/api/v1/admin/verify' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email as string) || '';
      const requestedRoute = (body.requestedRoute as string) || '/admin';

      const result = await AdminAuthorization.verifyAdmin({
        email,
        sessionToken: token,
        requestedRoute,
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      sendJson(res, result.authorized ? 200 : 403, result);
      return;
    }

    // 2. GET /api/v1/admin/audit-logs
    if (url.startsWith('/api/v1/admin/audit-logs') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const email = parsedUrl.searchParams.get('email') || '';

      const check = await AdminAuthorization.verifyAdmin({
        email,
        sessionToken: token,
        requestedRoute: '/admin/audit',
        ipAddress: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      if (!check.authorized) {
        sendJson(res, 403, {
          error: 'Acesso negado aos logs de auditoria institucional.',
          reason: check.reason,
        });
        return;
      }

      const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
      const logs = auditLog.getRecent(limit);
      sendJson(res, 200, { logs, count: logs.length });
      return;
    }

    // 3. POST /api/v1/auth/recovery
    if (url === '/api/v1/auth/recovery' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email as string) || '';

      if (!email || !email.includes('@')) {
        sendJson(res, 400, { error: 'E-mail inválido para recuperação institucional.' });
        return;
      }

      const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await auditLog.record({
        action: 'auth.recovery.requested',
        actorEmail: email,
        severity: 'INFO',
        details: `Solicitação de redefinição de credenciais gerada para '${email}'.`,
        metadata: { tokenIssued: true },
      });

      sendJson(res, 200, {
        success: true,
        message: 'Instruções de redefinição emitidas com sucesso.',
        resetToken,
      });
      return;
    }

    // Default 404 for unmatched /api/v1 routes
    sendJson(res, 404, { error: 'Endpoint da autoridade não encontrado.' });
  };
}
