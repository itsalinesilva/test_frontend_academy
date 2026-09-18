/**
 * GRAMÁTICA MUSICAL — o que dá para perguntar, e de quantas formas.
 *
 * POR QUE UMA GRAMÁTICA, E NÃO UMA LISTA
 * --------------------------------------
 * A referência tem sete formatos fixos de exercício. Sete é pouco para
 * música, e a razão é estrutural: numa língua, "qual o significado de
 * *milk*?" é quase a única pergunta possível sobre uma palavra. Em música,
 * sobre **uma única nota** cabem pelo menos seis perguntas diferentes:
 *
 *   qual é o nome dela?          · onde ela fica na pauta?
 *   em que clave está escrita?   · quanto ela dura?
 *   como ela soa?                · onde ela fica no braço do instrumento?
 *
 * E cada uma pode ser feita **mostrando** de seis jeitos e **respondida** de
 * oito. Enumerar isso à mão daria centenas de casos e nenhum deles
 * reaproveitável.
 *
 * Por isso aqui há uma gramática de três eixos:
 *
 *   DIMENSÃO   o que se pergunta        (intervalo, armadura, cadência…)
 *   ESTÍMULO   como a pergunta chega    (pauta, som, cifra, braço…)
 *   RESPOSTA   como se responde         (escolher, tocar, cantar, escrever…)
 *
 * O produto dos três é o repertório de exercícios. Nem toda combinação faz
 * sentido — `podeCombinar` é quem decide —, e é justamente a matriz de
 * validade que carrega o conhecimento pedagógico.
 *
 * ANCORAGEM
 * ---------
 * Toda dimensão aponta para os capítulos do curso de Teoria que a ensinam.
 * Não há dimensão aqui que o Conservatório não ensine, e é isso que impede
 * este catálogo de virar uma lista de ideias soltas.
 */

// ---------------------------------------------------------------------------
// Eixo 1 — o que se pergunta
// ---------------------------------------------------------------------------

export enum Dimension {
  /** Nome, altura e posição da nota. Cap. 2, 38, 39 */
  NOTE = 'NOTE',
  /** Sol, fá e dó — a mesma posição vira nota diferente. Cap. 3, 9 */
  CLEF = 'CLEF',
  /** Figuras e o que valem. Cap. 4, 6, 7 */
  NOTE_VALUE = 'NOTE_VALUE',
  /** Tom, semitom e alterações. Cap. 5, 14 */
  ACCIDENTAL = 'ACCIDENTAL',
  /** Número, qualidade, inversão, consonância. Cap. 10–13, 17 */
  INTERVAL = 'INTERVAL',
  /** Maiores, menores, modos, artificiais, exóticas. Cap. 15, 18, 21, 23, 26, 31, 35 */
  SCALE = 'SCALE',
  /** Quantos acidentes, e de que tom. Cap. 18, 21, 24 */
  KEY_SIGNATURE = 'KEY_SIGNATURE',
  /** Fórmula, acento métrico, subdivisão. Cap. 19, 20, 22, 28 */
  TIME_SIGNATURE = 'TIME_SIGNATURE',
  /** Síncope, contratempo, quiálteras. Cap. 22, 32 */
  RHYTHM = 'RHYTHM',
  /** Largo a Presto, e o que isso significa em batidas. Cap. 30 */
  TEMPO = 'TEMPO',
  /** De pianíssimo a fortíssimo, e os reguladores. Cap. 33 */
  DYNAMICS = 'DYNAMICS',
  /** Legato, staccato, tenuto, e os termos de caráter. Cap. 8, 34, 37 */
  EXPRESSION = 'EXPRESSION',
  /** Tríades, tétrades, inversões, cifragem. Cap. 40–43, 50–55 */
  CHORD = 'CHORD',
  /** Tônica, subdominante, dominante. Cap. 40, 56 */
  HARMONIC_FUNCTION = 'HARMONIC_FUNCTION',
  /** Autêntica, plagal, deceptiva, suspensiva. Cap. 49, 56 */
  CADENCE = 'CADENCE',
  /** Movimento das vozes: direto, contrário, oblíquo, paralelo. Cap. 49 */
  VOICE_LEADING = 'VOICE_LEADING',
  /** Apojatura, mordente, grupeto, trinado, arpejo. Cap. 44–48 */
  ORNAMENT = 'ORNAMENT',
  /** Tons vizinhos e a passagem entre eles. Cap. 24, 25 */
  MODULATION = 'MODULATION',
  /** Transporte e instrumentos transpositores. Cap. 27, 29, 57 */
  TRANSPOSITION = 'TRANSPOSITION',
  /** Abreviaturas e notação moderna. Cap. 36, 58 */
  SPECIAL_NOTATION = 'SPECIAL_NOTATION',
  /** Série harmônica e as propriedades do som. Cap. 1, 16 */
  ACOUSTICS = 'ACOUSTICS',
}

