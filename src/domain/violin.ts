import { frequenciaDaNota, notaMaisProxima } from './practice-measurement';

/**
 * Mapeamento do braço do violino.
 *
 * POR QUE ISTO É DOMÍNIO E NÃO DESENHO
 * ------------------------------------
 * A posição de um dedo no braço não é uma escolha estética: é uma
 * consequência física do comprimento da corda. Colocar os dedos em
 * intervalos iguais — o erro comum de quem desenha um braço "de olho" —
 * produz um diagrama que ensina a tocar desafinado, porque no violino não há
 * trastes para corrigir.
 *
 * Daí a posição vir de cálculo: para subir `n` semitons numa corda solta, o
 * dedo pisa à fração `1 − 2^(−n/12)` do comprimento. As distâncias diminuem
 * conforme se sobe — e é exatamente isso que o aluno precisa ver.
 */

// ---------------------------------------------------------------------------
// Cordas
// ---------------------------------------------------------------------------

export type IndiceCorda = 0 | 1 | 2 | 3;

export interface Corda {
  indice: IndiceCorda;
  /** Nota da corda solta. */
  solta: string;
  nome: string;
  /** Nome pelo qual a corda é chamada em aula. */
  apelido: string;
}

/**
 * Afinação padrão: quintas justas a partir do Sol.
 *
 * A ordem aqui é a do INSTRUMENTO visto pelo instrumentista — Sol à
 * esquerda, Mi à direita. É a mesma ordem do diagrama, para que índice e
 * posição visual nunca precisem ser convertidos um no outro.
 */
export const CORDAS: readonly Corda[] = [
  { indice: 0, solta: 'G3', nome: 'Sol', apelido: 'corda Sol (mais grave)' },
  { indice: 1, solta: 'D4', nome: 'Ré', apelido: 'corda Ré' },
  { indice: 2, solta: 'A4', nome: 'Lá', apelido: 'corda Lá' },
  { indice: 3, solta: 'E5', nome: 'Mi', apelido: 'corda Mi (mais aguda)' },
];

/** Semitom mais agudo alcançável em primeira posição com o 4º dedo. */
const ALCANCE_PRIMEIRA_POSICAO = 7;

// ---------------------------------------------------------------------------
// Dedos
// ---------------------------------------------------------------------------

export type Dedo = 0 | 1 | 2 | 3 | 4;

/**
 * Dedo que toca um dado número de semitons acima da corda solta.
 *
 * Os "dedos baixos" e "altos" são reais e importam: o 2º dedo baixo (3
 * semitons) e o alto (4) são fisicamente o mesmo dedo em lugares diferentes,
 * e confundi-los é a origem de boa parte da desafinação de iniciante. Por
 * isso a variante é devolvida, e não apagada.
 */
export interface Digitacao {
  dedo: Dedo;
  variante: 'baixo' | 'natural' | 'alto';
  semitons: number;
}

const DIGITACAO_POR_SEMITOM: Record<number, { dedo: Dedo; variante: Digitacao['variante'] }> = {
  0: { dedo: 0, variante: 'natural' },
  1: { dedo: 1, variante: 'baixo' },
  2: { dedo: 1, variante: 'natural' },
  3: { dedo: 2, variante: 'baixo' },
  4: { dedo: 2, variante: 'natural' },
  5: { dedo: 3, variante: 'natural' },
  6: { dedo: 3, variante: 'alto' },
  7: { dedo: 4, variante: 'natural' },
};

export function digitacaoDeSemitons(semitons: number): Digitacao | null {
  const base = DIGITACAO_POR_SEMITOM[semitons];
  if (!base) return null;
  return { ...base, semitons };
}

// ---------------------------------------------------------------------------
// Posição física no braço
// ---------------------------------------------------------------------------

/**
 * Fração do comprimento vibrante onde o dedo pisa, a partir da pestana.
 *
 * `1 − 2^(−n/12)`. Para a oitava (12 semitons) dá exatamente 0,5 — o meio da
 * corda — que é a verificação mais simples de que a fórmula está certa.
 */
