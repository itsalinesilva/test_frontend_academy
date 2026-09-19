import {
  CHORD_NAME_PT,
  CHORD_SHAPES,
  ChordQuality,
  NATURAL_NAME_PT,
  NATURAL_NOTES,
  NOTE_VALUES,
  SCALE_NAME_PT,
  SCALE_STEPS,
  ScaleMode,
  SIMPLE_INTERVALS,
  frequencyOf,
  keySignatureOf,
  pitchClassOf,
} from './pitch';
import { Dimension } from './music-grammar';
import { ExerciseTag, ExerciseType, MusicExercise } from './music-exercise';

/**
 * O gerador de exercícios.
 *
 * O percurso tem 21 nós e cinco níveis. Escrever à mão cada exercício de cada
 * nó em cada nível seria escrever milhares — e mantê-los coerentes entre si,
 * para sempre. Por isso eles são **derivados** das primitivas de `pitch.ts`,
 * que são as mesmas que o motor de teoria usa para analisar.
 *
 * O QUE ESTE GERADOR NÃO FAZ
 * --------------------------
 * Ele **não inventa exercício que a tela não sabe mostrar**. Hoje a tela
 * responde por escolha entre alternativas; os níveis que pedem escrever na
 * pauta, tocar ou cantar devolvem lista vazia, e o quadro da seção diz que o
 * nível ainda não abriu.
 *
 * Gerar um exercício de "toque esta nota" para uma tela que só tem botões
 * seria produzir um beco sem saída — a pessoa chegaria lá e não teria como
 * responder. Vazio e declarado é melhor que cheio e quebrado.
 */

export enum Level {
  /** Apontar entre alternativas, com o vocabulário no enunciado. */
  RECOGNIZE = 0,
  /** Produzir a resposta, com mais distratores e sem apoio no enunciado. */
  NAME = 1,
  /** Usar em contexto, com mais de um passo. */
  APPLY = 2,
  /** Sem notação: só som. */
  EAR = 3,
  /** Tocar ou cantar, medido pelo microfone. */
  PERFORM = 4,
}

export const LEVEL_NAME: Record<Level, string> = {
  [Level.RECOGNIZE]: 'Reconhecer',
  [Level.NAME]: 'Nomear',
  [Level.APPLY]: 'Aplicar',
  [Level.EAR]: 'Ouvir',
  [Level.PERFORM]: 'Executar',
};

/**
 * Níveis que a tela atual sabe apresentar.
 *
 * `APPLY` precisa de pauta editável e `PERFORM` precisa de microfone medido —
 * os dois estão no `CLAUDE_TODO.md`. Enquanto não existirem, declarar que o
 * nível está fechado é a única resposta honesta.
 */
export const RENDERABLE_LEVELS: readonly Level[] = [Level.RECOGNIZE, Level.NAME, Level.EAR];

export function isRenderable(level: Level): boolean {
  return RENDERABLE_LEVELS.includes(level);
}

/** As dimensões para as quais existe gerador. As outras ainda não têm. */
export const GENERATED_DIMENSIONS: readonly Dimension[] = [
  Dimension.NOTE,
  Dimension.INTERVAL,
  Dimension.NOTE_VALUE,
  Dimension.SCALE,
  Dimension.CHORD,
  Dimension.KEY_SIGNATURE,
];

export function hasGenerator(dimension: Dimension): boolean {
  return GENERATED_DIMENSIONS.includes(dimension);
}

// ---------------------------------------------------------------------------
// Sorteio determinístico
// ---------------------------------------------------------------------------

/**
 * Mistura de Knuth antes do gerador linear.
 *
 * Sementes vizinhas — e elas são vizinhas, porque a semente é o índice do
 * exercício — produzem primeiros valores quase iguais num gerador linear
 * simples. Sem a mistura, a lição inteira sairia com a mesma tônica. Isto já
 * aconteceu aqui, e foi um teste que pegou.
 */
function mix(seed: number): number {
  return Math.imul(seed, 2654435761) >>> 0;
}

