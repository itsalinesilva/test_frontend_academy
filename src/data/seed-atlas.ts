import { MusicalEra } from '../domain/gamification';

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
    id: 'reg_iberica',
    slug: 'peninsula-iberica',
    name: 'Península Ibérica',
    description: 'Portugal e Espanha — a matriz que chega ao Brasil pela colonização.',
    eraIds: ['era_medieval', 'era_renascimento', 'era_barroco'],
    order: 3,
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
];

/**
 * O acervo de obras nasce VAZIO.
 *
 * É a linha mais importante deste arquivo. A tela do Atlas dizia "142 obras
 * canônicas" no Barroco — número que ninguém contou, sobre obras que não
 * existem. Catalogar obra exige decidir edição, proveniência e domínio
 * público, e nada disso foi feito.
 *
 * Enquanto o acervo estiver vazio, a contagem de cada era é **zero**. A tela
 * mostra a taxonomia — que é real e é conhecimento — e diz, sem rodeio, que
 * ainda não há obra catalogada.
 */
export const DEFAULT_WORKS: never[] = [];
