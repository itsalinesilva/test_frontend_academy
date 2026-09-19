/**
 * Missões diárias.
 *
 * Três por dia, sorteadas de uma lista fixa, com prazo até a virada do dia.
 * A regra está em `76_PROGRESS_ECONOMY.md` §4, e os valores daqui são os
 * de lá — `scripts/qa/economia.mjs` falha se divergirem.
 *
 * O SORTEIO É DETERMINÍSTICO
 * --------------------------
 * A semente é a pessoa mais o dia. A mesma pessoa vê as mesmas três missões o
 * dia inteiro, em qualquer aparelho, sem nada ser guardado — e no dia
 * seguinte vê outras três. Sortear a cada abertura faria a missão trocar
 * enquanto a pessoa a cumpre, que é a pior falha possível aqui: ela teria
 * feito o trabalho e não receberia o crédito.
 *
 * NÃO EXISTE "MAIS MISSÕES EM BREVE"
 * ----------------------------------
 * Ou a missão existe, ou não aparece. Promessa de funcionalidade futura na
 * tela é antipadrão — ver `73_ANTIPATTERNS.md`.
 */

import { XP } from './progress-economy';

export type MissionCondition =
  | { tipo: 'XP_TODAY'; quanto: number }
  | { tipo: 'EAR_TRAINING_CORRECT'; quanto: number }
  | { tipo: 'FLAWLESS_ROUND' }
  | { tipo: 'NEW_WORK_OPENED' }
  | { tipo: 'LESSON_COMPLETED'; quanto: number }
  | { tipo: 'TWO_PERIODS_OF_DAY' };

export interface Mission {
  id: string;
  titulo: string;
  /** O que precisa acontecer, escrito para a pessoa. */
  descricao: string;
  condicao: MissionCondition;
  xp: number;
}

/** A lista fixa da qual se sorteia. §4 da economia de progresso. */
export const AVAILABLE_MISSIONS: readonly Mission[] = [
  {
    id: 'aquecimento',
    titulo: 'Aquecimento',
    descricao: 'Some 10 de experiência em qualquer atividade.',
    condicao: { tipo: 'XP_TODAY', quanto: 10 },
    xp: XP.DAILY_MISSION,
  },
  {
    id: 'ouvido_atento',
    titulo: 'Ouvido atento',
    descricao: 'Acerte 5 exercícios de percepção.',
    condicao: { tipo: 'EAR_TRAINING_CORRECT', quanto: 5 },
    xp: XP.DAILY_MISSION,
  },
  {
    id: 'sem_tropeco',
    titulo: 'Sem tropeço',
    descricao: 'Termine uma rodada inteira sem errar.',
    condicao: { tipo: 'FLAWLESS_ROUND' },
    xp: XP.DAILY_MISSION_MAJOR,
  },
  {
    id: 'visita_ao_atlas',
    titulo: 'Visita ao Atlas',
    descricao: 'Abra uma obra que você nunca abriu.',
    condicao: { tipo: 'NEW_WORK_OPENED' },
    xp: XP.DAILY_MISSION,
  },
  {
    id: 'leitura_do_dia',
    titulo: 'Leitura do dia',
    descricao: 'Conclua uma lição do Academy.',
    condicao: { tipo: 'LESSON_COMPLETED', quanto: 1 },
    xp: XP.DAILY_MISSION,
  },
  {
    id: 'constancia',
    titulo: 'Constância',
    descricao: 'Pratique em dois períodos diferentes do dia.',
    condicao: { tipo: 'TWO_PERIODS_OF_DAY' },
    xp: XP.DAILY_MISSION_MAJOR,
  },
] as const;

export const MISSIONS_PER_DAY = 3;

/**
 * O progresso de uma missão hoje.
 *
 * `alvo` é 1 para as missões que não se contam — e a tela não deve desenhar
 * barra para elas: "0 de 1" não informa mais que "não cumprida".
 */
export interface MissionProgress {
  missao: Mission;
  feito: number;
  alvo: number;
  cumprida: boolean;
}

