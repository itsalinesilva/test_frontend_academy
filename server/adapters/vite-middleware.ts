/**
 * Adaptador de desenvolvimento — traduz o Node `IncomingMessage`/`ServerResponse`
 * do Vite para `Request`/`Response` padrão e delega ao MESMO roteador usado
 * em produção pela Cloudflare Pages Function.
 *
 * Objetivo explícito: eliminar a divergência dev↔produção que permitia um
 * endpoint existir no dev server e não existir no artefato publicado.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest, ServerEnv } from '../core/api-router';
import { KVEmMemoria } from '../core/salas';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      // Limite defensivo: um corpo de autenticação nunca é grande.
      if (data.length > 1_000_000) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function toWebRequest(req: IncomingMessage, body: string): Request {
  const host = req.headers.host || 'localhost:3000';
  const url = `http://${host}${req.url || '/'}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }

  const method = (req.method || 'GET').toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD' && body.length > 0;

  return new Request(url, { method, headers, body: hasBody ? body : undefined });
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
}

/**
 * Monta o ambiente a partir de `process.env`, carregado pelo Vite a partir
 * de `.env`/`.env.local`. Nenhum valor tem padrão permissivo: ausência de
 * configuração faz a API responder 503, não liberar acesso.
 */
function resolveEnv(): ServerEnv {
  const env = process.env;
  return {
    GOOGLE_OAUTH_CLIENT_ID: env.GOOGLE_OAUTH_CLIENT_ID,
    ADMIN_ALLOWLIST: env.ADMIN_ALLOWLIST,
    SESSION_SIGNING_SECRET: env.SESSION_SIGNING_SECRET,
    AUDIT_SIGNING_SECRET: env.AUDIT_SIGNING_SECRET,
    ALLOWED_ORIGIN: env.ALLOWED_ORIGIN || 'http://localhost:3000',
    /**
     * Em desenvolvimento, o KV é a memória do próprio servidor do Vite: salas e
     * relatos funcionam entre abas e contas enquanto ele estiver de pé. Em
     * produção, são os namespaces KV ligados no painel do Pages.
     */
    SALAS: KV_DE_DESENVOLVIMENTO.salas,
    RELATOS: KV_DE_DESENVOLVIMENTO.relatos,
  };
}

const KV_DE_DESENVOLVIMENTO = { salas: new KVEmMemoria(), relatos: new KVEmMemoria() };

export function createApiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> => {
    const url = req.url || '';
    if (!url.startsWith('/api/v1/')) {
      return next();
    }

    try {
      const body = await readBody(req);
      const response = await handleApiRequest(toWebRequest(req, body), resolveEnv(), {
        ipAddress: req.socket.remoteAddress,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      });
      await writeWebResponse(res, response);
    } catch (error) {
      res.statusCode = error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Falha interna da autoridade.' } }));
    }
  };
}
