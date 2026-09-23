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

/**
 * As dimensões para as quais existe gerador — as vinte e uma.
 *
 * Eram seis: o Laboratório funcionava sobre um sexto do vocabulário que a
 * gramática define (LAB-1). O registro de construtores (`BUILDERS`, mais
 * abaixo) é um `Record` TOTAL sobre `Dimension`: uma dimensão nova sem
 * construtor não compila. Por isso esta lista pode ser a enumeração inteira.
 */
export const GENERATED_DIMENSIONS: readonly Dimension[] = Object.values(Dimension) as Dimension[];

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
        : { kind: 'STAFF', clef: clave, notes: notasDaPauta, simultaneas: true },
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

// ---------------------------------------------------------------------------
// 🔴 LAB-1 — AS QUINZE DIMENSÕES QUE NÃO TINHAM GERADOR
// ---------------------------------------------------------------------------
//
// O Laboratório funcionava sobre seis das vinte e uma dimensões da gramática.
// As quinze de baixo seguem as mesmas regras das seis de cima — e é
// `nexo-das-perguntas.test.ts` que as cobra de todas, sem exceção nova:
//
//   - a resposta nunca está no enunciado;
//   - pergunta de leitura MOSTRA o que se lê (pauta, ou o sinal impresso);
//   - pergunta de ouvido tem som, e só existe onde o motor de som é honesto;
//   - a explicação ensina a regra, e não repete o rótulo.

type Duracao = 'whole' | 'half' | 'quarter' | 'eighth';

const ACIDENTE_PT: Record<string, string> = { '#': ' sustenido', b: ' bemol', '': '' };

