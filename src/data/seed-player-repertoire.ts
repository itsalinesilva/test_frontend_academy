/**
 * Repertório do player de referência.
 *
 * O QUE ENTRA AQUI
 * ----------------
 * Só melodia de **domínio público** — compositor morto há mais de setenta
 * anos, ou tradicional sem autor conhecido — e material teórico escrito pelo
 * próprio Conservatório (escalas, cadências, série harmônica, diapasão).
 *
 * Nenhuma fonte é citada, e nenhum arranjo de terceiro é reproduzido: o que
 * está aqui é a linha melódica, que é fato musical, transcrita em alturas e
 * durações para o sintetizador da plataforma.
 *
 * A duração de cada nota é em **tempos**, relativa ao andamento da faixa.
 * Altura 0 é silêncio.
 */

export type Periodo =
  | 'Referência'
  | 'Teoria'
  | 'Tradicional'
  | 'Barroco'
  | 'Clássico'
  | 'Romântico';

export interface FaixaDoPlayer {
  id: string;
  titulo: string;
  autor: string;
  periodo: Periodo;
  tonalidade: string;
  compasso: string;
  bpm: number;
  /** [frequência em Hz, duração em tempos]. Frequência 0 = pausa. */
  notas: [number, number][];
  /**
   * A mesma linha, ESCRITA: [nome da nota, duração em tempos]; `_` é pausa.
   *
   * A frequência não guarda a grafia — si♭ e lá♯ são o mesmo número. Uma
   * partitura desenhada a partir do som escreveria lá♯ numa peça em fá maior.
   */
  escrita: [string, number][];
  /** Duração total, em segundos, no andamento declarado. */
  duracaoSegundos: number;
}

// ---------------------------------------------------------------------------
// Quem pode entrar
// ---------------------------------------------------------------------------

/**
 * Por que cada autor deste acervo está em domínio público.
 *
 * O CABEÇALHO DESTE ARQUIVO NÃO BASTAVA
 * -------------------------------------
 * Ele diz, em prosa, que só entra domínio público. Prosa não é verificável, e
 * `checkPublicDomainRepertoire` existia para cobrar isso — mas procurava
 * registros na forma `{ id: '...' }`, e aqui as faixas são construídas pela
 * função `faixa(...)`. O verificador não enxergava **uma faixa sequer**:
 * passava verde por cegueira, sobre trinta e três faixas.
 *
 * Este rol é a mesma garantia, em forma que a máquina lê. Autor que não estiver
 * aqui não entra, e o pente fino recusa. A justificativa é obrigatória porque
 * uma lista de nomes sem motivo é uma lista que ninguém revisa.
 *
 * O critério é o da lei brasileira: obra em domínio público setenta anos após
 * 1º de janeiro do ano seguinte ao da morte do autor. Melodia tradicional sem
 * autor conhecido e material escrito pelo próprio Conservatório entram por
 * outra porta, e a justificativa diz qual.
 */
export const AUTORES_DO_ACERVO: Record<string, string> = {
  'Conservatório Muscicapa': 'material próprio, escrito para a plataforma',
  'Referência de afinação': 'fato físico: 440 Hz não é obra de ninguém',
  'Melodia tradicional': 'tradicional, sem autor conhecido',
  'Melodia tradicional inglesa': 'tradicional, sem autor conhecido',
  'Melodia tradicional francesa': 'tradicional, sem autor conhecido',
  'Cânone tradicional francês': 'tradicional, sem autor conhecido',
  'Johann Sebastian Bach': 'morto em 1750',
  'Antonio Vivaldi': 'morto em 1741',
  'Georg Friedrich Händel': 'morto em 1759',
  'Johann Pachelbel': 'morto em 1706',
  'Christian Petzold': 'morto em 1733',
  'Wolfgang Amadeus Mozart': 'morto em 1791',
  'Joseph Haydn': 'morto em 1809',
  'Ludwig van Beethoven': 'morto em 1827',
  'François-Joseph Gossec': 'morto em 1829',
  'Frédéric Chopin': 'morto em 1849',
  'Robert Schumann': 'morto em 1856',
  'Piotr Ilitch Tchaikovsky': 'morto em 1893',
  'Johannes Brahms': 'morto em 1897',
  'Edvard Grieg': 'morto em 1907',
};

