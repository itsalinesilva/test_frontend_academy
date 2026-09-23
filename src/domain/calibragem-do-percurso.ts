import { Dimension } from './music-grammar';
import { Level } from './exercise-generator';

/**
 * 🔴 O PERCURSO OUVE O "MUITO FÁCIL / MUITO DIFÍCIL" (L-7).
 *
 * A tela de exercício sempre soube perguntar, e diz, depois do clique,
 * "Anotado — o percurso se ajusta a isso". O repositório gravava — e nada lia
 * o que ele gravou. A frase era promessa sem ninguém do outro lado.
 *
 * A REGRA, e por que é esta
 * -------------------------
 * Numa seção em que a pessoa achou mais exercícios fáceis que difíceis, a
 * próxima lição daquela seção sobe de RECONHECER para NOMEAR: mais
 * alternativas, e a clave deixa de ser sempre a de sol. Empate ou maioria
 * difícil fica em RECONHECER, que é o chão — não existe nível abaixo dele
 * para onde descer.
 *
 * Conta-se por SEÇÃO, e não no geral: achar ritmo fácil não diz nada sobre
 * harmonia.
 */

export interface VereditoDeDificuldade {
  exerciseId: string;
  verdict: 'EASY' | 'HARD' | 'REPORTED';
}

/** A seção de um exercício gerado: o id é `gen_<DIMENSÃO>_<nível>_<semente>`. */
export function dimensaoDoExercicio(exerciseId: string): Dimension | null {
  const m = /^gen_([A-Z_]+)_\d+_\d+$/.exec(exerciseId);
  if (!m) return null;
  return (Object.values(Dimension) as string[]).includes(m[1]) ? (m[1] as Dimension) : null;
}

export function nivelDaProximaLicao(
  dimension: Dimension,
  vereditos: readonly VereditoDeDificuldade[]
): Level {
  let faceis = 0;
  let dificeis = 0;
  for (const v of vereditos) {
    if (dimensaoDoExercicio(v.exerciseId) !== dimension) continue;
    if (v.verdict === 'EASY') faceis++;
    if (v.verdict === 'HARD') dificeis++;
  }
  return faceis > dificeis ? Level.NAME : Level.RECOGNIZE;
}
