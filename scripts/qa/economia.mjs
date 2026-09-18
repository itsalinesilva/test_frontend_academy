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
import { fontes } from './nucleo.mjs';

const DOC = 'docs/harness/76_ECONOMIA_DE_PROGRESSO.md';

/** As linhas de tabela da §2, já separadas em colunas. */
function linhasDaContagem() {
  const doc = readFileSync(DOC, 'utf-8');
  const secao = doc.split('## 2 · Tabela de contagem')[1]?.split('\n## ')[0] ?? '';

  return secao
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map((l, i) => ({
      linha: l,
      numero: doc.slice(0, doc.indexOf(l)).split('\n').length,
      colunas: l.split('|').slice(1, -1).map((c) => c.trim()),
      ordem: i,
    }))
    .filter((r) => r.colunas.length >= 3 && !/^-+:?$|^:?-+/.test(r.colunas[0]));
}

/**
 * Símbolo afirmado na coluna "Onde" que não existe no código.
 *
 * Só olha o que a tabela afirma sem `⏳`. Prosa como "idem" ou "fim da rodada"
 * não é símbolo e não se confere — está anotado como não coberto.
 */
export function checarSimboloDaContagem() {
  const codigo = fontes()
    .map((f) => f.conteudo)
    .join('\n');
  const achados = [];

  for (const r of linhasDaContagem()) {
    const onde = r.colunas[r.colunas.length - 1];
    if (onde.includes('⏳')) continue;

    for (const [, simbolo] of onde.matchAll(/`([^`]+)`/g)) {
      // `a.b.c` e `a.b === true`: o que se procura é o identificador final.
      const nome = simbolo.split(/[.\s]/).filter(Boolean).pop()?.replace(/[()]/g, '');
      if (!nome || nome.length < 4 || /^(true|false|null)$/.test(nome)) continue;
      if (!codigo.includes(nome)) {
        achados.push({
          arquivo: DOC,
          linha: r.numero,
          detalhe: `a tabela afirma \`${nome}\`, que não existe no código — implemente ou marque ⏳`,
        });
      }
    }
  }
  return achados;
}

/** Vocabulário do Atlas: "ilha" foi removida, e a contagem não pode ressuscitá-la. */
export function checarVocabularioDaContagem() {
  const PROIBIDAS = [
    ['ilha', 'tribo (grupo) ou região (lugar) — ver 75_TAXONOMIA_DO_ATLAS.md'],
    ['ranking', 'classificação'],
    ['streak', 'ofensiva'],
  ];
  const achados = [];

  for (const r of linhasDaContagem()) {
    for (const [errada, certa] of PROIBIDAS) {
      const encontrou = new RegExp(`(^|[^a-zà-ú])${errada}s?([^a-zà-ú]|$)`, 'i').test(r.linha);
      if (encontrou) {
        achados.push({
          arquivo: DOC,
          linha: r.numero,
          detalhe: `"${errada}" na tabela de contagem; o termo é ${certa}`,
        });
      }
    }
  }
  return achados;
}

/**
 * XP atribuído no código com número que a tabela não prevê.
 *
 * Procura atribuição literal de XP. Valor vindo de variável ou de tabela em
 * outro arquivo não dá para conferir por leitura estática, e está anotado
 * como não coberto.
 */
export function checarValorForaDaTabela() {
  const previstos = new Set(
    linhasDaContagem()
      .flatMap((r) => r.colunas.slice(1, 3))
      .map((c) => c.replace(/\*/g, '').trim())
      .filter((c) => /^\d+$/.test(c))
  );
  if (previstos.size === 0) return [];

  const achados = [];
  for (const { arquivo, codigo } of fontes()) {
    if (!/\/(domain|services|repositories)\//.test(arquivo)) continue;

    for (const [i, linha] of codigo.split('\n').entries()) {
      for (const m of linha.matchAll(/\bxp\w*\s*[:=]\s*(\d+)\b/gi)) {
        const valor = m[1];
        if (valor === '0' || previstos.has(valor)) continue;
        achados.push({
          arquivo,
          linha: i + 1,
          detalhe: `atribui ${valor} de XP, e a tabela de contagem não prevê esse valor`,
        });
      }
    }
  }
  return achados;
}