export function fracaoDoBraco(semitons: number): number {
  return 1 - Math.pow(2, -semitons / 12);
}

export interface PontoNoBraco {
  corda: Corda;
  digitacao: Digitacao;
  /** 0 na pestana, 1 no cavalete. Para posicionar no diagrama. */
  fracao: number;
  nota: string;
  frequenciaHz: number;
}

/**
 * Onde tocar uma nota, e com qual dedo.
 *
 * Quando a nota cabe em mais de uma corda, escolhe a de MENOR deslocamento —
 * o que privilegia cordas soltas e a primeira posição. É a escolha que um
 * professor faz com um iniciante, e a que os métodos de iniciação assumem.
 *
 * Devolve `null` quando a nota não existe em primeira posição: fingir uma
 * digitação impossível seria pior que admitir que a nota exige mudança de
 * posição.
 */
export function ondeTocar(nota: string): PontoNoBraco | null {
  const alvo = frequenciaDaNota(nota);
  if (alvo === null) return null;

  let melhor: PontoNoBraco | null = null;

  for (const corda of CORDAS) {
    const solta = frequenciaDaNota(corda.solta);
    if (solta === null) continue;

    const semitons = Math.round(12 * Math.log2(alvo / solta));
    if (semitons < 0 || semitons > ALCANCE_PRIMEIRA_POSICAO) continue;

    const digitacao = digitacaoDeSemitons(semitons);
    if (!digitacao) continue;

    if (melhor === null || semitons < melhor.digitacao.semitons) {
      melhor = {
        corda,
        digitacao,
        fracao: fracaoDoBraco(semitons),
        nota,
        frequenciaHz: alvo,
      };
    }
  }

  return melhor;
}

/** Todas as notas alcançáveis em primeira posição, por corda. */
export function notasEmPrimeiraPosicao(): PontoNoBraco[] {
  const points: PontoNoBraco[] = [];
  for (const corda of CORDAS) {
    const solta = frequenciaDaNota(corda.solta);
    if (solta === null) continue;
    for (let s = 0; s <= ALCANCE_PRIMEIRA_POSICAO; s++) {
      const digitacao = digitacaoDeSemitons(s);
      if (!digitacao) continue;
      const frequenciaHz = solta * Math.pow(2, s / 12);
      const nota = notaMaisProxima(frequenciaHz)?.nota;
      if (!nota) continue;
      points.push({ corda, digitacao, fracao: fracaoDoBraco(s), nota, frequenciaHz });
    }
  }
  return points;
}

/** Extensão coberta pela primeira posição, para validar uma partitura. */
export function notaCabeEmPrimeiraPosicao(nota: string): boolean {
  return ondeTocar(nota) !== null;
}

// ---------------------------------------------------------------------------
// Orientação de execução
// ---------------------------------------------------------------------------

export interface DescricaoDeExecucao {
  texto: string;
  /** Para leitura em voz alta e para quem não enxerga o diagrama. */
  acessivel: string;
}

/**
 * Como se diz, em aula, o que fazer.
 *
 * Existe porque o diagrama sozinho não basta: quem está com o instrumento no
 * ombro não olha para a tela o tempo todo, e quem usa leitor de tela não vê
 * o diagrama em momento algum.
 */
export function descreverExecucao(ponto: PontoNoBraco): DescricaoDeExecucao {
  const { corda, digitacao, nota } = ponto;

  if (digitacao.dedo === 0) {
    return {
      texto: `${nota} — ${corda.nome} solta`,
      acessivel: `${nota}, ${corda.apelido}, sem dedo.`,
    };
  }

  const variante =
    digitacao.variante === 'baixo'
      ? ' baixo'
      : digitacao.variante === 'alto'
        ? ' alto'
        : '';

  return {
    texto: `${nota} — ${digitacao.dedo}º dedo${variante} na ${corda.nome}`,
    acessivel: `${nota}, ${digitacao.dedo}º dedo${variante}, ${corda.apelido}.`,
  };
}