/** "F#4" → "fá sustenido". O nome que o aluno lê, sem a oitava. */
function nomeDe(cientifica: string): string {
  const m = /^([A-G])([#b]?)/.exec(cientifica)!;
  return NATURAL_NAME_PT[m[1]] + ACIDENTE_PT[m[2]];
}

/** Grau diatônico absoluto (oitava × 7 + letra) e o caminho de volta. */
function grauDe(letra: string, oitava: number): number {
  return oitava * 7 + LETRAS.indexOf(letra as (typeof LETRAS)[number]);
}
function notaDoGrau(grau: number): string {
  return `${LETRAS[((grau % 7) + 7) % 7]}${Math.floor(grau / 7)}`;
}

/** A escala maior de uma tônica natural, em duas oitavas, soletrada por grau. */
function escalaMaior(tonica: string, oitava: number): string[] {
  const passos = [0, 2, 4, 5, 7, 9, 11];
  const graus = [0, 1, 2, 3, 4, 5, 6];
  const baixo = soletrarConjunto(tonica, oitava, passos, graus)!;
  const alto = soletrarConjunto(tonica, oitava + 1, passos, graus)!;
  return [...baixo, ...alto];
}

/** A tríade do grau (0 = I) no tom, em posição fundamental. */
function triadeDoGrau(tonica: string, oitava: number, grau: number): string[] {
  const e = escalaMaior(tonica, oitava);
  return [e[grau], e[grau + 2], e[grau + 4]];
}

const tomMaior = (t: string) => `${NATURAL_NAME_PT[t]} maior`;

/** Tônicas maiores cujas escalas se escrevem com um acidente por nota. */
const TONICAS_ESCREVIVEIS = ['C', 'D', 'E', 'F', 'G', 'A'] as const;

/** Monta as alternativas: a certa e `quantas - 1` distratores distintos. */
function alternativas(draw: Draw, certa: string, candidatos: readonly string[], quantas: number): string[] {
  const distratores = draw.sample(
    [...new Set(candidatos)].filter((c) => c !== certa),
    quantas - 1
  );
  return draw.sample([certa, ...distratores], distratores.length + 1);
}

/** Como `alternativas`, com um distrator que precisa estar lá — o erro que mais ensina. */
function alternativasCom(
  draw: Draw,
  certa: string,
  obrigatorio: string,
  candidatos: readonly string[],
  quantas: number
): string[] {
  if (obrigatorio === certa) return alternativas(draw, certa, candidatos, quantas);
  const resto = draw.sample(
    [...new Set(candidatos)].filter((c) => c !== certa && c !== obrigatorio),
    quantas - 2
  );
  return draw.sample([certa, obrigatorio, ...resto], resto.length + 2);
}

// --- Clave ------------------------------------------------------------------

/**
 * A mesma posição, outra clave. O distrator que mais ensina é a leitura na
 * clave ERRADA — é o erro de quem ainda não lê a clave antes das notas — e
 * ele está sempre entre as alternativas.
 */
function buildClef(level: Level, draw: Draw): Built {
  const de = claveDoNivel(level, draw);
  const para = de === 'treble' ? 'bass' : 'treble';
  const base = { treble: grauDe('E', 4), bass: grauDe('G', 2) };
  const posicao = draw.next() % 9; // da linha de baixo à de cima

  const escrita = notaDoGrau(base[de] + posicao);
  const naOutra = notaDoGrau(base[para] + posicao);
  const certa = nomeDe(naOutra);
  const lidaNaMesma = nomeDe(escrita);

  const labels = alternativasCom(
    draw,
    certa,
    lidaNaMesma,
    NATURAL_NOTES.map((n) => NATURAL_NAME_PT[n]),
    choiceCount(level)
  );

  const nomeDa = (c: 'treble' | 'bass') => (c === 'treble' ? 'clave de sol' : 'clave de fá');

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Se a clave desenhada fosse trocada pela outra clave mais usada, que nota passaria a ocupar essa mesma posição?',
    labels,
    correctLabel: certa,
    explanation: `Na ${nomeDa(de)} essa posição é ${lidaNaMesma}; na ${nomeDa(para)}, a mesma linha ou espaço é ${certa}. De uma clave para a outra a leitura muda uma terça — por isso a clave se lê antes de qualquer nota.`,
    figura: { kind: 'STAFF', clef: de, notes: [escrita] },
  };
}

// --- Alteração --------------------------------------------------------------

function buildAccidental(level: Level, draw: Draw): Built {
  if (level === Level.EAR) {
    const letra = draw.pick(NATURAL_NOTES);
    const movimento = draw.pick([1, -1, 0] as const);
    const opcoes: Record<number, string> = {
      1: 'a segunda subiu um semitom',
      [-1]: 'a segunda desceu um semitom',
      0: 'as duas são a mesma nota',
      2: 'a segunda subiu um tom inteiro',
    };
    const natural = frequencyOf(`${letra}4`)!;
    return {
      type: ExerciseType.IDENTIFY_BY_EAR,
      prompt: 'Ouça as duas notas e diga o que aconteceu com a segunda.',
      labels: draw.sample([1, -1, 0, 2].map((k) => opcoes[k]), 4),
      correctLabel: opcoes[movimento],
      explanation:
        'O sustenido sobe a nota um semitom, o bemol desce um semitom, e o bequadro devolve a nota natural. Um semitom é a menor distância entre duas teclas vizinhas do piano.',
      audioHz: [natural, natural * Math.pow(2, movimento / 12)],
      audioMode: 'SEQUENCE',
      tonicHz: natural,
    };
  }

  const clave = claveDoNivel(level, draw);
  const oitava = oitavaDaClave(clave);
  const iLetra = draw.next() % 7;
  const letra = LETRAS[iLetra];
  const acidente = draw.pick(['#', 'b'] as const);
  const outro = acidente === '#' ? 'b' : '#';
  const escrita = `${letra}${acidente}${oitava}`;
  const certa = nomeDe(escrita);
  const vizinha = LETRAS[(iLetra + 1) % 7];
  const anterior = LETRAS[(iLetra + 6) % 7];

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Que nota está escrita na pauta, com a alteração?',
    labels: alternativas(
      draw,
      certa,
      [nomeDe(`${letra}${outro}`), nomeDe(letra), nomeDe(`${vizinha}${acidente}`), nomeDe(`${anterior}${acidente}`)],
      choiceCount(level)
    ),
    correctLabel: certa,
    explanation: `O ${acidente === '#' ? 'sustenido' : 'bemol'} ao lado da nota ${acidente === '#' ? 'sobe' : 'desce'} ${NATURAL_NAME_PT[letra]} um semitom: a nota é ${certa}. A alteração vale para as notas da mesma altura até o fim do compasso.`,
    figura: { kind: 'STAFF', clef: clave, notes: [escrita] },
  };
}

// --- Compasso ---------------------------------------------------------------

const FORMULAS: Array<{ f: string; nome: string; notas: number; duracao: Duracao; porque: string }> = [
  { f: '2/4', nome: 'binário simples', notas: 2, duracao: 'quarter', porque: 'dois tempos, e cada tempo vale uma semínima que se divide em duas' },
  { f: '3/4', nome: 'ternário simples', notas: 3, duracao: 'quarter', porque: 'três tempos, e cada tempo vale uma semínima que se divide em duas' },
  { f: '4/4', nome: 'quaternário simples', notas: 4, duracao: 'quarter', porque: 'quatro tempos, e cada tempo vale uma semínima que se divide em duas' },
  { f: '6/8', nome: 'binário composto', notas: 6, duracao: 'eighth', porque: 'seis colcheias agrupadas de três em três: dois tempos, cada um de semínima pontuada, que se divide em três' },
  { f: '9/8', nome: 'ternário composto', notas: 9, duracao: 'eighth', porque: 'nove colcheias agrupadas de três em três: três tempos, cada um de semínima pontuada, que se divide em três' },
  { f: '12/8', nome: 'quaternário composto', notas: 12, duracao: 'eighth', porque: 'doze colcheias agrupadas de três em três: quatro tempos, cada um de semínima pontuada, que se divide em três' },
];

