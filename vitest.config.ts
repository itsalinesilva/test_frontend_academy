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
    /*
     * 20 segundos, e nao os 5 padrao.
     *
     * A derivacao de senha das contas infantis usa PBKDF2 com 210 mil
     * iteracoes — ela e LENTA DE PROPOSITO, porque e isso que encarece o
     * ataque de dicionario. Um teste que exercita varias derivacoes seguidas
     * leva segundos legitimamente, e mais ainda numa maquina ocupada.
     *
     * Baixar as iteracoes para o teste passar seria enfraquecer a protecao
     * de uma crianca para poupar quinze segundos de suite.
     */
    testTimeout: 20000,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
