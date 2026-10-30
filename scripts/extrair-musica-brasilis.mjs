/**
 * O CORPUS BRASILEIRO — Música Brasilis.
 *
 * POR QUE ESTA FONTE, E POR QUE ELA É PRIMÁRIA AQUI
 * -------------------------------------------------
 * O Brasil aparecia no acervo com **quatro compositores**: Villa-Lobos, Carlos
 * Gomes, Camargo Guarnieri e Francisco Mignone. Não porque o repertório seja
 * pequeno — é porque a catalogação de origem é do concerto ocidental, e ela
 * cobre o Brasil como cobre qualquer periferia: pelos poucos nomes que
 * atravessaram.
 *
 * Música Brasilis cataloga o corpus brasileiro como corpus, e não como
 * apêndice. Para este acervo ela é **fonte primária do Brasil**, e não
 * complemento de partitura.
 *
 * O QUE A POLÍTICA DA FONTE PERMITE
 * ---------------------------------
 * O `robots.txt` foi lido antes de qualquer requisição. Ele proíbe `/admin` e
 * **`/media/`** — que é justamente onde ficam os arquivos e as imagens. O resto
 * é liberado.
 *
 * Logo: **ficha sim, arquivo não**. Nenhum PDF é baixado, nenhuma imagem é
 * buscada, e o retrato do compositor **não é usado** — exibi-lo seria
 * hospedar-se na banda de um projeto que pediu para não rastrearem aquele
 * diretório. O catálogo registra que a partitura existe e aponta para a página
 * dela na fonte, que é onde o download deve acontecer.
 *
 * O RITMO
 * -------
 * Uma requisição por vez, com pausa. São cento e cinquenta páginas de
 * partitura; fazê-las em rajada custaria banda de quem mantém isso de graça.
 */
import { writeFileSync } from 'node:fs';

const UA = 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)';
const BASE = 'https://musicabrasilis.org.br';
const PAUSA_MS = 600;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Busca uma página. Devolve `null` quando a lista acabou.
 *
 * 🔴 A FONTE SINALIZA O FIM COM ERRO 500.
 *
 * Página além da última não devolve lista vazia nem repete a última: devolve
 * **erro do servidor**. A primeira versão tratou isso como falha e abortou na
 * página oitenta e cinco, jogando fora setecentos e cinquenta e seis
 * compositores já lidos.
 *
 * O erro é a resposta, e não um acidente — mas só nesse caso. Falha de rede
 * continua sendo falha, e por isso ela **relança**: engolir tudo faria a
 * extração parar no meio e declarar sucesso.
 */
async function pagina(caminho) {
  try {
    const r = await fetch(BASE + caminho, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(30000),
    });

    /** 404 e 500 aqui significam "passou do fim". */
    if (r.status === 404 || r.status === 500) return null;
    if (!r.ok) throw new Error(`HTTP ${r.status} em ${caminho}`);

    return await r.text();
  } catch (e) {
    if (e instanceof Error && /HTTP/.test(e.message)) throw e;
    throw new Error(`falha de rede em ${caminho}: ${e.message}`);
  }
}

