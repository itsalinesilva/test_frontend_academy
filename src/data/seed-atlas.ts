import { obrasDoRepertorio } from './seed-acervo';
import { AtlasWorkPlacement, MusicalEra } from '../domain/gamification';

/**
 * Taxonomia do Atlas.
 *
 * O QUE ISTO É, E O QUE NÃO É
 * ---------------------------
 * Isto é **conhecimento**, não dado fabricado — e a distinção é a mesma que
 * separa gerar um exercício de intervalo de inventar três questões fixas.
 *
 * O Barroco vai de cerca de 1600 a 1750. Isso não é um registro que alguém
 * cadastrou: é o recorte que o curso de História da Música Ocidental ensina,
 * capítulo por capítulo, e que qualquer manual do assunto repete. Declará-lo
 * aqui é catalogar o que a plataforma já ensina.
 *
 * O que **seria** fabricação, e por isso não está aqui:
 *
 *   - contagem de obras. A tela dizia "142 obras canônicas" numa plataforma
 *     **sem acervo de obras nenhum**. A contagem agora é CONTADA sobre as
 *     obras que existirem — e enquanto não existir nenhuma, o número é zero,
 *     que é a informação correta;
 *   - compositores como registros de catálogo, com biografia e retrato;
 *   - mundos com obra dentro, antes de haver obra.
 *
 * As eras abaixo saem dos períodos que `src/data/ocidental/capitulos.ts` e
 * `src/data/brasil/capitulos.ts` já cobrem. Não há era aqui que o
 * Conservatório não ensine.
 */
export const DEFAULT_ERAS: MusicalEra[] = [
  {
    id: 'era_antiguidade',
    slug: 'antiguidade',
    name: 'Antiguidade',
    periodYears: 'séc. IV a.C. – VI d.C.',
    description:
      'A herança grega, o sistema de tetracordes e modos, e o que a igreja cristã primitiva recebeu e recusou dela.',
    keyCharacteristics: ['Monodia', 'Sistema modal grego', 'Transmissão oral'],
    famousSchools: [],
    primaryAestheticColors: { primary: '#8B7355', accent: '#D4B483' },
    order: 1,
  },
  {
    id: 'era_medieval',
    slug: 'medieval',
    name: 'Idade Média',
    periodYears: 'séc. VI – XIV',
    description:
      'Do cantochão à ars nova: a liturgia se organiza, a polifonia nasce e a notação aprende a medir o tempo.',
    keyCharacteristics: ['Cantochão', 'Organum', 'Motete', 'Notação mensural'],
    famousSchools: ['Escola de Notre Dame', 'Ars nova francesa', 'Trecento italiano'],
    primaryAestheticColors: { primary: '#5C4033', accent: '#C9A227' },
    order: 2,
  },
  {
    id: 'era_renascimento',
    slug: 'renascimento',
    name: 'Renascimento',
    periodYears: 'c. 1400 – 1600',
    description:
      'A imitação generalizada e a subordinação da música ao texto, da contenance angloise à escola veneziana.',
    keyCharacteristics: ['Imitação', 'Polifonia vocal', 'Madrigal', 'Música impressa'],
    famousSchools: ['Escola da Borgonha', 'Escola franco-flamenga', 'Escola veneziana'],
    primaryAestheticColors: { primary: '#2F4F4F', accent: '#B8860B' },
    order: 3,
  },
  {
    id: 'era_barroco',
    slug: 'barroco',
    name: 'Barroco',
    periodYears: 'c. 1600 – 1750',
    description:
      'A monodia acompanhada, o baixo contínuo e a invenção da ópera; depois, a fuga e a suíte instrumental.',
    keyCharacteristics: ['Baixo contínuo', 'Ópera', 'Fuga', 'Concerto'],
    famousSchools: ['Escola romana', 'Escola napolitana', 'Escola alemã do norte'],
    primaryAestheticColors: { primary: '#4B0082', accent: '#DAA520' },
    order: 4,
  },
  {
    id: 'era_classicismo',
    slug: 'classicismo',
    name: 'Classicismo',
    periodYears: 'c. 1750 – 1820',
    description:
      'A forma sonata, o quarteto de cordas e a sinfonia; clareza de frase e equilíbrio de proporção.',
    keyCharacteristics: ['Forma sonata', 'Sinfonia', 'Quarteto de cordas', 'Periodicidade'],
    famousSchools: ['Escola de Mannheim', 'Classicismo vienense'],
    primaryAestheticColors: { primary: '#1C3F60', accent: '#E8C87E' },
    order: 5,
  },
  {
    id: 'era_romantismo',
    slug: 'romantismo',
    name: 'Romantismo',
    periodYears: 'c. 1820 – 1900',
    description:
      'A expansão harmônica, a peça de caráter, o poema sinfônico e as escolas nacionais.',
    keyCharacteristics: ['Cromatismo', 'Peça de caráter', 'Poema sinfônico', 'Nacionalismo'],
    famousSchools: ['Escola de Leipzig', 'Nova Escola Alemã', 'Escolas nacionais'],
    primaryAestheticColors: { primary: '#6B1F3A', accent: '#C9A227' },
    order: 6,
  },
  {
    id: 'era_moderna',
    slug: 'moderna',
    name: 'Moderna e século XX',
    periodYears: 'c. 1900 – 1975',
    description:
      'A dissolução da tonalidade, o serialismo, o neoclassicismo e a música eletroacústica.',
    keyCharacteristics: ['Atonalidade', 'Serialismo', 'Politonalidade', 'Eletroacústica'],
    famousSchools: ['Segunda Escola de Viena', 'Grupo dos Seis'],
    primaryAestheticColors: { primary: '#2B2B2B', accent: '#E0E0E0' },
    order: 7,
  },
  {
    id: 'era_contemporanea',
    slug: 'contemporanea',
    name: 'Contemporânea',
    periodYears: 'de 1975 aos dias de hoje',
    description: 'Pluralidade de linguagens, minimalismo, espectralismo e música mediada por computador.',
    keyCharacteristics: ['Minimalismo', 'Espectralismo', 'Música mediada por computador'],
    famousSchools: [],
    primaryAestheticColors: { primary: '#1F3A5F', accent: '#7FD1C1' },
    order: 8,
  },
];