class Draw {
  private state: number;

  constructor(seed: number) {
    this.state = mix(seed) || 1;
  }

  next(): number {
    this.state = (Math.imul(this.state, 1103515245) + 12345) >>> 0;
    return this.state;
  }

  pick<T>(list: readonly T[]): T {
    return list[this.next() % list.length];
  }

  /** `quantos` itens distintos, sem reposição. */
  sample<T>(list: readonly T[], quantos: number): T[] {
    const pool = [...list];
    const out: T[] = [];
    while (out.length < quantos && pool.length > 0) {
      out.push(pool.splice(this.next() % pool.length, 1)[0]);
    }
    return out;
  }
}

/** Quantas alternativas o nível oferece. Mais distratores é mais difícil. */
function choiceCount(level: Level): number {
  return level === Level.RECOGNIZE ? 3 : 4;
}

const OCTAVE = 4;
const withOctave = (name: string) => `${name}${OCTAVE}`;

interface Built {
  type: ExerciseType;
  prompt: string;
  labels: string[];
  correctLabel: string;
  explanation: string;
  /** Frequências que o exercício toca, quando o nível é de ouvido. */
  audioHz?: number[];
  audioMode?: 'SEQUENCE' | 'CHORD';
  /** Frequências de cada alternativa, para que ela soe ao ser tocada. */
  choiceHz?: Record<string, number[]>;
  tonicHz?: number;
}

// ---------------------------------------------------------------------------
// Um construtor por dimensão
// ---------------------------------------------------------------------------

function buildNote(level: Level, draw: Draw): Built {
  const notes = draw.sample(NATURAL_NOTES, choiceCount(level));
  const correct = notes[0];
  const hz = (n: string) => [frequencyOf(withOctave(n))!];

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? 'Ouça e diga que nota é'
        : `Que nota está uma ${NATURAL_NAME_PT[correct]} — qual destas é?`,
    labels: notes.map((n) => NATURAL_NAME_PT[n]),
    correctLabel: NATURAL_NAME_PT[correct],
    explanation: `É ${NATURAL_NAME_PT[correct]}, classe de altura ${pitchClassOf(correct)}.`,
    audioHz: level === Level.EAR ? hz(correct) : undefined,
    audioMode: 'SEQUENCE',
    choiceHz: Object.fromEntries(notes.map((n) => [NATURAL_NAME_PT[n], hz(n)])),
    tonicHz: frequencyOf(withOctave(correct)) ?? undefined,
  };
}

function buildInterval(level: Level, draw: Draw): Built {
  const root = draw.pick(NATURAL_NOTES);
  const rootHz = frequencyOf(withOctave(root))!;
  const semitones = draw.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const correct = SIMPLE_INTERVALS[semitones];

  /**
   * Os distratores são **vizinhos em semitom**, e não intervalos quaisquer.
   * Distinguir uma quinta de uma segunda não treina ninguém; distinguir a
   * quinta justa do trítono é exatamente o que o ouvido precisa aprender.
   */
  const neighbours = [semitones - 2, semitones - 1, semitones + 1, semitones + 2]
    .filter((s) => s >= 0 && s <= 12)
    .map((s) => SIMPLE_INTERVALS[s]);

  const wrong = draw.sample(neighbours, choiceCount(level) - 1);
  const all = [correct, ...wrong];

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? 'Ouça as duas notas e diga que intervalo é'
        : `De ${NATURAL_NAME_PT[root]}, subindo ${semitones} ${semitones === 1 ? 'semitom' : 'semitons'} — que intervalo é?`,
    labels: all.map((i) => i.name),
    correctLabel: correct.name,
    explanation: `${semitones} ${semitones === 1 ? 'semitom' : 'semitons'} formam ${correct.name}. ${
      correct.isConsonant ? 'É consonante.' : 'É dissonante.'
    }`,
    audioHz: [rootHz, rootHz * Math.pow(2, semitones / 12)],
    audioMode: 'SEQUENCE',
    choiceHz: Object.fromEntries(
      all.map((i) => {
        const st = Number(
          Object.keys(SIMPLE_INTERVALS).find((k) => SIMPLE_INTERVALS[Number(k)] === i)
        );
        return [i.name, [rootHz, rootHz * Math.pow(2, st / 12)]];
      })
    ),
    tonicHz: rootHz,
  };
}