/** Tira as entidades e o espaço sobrando de um pedaço de HTML. */
const limpo = (s) =>
  (s ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ---------------------------------------------------------------------------
// Partituras
// ---------------------------------------------------------------------------

/**
 * Cada item vive num bloco que começa no link da partitura.
 *
 * A leitura é do bloco inteiro, e não de expressões soltas sobre a página: um
 * `composer-name` casado longe do seu link ligaria a obra ao compositor errado,
 * e isso é o tipo de erro que não dá sinal.
 */
/**
 * O cartão de cada peça, lido de DENTRO.
 *
 * A primeira versão lia mil e duzentos caracteres antes do link. Dava certo
 * por acidente: o que vem antes é o bloco móvel da **mesma** peça. Bastava a
 * fonte trocar a ordem dos dois blocos para a obra receber o instrumento da
 * peça anterior — que é o defeito que as datas dos compositores tiveram de
 * verdade, e que não deu sinal nenhum.
 *
 * Lendo para frente, do link até o começo do próximo cartão, a peça responde
 * por si. E aparece o `div.year`, que a leitura anterior nem via: é a data de
 * composição, quando a fonte a tem.
 */
function lerPartituras(html) {
  const itens = [];

  for (const m of html.matchAll(
    /<a href="(\/pt-br\/partituras\/[^"]+)"[^>]*data-sheet-id="(\d+)"[^>]*data-sheet-name="([^"]*)"[^>]*data-composeer-name='([^']*)'/g
  )) {
    const [, caminho, id, titulo, compositor] = m;

    /** Até o próximo cartão, ou até o fim: `custom-row` abre cada um. */
    const adiante = html.slice(m.index, m.index + 4000);
    const proximo = adiante.indexOf('class="custom-row"', 10);
    const cartao = proximo > 0 ? adiante.slice(0, proximo) : adiante;

    const instrumentos = [
      ...new Set(
        [...cartao.matchAll(/<span class="badge[^"]*"[^>]*title="([^"]*)"/g)].map((b) => limpo(b[1]))
      ),
    ].filter(Boolean);

    /** `<div class="year">1917</div>`, vazio na maioria. */
    const ano = cartao.match(/<div class="year">\s*([^<]*?)\s*<\/div>/);
    const dc = ano ? limpo(ano[1]) : '';

    itens.push({
      idNaFonte: id,
      titulo: limpo(titulo),
      compositor: limpo(compositor),
      instrumentos,
      dc: dc || undefined,
      url: BASE + caminho,
    });
  }

  return itens;
}

async function todasAsPartituras() {
  const porId = new Map();
  let vazias = 0;

  /**
   * 🔴 O TETO DE 200 PÁGINAS CORTOU MIL PARTITURAS.
   *
   * A primeira versão parava em duzentas páginas — um número escrito à mão,
   * "de sobra" — e a fonte tem mais de três mil partituras a vinte por
   * página. Saiu com dois mil e declarou sucesso.
   *
   * Limite inventado é exatamente o que corta dado em silêncio. Quem manda
   * parar é a **fonte**: página que devolve erro de fim, ou que não acrescenta
   * nada. O teto que sobra existe só para o laço não ser infinito se a fonte
   * mudar de comportamento, e é alto o bastante para nunca ser ele a decidir.
   */
  for (let p = 1; p <= 1000 && vazias < 2; p += 1) {
    const html = await pagina(`/pt-br/partituras/?page=${p}`);
    if (html === null) break;
    const itens = lerPartituras(html);

    const antes = porId.size;
    for (const i of itens) porId.set(i.idNaFonte, i);

    /**
     * Página que não acrescenta NADA é o fim da lista.
     *
     * Parar só quando vier vazia não serve: a fonte devolve a última página de
     * novo quando o número passa do fim, e o laço rodaria até o limite sem
     * perceber que já viu tudo.
     */
    if (porId.size === antes) vazias += 1;
    else vazias = 0;

    if (p % 10 === 0 || porId.size === antes) {
      process.stdout.write(`\r  partituras: página ${p} · ${porId.size} distintas`);
    }
    await dormir(PAUSA_MS);
  }

  return [...porId.values()];
}

// ---------------------------------------------------------------------------
// Compositores
// ---------------------------------------------------------------------------

