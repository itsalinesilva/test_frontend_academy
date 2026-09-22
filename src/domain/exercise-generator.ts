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
} from './pitch';
import { Dimension } from './music-grammar';
import { ExerciseFigure, ExerciseTag, ExerciseType, MusicExercise } from './music-exercise';

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
  /**
   * 🔴 A FIGURA SOBRE A QUAL SE PERGUNTA.
   *
   * Nos níveis de leitura ela é obrigatória na prática: sem figura, o
   * enunciado precisa dizer a resposta, e foi exatamente isso que esta versão
   * corrigiu. Ver `figuraDaPergunta` em `nexo-das-perguntas.test.ts`.
   */
  figura?: ExerciseFigure;
}

/**
 * A clave do nível.
 *
 * `RECOGNIZE` usa sempre sol, que é a que se aprende primeiro. `NAME` alterna
 * com fá — e aí a mesma posição na pauta é outra nota, que é precisamente a
 * competência que o nível seguinte cobra.
 *
 * Antes, `RECOGNIZE` e `NAME` produziam **o mesmo enunciado**, mudando só o
 * número de distratores. O cabeçalho deste arquivo promete que `NAME` é "sem
 * apoio no enunciado", e a promessa não era cumprida.
 */
function claveDoNivel(level: Level, draw: Draw): 'treble' | 'bass' {
  if (level === Level.RECOGNIZE) return 'treble';
  return draw.pick(['treble', 'bass'] as const);
}

/** A oitava em que a clave põe a nota de forma legível, sem linhas suplementares demais. */
function oitavaDaClave(clave: 'treble' | 'bass'): number {
  return clave === 'treble' ? 4 : 3;
}

/** "quatro", "meia", "um quarto de" — a fração escrita como se lê. */
function porExtenso(f: number): string {
  const inteiros: Record<number, string> = { 1: 'uma', 2: 'duas', 3: 'três', 4: 'quatro', 8: 'oito', 16: 'dezesseis' };
  if (Number.isInteger(f) && inteiros[f]) return inteiros[f];
  if (f === 0.5) return 'meia';
  const d = Math.round(1 / f);
  const ordinais: Record<number, string> = { 4: 'um quarto de', 8: 'um oitavo de', 16: 'um dezesseis avos de' };
  return ordinais[d] ?? `1/${d} de`;
}

// ---------------------------------------------------------------------------
// Um construtor por dimensão
// ---------------------------------------------------------------------------

function buildNote(level: Level, draw: Draw): Built {
  const notes = draw.sample(NATURAL_NOTES, choiceCount(level));
  const correct = notes[0];

  /**
   * 🔴 A NOTA ESTÁ NA PAUTA, E NÃO NO ENUNCIADO.
   *
   * Isto aqui dizia: `Que nota está uma ${NATURAL_NAME_PT[correct]} — qual
   * destas é?`. A resposta estava escrita na pergunta. Além de não medir nada,
   * a frase não é português.
   *
   * Leitura de nota **exige** a nota escrita: é o que se está treinando.
   */
  const clave = claveDoNivel(level, draw);
  const oitava = oitavaDaClave(clave);
  const hz = (n: string) => [frequencyOf(`${n}${oitava}`)!];

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? 'Ouça e diga que nota é'
        : /*
             🔴 O ENUNCIADO NÃO NOMEIA A CLAVE.
      
             A versão anterior dizia "Repare na clave de fá" — e "fá" é uma das
             respostas possíveis. O enunciado voltava a entregar o gabarito, de
             um jeito mais discreto que antes e igualmente fatal.
      
             A clave está desenhada na pauta. Reparar nela é a competência que o
             nível cobra: dizê-la no texto seria responder pela pessoa.
          */
          'Que nota está escrita na pauta?',
    labels: notes.map((n) => NATURAL_NAME_PT[n]),
    correctLabel: NATURAL_NAME_PT[correct],
    /**
     * A explicação dizia "classe de altura 11" — jargão de quem programa
     * afinação, e número que não significa nada para quem está aprendendo a
     * ler. O que ensina é onde a nota fica.
     */
    explanation:
      level === Level.EAR
        ? `É ${NATURAL_NAME_PT[correct]}. Reconhecer altura sem a pauta é o que o treino de ouvido constrói.`
        : `É ${NATURAL_NAME_PT[correct]}, lida na ${clave === 'treble' ? 'clave de sol' : 'clave de fá'}. A mesma posição na outra clave seria outra nota — por isso a clave se lê antes das notas.`,
    audioHz: level === Level.EAR ? hz(correct) : undefined,
    audioMode: 'SEQUENCE',
    choiceHz: Object.fromEntries(notes.map((n) => [NATURAL_NAME_PT[n], hz(n)])),
    tonicHz: frequencyOf(`${correct}${oitava}`) ?? undefined,
    figura:
      level === Level.EAR
        ? undefined
        : { kind: 'STAFF', clef: clave, notes: [`${correct}${oitava}`] },
  };
}

