/**
 * AS FACETAS DO CATÁLOGO — filtro que diz quanto há antes de você clicar.
 *
 * O QUE É UMA FACETA, E POR QUE ELA NÃO É UM SELETOR
 * -------------------------------------------------
 * Um seletor oferece opções. Uma **faceta** oferece opções *com a contagem do
 * que cada uma devolve*, apurada sobre o recorte atual.
 *
 * A diferença aparece no uso. Num catálogo de vinte e cinco mil obras, clicar
 * num filtro e receber vazio é frustração — e o pior é que a pessoa não sabe
 * se errou o clique, se o acervo é pobre ali, ou se o filtro está quebrado.
 *
 * Com contagem, nada disso acontece: quem vê "Medieval (161)" sabe o que vai
 * encontrar, e quem vê um eixo sem nenhuma opção sabe que ali não há recorte
 * possível — o que também é informação.
 *
 * OPÇÃO COM ZERO NÃO APARECE
 * --------------------------
 * Ela não é oferecida. Oferecer um recorte que devolve vazio é convidar ao
 * beco sem saída, e um catálogo que faz isso ensina a desconfiar de todos os
 * filtros dele.
 *
 * AS FACETAS SE COMPÕEM
 * ---------------------
 * Cada uma é apurada **sobre o resultado dos outros filtros**, e não sobre o
 * acervo inteiro. Escolher "Barroco" faz a faceta de instrumento recontar: o
 * que aparece ali é o que existe de barroco, e não o que existe no mundo.
 *
 * É mais caro de calcular e é o único jeito de a contagem não mentir.
 */

export interface OpcaoDeFaceta {
  id: string;
  rotulo: string;
  /** Quantos itens este recorte devolve, no estado atual dos demais filtros. */
  quantos: number;
}

/**
 * QUANTO DO ACERVO ESTE EIXO ALCANÇA.
 *
 * É a informação que separa um filtro de uma armadilha. O acervo oferecia
 * "Região" sobre **dezessete obras de vinte e seis mil**, e quem clicava em
 * "Europa Ocidental (14)" concluía que eram essas as que existiam.
 *
 * A diferença entre "não há" e "não apuramos" é invisível no resultado de um
 * filtro. Declarar a cobertura é o único jeito de torná-la visível.
 */
export interface Cobertura {
  /** Itens do recorte atual que têm este campo preenchido. */
  comCampo: number;
  /** Itens do recorte atual, tenham o campo ou não. */
  total: number;
}

export interface Faceta {
  /** Chave do campo que esta faceta recorta. */
  campo: string;
  rotulo: string;
  /**
   * Por que este recorte existe, para quem passa o olho.
   *
   * Filtro sem explicação vira tentativa e erro. "Meio" e "gênero" parecem a
   * mesma coisa para quem não é músico, e não são.
   */
  ajuda: string;
  opcoes: OpcaoDeFaceta[];
  cobertura: Cobertura;
  /**
   * O eixo deveria alcançar o acervo inteiro?
   *
   * Há dois tipos de campo, e tratá-los igual produz as duas falhas opostas.
   *
   * **Universal** — era, região, compositor. Toda obra tem uma, e cobertura
   * baixa aqui é lacuna de apuração: o dado existe no mundo e falta aqui.
   *
   * **Seletivo** — movimento estético, partitura, número de catálogo. A
   * maioria das obras **não tem**, e isso é a realidade, e não buraco. Um
   * campo de movimento estético a cem por cento seria falso: a maior parte
   * dos compositores não pertence a movimento nenhum.
   *
   * Cobrar noventa por cento de um eixo seletivo levaria a inventar dado.
   * Não cobrar nada de um eixo universal deixa o filtro mentir.
   */
  universal: boolean;
}

/**
 * A contagem de um eixo: quanto cada valor devolve, e quantos têm o campo.
 *
 * `comCampo` não é a soma de `porValor`. Num campo de lista, uma obra com três
 * instrumentos soma três e é **uma** obra — e é a contagem de obras que diz
 * quanto do acervo o eixo alcança.
 */
export interface Contagem {
  porValor: Map<string, number>;
  comCampo: number;
  total: number;
}

/**
 * Conta as ocorrências de um campo numa lista, ignorando ausência.
 *
 * Ausência não vira opção "—": um item sem tonalidade declarada não pertence
 * a uma categoria chamada "sem tonalidade", ele apenas não participa desse
 * recorte. Mas ele **conta** no total, porque é dele que a cobertura fala.
 */
