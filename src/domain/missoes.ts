/**
 * Missões diárias.
 *
 * Três por dia, sorteadas de uma lista fixa, com prazo até a virada do dia.
 * A regra está em `76_ECONOMIA_DE_PROGRESSO.md` §4, e os valores daqui são os
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
 * tela é antipadrão — ver `73_ANTIPADROES.md`.
 */

import { XP } from './economia-de-progresso';

export type CondicaoDaMissao =
  | { tipo: 'XP_NO_DIA'; quanto: number }
  | { tipo: 'ACERTOS_DE_PERCEPCAO'; quanto: number }
  | { tipo: 'RODADA_SEM_ERRO' }
  | { tipo: 'OBRA_NOVA_ABERTA' }
  | { tipo: 'LICAO_CONCLUIDA'; quanto: number }
  | { tipo: 'DOIS_PERIODOS_DO_DIA' };

export interface Missao {
  id: string;
  titulo: string;
  /** O que precisa acontecer, escrito para a pessoa. */
  descricao: string;
  condicao: CondicaoDaMissao;
  xp: number;
}

/** A lista fixa da qual se sorteia. §4 da economia de progresso. */
export const MISSOES_POSSIVEIS: readonly Missao[] = [
  {
    id: 'aquecimento',
    titulo: 'Aquecimento',
    descricao: 'Some 10 de experiência em qualquer atividade.',
    condicao: { tipo: 'XP_NO_DIA', quanto: 10 },
    xp: XP.MISSAO_DIARIA,
  },
  {
    id: 'ouvido_atento',
    titulo: 'Ouvido atento',
    descricao: 'Acerte 5 exercícios de percepção.',
    condicao: { tipo: 'ACERTOS_DE_PERCEPCAO', quanto: 5 },
    xp: XP.MISSAO_DIARIA,
  },
  {
    id: 'sem_tropeco',
    titulo: 'Sem tropeço',
    descricao: 'Termine uma rodada inteira sem errar.',
    condicao: { tipo: 'RODADA_SEM_ERRO' },
    xp: XP.MISSAO_DIARIA_MAIOR,
  },
  {
    id: 'visita_ao_atlas',
    titulo: 'Visita ao Atlas',
    descricao: 'Abra uma obra que você nunca abriu.',
    condicao: { tipo: 'OBRA_NOVA_ABERTA' },
    xp: XP.MISSAO_DIARIA,
  },
  {
    id: 'leitura_do_dia',
    titulo: 'Leitura do dia',
    descricao: 'Conclua uma lição do Academy.',
    condicao: { tipo: 'LICAO_CONCLUIDA', quanto: 1 },
    xp: XP.MISSAO_DIARIA,
  },
  {
    id: 'constancia',
    titulo: 'Constância',
    descricao: 'Pratique em dois períodos diferentes do dia.',
    condicao: { tipo: 'DOIS_PERIODOS_DO_DIA' },
    xp: XP.MISSAO_DIARIA_MAIOR,
  },
] as const;

export const MISSOES_POR_DIA = 3;

/**
 * O progresso de uma missão hoje.
 *
 * `alvo` é 1 para as missões que não se contam — e a tela não deve desenhar
 * barra para elas: "0 de 1" não informa mais que "não cumprida".
 */
export interface ProgressoDaMissao {
  missao: Missao;
  feito: number;
  alvo: number;
  cumprida: boolean;
}

/** O que aconteceu hoje, do lado de fora. */
export interface AtividadeDoDia {
  xpNoDia: number;
  acertosDePercepcao: number;
  rodadasSemErro: number;
  obrasNovasAbertas: number;
  licoesConcluidas: number;
  /** Quantos períodos distintos do dia tiveram prática: manhã, tarde, noite. */
  periodosComPratica: number;
}

export const ATIVIDADE_VAZIA: AtividadeDoDia = {
  xpNoDia: 0,
  acertosDePercepcao: 0,
  rodadasSemErro: 0,
  obrasNovasAbertas: 0,
  licoesConcluidas: 0,
  periodosComPratica: 0,
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
export function diaDe(data: Date): string {
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
export function missoesDoDia(userId: string, data: Date = new Date()): Missao[] {
  const disponiveis = [...MISSOES_POSSIVEIS];
  const escolhidas: Missao[] = [];
  let estado = sementeDe(userId, diaDe(data));

  const quantas = Math.min(MISSOES_POR_DIA, disponiveis.length);
  for (let i = 0; i < quantas; i++) {
    estado = proximo(estado);
    const indice = estado % disponiveis.length;
    escolhidas.push(disponiveis.splice(indice, 1)[0]);
  }
  return escolhidas;
}

/** Quanto já se fez de cada missão, dado o que aconteceu hoje. */
export function progressoDasMissoes(
  missoes: readonly Missao[],
  atividade: AtividadeDoDia
): ProgressoDaMissao[] {
  return missoes.map((missao) => {
    const { feito, alvo } = medir(missao.condicao, atividade);
    return { missao, feito: Math.min(feito, alvo), alvo, cumprida: feito >= alvo };
  });
}

function medir(
  condicao: CondicaoDaMissao,
  a: AtividadeDoDia
): { feito: number; alvo: number } {
  switch (condicao.tipo) {
    case 'XP_NO_DIA':
      return { feito: a.xpNoDia, alvo: condicao.quanto };
    case 'ACERTOS_DE_PERCEPCAO':
      return { feito: a.acertosDePercepcao, alvo: condicao.quanto };
    case 'RODADA_SEM_ERRO':
      return { feito: a.rodadasSemErro, alvo: 1 };
    case 'OBRA_NOVA_ABERTA':
      return { feito: a.obrasNovasAbertas, alvo: 1 };
    case 'LICAO_CONCLUIDA':
      return { feito: a.licoesConcluidas, alvo: condicao.quanto };
    case 'DOIS_PERIODOS_DO_DIA':
      return { feito: a.periodosComPratica, alvo: 2 };
  }
}

/** Missão de contagem merece barra; missão de sim-ou-não, não. */
export function temBarra(p: ProgressoDaMissao): boolean {
  return p.alvo > 1;
}

/** Quanto falta para a virada do dia, já escrito. */
export function prazoDaMissao(agora: Date = new Date()): string {
  const horas = 23 - agora.getHours();
  const minutos = 59 - agora.getMinutes();

  if (horas === 0) return `${minutos} min`;
  return minutos >= 30 ? `${horas}h${minutos}` : `${horas}h`;
}
