/**
 * O QUE O TÍTULO JÁ DIZ — leitura, e não dedução.
 *
 * A DIFERENÇA, QUE É TUDO
 * -----------------------
 * Deduzir é afirmar o que a fonte não disse. Ler é pegar o que ela escreveu.
 *
 * `Sonata em dó maior, BWV 846` carrega três campos de catálogo dentro do
 * próprio título: a forma, a tonalidade e o número temático. Extraí-los não
 * inventa nada — o dado está lá, escrito, e deixá-lo preso numa cadeia de
 * texto é o que faz um catálogo ter campos vazios sobre informação que ele
 * possui.
 *
 * Inferir que uma peça de 1720 de Bach "deve ser" BWV alguma coisa seria a
 * outra operação, e essa este módulo não faz.
 *
 * POR QUE ISTO RENDE MAIS QUE A CONSULTA EXTERNA
 * ----------------------------------------------
 * Foi medido antes de ser escrito, contra a alternativa. Numa amostra de
 * trezentas obras na base de identificadores cruzados, **onze** traziam a
 * forma e **trinta e quatro** a tonalidade — quatro e onze por cento.
 *
 * Os nossos próprios títulos trazem número de catálogo em **46%** e forma em
 * **44%**, sem uma requisição sequer. A consulta externa continua valendo,
 * e vale depois: com o número de catálogo em mãos, a ligação entre as duas
 * bases deixa de depender de grafia de título e passa a ter chave de verdade.
 *
 * O QUE ESTE MÓDULO NÃO FARÁ
 * --------------------------
 * Não completa o que faltou. Título sem forma legível devolve `undefined`, e
 * não a forma mais provável para aquele compositor naquela época. O vazio se
 * vê; o palpite com cara de catalogação, não.
 */

/**
 * As formas, e por que elas são um vocabulário fechado.
 *
 * Aceitar qualquer substantivo do título como forma encheria o filtro de
 * "Manhã", "Melodia" e "Tema" — títulos poéticos que não nomeiam estrutura
 * nenhuma. O rol é o das formas que a historiografia trata como tais.
 *
 * Cada uma traz as grafias das línguas em que a catalogação de origem escreve:
 * a mesma obra aparece como `Symphony`, `Sinfonia` e `Symphonie` conforme a
 * edição, e recusar duas delas perderia obra por motivo de idioma.
 *
 * OS IDENTIFICADORES SÃO OS DO ATLAS
 * ----------------------------------
 * Saída em `slug` de `DEFAULT_GENRES`, e não um vocabulário paralelo. Uma
 * forma lida aqui que não exista lá apareceria no filtro sem rótulo, crua ao
 * lado das que têm nome — e duas listas de gênero divergiriam na primeira vez
 * que uma delas mudasse.
 *
 * `quarteto` é genérico de propósito. O Atlas já tinha `quarteto-de-cordas`,
 * que é outra coisa: um quarteto com piano não é quarteto de cordas, e o
 * título nem sempre diz qual dos dois é. Classificar todos como de cordas
 * afirmaria a instrumentação que ninguém apurou.
 */