export function contar<T>(
  itens: T[],
  campo: (i: T) => string | undefined | null
): Contagem {
  const porValor = new Map<string, number>();
  let comCampo = 0;
  for (const i of itens) {
    const v = campo(i);
    if (!v) continue;
    comCampo += 1;
    porValor.set(v, (porValor.get(v) ?? 0) + 1);
  }
  return { porValor, comCampo, total: itens.length };
}

/**
 * Conta campo de lista — instrumentação, movimentos, eras de um compositor.
 *
 * Um item com três instrumentos conta uma vez em cada, e não um terço em cada:
 * a pergunta da faceta é "quantos itens tem isto", e não "qual a fração".
 */
export function contarLista<T>(itens: T[], campo: (i: T) => string[]): Contagem {
  const porValor = new Map<string, number>();
  let comCampo = 0;
  for (const i of itens) {
    const valores = new Set(campo(i).filter(Boolean));
    if (valores.size > 0) comCampo += 1;
    for (const v of valores) porValor.set(v, (porValor.get(v) ?? 0) + 1);
  }
  return { porValor, comCampo, total: itens.length };
}

/**
 * Monta a faceta a partir da contagem.
 *
 * `ordem` fixa a sequência quando ela é cronológica ou didática — eras e
 * sub-períodos não se ordenam por alfabeto nem por volume. Sem `ordem`, manda
 * a contagem: o recorte mais populoso primeiro, que é o que um catálogo faz.
 */