export interface DimensionDescription {
  nome: string;
  /** O que se pergunta, em uma linha. */
  pergunta: string;
  /** Capítulos do curso de Teoria que a ensinam. */
  capitulos: number[];
  /** Ordem pedagógica: o que vem antes. */
  requer: Dimension[];
}

export const DIMENSIONS: Record<Dimension, DimensionDescription> = {
  [Dimension.NOTE]: {
    nome: 'Nota',
    pergunta: 'Que nota é, e onde ela fica na pauta?',
    capitulos: [2, 38, 39],
    requer: [],
  },
  [Dimension.CLEF]: {
    nome: 'Clave',
    pergunta: 'Em que clave está escrita, e que nota isso torna a mesma posição?',
    capitulos: [3, 9],
    requer: [Dimension.NOTE],
  },
  [Dimension.NOTE_VALUE]: {
    nome: 'Valor',
    pergunta: 'Que figura é, e quanto ela dura?',
    capitulos: [4, 6, 7],
    requer: [],
  },
  [Dimension.ACCIDENTAL]: {
    nome: 'Alteração',
    pergunta: 'Sustenido, bemol ou bequadro — e que nota resulta?',
    capitulos: [5, 14],
    requer: [Dimension.NOTE],
  },
  [Dimension.INTERVAL]: {
    nome: 'Interval',
    pergunta: 'Que distância há entre as duas notas, em número e qualidade?',
    capitulos: [10, 11, 12, 13, 17],
    requer: [Dimension.NOTE, Dimension.ACCIDENTAL],
  },
  [Dimension.SCALE]: {
    nome: 'Escala',
    pergunta: 'Que escala é, e qual a fórmula de tons e semitons?',
    capitulos: [15, 18, 21, 23, 26, 31, 35],
    requer: [Dimension.INTERVAL],
  },
  [Dimension.KEY_SIGNATURE]: {
    nome: 'Armadura',
    pergunta: 'Quantos acidentes, e de que tonalidade?',
    capitulos: [18, 21, 24],
    requer: [Dimension.SCALE],
  },
  [Dimension.TIME_SIGNATURE]: {
    nome: 'Compasso',
    pergunta: 'Que fórmula é, e onde caem os tempos fortes?',
    capitulos: [19, 20, 22, 28],
    requer: [Dimension.NOTE_VALUE],
  },
  [Dimension.RHYTHM]: {
    nome: 'Ritmo',
    pergunta: 'Que célula é — e é síncope, contratempo ou quiáltera?',
    capitulos: [22, 32],
    requer: [Dimension.TIME_SIGNATURE],
  },
  [Dimension.TEMPO]: {
    nome: 'Andamento',
    pergunta: 'Que andamento é, e a quantas batidas por minuto corresponde?',
    capitulos: [30],
    requer: [Dimension.TIME_SIGNATURE],
  },
  [Dimension.DYNAMICS]: {
    nome: 'Dinâmica',
    pergunta: 'Que intensidade está indicada?',
    capitulos: [33],
    requer: [],
  },
  [Dimension.EXPRESSION]: {
    nome: 'Expressão',
    pergunta: 'Que articulação ou caráter está indicado?',
    capitulos: [8, 34, 37],
    requer: [],
  },
  [Dimension.CHORD]: {
    nome: 'Acorde',
    pergunta: 'Que acorde é, em que estado, e qual a cifra?',
    capitulos: [40, 41, 42, 43, 50, 51, 52, 53, 54, 55],
    requer: [Dimension.INTERVAL, Dimension.SCALE],
  },
  [Dimension.HARMONIC_FUNCTION]: {
    nome: 'Função harmônica',
    pergunta: 'Que função o acorde exerce no tom?',
    capitulos: [40, 56],
    requer: [Dimension.CHORD, Dimension.KEY_SIGNATURE],
  },
  [Dimension.CADENCE]: {
    nome: 'Cadência',
    pergunta: 'Que cadência encerra o trecho?',
    capitulos: [49, 56],
    requer: [Dimension.HARMONIC_FUNCTION],
  },
  [Dimension.VOICE_LEADING]: {
    nome: 'Condução de vozes',
    pergunta: 'Como as vozes se movem entre si?',
    capitulos: [49],
    requer: [Dimension.INTERVAL, Dimension.CHORD],
  },
  [Dimension.ORNAMENT]: {
    nome: 'Ornamento',
    pergunta: 'Que ornamento é, e como se executa?',
    capitulos: [44, 45, 46, 47, 48],
    requer: [Dimension.NOTE, Dimension.NOTE_VALUE],
  },
  [Dimension.MODULATION]: {
    nome: 'Modulação',
    pergunta: 'Para que tom o trecho modula, e por onde?',
    capitulos: [24, 25],
    requer: [Dimension.KEY_SIGNATURE, Dimension.HARMONIC_FUNCTION],
  },
  [Dimension.TRANSPOSITION]: {
    nome: 'Transposição',
    pergunta: 'Como fica o trecho em outro tom, ou para instrumento transpositor?',
    capitulos: [27, 29, 57],
    requer: [Dimension.INTERVAL, Dimension.KEY_SIGNATURE],
  },
  [Dimension.SPECIAL_NOTATION]: {
    nome: 'Notação especial',
    pergunta: 'O que este sinal indica?',
    capitulos: [36, 58],
    requer: [Dimension.NOTE, Dimension.NOTE_VALUE],
  },
  [Dimension.ACOUSTICS]: {
    nome: 'Acústica',
    pergunta: 'Que propriedade do som está em jogo?',
    capitulos: [1, 16],
    requer: [],
  },
};

