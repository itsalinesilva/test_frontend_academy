import {
  House,
  HouseNature,
  HouseStatus,
  HouseSource,
} from '../domain/house';

/**
 * As Casas do Conservatório.
 *
 * REGRA DE HONESTIDADE: uma Casa só é `ABERTA` quando existe corpus real no
 * acervo **e** a progressão foi construída a partir dele. Casa sem corpus
 * fica `ANUNCIADA` — ocupa seu lugar na lista, declara o que virá, e não
 * finge conteúdo.
 *
 * Isso é deliberado. O Atlas já anunciou "142 obras do Barroco" sobre cinco
 * registros escritos numa tela. Aqui, o que não existe aparece como não
 * existente.
 *
 * Para abrir uma Casa:
 *   1. reunir o corpus no acervo;
 *   2. listar as fontes em `sources`, com `isIngested: false`;
 *   3. mudar o status para `EM_PREPARO`;
 *   4. rodar a ingestão e construir a trilha;
 *   5. preencher `curriculumPathId` e passar para `ABERTA`.
 */

const FONTES_VIOLINO: HouseSource[] = [
  ...[1, 2, 3].map((n) => ({
    id: `src_violin_suzuki_${n}`,
    title: 'Suzuki Violin School',
    author: 'Shinichi Suzuki',
    volume: `Volume ${n}`,
    corpusPath: `house-violin/Nivel ${n}/Suzuki_Violin_School_Volume-${n}.pdf`,
    role: 'REPERTORIO' as const,
    isIngested: false,
  })),
  {
    id: 'src_violin_laoureux',
    title: 'Méthode Pratique de Violon',
    author: 'Nicolas Laoureux',
    volume: 'Volumes 1 e 2',
    corpusPath: 'house-violin/Nivel 1/Laoureux_Metodo_Pratico_V1_V2.pdf',
    role: 'TECNICA',
    isIngested: false,
  },
];

export const DEFAULT_HOUSES: House[] = [
  {
    id: 'house_violinists',
    slug: 'violinistas',
    name: 'Violinistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Cordas friccionadas',
    // Corpus presente; progressão ainda não derivada dele.
    status: HouseStatus.IN_PREPARATION,
    description:
      'Quem estuda as cordas friccionadas. Reúne a progressão de repertório de Suzuki, os estudos técnicos e o método de Laoureux — do primeiro contato com o arco ao repertório solo barroco.',
    sources: FONTES_VIOLINO,
    // Ausente por projeto: a trilha nasce da ingestão, não de suposição.
    curriculumPathId: undefined,
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },

  /**
   * A tribo que a correção de taxonomia tornou possível.
   *
   * Quem estuda história da música forma uma tribo tanto quanto quem toca
   * violino — e, com o nome "ilha de instrumento", ela não cabia em lugar
   * nenhum. O corpus dela já existe: são os três cursos de História que o
   * Conservatório publica.
   */
  {
    id: 'house_historians',
    slug: 'historiadores',
    name: 'Historiadores da música',
    nature: HouseNature.DISCIPLINE,
    agrupamento: 'Musicologia',
    status: HouseStatus.IN_PREPARATION,
    description:
      'Quem estuda como a música chegou até aqui — períodos, escolas, obras e o que as ligou. Apoia-se nos cursos de História Ocidental, História Brasileira e História Social da Música Popular.',
    sources: [],
    curriculumPathId: undefined,
    relevantEraIds: [
      'era_antiguidade',
      'era_medieval',
      'era_renascimento',
      'era_barroco',
      'era_classicismo',
      'era_romantismo',
      'era_moderna',
      'era_contemporanea',
    ],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },

  {
    id: 'house_theorists',
    slug: 'teoricos',
    name: 'Teóricos',
    nature: HouseNature.DISCIPLINE,
    agrupamento: 'Teoria e análise',
    status: HouseStatus.IN_PREPARATION,
    description:
      'Quem estuda a gramática da música — intervalo, escala, acorde, condução de vozes e forma. Apoia-se no curso de Teoria da Música.',
    sources: [],
    curriculumPathId: undefined,
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental'],
    techniqueSkillIds: [],
  },

  // ── Tribos anunciadas, aguardando corpus ────────────────────────────────
  // Marcam o lugar sem prometer conteúdo.
  {
    id: 'house_pianists',
    slug: 'pianistas',
    name: 'Pianistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Teclas',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
  {
    id: 'house_singers',
    slug: 'cantores',
    name: 'Cantores',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Voz',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_medieval', 'era_renascimento', 'era_barroco', 'era_romantismo'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },
  {
    id: 'house_guitarists',
    slug: 'violonistas',
    name: 'Violonistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Cordas dedilhadas',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_romantismo', 'era_moderna', 'era_contemporanea'],
    relevantRegiaoIds: ['reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },
  {
    id: 'house_composers',
    slug: 'compositores',
    name: 'Compositores',
    nature: HouseNature.CRAFT,
    agrupamento: 'Criação',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
];