function buildInterval(level: Level, draw: Draw): Built {
  const clave = claveDoNivel(level, draw);
  const oitava = oitavaDaClave(clave);
  const root = draw.pick(NATURAL_NOTES);
  const rootHz = frequencyOf(`${root}${oitava}`)!;
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

  /**
   * 🔴 O ENUNCIADO NÃO DIZ MAIS QUANTOS SEMITONS SÃO.
   *
   * Ele dizia: `De si, subindo 8 semitons — que intervalo é?`. Com o número
   * dado, a pergunta vira consulta a uma tabela: quem decorou "8 = sexta
   * menor" acerta sem olhar para música nenhuma.
   *
   * Contar o intervalo **a partir das duas notas escritas** é a competência.
   * Por isso as duas vão para a pauta, e o número sai do texto — ele reaparece
   * na explicação, que é onde ensinar é o objetivo.
   */
  const alvoHz = rootHz * Math.pow(2, semitones / 12);
  /**
   * O grau vem do `number` da tabela de intervalos: sexta são cinco letras
   * adiante, quinta são quatro. É o que faz a pauta mostrar sexta menor como
   * sexta, e não como quinta aumentada — duas grafias da mesma altura, com
   * nomes diferentes.
   */
  const notasDaPauta = soletrarConjunto(
    root,
    oitava,
    [0, semitones],
    [0, correct.number - 1]
  );

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? 'Ouça as duas notas e diga que intervalo é'
        : 'Que intervalo há entre as duas notas escritas?',
    labels: all.map((i) => i.name),
    correctLabel: correct.name,
    explanation: `São ${semitones} ${semitones === 1 ? 'semitom' : 'semitons'}, que ${
      semitones === 1 ? 'formam' : 'formam'
    } ${correct.name}. ${correct.isConsonant ? 'É consonante.' : 'É dissonante.'}`,
    audioHz: [rootHz, alvoHz],
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
    figura:
      /**
       * 🔴 SEM SOLETRAÇÃO CORRETA, SEM FIGURA.
       *
       * `soletrarConjunto` devolve `null` quando a grafia exigiria acidente
       * duplo, que a pauta não desenha. Cair para uma grafia aproximada seria
       * voltar ao defeito: lá–dó♯–fá lido como está é fá maior invertido, e
       * não um acorde aumentado.
       *
       * Sem figura, o caso `todo exercício de leitura tem figura` acusa — e é
       * assim que se descobre que o sorteio precisa evitar essa combinação.
       */
      level === Level.EAR || !notasDaPauta
        ? undefined
        : { kind: 'STAFF', clef: clave, notes: notasDaPauta },
  };
}

/**
 * 🔴 A GRAFIA DA NOTA, POR GRAU — e não pela tecla.
 *
 * Uma altura tem mais de um nome, e o nome certo depende do **grau** que ela
 * ocupa. A primeira versão desta função usava uma cromática fixa de
 * sustenidos, e produzia grafia errada na pauta:
 *
 *     lá aumentado  →  lá, dó♯, FÁ      (a quinta aumentada é MI♯)
 *     si maior      →  si, ré♯, fá♯     (certo, por acaso)
 *
 * "Lá–dó♯–fá" não é um acorde aumentado escrito errado: lido como está, é a
 * primeira inversão de fá maior. Numa tela de conservatório isso não é
 * detalhe — é ensinar a ler errado.
 *
 * A regra é simples e é a que se ensina: cada grau toma a **próxima letra**, e
 * o acidente é a diferença entre o que a letra vale naturalmente e o que o
 * intervalo pede. Terça sobe duas letras, quinta sobe quatro, sétima seis.
 */
