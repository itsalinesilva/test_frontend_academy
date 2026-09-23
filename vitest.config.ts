import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';

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
     *
     * SUBIU PARA 60 QUANDO O CATALOGO PASSOU A SER IMPORTADO.
     *
     * As vinte e cinco mil obras chegavam por `fetch`, que em teste nunca
     * respondia — e a suite inteira rodava sobre as dezessete obras do
     * repertorio proprio, sem que nada dissesse isso. O caminho que carrega o
     * acervo de verdade nao era exercitado por teste nenhum.
     *
     * Importado, o arquivo de cinco megabytes e lido e convertido de fato, em
     * cada arquivo de teste que toca o acervo. Isso custa segundos, e sao
     * segundos gastos exercitando o codigo que vai para o navegador. O preco
     * e o certo: o barato de antes era nao testar.
     */
    testTimeout: 60000,
    /*
     * METADE DOS NUCLEOS, e nao o padrao (todos menos um).
     *
     * Cada processo carrega e converte o catalogo de cinco megabytes. Com onze
     * processos numa maquina de doze nucleos e 17 GB, eles disputavam memoria:
     * em 2026-09-22 a suite completa levou de 113 a mais de 270 segundos, e
     * duas rodadas falharam por tempo esgotado em arquivos que nao tinham
     * mudado. Com seis, medido na mesma maquina: 110 segundos, verde.
     *
     * Paralelismo alem do que a memoria aguenta nao acelera — troca espera por
     * falha intermitente, que ensina a ignorar vermelho.
     */
    maxWorkers: Math.max(2, Math.floor(os.cpus().length / 2)),
    minWorkers: 1,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
