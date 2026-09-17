import {
  InstrumentIsland,
  InstrumentIslandStatus,
  InstrumentMethodSource,
} from '../domain/gamification';

/**
 * Ilhas de instrumento do Atlas.
 *
 * REGRA DE HONESTIDADE: uma ilha só é `AVAILABLE` quando existe corpus real
 * em `framework_knowledge/knowledge-<slug>/` E o currículo foi construído a
 * partir dele. Ilhas sem corpus ficam `PLANNED` — ocupam seu lugar no mapa,
 * declaram o que virá, e não fingem conteúdo.
 *
 * Isso é deliberado: o Atlas anunciava "142 obras do Barroco" sobre 5
 * registros fixos (CLAUDE_AUDIT.md K-05). Aqui, o que não existe aparece
 * como não existente.
 *
 * Para abrir uma nova ilha:
 *   1. criar `framework_knowledge/knowledge-<slug>/` com as obras;
 *   2. listar as fontes em `sources`, com `isIngested: false`;
 *   3. mudar o status para `IN_PREPARATION`;
 *   4. rodar a ingestão (COMANDO 8) e construir a trilha;
 *   5. preencher `curriculumPathId` e passar para `AVAILABLE`.
 */

const VIOLIN_SOURCES: InstrumentMethodSource[] = [
  {
    id: 'src_violin_suzuki_1',
    title: 'Suzuki Violin School',
    author: 'Shinichi Suzuki',
    volume: 'Volume 1',
    corpusPath: 'island-knowledge-violin/Suzuki_Violin_School_Volume-1.pdf',
    role: 'REPERTOIRE',
    isIngested: false,
  },
  {
    id: 'src_violin_suzuki_2',
    title: 'Suzuki Violin School',
    author: 'Shinichi Suzuki',
    volume: 'Volume 2',
    corpusPath: 'island-knowledge-violin/Suzuki_Violin_School_Volume-2.pdf',
    role: 'REPERTOIRE',
    isIngested: false,
  },
  {
    id: 'src_violin_suzuki_3',
    title: 'Suzuki Violin School',
    author: 'Shinichi Suzuki',
    volume: 'Volume 3',
    corpusPath: 'island-knowledge-violin/Suzuki_Violin_School_Volume-3.pdf',
    role: 'REPERTOIRE',
    isIngested: false,
  },
  ...([1, 2, 3, 4, 5] as const).map<InstrumentMethodSource>((v) => ({
    id: `src_violin_sitt_${v}`,
    title: 'Hans Sitt — 100 Estudos',
    author: 'Hans Sitt',
    volume: `Volume ${v}`,
    corpusPath: `island-knowledge-violin/Hans_Sitt_100_Worksheets_V.${v}.pdf`,
    role: 'ETUDES',
    isIngested: false,
  })),
  ...(['I', 'II', 'III'] as const).map<InstrumentMethodSource>((v, i) => ({
    id: `src_violin_maiabang_${i + 1}`,
    title: 'Maia Bang Violin Method',
    author: 'Maia Bang',
    volume: `Volume ${v}`,
    corpusPath: `island-knowledge-violin/Maia_Bang_Volume-${v}.pdf`,
    role: 'METHOD',
    isIngested: false,
  })),
  ...([1, 2, 3] as const).map<InstrumentMethodSource>((v) => ({
    id: `src_violin_afs_${v}`,
    title: 'All for Strings',
    author: 'Gerald Anderson & Robert Frost',
    volume: `Volume ${v}`,
    corpusPath: `island-knowledge-violin/ALL-FOR-STRINGS-VOLUME-${v}-VIOLINO.pdf`,
    role: 'METHOD',
    isIngested: false,
  })),
  {
    id: 'src_violin_laoureux',
    title: 'Méthode Pratique de Violon',
    author: 'Nicolas Laoureux',
    volume: 'Volumes 1 e 2',
    corpusPath: 'island-knowledge-violin/Laoureux_Método_Prático_V.1_V.2.pdf',
    role: 'TECHNIQUE',
    isIngested: false,
  },
];

export const SEED_INSTRUMENT_ISLANDS: InstrumentIsland[] = [
  {
    id: 'isl_violin',
    slug: 'violin',
    name: 'Violino',
    family: 'Cordas friccionadas',
    // Corpus completo presente (15 obras); currículo ainda não derivado dele.
    status: InstrumentIslandStatus.IN_PREPARATION,
    description:
      'A ilha das cordas friccionadas. Reúne a progressão de repertório de Suzuki, os estudos técnicos de Hans Sitt, o método de Maia Bang e a formação de conjunto de All for Strings — do primeiro contato com o arco ao repertório solo barroco.',
    mapCoordinates: { x: 32, y: 48 },
    sources: VIOLIN_SOURCES,
    // Ausente por projeto: a trilha nasce da ingestão, não de suposição.
    curriculumPathId: undefined,
    relevantEraIds: ['era_barroco', 'era_classico', 'era_romantico'],
    techniqueSkillIds: [],
  },

  // ── Ilhas declaradas, aguardando corpus ─────────────────────────────────
  // Marcam o lugar no mapa sem prometer conteúdo. Ao chegar a pasta
  // `knowledge-<slug>/`, seguem os cinco passos do cabeçalho deste arquivo.
  {
    id: 'isl_piano',
    slug: 'piano',
    name: 'Piano',
    family: 'Teclas',
    status: InstrumentIslandStatus.PLANNED,
    description: 'Aguardando corpus pedagógico.',
    mapCoordinates: { x: 58, y: 36 },
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classico', 'era_romantico', 'era_moderno'],
    techniqueSkillIds: [],
  },
  {
    id: 'isl_voice',
    slug: 'voice',
    name: 'Canto',
    family: 'Voz',
    status: InstrumentIslandStatus.PLANNED,
    description: 'Aguardando corpus pedagógico.',
    mapCoordinates: { x: 46, y: 62 },
    sources: [],
    relevantEraIds: ['era_barroco', 'era_classico', 'era_romantico', 'era_brasileira'],
    techniqueSkillIds: [],
  },
  {
    id: 'isl_guitar',
    slug: 'guitar',
    name: 'Violão',
    family: 'Cordas dedilhadas',
    status: InstrumentIslandStatus.PLANNED,
    description: 'Aguardando corpus pedagógico.',
    mapCoordinates: { x: 24, y: 70 },
    sources: [],
    relevantEraIds: ['era_romantico', 'era_moderno', 'era_brasileira'],
    techniqueSkillIds: [],
  },
];

/** Ilhas efetivamente navegáveis. */
export function availableIslands(islands = SEED_INSTRUMENT_ISLANDS): InstrumentIsland[] {
  return islands.filter((i) => i.status === InstrumentIslandStatus.AVAILABLE);
}

/** Total de fontes já processadas pela ingestão — base de qualquer contagem exibida. */
export function ingestedSourceCount(island: InstrumentIsland): number {
  return island.sources.filter((s) => s.isIngested).length;
}