/**
 * Região — o eixo geográfico.
 *
 * Criado em 18/09/2026, quando o catálogo de taxonomia mostrou que ele
 * faltava. Sem região, "Música Brasileira de Tradição" ficava listada como
 * **era** — e não é: é uma região que atravessa várias eras.
 *
 * Ver `docs/harness/75_ATLAS_TAXONOMY.md`.
 */
export interface Region {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Eras em que esta região tem repertório documentado pelos cursos. */
  eraIds: string[];
  order: number;
}

export const DEFAULT_REGIONS: Region[] = [
  {
    id: 'reg_europa_ocidental',
    slug: 'europa-ocidental',
    name: 'Europa Ocidental',
    description:
      'O eixo que os manuais de história da música ocidental percorrem: península itálica, terras germânicas, França, Inglaterra e Países Baixos.',
    eraIds: [
      'era_antiguidade',
      'era_medieval',
      'era_renascimento',
      'era_barroco',
      'era_classicismo',
      'era_romantismo',
      'era_moderna',
      'era_contemporanea',
    ],
    order: 1,
  },
  {
    id: 'reg_brasil',
    slug: 'brasil',
    name: 'Brasil',
    description:
      'Da música colonial à canção popular urbana, com as tradições que se formaram no encontro entre matrizes indígenas, africanas e ibéricas.',
    eraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna', 'era_contemporanea'],
    order: 2,
  },
  {
    /**
     * Acrescentada em 19/09, porque o repertório a exigia.
     *
     * Chopin e Tchaikovsky estavam no acervo sem região possível: nenhum dos
     * dois é Europa Ocidental, e forçá-los para lá seria escrever geografia
     * errada para caber numa lista curta. Região que falta se acrescenta.
     */
    id: 'reg_europa_oriental',
    slug: 'europa-oriental',
    name: 'Europa Oriental',
    description:
      'Terras eslavas, Rússia e Polônia — onde o século XIX descobriu que a música que se ouvia em casa podia disputar a sala de concerto com o eixo germânico.',
    /** Classicismo acrescentado em 19/09: o acervo tem compositores da região ali. */
    eraIds: ['era_classicismo', 'era_romantismo', 'era_moderna', 'era_contemporanea'],
    order: 4,
  },
  {
    id: 'reg_escandinavia',
    slug: 'escandinavia',
    name: 'Escandinávia',
    description:
      'Noruega, Suécia, Dinamarca e Finlândia. Chega tarde ao mapa do concerto europeu e chega com gramática própria — modo, dança e paisagem sonora que o centro não tinha.',
    /** Barroco acrescentado em 19/09, pelo mesmo motivo: há obra da região ali. */
    eraIds: ['era_barroco', 'era_romantismo', 'era_moderna', 'era_contemporanea'],
    order: 5,
  },
  {
    id: 'reg_iberica',
    slug: 'peninsula-iberica',
    name: 'Península Ibérica',
    description: 'Portugal e Espanha — a matriz que chega ao Brasil pela colonização.',
    /**
     * Romantismo e Moderna acrescentados em 19/09.
     *
     * `eraIds` **filtra** o que a tela oferece: uma região que não declara a
     * era some do seletor quando a era está escolhida, e a obra fica
     * inalcançável por esse caminho. Albéniz e Granados estavam nesse limbo.
     */
    eraIds: [
      'era_medieval',
      'era_renascimento',
      'era_barroco',
      'era_romantismo',
      'era_moderna',
    ],
    order: 6,
  },
  {
    /**
     * TRÊS REGIÕES ACRESCENTADAS EM 19/09, POR EXIGÊNCIA DO ACERVO.
     *
     * A cidadania de duzentos e dezesseis compositores foi apurada, e os
     * **Estados Unidos apareceram como o segundo maior grupo** — trinta e
     * três pessoas, atrás só da França. Não havia região nas Américas
     * além do Brasil, e trinta e três compositores ficavam sem lugar.
     *
     * Mandá-los para a Europa seria exatamente o erro contra o qual o
     * comentário da Europa Oriental já avisava: escrever geografia errada
     * para caber numa lista curta.
     *
     * As eras de cada uma são as que o acervo de fato tem, e não as que a
     * historiografia registra. Declarar uma era sem obra poria no seletor um
     * recorte que devolve vazio.
     */
    id: 'reg_america_do_norte',
    slug: 'america-do-norte',
    name: 'América do Norte',
    description:
      'Estados Unidos e Canadá — onde a música de concerto chega tarde, encontra o jazz e o espiritual já formados, e passa o século XX negociando com eles.',
    eraIds: ['era_romantismo', 'era_moderna', 'era_contemporanea'],
    order: 3,
  },
  {
    id: 'reg_america_latina',
    slug: 'america-latina',
    name: 'América Latina',
    description:
      'Argentina, México e vizinhos — o mesmo encontro de matrizes que o Brasil viveu, com outra língua e outras danças.',
    eraIds: ['era_moderna'],
    order: 7,
  },
  {
    id: 'reg_asia_oceania',
    slug: 'asia-oceania',
    name: 'Ásia e Oceania',
    description:
      'Japão e Austrália — presença pequena neste acervo, e registrada como é: dois compositores, no século XX.',
    eraIds: ['era_moderna', 'era_contemporanea'],
    order: 8,
  },
];

