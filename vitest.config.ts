import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // `node` é o padrão para domínio, serviços e autoridade de servidor.
    // Testes de componente declaram `// @vitest-environment jsdom` na
    // primeira linha do arquivo — mais explícito que um glob, e não
    // depende de API depreciada.
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
