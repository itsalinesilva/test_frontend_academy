import { DIMENSOES, Dimensao, ordemPedagogica } from './gramatica-musical';

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

export type EstadoDoNo = 'CONCLUIDO' | 'ATUAL' | 'DISPONIVEL' | 'BLOQUEADO';

export interface NoDoPercurso {
  dimensao: Dimensao;
  /** O nome que se lê no mapa. */
  titulo: string;
  /** A pergunta que o nó ensina a responder. */
  pergunta: string;
  /** Capítulos do curso de Teoria que sustentam o nó. */
  capitulos: number[];
  requer: Dimensao[];
}

export interface UnidadeDoPercurso {
  numero: number;
  /** Derivado do que a unidade cobre — nunca escrito à mão, nunca desatualiza. */
  titulo: string;
  nos: NoDoPercurso[];
}

const noDe = (dimensao: Dimensao): NoDoPercurso => ({
  dimensao,
  titulo: DIMENSOES[dimensao].nome,
  pergunta: DIMENSOES[dimensao].pergunta,
  capitulos: DIMENSOES[dimensao].capitulos,
  requer: DIMENSOES[dimensao].requer,
});

/**
 * A camada de uma dimensão no grafo: quantos passos ela está do começo.
 *
 * Zero para o que não depende de nada. Para o resto, um a mais que a maior
 * camada entre os pré-requisitos — que é o que garante que nenhum nó apareça
 * antes do que ele exige.
 */
function camadaDe(dimensao: Dimensao, memo = new Map<Dimensao, number>()): number {
  const lembrada = memo.get(dimensao);
  if (lembrada !== undefined) return lembrada;

  const requisitos = DIMENSOES[dimensao].requer;
  const camada =
    requisitos.length === 0 ? 0 : Math.max(...requisitos.map((r) => camadaDe(r, memo))) + 1;

  memo.set(dimensao, camada);
  return camada;
}

/** O nome da unidade sai do que ela cobre: "Nota, Valor e Andamento". */
function tituloDaUnidade(nos: NoDoPercurso[]): string {
  const nomes = nos.map((n) => n.titulo);
  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** O percurso inteiro, em unidades, na ordem em que se estuda. */
export function unidadesDoPercurso(): UnidadeDoPercurso[] {
  const memo = new Map<Dimensao, number>();
  const porCamada = new Map<number, NoDoPercurso[]>();

  // A ordem pedagógica dá a ordem DENTRO da camada; a camada dá a ordem entre elas.
  for (const dimensao of ordemPedagogica()) {
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
export function nosDoPercurso(): NoDoPercurso[] {
  return unidadesDoPercurso().flatMap((u) => u.nos);
}

/**
 * Onde a pessoa está.
 *
 * `ATUAL` é **um só**: o primeiro nó alcançável que ainda não foi concluído.
 * Vários nós em destaque ao mesmo tempo é a mesma coisa que nenhum — a pessoa
 * abre o mapa para saber por onde continuar, e não para escolher.
 */
export function estadoDoNo(
  dimensao: Dimensao,
  concluidas: readonly Dimensao[]
): EstadoDoNo {
  if (concluidas.includes(dimensao)) return 'CONCLUIDO';

  const alcancavel = DIMENSOES[dimensao].requer.every((r) => concluidas.includes(r));
  if (!alcancavel) return 'BLOQUEADO';

  return dimensao === dimensaoAtual(concluidas) ? 'ATUAL' : 'DISPONIVEL';
}

/** O próximo nó a fazer, ou `null` quando o percurso inteiro foi concluído. */
export function dimensaoAtual(concluidas: readonly Dimensao[]): Dimensao | null {
  for (const no of nosDoPercurso()) {
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
export function motivoDoBloqueio(
  dimensao: Dimensao,
  concluidas: readonly Dimensao[]
): string | null {
  const faltando = DIMENSOES[dimensao].requer.filter((r) => !concluidas.includes(r));
  if (faltando.length === 0) return null;

  const nomes = faltando.map((r) => DIMENSOES[r].nome);
  const lista =
    nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;

  return `Abre quando você concluir ${lista}.`;
}

/** Quanto da unidade já foi feito, de 0 a 1. */
export function progressoDaUnidade(
  unidade: UnidadeDoPercurso,
  concluidas: readonly Dimensao[]
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
export function unidadeAtual(concluidas: readonly Dimensao[]): UnidadeDoPercurso | null {
  const unidades = unidadesDoPercurso();
  if (unidades.length === 0) return null;

  const atual = dimensaoAtual(concluidas);
  if (atual === null) return unidades[unidades.length - 1];

  return unidades.find((u) => u.nos.some((n) => n.dimensao === atual)) ?? unidades[0];
}
