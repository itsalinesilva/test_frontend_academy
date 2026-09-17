import { frequenciaDaNota, desvioEmCents } from './practice-measurement';

/**
 * Acompanhamento de partitura em tempo real.
 *
 * O QUE ISTO FAZ
 * --------------
 * Compara o que está sendo tocado com o que a partitura pede, nota a nota,
 * enquanto o ponteiro corre. É o que permite a experiência de acerto e erro
 * imediatos, com o instrumento na mão.
 *
 * DUAS DECISÕES QUE DEFINEM A SENSAÇÃO DE JUSTIÇA
 * ----------------------------------------------
 * 1. **A janela de julgamento é proporcional ao andamento.** Em 60 BPM uma
 *    semínima dura 1000 ms e errar 100 ms é pouco; em 160 BPM a mesma
 *    semínima dura 375 ms e 100 ms é quase uma nota inteira. Uma tolerância
 *    fixa em milissegundos seria generosa no lento e cruel no rápido — e o
 *    aluno sentiria o jogo "quebrando" ao acelerar.
 *
 * 2. **Altura e tempo são julgados separadamente.** Tocar a nota certa fora
 *    do tempo e tocar a nota errada no tempo são erros diferentes, com
 *    correções diferentes. Colapsar os dois num "errou" esconde justamente a
 *    informação que serve para estudar.
 */

// ---------------------------------------------------------------------------
// Partitura
// ---------------------------------------------------------------------------

export interface NotaDaPartitura {
  id: string;
  /** Notação científica; `null` é pausa. */
  nota: string | null;
  /** Início, em batidas desde o começo da peça. */
  inicioBatida: number;
  /** Duração em batidas. */
  duracaoBatidas: number;
  /** Texto sob a nota, quando houver (letra, dedilhado escrito). */
  legenda?: string;
}

export interface PartituraExecutavel {
  id: string;
  titulo: string;
  /** Andamento de referência da peça. */
  bpmOriginal: number;
  /** [numerador, denominador] — 4/4, 3/4, 6/8. */
  compasso: [number, number];
  tonalidade?: string;
  notas: NotaDaPartitura[];
}

export function duracaoEmBatidas(p: PartituraExecutavel): number {
  return p.notas.reduce((max, n) => Math.max(max, n.inicioBatida + n.duracaoBatidas), 0);
}

export function batidaParaMs(batida: number, bpm: number): number {
  return (batida * 60000) / bpm;
}

export function msParaBatida(ms: number, bpm: number): number {
  return (ms * bpm) / 60000;
}

// ---------------------------------------------------------------------------
// Julgamento
// ---------------------------------------------------------------------------

export type Veredito =
  | 'PERFEITO'
  | 'BOM'
  | 'ADIANTADO'
  | 'ATRASADO'
  | 'ALTURA_ERRADA'
  | 'NAO_TOCADA';

export const EXPLICACAO_VEREDITO: Record<Veredito, string> = {
  PERFEITO: 'No tempo e afinada.',
  BOM: 'Dentro da janela, com pequeno desvio.',
  ADIANTADO: 'A nota certa, tocada antes da hora.',
  ATRASADO: 'A nota certa, tocada depois da hora.',
  ALTURA_ERRADA: 'No tempo, mas em outra altura.',
  NAO_TOCADA: 'Nenhum som foi detectado nesta nota.',
};

/** Pontos por veredito — a escala que o jogo usa. */
export const PONTOS: Record<Veredito, number> = {
  PERFEITO: 100,
  BOM: 70,
  ADIANTADO: 40,
  ATRASADO: 40,
  ALTURA_ERRADA: 0,
  NAO_TOCADA: 0,
};

export interface AmostraDetectada {
  /** Instante desde o início da execução, em ms. */
  ms: number;
  frequenciaHz: number;
}

export interface JulgamentoDeNota {
  notaId: string;
  esperada: string | null;
  veredito: Veredito;
  /** Desvio temporal em ms; negativo é adiantado. `null` se não tocada. */
  desvioMs: number | null;
  /** Desvio de altura em cents. `null` se não tocada. */
  desvioCents: number | null;
  detectada: string | null;
  pontos: number;
}

