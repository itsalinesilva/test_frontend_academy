import { Livreto, Avaliacao, montarSimulado, montarProvaFinal } from '../domain/booklet';
import { LIVRETO_TEORIA } from './seed-booklet-theory';
import { LIVRETO_OCIDENTAL } from './seed-booklet-ocidental';
import { LIVRETO_BRASIL } from './seed-booklet-brasil';
import { LIVRETO_VIOLINO } from './seed-booklet-violino';

/**
 * Livretos de fábrica.
 *
 * Cada curso entra aqui quando fica pronto — com o caderno de exercícios
 * escrito junto do conteúdo, não depois. Um livreto inventado antes do curso
 * seria conteúdo de enchimento; um curso sem livreto seria leitura sem
 * fixação.
 */
export const LIVRETOS_PADRAO: Livreto[] = [
  LIVRETO_TEORIA,
  LIVRETO_OCIDENTAL,
  LIVRETO_BRASIL,
  LIVRETO_VIOLINO,
];

/**
 * Simulados e provas, derivados dos livretos.
 *
 * Nenhum dos dois é escrito à mão: os dois **saem** do livreto, que é a fonte
 * única de questões. Consequência prática — corrigir uma questão no livreto
 * corrige o simulado, e a próxima geração da prova já sai correta.
 *
 * A prova é gerada com semente fixa para que a mesma versão do livreto produza
 * sempre a mesma prova. Uma prova que mudasse a cada carregamento não poderia
 * ser conferida por ninguém.
 */
const SEMENTE_POR_CURSO: Record<string, number> = {
  crs_teoria_fundamentos: 1,
  crs_historia_ocidental: 2,
  crs_historia_brasil: 3,
  crs_violino: 4,
};

/** Quantidade de questões da prova, por curso. Proporcional ao livreto. */
function tamanhoDaProva(livreto: Livreto): number {
  const total = livreto.capitulos.reduce((a, c) => a + c.questoes.length, 0);
  // Cerca de um terço do livreto, entre 20 e 40 questões.
  return Math.max(20, Math.min(40, Math.round(total / 3)));
}

export const SIMULADOS_PADRAO: Avaliacao[] = LIVRETOS_PADRAO.map((l) => montarSimulado(l));

export const PROVAS_PADRAO: Avaliacao[] = LIVRETOS_PADRAO.map((l) =>
  montarProvaFinal(l, {
    semente: SEMENTE_POR_CURSO[l.cursoId] ?? 1,
    totalDeQuestoes: tamanhoDaProva(l),
    notaDeCorte: 70,
    tempoLimiteMinutos: 90,
  })
);

export function livretoDoCurso(cursoId: string): Livreto | null {
  return LIVRETOS_PADRAO.find((l) => l.cursoId === cursoId) ?? null;
}

export function provaDoCurso(cursoId: string): Avaliacao | null {
  return PROVAS_PADRAO.find((a) => a.cursoId === cursoId) ?? null;
}

export function simuladoDoCurso(cursoId: string): Avaliacao | null {
  return SIMULADOS_PADRAO.find((a) => a.cursoId === cursoId) ?? null;
}
