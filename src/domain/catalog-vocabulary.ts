import { EntityId, ISOTimestamp } from './types';

/**
 * OS VOCABULÁRIOS DO CATÁLOGO — papel, instrumento, voz, forma.
 *
 * POR QUE ELES SÃO ENTIDADES, E NÃO CAMPOS DE TEXTO
 * -------------------------------------------------
 * O catálogo trazia `instrumentosPraticados?: string[]` dentro do compositor.
 * Três coisas estavam erradas nisso, e nenhuma aparecia:
 *
 *   **O instrumento virava atributo de quem compõe.** Um violinista que nunca
 *   escreveu uma nota não tinha onde existir — o tipo se chamava
 *   `CanonicalComposer`, e a única forma de entrar no acervo era compondo.
 *
 *   **O valor era a grafia da fonte.** `piano`, `órgão`, `guitarra` vinham do
 *   rótulo em português do Wikidata. Mudou o rótulo, quebrou o filtro.
 *
 *   **Não havia família.** Ninguém conseguia perguntar "o que há de cordas",
 *   porque violino e violoncelo eram duas cadeias de texto sem parentesco.
 *
 * Vocabulário controlado resolve os três: o identificador é nosso, o rótulo é
 * exibição, e a hierarquia é declarada.
 *
 * ESTES SÃO OS EIXOS, E NÃO AS ENTIDADES
 * --------------------------------------
 * Pessoa, Obra, Edição, Partitura e Gravação são as entidades do catálogo —
 * coisas que existem no mundo e têm ficha. Papel, instrumento, voz e forma são
 * **como** essas entidades se classificam. Confundir os dois foi o que fez o
 * campo de gênero guardar meio, e o campo de compositor guardar instrumento.
 */

// ---------------------------------------------------------------------------
// Papel
// ---------------------------------------------------------------------------

/**
 * O QUE UMA PESSOA FAZ NA MÚSICA — e ela faz mais de uma coisa.
 *
 * Bach é compositor, organista e cravista. Liszt é compositor, pianista e
 * professor. Tratar "compositor" como o tipo da pessoa obrigava a escolher
 * um, e escolher apagava os outros.
 *
 * A separação entre AUTORIA e INTERPRETAÇÃO não é decorativa: ela decide o que
 * a ficha da obra pode afirmar. Quem compôs responde pela obra; quem a tocou
 * responde por uma execução dela, que é outro registro.
 */
export type NaturezaDoPapel =
  /** Fez a obra existir: compositor, arranjador, libretista. */
  | 'AUTORIA'
  /** Realizou a obra: instrumentista, cantor, regente. */
  | 'INTERPRETACAO'
  /** Trabalhou sobre a obra sem a compor nem a tocar: editor, copista. */
  | 'EDITORIAL'
  /** Escreveu sobre música: musicólogo, teórico, crítico. */
  | 'ESTUDO'
  /** Ensinou. */
  | 'ENSINO';

export interface PapelMusical {
  id: EntityId;
  rotulo: string;
  natureza: NaturezaDoPapel;
  /**
   * O papel exige um instrumento ou uma voz declarada?
   *
   * "Pianista" sem instrumento é redundante — o papel já o nomeia. "Cantor"
   * sem tessitura é uma ficha incompleta, e a ficha precisa saber disso para
   * cobrar. "Compositor" não exige nenhum dos dois.
   */
  exige?: 'INSTRUMENTO' | 'VOZ';
}