export function montarFaceta(
  campo: string,
  rotulo: string,
  ajuda: string,
  contagem: Contagem,
  rotulosDe: (id: string) => string = (id) => id,
  ordem?: string[],
  universal = false
): Faceta {
  const opcoes = [...contagem.porValor.entries()]
    .filter(([, n]) => n > 0)
    .map(([id, quantos]) => ({ id, rotulo: rotulosDe(id), quantos }));

  if (ordem) {
    const posicao = new Map(ordem.map((o, i) => [o, i]));
    opcoes.sort((a, b) => (posicao.get(a.id) ?? 999) - (posicao.get(b.id) ?? 999));
  } else {
    opcoes.sort((a, b) => b.quantos - a.quantos || a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
  }

  return {
    campo,
    rotulo,
    ajuda,
    opcoes,
    cobertura: { comCampo: contagem.comCampo, total: contagem.total },
    universal,
  };
}

/** A fração do recorte que este eixo alcança, de 0 a 1. */
export function fracaoCoberta(f: Faceta): number {
  return f.cobertura.total === 0 ? 0 : f.cobertura.comCampo / f.cobertura.total;
}

/**
 * O PISO DE DIGNIDADE DE UM EIXO UNIVERSAL.
 *
 * Abaixo disto, um campo que **toda** obra deveria ter vira amostra enviesada
 * com cara de catálogo. Não se aplica a eixo seletivo: exigir noventa por
 * cento de "movimento estético" levaria a inventar filiação.
 */
export const PISO_DO_FILTRO = 0.9;

/** Um eixo universal que não alcança o piso — é lacuna, e não realidade. */
export function abaixoDoPiso(f: Faceta): boolean {
  return f.universal && fracaoCoberta(f) < PISO_DO_FILTRO;
}

/**
 * A frase que a tela mostra quando o eixo não alcança tudo.
 *
 * Devolve `null` quando alcança — escrever "100% das obras têm este dado"
 * seria ruído, e ruído repetido ensina a não ler os avisos que importam.
 *
 * O texto diz **o que o filtro faz**, e não o que falta. "Recorta 45% do
 * acervo" é acionável; "55% sem dado" soa a desculpa e não ajuda a decidir.
 */
export function descreverCobertura(f: Faceta, unidade = 'registros'): string | null {
  const fracao = fracaoCoberta(f);
  if (fracao >= 0.995) return null;

  const pct = Math.round(fracao * 100);
  const quantos = f.cobertura.comCampo.toLocaleString('pt-BR');

  if (f.universal) {
    return `Recorta ${pct}% do acervo — ${quantos} ${unidade}. O que falta é apuração, e não ausência.`;
  }
  return `Recorta ${pct}% do acervo — ${quantos} ${unidade}. Nem todo registro tem este dado, e isso é a realidade do acervo.`;
}

/**
 * A ordem cronológica dos sub-períodos.
 *
 * Alfabética separaria "Early Romantic" de "Late Romantic" por acaso, e
 * ordenar por volume poria o século XX antes do Medieval. O tempo tem ordem.
 */
export const ORDEM_DOS_SUBPERIODOS = [
  'Medieval',
  'Renaissance',
  'Baroque',
  'Classical',
  'Early Romantic',
  'Romantic',
  'Late Romantic',
  'Post-Romantic',
  '20th Century',
  'Post-War',
  '21st Century',
];

/**
 * O MEIO — instrumento ou voz para que a obra foi escrita.
 *
 * É recorte diferente de gênero, e confundi-los é o erro mais comum de
 * catálogo amador. *Sonata* é gênero: diz a forma. *Piano* é meio: diz por
 * onde sai o som. Existe sonata para piano e sonata para violino, e quem
 * procura repertório procura pelo meio.
 */
/**
 * O meio GROSSO — a família por onde o som sai.
 *
 * É o recorte que a catalogação de origem oferece para as vinte e cinco mil:
 * ela sabe dizer "teclado", e não sabe dizer "cravo". Serve para varrer o
 * acervo inteiro, e não para escolher o que tocar.
 */
export const MEIOS_AMPLOS: Record<string, string> = {
  teclado: 'Teclado',
  orquestra: 'Orquestra',
  camara: 'Câmara',
  cena: 'Cena',
  vocal: 'Vocal',
  popular: 'Popular',
};

/**
 * O instrumento EXATO — o que a partitura declara.
 *
 * Só existe onde há edição: quem transcreveu escreveu para que instrumento.
 * É a diferença entre "há algo de teclado" e "há isto, para piano, e o
 * arquivo está aqui".
 */
export const INSTRUMENTOS_EXATOS: Record<string, string> = {
  Piano: 'Piano',
  Violin: 'Violino',
  Voice: 'Voz',
  Guitar: 'Violão',
  Cello: 'Violoncelo',
  Flute: 'Flauta',
  Harpsichord: 'Cravo',
  Organ: 'Órgão',
  Viola: 'Viola',
};

/**
 * Os dois níveis num mapa só, para rótulo.
 *
 * Conviver no mesmo campo é deliberado: uma obra de piano é obra de teclado, e
 * quem filtra por teclado tem de achá-la. O que **não** convive é a faceta —
 * são duas, porque oferecer "Teclado (5.286)" ao lado de "Piano (685)" como
 * se fossem irmãos ensina que o catálogo não sabe o que está contando.
 */
export const MEIOS = { ...MEIOS_AMPLOS, ...INSTRUMENTOS_EXATOS } as Record<string, string>;

/** O meio amplo a que um instrumento exato pertence. */
export const FAMILIA_DO_INSTRUMENTO: Record<string, string> = {
  Piano: 'teclado',
  Harpsichord: 'teclado',
  Organ: 'teclado',
  Violin: 'camara',
  Viola: 'camara',
  Cello: 'camara',
  Flute: 'camara',
  Guitar: 'camara',
  Voice: 'vocal',
};

export function ehMeioAmplo(id: string): boolean {
  return id in MEIOS_AMPLOS;
}

export function rotuloDoMeio(id: string): string {
  return MEIOS[id] ?? id;
}

/**
 * Separa uma contagem de meio nos dois níveis.
 *
 * Devolve `[amplos, exatos]`. O que a fonte não souber classificar cai em
 * exatos, e não some: instrumento desconhecido é instrumento, e apagar o que
 * não se reconhece é o catálogo perder o que tem de mais específico.
 *
 * A COBERTURA DE CADA NÍVEL É RECONTADA, E NÃO HERDADA
 * ---------------------------------------------------
 * Copiar `comCampo` da contagem inteira para os dois lados faria o nível exato
 * declarar que alcança o acervo todo, quando ele alcança só o que tem edição.
 * Cada nível conta quantos itens têm **algum** valor daquele nível.
 */
export function separarPorNivel(contagem: Contagem): [Contagem, Contagem] {
  const amplos = new Map<string, number>();
  const exatos = new Map<string, number>();
  for (const [id, n] of contagem.porValor) (ehMeioAmplo(id) ? amplos : exatos).set(id, n);

  /**
   * Quantos itens têm algum valor deste nível não sai da soma — um item com
   * dois instrumentos exatos somaria dois. O maior valor de um único recorte
   * é o piso seguro, e a soma é o teto; ficamos com o menor dos dois, que
   * nunca exagera a cobertura.
   */
  const alcance = (m: Map<string, number>) => {
    const soma = [...m.values()].reduce((a, b) => a + b, 0);
    return Math.min(soma, contagem.total);
  };

  return [
    { porValor: amplos, comCampo: alcance(amplos), total: contagem.total },
    { porValor: exatos, comCampo: alcance(exatos), total: contagem.total },
  ];
}

/** Situação de direito autoral, escrita para quem não é advogado. */
export const ROTULO_DA_SITUACAO: Record<string, string> = {
  PUBLIC_DOMAIN: 'Domínio público',
  LIKELY_PUBLIC_DOMAIN: 'Provavelmente livre — a confirmar',
  PROTECTED: 'Protegida por direito autoral',
  UNDETERMINED: 'Situação não apurada',
};