/**
 * 🔴 CADA COMPOSITOR RECEBEU AS DATAS DO COMPOSITOR ANTERIOR.
 *
 * A primeira versão lia novecentos caracteres **ANTES** do link, com o
 * comentário "as datas vêm num selo logo acima". Não vêm: o selo fica
 * **dentro do cartão, depois do link**. O que existe acima é o fim do cartão
 * do compositor anterior — então cada um herdava as datas do vizinho, e quem
 * vinha depois de um cartão sem selo ficava sem data nenhuma.
 *
 * Quatrocentos e cinco compositores saíram com datas erradas, e nada acusou:
 * anos plausíveis, no formato certo, no campo certo. Camargo Guarnieri saiu
 * como 1944–2011, Francisco Mignone como 1835–1923, e Villa-Lobos sem data.
 *
 * O ESTRAGO NÃO É COSMÉTICO. A data de morte decide o domínio público pela
 * Lei 9.610/98 — morte + 71. Uma morte adiantada em sessenta anos faz a
 * plataforma **declarar livre** obra que está protegida. É o erro mais caro
 * que este catálogo pode cometer.
 *
 * A leitura agora é de DENTRO do cartão: do link até o `</a>` que o fecha, e
 * nada além disso. O que está fora do cartão é de outra pessoa, por
 * definição.
 */
function lerCompositores(html) {
  const itens = [];

  for (const m of html.matchAll(
    /<a href="(\/pt-br\/compositores\/[^"]+)"[^>]*data-composer-id="(\d+)"\s*data-composer-name="([^"]*)"/g
  )) {
    const [, caminho, id, nome] = m;

    /**
     * O CARTÃO, e só ele. O `</a>` seguinte é o fecho deste cartão: os
     * cartões não se aninham, então o primeiro fecho é sempre o próprio.
     */
    const depois = html.slice(m.index, m.index + 3000);
    const cartao = depois.slice(0, depois.indexOf('</a>') + 1 || depois.length);

    const selos = [...cartao.matchAll(/<span class="badge[^"]*"[^>]*>([^<]*)<\/span>/g)].map((b) =>
      limpo(b[1])
    );
    const datas = selos.find((t) => /\d{3,4}\s*[-–]\s*\d{0,4}/.test(t));
    const anos = datas ? datas.match(/(\d{3,4})\s*[-–]\s*(\d{3,4})?/) : null;

    itens.push({
      idNaFonte: id,
      nome: limpo(nome),
      nascimento: anos?.[1] ? Number(anos[1]) : undefined,
      morte: anos?.[2] ? Number(anos[2]) : undefined,
      url: BASE + caminho,
    });
  }

  return itens;
}

/**
 * A CONFERÊNCIA CONTRA A PÁGINA DO PRÓPRIO COMPOSITOR.
 *
 * A leitura de dentro do cartão é correta por construção, e "correta por
 * construção" foi exatamente o que se disse da versão anterior. Então uma
 * amostra é conferida contra uma **segunda fonte dentro da mesma fonte**: a
 * página individual do compositor, que traz as datas fora de qualquer
 * listagem.
 *
 * Divergência aqui derruba a extração. Gravar datas erradas é pior que não
 * gravar: elas decidem domínio público.
 */
async function conferirDatas(compositores) {
  const comData = compositores.filter((c) => c.nascimento && c.morte);
  if (comData.length === 0) return { conferidos: 0, divergentes: [] };

  /** Espalhados pela lista, e não os primeiros: o defeito era posicional. */
  const passo = Math.max(1, Math.floor(comData.length / 8));
  const amostra = comData.filter((_, i) => i % passo === 0).slice(0, 8);

  const divergentes = [];

  for (const c of amostra) {
    const html = await pagina(c.url.replace(BASE, ''));
    await dormir(PAUSA_MS);
    if (html === null) continue;

    const texto = limpo(html.replace(/<[^>]+>/g, ' '));
    const achou = texto.includes(`${c.nascimento}`) && texto.includes(`${c.morte}`);
    if (!achou) divergentes.push(`${c.nome}: a listagem diz ${c.nascimento}-${c.morte}, a página dele não repete esses anos`);
  }

  return { conferidos: amostra.length, divergentes };
}

