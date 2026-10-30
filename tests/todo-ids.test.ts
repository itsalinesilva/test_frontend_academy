import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * 🔴 ID DE ITEM NO TODO NÃO SE REPETE.
 *
 * Em 2026-09-22 três itens novos foram registrados como NV-3, NV-4 e NV-5 — o
 * prefixo já era do nivelamento, e a atualização por ID SOBRESCREVEU o NV-5
 * original. Item apagado do TODO é trabalho que some da memória do projeto.
 *
 * Havia 31 IDs repetidos antes dessa regra, de seções que reusaram prefixo.
 * Renumerá-los quebraria as referências nos commits antigos; ficam
 * congelados aqui. Repetição NOVA falha.
 */
const REPETIDOS_CONHECIDOS = new Set(
  'AC-3 AC-4 AC-5 AC-6 AC-7 AT-6 B-7 FL-1 M-1 M-10 M-11 M-2 M-3 M-4 M-5 M-6 M-7 M-8 M-9 NV-1 NV-2 S-1 S-10 S-2 S-3 S-4 S-5 S-6 S-7 S-8 S-9'.split(
    ' '
  )
);

describe('IDs do CLAUDE_TODO', () => {
  const ids = [...readFileSync('CLAUDE_TODO.md', 'utf8').matchAll(/^\| ([A-Z][A-Z0-9]*-\d+[a-z]?) \|/gm)].map(
    (m) => m[1]
  );

  it('a varredura acha os itens — e não está vazia', () => {
    expect(ids.length).toBeGreaterThan(400);
  });

  it('nenhum ID novo se repete', () => {
    const vistos = new Map<string, number>();
    for (const id of ids) vistos.set(id, (vistos.get(id) ?? 0) + 1);
    const novos = [...vistos].filter(([id, n]) => n > 1 && !REPETIDOS_CONHECIDOS.has(id)).map(([id]) => id);
    expect(novos, 'ID repetido: escolha um prefixo próprio para a série nova').toEqual([]);
  });
});