// ---------------------------------------------------------------------------
// Eixo 2 — como a pergunta chega
// ---------------------------------------------------------------------------

export enum Stimulus {
  /** Desenhada na pauta, com clave e armadura. */
  NOTATION = 'NOTATION',
  /** Escrito por extenso: "terça maior", "Allegro". */
  NAME = 'NAME',
  /** Cifra: `Cm7`, `V7`, `6/4`. */
  CHORD_SYMBOL = 'CHORD_SYMBOL',
  /** Soa, e só. É o que exige ouvido. */
  AUDIO = 'AUDIO',
  /** Ciclo de quintas, régua de intervalos, teclado. */
  DIAGRAM = 'DIAGRAM',
  /** Posição marcada no braço do instrumento. */
  FINGERBOARD = 'FINGERBOARD',
}

export const STIMULUS_NAME: Record<Stimulus, string> = {
  [Stimulus.NOTATION]: 'Na pauta',
  [Stimulus.NAME]: 'Pelo nome',
  [Stimulus.CHORD_SYMBOL]: 'Pela cifra',
  [Stimulus.AUDIO]: 'De ouvido',
  [Stimulus.DIAGRAM]: 'No diagrama',
  [Stimulus.FINGERBOARD]: 'No braço',
};

// ---------------------------------------------------------------------------
// Eixo 3 — como se responde
// ---------------------------------------------------------------------------

export enum ResponseMode {
  /** Alternativas. O mais barato, e o que só prova reconhecimento. */
  CHOOSE = 'CHOOSE',
  /** Montar com peças de um banco. */
  ASSEMBLE = 'ASSEMBLE',
  /** Colocar a nota na linha certa da pauta. */
  WRITE_ON_STAFF = 'WRITE_ON_STAFF',
  /** Parear duas colunas. */
  MATCH = 'MATCH',
  /** Pôr em ordem: do mais grave ao mais agudo, do mais lento ao mais rápido. */
  ORDER = 'ORDER',
  /** Apontar no diagrama, no teclado ou no braço. */
  POINT = 'POINT',
  /** Tocar no instrumento. O microfone confere. */
  PLAY = 'PLAY',
  /** Cantar. O afinador mede o desvio em cents. */
  SING = 'SING',
  /** Executar a célula no andamento. Mede-se o desvio em milissegundos. */
  PERFORM_RHYTHM = 'PERFORM_RHYTHM',
}