export interface ToleranciaDeJulgamento {
  /** Fração da duração da nota aceita como "perfeito". */
  fracaoPerfeito: number;
  /** Fração aceita como "bom". */
  fracaoBom: number;
  /** Fração aceita como adiantado/atrasado antes de virar não tocada. */
  fracaoLimite: number;
  /** Desvio de altura tolerado, em cents. */
  centsTolerados: number;
  /** Piso absoluto da janela, para não punir o impossível em tempos rápidos. */
  pisoMs: number;
}

/**
 * Tolerância padrão.
 *
 * `pisoMs` existe porque abaixo de ~50 ms nenhum instrumentista humano
 * controla o ataque com precisão: sem o piso, um andamento muito rápido
 * tornaria o "perfeito" inalcançável por razões físicas, não musicais.
 */
export const TOLERANCIA_PADRAO: ToleranciaDeJulgamento = {
  fracaoPerfeito: 0.12,
  fracaoBom: 0.3,
  fracaoLimite: 0.6,
  centsTolerados: 45,
  pisoMs: 55,
};

/**
 * Julga uma nota contra as amostras detectadas.
 *
 * Procura, dentro da janela, a amostra cuja altura mais se aproxima da
 * esperada — e não simplesmente a mais próxima no tempo. A diferença importa:
 * durante uma mudança de nota o microfone capta o fim da anterior, e escolher
 * por proximidade temporal atribuiria à nota nova a altura da velha.
 */
export function julgarNota(
  nota: NotaDaPartitura,
  amostras: AmostraDetectada[],
  bpm: number,
  tolerancia: ToleranciaDeJulgamento = TOLERANCIA_PADRAO
): JulgamentoDeNota {
  const base: Omit<JulgamentoDeNota, 'veredito' | 'pontos'> = {
    notaId: nota.id,
    esperada: nota.nota,
    desvioMs: null,
    desvioCents: null,
    detectada: null,
  };

  // Pausa: não se julga silêncio como acerto nem como erro.
  if (nota.nota === null) {
    return { ...base, veredito: 'PERFEITO', pontos: 0 };
  }

  const alvoHz = frequenciaDaNota(nota.nota);
  if (alvoHz === null) {
    return { ...base, veredito: 'NAO_TOCADA', pontos: 0 };
  }

  const inicioMs = batidaParaMs(nota.inicioBatida, bpm);
  const duracaoMs = batidaParaMs(nota.duracaoBatidas, bpm);
  const janela = Math.max(tolerancia.pisoMs, duracaoMs * tolerancia.fracaoLimite);

  const candidatas = amostras.filter((a) => Math.abs(a.ms - inicioMs) <= janela);
  if (candidatas.length === 0) {
    return { ...base, veredito: 'NAO_TOCADA', pontos: PONTOS.NAO_TOCADA };
  }

  const melhor = candidatas.reduce((a, b) => {
    const da = Math.abs(desvioEmCents(a.frequenciaHz, alvoHz) ?? Infinity);
    const db = Math.abs(desvioEmCents(b.frequenciaHz, alvoHz) ?? Infinity);
    return db < da ? b : a;
  });

  const desvioCents = Math.round(desvioEmCents(melhor.frequenciaHz, alvoHz) ?? 0);
  const desvioMs = Math.round(melhor.ms - inicioMs);
  const detectada = nota.nota;

  const comum = { ...base, desvioMs, desvioCents, detectada };

  if (Math.abs(desvioCents) > tolerancia.centsTolerados) {
    return { ...comum, veredito: 'ALTURA_ERRADA', pontos: PONTOS.ALTURA_ERRADA };
  }

  const perfeito = Math.max(tolerancia.pisoMs, duracaoMs * tolerancia.fracaoPerfeito);
  const bom = Math.max(tolerancia.pisoMs * 1.6, duracaoMs * tolerancia.fracaoBom);
  const absoluto = Math.abs(desvioMs);

  if (absoluto <= perfeito) return { ...comum, veredito: 'PERFEITO', pontos: PONTOS.PERFEITO };
  if (absoluto <= bom) return { ...comum, veredito: 'BOM', pontos: PONTOS.BOM };

  const veredito: Veredito = desvioMs < 0 ? 'ADIANTADO' : 'ATRASADO';
  return { ...comum, veredito, pontos: PONTOS[veredito] };
}

// ---------------------------------------------------------------------------
// Execução completa
// ---------------------------------------------------------------------------

