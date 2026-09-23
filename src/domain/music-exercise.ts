import { EntityId } from './types';
import { MaterialBand } from './practice-enrollment';

/**
 * EXERCÍCIO MUSICAL — os tipos do laço de prática.
 *
 * A TRADUÇÃO QUE ESTE ARQUIVO REGISTRA
 * ------------------------------------
 * A adaptação de um curso de idioma para música é quase direta, e isso não é
 * coincidência: **notação musical é uma língua escrita, e o ouvido é a escuta
 * dela.** Onde há alfabeto, palavra e frase, a música tem nota, intervalo e
 * progressão.
 *
 *   letra      → nota          pronúncia  → altura tocada
 *   palavra    → intervalo     escrita    → notação na pauta
 *   frase      → progressão    significado→ função harmônica
 *
 * ONDE ISTO VAI ALÉM DA REFERÊNCIA
 * --------------------------------
 * Clicar na alternativa certa prova que a pessoa **reconhece**. Tocar a nota
 * certa prova que ela **sabe**. Um curso de idioma no navegador não tem como
 * medir a segunda coisa; aqui há microfone, detecção de altura por
 * autocorrelação e medição de desvio em cents — e por isso os tipos
 * `TOCAR`, `CANTAR` e `BATER_RITMO` existem desde o primeiro exercício.
 *
 * Mapeamento completo em `docs/parity/VOL2_ASTRA_DUOLINGO.md` §B10.
 */

/**
 * Os tipos de exercício.
 *
 * Os sete primeiros têm equivalente direto na referência; os quatro últimos
 * são da plataforma, e dependem de captura de áudio ou de instrumento.
 */
export enum ExerciseType {
  /** "Qual destas pautas mostra Dó maior?" — reconhecimento visual. */
  READ_NOTATION = 'READ_NOTATION',
  /** Soa um intervalo; escolher o nome. Som → nome. */
  IDENTIFY_BY_EAR = 'IDENTIFY_BY_EAR',
  /** Dado I–IV–V–I em Dó, fazer o mesmo em Sol. Analogia. */
  FOLLOW_THE_PATTERN = 'FOLLOW_THE_PATTERN',
  /** Ouvir e montar na pauta com as notas de um banco. */
  WRITE_ON_STAFF = 'WRITE_ON_STAFF',
  /** Parear cifra ↔ pauta, som ↔ nome, intervalo ↔ distância. */
  MATCH_PAIRS = 'MATCH_PAIRS',
  /** Ditado: só áudio, e escrever o que se ouviu. */
  DICTATION = 'DICTATION',
  /** Escolher a função harmônica: tônica, subdominante, dominante. */
  HARMONIC_FUNCTION = 'HARMONIC_FUNCTION',

  // ── Além da referência: exigem o que a pessoa faz, não o que ela aponta ──
  /** Tocar a resposta no instrumento; o microfone confere a altura. */
  PLAY = 'PLAY',
  /** Solfejar; o afinador mede o desvio em cents. */
  SING = 'SING',
  /** Executar a célula rítmica no andamento; mede-se o desvio em ms. */
  TAP_RHYTHM = 'TAP_RHYTHM',
  /** Apontar a posição no braço do instrumento. */
  POINT_ON_FINGERBOARD = 'POINT_ON_FINGERBOARD',
}

/** Só estes exigem microfone — e a tela precisa saber antes de abrir. */
export const REQUIRES_MICROPHONE: readonly ExerciseType[] = [
  ExerciseType.PLAY,
  ExerciseType.SING,
  ExerciseType.TAP_RHYTHM,
] as const;

export function requiresMicrophone(type: ExerciseType): boolean {
  return REQUIRES_MICROPHONE.includes(type);
}

/**
 * A etiqueta que prepara a atenção.
 *
 * Vem da referência, e é barata de fazer: dizer "conteúdo novo" antes de
 * cobrar muda a disposição de quem responde. `REVISAO` é o caso em que o
 * exercício **volta** dentro da mesma lição, depois de ter sido errado.
 */
export type ExerciseTag =
  | 'NEW_CONTENT'
  | 'NEW_PATTERN'
  | 'PRACTICE'
  | 'REVIEW'
  /** Nivelamento: a pergunta não ensina, ela localiza. Ver `nivelamento.ts`. */
  | 'PLACEMENT';

export const TAG_TEXT: Record<ExerciseTag, string> = {
  NEW_CONTENT: 'Conteúdo novo',
  NEW_PATTERN: 'Padrão novo',
  PRACTICE: 'Prática',
  REVIEW: 'Corrija o erro de antes',
  PLACEMENT: 'Nivelamento',
};