function buildTimeSignature(level: Level, draw: Draw): Built {
  const pool = level === Level.RECOGNIZE ? FORMULAS.slice(0, 3) : FORMULAS;
  const certa = draw.pick(pool);
  /** Notas dentro das cinco linhas da clave de sol, de mi4 a fá5. */
  const melodia = Array.from({ length: certa.notas }, () => notaDoGrau(grauDe('E', 4) + (draw.next() % 9)));

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Que compasso está escrito na pauta?',
    labels: alternativas(draw, certa.nome, pool.map((x) => x.nome), choiceCount(level)),
    correctLabel: certa.nome,
    explanation: `É ${certa.nome}: ${certa.porque}. No simples o tempo se divide em dois; no composto, em três.`,
    figura: {
      kind: 'STAFF',
      clef: 'treble',
      notes: melodia,
      duracoes: melodia.map(() => certa.duracao),
      timeSignature: certa.f,
    },
  };
}

// --- Ritmo ------------------------------------------------------------------

const CELULAS: Array<{ nome: string; notas: string[]; duracoes: Duracao[]; porque: string }> = [
  {
    nome: 'síncope',
    /** Colcheia, semínima, colcheia: a semínima nasce na parte fraca do primeiro tempo e atravessa o segundo. */
    notas: ['B4', 'B4', 'B4'],
    duracoes: ['eighth', 'quarter', 'eighth'],
    porque: 'o som começa na parte fraca e se prolonga sobre a parte forte seguinte, deslocando o acento',
  },
  {
    nome: 'contratempo',
    notas: ['_', 'B4', '_', 'B4'],
    duracoes: ['eighth', 'eighth', 'eighth', 'eighth'],
    porque: 'as notas caem só nas partes fracas, e as partes fortes ficam em pausa — diferente da síncope, o som não se prolonga sobre o forte',
  },
  {
    nome: 'pulsação regular',
    notas: ['B4', 'B4'],
    duracoes: ['quarter', 'quarter'],
    porque: 'cada nota cai sobre um tempo, sem deslocar o acento: não há síncope nem contratempo',
  },
];

function buildRhythm(level: Level, draw: Draw): Built {
  const certa = draw.pick(CELULAS);
  /**
   * Quiáltera entra como DISTRATOR, e nunca como resposta: a pauta ainda não
   * desenha a chave com o número. Conhecê-la é saber que ela não está ali.
   */
  const nomes = [...CELULAS.map((c) => c.nome), ...(level === Level.RECOGNIZE ? [] : ['quiáltera'])];
  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Que célula rítmica está escrita na pauta?',
    labels: alternativas(draw, certa.nome, nomes, choiceCount(level)),
    correctLabel: certa.nome,
    explanation: `É ${certa.nome}: ${certa.porque}.`,
    figura: { kind: 'STAFF', clef: 'treble', notes: certa.notas, duracoes: certa.duracoes, timeSignature: '2/4' },
  };
}

// --- Andamento --------------------------------------------------------------

const ANDAMENTOS = [
  { termo: 'Largo', faixa: 'entre 40 e 60 batidas por minuto', sentido: 'amplo, muito lento' },
  { termo: 'Adagio', faixa: 'entre 66 e 76 batidas por minuto', sentido: 'à vontade, lento' },
  { termo: 'Andante', faixa: 'entre 76 e 108 batidas por minuto', sentido: 'andando, no passo de quem caminha' },
  { termo: 'Moderato', faixa: 'entre 108 e 120 batidas por minuto', sentido: 'moderado' },
  { termo: 'Allegro', faixa: 'entre 120 e 156 batidas por minuto', sentido: 'alegre, rápido' },
  { termo: 'Presto', faixa: 'entre 168 e 200 batidas por minuto', sentido: 'muito rápido' },
];

