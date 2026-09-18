import {
  Tribo,
  NaturezaDaTribo,
  StatusDaTribo,
  FonteDaTribo,
} from '../domain/tribo';

/**
 * As tribos do Conservatório.
 *
 * REGRA DE HONESTIDADE: uma tribo só é `ABERTA` quando existe corpus real no
 * acervo **e** a progressão foi construída a partir dele. Tribo sem corpus
 * fica `ANUNCIADA` — ocupa seu lugar na lista, declara o que virá, e não
 * finge conteúdo.
 *
 * Isso é deliberado. O Atlas já anunciou "142 obras do Barroco" sobre cinco
 * registros escritos numa tela. Aqui, o que não existe aparece como não
 * existente.
 *
 * Para abrir uma tribo:
 *   1. reunir o corpus no acervo;
 *   2. listar as fontes em `sources`, com `isIngested: false`;
 *   3. mudar o status para `EM_PREPARO`;
 *   4. rodar a ingestão e construir a trilha;
 *   5. preencher `curriculumPathId` e passar para `ABERTA`.
 */

const FONTES_VIOLINO: FonteDaTribo[] = [
  ...[1, 2, 3].map((n) => ({
    id: `src_violin_suzuki_${n}`,
    title: 'Suzuki Violin School',
    author: 'Shinichi Suzuki',
    volume: `Volume ${n}`,
    corpusPath: `tribo-violino/Nivel ${n}/Suzuki_Violin_School_Volume-${n}.pdf`,
    role: 'REPERTORIO' as const,
    isIngested: false,
  })),
  {
    id: 'src_violin_laoureux',
    title: 'Méthode Pratique de Violon',
    author: 'Nicolas Laoureux',
    volume: 'Volumes 1 e 2',
    corpusPath: 'tribo-violino/Nivel 1/Laoureux_Metodo_Pratico_V1_V2.pdf',
    role: 'TECNICA',
    isIngested: false,
  },
];

export const TRIBOS_PADRAO: Tribo[] = [
  {
    id: 'tribo_violinistas',
    slug: 'violinistas',
    name: 'Violinistas',
    natureza: NaturezaDaTribo.INSTRUMENTO,
    agrupamento: 'Cordas friccionadas',
    // Corpus presente; progressão ainda não derivada dele.
    status: StatusDaTribo.EM_PREPARO,
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
    id: 'tribo_historiadores',
    slug: 'historiadores',
    name: 'Historiadores da música',
    natureza: NaturezaDaTribo.DISCIPLINA,
    agrupamento: 'Musicologia',
    status: StatusDaTribo.EM_PREPARO,
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
    id: 'tribo_teoricos',
    slug: 'teoricos',
    name: 'Teóricos',
    natureza: NaturezaDaTribo.DISCIPLINA,
    agrupamento: 'Teoria e análise',
    status: StatusDaTribo.EM_PREPARO,
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
    id: 'tribo_pianistas',
    slug: 'pianistas',
    name: 'Pianistas',
    natureza: NaturezaDaTribo.INSTRUMENTO,
    agrupamento: 'Teclas',
    status: StatusDaTribo.ANUNCIADA,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
  {
    id: 'tribo_cantores',
    slug: 'cantores',
    name: 'Cantores',
    natureza: NaturezaDaTribo.INSTRUMENTO,
    agrupamento: 'Voz',
    status: StatusDaTribo.ANUNCIADA,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_medieval', 'era_renascimento', 'era_barroco', 'era_romantismo'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },
  {
    id: 'tribo_violonistas',
    slug: 'violonistas',
    name: 'Violonistas',
    natureza: NaturezaDaTribo.INSTRUMENTO,
    agrupamento: 'Cordas dedilhadas',
    status: StatusDaTribo.ANUNCIADA,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_romantismo', 'era_moderna', 'era_contemporanea'],
    relevantRegiaoIds: ['reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },
  {
    id: 'tribo_compositores',
    slug: 'compositores',
    name: 'Compositores',
    natureza: NaturezaDaTribo.OFICIO,
    agrupamento: 'Criação',
    status: StatusDaTribo.ANUNCIADA,
    description: 'Aguardando corpus pedagógico.',
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
];
