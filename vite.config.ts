import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { createApiMiddleware } from './server/adapters/vite-middleware';

/**
 * Em desenvolvimento, o MESMO roteador de API que a Cloudflare Pages Function
 * usa em produção é servido pelo dev server. Isso elimina a divergência
 * dev↔produção que fazia os endpoints existirem só no `vite dev`
 * (CLAUDE_AUDIT.md B-01).
 */
function apiAuthorityPlugin(): Plugin {
  return {
    name: 'api-server-authority',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware());
    },
  };
}

export default defineConfig(({ mode }) => {
  // Segredos do servidor NÃO usam o prefixo VITE_ e, portanto, nunca são
  // injetados no bundle do cliente. São lidos apenas pelo middleware Node.
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GOOGLE_OAUTH_CLIENT_ID = env.GOOGLE_OAUTH_CLIENT_ID;
  process.env.ADMIN_ALLOWLIST = env.ADMIN_ALLOWLIST;
  process.env.SESSION_SIGNING_SECRET = env.SESSION_SIGNING_SECRET;
  process.env.AUDIT_SIGNING_SECRET = env.AUDIT_SIGNING_SECRET;
  process.env.ALLOWED_ORIGIN = env.ALLOWED_ORIGIN || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss(), apiAuthorityPlugin()],
    server: { port: 3000, host: '0.0.0.0' },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  };
});