/**
 * 🔴 A FIGURA SOBRE A QUAL SE PERGUNTA.
 *
 * Existe porque sem ela o enunciado precisa **dizer a resposta**. O gerador
 * produzia "Que nota está uma si — qual destas é?", com a resposta dentro do
 * texto, e "Que escala tem os graus 0, 2, 3, 5, 7, 8, 10?", que é consulta a
 * uma tabela e não leitura de música.
 *
 * Perguntar sobre uma pauta desenhada é o que torna a pergunta uma pergunta:
 * a informação está na figura, e lê-la é a competência que se treina.
 *
 * Os dois tipos aqui são os que têm renderizador de verdade — `Staff` e o
 * teclado. Acrescentar um terceiro sem componente que o desenhe produziria
 * exercício que a tela não sabe mostrar, que é o beco que o cabeçalho do
 * gerador promete não criar.
 */
export type ExerciseFigure =
  /** Pauta canônica: a informação está no que está escrito nela. */
  | {
      kind: 'STAFF';
      clef: 'treble' | 'bass' | 'alto';
      /** Notas em notação científica — "C4", "F#5". */
      notes: string[];
      timeSignature?: string;
      /**
       * Notas simultâneas — o acorde. Escrito em fila, ele vira arpejo: a
       * pergunta "que acorde está escrito?" passaria a mostrar uma melodia.
       */
      simultaneas?: boolean;
      /** Legenda. Nunca contém a resposta: ela descreve o que ver, não o que é. */
      caption?: string;
    }
  /** Teclado com teclas em destaque, para o que se lê melhor na tecla. */
  | {
      kind: 'KEYBOARD';
      highlightNotes: string[];
      startOctave?: number;
      octaves?: number;
      caption?: string;
    };

/** Uma alternativa — seja nota, acorde, nome ou pauta. */
export interface Choice {
  id: string;
  /** O que se lê. */
  label: string;
  /**
   * O que se ouve ao tocar nela, em hertz.
   *
   * Na referência, clicar na palavra faz o personagem falá-la. Aqui a
   * alternativa **soa** — e num produto de música isso não é enfeite: é a
   * própria matéria do exercício.
   */
  frequenciesHz?: number[];
  /** Notação a desenhar, quando a alternativa é uma pauta. */
  notas?: string[];
}

export interface MusicExercise {
  id: EntityId;
  type: ExerciseType;
  tag: ExerciseTag;
  /** Faixa de material — governa para quem este exercício aparece. */
  band: MaterialBand;
  /** Uma linha, no imperativo: "Ouça e identifique o intervalo". */
  prompt: string;

  /** O que soa ao abrir o exercício, quando há. */
  audio?: {
    frequenciesHz: number[];
    /** Sequência ou simultâneo — melódico ou harmônico. */
    mode: 'SEQUENCE' | 'CHORD';
    /** Andamento, para células rítmicas. */
    bpm?: number;
  };

  choices: Choice[];
  /** Identificadores das alternativas corretas. Mais de um em `COMBINAR_PARES`. */
  correctIds: string[];
  /** O que o aluno lê depois de responder. É a parte que ensina. */
  explanation: string;

  /**
   * A figura sobre a qual se pergunta, quando há.
   *
   * Opcional porque o exercício de ouvido não precisa dela — ali a informação
   * está no som. Nos de leitura ela é o que impede o enunciado de ter de dizer
   * a resposta.
   */
  figura?: ExerciseFigure;

  /** Tonalidade do exercício — governa o som de acerto. Ver §B10.5. */
  tonicHz?: number;
  /** Tolerância em cents, nos tipos que medem altura. */
  toleranceCents?: number;
  /** Tolerância em milissegundos, nos tipos que medem tempo. */
  toleranceMs?: number;
}

// ---------------------------------------------------------------------------
// O laço da lição
// ---------------------------------------------------------------------------

/**
 * Estado de uma lição em andamento.
 *
 * O que a referência resolve bem, e que este tipo preserva: **o erro não
 * termina a lição**. O exercício errado volta mais tarde, marcado como
 * revisão, e a lição só fecha quando o que se errou foi refeito.
 *
 * Isso não é punição: é repetição espaçada dentro da sessão. O erro vira a
 * matéria da própria lição.
 */
export interface LessonInProgress {
  lessonId: EntityId;
  /** A fila, na ordem em que será apresentada. */
  queue: MusicExercise[];
  /** Posição atual na fila. */
  index: number;
  /** Errados que ainda precisam voltar. */
  toRedo: EntityId[];
  /** Vidas restantes. Zero **não** trava — passa a acumular débito. */
  lives: number;
  /** Acertos seguidos. Governa o combo. */
  streak: number;
  /** Maior sequência da lição. */
  bestStreak: number;
  correct: number;
  wrong: number;
}