export interface ResultadoDaExecucao {
  partituraId: string;
  bpm: number;
  julgamentos: JulgamentoDeNota[];
  /** Notas efetivamente julgadas — pausas não contam. */
  notasJulgadas: number;
  acertos: number;
  pontos: number;
  /** 0..100. */
  precisao: number;
  /** Maior sequência de notas sem erro. */
  maiorSequencia: number;
  /** Desvio médio absoluto de tempo, em ms, nas notas tocadas. */
  desvioMedioMs: number | null;
  /** Desvio médio absoluto de altura, em cents, nas notas tocadas. */
  desvioMedioCents: number | null;
}

export function julgarExecucao(
  partitura: PartituraExecutavel,
  amostras: AmostraDetectada[],
  bpm: number,
  tolerancia: ToleranciaDeJulgamento = TOLERANCIA_PADRAO
): ResultadoDaExecucao {
  const julgamentos = partitura.notas.map((n) => julgarNota(n, amostras, bpm, tolerancia));
  const reais = julgamentos.filter((j) => j.esperada !== null);

  const acertos = reais.filter((j) => j.veredito === 'PERFEITO' || j.veredito === 'BOM').length;
  const pontos = reais.reduce((a, j) => a + j.pontos, 0);
  const maximo = reais.length * PONTOS.PERFEITO;

  let sequencia = 0;
  let maiorSequencia = 0;
  for (const j of reais) {
    if (j.veredito === 'PERFEITO' || j.veredito === 'BOM') {
      sequencia += 1;
      maiorSequencia = Math.max(maiorSequencia, sequencia);
    } else {
      sequencia = 0;
    }
  }

  const tocadas = reais.filter((j) => j.desvioMs !== null);
  const media = (valores: number[]) =>
    valores.length > 0 ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : null;

  return {
    partituraId: partitura.id,
    bpm,
    julgamentos,
    notasJulgadas: reais.length,
    acertos,
    pontos,
    precisao: maximo > 0 ? Math.round((pontos / maximo) * 100) : 0,
    maiorSequencia,
    desvioMedioMs: media(tocadas.map((j) => Math.abs(j.desvioMs!))),
    desvioMedioCents: media(tocadas.map((j) => Math.abs(j.desvioCents!))),
  };
}

// ---------------------------------------------------------------------------
// Simplificação
// ---------------------------------------------------------------------------

export type NivelDeSimplificacao = 'original' | 'intermediario' | 'iniciante';

/**
 * Reduz a partitura para um nível de leitura mais simples.
 *
 * `iniciante` funde notas curtas consecutivas de mesma altura e remove
 * ornamentos rápidos, preservando o CONTORNO da melodia — que é o que o
 * aluno precisa reconhecer. Não é "tocar mais devagar": é tocar menos notas,
 * no mesmo esqueleto rítmico, o que permite chegar à versão original
 * reconhecendo a peça em vez de decorando-a.
 */
export function simplificar(
  partitura: PartituraExecutavel,
  nivel: NivelDeSimplificacao
): PartituraExecutavel {
  if (nivel === 'original') return partitura;

  const limiar = nivel === 'iniciante' ? 1 : 0.5;
  const saida: NotaDaPartitura[] = [];

  for (const nota of partitura.notas) {
    const anterior = saida[saida.length - 1];

    // Funde com a anterior quando é a mesma altura e ambas são curtas.
    if (
      anterior &&
      anterior.nota === nota.nota &&
      nota.duracaoBatidas < limiar &&
      anterior.duracaoBatidas < limiar * 2
    ) {
      anterior.duracaoBatidas = nota.inicioBatida + nota.duracaoBatidas - anterior.inicioBatida;
      continue;
    }

    // Notas muito curtas viram ornamento e saem, cedendo a duração à anterior.
    if (nivel === 'iniciante' && nota.duracaoBatidas < 0.25 && anterior) {
      anterior.duracaoBatidas = nota.inicioBatida + nota.duracaoBatidas - anterior.inicioBatida;
      continue;
    }

    saida.push({ ...nota });
  }

  return {
    ...partitura,
    id: `${partitura.id}__${nivel}`,
    titulo: `${partitura.titulo} (${nivel === 'iniciante' ? 'versão iniciante' : 'versão intermediária'})`,
    notas: saida,
  };
}
