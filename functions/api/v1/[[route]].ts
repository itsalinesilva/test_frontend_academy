/**
 * Cloudflare Pages Function — ponto de entrada da API em PRODUÇÃO.
 *
 * Captura todo `/api/v1/*` e delega ao roteador agnóstico de runtime.
 * É a peça que faltava: até aqui a API existia apenas no hook
 * `configureServer` do Vite e desaparecia no build (CLAUDE_AUDIT.md B-01).
 *
 * Segredos são configurados no painel do Cloudflare Pages
 * (Settings → Environment variables), nunca no código. Ver `.env.example`.
 */

import { handleApiRequest, ServerEnv } from '../../../server/core/api-router';

interface PagesContext {
  request: Request;
  env: ServerEnv;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;

  return handleApiRequest(request, env, {
    ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
    userAgent: request.headers.get('User-Agent') || undefined,
  });
};
