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

const raiz = resolve(__dirname, '..');

interface Checagem {
  nome: string;
  gravidade: 'bloqueia' | 'corrigir' | 'observar';
  achados: number;
  detalhes: { arquivo: string; linha?: number; detalhe?: string }[];
}

const relatorio = (() => {
  const saida = execFileSync('node', ['scripts/qa.mjs', '--json'], {
    cwd: raiz,
    encoding: 'utf-8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(saida) as {
    rotas: number;
    telas: number;
    telasQueDistinguemVisitante: number;
    checagens: Checagem[];
  };
})();

const checagem = (nome: string): Checagem => {
  const c = relatorio.checagens.find((x) => x.nome === nome);
  if (!c) throw new Error(`o pente fino não tem a verificação "${nome}"`);
  return c;
};

/** Mostra ONDE está o problema, não só quantos são. */
const onde = (c: Checagem) =>
  c.detalhes
    .slice(0, 8)
    .map((d) => `\n  ${d.arquivo}${d.linha ? `:${d.linha}` : ''} — ${d.detalhe ?? ''}`)
    .join('');

describe('o que bloqueia publicar fica em zero', () => {
  const bloqueantes = relatorio.checagens.filter((c) => c.gravidade === 'bloqueia');

  it('há verificações bloqueantes de verdade, e não uma lista vazia', () => {
    // Protege contra o pente fino ser desligado sem ninguém notar.
    expect(bloqueantes.length).toBeGreaterThanOrEqual(15);
  });

  for (const c of bloqueantes) {
    it(c.nome, () => {
      expect(c.achados, onde(c)).toBe(0);
    });
  }
});

describe('a dívida de acessibilidade é contada, e só diminui', () => {
  /**
   * Estes tetos são o estado real de hoje, medido — não uma meta.
   *
   * Cada um deles é uma linha aberta em `CLAUDE_TODO.md`. Baixar o número
   * aqui é o que registra o progresso; subir é o que a suíte impede.
   */
  const TETO: Record<string, number> = {
    'todo botão tem nome acessível': 13,
    'todo campo tem rótulo': 94,
    'toda imagem tem alt': 0,
    'todo clicável alcançável pelo teclado': 22,
  };

  for (const [nome, teto] of Object.entries(TETO)) {
    it(`${nome} — no máximo ${teto}`, () => {
      const c = checagem(nome);
      expect(
        c.achados,
        `subiu de ${teto} para ${c.achados}. ${onde(c)}`
      ).toBeLessThanOrEqual(teto);
    });
  }
});

describe('a plataforma inteira continua alcançável', () => {
  it('toda tela tem rota, e toda rota declara a quem serve', () => {
    expect(relatorio.telas).toBeGreaterThan(70);
    expect(checagem('nenhuma tela órfã').achados).toBe(0);
  });

  it('o número de telas que distinguem visitante não regride', () => {
    // 42 de 81 hoje. As demais estão listadas em CLAUDE_TODO.md.
    expect(relatorio.telasQueDistinguemVisitante).toBeGreaterThanOrEqual(42);
  });
});