const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
/** O que cada letra vale, em semitons, a partir de dó. */
const VALOR_NATURAL = [0, 2, 4, 5, 7, 9, 11];

/**
 * Soletra a nota que está `semitons` acima de `raiz`, ocupando `grau` letras
 * adiante (0 = a própria, 2 = terça, 4 = quinta, 6 = sétima).
 *
 * Devolve `null` quando a grafia exigiria acidente duplo. Não é omissão: o
 * renderizador de pauta desenha um acidente por nota, e escrever `F##` como
 * `G` seria voltar ao defeito que esta função existe para corrigir. Quem chama
 * sorteia outra raiz.
 */
function soletrarPorGrau(
  raiz: string,
  oitava: number,
  semitons: number,
  grau: number
): string | null {
  const iRaiz = LETRAS.indexOf(raiz as (typeof LETRAS)[number]);
  if (iRaiz < 0) return null;

  const iLetra = (iRaiz + grau) % 7;
  const letra = LETRAS[iLetra];

  /** Quantas oitavas a letra atravessou, para o número científico. */
  const saltosDeOitava = Math.floor((iRaiz + grau) / 7);

  /** O que a letra vale sozinha, relativo à raiz, dentro da oitava. */
  const naturalRelativo = (VALOR_NATURAL[iLetra] - VALOR_NATURAL[iRaiz] + 12) % 12;
  /** E o que o intervalo pede, também dentro da oitava. */
  const pedido = semitons % 12;

  let acidente = pedido - naturalRelativo;
  if (acidente > 6) acidente -= 12;
  if (acidente < -6) acidente += 12;

  if (acidente > 1 || acidente < -1) return null;

  const sinal = acidente === 1 ? '#' : acidente === -1 ? 'b' : '';
  return `${letra}${sinal}${oitava + saltosDeOitava + Math.floor(semitons / 12)}`;
}

/**
 * 🔴 A RAIZ QUE PODE SER ESCRITA, entre as que serviriam.
 *
 * Si aumentado é si–ré♯–**fá♯♯**: a quinta aumentada de si exige acidente
 * duplo, e a pauta desenha um por nota. Sem esta escolha, o exercício saía sem
 * figura — e aí o enunciado "Que acorde está escrito na pauta?" perguntava
 * sobre uma pauta que não estava lá.
 *
 * Trocar a raiz é a saída honesta: o conteúdo pedido é "reconhecer um acorde
 * aumentado", e ele é o mesmo em lá ou em si. O que não se pode é escrever
 * errado nem perguntar sobre o vazio.
 *
 * LIMITE: as raízes que exigem acidente duplo **não aparecem** neste exercício.
 * Ensinar a grafia de si aumentado exige pauta com acidente duplo, e está no
 * `CLAUDE_TODO.md`.
 */
function raizQueSeEscreve(
  draw: Draw,
  candidatas: readonly string[],
  oitava: number,
  intervalos: readonly number[],
  graus: readonly number[]
): { raiz: string; notas: string[] } | null {
  /** Sorteia a ordem, e fica na primeira que se escreve — o sorteio continua justo. */
  const ordem = draw.sample(candidatas, candidatas.length);

  for (const raiz of ordem) {
    const notas = soletrarConjunto(raiz, oitava, intervalos, graus);
    if (notas) return { raiz, notas };
  }
  return null;
}

/**
 * Soletra uma coleção inteira de graus, ou desiste.
 *
 * Tudo ou nada: uma pauta com metade das notas certas e metade omitidas é pior
 * que nenhuma, porque o aluno conta os intervalos sobre o que está vendo.
 */
function soletrarConjunto(
  raiz: string,
  oitava: number,
  intervalos: readonly number[],
  graus: readonly number[]
): string[] | null {
  const saida: string[] = [];
  for (let i = 0; i < intervalos.length; i++) {
    const n = soletrarPorGrau(raiz, oitava, intervalos[i], graus[i]);
    if (n === null) return null;
    saida.push(n);
  }
  return saida;
}

