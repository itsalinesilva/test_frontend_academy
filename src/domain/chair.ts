import { EntityId } from './types';

/**
 * CADEIRA — o campo de estudo, acima do curso.
 *
 * O QUE ESTAVA ERRADO
 * -------------------
 * O Grêmio nascia **por curso**: `guildIdForCourse(courseId)`. Com cinco
 * cursos, cinco Grêmios. Parece inofensivo até olhar quais são os cinco:
 *
 *   História da Música Ocidental
 *   História da Música Brasileira
 *   História Social da Música Popular Brasileira
 *   Teoria da Música
 *   Violino
 *
 * Três deles são história. Um Grêmio por curso partia os historiadores em
 * três, e quebrava a regra que o próprio documento institucional enuncia:
 * quem discute repertório barroco num Clube já deve estar no Grêmio daquela
 * área. Com o recorte por curso, quem cursou História Ocidental e quem cursou
 * História Brasileira não se encontravam em Grêmio nenhum.
 *
 * O recorte certo é a **cadeira**: o campo de estudo. Três cadeiras hoje —
 * Teoria, História e Violino — e cinco cursos distribuídos entre elas. Curso
 * novo de história entra na cadeira que já existe, e o Grêmio não se
 * multiplica.
 *
 * O QUE A CADEIRA NÃO É
 * ---------------------
 * Não é disciplina, que é unidade dentro de um curso. Não é Casa, que é
 * pertencimento prático e nasce do treino, não da matrícula. A cadeira é
 * acadêmica: é o que dá nome ao Grêmio e o que agrupa cursos irmãos.
 *
 * Ver `docs/harness/80_INSTITUTIONAL_ARCHITECTURE.md` §5.
 */

export enum ChairId {
  TEORIA = 'cad_teoria',
  HISTORIA = 'cad_historia',
  VIOLINO = 'cad_violino',
}

export interface Chair {
  id: ChairId;
  name: string;
  /** Como o Grêmio daquela cadeira se chama para quem pertence a ele. */
  guildName: string;
  description: string;
}

export const CHAIRS: readonly Chair[] = [
  {
    id: ChairId.TEORIA,
    name: 'Teoria da Música',
    guildName: 'Grêmio de Teoria',
    description:
      'A gramática do som: altura, duração, intervalo, escala, acorde, forma. É a cadeira que sustenta todas as outras, porque é dela que vem o vocabulário com que as demais falam.',
  },
  {
    id: ChairId.HISTORIA,
    name: 'História da Música',
    guildName: 'Grêmio de História',
    description:
      'Como o modo de organizar o som mudou, e por que mudou. Reúne os percursos ocidental, brasileiro e da música popular — eixos de método diferentes, mesma cadeira.',
  },
  {
    id: ChairId.VIOLINO,
    name: 'Violino',
    guildName: 'Grêmio de Violino',
    description:
      'O instrumento: arco, mão esquerda, afinação, repertório. Primeira cadeira de instrumento, e a única que hoje chega ao Laboratório com corpus próprio.',
  },
];

/**
 * A qual cadeira cada curso pertence.
 *
 * O mapa é **explícito e total**: curso que não estiver aqui não tem Grêmio, e
 * é isso que `checkCourseHasChair` recusa. Derivar a cadeira do nome do curso
 * funcionaria hoje e quebraria no primeiro curso com nome fora do padrão —
 * exatamente o tipo de adivinhação que o projeto não aceita em lugar nenhum.
 */
export const CHAIR_OF_COURSE: Readonly<Record<string, ChairId>> = {
  crs_teoria_fundamentos: ChairId.TEORIA,
  crs_historia_ocidental: ChairId.HISTORIA,
  crs_historia_brasil: ChairId.HISTORIA,
  crs_historia_social_popular: ChairId.HISTORIA,
  crs_violino: ChairId.VIOLINO,
};

/** A cadeira de um curso, ou `null` se ele ainda não foi atribuído a uma. */
export function chairOfCourse(courseId: EntityId): ChairId | null {
  return CHAIR_OF_COURSE[courseId] ?? null;
}

export function chairById(id: ChairId): Chair | undefined {
  return CHAIRS.find((c) => c.id === id);
}

/** Os cursos de uma cadeira. Três, no caso de História; um, nas demais. */
export function coursesOfChair(chair: ChairId): EntityId[] {
  return Object.entries(CHAIR_OF_COURSE)
    .filter(([, c]) => c === chair)
    .map(([curso]) => curso);
}