export const PAPEIS: PapelMusical[] = [
  { id: 'papel_compositor', rotulo: 'Compositor', natureza: 'AUTORIA' },
  { id: 'papel_arranjador', rotulo: 'Arranjador', natureza: 'AUTORIA' },
  { id: 'papel_orquestrador', rotulo: 'Orquestrador', natureza: 'AUTORIA' },
  /** Quem escreveu o texto cantado. Sem ele, metade da ópera não tem autor. */
  { id: 'papel_libretista', rotulo: 'Libretista', natureza: 'AUTORIA' },
  { id: 'papel_letrista', rotulo: 'Letrista', natureza: 'AUTORIA' },

  {
    id: 'papel_instrumentista',
    rotulo: 'Instrumentista',
    natureza: 'INTERPRETACAO',
    exige: 'INSTRUMENTO',
  },
  { id: 'papel_cantor', rotulo: 'Cantor', natureza: 'INTERPRETACAO', exige: 'VOZ' },
  { id: 'papel_regente', rotulo: 'Regente', natureza: 'INTERPRETACAO' },

  { id: 'papel_editor', rotulo: 'Editor', natureza: 'EDITORIAL' },
  { id: 'papel_transcritor', rotulo: 'Transcritor', natureza: 'EDITORIAL' },
  { id: 'papel_copista', rotulo: 'Copista', natureza: 'EDITORIAL' },

  { id: 'papel_musicologo', rotulo: 'Musicólogo', natureza: 'ESTUDO' },
  { id: 'papel_teorico', rotulo: 'Teórico', natureza: 'ESTUDO' },

  { id: 'papel_professor', rotulo: 'Professor', natureza: 'ENSINO' },
];