function buildTempo(level: Level, draw: Draw): Built {
  const i = draw.next() % ANDAMENTOS.length;
  const certa = ANDAMENTOS[i];
  /** NOMEAR usa os vizinhos: distinguir Andante de Moderato é mais difícil que de Presto. */
  const vizinhos = ANDAMENTOS.filter((_, j) => j !== i && Math.abs(j - i) <= 2);
  const candidatos = (level === Level.RECOGNIZE ? ANDAMENTOS : vizinhos).map((a) => a.faixa);

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'A que faixa de batidas por minuto corresponde o andamento escrito?',
    labels: alternativas(draw, certa.faixa, candidatos, choiceCount(level)),
    correctLabel: certa.faixa,
    explanation: `${certa.termo} quer dizer ${certa.sentido}: ${certa.faixa}. Os termos vão do mais lento ao mais rápido, e a faixa é referência de metrônomo, não número exato.`,
    figura: { kind: 'SINAL', texto: certa.termo, tipo: 'ANDAMENTO' },
  };
}

// --- Dinâmica ---------------------------------------------------------------

const DINAMICAS = [
  { sinal: 'pp', nome: 'pianíssimo — muito suave' },
  { sinal: 'p', nome: 'piano — suave' },
  { sinal: 'mp', nome: 'mezzo piano — meio suave' },
  { sinal: 'mf', nome: 'mezzo forte — meio forte' },
  { sinal: 'f', nome: 'forte' },
  { sinal: 'ff', nome: 'fortíssimo — muito forte' },
];

function buildDynamics(level: Level, draw: Draw): Built {
  const i = draw.next() % DINAMICAS.length;
  const certa = DINAMICAS[i];
  const vizinhos = DINAMICAS.filter((_, j) => j !== i && Math.abs(j - i) <= 2);
  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Que intensidade o sinal escrito pede?',
    labels: alternativas(draw, certa.nome, (level === Level.RECOGNIZE ? DINAMICAS : vizinhos).map((d) => d.nome), choiceCount(level)),
    correctLabel: certa.nome,
    explanation: `O sinal pede ${certa.nome}. As dinâmicas vêm do italiano: piano é suave, forte é forte, mezzo é meio, e a letra dobrada leva ao extremo.`,
    figura: { kind: 'SINAL', texto: certa.sinal, tipo: 'DINAMICA' },
  };
}

// --- Expressão --------------------------------------------------------------

const EXPRESSOES = [
  { termo: 'legato', sentido: 'ligar as notas, sem interrupção entre elas' },
  { termo: 'staccato', sentido: 'destacar as notas, cada uma curta e separada' },
  { termo: 'tenuto', sentido: 'sustentar cada nota pelo valor inteiro, com leve peso' },
  { termo: 'marcato', sentido: 'marcar cada nota com acento' },
  { termo: 'dolce', sentido: 'tocar com doçura e suavidade' },
  { termo: 'cantabile', sentido: 'tocar cantando, com a linha melódica em destaque' },
];

function buildExpression(level: Level, draw: Draw): Built {
  const certa = draw.pick(EXPRESSOES);
  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'O que a indicação escrita pede a quem toca?',
    labels: alternativas(draw, certa.sentido, EXPRESSOES.map((e) => e.sentido), choiceCount(level)),
    correctLabel: certa.sentido,
    explanation: `${certa.termo[0].toUpperCase()}${certa.termo.slice(1)} pede ${certa.sentido}. Articulação diz como as notas se ligam ou se separam; termo de caráter diz o espírito com que se toca.`,
    figura: { kind: 'SINAL', texto: certa.termo, tipo: 'TERMO' },
  };
}

// --- Função harmônica -------------------------------------------------------

const FUNCOES: Array<{ grau: number; romano: string; funcao: string; porque: string }> = [
  { grau: 0, romano: 'I', funcao: 'tônica', porque: 'é o acorde de repouso, o centro do tom' },
  { grau: 3, romano: 'IV', funcao: 'subdominante', porque: 'afasta-se do repouso e prepara a dominante' },
  { grau: 4, romano: 'V', funcao: 'dominante', porque: 'contém a sensível, que pede resolução na tônica' },
  { grau: 5, romano: 'vi', funcao: 'tônica', porque: 'divide duas notas com o acorde de tônica e pode substituí-lo' },
  { grau: 1, romano: 'ii', funcao: 'subdominante', porque: 'divide duas notas com o quarto grau e cumpre o mesmo papel de preparação' },
  { grau: 6, romano: 'vii°', funcao: 'dominante', porque: 'contém a sensível e o trítono da dominante, e resolve do mesmo modo' },
];