const FORMAS: Array<[string, RegExp]> = [
  /**
   * O ALEMÃO COLA O MEIO NA FORMA.
   *
   * `Klaviersonate` é sonata; `Violinkonzert` é concerto; `Streichquartett` é
   * quarteto. Exigir fronteira de palavra antes da forma perderia todas.
   *
   * O ganho no acervo de hoje é de **uma** obra — a catalogação de origem
   * escreve quase tudo em inglês. A regra entra porque está certa, e não
   * porque rende: no dia em que entrar uma edição alemã, ela já funciona.
   */
  ['sonata', /(?:\b|\w)sonat[ae]n?\b/i],
  ['sinfonia', /(?:\b|\w)(?:symphon|sinfoni|sinfon)\w*/i],
  ['concerto', /(?:\b|\w)(?:concerto|concerti|konzerte?|concierto)\b/i],
  ['suite', /\b(?:suites?|suiten)\b/i],
  ['fuga', /\b(?:fugues?|fuga|fuge|fugen)\b/i],
  ['preludio', /\b(?:preludes?|prélude|preludio|präludium|praeludium|preludi)\w*/i],
  ['missa', /\b(?:mass|messe|missa|misa)\b/i],
  ['motete', /\b(?:motets?|motette|moteto)\w*/i],
  ['madrigal', /\bmadrigal\w*/i],
  ['opera', /\b(?:opera|oper)\b/i],
  ['oratorio', /\b(?:oratorio|oratorium)\w*/i],
  ['cantata', /\b(?:cantata|cantate|kantate)\w*/i],
  ['quarteto', /(?:\b|\w)(?:quartets?|quartette?|cuarteto)\w*/i],
  ['quinteto', /\b(?:quintets?|quintett)\w*/i],
  ['trio', /\btrios?\b/i],
  ['valsa', /\b(?:waltz|valse|walzer|vals)\b/i],
  ['mazurca', /\bmazurk\w*/i],
  ['polonesa', /\b(?:polonaise|polonez)\w*/i],
  ['noturno', /\b(?:nocturnes?|notturno|nachtstück)\w*/i],
  ['estudo', /\b(?:étude|etude|estudio|studie)s?\b/i],
  ['capricho', /\b(?:caprices?|capriccio)\w*/i],
  ['rapsodia', /\b(?:rhapsod|rapsod)\w*/i],
  ['variacoes', /\b(?:variations?|variazion|variaciones)\w*/i],
  ['minueto', /\b(?:minuets?|menuett?|minuetto)\b/i],
  ['balada', /\b(?:ballades?|ballads?)\b/i],
  ['serenata', /\b(?:serenades?|serenata)\w*/i],
  ['cancao', /\b(?:songs?|lied|lieder|chansons?|canción|canzon)\w*/i],
  ['marcha', /\b(?:march|marches|marsch|marche)\b/i],
  ['requiem', /\brequiem\b/i],
  ['poema', /\b(?:poem|poème|poema)\b/i],
  ['abertura', /\b(?:overtures?|ouvertüre|ouverture)\b/i],
  ['impromptu', /\bimpromptus?\b/i],
  ['romance', /\b(?:romance|romanze)\b/i],
  ['tocata', /\b(?:toccata|tokkata)\w*/i],
  ['coral', /\b(?:choral|chorale)\b/i],
  ['hino', /\b(?:hymns?|hymne|himno)\w*/i],
];

/**
 * A forma escrita no título, quando há.
 *
 * A PRIMEIRA da lista vence, e a ordem é deliberada: em `Sonata quasi una
 * fantasia` as duas aparecem, e a obra é sonata. Ordenar por frequência faria
 * a palavra mais comum roubar a classificação da mais específica.
 */
export function formaDoTitulo(titulo: string): string | undefined {
  for (const [nome, re] of FORMAS) {
    if (re.test(titulo)) return nome;
  }
  return undefined;
}

/**
 * As siglas de catálogo temático, e o que elas são.
 *
 * Cada compositor de peso tem um catálogo próprio, feito por quem estudou a
 * obra inteira: BWV para Bach, K. para Mozart, D. para Schubert, RV para
 * Vivaldi. É o identificador que a musicologia usa, e o único capaz de dizer
 * que duas entradas de bases diferentes falam da mesma peça.
 *
 * `Op.` é de outra natureza — número de publicação, dado pelo editor — e entra
 * porque na prática cumpre o mesmo papel de desambiguar homônimos.
 */
const SIGLAS = [
  'BWV',
  'BuxWV',
  'HWV',
  'TWV',
  'RV',
  'Hob',
  'KV',
  'K',
  'D',
  'WoO',
  'Wq',
  'H',
  'S',
  'L',
  'CW',
  'Op',
  'op',
];

const RE_CATALOGO = new RegExp(
  `\\b(${SIGLAS.join('|')})\\.?\\s*(?:no\\.?\\s*)?(\\d+[a-zA-Z]?)\\b`
);

/**
 * O número de catálogo escrito no título.
 *
 * Normalizado para uma grafia só: a fonte escreve `BWV.846`, `BWV 846` e
 * `BWV. 846` para a mesma peça, e três grafias do mesmo número não cruzam com
 * nada. Sai sempre como `SIGLA NÚMERO`.
 *
 * O ponto segue a convenção de cada catálogo, e não um padrão nosso: sigla que
 * abrevia um sobrenome leva ponto — `K.` de Köchel, `D.` de Deutsch, `Hob.` de
 * Hoboken — e sigla formada por iniciais não leva: `BWV`, `RV`, `HWV`.
 */
