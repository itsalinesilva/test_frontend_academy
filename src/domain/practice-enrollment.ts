import { EntityId, ISOTimestamp } from './types';

/**
 * MATRÍCULA NUM PERCURSO DE PRÁTICA.
 *
 * A DECISÃO QUE ESTE ARQUIVO REGISTRA
 * -----------------------------------
 * As lições do Academy e as do Practice são **coisas diferentes**. Há vínculo,
 * e ele não é obrigatório:
 *
 *   *"As lições do curso são umas e as do Practice, outras — outras a mais.
 *   Tem vínculo sim, mas não obrigatório. Practice de história, practice de
 *   teoria, practice violino vão usar o material de base do Academy, mas não
 *   precisa ser restrito. O aluno pode não fazer o Academy e fazer o
 *   Practice; ele precisa apenas indicar isso no formulário de matrícula."*
 *
 * A consequência de projeto é direta: **o mesmo percurso tem lições
 * diferentes conforme o ponto de partida de quem entra.** Quem nunca viu o
 * assunto precisa do que o cursado já sabe; dar o mesmo material aos dois
 * perde os dois.
 *
 * POR QUE ISTO É DOMÍNIO, E NÃO UM CAMPO DE FORMULÁRIO
 * ---------------------------------------------------
 * Porque governa **qual lição aparece**. Se ficasse como uma preferência
 * solta no perfil, cada tela decidiria sozinha o que fazer com ela — e duas
 * telas discordariam sobre o que mostrar à mesma pessoa.
 */

/**
 * De onde a pessoa parte.
 *
 * A escala não é de habilidade genérica: é da **relação com o assunto neste
 * Conservatório**. "Cursei aqui" diz mais sobre o que a pessoa viu do que
 * "sou intermediário", porque o currículo é conhecido.
 */
export enum StartingPoint {
  /** Nunca estudou o assunto. Precisa do vocabulário antes do exercício. */
  NEWCOMER = 'NEWCOMER',
  /** Estudou por conta própria, fora daqui. Sabe-se lá o quê, e em que ordem. */
  SELF_TAUGHT = 'SELF_TAUGHT',
  /** Está cursando o curso correspondente agora. */
  ENROLLED = 'ENROLLED',
  /** Concluiu o curso correspondente. */
  COMPLETED_COURSE = 'COMPLETED_COURSE',
  /** Formação anterior no assunto, fora do Conservatório. */
  TRAINED_ELSEWHERE = 'TRAINED_ELSEWHERE',
}

export const STARTING_POINT_NAME: Record<StartingPoint, string> = {
  [StartingPoint.NEWCOMER]: 'Nunca estudei o assunto',
  [StartingPoint.SELF_TAUGHT]: 'Estudei por conta própria',
  [StartingPoint.ENROLLED]: 'Estou fazendo o curso aqui',
  [StartingPoint.COMPLETED_COURSE]: 'Concluí o curso aqui',
  [StartingPoint.TRAINED_ELSEWHERE]: 'Tenho formação no assunto',
};

/** O que cada opção significa, para a pessoa escolher sem adivinhar. */
export const STARTING_POINT_EXPLANATION: Record<StartingPoint, string> = {
  [StartingPoint.NEWCOMER]:
    'O percurso começa pelo vocabulário: cada termo é apresentado antes de ser cobrado.',
  [StartingPoint.SELF_TAUGHT]:
    'O percurso começa por uma sondagem, para achar o que você já sabe e o que ficou pelo caminho.',
  [StartingPoint.ENROLLED]:
    'Os exercícios acompanham o capítulo em que você está no curso, e não se adiantam a ele.',
  [StartingPoint.COMPLETED_COURSE]:
    'O percurso parte do que o curso cobriu e vai adiante — com o que o curso não alcança.',
  [StartingPoint.TRAINED_ELSEWHERE]:
    'O percurso começa por uma sondagem ampla e libera o material avançado desde o início.',
};

/**
 * Ritmo de desbloqueio.
 *
 * Vem da paridade com o Astra Trainer, e é pergunta diferente do ponto de
 * partida: aquela é *de onde parto*, esta é *como avanço*.
 */
export enum PathPace {
  /** Uma etapa por vez. A seguinte só abre quando a anterior fecha. */
  STEP_BY_STEP = 'STEP_BY_STEP',
  /** Tudo aberto desde o começo. */
  FREE = 'FREE',
}

export const PACE_NAME: Record<PathPace, string> = {
  [PathPace.STEP_BY_STEP]: 'Passo a passo',
  [PathPace.FREE]: 'Livre',
};

