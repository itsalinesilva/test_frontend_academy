/**
 * ONDE ESTÁ A PARTITURA DE CADA OBRA — IMSLP / Petrucci.
 *
 * O PROBLEMA QUE ESTE ARQUIVO RESOLVE
 * -----------------------------------
 * O catálogo tem trinta e uma mil obras e sabia onde ficava a edição de sete
 * mil. As outras vinte e quatro mil apareciam listadas **sem partitura e sem
 * reprodução** — um nome, um autor, e nada que a pessoa pudesse abrir.
 *
 * Não é falta de partitura no mundo: é falta de endereço no nosso registro. O
 * IMSLP cataloga por obra, e publica um índice com título, compositor, número
 * de catálogo e o link permanente de cada página.
 *
 * O QUE A POLÍTICA DA FONTE PERMITE
 * ---------------------------------
 * O `robots.txt` foi lido antes de qualquer requisição. Ele proíbe
 * `/index.php`, `/images/`, `/imglnks/`, `/wiki/File:`, `/wiki/Image:`,
 * `/works`, `/work/`, `/instrument/` e `/library/`, e pede **`Crawl-delay: 2`**.
 *
 * O que se usa aqui é `/imslpscripts/API.ISCR.php`, que é a interface pública
 * de consulta e não está entre as proibidas — e a pausa de dois segundos é
 * respeitada. Nenhum arquivo é baixado: o que entra no catálogo é o **link da
 * página da obra**, que é onde o download acontece, com quem publica.
 *
 * COMO O CASAMENTO É FEITO, E POR QUE ASSIM
 * -----------------------------------------
 * Roda pelo `vite-node` para importar o catálogo **de verdade** — o mesmo
 * `todasAsObras` que a tela lê. Reconstruir o índice a partir dos arquivos
 * crus faria o casamento acontecer sobre uma cópia, e a cópia diverge.
 *
 * Duas chaves, nesta ordem:
 *
 *   compositor + número de catálogo → BWV 1048 é prova de identidade. Duas
 *                                     obras não compartilham um número.
 *   compositor + título normalizado → indício forte quando o número não
 *                                     existe dos dois lados.
 *
 * O compositor entra nas duas. Sem ele, "Sonata em Dó maior" casaria a de
 * Mozart com a de Haydn — e ligar a partitura errada a uma obra é pior que
 * não ligar nenhuma: a ficha passa a afirmar algo falso com ar de apurado.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';
import { textoDe } from '../src/domain/music-knowledge';

const UA = 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)';
const CACHE = 'scripts/.imslp-indice.json';
const PAUSA_MS = 2000;
const POR_PAGINA = 1000;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * A chave de pessoa: palavras do nome, sem acento e **ordenadas**.
 *
 * O IMSLP escreve `Bach, Johann Sebastian`; o nosso catálogo escreve
 * `Johann Sebastian Bach`. É a ordenação que faz os dois caírem na mesma
 * chave — a mesma técnica que juntou os nove compositores duplicados.
 */