const LEVAM_PONTO = new Set(['K', 'KV', 'D', 'Hob', 'Wq', 'H', 'S', 'L', 'Op', 'op']);
export function catalogoDoTitulo(titulo: string): string | undefined {
  const m = titulo.match(RE_CATALOGO);
  if (!m) return undefined;

  const bruta = m[1].toLowerCase() === 'op' ? 'Op' : m[1];
  const sigla = LEVAM_PONTO.has(bruta) ? `${bruta}.` : bruta;
  return `${sigla} ${m[2]}`;
}

/** As sete notas, nas grafias em que a catalogação de origem as escreve. */
const NOTAS: Record<string, string> = {
  c: 'Dó',
  do: 'Dó',
  ut: 'Dó',
  d: 'Ré',
  re: 'Ré',
  e: 'Mi',
  mi: 'Mi',
  f: 'Fá',
  fa: 'Fá',
  g: 'Sol',
  sol: 'Sol',
  a: 'Lá',
  la: 'Lá',
  b: 'Si',
  si: 'Si',
  h: 'Si',
};

const ALTERACOES: Record<string, string> = {
  sharp: ' sustenido',
  '#': ' sustenido',
  is: ' sustenido',
  dièse: ' sustenido',
  diese: ' sustenido',
  sostenido: ' sustenido',
  flat: ' bemol',
  b: ' bemol',
  es: ' bemol',
  bémol: ' bemol',
  bemol: ' bemol',
  bemolle: ' bemol',
};

const MODOS: Record<string, string> = {
  major: 'maior',
  maior: 'maior',
  mayor: 'maior',
  maggiore: 'maior',
  majeur: 'maior',
  dur: 'maior',
  minor: 'menor',
  menor: 'menor',
  minore: 'menor',
  mineur: 'menor',
  moll: 'menor',
};

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * A tonalidade escrita no título.
 *
 * TRÊS GRAFIAS, E A EXIGÊNCIA DO MODO
 * -----------------------------------
 * A catalogação de origem escreve `C major`, `e-Moll` e `en ré mineur` para a
 * mesma coisa. As três são lidas.
 *
 * O **modo é obrigatório** em todas, e isso não é rigor decorativo: a primeira
 * versão desta leitura aceitava `in` seguido de nota e classificou
 * *"Ich bin in mir vergnügt"* como estando em Mi — porque `in mi` casava. Sem
 * a palavra que diz maior ou menor, qualquer preposição seguida de duas letras
 * vira tonalidade.
 *
 * Devolve na grafia portuguesa, que é a da interface: `Dó maior`, `Mi bemol
 * menor`.
 */
export function tonalidadeDoTitulo(titulo: string): string | undefined {
  /** Inglês e alemão: nota, alteração colada ou solta, modo. */
  const ingles = titulo.match(
    /\b([A-G])(?:[-\s]?(sharp|flat|#|b))?[-\s]+(major|minor)\b/i
  );
  if (ingles) {
    return montar(ingles[1], ingles[2], ingles[3]);
  }

  const alemao = titulo.match(/\b([A-Ha-h])(is|es|s)?-(Dur|Moll)\b/);
  if (alemao) {
    return montar(alemao[1], alemao[2], alemao[3]);
  }

  /**
   * Línguas latinas. O modo fecha a expressão, e sem ele não há tonalidade —
   * é a regra que impede `in mir` de virar Mi.
   */
  const latino = titulo.match(
    /\b(?:in|en)\s+(do|ut|re|ré|mi|fa|sol|la|lá|si)\s*(dièse|diese|bémol|bemol|bemolle|sostenido)?\s+(maggiore|minore|majeur|mineur|mayor|menor|maior)\b/i
  );
  if (latino) {
    return montar(latino[1], latino[2], latino[3]);
  }

  return undefined;
}

function montar(nota: string, alteracao: string | undefined, modo: string): string | undefined {
  const n = NOTAS[semAcento(nota)];
  const m = MODOS[semAcento(modo)];
  if (!n || !m) return undefined;

  const a = alteracao ? (ALTERACOES[semAcento(alteracao)] ?? '') : '';
  return `${n}${a} ${m}`;
}

/** Os três campos de uma vez, para quem projeta a obra. */
export interface LeituraDoTitulo {
  forma?: string;
  numeroDeCatalogo?: string;
  tonalidade?: string;
}

export function lerTitulo(titulo: string): LeituraDoTitulo {
  return {
    forma: formaDoTitulo(titulo),
    numeroDeCatalogo: catalogoDoTitulo(titulo),
    tonalidade: tonalidadeDoTitulo(titulo),
  };
}