// ---------------------------------------------------------------------------
// Conversão de nome de nota em frequência
// ---------------------------------------------------------------------------

const SEMITONS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

/** Temperamento igual com lá4 = 440 Hz. */
export function hz(nome: string): number {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(nome);
  if (!m) throw new Error(`nota inválida: ${nome}`);
  const midi = (Number(m[2]) + 1) * 12 + SEMITONS[m[1]];
  return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 100) / 100;
}

/** `'C4:1 E4:0.5 _:0.5'` → pares [nome, tempos], como a linha foi escrita. */
function grafia(linha: string): [string, number][] {
  return linha
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [nome, dur] = tok.split(':');
      return [nome, dur ? Number(dur) : 1] as [string, number];
    });
}

/** `'C4:1 E4:0.5 _:0.5'` → pares [Hz, tempos]. `_` é pausa. */
function seq(linha: string): [number, number][] {
  return linha
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [nome, dur] = tok.split(':');
      const d = dur ? Number(dur) : 1;
      return [nome === '_' ? 0 : hz(nome), d] as [number, number];
    });
}

function faixa(
  id: string,
  titulo: string,
  autor: string,
  periodo: Periodo,
  tonalidade: string,
  compasso: string,
  bpm: number,
  linha: string
): FaixaDoPlayer {
  const escrita = grafia(linha);
  const notas = seq(linha);
  const tempos = notas.reduce((a, [, d]) => a + d, 0);
  return {
    id,
    titulo,
    autor,
    periodo,
    tonalidade,
    compasso,
    bpm,
    notas,
    escrita,
    duracaoSegundos: Math.round((tempos * 60) / bpm),
  };
}

// ---------------------------------------------------------------------------
// Referência e teoria — material do próprio Conservatório
// ---------------------------------------------------------------------------

const REFERENCIA: FaixaDoPlayer[] = [
  faixa('ref-diapasao', 'Diapasão — lá 440 Hz', 'Referência de afinação', 'Referência',
    'Lá', '—', 60, 'A4:4'),

  faixa('ref-escala-maior', 'Escala maior — dó', 'Conservatório Muscicapa', 'Teoria',
    'Dó maior', '4/4', 96,
    'C4:1 D4:1 E4:1 F4:1 G4:1 A4:1 B4:1 C5:2 B4:1 A4:1 G4:1 F4:1 E4:1 D4:1 C4:2'),

  faixa('ref-escala-menor', 'Escala menor natural — lá', 'Conservatório Muscicapa', 'Teoria',
    'Lá menor', '4/4', 96,
    'A3:1 B3:1 C4:1 D4:1 E4:1 F4:1 G4:1 A4:2 G4:1 F4:1 E4:1 D4:1 C4:1 B3:1 A3:2'),

  faixa('ref-escala-harmonica', 'Escala menor harmônica — lá', 'Conservatório Muscicapa', 'Teoria',
    'Lá menor', '4/4', 96,
    'A3:1 B3:1 C4:1 D4:1 E4:1 F4:1 G#4:1 A4:2 G#4:1 F4:1 E4:1 D4:1 C4:1 B3:1 A3:2'),

  faixa('ref-cromatica', 'Escala cromática', 'Conservatório Muscicapa', 'Teoria',
    '—', '4/4', 120,
    'C4:0.5 C#4:0.5 D4:0.5 D#4:0.5 E4:0.5 F4:0.5 F#4:0.5 G4:0.5 G#4:0.5 A4:0.5 A#4:0.5 B4:0.5 C5:2'),

  faixa('ref-tons-inteiros', 'Escala de tons inteiros', 'Conservatório Muscicapa', 'Teoria',
    '—', '4/4', 100,
    'C4:1 D4:1 E4:1 F#4:1 G#4:1 A#4:1 C5:2'),

  faixa('ref-pentatonica', 'Escala pentatônica maior', 'Conservatório Muscicapa', 'Teoria',
    'Dó', '4/4', 100,
    'C4:1 D4:1 E4:1 G4:1 A4:1 C5:2 A4:1 G4:1 E4:1 D4:1 C4:2'),

  faixa('ref-serie-harmonica', 'Série harmônica sobre dó', 'Conservatório Muscicapa', 'Teoria',
    'Dó', '—', 66,
    'C2:1 C3:1 G3:1 C4:1 E4:1 G4:1 A#4:1 C5:2'),

  faixa('ref-cadencia-perfeita', 'Cadência perfeita — I IV V I', 'Conservatório Muscicapa', 'Teoria',
    'Dó maior', '4/4', 72,
    'C4:1 E4:1 G4:1 F4:1 A4:1 C5:1 G4:1 B4:1 D5:1 C4:2 E4:2 G4:2'),

  faixa('ref-cadencia-plagal', 'Cadência plagal — IV I', 'Conservatório Muscicapa', 'Teoria',
    'Dó maior', '4/4', 72,
    'F4:1 A4:1 C5:1 C4:2 E4:2 G4:2'),

  faixa('ref-tritono', 'Trítono e sua resolução', 'Conservatório Muscicapa', 'Teoria',
    'Dó maior', '4/4', 66,
    'F4:1.5 B4:1.5 E4:2 C5:2'),
];

