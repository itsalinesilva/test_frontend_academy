import { DIMENSIONS, Dimension, pedagogicalOrder } from './music-grammar';

/**
 * O percurso — o caminho que leva às lições.
 *
 * NÃO É UMA LISTA ESCRITA À MÃO
 * -----------------------------
 * O percurso é **derivado** da gramática: os nós são as dimensões, e a ordem
 * é a ordem dos pré-requisitos que já estão declarados lá. Uma lista paralela
 * poderia contradizer a gramática sem que nada quebrasse — ofereceria cadência
 * a quem ainda não viu função harmônica, e as duas fontes divergiriam em
 * silêncio até alguém reparar.
 *
 * As unidades também são derivadas: cada uma é uma **camada** do grafo de
 * pré-requisitos. A camada zero é o que não depende de nada — nota, valor,
 * andamento. A camada seguinte é o que depende apenas dela, e assim por
 * diante. Acrescentar uma dimensão à gramática reposiciona o percurso
 * sozinho, e ninguém precisa lembrar de mexer aqui.
 *
 * O CADEADO DIZ O MOTIVO
 * ----------------------
 * Nó bloqueado sem explicação é interpretado como "isto é pago" ou "isto está
 * quebrado". O motivo aqui nomeia o que falta, porque o que falta é
 * alcançável — e saber disso é a diferença entre um obstáculo e uma porta.
 */

export type NodeState = 'DONE' | 'CURRENT' | 'AVAILABLE' | 'LOCKED';

export interface PathNode {
  dimensao: Dimension;
  /** O nome que se lê no mapa. */
  titulo: string;
  /** A pergunta que o nó ensina a responder. */
  pergunta: string;
  /** Capítulos do curso de Teoria que sustentam o nó. */
  capitulos: number[];
  requer: Dimension[];
}

export interface PathUnit {
  numero: number;
  /** Derivado do que a unidade cobre — nunca escrito à mão, nunca desatualiza. */
  titulo: string;
  nos: PathNode[];
}

const noDe = (dimensao: Dimension): PathNode => ({
  dimensao,
  titulo: DIMENSIONS[dimensao].nome,
  pergunta: DIMENSIONS[dimensao].pergunta,
  capitulos: DIMENSIONS[dimensao].capitulos,
  requer: DIMENSIONS[dimensao].requer,
});

/**
 * A camada de uma dimensão no grafo: quantos passos ela está do começo.
 *
 * Zero para o que não depende de nada. Para o resto, um a mais que a maior
 * camada entre os pré-requisitos — que é o que garante que nenhum nó apareça
 * antes do que ele exige.
 */
function camadaDe(dimensao: Dimension, memo = new Map<Dimension, number>()): number {
  const lembrada = memo.get(dimensao);
  if (lembrada !== undefined) return lembrada;

  const requisitos = DIMENSIONS[dimensao].requer;
  const camada =
    requisitos.length === 0 ? 0 : Math.max(...requisitos.map((r) => camadaDe(r, memo))) + 1;

  memo.set(dimensao, camada);
  return camada;
}

/** O nome da unidade sai do que ela cobre: "Nota, Valor e Andamento". */
function tituloDaUnidade(nos: PathNode[]): string {
  const nomes = nos.map((n) => n.titulo);
  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** O percurso inteiro, em unidades, na ordem em que se estuda. */
export function pathUnits(): PathUnit[] {
  const memo = new Map<Dimension, number>();
  const porCamada = new Map<number, PathNode[]>();

  // A ordem pedagógica dá a ordem DENTRO da camada; a camada dá a ordem entre elas.
  for (const dimensao of pedagogicalOrder()) {
    const camada = camadaDe(dimensao, memo);
    const nos = porCamada.get(camada) ?? [];
    nos.push(noDe(dimensao));
    porCamada.set(camada, nos);
  }

  return [...porCamada.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([camada, nos]) => ({
      numero: camada + 1,
      titulo: tituloDaUnidade(nos),
      nos,
    }));
}

/** Todos os nós, achatados, na ordem em que se estuda. */
export function pathNodes(): PathNode[] {
  return pathUnits().flatMap((u) => u.nos);
}

/**
 * Onde a pessoa está.
 *
 * `ATUAL` é **um só**: o primeiro nó alcançável que ainda não foi concluído.
 * Vários nós em destaque ao mesmo tempo é a mesma coisa que nenhum — a pessoa
 * abre o mapa para saber por onde continuar, e não para escolher.
 */
export function nodeState(
  dimensao: Dimension,
  concluidas: readonly Dimension[]
): NodeState {
  if (concluidas.includes(dimensao)) return 'DONE';

  const alcancavel = DIMENSIONS[dimensao].requer.every((r) => concluidas.includes(r));
  if (!alcancavel) return 'LOCKED';

  return dimensao === currentDimension(concluidas) ? 'CURRENT' : 'AVAILABLE';
}

/** O próximo nó a fazer, ou `null` quando o percurso inteiro foi concluído. */
export function currentDimension(concluidas: readonly Dimension[]): Dimension | null {
  for (const no of pathNodes()) {
    if (concluidas.includes(no.dimensao)) continue;
    if (no.requer.every((r) => concluidas.includes(r))) return no.dimensao;
  }
  return null;
}

/**
 * Por que este nó está fechado.
 *
 * `null` quando não está. Nomeia só o que **falta** — listar pré-requisitos já
 * cumpridos junto dos que faltam obriga a pessoa a fazer a subtração.
 */
export function lockReason(
  dimensao: Dimension,
  concluidas: readonly Dimension[]
): string | null {
  const faltando = DIMENSIONS[dimensao].requer.filter((r) => !concluidas.includes(r));
  if (faltando.length === 0) return null;

  const nomes = faltando.map((r) => DIMENSIONS[r].nome);
  const lista =
    nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;

  return `Abre quando você concluir ${lista}.`;
}

/** Quanto da unidade já foi feito, de 0 a 1. */
export function unitProgress(
  unidade: PathUnit,
  concluidas: readonly Dimension[]
): number {
  if (unidade.nos.length === 0) return 0;
  const feitos = unidade.nos.filter((n) => concluidas.includes(n.dimensao)).length;
  return feitos / unidade.nos.length;
}

/**
 * A unidade onde a pessoa está.
 *
 * `null` só quando não há percurso nenhum — com tudo concluído, devolve a
 * última, porque é onde a pessoa de fato chegou.
 */
export function currentUnit(concluidas: readonly Dimension[]): PathUnit | null {
  const unidades = pathUnits();
  if (unidades.length === 0) return null;

  const atual = currentDimension(concluidas);
  if (atual === null) return unidades[unidades.length - 1];

  return unidades.find((u) => u.nos.some((n) => n.dimensao === atual)) ?? unidades[0];
}