/**
 * Gênero — FACETA de filtro, não eixo do mapa.
 *
 * Não organiza o Atlas; refina a busca dentro dele. Uma fuga não é um lugar
 * que se visita.
 */
export interface Genre {
  id: string;
  slug: string;
  name: string;
  /** Vocal, instrumental, cênico ou misto. */
  nature: 'VOCAL' | 'INSTRUMENTAL' | 'CENICO' | 'MISTO';
}

export const DEFAULT_GENRES: Genre[] = [
  { id: 'gen_missa', slug: 'missa', name: 'Missa', nature: 'VOCAL' },
  { id: 'gen_motete', slug: 'motete', name: 'Motete', nature: 'VOCAL' },
  { id: 'gen_madrigal', slug: 'madrigal', name: 'Madrigal', nature: 'VOCAL' },
  { id: 'gen_opera', slug: 'opera', name: 'Ópera', nature: 'CENICO' },
  { id: 'gen_oratorio', slug: 'oratorio', name: 'Oratório', nature: 'MISTO' },
  { id: 'gen_cantata', slug: 'cantata', name: 'Cantata', nature: 'MISTO' },
  { id: 'gen_suite', slug: 'suite', name: 'Suíte', nature: 'INSTRUMENTAL' },
  { id: 'gen_concerto', slug: 'concerto', name: 'Concerto', nature: 'INSTRUMENTAL' },
  { id: 'gen_sonata', slug: 'sonata', name: 'Sonata', nature: 'INSTRUMENTAL' },
  { id: 'gen_sinfonia', slug: 'sinfonia', name: 'Sinfonia', nature: 'INSTRUMENTAL' },
  { id: 'gen_quarteto', slug: 'quarteto-de-cordas', name: 'Quarteto de cordas', nature: 'INSTRUMENTAL' },
  { id: 'gen_fuga', slug: 'fuga', name: 'Fuga', nature: 'INSTRUMENTAL' },
  { id: 'gen_peca_carater', slug: 'peca-de-carater', name: 'Peça de caráter', nature: 'INSTRUMENTAL' },
  { id: 'gen_choro', slug: 'choro', name: 'Choro', nature: 'INSTRUMENTAL' },
  { id: 'gen_modinha', slug: 'modinha', name: 'Modinha', nature: 'VOCAL' },
  { id: 'gen_cancao', slug: 'cancao', name: 'Canção', nature: 'VOCAL' },
  /*
    Acrescentados em 19/09, porque o repertório os exigia.

    Cada um destes é a forma que o TÍTULO de uma faixa declara — "Minueto em
    sol maior", "Cânone", "Gavota". Derivar o gênero do que o título diz é
    leitura; inventá-lo para preencher o filtro seria fabricação.
  */
  { id: 'gen_preludio', slug: 'preludio', name: 'Prelúdio', nature: 'INSTRUMENTAL' },
  { id: 'gen_minueto', slug: 'minueto', name: 'Minueto', nature: 'INSTRUMENTAL' },
  { id: 'gen_canone', slug: 'canone', name: 'Cânone', nature: 'INSTRUMENTAL' },
  { id: 'gen_coral', slug: 'coral', name: 'Coral', nature: 'VOCAL' },
  { id: 'gen_marcha', slug: 'marcha', name: 'Marcha', nature: 'INSTRUMENTAL' },
  { id: 'gen_serenata', slug: 'serenata', name: 'Serenata', nature: 'INSTRUMENTAL' },
  { id: 'gen_bagatela', slug: 'bagatela', name: 'Bagatela', nature: 'INSTRUMENTAL' },
  { id: 'gen_gavota', slug: 'gavota', name: 'Gavota', nature: 'INSTRUMENTAL' },
  { id: 'gen_valsa', slug: 'valsa', name: 'Valsa', nature: 'INSTRUMENTAL' },

  /**
   * DEZESSETE FORMAS EXIGIDAS PELO CATÁLOGO, E NÃO ESCOLHIDAS POR GOSTO.
   *
   * A leitura dos títulos do acervo — vinte e cinco mil — devolve trinta e
   * seis formas escritas nas próprias obras. Dezenove já estavam aqui; estas
   * dezessete não, e sem elas o filtro mostraria o identificador cru ao lado
   * dos nomes, como se parte do catálogo fosse de segunda classe.
   *
   * O critério de entrada é o mesmo de sempre: a forma **aparece escrita** em
   * obra do acervo. Nenhuma entrou por ser importante na historiografia sem
   * ter obra aqui — isso seria povoar o filtro com recorte que devolve vazio.
   *
   * `quarteto` e `quinteto` ficam genéricos. `quarteto-de-cordas`, acima, é
   * mais específico, e o título raramente diz qual dos dois é: presumir cordas
   * afirmaria uma instrumentação que ninguém apurou.
   */
  { id: 'gen_trio', slug: 'trio', name: 'Trio', nature: 'INSTRUMENTAL' },
  { id: 'gen_quarteto_generico', slug: 'quarteto', name: 'Quarteto', nature: 'INSTRUMENTAL' },
  { id: 'gen_quinteto', slug: 'quinteto', name: 'Quinteto', nature: 'INSTRUMENTAL' },
  { id: 'gen_mazurca', slug: 'mazurca', name: 'Mazurca', nature: 'INSTRUMENTAL' },
  { id: 'gen_polonesa', slug: 'polonesa', name: 'Polonesa', nature: 'INSTRUMENTAL' },
  { id: 'gen_noturno', slug: 'noturno', name: 'Noturno', nature: 'INSTRUMENTAL' },
  { id: 'gen_estudo', slug: 'estudo', name: 'Estudo', nature: 'INSTRUMENTAL' },
  { id: 'gen_capricho', slug: 'capricho', name: 'Capricho', nature: 'INSTRUMENTAL' },
  { id: 'gen_rapsodia', slug: 'rapsodia', name: 'Rapsódia', nature: 'INSTRUMENTAL' },
  { id: 'gen_variacoes', slug: 'variacoes', name: 'Variações', nature: 'INSTRUMENTAL' },
  { id: 'gen_balada', slug: 'balada', name: 'Balada', nature: 'INSTRUMENTAL' },
  { id: 'gen_abertura', slug: 'abertura', name: 'Abertura', nature: 'INSTRUMENTAL' },
  { id: 'gen_impromptu', slug: 'impromptu', name: 'Impromptu', nature: 'INSTRUMENTAL' },
  { id: 'gen_romance', slug: 'romance', name: 'Romance', nature: 'INSTRUMENTAL' },
  { id: 'gen_tocata', slug: 'tocata', name: 'Tocata', nature: 'INSTRUMENTAL' },
  { id: 'gen_poema', slug: 'poema', name: 'Poema', nature: 'INSTRUMENTAL' },
  /** Missa de defuntos: vocal, e distinta da missa comum pelo texto. */
  { id: 'gen_requiem', slug: 'requiem', name: 'Réquiem', nature: 'VOCAL' },
  { id: 'gen_hino', slug: 'hino', name: 'Hino', nature: 'VOCAL' },
];

/**
 * O ACERVO DO ATLAS SAI DO ACERVO CANONICO.
 *
 * Aqui havia `DEFAULT_WORKS: never[] = []` — e o comentario explicava, com
 * razao, que a tela dizia "142 obras canonicas" sobre um acervo de zero.
 *
 * O que ninguem tinha notado e que passou a haver **dois modelos de obra**: o
 * canonico (`CanonicalWork`, com proveniencia e dominio publico calculado) e
 * este, que e a projecao do canonico no mapa — apenas as coordenadas de era,
 * regiao, compositor e genero.
 *
 * Enquanto os dois viveram separados, o acervo tinha seus 17 registros e a
 * TELA lia zero. Derivar resolve: ha uma fonte so, e o mapa e uma vista dela.
 *
 * A contagem continua sendo CONTADA. O que mudou e que agora ha o que contar.
 */
export const DEFAULT_WORKS: AtlasWorkPlacement[] = obrasDoRepertorio().map((o) => ({
  workId: o.id,
  eraId: o.periodId ?? '',
  regionId: o.regionId,
  composerId: o.composerIds[0],
  generoId: o.generoId,
}));