// ---------------------------------------------------------------------------
// Tradicional — sem autor conhecido
// ---------------------------------------------------------------------------

const TRADICIONAL: FaixaDoPlayer[] = [
  faixa('trad-ah-vous-dirai', 'Ah! vous dirai-je, maman', 'Melodia tradicional francesa', 'Tradicional',
    'Dó maior', '4/4', 108,
    'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2'),

  faixa('trad-frere-jacques', 'Frère Jacques', 'Cânone tradicional francês', 'Tradicional',
    'Dó maior', '4/4', 112,
    'C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2'),

  faixa('trad-greensleeves', 'Greensleeves', 'Melodia tradicional inglesa', 'Tradicional',
    'Lá menor', '6/8', 96,
    'A4:1 C5:1.5 D5:0.5 E5:1 F5:0.5 E5:0.5 D5:1.5 B4:0.5 G4:1 A4:0.5 B4:0.5 ' +
    'C5:1.5 A4:0.5 A4:1 G#4:0.5 A4:0.5 B4:1 G#4:0.5 E4:1.5'),

  faixa('trad-london-bridge', 'London Bridge', 'Melodia tradicional inglesa', 'Tradicional',
    'Sol maior', '4/4', 116,
    'G5:0.75 A5:0.25 G5:0.5 F5:0.5 E5:0.5 F5:0.5 G5:1 D5:1 E5:1 F5:1 E5:1 F5:1 G5:2'),

  faixa('trad-old-macdonald', 'Old MacDonald', 'Melodia tradicional', 'Tradicional',
    'Sol maior', '4/4', 120,
    'G4:1 G4:1 G4:1 D4:1 E4:1 E4:1 D4:2 B4:1 B4:1 A4:1 A4:1 G4:3'),
];

// ---------------------------------------------------------------------------
// Barroco
// ---------------------------------------------------------------------------