export const LIVES_PER_LESSON = 5;

/**
 * A partir de quantos acertos seguidos o combo acende.
 *
 * Na referência, a barra muda de verde para amarelo. Cinco é o ponto em que
 * a sequência deixa de ser sorte.
 */
export const STREAK_FOR_COMBO = 5;

export function startLesson(lessonId: EntityId, queue: MusicExercise[]): LessonInProgress {
  return {
    lessonId,
    queue,
    index: 0,
    toRedo: [],
    lives: LIVES_PER_LESSON,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
  };
}

export function currentExercise(lesson: LessonInProgress): MusicExercise | null {
  return lesson.queue[lesson.index] ?? null;
}

/**
 * Registra a resposta e devolve o estado seguinte.
 *
 * **Função pura.** O estado da lição não é mutado: devolve-se outro. É o que
 * permite testar o laço inteiro sem interface, e o que evita que duas partes
 * da tela discordem sobre quantas vidas restam.
 */
export function answer(
  lesson: LessonInProgress,
  isCorrect: boolean
): LessonInProgress {
  const atual = currentExercise(lesson);
  if (!atual) return lesson;

  if (isCorrect) {
    const streak = lesson.streak + 1;
    return {
      ...lesson,
      index: lesson.index + 1,
      streak,
      bestStreak: Math.max(lesson.bestStreak, streak),
      correct: lesson.correct + 1,
      /**
       * Acertar na revisão tira o exercício da fila de pendências.
       *
       * Sem isto, um exercício errado uma vez voltaria para sempre — e a
       * lição não fecharia nunca.
       */
      toRedo: lesson.toRedo.filter((id) => id !== atual.id),
    };
  }

  return {
    ...lesson,
    index: lesson.index + 1,
    streak: 0,
    wrong: lesson.wrong + 1,
    /** Vidas não ficam negativas: ao chegar a zero, o débito é que acumula. */
    lives: Math.max(0, lesson.lives - 1),
    toRedo: lesson.toRedo.includes(atual.id)
      ? lesson.toRedo
      : [...lesson.toRedo, atual.id],
  };
}

/** Pular não pune, e não entra na contagem de erro — mas também não acerta. */
export function skip(lesson: LessonInProgress): LessonInProgress {
  return { ...lesson, index: lesson.index + 1, streak: 0 };
}

/**
 * Acabou a fila e não há pendência?
 *
 * A lição **não** fecha só por chegar ao fim da fila: se houver exercício
 * errado, ele volta. Ver `prepararRevisao`.
 */
export function isLessonComplete(lesson: LessonInProgress): boolean {
  return lesson.index >= lesson.queue.length && lesson.toRedo.length === 0;
}

/**
 * Enfileira de novo o que foi errado, marcado como revisão.
 *
 * Chamado quando a fila acaba e ainda há pendência. Os exercícios voltam com
 * a etiqueta `REVISAO` — que é o que a referência mostra como "corrija o erro
 * de antes".
 */
export function queueReview(lesson: LessonInProgress): LessonInProgress {
  if (lesson.index < lesson.queue.length || lesson.toRedo.length === 0) return lesson;

  const paraRefazer = lesson.toRedo
    .map((id) => lesson.queue.find((e) => e.id === id))
    .filter((e): e is MusicExercise => e !== undefined)
    .map((e) => ({ ...e, tag: 'REVIEW' as const }));

  return { ...lesson, queue: [...lesson.queue, ...paraRefazer] };
}

/** O combo está aceso? Governa a cor da barra de progresso. */
export function isInCombo(lesson: LessonInProgress): boolean {
  return lesson.streak >= STREAK_FOR_COMBO;
}

/**
 * Quanto da lição já passou, de 0 a 1.
 *
 * Conta sobre a fila **atual**, que cresce quando há revisão. Por isso a
 * barra pode recuar ao entrar em revisão — e isso é honesto: ainda falta.
 */
export function progress(lesson: LessonInProgress): number {
  if (lesson.queue.length === 0) return 1;
  return Math.min(1, lesson.index / lesson.queue.length);
}

/**
 * Precisão da lição.
 *
 * `null` antes da primeira resposta — e `null` é diferente de zero por cento.
 * A tela precisa distinguir "ainda não respondeu" de "errou tudo".
 */
export function accuracy(lesson: LessonInProgress): number | null {
  const respondidas = lesson.correct + lesson.wrong;
  return respondidas === 0 ? null : Math.round((lesson.correct / respondidas) * 100);
}