function buildHarmonicFunction(level: Level, draw: Draw): Built {
  const tonica = draw.pick(TONICAS_ESCREVIVEIS);
  const pool = level === Level.RECOGNIZE ? FUNCOES.slice(0, 3) : FUNCOES;
  const certa = draw.pick(pool);
  const acorde = triadeDoGrau(tonica, 4, certa.grau);

  return {
    type: ExerciseType.HARMONIC_FUNCTION,
    prompt: `No tom de ${tomMaior(tonica)}, que função exerce o acorde escrito?`,
    labels: draw.sample(['tônica', 'subdominante', 'dominante'], 3),
    correctLabel: certa.funcao,
    explanation: `O acorde está sobre o grau ${certa.romano} e tem função de ${certa.funcao}: ${certa.porque}.`,
    figura: { kind: 'STAFF', clef: 'treble', notes: acorde, simultaneas: true },
  };
}

// --- Cadência ---------------------------------------------------------------

const CADENCIAS: Array<{ nome: string; graus: [number, number]; porque: string }> = [
  { nome: 'autêntica', graus: [4, 0], porque: 'a dominante resolve na tônica, e o trecho soa concluído' },
  { nome: 'plagal', graus: [3, 0], porque: 'a subdominante vai à tônica, sem a sensível — é o "amém" dos hinos' },
  { nome: 'suspensiva', graus: [0, 4], porque: 'o trecho para na dominante, e fica pedindo continuação' },
  { nome: 'deceptiva', graus: [4, 5], porque: 'a dominante anuncia a tônica e vai para o sexto grau, frustrando a espera' },
];

function buildCadence(level: Level, draw: Draw): Built {
  const tonica = draw.pick(TONICAS_ESCREVIVEIS);
  const pool = level === Level.RECOGNIZE ? CADENCIAS.slice(0, 3) : CADENCIAS;
  const certa = draw.pick(pool);
  const notas = [...triadeDoGrau(tonica, 4, certa.graus[0]), ...triadeDoGrau(tonica, 4, certa.graus[1])];

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `No tom de ${tomMaior(tonica)}, que cadência encerra o trecho escrito?`,
    labels: alternativas(draw, certa.nome, pool.map((c) => c.nome), choiceCount(level)),
    correctLabel: certa.nome,
    explanation: `É a cadência ${certa.nome}: ${certa.porque}.`,
    figura: {
      kind: 'STAFF',
      clef: 'treble',
      notes: notas,
      grupos: [3, 3],
      duracoes: notas.map(() => 'half' as const),
    },
  };
}

// --- Condução de vozes ------------------------------------------------------

const MOVIMENTOS = {
  paralelo: 'movimento paralelo',
  direto: 'movimento direto',
  contrario: 'movimento contrário',
  obliquo: 'movimento oblíquo',
} as const;

function buildVoiceLeading(level: Level, draw: Draw): Built {
  const tipos = (level === Level.RECOGNIZE
    ? ['paralelo', 'contrario', 'obliquo']
    : ['paralelo', 'direto', 'contrario', 'obliquo']) as Array<keyof typeof MOVIMENTOS>;
  const tipo = draw.pick(tipos);

  /** Graus diatônicos em dó maior, dentro da clave de sol sem linha demais. */
  const grave = grauDe('E', 4) + (draw.next() % 3);
  const distancia = 2 + (draw.next() % 3); // terça, quarta ou quinta
  const agudo = grave + distancia;
  const passo = draw.pick([1, 2]);
  const sentido = draw.pick([1, -1]);

  /**
   * Contrário sempre ABRINDO e oblíquo sempre AFASTANDO: fechando, as vozes
   * podiam se cruzar ou cair no uníssono — e aí a pergunta "como as duas vozes
   * se movem" teria uma voz só a olhar.
   */
  const [dG, dA] = {
    paralelo: [sentido * passo, sentido * passo],
    direto: [sentido * passo, sentido * (passo + 1)],
    contrario: [-passo, passo],
    obliquo: [0, passo],
  }[tipo];

  const notas = [grave, agudo, grave + dG, agudo + dA].map(notaDoGrau);

  const porque = {
    paralelo: 'as duas vozes vão para o mesmo lado e mantêm a mesma distância entre si',
    direto: 'as duas vozes vão para o mesmo lado, mas a distância entre elas muda',
    contrario: 'uma voz sobe enquanto a outra desce',
    obliquo: 'uma voz fica parada enquanto a outra se move',
  }[tipo];

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'Como as duas vozes escritas se movem de um acorde para o outro?',
    labels: alternativas(draw, MOVIMENTOS[tipo], tipos.map((t) => MOVIMENTOS[t]), choiceCount(level)),
    correctLabel: MOVIMENTOS[tipo],
    explanation: `É ${MOVIMENTOS[tipo]}: ${porque}. O contrário é o que mais dá independência às vozes; o paralelo de quintas e oitavas é o que a harmonia tradicional evita.`,
    figura: { kind: 'STAFF', clef: 'treble', notes: notas, grupos: [2, 2], duracoes: notas.map(() => 'half' as const) },
  };
}