/** O que aconteceu hoje, do lado de fora. */
export interface DailyActivity {
  xpToday: number;
  earTrainingCorrect: number;
  flawlessRounds: number;
  newWorksOpened: number;
  lessonsCompleted: number;
  /** Quantos períodos distintos do dia tiveram prática: manhã, tarde, noite. */
  periodsPracticed: number;
}

export const EMPTY_ACTIVITY: DailyActivity = {
  xpToday: 0,
  earTrainingCorrect: 0,
  flawlessRounds: 0,
  newWorksOpened: 0,
  lessonsCompleted: 0,
  periodsPracticed: 0,
};

/**
 * Mistura de Knuth.
 *
 * Sementes vizinhas — e os dias são vizinhos — produzem primeiros valores
 * quase iguais num gerador linear simples. Sem esta mistura, dois dias
 * seguidos sorteariam quase sempre as mesmas missões.
 */
function embaralhar(semente: number): number {
  return Math.imul(semente, 2654435761) >>> 0;
}

function proximo(estado: number): number {
  return (Math.imul(estado, 1103515245) + 12345) >>> 0;
}

/** Texto `AAAA-MM-DD` no fuso do aparelho — o mesmo critério da ofensiva. */
export function dayOf(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function sementeDe(userId: string, dia: string): number {
  let h = 0;
  for (const c of `${userId}|${dia}`) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return embaralhar(h);
}

/**
 * As três missões de alguém, num dia.
 *
 * Sorteio sem reposição: três missões diferentes, sempre. Repetir "Aquecimento"
 * duas vezes no mesmo dia daria duas recompensas pelo mesmo trabalho.
 */
export function missionsOfTheDay(userId: string, data: Date = new Date()): Mission[] {
  const disponiveis = [...AVAILABLE_MISSIONS];
  const escolhidas: Mission[] = [];
  let estado = sementeDe(userId, dayOf(data));

  const quantas = Math.min(MISSIONS_PER_DAY, disponiveis.length);
  for (let i = 0; i < quantas; i++) {
    estado = proximo(estado);
    const indice = estado % disponiveis.length;
    escolhidas.push(disponiveis.splice(indice, 1)[0]);
  }
  return escolhidas;
}

/** Quanto já se fez de cada missão, dado o que aconteceu hoje. */
export function missionProgress(
  missoes: readonly Mission[],
  atividade: DailyActivity
): MissionProgress[] {
  return missoes.map((missao) => {
    const { feito, alvo } = medir(missao.condicao, atividade);
    return { missao, feito: Math.min(feito, alvo), alvo, cumprida: feito >= alvo };
  });
}

function medir(
  condicao: MissionCondition,
  a: DailyActivity
): { feito: number; alvo: number } {
  switch (condicao.tipo) {
    case 'XP_TODAY':
      return { feito: a.xpToday, alvo: condicao.quanto };
    case 'EAR_TRAINING_CORRECT':
      return { feito: a.earTrainingCorrect, alvo: condicao.quanto };
    case 'FLAWLESS_ROUND':
      return { feito: a.flawlessRounds, alvo: 1 };
    case 'NEW_WORK_OPENED':
      return { feito: a.newWorksOpened, alvo: 1 };
    case 'LESSON_COMPLETED':
      return { feito: a.lessonsCompleted, alvo: condicao.quanto };
    case 'TWO_PERIODS_OF_DAY':
      return { feito: a.periodsPracticed, alvo: 2 };
  }
}

/** Missão de contagem merece barra; missão de sim-ou-não, não. */
export function hasProgressBar(p: MissionProgress): boolean {
  return p.alvo > 1;
}

/** Quanto falta para a virada do dia, já escrito. */
export function missionDeadline(agora: Date = new Date()): string {
  const horas = 23 - agora.getHours();
  const minutos = 59 - agora.getMinutes();

  if (horas === 0) return `${minutos} min`;
  return minutos >= 30 ? `${horas}h${minutos}` : `${horas}h`;
}