function buildNoteValue(level: Level, draw: Draw): Built {
  const values = draw.sample(NOTE_VALUES, choiceCount(level));
  const correct = values[0];
  const emSeminimas = correct.fraction * 4;

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `Que figura vale ${formatFraction(emSeminimas)} ${emSeminimas === 1 ? 'semínima' : 'semínimas'}?`,
    labels: values.map((v) => v.name),
    correctLabel: correct.name,
    explanation: `A ${correct.name} vale ${formatFraction(correct.fraction)} da semibreve.`,
  };
}

function formatFraction(f: number): string {
  if (Number.isInteger(f)) return String(f);
  const denominador = Math.round(1 / f);
  return `1/${denominador}`;
}

function buildScale(level: Level, draw: Draw): Built {
  const tonic = draw.pick(NATURAL_NOTES);
  const tonicHz = frequencyOf(withOctave(tonic))!;
  const modes = Object.keys(SCALE_STEPS) as ScaleMode[];
  const correct = draw.pick(modes);
  const others = modes.filter((m) => m !== correct);
  const all = [correct, ...draw.sample(others, Math.min(choiceCount(level) - 1, others.length))];

  const hzOf = (m: ScaleMode) => SCALE_STEPS[m].map((s) => tonicHz * Math.pow(2, s / 12));

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? `Ouça a escala sobre ${NATURAL_NAME_PT[tonic]} e diga qual é`
        : `Que escala tem os graus ${SCALE_STEPS[correct].join(', ')} em semitons?`,
    labels: all.map((m) => `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[m]}`),
    correctLabel: `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[correct]}`,
    explanation: `A escala ${SCALE_NAME_PT[correct]} tem a sequência ${SCALE_STEPS[correct].join('-')} em semitons a partir da tônica.`,
    audioHz: hzOf(correct),
    audioMode: 'SEQUENCE',
    choiceHz: Object.fromEntries(
      all.map((m) => [`${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[m]}`, hzOf(m)])
    ),
    tonicHz,
  };
}

function buildChord(level: Level, draw: Draw): Built {
  const root = draw.pick(NATURAL_NOTES);
  const rootHz = frequencyOf(withOctave(root))!;
  const qualities = Object.keys(CHORD_SHAPES) as ChordQuality[];
  const correct = draw.pick(qualities);
  const others = qualities.filter((q) => q !== correct);
  const all = [correct, ...draw.sample(others, choiceCount(level) - 1)];

  const hzOf = (q: ChordQuality) => CHORD_SHAPES[q].map((s) => rootHz * Math.pow(2, s / 12));

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? `Ouça o acorde sobre ${NATURAL_NAME_PT[root]} e diga qual é`
        : `Que acorde tem os intervalos ${CHORD_SHAPES[correct].join(', ')} em semitons?`,
    labels: all.map((q) => `${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[q]}`),
    correctLabel: `${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[correct]}`,
    explanation: `O acorde ${CHORD_NAME_PT[correct]} empilha ${CHORD_SHAPES[correct].join('-')} semitons sobre a fundamental.`,
    audioHz: hzOf(correct),
    audioMode: 'CHORD',
    choiceHz: Object.fromEntries(
      all.map((q) => [`${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[q]}`, hzOf(q)])
    ),
    tonicHz: rootHz,
  };
}

/**
 * Armadura **nunca** é de ouvido.
 *
 * É convenção de escrita: não soa. "Ouça e diga quantos sustenidos há" é
 * pergunta sem resposta — dois tons diferentes podem soar iguais e ter
 * armaduras distintas. A matriz de `music-grammar.ts` já barra a combinação;
 * aqui o construtor simplesmente não produz áudio.
 */
