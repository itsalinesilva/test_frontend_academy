/**
 * DA FAIXA À PARTITURA.
 *
 * A tela de partitura do Estúdio mostrava sempre o mesmo exemplo fixo, e o
 * botão "Abrir na partitura" da ficha da obra levava a ela sem levar a obra
 * (RT-3). Aqui a escrita de uma transcrição vira compassos. Qual faixa é de
 * qual obra, quem responde é o serviço do Acervo — o domínio não lê dados.
 */

/** O que a partitura precisa de uma faixa: a escrita e a fórmula. */
export interface EscritaDaFaixa {
  /** [nome da nota, tempos]; `_` é pausa. */
  escrita: [string, number][];
  compasso: string;
}

export interface NotaDoCompasso {
  /** "C4", "Bb3" — ou `null` para pausa. */
  nome: string | null;
  tempos: number;
}

export interface CompassoDaPartitura {
  numero: number;
  notas: NotaDoCompasso[];
}

/** Tempos por compasso, em semínimas: 6/8 são três, e não seis. */
export function temposDoCompasso(formula: string): number {
  const [n, d] = formula.split('/').map(Number);
  if (!n || !d) return 4;
  return (n * 4) / d;
}

/**
 * Agrupa a escrita da faixa em compassos pela fórmula dela.
 *
 * LIMITE DECLARADO: nota que atravessa a barra fica inteira no compasso em
 * que começa — a ligadura não é desenhada. O compasso sai com mais tempos que
 * a fórmula, e `compassosQueTransbordam` diz quais, para a tela avisar em vez
 * de fingir.
 */
export function compassosDaFaixa(faixa: EscritaDaFaixa): CompassoDaPartitura[] {
  const porCompasso = temposDoCompasso(faixa.compasso);
  const compassos: CompassoDaPartitura[] = [];
  let atual: NotaDoCompasso[] = [];
  let soma = 0;

  for (const [nome, tempos] of faixa.escrita) {
    atual.push({ nome: nome === '_' ? null : nome, tempos });
    soma += tempos;
    if (soma >= porCompasso - 1e-9) {
      compassos.push({ numero: compassos.length + 1, notas: atual });
      atual = [];
      soma = 0;
    }
  }
  if (atual.length > 0) compassos.push({ numero: compassos.length + 1, notas: atual });
  return compassos;
}

export function compassosQueTransbordam(
  compassos: CompassoDaPartitura[],
  formula: string
): number[] {
  const porCompasso = temposDoCompasso(formula);
  return compassos
    .filter((c) => c.notas.reduce((a, n) => a + n.tempos, 0) > porCompasso + 1e-9)
    .map((c) => c.numero);
}