function buildNoteValue(level: Level, draw: Draw): Built {
  const values = draw.sample(NOTE_VALUES, choiceCount(level));
  const correct = values[0];

  /**
   * 🔴 O ENUNCIADO ESTAVA EM PORTUGUÊS QUEBRADO — E SE RESPONDIA SOZINHO.
   *
   * Ele saía "Que figura vale 1/2 semínimas?": fração crua, plural errado. E a
   * explicação saía "A semibreve vale 1 da semibreve", tautologia sem unidade.
   *
   * Corrigido o português, sobrou o defeito de fundo: medindo tudo em
   * semínimas, quando a resposta ERA a semínima a pergunta virava
   *
   *     "Que figura dura o mesmo que uma semínima?"  → semínima
   *
   * 🔴 A referência nunca pode ser a própria resposta. A semínima é a unidade
   * natural, porque é com ela que se conta o compasso; quando ela é a resposta,
   * a referência passa a ser a semibreve.
   */
  const referencia =
    correct.id === 'seminima'
      ? NOTE_VALUES.find((v) => v.id === 'semibreve')!
      : NOTE_VALUES.find((v) => v.id === 'seminima')!;

  const quantas = correct.fraction / referencia.fraction;
  const quantia = porExtenso(quantas);
  /** "um quarto de semibreve" já traz a preposição; "quatro semínimas" pluraliza. */
  const unidade = quantas > 1 ? `${referencia.name}s` : referencia.name;

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `Que figura dura o mesmo que ${quantia} ${unidade}?`,
    labels: values.map((v) => v.name),
    correctLabel: correct.name,
    /**
     * A explicação diz a regra que permite deduzir a próxima, em vez de
     * repetir o enunciado: cada figura vale metade da anterior.
     */
    explanation: `A ${correct.name} vale ${quantia} ${unidade}. As figuras vão de metade em metade — cada uma dura o dobro da seguinte.`,
  };
}

function buildScale(level: Level, draw: Draw): Built {
  const clave = claveDoNivel(level, draw);
  const oitava = oitavaDaClave(clave);
  const modes = Object.keys(SCALE_STEPS) as ScaleMode[];
  const correct = draw.pick(modes);

  /** Mesma ordem do acorde: o modo decide que tônicas podem ser escritas. */
  const escolhida = raizQueSeEscreve(
    draw,
    NATURAL_NOTES,
    oitava,
    SCALE_STEPS[correct],
    SCALE_STEPS[correct].map((_, i) => i)
  );
  const tonic = escolhida?.raiz ?? draw.pick(NATURAL_NOTES);
  const tonicHz = frequencyOf(`${tonic}${oitava}`)!;
  const others = modes.filter((m) => m !== correct);
  const all = [correct, ...draw.sample(others, Math.min(choiceCount(level) - 1, others.length))];

  const hzOf = (m: ScaleMode) => SCALE_STEPS[m].map((s) => tonicHz * Math.pow(2, s / 12));

  /**
   * 🔴 O ENUNCIADO NÃO DITA MAIS OS GRAUS.
   *
   * Ele dizia: `Que escala tem os graus 0, 2, 3, 5, 7, 8, 10 em semitons?` —
   * e a explicação repetia a mesma sequência. Era consulta a uma tabela, com o
   * gabarito impresso ao lado.
   *
   * Pior: o enunciado **nunca dizia a tônica**, mas todas as alternativas
   * traziam a mesma. A pergunta estava incompleta e mesmo assim respondível —
   * o sinal de que não era sobre música.
   *
   * Agora a escala está escrita na pauta, e o que distingue as alternativas é
   * o grau característico. A explicação nomeia **qual** é esse grau, que é o
   * que ensina a reconhecer a próxima.
   */
  /** Escala: cada grau toma a letra seguinte, sem pular nem repetir nenhuma. */
  const notasDaPauta = escolhida?.notas ?? null;

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? `Ouça a escala sobre ${NATURAL_NAME_PT[tonic]} e diga qual é`
        : 'Que escala está escrita na pauta?',
    labels: all.map((m) => `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[m]}`),
    correctLabel: `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[correct]}`,
    explanation: explicarEscala(tonic, correct),
    audioHz: hzOf(correct),
    audioMode: 'SEQUENCE',
    choiceHz: Object.fromEntries(
      all.map((m) => [`${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[m]}`, hzOf(m)])
    ),
    tonicHz,
    figura:
      /**
       * 🔴 SEM SOLETRAÇÃO CORRETA, SEM FIGURA.
       *
       * `soletrarConjunto` devolve `null` quando a grafia exigiria acidente
       * duplo, que a pauta não desenha. Cair para uma grafia aproximada seria
       * voltar ao defeito: lá–dó♯–fá lido como está é fá maior invertido, e
       * não um acorde aumentado.
       *
       * Sem figura, o caso `todo exercício de leitura tem figura` acusa — e é
       * assim que se descobre que o sorteio precisa evitar essa combinação.
       */
      level === Level.EAR || !notasDaPauta
        ? undefined
        : { kind: 'STAFF', clef: clave, notes: notasDaPauta },
  };
}

