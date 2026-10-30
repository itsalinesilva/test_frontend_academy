/**
 * AS BIOGRAFIAS DO CORPUS BRASILEIRO.
 *
 * A listagem de compositores dá nome, datas e link. A **biografia** só existe
 * na página de cada um — e é ela que faz a ficha ser ficha em vez de um nome
 * com dois anos ao lado.
 *
 * Os 783 brasileiros entraram sem biografia nenhuma enquanto os 225 do
 * catálogo ocidental têm a da Wikidata. Uma ficha vazia num acervo onde as
 * outras são cheias não parece "fonte não publica": parece descuido.
 *
 * O `robots.txt` da fonte libera `/pt-br/compositores/`. Proíbe `/media/`, que
 * é onde vive o retrato — e por isso o retrato continua de fora.
 *
 * Uma requisição por vez, com pausa. São setecentas e cinquenta e seis.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const UA = 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)';
const PAUSA_MS = 600;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const dados = JSON.parse(readFileSync('scripts/.musica-brasilis.json', 'utf-8'));

const limpo = (s) =>
  (s ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * A biografia vive num bloco de texto corrido depois do nome e das datas.
 *
 * A página repete o texto duas vezes — uma versão curta com reticências para
 * a prévia, e a inteira logo abaixo. Fica a MAIOR: a curta termina em "…" no
 * meio de uma frase, e publicar isso seria publicar meia informação.
 */
function lerBiografia(html) {
  const corpo = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ');

  const paragrafos = [...corpo.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => limpo(m[1].replace(/<[^>]+>/g, ' ')))
    .filter((t) => t.length > 120)
    /** Fora o texto institucional do rodapé, que aparece em toda página. */
    .filter((t) => !/Música Brasilis é/i.test(t) && !/política de privacidade/i.test(t));

  if (paragrafos.length === 0) return undefined;

  const maior = paragrafos.sort((a, b) => b.length - a.length)[0];
  /** Prévia truncada não serve: ou a biografia inteira, ou nenhuma. */
  return /…$|\.\.\.$/.test(maior) ? undefined : maior;
}

async function main() {
  const saida = [];
  let comBio = 0;

  for (const [i, c] of dados.compositores.entries()) {
    try {
      const r = await fetch(c.url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) {
        const bio = lerBiografia(await r.text());
        if (bio) comBio += 1;
        saida.push({ idNaFonte: c.idNaFonte, nome: c.nome, biografia: bio });
      } else {
        saida.push({ idNaFonte: c.idNaFonte, nome: c.nome });
      }
    } catch {
      /** Falha de uma ficha não derruba as outras: ela fica sem biografia. */
      saida.push({ idNaFonte: c.idNaFonte, nome: c.nome });
    }

    if (i % 25 === 0) process.stdout.write(`\r  ${i + 1}/${dados.compositores.length} · ${comBio} com biografia`);
    await dormir(PAUSA_MS);
  }

  /**
   * NÃO-VACUIDADE. Se quase ninguém tiver biografia, a leitura quebrou — e
   * gravar um arquivo vazio faria a próxima etapa concluir que a fonte não
   * publica biografia, que é falso.
   */
  if (comBio < 300) {
    console.error(`\n✗ só ${comBio} biografias de ${dados.compositores.length}. A leitura quebrou.`);
    process.exit(1);
  }

  writeFileSync('scripts/.brasilis-fichas.json', JSON.stringify(saida), 'utf-8');
  console.log(`\n✓ scripts/.brasilis-fichas.json`);
  console.log(`  ${saida.length} fichas · ${comBio} com biografia`);
}

main();