function buildKeySignature(level: Level, draw: Draw): Built {
  const tonic = draw.pick(NATURAL_NOTES);
  const mode: ScaleMode = draw.pick(['MAJOR', 'NATURAL_MINOR']);
  const correct = keySignatureOf(tonic, mode);

  const candidates = [correct - 2, correct - 1, correct, correct + 1, correct + 2].filter(
    (n) => n >= -7 && n <= 7
  );
  const wrong = draw.sample(
    candidates.filter((n) => n !== correct),
    choiceCount(level) - 1
  );
  const all = [correct, ...wrong];

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `Quantas alterações tem a armadura de ${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[mode]}?`,
    labels: all.map(describeKeySignature),
    correctLabel: describeKeySignature(correct),
    explanation: `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[mode]} tem ${describeKeySignature(correct)}.`,
  };
}

function describeKeySignature(n: number): string {
  if (n === 0) return 'nenhuma alteração';
  const quantos = Math.abs(n);
  const type = n > 0 ? 'sustenido' : 'bemol';
  return `${quantos} ${type}${quantos > 1 ? 's' : ''}`;
}

const BUILDERS: Partial<Record<Dimension, (level: Level, draw: Draw) => Built>> = {
  [Dimension.NOTE]: buildNote,
  [Dimension.INTERVAL]: buildInterval,
  [Dimension.NOTE_VALUE]: buildNoteValue,
  [Dimension.SCALE]: buildScale,
  [Dimension.CHORD]: buildChord,
  [Dimension.KEY_SIGNATURE]: buildKeySignature,
};

/**
 * Dimensões que a armadura de escrita impede de perguntar de ouvido.
 *
 * Não é limitação nossa: é que elas não soam.
 */
const SILENT_DIMENSIONS: readonly Dimension[] = [Dimension.KEY_SIGNATURE, Dimension.NOTE_VALUE];

export function supportsLevel(dimension: Dimension, level: Level): boolean {
  if (!hasGenerator(dimension) || !isRenderable(level)) return false;
  if (level === Level.EAR && SILENT_DIMENSIONS.includes(dimension)) return false;
  return true;
}

/**
 * Um exercício. `null` quando aquela dimensão não tem gerador, quando o nível
 * ainda não é apresentável, ou quando a combinação não faz sentido musical.
 */
export function generateExercise(
  dimension: Dimension,
  level: Level,
  seed: number,
  tag: ExerciseTag = 'PRACTICE'
): MusicExercise | null {
  if (!supportsLevel(dimension, level)) return null;

  const draw = new Draw(seed);
  const built = BUILDERS[dimension]!(level, draw);

  const choices = built.labels.map((label, i) => ({
    id: `c${i}`,
    label,
    frequenciesHz: built.choiceHz?.[label],
  }));
  const correctId = choices.find((c) => c.label === built.correctLabel)!.id;

  return {
    id: `gen_${dimension}_${level}_${seed}`,
    type: built.type,
    tag,
    band: level <= Level.NAME ? 'FOUNDATION' : 'APPLICATION',
    prompt: built.prompt,
    audio:
      level === Level.EAR && built.audioHz
        ? { frequenciesHz: built.audioHz, mode: built.audioMode ?? 'SEQUENCE' }
        : undefined,
    choices,
    correctIds: [correctId],
    explanation: built.explanation,
    tonicHz: built.tonicHz,
  };
}

/**
 * Uma lição inteira.
 *
 * As sementes são consecutivas, e por isso a mistura de Knuth importa: sem
 * ela, os dez exercícios sairiam com a mesma tônica.
 */
export function generateLesson(
  dimension: Dimension,
  level: Level,
  seed: number,
  count: number
): MusicExercise[] {
  const out: MusicExercise[] = [];
  for (let i = 0; i < count; i++) {
    const e = generateExercise(dimension, level, seed + i);
    if (e) out.push(e);
  }
  return out;
}