// --- Ornamento --------------------------------------------------------------

function realizacaoDoOrnamento(nome: string, principal: number): { graus: number[]; duracoes: Duracao[] } {
  const p = principal;
  switch (nome) {
    case 'trinado':
      return { graus: [p, p + 1, p, p + 1, p, p + 1, p, p + 1], duracoes: Array(8).fill('eighth') };
    case 'mordente':
      return { graus: [p, p + 1, p], duracoes: ['eighth', 'eighth', 'half'] };
    case 'grupeto':
      return { graus: [p + 1, p, p - 1, p], duracoes: ['eighth', 'eighth', 'eighth', 'eighth'] };
    case 'apojatura':
      return { graus: [p + 1, p], duracoes: ['quarter', 'quarter'] };
    default: // arpejo
      return { graus: [p, p + 2, p + 4], duracoes: ['eighth', 'eighth', 'half'] };
  }
}

const ORNAMENTOS: Record<string, string> = {
  trinado: 'a nota principal alterna rapidamente com a nota de cima, várias vezes',
  mordente: 'a nota principal vai à vizinha de cima e volta, uma vez só, depressa',
  grupeto: 'a melodia contorna a nota principal: a de cima, a principal, a de baixo e a principal de novo',
  apojatura: 'uma nota vizinha cai no tempo, e só depois resolve na principal',
  arpejo: 'as notas do acorde soam uma depois da outra, da mais grave à mais aguda',
};

function buildOrnament(level: Level, draw: Draw): Built {
  const nomes = level === Level.RECOGNIZE ? ['trinado', 'mordente', 'arpejo'] : Object.keys(ORNAMENTOS);
  const certa = draw.pick(nomes);
  const principal = grauDe('G', 4) + (draw.next() % 4);
  const { graus, duracoes } = realizacaoDoOrnamento(certa, principal);
  const notas = graus.map(notaDoGrau);

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt: level === Level.EAR ? 'Ouça o trecho e diga que ornamento soou.' : 'Que ornamento está escrito por extenso na pauta?',
    labels: alternativas(draw, certa, nomes, choiceCount(level)),
    correctLabel: certa,
    explanation: `É ${certa === 'apojatura' ? 'a' : 'o'} ${certa}: ${ORNAMENTOS[certa]}. Na partitura ele costuma vir abreviado por um sinal, e é isto que o sinal manda tocar.`,
    audioHz: level === Level.EAR ? notas.map((n) => frequencyOf(n)!) : undefined,
    audioMode: 'SEQUENCE',
    tonicHz: frequencyOf(notas[0]) ?? undefined,
    figura: level === Level.EAR ? undefined : { kind: 'STAFF', clef: 'treble', notes: notas, duracoes },
  };
}

// --- Modulação: tons vizinhos -----------------------------------------------

function buildModulation(level: Level, draw: Draw): Built {
  const partida = draw.pick(['C', 'G', 'D', 'F', 'A'] as const);
  const armadura = keySignatureOf(partida, 'MAJOR');

  const todos = NATURAL_NOTES.flatMap((t) => [
    { nome: `${NATURAL_NAME_PT[t]} maior`, arm: keySignatureOf(t, 'MAJOR'), tonica: t },
    { nome: `${NATURAL_NAME_PT[t]} menor`, arm: keySignatureOf(t, 'NATURAL_MINOR'), tonica: t },
  ]).filter((k) => !(k.tonica === partida && k.nome.endsWith('maior')));

  const vizinhos = todos.filter((k) => Math.abs(k.arm - armadura) <= 1);
  const distantes = todos.filter((k) => Math.abs(k.arm - armadura) >= 2);
  const certa = draw.pick(vizinhos);

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'O acorde escrito é a tônica do tom de partida. Qual destes tons é vizinho dele?',
    labels: alternativas(draw, certa.nome, distantes.map((k) => k.nome), choiceCount(level)),
    correctLabel: certa.nome,
    explanation: `O tom de partida é ${tomMaior(partida)}. Tons vizinhos diferem dele em no máximo uma alteração na armadura — a dominante, a subdominante e os relativos menores das três —, e ${certa.nome} é um deles. É para eles que se modula com mais naturalidade.`,
    figura: { kind: 'STAFF', clef: 'treble', notes: triadeDoGrau(partida, 4, 0), simultaneas: true },
  };
}

// --- Transposição -----------------------------------------------------------

const TRANSPOSICOES = [
  { nome: 'uma segunda maior acima', semitons: 2, graus: 1 },
  { nome: 'uma terça maior acima', semitons: 4, graus: 2 },
  { nome: 'uma quarta justa acima', semitons: 5, graus: 3 },
  { nome: 'uma quinta justa acima', semitons: 7, graus: 4 },
];