export const RESPONSE_NAME: Record<ResponseMode, string> = {
  [ResponseMode.CHOOSE]: 'Escolher',
  [ResponseMode.ASSEMBLE]: 'Montar',
  [ResponseMode.WRITE_ON_STAFF]: 'Escrever na pauta',
  [ResponseMode.MATCH]: 'Parear',
  [ResponseMode.ORDER]: 'Ordenar',
  [ResponseMode.POINT]: 'Apontar',
  [ResponseMode.PLAY]: 'Tocar',
  [ResponseMode.SING]: 'Cantar',
  [ResponseMode.PERFORM_RHYTHM]: 'Executar o ritmo',
};

/** Respostas que dependem de captura de áudio. */
export const RESPONSES_WITH_MICROPHONE: readonly ResponseMode[] = [
  ResponseMode.PLAY,
  ResponseMode.SING,
  ResponseMode.PERFORM_RHYTHM,
] as const;

export function requiresMicrophone(r: ResponseMode): boolean {
  return RESPONSES_WITH_MICROPHONE.includes(r);
}

// ---------------------------------------------------------------------------
// A matriz de validade — onde mora o conhecimento pedagógico
// ---------------------------------------------------------------------------

/**
 * Estímulos que fazem sentido para cada dimensão.
 *
 * Nem toda combinação é legítima, e a restrição não é técnica — é
 * pedagógica. Uma armadura de clave **não soa**: ela é uma convenção de
 * escrita, e "ouça e diga quantos sustenidos há" é uma pergunta sem
 * resposta. Já um intervalo soa, se escreve, se cifra e se aponta no braço —
 * e pode ser perguntado das quatro formas.
 */
export const VALID_STIMULI: Record<Dimension, Stimulus[]> = {
  [Dimension.NOTE]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO, Stimulus.DIAGRAM, Stimulus.FINGERBOARD],
  [Dimension.CLEF]: [Stimulus.NOTATION, Stimulus.NAME],
  [Dimension.NOTE_VALUE]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.ACCIDENTAL]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO, Stimulus.FINGERBOARD],
  [Dimension.INTERVAL]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO, Stimulus.DIAGRAM, Stimulus.FINGERBOARD],
  [Dimension.SCALE]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO, Stimulus.DIAGRAM, Stimulus.FINGERBOARD],
  // Armadura é convenção de escrita: não soa.
  [Dimension.KEY_SIGNATURE]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.DIAGRAM],
  [Dimension.TIME_SIGNATURE]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.RHYTHM]: [Stimulus.NOTATION, Stimulus.AUDIO],
  [Dimension.TEMPO]: [Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.DYNAMICS]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.EXPRESSION]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.CHORD]: [Stimulus.NOTATION, Stimulus.CHORD_SYMBOL, Stimulus.AUDIO, Stimulus.DIAGRAM, Stimulus.FINGERBOARD],
  [Dimension.HARMONIC_FUNCTION]: [Stimulus.NOTATION, Stimulus.CHORD_SYMBOL, Stimulus.AUDIO],
  [Dimension.CADENCE]: [Stimulus.NOTATION, Stimulus.CHORD_SYMBOL, Stimulus.AUDIO],
  [Dimension.VOICE_LEADING]: [Stimulus.NOTATION, Stimulus.AUDIO],
  [Dimension.ORNAMENT]: [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO],
  [Dimension.MODULATION]: [Stimulus.NOTATION, Stimulus.CHORD_SYMBOL, Stimulus.AUDIO],
  [Dimension.TRANSPOSITION]: [Stimulus.NOTATION, Stimulus.CHORD_SYMBOL],
  // Notação especial é sinal escrito: perguntá-la de ouvido não faz sentido.
  [Dimension.SPECIAL_NOTATION]: [Stimulus.NOTATION, Stimulus.NAME],
  [Dimension.ACOUSTICS]: [Stimulus.NAME, Stimulus.AUDIO, Stimulus.DIAGRAM],
};