export const PACE_EXPLANATION: Record<PathPace, string> = {
  [PathPace.STEP_BY_STEP]:
    'Cada etapa abre quando a anterior fecha, construindo base antes de avançar.',
  [PathPace.FREE]: 'Tudo disponível desde o começo, para explorar na ordem que quiser.',
};

export interface PathEnrollment {
  id: EntityId;
  userId: EntityId;
  /** O percurso de prática: teoria, história, violino. */
  pathId: EntityId;
  startingPoint: StartingPoint;
  ritmo: PathPace;
  /**
   * Curso do Academy correspondente, quando houver.
   *
   * **Opcional por projeto.** Quem faz o Practice de história sem fazer o
   * curso de história é um caso previsto, não uma exceção a tolerar.
   */
  linkedCourseId?: EntityId;
  enrolledAt: ISOTimestamp;
  updatedAtIso: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// O que o ponto de partida decide
// ---------------------------------------------------------------------------

/**
 * Faixa de material que a matrícula abre.
 *
 * Uma lição declara a que faixas serve. A mesma lição pode servir a mais de
 * uma — e boa parte serve —, mas as de vocabulário não interessam a quem
 * cursou, e as avançadas não alcançam quem nunca viu o assunto.
 */
export type MaterialBand = 'VOCABULARY' | 'FOUNDATION' | 'APPLICATION' | 'ADVANCED';

export const BANDS_BY_STARTING_POINT: Record<StartingPoint, MaterialBand[]> = {
  [StartingPoint.NEWCOMER]: ['VOCABULARY', 'FOUNDATION'],
  [StartingPoint.SELF_TAUGHT]: ['VOCABULARY', 'FOUNDATION', 'APPLICATION'],
  [StartingPoint.ENROLLED]: ['FOUNDATION', 'APPLICATION'],
  [StartingPoint.COMPLETED_COURSE]: ['APPLICATION', 'ADVANCED'],
  [StartingPoint.TRAINED_ELSEWHERE]: ['FOUNDATION', 'APPLICATION', 'ADVANCED'],
};

/** A matrícula alcança esta faixa de material? */
/**
 * O nome que a pessoa lê.
 *
 * O identificador é inglês, como todo o código; o rótulo é português, como
 * toda a interface. Mostrar a constante crua na tela — `vocabulary` — foi o
 * que aconteceu quando as duas coisas eram a mesma.
 */
export const MATERIAL_BAND_LABEL: Record<MaterialBand, string> = {
  VOCABULARY: 'vocabulário',
  FOUNDATION: 'fundamento',
  APPLICATION: 'aplicação',
  ADVANCED: 'avançado',
};

export function reaches(matricula: PathEnrollment, faixa: MaterialBand): boolean {
  return BANDS_BY_STARTING_POINT[matricula.startingPoint].includes(faixa);
}

/**
 * A matrícula exige sondagem antes de começar?
 *
 * Quem estudou fora chega com lacunas que ninguém conhece — nem a plataforma,
 * nem, muitas vezes, a própria pessoa. Começar pelo capítulo um seria perder
 * quem já sabe; começar pelo fim seria perder quem não sabe. A sondagem
 * resolve, e só faz sentido para quem veio de fora.
 */
export function needsPlacement(matricula: PathEnrollment): boolean {
  return (
    matricula.startingPoint === StartingPoint.SELF_TAUGHT ||
    matricula.startingPoint === StartingPoint.TRAINED_ELSEWHERE
  );
}

/**
 * O percurso acompanha o curso, sem se adiantar a ele?
 *
 * Só para quem está cursando **agora**. Exercitar o capítulo 12 enquanto se
 * lê o 5 não é desafio: é cobrar o que ainda não foi ensinado.
 */
export function followsCourse(matricula: PathEnrollment): boolean {
  return (
    matricula.startingPoint === StartingPoint.ENROLLED &&
    matricula.linkedCourseId !== undefined
  );
}

export function createEnrollment(dados: {
  userId: EntityId;
  pathId: EntityId;
  startingPoint: StartingPoint;
  ritmo: PathPace;
  linkedCourseId?: EntityId;
}): PathEnrollment {
  const agora = new Date().toISOString();
  return {
    id: `mat_${dados.pathId}_${dados.userId}`,
    userId: dados.userId,
    pathId: dados.pathId,
    startingPoint: dados.startingPoint,
    ritmo: dados.ritmo,
    linkedCourseId: dados.linkedCourseId,
    enrolledAt: agora,
    updatedAtIso: agora,
  };
}