const BARROCO: FaixaDoPlayer[] = [
  faixa('bar-bach-prelude', 'Prelúdio em dó maior', 'Johann Sebastian Bach', 'Barroco',
    'Dó maior', '4/4', 66,
    'C4:0.5 E4:0.5 G4:0.5 C5:0.5 E5:0.5 G4:0.5 C5:0.5 E5:0.5 ' +
    'C4:0.5 E4:0.5 G4:0.5 C5:0.5 E5:0.5 G4:0.5 C5:0.5 E5:0.5 ' +
    'C4:0.5 D4:0.5 A4:0.5 D5:0.5 F5:0.5 A4:0.5 D5:0.5 F5:0.5 ' +
    'B3:0.5 D4:0.5 G4:0.5 D5:0.5 F5:0.5 G4:0.5 D5:0.5 F5:0.5 ' +
    'C4:0.5 E4:0.5 G4:0.5 C5:0.5 E5:0.5 G4:0.5 C5:0.5 E5:2'),

  faixa('bar-minueto-sol', 'Minueto em sol maior', 'Christian Petzold', 'Barroco',
    'Sol maior', '3/4', 120,
    'D5:1 G4:0.5 A4:0.5 B4:0.5 C5:0.5 D5:1 G4:1 G4:1 ' +
    'E5:1 C5:0.5 D5:0.5 E5:0.5 F#5:0.5 G5:1 G4:1 G4:1 ' +
    'C5:1 D5:0.5 C5:0.5 B4:0.5 A4:0.5 B4:1 C5:0.5 B4:0.5 A4:0.5 G4:0.5 ' +
    'F#4:1 G4:0.5 A4:0.5 B4:0.5 G4:0.5 A4:2'),

  faixa('bar-jesu-alegria', 'Coral da cantata — jubilosa alegria', 'Johann Sebastian Bach', 'Barroco',
    'Sol maior', '9/8', 96,
    'G4:1 A4:1 B4:1 D5:1 C5:1 C5:1 E5:1 D5:1 D5:1 ' +
    'G5:1 F#5:1 G5:1 D5:1 B4:1 G4:1 A4:1 B4:1 G4:2'),

  faixa('bar-canon-pachelbel', 'Cânone — baixo obstinado', 'Johann Pachelbel', 'Barroco',
    'Ré maior', '4/4', 60,
    'D3:2 A3:2 B3:2 F#3:2 G3:2 D3:2 G3:2 A3:2 ' +
    'D3:2 A3:2 B3:2 F#3:2 G3:2 D3:2 G3:2 A3:2'),

  faixa('bar-vivaldi-primavera', 'A primavera — tema', 'Antonio Vivaldi', 'Barroco',
    'Mi maior', '4/4', 104,
    'E5:0.5 G#5:0.5 G#5:0.5 G#5:0.5 F#5:0.5 E5:1 B4:0.5 ' +
    'E5:0.5 G#5:0.5 G#5:0.5 G#5:0.5 F#5:0.5 E5:1 B4:0.5 ' +
    'B4:0.5 A4:0.5 B4:0.5 C#5:0.5 B4:0.5 A4:0.5 G#4:1'),

  faixa('bar-handel-alegria', 'Marcha — tema jubiloso', 'Georg Friedrich Händel', 'Barroco',
    'Ré maior', '4/4', 100,
    'D5:1 D5:0.5 E5:0.5 F#5:1 F#5:1 E5:0.5 D5:0.5 C#5:1 B4:1 A4:2'),
];

// ---------------------------------------------------------------------------
// Clássico
// ---------------------------------------------------------------------------

