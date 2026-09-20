import { ChairId } from '../domain/chair';
import {
  House,
  HouseNature,
  HouseStatus,
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
 *   2. registrar o corpus em `docs/harness/82_HOUSE_CORPUS.md` — fora do
 *      pacote, porque proveniência é trabalho editorial e não vai ao cliente;
 *   3. mudar o status para `EM_PREPARO`;
 *   4. rodar a ingestão e construir a trilha;
 *   5. preencher `curriculumPathId` e passar para `ABERTA`.
 */


export const DEFAULT_HOUSES: House[] = [
  {
    id: 'house_violinists',
    /** Recorta o mapa: quem tocava este instrumento. */
    instrumentoId: 'inst_violino',
    slug: 'violinistas',
    name: 'Violinistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Cordas friccionadas',
    // Corpus presente; progressão ainda não derivada dele.
    status: HouseStatus.IN_PREPARATION,
    description:
      'Quem estuda as cordas friccionadas. Reúne a progressão de repertório, os estudos técnicos e a formação de arco — do primeiro contato com o instrumento ao repertório solo barroco.',
    corpus: { obras: 4, ingeridas: 0 },
    cadeiraId: ChairId.VIOLINO,
    // Ausente por projeto: a trilha nasce da ingestão, não de suposição.
    curriculumPathId: undefined,
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },

  /**
   * A Casa que a correção de taxonomia tornou possível.
   *
   * Quem estuda história da música forma uma Casa tanto quanto quem toca
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
    status: HouseStatus.ANNOUNCED,
    description:
      'Quem estuda como a música chegou até aqui — períodos, escolas, obras e o que as ligou. Apoia-se nos cursos de História Ocidental, História Brasileira e História Social da Música Popular.',
    corpus: { obras: 0, ingeridas: 0 },
    cadeiraId: ChairId.HISTORIA,
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
    status: HouseStatus.ANNOUNCED,
    description:
      'Quem estuda a gramática da música — intervalo, escala, acorde, condução de vozes e forma. Apoia-se no curso de Teoria da Música.',
    corpus: { obras: 0, ingeridas: 0 },
    cadeiraId: ChairId.TEORIA,
    curriculumPathId: undefined,
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental'],
    techniqueSkillIds: [],
  },

  // ── Casas anunciadas, aguardando corpus ────────────────────────────────
  // Marcam o lugar sem prometer conteúdo.
  {
    id: 'house_pianists',
    /** Recorta o mapa: quem tocava este instrumento. */
    instrumentoId: 'inst_piano',
    slug: 'pianistas',
    name: 'Pianistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Teclas',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    corpus: { obras: 0, ingeridas: 0 },
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
  {
    id: 'house_singers',
    /** Recorta o mapa: quem tocava este instrumento. */
    instrumentoId: 'inst_voz',
    slug: 'cantores',
    name: 'Cantores',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Voz',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    corpus: { obras: 0, ingeridas: 0 },
    relevantEraIds: ['era_medieval', 'era_renascimento', 'era_barroco', 'era_romantismo'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil', 'reg_iberica'],
    techniqueSkillIds: [],
  },
  {
    id: 'house_guitarists',
    /** Recorta o mapa: quem tocava este instrumento. */
    instrumentoId: 'inst_violao',
    slug: 'violonistas',
    name: 'Violonistas',
    nature: HouseNature.INSTRUMENT,
    agrupamento: 'Cordas dedilhadas',
    status: HouseStatus.ANNOUNCED,
    description: 'Aguardando corpus pedagógico.',
    corpus: { obras: 0, ingeridas: 0 },
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
    corpus: { obras: 0, ingeridas: 0 },
    relevantEraIds: ['era_barroco', 'era_classicismo', 'era_romantismo', 'era_moderna'],
    relevantRegiaoIds: ['reg_europa_ocidental', 'reg_brasil'],
    techniqueSkillIds: [],
  },
];