function buildTransposition(level: Level, draw: Draw): Built {
  const t = draw.pick(level === Level.RECOGNIZE ? TRANSPOSICOES.slice(0, 2) : TRANSPOSICOES);
  const inicio = grauDe('C', 4) + (draw.next() % 5);
  const melodia = [inicio, inicio + 2, inicio + 1].map(notaDoGrau);
  const primeira = melodia[0];

  const letra = primeira[0];
  const oitava = Number(primeira.slice(-1));
  const resposta = soletrarPorGrau(letra, oitava, t.semitons, t.graus)!;
  const certa = nomeDe(resposta);

  /** Distratores: a mesma nota transposta pelas outras distâncias, e a grafia sem a alteração. */
  const outras = TRANSPOSICOES.filter((o) => o !== t)
    .map((o) => soletrarPorGrau(letra, oitava, o.semitons, o.graus))
    .filter((n): n is string => n !== null)
    .map(nomeDe);
  const semAlteracao = NATURAL_NAME_PT[resposta[0]];

  return {
    type: ExerciseType.READ_NOTATION,
    prompt: `Se a melodia escrita for transposta ${t.nome}, que nota passa a ser a primeira?`,
    labels: alternativas(draw, certa, [...outras, semAlteracao, nomeDe(primeira)], choiceCount(level)),
    correctLabel: certa,
    explanation: `A primeira nota é ${nomeDe(primeira)}; ${t.nome} ela vira ${certa}. Transpor é mover tudo pela mesma distância, e as alterações que aparecem são as que a nova tonalidade pede.`,
    figura: { kind: 'STAFF', clef: 'treble', notes: melodia },
  };
}

// --- Notação especial -------------------------------------------------------

const ABREVIATURAS = [
  { sinal: 'D.C. al Fine', sentido: 'voltar ao início e tocar até a palavra Fine' },
  { sinal: 'D.S. al Coda', sentido: 'voltar ao sinal e, na indicação, saltar para a Coda' },
  { sinal: '8va', sentido: 'tocar uma oitava acima do que está escrito' },
  { sinal: 'rit.', sentido: 'ir diminuindo o andamento aos poucos' },
  { sinal: 'a tempo', sentido: 'voltar ao andamento de antes' },
  { sinal: 'simile', sentido: 'continuar tocando do mesmo modo' },
];

function buildSpecialNotation(level: Level, draw: Draw): Built {
  const certa = draw.pick(ABREVIATURAS);
  return {
    type: ExerciseType.READ_NOTATION,
    prompt: 'O que a indicação escrita manda fazer?',
    labels: alternativas(draw, certa.sentido, ABREVIATURAS.map((a) => a.sentido), choiceCount(level)),
    correctLabel: certa.sentido,
    explanation: `A indicação manda ${certa.sentido}. Abreviaturas poupam escrever de novo o que se repete, e por isso se leem como ordem, e não como enfeite.`,
    figura: { kind: 'SINAL', texto: certa.sinal, tipo: 'TERMO' },
  };
}

// --- Acústica: a série harmônica --------------------------------------------

/**
 * Cada harmônico como intervalo SIMPLES mais oitavas inteiras.
 *
 * `soletrarPorGrau` conta a oitava pela letra e de novo pelos semitons, e com
 * intervalo composto contaria duas vezes: o quinto harmônico de mi4 sairia na
 * oitava oito, e não em sol♯6. Os geradores antigos só usavam intervalo
 * simples, e por isso o defeito nunca apareceu.
 */
const HARMONICOS = [
  { n: 2, ordinal: 'segundo', vezes: 'duas', distancia: 'uma oitava', semitons: 0, graus: 0, oitavas: 1 },
  { n: 3, ordinal: 'terceiro', vezes: 'três', distancia: 'uma oitava e uma quinta', semitons: 7, graus: 4, oitavas: 1 },
  { n: 4, ordinal: 'quarto', vezes: 'quatro', distancia: 'duas oitavas', semitons: 0, graus: 0, oitavas: 2 },
  { n: 5, ordinal: 'quinto', vezes: 'cinco', distancia: 'duas oitavas e uma terça maior', semitons: 4, graus: 2, oitavas: 2 },
  { n: 6, ordinal: 'sexto', vezes: 'seis', distancia: 'duas oitavas e uma quinta', semitons: 7, graus: 4, oitavas: 2 },
];