/**
 * Respostas que fazem sentido para cada dimensão.
 *
 * Aqui a restrição é de **execução**: dá para cantar um intervalo, e não dá
 * para cantar uma armadura de clave. Dá para tocar um acorde, e não dá para
 * tocar um andamento — andamento se executa batendo, não tocando uma altura.
 */
export const VALID_RESPONSES: Record<Dimension, ResponseMode[]> = {
  [Dimension.NOTE]: [
    ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF, ResponseMode.MATCH,
    ResponseMode.POINT, ResponseMode.PLAY, ResponseMode.SING, ResponseMode.ORDER,
  ],
  [Dimension.CLEF]: [ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF, ResponseMode.MATCH],
  [Dimension.NOTE_VALUE]: [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.ORDER, ResponseMode.PERFORM_RHYTHM],
  [Dimension.ACCIDENTAL]: [
    ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF, ResponseMode.POINT,
    ResponseMode.PLAY, ResponseMode.SING,
  ],
  [Dimension.INTERVAL]: [
    ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF, ResponseMode.MATCH,
    ResponseMode.ORDER, ResponseMode.POINT, ResponseMode.PLAY, ResponseMode.SING,
  ],
  [Dimension.SCALE]: [
    ResponseMode.CHOOSE, ResponseMode.ASSEMBLE, ResponseMode.WRITE_ON_STAFF,
    ResponseMode.POINT, ResponseMode.PLAY, ResponseMode.SING,
  ],
  [Dimension.KEY_SIGNATURE]: [ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF, ResponseMode.MATCH],
  [Dimension.TIME_SIGNATURE]: [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.PERFORM_RHYTHM],
  [Dimension.RHYTHM]: [ResponseMode.CHOOSE, ResponseMode.ASSEMBLE, ResponseMode.PERFORM_RHYTHM],
  // Andamento se executa batendo o pulso, não tocando uma altura.
  [Dimension.TEMPO]: [ResponseMode.CHOOSE, ResponseMode.ORDER, ResponseMode.MATCH, ResponseMode.PERFORM_RHYTHM],
  [Dimension.DYNAMICS]: [ResponseMode.CHOOSE, ResponseMode.ORDER, ResponseMode.MATCH],
  [Dimension.EXPRESSION]: [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.PLAY],
  [Dimension.CHORD]: [
    ResponseMode.CHOOSE, ResponseMode.ASSEMBLE, ResponseMode.WRITE_ON_STAFF,
    ResponseMode.MATCH, ResponseMode.POINT, ResponseMode.PLAY,
  ],
  [Dimension.HARMONIC_FUNCTION]: [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.ASSEMBLE],
  [Dimension.CADENCE]: [ResponseMode.CHOOSE, ResponseMode.ASSEMBLE, ResponseMode.WRITE_ON_STAFF, ResponseMode.PLAY],
  [Dimension.VOICE_LEADING]: [ResponseMode.CHOOSE, ResponseMode.WRITE_ON_STAFF],
  [Dimension.ORNAMENT]: [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.PLAY, ResponseMode.SING],
  [Dimension.MODULATION]: [ResponseMode.CHOOSE, ResponseMode.ASSEMBLE],
  [Dimension.TRANSPOSITION]: [ResponseMode.WRITE_ON_STAFF, ResponseMode.ASSEMBLE, ResponseMode.PLAY],
  [Dimension.SPECIAL_NOTATION]: [ResponseMode.CHOOSE, ResponseMode.MATCH],
  [Dimension.ACOUSTICS]: [ResponseMode.CHOOSE, ResponseMode.ORDER, ResponseMode.MATCH],
};

/** Uma forma de exercício: o cruzamento dos três eixos. */
export interface ExerciseForm {
  dimensao: Dimension;
  estimulo: Stimulus;
  resposta: ResponseMode;
}

export function isValidForm(f: ExerciseForm): boolean {
  return (
    VALID_STIMULI[f.dimensao].includes(f.estimulo) &&
    VALID_RESPONSES[f.dimensao].includes(f.resposta)
  );
}