/**
 * O que distingue esta escala das vizinhas.
 *
 * Repetir a sequência de semitons — que é o que a explicação antiga fazia —
 * ensina a decorar sete números. O que permite reconhecer a próxima é saber
 * **qual grau** muda: a terça abaixada separa a menor da maior, e a sétima
 * levantada separa a harmônica da natural.
 */
function explicarEscala(tonic: string, modo: ScaleMode): string {
  const nome = `${NATURAL_NAME_PT[tonic]} ${SCALE_NAME_PT[modo]}`;
  const passos = SCALE_STEPS[modo];

  const terca = passos[2];
  const setima = passos[6];

  if (terca === 3 && setima === 11) {
    return `É ${nome}: terça menor com sétima levantada — é a sétima que a distingue da menor natural, e o salto de segunda aumentada entre o sexto e o sétimo graus é a marca dela.`;
  }
  if (terca === 3) {
    return `É ${nome}: a terça abaixada é o que a separa da maior sobre a mesma tônica.`;
  }
  if (terca === 4) {
    return `É ${nome}: terça e sétima maiores, sem alteração — é a escala de referência.`;
  }
  return `É ${nome}.`;
}

function buildChord(level: Level, draw: Draw): Built {
  const clave = claveDoNivel(level, draw);
  const oitava = oitavaDaClave(clave);
  const qualities = Object.keys(CHORD_SHAPES) as ChordQuality[];
  const correct = draw.pick(qualities);

  /**
   * A qualidade vem primeiro, e a raiz depois — porque é a qualidade que
   * decide quais raízes podem ser escritas. Sortear a raiz antes produzia si
   * aumentado, que exige fá♯♯ e saía sem pauta nenhuma.
   */
  const escolhida = raizQueSeEscreve(
    draw,
    NATURAL_NOTES,
    oitava,
    CHORD_SHAPES[correct],
    CHORD_SHAPES[correct].map((_, i) => i * 2)
  );
  const root = escolhida?.raiz ?? draw.pick(NATURAL_NOTES);
  const rootHz = frequencyOf(`${root}${oitava}`)!;
  const others = qualities.filter((q) => q !== correct);
  const all = [correct, ...draw.sample(others, choiceCount(level) - 1)];

  const hzOf = (q: ChordQuality) => CHORD_SHAPES[q].map((s) => rootHz * Math.pow(2, s / 12));

  /**
   * 🔴 MESMO DEFEITO DA ESCALA, MESMA CORREÇÃO.
   *
   * O enunciado dizia `Que acorde tem os intervalos 0, 4, 7 em semitons?`, e a
   * explicação repetia `empilha 0-4-7 semitons`. A pergunta trazia o gabarito
   * e a explicação não acrescentava nada.
   *
   * Agora o acorde está escrito, e a explicação diz **o que ouvir e o que
   * ver**: qual terça, e qual quinta.
   */
  /** Acorde: empilhamento de terças — cada nota pula uma letra. */
  const notasDaPauta = escolhida?.notas ?? null;

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? `Ouça o acorde sobre ${NATURAL_NAME_PT[root]} e diga qual é`
        : 'Que acorde está escrito na pauta?',
    labels: all.map((q) => `${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[q]}`),
    correctLabel: `${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[correct]}`,
    explanation: explicarAcorde(root, correct),
    audioHz: hzOf(correct),
    audioMode: 'CHORD',
    choiceHz: Object.fromEntries(
      all.map((q) => [`${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[q]}`, hzOf(q)])
    ),
    tonicHz: rootHz,
    figura:
      /**
       * 🔴 SEM SOLETRAÇÃO CORRETA, SEM FIGURA.
       *
       * `soletrarConjunto` devolve `null` quando a grafia exigiria acidente
       * duplo, que a pauta não desenha. Cair para uma grafia aproximada seria
       * voltar ao defeito: lá–dó♯–fá lido como está é fá maior invertido, e
       * não um acorde aumentado.
       *
       * Sem figura, o caso `todo exercício de leitura tem figura` acusa — e é
       * assim que se descobre que o sorteio precisa evitar essa combinação.
       */
      level === Level.EAR || !notasDaPauta
        ? undefined
        : { kind: 'STAFF', clef: clave, notes: notasDaPauta },
  };
}

