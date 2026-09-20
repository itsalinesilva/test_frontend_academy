/**
 * EXTRAÇÃO DE PARTITURAS — Mutopia Project.
 *
 * POR QUE ESTA FONTE, E NÃO OUTRA
 * -------------------------------
 * É a única do nível 1 da hierarquia que autoriza redistribuição
 * explicitamente e permite rastreamento — o `robots.txt` dela tem `Disallow:`
 * vazio, e a licença de cada peça vem declarada na própria listagem.
 *
 * E dá **LilyPond e MIDI**, não só PDF. Isso é decisivo: com a fonte simbólica
 * a plataforma renderiza a pauta nativamente e liga a peça à prática. PDF seria
 * imagem morta.
 *
 * O QUE ELE TRAZ, E O QUE NÃO TRAZ
 * --------------------------------
 * Traz a **referência**: título, compositor, estilo, licença declarada, e as
 * URLs do `.ly` e do `.mid`. Não baixa os arquivos — eles ficam onde estão, e
 * a plataforma os busca quando a obra é aberta.
 *
 * Baixar milhares de arquivos para dentro do repositório seria carregar peso
 * que o navegador não precisa ter antes de alguém pedir.
 *
 * A LICENÇA É LIDA, E NÃO PRESUMIDA
 * ---------------------------------
 * Cada peça declara a sua. Há domínio público e há Creative Commons com
 * exigência de atribuição, e as duas coisas obrigam a plataforma a coisas
 * diferentes. Peça sem licença legível **não entra**.
 */
import { writeFileSync } from 'node:fs';

const UA = { 'User-Agent': 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)' };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Os instrumentos que interessam ao Conservatório agora.
 *
 * A lista cresce com as Casas. Violino primeiro porque é a única Casa com
 * corpus, e piano e voz porque cobrem a maior parte do repertório de estudo.
 */
const INSTRUMENTOS = ['Violin', 'Piano', 'Voice', 'Guitar', 'Cello', 'Flute'];

/** Estilo do Mutopia → era do Atlas. */
const ERA_DO_ESTILO = {
  Medieval: 'era_medieval',
  Renaissance: 'era_renascimento',
  Baroque: 'era_barroco',
  Classical: 'era_classicismo',
  Romantic: 'era_romantismo',
  Modern: 'era_moderna',
  Jazz: 'era_contemporanea',
  Country: 'era_contemporanea',
  Folk: undefined,
};

const limpar = (s) =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

/**
 * Cada peça é uma tabela interna. Recortar por ela é mais seguro que casar
 * campo a campo num documento de vinte mil caracteres.
 */
function fatiar(html) {
  return html.split('<table class="table-bordered result-table">').slice(1);
}

function lerPeca(bloco, instrumento) {
  const celulas = [...bloco.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
  if (celulas.length < 8) return null;

  const titulo = limpar(celulas[0]).replace(/^\d+\.\s*/, '');
  const compositor = limpar(celulas[1]);
  const estilo = limpar(celulas[6]);
  const descricao = limpar(celulas[8] ?? '');
  const licenca = limpar(celulas[9] ?? '');

  const idInfo = bloco.match(/piece-info\.cgi\?id=(\d+)/)?.[1];
  const ly = bloco.match(/href="([^"]+\.ly)"/)?.[1];
  const midi = bloco.match(/href="([^"]+-mids\.zip)"/)?.[1];
  const pdf = bloco.match(/href="([^"]+-a4\.pdf)"/)?.[1];
  const preview = bloco.match(/href="([^"]+-preview\.png)"/)?.[1];

  /**
   * Sem licença legível, a peça NÃO entra. É a regra que separa este acervo de
   * uma raspagem: o que se publica é o que se sabe poder publicar.
   */
  if (!titulo || !licenca || !ly) return null;

  return {
    idMutopia: idInfo,
    titulo,
    compositor: compositor || 'Anônimo',
    instrumento,
    estilo,
    eraId: ERA_DO_ESTILO[estilo],
    descricao: descricao || undefined,
    licenca,
    ly,
    midi,
    pdf,
    preview,
  };
}

async function main() {
  const todas = new Map();
  const erros = [];

  for (const inst of INSTRUMENTOS) {
    process.stdout.write(`· ${inst.padEnd(10)}`);
    let n = 0;

    /**
     * A listagem pagina de dez em dez.
     *
     * Sem `startat`, a resposta traz só a primeira página — e a extração
     * inteira devolvia trinta e seis peças sobre um acervo de milhares. Página
     * vazia encerra; teto de segurança para o caso de o formato mudar e o
     * laço nunca terminar.
     */
    for (let inicio = 0; inicio < 3000; inicio += 10) {
      try {
        const r = await fetch(
          `https://www.mutopiaproject.org/cgibin/make-table.cgi?Instrument=${encodeURIComponent(
            inst
          )}&startat=${inicio}`,
          { headers: UA, signal: AbortSignal.timeout(30000) }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);

        const blocos = fatiar(await r.text());
        if (blocos.length === 0) break;

        for (const bloco of blocos) {
          const p = lerPeca(bloco, inst);
          if (!p) continue;
          // a mesma peça aparece em mais de um instrumento quando é de conjunto
          if (!todas.has(p.ly)) {
            todas.set(p.ly, p);
            n++;
          }
        }
      } catch (e) {
        erros.push(`${inst}@${inicio}: ${e.message}`);
        break;
      }
      await dormir(250);
    }
    console.log(`${n} peças`);
  }

  const lista = [...todas.values()];
  writeFileSync('scripts/.mutopia-extraido.json', JSON.stringify({ pecas: lista, erros }, null, 1), 'utf-8');

  const porLicenca = {};
  for (const p of lista) porLicenca[p.licenca] = (porLicenca[p.licenca] ?? 0) + 1;
  const porEra = {};
  for (const p of lista) porEra[p.eraId ?? 'sem era'] = (porEra[p.eraId ?? 'sem era'] ?? 0) + 1;

  console.log(`\n✓ ${lista.length} peças com partitura`);
  console.log(`  com MIDI: ${lista.filter((p) => p.midi).length}`);
  console.log(`  licenças: ${JSON.stringify(porLicenca)}`);
  console.log(`  por era : ${JSON.stringify(porEra)}`);
  if (erros.length) console.log(`  erros   : ${erros.length}`);
}

main().catch((e) => {
  console.error('falhou:', e);
  process.exit(1);
});