const CLASSICO: FaixaDoPlayer[] = [
  faixa('cla-mozart-k545', 'Sonata em dó maior — tema', 'Wolfgang Amadeus Mozart', 'Clássico',
    'Dó maior', '4/4', 126,
    'C5:1 E5:1 G5:1 B4:0.5 C5:0.5 D5:1 C5:1 _:0.5 ' +
    'D5:1 F5:1 A5:1 G5:0.5 A5:0.5 B5:1 C6:1'),

  faixa('cla-mozart-serenata', 'Pequena serenata noturna — abertura', 'Wolfgang Amadeus Mozart', 'Clássico',
    'Sol maior', '4/4', 132,
    'G4:0.75 D4:0.25 G4:0.75 D4:0.25 G4:0.5 D4:0.5 G4:0.5 B4:0.5 D5:2 ' +
    'D5:0.75 A4:0.25 D4:0.75 A4:0.25 D4:0.5 A4:0.5 D4:0.5 F#4:0.5 A4:2'),

  faixa('cla-beethoven-alegria', 'Hino à alegria', 'Ludwig van Beethoven', 'Clássico',
    'Ré maior', '4/4', 112,
    'E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 ' +
    'C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:0.5 D4:2'),

  faixa('cla-beethoven-bagatela', 'Bagatela em lá menor', 'Ludwig van Beethoven', 'Clássico',
    'Lá menor', '3/8', 132,
    'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1 ' +
    'C4:0.5 E4:0.5 A4:0.5 B4:1 E4:0.5 G#4:0.5 B4:0.5 C5:1'),

  faixa('cla-haydn-surpresa', 'Sinfonia da surpresa — tema', 'Joseph Haydn', 'Clássico',
    'Dó maior', '2/4', 104,
    'C4:0.5 C4:0.5 E4:0.5 E4:0.5 G4:0.5 G4:0.5 E4:1 ' +
    'F4:0.5 F4:0.5 D4:0.5 D4:0.5 B3:0.5 B3:0.5 G3:1'),

  faixa('cla-gossec-gavota', 'Gavota', 'François-Joseph Gossec', 'Clássico',
    'Ré maior', '4/4', 116,
    'D5:0.5 D5:0.5 D5:1 A4:0.5 B4:0.5 C#5:0.5 D5:0.5 ' +
    'E5:0.5 F#5:0.5 G5:0.5 E5:0.5 D5:1 _:0.5'),
];

// ---------------------------------------------------------------------------
// Romântico
// ---------------------------------------------------------------------------

const ROMANTICO: FaixaDoPlayer[] = [
  faixa('rom-brahms-cancao-de-ninar', 'Canção de ninar', 'Johannes Brahms', 'Romântico',
    'Dó maior', '3/4', 96,
    'E4:0.5 E4:0.5 G4:1 E4:0.5 E4:0.5 G4:1 ' +
    'E4:0.5 G4:0.5 C5:1 B4:0.5 A4:0.5 A4:0.5 G4:1.5'),

  faixa('rom-grieg-manha', 'Manhã', 'Edvard Grieg', 'Romântico',
    'Mi maior', '6/8', 84,
    'E5:0.5 C#5:0.5 B4:0.5 A4:0.5 B4:0.5 C#5:0.5 ' +
    'E5:0.5 C#5:0.5 B4:0.5 A4:0.5 B4:0.5 C#5:0.5 E5:1 C#5:1'),

  faixa('rom-schumann-melodia', 'Melodia', 'Robert Schumann', 'Romântico',
    'Dó maior', '4/4', 100,
    'C5:1 B4:0.5 C5:0.5 D5:1 E5:1 F5:1 E5:0.5 D5:0.5 C5:2'),

  faixa('rom-tchaikovsky-valsa', 'Valsa — tema', 'Piotr Ilitch Tchaikovsky', 'Romântico',
    'Ré maior', '3/4', 152,
    'A4:1 D5:1 F#5:1 A5:2 G5:1 F#5:1 E5:1 D5:1 E5:3'),

  faixa('rom-chopin-preludio', 'Prelúdio em lá maior', 'Frédéric Chopin', 'Romântico',
    'Lá maior', '3/4', 76,
    'C#5:1 C#5:1 B4:0.5 C#5:0.5 D5:1 C#5:2 ' +
    'E5:1 E5:1 D5:0.5 C#5:0.5 B4:1 A4:2'),
];

// ---------------------------------------------------------------------------

export const REPERTORIO_DO_PLAYER: FaixaDoPlayer[] = [
  ...REFERENCIA,
  ...TRADICIONAL,
  ...BARROCO,
  ...CLASSICO,
  ...ROMANTICO,
];

export const PERIODOS: Periodo[] = [
  'Referência',
  'Teoria',
  'Tradicional',
  'Barroco',
  'Clássico',
  'Romântico',
];