async function todosOsCompositores() {
  const porId = new Map();
  let vazias = 0;

  for (let p = 1; p <= 1000 && vazias < 2; p += 1) {
    const html = await pagina(`/pt-br/compositores/?page=${p}`);
    if (html === null) break;
    const antes = porId.size;
    for (const c of lerCompositores(html)) porId.set(c.idNaFonte, c);

    if (porId.size === antes) vazias += 1;
    else vazias = 0;

    if (p % 10 === 0) process.stdout.write(`\r  compositores: página ${p} · ${porId.size}`);
    await dormir(PAUSA_MS);
  }

  return [...porId.values()];
}

// ---------------------------------------------------------------------------
// Coletâneas
// ---------------------------------------------------------------------------

/**
 * As COLETÂNEAS são seleções da fonte, e entram como tal.
 *
 * `12 exercícios brasileiros`, `Canções populares do Brasil`, `Coleção de
 * modinhas`. São recortes editoriais de quem cataloga — e o rótulo precisa
 * dizer isso, do mesmo jeito que as listas do outro catálogo dizem.
 */
function lerColetaneas(html) {
  const itens = [];
  for (const m of html.matchAll(/<a href="(\/pt-br\/coletaneas\/[^"]+)"/g)) {
    const caminho = decodeURIComponent(m[1]);
    const nome = caminho
      .replace('/pt-br/coletaneas/', '')
      .replace(/\/$/, '')
      .replace(/-/g, ' ');
    itens.push({ nome, url: BASE + m[1] });
  }
  return [...new Map(itens.map((i) => [i.url, i])).values()];
}

// ---------------------------------------------------------------------------

async function main() {
  console.log('  Música Brasilis — lendo o catálogo (ficha, nunca arquivo)\n');

  const coletaneas = lerColetaneas(await pagina('/pt-br/coletaneas'));
  console.log(`  coletâneas: ${coletaneas.length}`);
  await dormir(PAUSA_MS);

  const compositores = await todosOsCompositores();
  console.log(`\n  compositores: ${compositores.length}`);

  const { conferidos, divergentes } = await conferirDatas(compositores);
  console.log(`  datas conferidas contra a pagina do compositor: ${conferidos}`);
  if (divergentes.length > 0) {
    console.error('\n✗ as datas nao batem com a fonte:');
    for (const d of divergentes) console.error(`  ${d}`);
    console.error(
      '\n  Gravar data errada e pior que nao gravar: a data de morte decide o dominio publico pela Lei 9.610/98.'
    );
    process.exit(1);
  }

  const partituras = await todasAsPartituras();
  console.log(`\n  partituras: ${partituras.length}`);

  /**
   * NÃO-VACUIDADE. A fonte declara mais de três mil partituras; sair daqui com
   * uma dúzia significa que a leitura quebrou, e não que o acervo encolheu.
   */
  if (partituras.length < 2500 || compositores.length < 500) {
    console.error(
      `\n✗ leitura insuficiente: ${partituras.length} partituras e ${compositores.length} compositores.` +
        ' A fonte declara mais de 3.000 partituras e listou 756 compositores — menos que isso significa que a leitura quebrou ou foi cortada, e gravar seria pior que não gravar.'
    );
    process.exit(1);
  }

  writeFileSync(
    'scripts/.musica-brasilis.json',
    JSON.stringify({ compositores, partituras, coletaneas }),
    'utf-8'
  );

  const semCompositor = partituras.filter((p) => !p.compositor).length;
  const instrumentos = {};
  for (const p of partituras) for (const i of p.instrumentos) instrumentos[i] = (instrumentos[i] ?? 0) + 1;

  console.log('\n✓ scripts/.musica-brasilis.json');
  console.log(`  ${compositores.length} compositores · ${partituras.length} partituras · ${coletaneas.length} coletâneas`);
  console.log(`  partituras sem compositor nomeado: ${semCompositor}`);
  console.log(
    '  instrumentos mais frequentes: ' +
      Object.entries(instrumentos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([k, n]) => `${k} ${n}`)
        .join(' · ')
  );
}

main();