/**
 * Todas as formas legítimas.
 *
 * É o repertório de exercícios da plataforma, derivado — não enumerado à
 * mão. Acrescentar uma dimensão nova traz junto todas as formas em que ela
 * pode ser perguntada, sem que ninguém precise listá-las.
 */
export function allForms(): ExerciseForm[] {
  const formas: ExerciseForm[] = [];
  for (const dimensao of Object.values(Dimension)) {
    for (const estimulo of VALID_STIMULI[dimensao]) {
      for (const resposta of VALID_RESPONSES[dimensao]) {
        formas.push({ dimensao, estimulo, resposta });
      }
    }
  }
  return formas;
}

export function formsOfDimension(dimensao: Dimension): ExerciseForm[] {
  return allForms().filter((f) => f.dimensao === dimensao);
}

/**
 * O enunciado de uma forma.
 *
 * Gerado da gramática, e não escrito caso a caso — o que garante que a
 * mesma pergunta seja formulada do mesmo jeito em toda a plataforma.
 */
export function promptFor(f: ExerciseForm): string {
  const inicio: Record<Stimulus, string> = {
    [Stimulus.NOTATION]: 'Veja a pauta',
    [Stimulus.NAME]: 'Leia',
    [Stimulus.CHORD_SYMBOL]: 'Veja a cifra',
    [Stimulus.AUDIO]: 'Ouça',
    [Stimulus.DIAGRAM]: 'Veja o diagrama',
    [Stimulus.FINGERBOARD]: 'Veja o braço do instrumento',
  };

  const fim: Record<ResponseMode, string> = {
    [ResponseMode.CHOOSE]: 'e escolha a resposta',
    [ResponseMode.ASSEMBLE]: 'e monte a resposta',
    [ResponseMode.WRITE_ON_STAFF]: 'e escreva na pauta',
    [ResponseMode.MATCH]: 'e combine os pares',
    [ResponseMode.ORDER]: 'e ponha em ordem',
    [ResponseMode.POINT]: 'e aponte a posição',
    [ResponseMode.PLAY]: 'e toque a resposta',
    [ResponseMode.SING]: 'e cante a resposta',
    [ResponseMode.PERFORM_RHYTHM]: 'e execute o ritmo',
  };

  return `${inicio[f.estimulo]} ${fim[f.resposta]}`;
}

/**
 * As dimensões que um capítulo do curso de Teoria exercita.
 *
 * É a costura entre Academy e Practice: terminar o capítulo 10 abre os
 * exercícios de intervalo, e não os de acorde — que dependem dele.
 */
export function dimensionsOfChapter(capitulo: number): Dimension[] {
  return (Object.entries(DIMENSIONS) as [Dimension, DimensionDescription][])
    .filter(([, d]) => d.capitulos.includes(capitulo))
    .map(([dim]) => dim);
}

/**
 * A dimensão está ao alcance de quem domina estas outras?
 *
 * Perguntar cadência a quem não sabe função harmônica não é desafio: é
 * cobrar o que não foi ensinado.
 */
export function isWithinReach(dimensao: Dimension, dominadas: Dimension[]): boolean {
  return DIMENSIONS[dimensao].requer.every((r) => dominadas.includes(r));
}

/**
 * Ordem pedagógica de todas as dimensões.
 *
 * Ordenação topológica sobre `requer`. É o que permite montar um percurso do
 * zero sem que ninguém precise ordenar 21 dimensões à mão — e sem que a
 * ordem se perca quando uma dimensão nova entrar no meio.
 */
export function pedagogicalOrder(): Dimension[] {
  const ordenadas: Dimension[] = [];
  const restantes = new Set(Object.values(Dimension));

  while (restantes.size > 0) {
    const prontas = [...restantes].filter((d) =>
      DIMENSIONS[d].requer.every((r) => ordenadas.includes(r))
    );
    /**
     * Sem nenhuma pronta, há ciclo em `requer`.
     *
     * Devolver o que falta na ordem declarada evita laço infinito e deixa o
     * defeito visível — um teste o pega, e é melhor do que travar.
     */
    if (prontas.length === 0) return [...ordenadas, ...restantes];
    for (const d of prontas) {
      ordenadas.push(d);
      restantes.delete(d);
    }
  }
  return ordenadas;
}
