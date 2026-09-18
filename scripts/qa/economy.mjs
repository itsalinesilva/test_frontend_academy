/**
 * Pente fino da economia de progresso.
 *
 * `76_ECONOMIA_DE_PROGRESSO.md` declara-se **a autoridade**: valor que não
 * está na tabela de contagem não é atribuído. Uma autoridade que envelhece em
 * silêncio é pior que nenhuma — quem lê confia, e o código já não faz aquilo.
 *
 * Três coisas podem apodrecer ali, e nenhuma aparece na leitura:
 *
 * 1. A tabela nomeia um símbolo do código que **não existe**. Foi assim que
 *    `ISLAND_VISITED`, `STAGE_COMPLETED` e `REPERTOIRE_PERFORMED` ficaram
 *    escritos como se fossem implementação. Documentar código inexistente é a
 *    mesma falha de declarar pronto o que não está, em forma de documento.
 *
 * 2. O código atribui XP com um número que **não está na tabela**. Aí a
 *    autoridade passou a ser o código, e ninguém foi avisado.
 *
 * 3. O vocabulário do Atlas volta a escorregar — "ilha" foi removida do
 *    projeto e a tabela ainda a contabilizava.
 *
 * O `⏳` na coluna **Onde** marca o que ainda não existe. É declaração
 * explícita de pendência, e por isso não falha: o que falha é o símbolo
 * afirmado sem ressalva.
 */
import { readFileSync } from 'node:fs';
import { sources } from './core.mjs';

const DOC = 'docs/harness/76_ECONOMIA_DE_PROGRESSO.md';

/** As linhas de tabela da §2, já separadas em colunas. */
function countingRows() {
  const doc = readFileSync(DOC, 'utf-8');
  const section = doc.split('## 2 · Tabela de contagem')[1]?.split('\n## ')[0] ?? '';

  return section
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map((l, i) => ({
      line: l,
      lineNumber: doc.slice(0, doc.indexOf(l)).split('\n').length,
      columns: l.split('|').slice(1, -1).map((c) => c.trim()),
      order: i,
    }))
    .filter((r) => r.columns.length >= 3 && !/^-+:?$|^:?-+/.test(r.columns[0]));
}

/**
 * Símbolo afirmado na coluna "Onde" que não existe no código.
 *
 * Só olha o que a tabela afirma sem `⏳`. Prosa como "idem" ou "fim da rodada"
 * não é símbolo e não se confere — está anotado como não coberto.
 */
export function checkCountingSymbol() {
  const code = sources()
    .map((f) => f.content)
    .join('\n');
  const findings = [];

  for (const r of countingRows()) {
    const where = r.columns[r.columns.length - 1];
    if (where.includes('⏳')) continue;

    for (const [, symbol] of where.matchAll(/`([^`]+)`/g)) {
      // `a.b.c` e `a.b === true`: o que se procura é o identificador final.
      const nome = symbol.split(/[.\s]/).filter(Boolean).pop()?.replace(/[()]/g, '');
      if (!nome || nome.length < 4 || /^(true|false|null)$/.test(nome)) continue;
      if (!code.includes(nome)) {
        findings.push({
          file: DOC,
          line: r.lineNumber,
          detail: `a tabela afirma \`${nome}\`, que não existe no código — implemente ou marque ⏳`,
        });
      }
    }
  }
  return findings;
}

/** Vocabulário do Atlas: "ilha" foi removida, e a contagem não pode ressuscitá-la. */
export function checkCountingVocabulary() {
  const FORBIDDEN = [
    ['ilha', 'tribo (grupo) ou região (lugar) — ver 75_TAXONOMIA_DO_ATLAS.md'],
    ['ranking', 'classificação'],
    ['streak', 'ofensiva'],
  ];
  const findings = [];

  for (const r of countingRows()) {
    for (const [wrong, right] of FORBIDDEN) {
      const found = new RegExp(`(^|[^a-zà-ú])${wrong}s?([^a-zà-ú]|$)`, 'i').test(r.line);
      if (found) {
        findings.push({
          file: DOC,
          line: r.lineNumber,
          detail: `"${wrong}" na tabela de contagem; o termo é ${right}`,
        });
      }
    }
  }
  return findings;
}

/**
 * XP atribuído no código com número que a tabela não prevê.
 *
 * Procura atribuição literal de XP. Valor vindo de variável ou de tabela em
 * outro arquivo não dá para conferir por leitura estática, e está anotado
 * como não coberto.
 */
export function checkValueOutsideTable() {
  const expected = new Set(
    countingRows()
      .flatMap((r) => r.columns.slice(1, 3))
      .map((c) => c.replace(/\*/g, '').trim())
      .filter((c) => /^\d+$/.test(c))
  );
  if (expected.size === 0) return [];

  const findings = [];
  for (const { file, code } of sources()) {
    if (!/\/(domain|services|repositories)\//.test(file)) continue;

    for (const [i, line] of code.split('\n').entries()) {
      for (const m of line.matchAll(/\bxp\w*\s*[:=]\s*(\d+)\b/gi)) {
        const valor = m[1];
        if (valor === '0' || expected.has(valor)) continue;
        findings.push({
          file,
          line: i + 1,
          detail: `atribui ${valor} de XP, e a tabela de contagem não prevê esse valor`,
        });
      }
    }
  }
  return findings;
}

/** As constantes de `XP` no código, lidas do único módulo autorizado a declará-las. */
function xpConstants() {
  const src = readFileSync('src/domain/progress-economy.ts', 'utf-8');
  const bloco = src.split('export const XP = {')[1]?.split('} as const;')[0] ?? '';
  const table = new Map();
  for (const m of bloco.matchAll(/^\s*([A-Z_]+):\s*(\d+)\s*,/gm)) {
    table.set(m[1], Number(m[2]));
  }
  return table;
}

/**
 * Valor da tabela que diverge da constante do código.
 *
 * Existir não basta: `XP.EXERCICIO_ACERTADO` pode existir valendo 25 enquanto
 * a tabela promete 40. Foi divergência silenciosa desse tipo que deixou o
 * perfil anunciar 1920 de XP e nivel 12 a quem nunca praticou.
 */
export function checkDivergentValue() {
  const constantes = xpConstants();
  const findings = [];

  if (constantes.size === 0) {
    return [
      {
        file: 'src/domain/progress-economy.ts',
        detail: 'nenhuma constante de XP encontrada — a verificação ficaria vazia',
      },
    ];
  }

  for (const r of countingRows()) {
    const where = r.columns[r.columns.length - 1];
    const declared = r.columns[1].replace(/\*/g, '').trim();
    if (!/^\d+$/.test(declared)) continue;

    for (const [, ref] of where.matchAll(/`XP\.([A-Z_]+)`/g)) {
      if (!constantes.has(ref)) {
        findings.push({
          file: DOC,
          line: r.lineNumber,
          detail: `a tabela cita \`XP.${ref}\`, que não existe em progress-economy.ts`,
        });
        continue;
      }
      const inCode = constantes.get(ref);
      if (inCode !== Number(declared)) {
        findings.push({
          file: DOC,
          line: r.lineNumber,
          detail: `a tabela promete ${declared} e \`XP.${ref}\` vale ${inCode}`,
        });
      }
    }
  }
  return findings;
}