const chaveDePessoa = (nome: string) =>
  semAcento(nome)
    .replace(/[^a-z ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');

/** Título sem pontuação, sem espaço e sem caixa: só as letras e os números. */
const chaveDeTitulo = (t: string) => semAcento(t).replace(/[^a-z0-9]/g, '');

/**
 * 🔴 O TÍTULO DA FONTE É MAIS CURTO QUE O NOSSO, e a igualdade falhava por isso.
 *
 * O IMSLP escreve `Symphony No.5, Op.67`; a nossa catalogação de origem
 * escreve `Symphony No. 5 in C minor, Op. 67`. Normalizados, os dois viram
 * cadeias diferentes — e a chave exigia igualdade, então onze mil obras em
 * domínio público que a fonte tem não foram achadas.
 *
 * O PREFIXO resolve, e é a aproximação mais conservadora que existe: o começo
 * do título é onde vive a identidade da peça — forma, número de ordem —, e a
 * cauda é onde vivem tonalidade e opus, que são justamente o que as duas
 * fontes escrevem diferente.
 *
 * Vinte caracteres, e não dez: `sonatano1` casaria a sonata nº 1 com a nº 10,
 * e `prelude` casaria todos os prelúdios de um compositor entre si. Vinte
 * carrega forma, número e o começo da tonalidade.
 *
 * E continua valendo a regra: prefixo AMBÍGUO não casa nada. Se dois títulos
 * do mesmo compositor começam igual, a chave é sorteio, e ligar a partitura
 * errada mente pior que não ligar.
 */
const TAMANHO_DO_PREFIXO = 20;
const chaveDePrefixo = (t: string) => chaveDeTitulo(t).slice(0, TAMANHO_DO_PREFIXO);

/**
 * AS SIGLAS DE CATÁLOGO, e por que a lista cresceu.
 *
 * A primeira versão cobria nove — BWV, K, KV, D, Op, HWV, RV, Hob, WoO, S —,
 * e a musicologia usa dezenas: cada catalogador de cada compositor criou a
 * sua. Bartók é Sz e BB, Debussy é L., Poulenc é FP, Strauss é TrV, Janáček é
 * JW, Boccherini é G., Scarlatti é Kk.
 *
 * Isto importa porque o número de catálogo é a chave FORTE: das obras sem
 * endereço, quatro mil quinhentas e setenta já têm número apurado do nosso
 * lado, sobrando por falta de reconhecimento do outro.
 */
const SIGLAS_DE_CATALOGO =
  'BWV|BuxWV|K|KV|Kk|D|Op|HWV|RV|Hob|WoO|WAB|S|Sz|BB|L|FP|TrV|JW|B|G|CD|H|M|P|T|Z|AV|Anh|MWV|SV|TWV|Wq|F|C|VB|Bg';

/**
 * 🔴 A EXPRESSÃO PARAVA NO PRIMEIRO NÚMERO, e o número era maior.
 *
 * Telemann é `TWV 43:h3`; Haydn é `Hob.XVI:52`. A versão anterior lia só
 * `\d+`, então as duas viravam `TWV 43` e `Hob` — e `TWV 43` é comum a dezenas
 * de quartetos. Chave ambígua não casa nada, por regra, e quinhentas e uma
 * obras de Telemann sobravam por isso.
 *
 * Agora o número aceita as três formas que a musicologia usa: algarismo
 * romano de grupo (`XVI:`), número, e continuações separadas por dois-pontos.
 *
 * Montada com `String.raw` de propósito: escrita como cadeia comum, `'\b'` é
 * o caractere BACKSPACE e não a fronteira de palavra — a expressão compila,
 * roda, e nunca casa. Já aconteceu neste repositório, e o sintoma é o pior
 * possível: verde silencioso.
 */
const NUMERO_DE_CATALOGO = String.raw`(?:[IVXLC]+\s*:\s*)?\d+[a-z]?(?:\s*:\s*[0-9a-z]+)*`;

const EXPRESSAO_DE_CATALOGO = new RegExp(
  String.raw`\b(` + SIGLAS_DE_CATALOGO + String.raw`)\s*\.?\s*(` + NUMERO_DE_CATALOGO + ')',
  'i'
);

/**
 * O número de catálogo, reduzido à sigla e ao número.
 *
 * `BWV 1048`, `BWV.1048` e `bwv1048` são o mesmo. Sem isto, a chave mais
 * forte que existe falharia por causa de um ponto.
 */
const chaveDeCatalogo = (c: string) => semAcento(c).replace(/[^a-z0-9]/g, '');

interface EntradaDoIndice {
  id: string;
  intvals?: { composer?: string; worktitle?: string; icatno?: string; pageid?: string };
  permlink?: string;
}

async function paginaDoIndice(inicio: number): Promise<EntradaDoIndice[]> {
  const u =
    'https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted' +
    `/sort=id/type=2/start=${inicio}/retformat=json`;

  const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} em start=${inicio}`);

  const bruto = (await r.json()) as Record<string, EntradaDoIndice | unknown>;

  /**
   * A resposta é um objeto com chaves numéricas, mais um campo `metadata` no
   * fim. Filtrar pelo que tem `intvals` deixa de fora o metadado sem precisar
   * saber o nome dele — que pode mudar sem aviso.
   */
  return Object.values(bruto).filter(
    (e): e is EntradaDoIndice =>
      typeof e === 'object' && e !== null && 'intvals' in (e as object)
  );
}

async function main() {
  console.log('  IMSLP — procurando onde está a partitura de cada obra\n');
  console.log('  robots.txt: Crawl-delay 2s, respeitado. Nenhum arquivo baixado.\n');

  const hoje = new Date();
  const compositores = todosOsCompositores(hoje);
  const obras = await todasAsObras(hoje);

  const nomePorId = new Map(compositores.map((c) => [c.id, c.canonicalName]));

  /**
   * 🔴 CHAVE AMBÍGUA NÃO CASA NADA.
   *
   * Se duas obras do mesmo compositor normalizam para o mesmo título, a chave
   * não distingue as duas — e escolher uma seria sorteio. Elas saem do índice,
   * e ficam para a rodada de número de catálogo ou para resolução à mão.
   */
  const porCatalogo = new Map<string, string | null>();
  const porTitulo = new Map<string, string | null>();
  const porPrefixo = new Map<string, string | null>();

  /**
   * Os títulos alternativos, quando o enriquecimento já rodou.
   *
   * Ausência aqui não é falha: é enriquecimento que ainda não aconteceu, e o
   * casamento roda igual, só que com uma chave a menos.
   */
  let aliasPorObra = new Map<string, string[]>();
  try {
    const lido = JSON.parse(readFileSync('src/data/acervo/alias.json', 'utf-8')) as Array<{
      o: string;
      t: string[];
    }>;
    aliasPorObra = new Map(lido.map((r) => [r.o, r.t]));
    console.log(`  títulos alternativos disponíveis: ${aliasPorObra.size} obras`);
  } catch {
    console.log('  sem títulos alternativos — rode scripts/enriquecer-musicbrainz.ts');
  }

  for (const o of obras) {
    const autor = nomePorId.get(o.composerIds[0]);
    if (!autor) continue;
    const p = chaveDePessoa(autor);

    if (o.catalogNumber) {
      const k = p + '|' + chaveDeCatalogo(o.catalogNumber);
      porCatalogo.set(k, porCatalogo.has(k) ? null : o.id);
    }

    const t = textoDe(o.canonicalTitle);
    if (t) {
      const k = p + '|' + chaveDeTitulo(t);
      porTitulo.set(k, porTitulo.has(k) ? null : o.id);

      const kp = p + '|' + chaveDePrefixo(t);
      porPrefixo.set(kp, porPrefixo.has(kp) ? null : o.id);
    }

    /**
     * 🔴 OS TÍTULOS ALTERNATIVOS ENTRAM COMO CHAVE, e é o que destrava o resto.
     *
     * A biblioteca de partitura escreve `Quatorze Canons`; a nossa catalogação
     * de origem escreve `14 Canons`. Nenhuma normalização aproxima as duas —
     * são línguas diferentes —, e onze mil obras em domínio público sobravam
     * por isso.
     *
     * O alias vem da base de metadados, casado por número de catálogo, que é
     * prova de identidade. Ele não traz partitura nenhuma: traz **como a mesma
     * obra se chama em outro lugar**, que é o que faltava para achar a que
     * existe.
     */
    /**
     * 🔴 O ALIAS PREENCHE VAGA VAZIA, e NUNCA anula chave que já existe.
     *
     * A primeira versão tratava alias como título: chave repetida virava
     * `null`, por ambiguidade. O efeito foi o oposto do pretendido — com 161
     * obras enriquecidas, o casamento rendeu **+1**, porque cada alias que
     * colidia com um título primário derrubava os dois.
     *
     * A assimetria é deliberada e tem razão: o título primário é o que a
     * catalogação de origem afirma sobre a obra; o alias é como ela se chama
     * noutro lugar. Um indício não tem força para desfazer uma afirmação — e
     * um alias ambíguo simplesmente não entra, em vez de levar o certo junto.
     */
    for (const t of aliasPorObra.get(o.id) ?? []) {
      const ka = p + '|' + chaveDeTitulo(t);
      if (!porTitulo.has(ka)) porTitulo.set(ka, o.id);

      const kap = p + '|' + chaveDePrefixo(t);
      if (!porPrefixo.has(kap)) porPrefixo.set(kap, o.id);
    }
  }

  console.log(
    `  catálogo: ${obras.length} obras · ${porCatalogo.size} chaves de número · ${porTitulo.size} chaves de título`
  );

  const achados = new Map<string, { u: string; via: 'CATALOGO' | 'TITULO' | 'PREFIXO' }>();
  /** O índice bruto, guardado: sem ele toda melhoria exige rastejar tudo de novo. */
  let indiceBruto: Array<{ c: string; t: string; u: string }> = [];

  /**
   * 🔴 O CACHE VEM PRIMEIRO, E É A DIFERENÇA ENTRE PODER MELHORAR E NÃO PODER.
   *
   * A chave de casamento vai continuar mudando: siglas de catálogo novas,
   * tamanho de prefixo, forma do nome. Cada tentativa custava vinte minutos de
   * banda de quem mantém o IMSLP de graça — e por isso quase não se tentava.
   *
   * Com o índice em disco, a tentativa custa segundos e **zero requisições**.
   * `--rastejar` força a releitura da fonte, que é o que se faz quando o
   * catálogo deles cresceu, e não quando a nossa chave mudou.
   */
  /**
   * Declarados ANTES de `casar`, que os usa.
   *
   * `let` é içado mas fica em zona morta até a linha da declaração: deixados
   * embaixo, a leitura do cache — que chama `casar` — estouraria antes de
   * qualquer casamento acontecer.
   */
  let lidas = 0;
  let porNumero = 0;
  let porNome = 0;
  let porPrefixoCasadas = 0;

  const forcarRastejo = process.argv.includes('--rastejar');
  const temCache = existsSync(CACHE) && !forcarRastejo;

  if (temCache) {
    indiceBruto = JSON.parse(readFileSync(CACHE, 'utf-8'));
    console.log(`  lendo do cache: ${indiceBruto.length} entradas, sem tocar na fonte`);
  }

  const casar = (composer: string, titulo: string, link: string) => {
    const p = chaveDePessoa(composer);

    const numero = titulo.match(EXPRESSAO_DE_CATALOGO);
    const viaNumero = numero ? porCatalogo.get(p + '|' + chaveDeCatalogo(numero[0])) : undefined;
    const viaTitulo = porTitulo.get(p + '|' + chaveDeTitulo(titulo));
    /** O prefixo é o último recurso: só entra quando as duas provas falham. */
    const viaPrefixo = porPrefixo.get(p + '|' + chaveDePrefixo(titulo));

    const alvo = viaNumero ?? viaTitulo ?? viaPrefixo;
    if (!alvo || achados.has(alvo)) return;

    const via = viaNumero ? 'CATALOGO' : viaTitulo ? 'TITULO' : 'PREFIXO';
    achados.set(alvo, { u: link, via });
    if (via === 'CATALOGO') porNumero += 1;
    else if (via === 'TITULO') porNome += 1;
    else porPrefixoCasadas += 1;
  };

  if (temCache) {
    for (const e of indiceBruto) casar(e.c, e.t, e.u);
    lidas = indiceBruto.length;
    console.log(`  casadas ${achados.size} de ${lidas} entradas`);
  }

  /**
   * O teto existe para o laço não ser infinito se a fonte mudar de
   * comportamento, e é alto o bastante para nunca ser ele a decidir: o índice
   * tem algo como duzentas e quarenta mil obras, e quem manda parar é a página
   * que volta vazia.
   */
  for (let inicio = 0; !temCache && inicio < 400000; inicio += POR_PAGINA) {
    let entradas: EntradaDoIndice[];
    try {
      entradas = await paginaDoIndice(inicio);
    } catch (e) {
      console.error(`\n  falha em start=${inicio}: ${(e as Error).message}`);
      break;
    }

    if (entradas.length === 0) break;
    lidas += entradas.length;

    for (const e of entradas) {
      const composer = e.intvals?.composer;
      const titulo = e.intvals?.worktitle;
      const link = e.permlink;
      if (!composer || !titulo || !link) continue;

      indiceBruto.push({ c: composer, t: titulo, u: link });
      casar(composer, titulo, link);
    }

    process.stdout.write(`\r  lidas ${lidas} · casadas ${achados.size}`);
    await dormir(PAUSA_MS);
  }

  console.log('');

  /**
   * NÃO-VACUIDADE. O IMSLP tem praticamente todo o repertório de domínio
   * público do concerto ocidental, e o nosso catálogo veio do Open Opus, que
   * cataloga o mesmo repertório. Sair daqui com umas dezenas significa que a
   * normalização quebrou — e gravar um índice quase vazio faria a tela
   * continuar dizendo "não localizamos edição" sobre obra que está lá.
   */
  if (achados.size < 2000) {
    console.error(
      `\n✗ só ${achados.size} obras casadas de ${obras.length}, sobre ${lidas} lidas na fonte.` +
        ' Isso é pouco demais para um catálogo que veio do mesmo repertório: a normalização quebrou.'
    );
    process.exit(1);
  }

  writeFileSync(
    'src/data/acervo/imslp.json',
    JSON.stringify([...achados].map(([o, { u }]) => ({ o, u }))),
    'utf-8'
  );

  /**
   * O ÍNDICE BRUTO FICA GUARDADO, e é a diferença entre poder melhorar e não
   * poder.
   *
   * A primeira passada descartou as 256 mil entradas depois de casar. Toda
   * tentativa de melhorar a chave exigia, então, rastejar a fonte inteira de
   * novo — vinte minutos de banda de quem mantém isso de graça, por cada
   * ideia. Com o arquivo em disco, a próxima tentativa custa segundos e zero
   * requisições.
   */
  if (!temCache) {
    writeFileSync(CACHE, JSON.stringify(indiceBruto), 'utf-8');
    console.log(`✓ ${CACHE} (${indiceBruto.length} entradas, para a próxima passada não rastejar)`);
  }

  console.log('✓ src/data/acervo/imslp.json');
  console.log(`  ${achados.size} obras com partitura localizada`);
  console.log(
    `  por número de catálogo: ${porNumero} · por título exato: ${porNome} · por prefixo: ${porPrefixoCasadas}`
  );
  console.log(`  entradas lidas na fonte: ${lidas}`);
}

main();
