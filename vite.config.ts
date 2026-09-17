import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { createApiMiddleware } from './src/server/middleware/api-middleware';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-authority',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