export const PAPEL_POR_ID = new Map(PAPEIS.map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// Instrumento
// ---------------------------------------------------------------------------

/**
 * A família do instrumento, na divisão que a orquestra usa.
 *
 * Existe classificação mais rigorosa — Hornbostel-Sachs separa por como o som
 * é produzido, e põe o piano entre as cordas percutidas. Ela é melhor para
 * organologia e pior para quem procura repertório: quem toca piano procura
 * "teclas", e não "cordas percutidas".
 *
 * O catálogo é de uma escola de música, e segue a divisão da escola.
 */
export type FamiliaDeInstrumento =
  | 'CORDAS'
  | 'TECLAS'
  | 'SOPROS_MADEIRA'
  | 'SOPROS_METAL'
  | 'PERCUSSAO'
  | 'VOZ'
  | 'ELETRONICO';

export interface Instrumento {
  id: EntityId;
  rotulo: string;
  familia: FamiliaDeInstrumento;
  /**
   * Como as fontes o escrevem — inglês, alemão, o rótulo do Wikidata.
   *
   * É por aqui que a resolução liga `Violin`, `Violine`, `violino` e `Geige` ao
   * mesmo identificador. Sem isto, cada fonte cria um instrumento novo.
   */
  sinonimos: string[];
}

export const INSTRUMENTOS: Instrumento[] = [
  { id: 'inst_piano', rotulo: 'Piano', familia: 'TECLAS', sinonimos: ['piano', 'pianoforte', 'klavier'] },
  { id: 'inst_cravo', rotulo: 'Cravo', familia: 'TECLAS', sinonimos: ['harpsichord', 'cembalo', 'clavecin', 'cravo'] },
  { id: 'inst_orgao', rotulo: 'Órgão', familia: 'TECLAS', sinonimos: ['organ', 'orgel', 'orgue', 'órgão', 'orgao'] },
  { id: 'inst_clavicordio', rotulo: 'Clavicórdio', familia: 'TECLAS', sinonimos: ['clavichord', 'clavicórdio'] },

  { id: 'inst_violino', rotulo: 'Violino', familia: 'CORDAS', sinonimos: ['violin', 'violine', 'violino', 'geige'] },
  { id: 'inst_viola', rotulo: 'Viola', familia: 'CORDAS', sinonimos: ['viola', 'bratsche'] },
  { id: 'inst_violoncelo', rotulo: 'Violoncelo', familia: 'CORDAS', sinonimos: ['cello', 'violoncello', 'violoncelo'] },
  { id: 'inst_contrabaixo', rotulo: 'Contrabaixo', familia: 'CORDAS', sinonimos: ['double bass', 'kontrabass', 'contrabaixo'] },
  { id: 'inst_violao', rotulo: 'Violão', familia: 'CORDAS', sinonimos: ['guitar', 'gitarre', 'violão', 'violao', 'guitarra'] },
  { id: 'inst_harpa', rotulo: 'Harpa', familia: 'CORDAS', sinonimos: ['harp', 'harfe', 'harpa'] },
  { id: 'inst_alaude', rotulo: 'Alaúde', familia: 'CORDAS', sinonimos: ['lute', 'laute', 'alaúde', 'alaude'] },
  { id: 'inst_viola_da_gamba', rotulo: 'Viola da gamba', familia: 'CORDAS', sinonimos: ['viola da gamba', 'gambe'] },

  { id: 'inst_flauta', rotulo: 'Flauta', familia: 'SOPROS_MADEIRA', sinonimos: ['flute', 'flöte', 'flauta'] },
  { id: 'inst_oboe', rotulo: 'Oboé', familia: 'SOPROS_MADEIRA', sinonimos: ['oboe', 'oboé', 'hautbois'] },
  { id: 'inst_clarinete', rotulo: 'Clarinete', familia: 'SOPROS_MADEIRA', sinonimos: ['clarinet', 'klarinette', 'clarinete'] },
  { id: 'inst_fagote', rotulo: 'Fagote', familia: 'SOPROS_MADEIRA', sinonimos: ['bassoon', 'fagott', 'fagote'] },
  { id: 'inst_saxofone', rotulo: 'Saxofone', familia: 'SOPROS_MADEIRA', sinonimos: ['saxophone', 'saxofone', 'sax'] },

  { id: 'inst_trompete', rotulo: 'Trompete', familia: 'SOPROS_METAL', sinonimos: ['trumpet', 'trompete'] },
  { id: 'inst_trompa', rotulo: 'Trompa', familia: 'SOPROS_METAL', sinonimos: ['horn', 'french horn', 'trompa'] },
  { id: 'inst_trombone', rotulo: 'Trombone', familia: 'SOPROS_METAL', sinonimos: ['trombone', 'posaune'] },
  { id: 'inst_tuba', rotulo: 'Tuba', familia: 'SOPROS_METAL', sinonimos: ['tuba'] },

  { id: 'inst_timpano', rotulo: 'Tímpano', familia: 'PERCUSSAO', sinonimos: ['timpani', 'pauken', 'tímpano'] },
  { id: 'inst_percussao', rotulo: 'Percussão', familia: 'PERCUSSAO', sinonimos: ['percussion', 'percussão', 'percussao'] },

  { id: 'inst_voz', rotulo: 'Voz', familia: 'VOZ', sinonimos: ['voice', 'stimme', 'voz', 'vocal'] },
];

export const INSTRUMENTO_POR_ID = new Map(INSTRUMENTOS.map((i) => [i.id, i]));

/**
 * O índice de sinônimo para identificador, montado uma vez.
 *
 * É o que impede cada fonte de inventar um instrumento: `Violin` do Mutopia,
 * `violino` do Wikidata e `Violine` de uma edição alemã chegam ao mesmo
 * `inst_violino`.
 */
const POR_SINONIMO = new Map<string, EntityId>();
for (const i of INSTRUMENTOS) {
  POR_SINONIMO.set(normalizar(i.rotulo), i.id);
  for (const s of i.sinonimos) POR_SINONIMO.set(normalizar(s), i.id);
}

function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Resolve a grafia de uma fonte para o instrumento do catálogo.
 *
 * Devolve `undefined` quando não reconhece, e **não** cria um instrumento novo.
 * Vocabulário que cresce sozinho deixa de ser vocabulário: em um mês há
 * `Violin`, `violin` e `Violino` como três instrumentos distintos, e o filtro
 * de cordas perde dois terços do que deveria achar.
 */
export function resolverInstrumento(grafia: string): EntityId | undefined {
  return POR_SINONIMO.get(normalizar(grafia));
}

/** Os instrumentos de uma família — é o que responde "o que há de cordas". */
export function instrumentosDaFamilia(familia: FamiliaDeInstrumento): Instrumento[] {
  return INSTRUMENTOS.filter((i) => i.familia === familia);
}

// ---------------------------------------------------------------------------
// Voz
// ---------------------------------------------------------------------------

/**
 * A TESSITURA — e por que ela não é um instrumento.
 *
 * Um barítono não é "um compositor que tem uma voz". É uma pessoa cujo papel
 * inclui interpretação vocal, com registro barítono. A tessitura classifica a
 * PESSOA num papel, e classifica também a PARTE de uma obra: uma ária é para
 * soprano independentemente de quem a cante.
 *
 * Por isso o vocabulário é um só e serve aos dois lados. Duplicá-lo — uma
 * lista para cantores e outra para partes vocais — faria "soprano" divergir de
 * "Soprano" no primeiro cadastro.
 */
export type Tessitura =
  | 'SOPRANO'
  | 'MEZZO_SOPRANO'
  | 'CONTRALTO'
  | 'CONTRATENOR'
  | 'TENOR'
  | 'BARITONO'
  | 'BAIXO';

export interface RegistroVocal {
  id: Tessitura;
  rotulo: string;
  /** Aguda, média ou grave — o recorte grosso, para quem não é cantor. */
  extensao: 'AGUDA' | 'MEDIA' | 'GRAVE';
  sinonimos: string[];
}

export const VOZES: RegistroVocal[] = [
  { id: 'SOPRANO', rotulo: 'Soprano', extensao: 'AGUDA', sinonimos: ['soprano'] },
  { id: 'MEZZO_SOPRANO', rotulo: 'Mezzo-soprano', extensao: 'AGUDA', sinonimos: ['mezzo-soprano', 'mezzosoprano', 'mezzo'] },
  { id: 'CONTRALTO', rotulo: 'Contralto', extensao: 'MEDIA', sinonimos: ['contralto', 'alto'] },
  { id: 'CONTRATENOR', rotulo: 'Contratenor', extensao: 'MEDIA', sinonimos: ['countertenor', 'contratenor'] },
  { id: 'TENOR', rotulo: 'Tenor', extensao: 'MEDIA', sinonimos: ['tenor', 'tenore'] },
  { id: 'BARITONO', rotulo: 'Barítono', extensao: 'GRAVE', sinonimos: ['baritone', 'bariton', 'barítono', 'baritono'] },
  { id: 'BAIXO', rotulo: 'Baixo', extensao: 'GRAVE', sinonimos: ['bass', 'basso', 'baixo'] },
];

const VOZ_POR_SINONIMO = new Map<string, Tessitura>();
for (const v of VOZES) {
  VOZ_POR_SINONIMO.set(normalizar(v.rotulo), v.id);
  for (const s of v.sinonimos) VOZ_POR_SINONIMO.set(normalizar(s), v.id);
}

export function resolverVoz(grafia: string): Tessitura | undefined {
  return VOZ_POR_SINONIMO.get(normalizar(grafia));
}

// ---------------------------------------------------------------------------
// Formação vocal e papel dentro da obra
// ---------------------------------------------------------------------------

/**
 * Quantas vozes, e como elas se organizam.
 *
 * Cruza com a tessitura sem a substituir: uma peça SATB tem quatro tessituras
 * e formação de coro; um dueto de soprano e tenor tem duas tessituras e
 * formação de dueto. São perguntas diferentes, e quem procura repertório faz
 * as duas.
 */
export type FormacaoVocal =
  | 'SOLO'
  | 'DUETO'
  | 'TRIO'
  | 'QUARTETO'
  | 'CORO'
  | 'DUPLO_CORO';

/** Como a voz se sustenta: sozinha, acompanhada, ou sem acompanhamento algum. */
export type TexturaVocal = 'A_CAPPELLA' | 'COM_ACOMPANHAMENTO' | 'MONODICA';

// ---------------------------------------------------------------------------
// A procedência de um termo
// ---------------------------------------------------------------------------

/**
 * De onde veio um termo que o catálogo passou a usar.
 *
 * Vocabulário controlado só continua controlado se cada acréscimo tiver dono e
 * data. Sem isto, em seis meses ninguém sabe se `inst_bandolim` entrou por
 * decisão de curadoria ou porque uma importação o inventou.
 */
export interface OrigemDoTermo {
  termo: EntityId;
  decididoPor: string;
  decididoEm: ISOTimestamp;
  motivo: string;
}