/**
 * O que distingue este acorde dos vizinhos.
 *
 * Um acorde de três sons se identifica por duas perguntas: que terça, e que
 * quinta. Dizer isso ensina a classificar o próximo; repetir "0-4-7" ensina a
 * reconhecer a string "0-4-7".
 */
function explicarAcorde(root: string, q: ChordQuality): string {
  const nome = `${NATURAL_NAME_PT[root]} ${CHORD_NAME_PT[q]}`;
  const forma = CHORD_SHAPES[q];
  const terca = forma[1];
  const quinta = forma[2];

  const qualTerca = terca === 4 ? 'terça maior' : terca === 3 ? 'terça menor' : `terça de ${terca} semitons`;
  const qualQuinta =
    quinta === 7
      ? 'quinta justa'
      : quinta === 6
        ? 'quinta diminuta'
        : quinta === 8
          ? 'quinta aumentada'
          : `quinta de ${quinta} semitons`;

  const sufixo =
    forma.length > 3 ? ' A quarta nota é a sétima, e é ela que pede resolução.' : '';

  return `É ${nome}: ${qualTerca} e ${qualQuinta} sobre a fundamental.${sufixo}`;
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

  /**
   * 🔴 "ARMADURA DE SI MENOR NATURAL" NÃO EXISTE.
   *
   * O enunciado usava `SCALE_NAME_PT[mode]`, que devolve "menor natural" — e
   * com isso perguntava pela armadura de uma **forma da escala**. Armadura é
   * do tom: si menor natural, harmônica e melódica têm a MESMA armadura, e o
   * que as distingue são acidentes ocorrentes, escritos nota a nota.
   *
   * Perguntar assim ensina errado, e induz a erro nas alternativas de escala,
   * onde "menor harmônica" aparecia como se tivesse armadura própria.
   */
  const tom = `${NATURAL_NAME_PT[tonic]} ${mode === 'MAJOR' ? 'maior' : 'menor'}`;

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `Quantas alterações tem a armadura de ${tom}?`,
    labels: all.map(describeKeySignature),
    correctLabel: describeKeySignature(correct),
    /**
     * A explicação repetia o rótulo da alternativa — "si menor tem 2
     * sustenidos" — e não acrescentava nada a quem errou. O que ensina é a
     * relação que permite deduzir a próxima.
     */
    explanation: explicarArmadura(tom, mode, correct),
  };
}

/**
 * Por que a armadura é essa, e como deduzir a seguinte.
 *
 * O relativo é a chave: cada armadura serve a **dois** tons, um maior e um
 * menor a uma terça menor abaixo. Quem sabe isso deduz metade da tabela sem
 * decorar.
 */
function explicarArmadura(tom: string, mode: ScaleMode, alteracoes: number): string {
  const quantas = describeKeySignature(alteracoes);

  if (alteracoes === 0) {
    return `${tom} não leva alteração na armadura. É o par relativo de dó maior e lá menor — a mesma armadura vazia serve aos dois.`;
  }

  const sinal = alteracoes > 0 ? 'sustenidos' : 'bemóis';
  const relativo =
    mode === 'MAJOR'
      ? 'o relativo menor, uma terça menor abaixo, usa a mesma'
      : 'o relativo maior, uma terça menor acima, usa a mesma';

  return `${tom} leva ${quantas}. Toda armadura serve a dois tons: ${relativo}. A ordem dos ${sinal} é fixa, e é ela que dá a próxima armadura do ciclo.`;
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
    figura: built.figura,
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