function buildAcoustics(level: Level, draw: Draw): Built {
  const pool = level === Level.RECOGNIZE ? HARMONICOS.slice(0, 3) : HARMONICOS;
  const h = draw.pick(pool);
  const fundamental = draw.pick(['C', 'D', 'E'] as const);
  const grave = `${fundamental}4`;
  const agudo = soletrarPorGrau(fundamental, 4 + h.oitavas, h.semitons, h.graus)!;
  const rotulo = (x: (typeof HARMONICOS)[number]) => `o ${x.ordinal} harmônico`;
  const hzGrave = frequencyOf(grave)!;

  return {
    type: level === Level.EAR ? ExerciseType.IDENTIFY_BY_EAR : ExerciseType.READ_NOTATION,
    prompt:
      level === Level.EAR
        ? 'Ouça a fundamental e depois um dos harmônicos dela. Qual soou?'
        : 'Que harmônico da nota mais grave é a nota mais aguda?',
    labels: alternativas(draw, rotulo(h), pool.map(rotulo), choiceCount(level)),
    correctLabel: rotulo(h),
    explanation: `O ${h.ordinal} harmônico vibra ${h.vezes} vezes mais rápido que a fundamental e soa ${h.distancia} acima dela. A série é a mesma em todo som de altura definida — é dela que vêm a oitava, a quinta e a terça.`,
    audioHz: level === Level.EAR ? [hzGrave, hzGrave * h.n] : undefined,
    audioMode: 'SEQUENCE',
    tonicHz: hzGrave,
    figura: level === Level.EAR ? undefined : { kind: 'STAFF', clef: 'treble', notes: [grave, agudo] },
  };
}


const BUILDERS: Record<Dimension, (level: Level, draw: Draw) => Built> = {
  [Dimension.NOTE]: buildNote,
  [Dimension.CLEF]: buildClef,
  [Dimension.NOTE_VALUE]: buildNoteValue,
  [Dimension.ACCIDENTAL]: buildAccidental,
  [Dimension.INTERVAL]: buildInterval,
  [Dimension.SCALE]: buildScale,
  [Dimension.KEY_SIGNATURE]: buildKeySignature,
  [Dimension.TIME_SIGNATURE]: buildTimeSignature,
  [Dimension.RHYTHM]: buildRhythm,
  [Dimension.TEMPO]: buildTempo,
  [Dimension.DYNAMICS]: buildDynamics,
  [Dimension.EXPRESSION]: buildExpression,
  [Dimension.CHORD]: buildChord,
  [Dimension.HARMONIC_FUNCTION]: buildHarmonicFunction,
  [Dimension.CADENCE]: buildCadence,
  [Dimension.VOICE_LEADING]: buildVoiceLeading,
  [Dimension.ORNAMENT]: buildOrnament,
  [Dimension.MODULATION]: buildModulation,
  [Dimension.TRANSPOSITION]: buildTransposition,
  [Dimension.SPECIAL_NOTATION]: buildSpecialNotation,
  [Dimension.ACOUSTICS]: buildAcoustics,
};

/**
 * 🔴 ONDE O NÍVEL DE OUVIDO NÃO EXISTE, E POR QUÊ.
 *
 * Duas razões diferentes, e a diferença importa:
 *
 *   NÃO SOAM — armadura, valor de figura e clave são convenções de escrita.
 *   "Ouça e diga a clave" é pergunta sem resposta.
 *
 *   O MOTOR NÃO SABE TOCAR — o som do exercício é uma lista de frequências de
 *   mesma duração e mesmo volume. Dinâmica, andamento e ritmo precisam de
 *   volume e de duração; cadência, função e condução precisam de acordes EM
 *   SEQUÊNCIA; compasso precisa de acento. Isso soa na vida real, e aqui
 *   soaria errado. O nível fica fechado, e declarado — até o motor aprender.
 */
const NAO_SOAM: readonly Dimension[] = [Dimension.KEY_SIGNATURE, Dimension.NOTE_VALUE, Dimension.CLEF];
export const OUVIDO_ALEM_DO_MOTOR: readonly Dimension[] = [
  Dimension.TIME_SIGNATURE,
  Dimension.RHYTHM,
  Dimension.TEMPO,
  Dimension.DYNAMICS,
  Dimension.EXPRESSION,
  Dimension.HARMONIC_FUNCTION,
  Dimension.CADENCE,
  Dimension.VOICE_LEADING,
  Dimension.MODULATION,
  Dimension.TRANSPOSITION,
  Dimension.SPECIAL_NOTATION,
];

export function supportsLevel(dimension: Dimension, level: Level): boolean {
  if (!hasGenerator(dimension) || !isRenderable(level)) return false;
  if (level === Level.EAR && (NAO_SOAM.includes(dimension) || OUVIDO_ALEM_DO_MOTOR.includes(dimension))) {
    return false;
  }
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
  const built = BUILDERS[dimension](level, draw);

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
