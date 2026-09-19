import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * O pente fino dentro da suíte.
 *
 * `npm run qa` existe para ser lido por gente. Este arquivo existe para que
 * ninguém precise lembrar de rodá-lo: cada propriedade que já foi corrigida
 * vira um caso de teste, e voltar a quebrá-la quebra a suíte.
 *
 * A distinção entre o que BLOQUEIA e o que está a CORRIGIR é deliberada. As
 * verificações bloqueantes têm de ficar em zero, porque descrevem a
 * plataforma mentindo — dado inventado, botão que não age, vazamento entre
 * alunos. As de acessibilidade ainda têm dívida aberta, contada em
 * `CLAUDE_TODO.md`; travá-las em zero hoje seria transformar a suíte em
 * mentira também.
 *
 * O teto delas, porém, é conferido. Ele só desce.
 */

const root = resolve(__dirname, '..');

interface Checagem {
  nome: string;
  severity: 'bloqueia' | 'corrigir' | 'observar';
  findings: number;
  details: { file: string; line?: number; detail?: string }[];
}

const reportJson = (() => {
  const output = execFileSync('node', ['scripts/qa.mjs', '--json'], {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(output) as {
    routes: number;
    screens: number;
    screensDistinguishingVisitor: number;
    checks: Checagem[];
  };
})();

const checkNamed = (nome: string): Checagem => {
  const c = reportJson.checks.find((x) => x.nome === nome);
  if (!c) throw new Error(`o pente fino não tem a verificação "${nome}"`);
  return c;
};

/** Mostra ONDE está o problema, não só quantos são. */
const where = (c: Checagem) =>
  c.details
    .slice(0, 8)
    .map((d) => `\n  ${d.file}${d.line ? `:${d.line}` : ''} — ${d.detail ?? ''}`)
    .join('');

describe('o que bloqueia publicar fica em zero', () => {
  const blocking = reportJson.checks.filter((c) => c.severity === 'bloqueia');

  it('há verificações bloqueantes de verdade, e não uma lista vazia', () => {
    // Protege contra o pente fino ser desligado sem ninguém notar.
    expect(blocking.length).toBeGreaterThanOrEqual(15);
  });

  for (const c of blocking) {
    it(c.nome, () => {
      expect(c.findings, where(c)).toBe(0);
    });
  }
});

describe('acessibilidade', () => {
  /**
   * Estes tetos começaram em 13, 94, 0 e 22 — a dívida real medida quando o
   * pente fino passou a procurá-la. Hoje são todos zero: as 129 correções
   * foram feitas.
   *
   * Continuam escritos como teto, e não como igualdade a zero, porque é a
   * forma que registra o caminho: se voltar a subir, a suíte diz de quanto
   * para quanto, e em qual arquivo.
   */
  const CEILING: Record<string, number> = {
    'todo botão tem nome acessível': 0,
    'todo campo tem rótulo': 0,
    'toda imagem tem alt': 0,
    'todo clicável alcançável pelo teclado': 0,
  };

  for (const [nome, ceiling] of Object.entries(CEILING)) {
    it(`${nome} — no máximo ${ceiling}`, () => {
      const c = checkNamed(nome);
      expect(
        c.findings,
        `subiu de ${ceiling} para ${c.findings}. ${where(c)}`
      ).toBeLessThanOrEqual(ceiling);
    });
  }
});

describe('a economia de progresso não envelhece em silêncio', () => {
  /**
   * `76_PROGRESS_ECONOMY.md` se declara a autoridade sobre XP, score,
   * ofensiva e débito. Uma autoridade que envelhece sem avisar é pior que
   * nenhuma: quem lê confia, e o código já faz outra coisa.
   *
   * As duas verificações bloqueantes entram sozinhas no laço acima. Esta,
   * que é de vocabulário, fica travada aqui — "ilha" já voltou uma vez pela
   * tabela de contagem depois de removida do domínio.
   */
  it('o vocabulário do Atlas não regride na tabela de contagem', () => {
    const c = checkNamed('o vocabulário do Atlas está certo na contagem');
    expect(c.findings, where(c)).toBe(0);
  });
});

describe('a plataforma inteira continua alcançável', () => {
  it('toda tela tem rota, e toda rota declara a quem serve', () => {
    expect(reportJson.screens).toBeGreaterThan(70);
    expect(checkNamed('nenhuma tela órfã').findings).toBe(0);
  });

  it('o número de telas que distinguem visitante não regride', () => {
    // 42 de 81 hoje. As demais estão listadas em CLAUDE_TODO.md.
    expect(reportJson.screensDistinguishingVisitor).toBeGreaterThanOrEqual(42);
  });
});
