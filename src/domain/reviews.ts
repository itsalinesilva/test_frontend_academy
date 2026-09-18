/**
 * Avaliações de curso feitas por alunos.
 *
 * A PLATAFORMA NÃO SEMEIA AVALIAÇÃO
 * ---------------------------------
 * Este módulo define a estrutura e o cálculo. Não existe seed de avaliações,
 * e não existirá: nota de curso sem alunos é propaganda, não informação.
 *
 * Enquanto não houver avaliação real, a tela mostra que não há — o que é uma
 * informação verdadeira e útil para um catálogo novo.
 */

export type Estrelas = 1 | 2 | 3 | 4 | 5;

export interface AvaliacaoDeCurso {
  id: string;
  courseId: string;
  userId: string;
  /** Nome exibido. O aluno decide se aparece; anônimo é permitido. */
  autor: string;
  anonima: boolean;
  estrelas: Estrelas;
  comentario: string;
  criadaEm: string;
  /** Só avalia quem concluiu. Guardado para poder exibir o selo. */
  concluiuOCurso: boolean;
}

export interface ResumoDeAvaliacoes {
  total: number;
  /** `null` quando não há avaliação — e não 0, que significaria nota mínima. */
  media: number | null;
  /** Quantas avaliações em cada faixa, de 5 a 1 estrelas. */
  distribuicao: Record<Estrelas, number>;
}

export function resumirAvaliacoes(avaliacoes: AvaliacaoDeCurso[]): ResumoDeAvaliacoes {
  const distribuicao: Record<Estrelas, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const a of avaliacoes) distribuicao[a.estrelas] += 1;

  if (avaliacoes.length === 0) {
    return { total: 0, media: null, distribuicao };
  }

  const soma = avaliacoes.reduce((acc, a) => acc + a.estrelas, 0);
  return {
    total: avaliacoes.length,
    media: Math.round((soma / avaliacoes.length) * 10) / 10,
    distribuicao,
  };
}

/** Percentual de cada faixa, para a barra de distribuição. Zero sem avaliações. */
export function percentuais(resumo: ResumoDeAvaliacoes): Record<Estrelas, number> {
  const p: Record<Estrelas, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (resumo.total === 0) return p;
  for (const k of [1, 2, 3, 4, 5] as Estrelas[]) {
    p[k] = Math.round((resumo.distribuicao[k] / resumo.total) * 100);
  }
  return p;
}

/** Quem não concluiu não avalia: a nota descreve a experiência inteira. */
export function podeAvaliar(concluiuOCurso: boolean, jaAvaliou: boolean): boolean {
  return concluiuOCurso && !jaAvaliou;
}

export function nomeExibido(a: AvaliacaoDeCurso): string {
  return a.anonima ? 'Aluno do Conservatório' : a.autor;
}
