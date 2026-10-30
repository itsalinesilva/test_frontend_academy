import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A curadoria do relatório, como passo da suíte.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * ---------------------------
 * As sete perguntas — está pronto, curado, persistente, com fluxo completo,
 * protegido, integrado, sincronizado — eram respondidas **em prosa**, uma vez,
 * na conversa. E ali morriam. No dia seguinte ninguém sabia o que estava
 * respondido, e o que faltava dependia de alguém lembrar de anotar.
 *
 * Lembrar não é mecanismo. Um relatório que não vira fila não serve, e mapear
 * tudo sem sanar na ordem certa é trabalho perdido duas vezes: gasta-se para
 * descobrir e gasta-se de novo para redescobrir.
 *
 * Por isso a curadoria é **teste**, e não comando. Quem roda a suíte cura o
 * relatório; quem esquece de curar vê a suíte falhar. As duas coisas passaram
 * a ser a mesma execução, que é a única forma de não se perder.
 */

const raiz = resolve(__dirname, '..');
const TODO = resolve(raiz, 'CLAUDE_TODO.md');

const ler = () => readFileSync(TODO, 'utf-8');

describe('o relatório de prontidão está curado', () => {
  it('a seção existe, e é a prioritária', () => {
    const doc = ler();
    expect(doc).toContain('## CURADORIA DO RELATÓRIO DE TESTES');
    expect(doc.indexOf('## CURADORIA DO RELATÓRIO DE TESTES')).toBeLessThan(
      doc.indexOf('# A ORDEM')
    );
  });

  it('o bloco gerado está atualizado', () => {
    /**
     * Regenera e compara. Se o arquivo em disco divergir do que a apuração de
     * agora produz, a suíte falha — e a mensagem diz o comando que conserta.
     *
     * A data sai da comparação: ela muda todo dia e não é conteúdo.
     */
    const antes = ler();
    execFileSync('node', ['scripts/sync-todo.mjs'], { cwd: raiz, encoding: 'utf-8' });
    const depois = ler();

    const semData = (t: string) => t.replace(/apuradas em \d{4}-\d{2}-\d{2}/g, 'apuradas em DATA');

    expect(
      semData(depois),
      'o relatório estava desatualizado. Rode `node scripts/sync-todo.mjs` e confira o diff.'
    ).toBe(semData(antes));
  });

  it('o que é adiado não mora aqui', () => {
    // A divisão existe porque misturar fazia o urgente sumir no meio do adiado.
    const doc = ler();
    expect(doc).toContain('CLAUDE_BACKLOG.md');
    expect(doc).not.toContain('# DETALHE POR ÁREA');
  });

  it('toda pendência da fila diz o que falta', () => {
    /**
     * Pendência sem descrição é pendência que ninguém consegue pegar para
     * resolver — e foi por isso que tantas ficaram paradas.
     */
    const doc = ler();
    const fila = doc
      .split('### Fila, na ordem em que deve ser resolvida')[1]
      ?.split('### O que estas sete perguntas NÃO respondem')[0] ?? '';

    for (const linha of fila.split('\n')) {
      if (!/^\| \d+ \|/.test(linha)) continue;
      const colunas = linha.split('|').map((c) => c.trim());
      expect(colunas[colunas.length - 2].length, linha).toBeGreaterThan(10);
    }
  });
});
