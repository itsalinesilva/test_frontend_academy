import { PracticeModality, ExerciseType } from './practice';

/**
 * Medição real de uma tentativa de prática.
 *
 * POR QUE ESTE MÓDULO EXISTE
 * --------------------------
 * A avaliação anterior INVENTAVA a medição quando ninguém a fornecia:
 *
 *     const deviationCents = input.centsDeviation !== undefined
 *       ? input.centsDeviation
 *       : (isPitchMatch ? Math.random() * 8 : 45 + Math.random() * 40);
 *
 * Quem acertasse a nota recebia um desvio de 0 a 8 cents sorteado; quem
 * errasse, de 45 a 85. O número tinha a aparência de uma medição de afinação
 * e não media coisa alguma. `consistency` sorteava mesmo quando havia dados
 * reais.
 *
 * Numa plataforma cuja promessa é "medição real", isso é pior do que não
 * medir: o aluno ajusta o estudo com base num número que não descreve o que
 * ele fez.
 *
 * O PRINCÍPIO
 * -----------
 * Nenhuma dimensão é pontuada sem dado de entrada. Se não houve sinal, a
 * dimensão fica AUSENTE — não zerada, não sorteada. Zero seria uma nota ruim
 * inventada; ausência é a verdade.
 *
 * A nota global é a média ponderada SÓ das dimensões efetivamente medidas,
 * com os pesos renormalizados. Um exercício de teoria não perde pontos por
 * não ter afinação.
 */

// ---------------------------------------------------------------------------
// Natureza do exercício
// ---------------------------------------------------------------------------

/**
 * De onde vem a medição de cada exercício.
 *
 * A distinção não é técnica, é honesta: um exercício de teoria não tem
 * afinação para medir, e fingir que tem produziria os números falsos que este
 * módulo existe para eliminar.
 */
export type NaturezaMedicao =
  /** Há sinal sonoro: afinação, tempo, ritmo, sustentação são medíveis. */
  | 'ACOUSTICS'
  /** Resposta simbólica: a medição é acerto e tempo de resposta. */
  | 'SIMBOLICA';

const MODALIDADES_ACUSTICAS = new Set<PracticeModality>([
  PracticeModality.VOICE,
  PracticeModality.KEYBOARD,
  PracticeModality.VIRTUAL_INSTRUMENT,
  PracticeModality.RHYTHM,
  PracticeModality.TECHNIQUE,
  PracticeModality.REPERTOIRE,
]);

const TIPOS_ACUSTICOS = new Set<ExerciseType>([
  ExerciseType.PITCH_MATCH,
  ExerciseType.SIGHT_SINGING,
  ExerciseType.RHYTHM_TAP,
  ExerciseType.KEYBOARD_EXECUTION,
  ExerciseType.REPERTOIRE_PHRASE,
]);

export function naturezaDoExercicio(
  modalidade: PracticeModality,
  tipo: ExerciseType
): NaturezaMedicao {
  return MODALIDADES_ACUSTICAS.has(modalidade) || TIPOS_ACUSTICOS.has(tipo)
    ? 'ACOUSTICS'
    : 'SIMBOLICA';
}

// ---------------------------------------------------------------------------
// Conversões acústicas
// ---------------------------------------------------------------------------

const SEMITONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const EQUIVALENTES: Record<string, string> = {
  DB: 'C#', EB: 'D#', GB: 'F#', AB: 'G#', BB: 'A#',
};

/** Frequência de uma nota em notação científica, com A4 = 440 Hz. */
export function frequenciaDaNota(nota: string, a4 = 440): number | null {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(nota.trim());
  if (!m) return null;

  const [, letra, alteracao, oitavaTexto] = m;
  let nome = letra.toUpperCase() + (alteracao === 'b' ? 'B' : alteracao);
  if (EQUIVALENTES[nome]) nome = EQUIVALENTES[nome];

  const indice = SEMITONS.indexOf(nome);
  if (indice < 0) return null;

  const oitava = parseInt(oitavaTexto, 10);
  // Distância em semitons até A4, que ocupa o índice 9 da oitava 4.
  const distancia = (oitava - 4) * 12 + (indice - 9);
  return a4 * Math.pow(2, distancia / 12);
}

/** Nota mais próxima de uma frequência, e o desvio em cents em relação a ela. */
export function notaMaisProxima(
  frequencia: number,
  a4 = 440
): { nota: string; deviationCents: number } | null {
  if (!Number.isFinite(frequencia) || frequencia <= 0) return null;

  const semitonsDeA4 = 12 * Math.log2(frequencia / a4);
  const arredondado = Math.round(semitonsDeA4);
  const deviationCents = Math.round((semitonsDeA4 - arredondado) * 100);

  const indice = ((arredondado + 9) % 12 + 12) % 12;
  const oitava = 4 + Math.floor((arredondado + 9) / 12);
  return { nota: `${SEMITONS[indice]}${oitava}`, deviationCents };
}

/**
 * Desvio em cents entre duas frequências.
 *
 * 1200 · log2(f / fAlvo). É a definição de cent — não uma aproximação.
 */
export function desvioEmCents(frequencia: number, frequenciaAlvo: number): number | null {
  if (frequencia <= 0 || frequenciaAlvo <= 0) return null;
  return 1200 * Math.log2(frequencia / frequenciaAlvo);
}

// ---------------------------------------------------------------------------
// Entrada de medição
// ---------------------------------------------------------------------------

export interface SinalDaTentativa {
  /** Frequências detectadas ao longo da execução, em Hz. */
  frequenciesHz?: number[];
  /** Nota alvo em notação científica. */
  notaAlvo?: string;
  /** Instantes dos ataques, em ms desde o início da tentativa. */
  ataquesMs?: number[];
  /** Andamento pedido, em batidas por minuto. */
  bpmAlvo?: number;
  /** Duração alvo da nota sustentada, em segundos. */
  duracaoAlvoSegundos?: number;
  /** Duração efetiva do som, em segundos. */
  duracaoRealSegundos?: number;
  /** Resposta simbólica dada. */
  respostaDada?: string;
  /** Resposta simbólica esperada. */
  respostaEsperada?: string;
  /** Tempo até responder, em ms. */
  tempoDeRespostaMs?: number;
}

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

/** Uma dimensão medida. `null` significa que não houve dado — não zero. */
export type Dimension = number | null;

export interface MedicaoReal {
  nature: NaturezaMedicao;

  afinacao: {
    notaAlvo: string | null;
    notaDetectada: string | null;
    deviationCents: Dimension;
    /** 0..100, derivada do desvio. */
    pontuacao: Dimension;
  };
  /** Constância da afinação ao longo da nota: 0..100. */
  estabilidadeDeAltura: Dimension;
  tempoRitmico: {
    bpmAlvo: number | null;
    bpmMedido: Dimension;
    /** Desvio médio absoluto em relação à grade, em ms. */
    desvioMedioMs: Dimension;
    /** 0..100, derivada do desvio. */
    pontuacao: Dimension;
  };
  /** Regularidade dos intervalos entre ataques: 0..100. */
  estabilidadeRitmica: Dimension;
  sustentacao: {
    alvoSegundos: number | null;
    realSegundos: number | null;
    pontuacao: Dimension;
  };
  acerto: {
    correto: boolean | null;
    tempoDeRespostaMs: number | null;
    pontuacao: Dimension;
  };

  /** Média ponderada das dimensões medidas. `null` se nada foi medido. */
  notaGlobal: Dimension;
  /** Nomes das dimensões que entraram na nota. */
  dimensoesMedidas: string[];
  /** Por que uma dimensão esperada ficou de fora. */
  ausencias: string[];
}

// ---------------------------------------------------------------------------
// Curvas de pontuação
// ---------------------------------------------------------------------------

/**
 * Desvio de afinação → pontuação.
 *
 * Os limiares vêm da percepção, não de uma reta arbitrária: abaixo de ~5
 * cents o desvio é inaudível como erro; a partir de ~50 cents já se ouve
 * outra nota. A curva reflete isso — é generosa no começo e cai depressa
 * depois, em vez de punir igualmente um desvio imperceptível e um erro
 * audível.
 */
export function pontuarAfinacao(deviationCents: number): number {
  const d = Math.abs(deviationCents);
  if (d <= 5) return 100;
  if (d >= 50) return 0;
  // Queda suave entre 5 e 50 cents.
  return Math.round(100 * Math.pow(1 - (d - 5) / 45, 1.4));
}

/**
 * Desvio de tempo → pontuação.
 *
 * ~20 ms é o limiar comum de percepção de assincronia em ataques musicais;
 * acima de ~120 ms o ataque é ouvido como fora do tempo.
 */
export function pontuarTempo(deviationMs: number): number {
  const d = Math.abs(deviationMs);
  if (d <= 20) return 100;
  if (d >= 120) return 0;
  return Math.round(100 * Math.pow(1 - (d - 20) / 100, 1.3));
}

/** Desvio proporcional de duração → pontuação. */
export function pontuarSustentacao(alvo: number, real: number): number {
  if (alvo <= 0) return 0;
  const erroRelativo = Math.abs(real - alvo) / alvo;
  if (erroRelativo <= 0.05) return 100;
  if (erroRelativo >= 0.6) return 0;
  return Math.round(100 * (1 - (erroRelativo - 0.05) / 0.55));
}

function desvioPadrao(valores: number[]): number {
  if (valores.length < 2) return 0;
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const variancia = valores.reduce((a, v) => a + (v - media) ** 2, 0) / valores.length;
  return Math.sqrt(variancia);
}

// ---------------------------------------------------------------------------
// Medição
// ---------------------------------------------------------------------------

const PESOS: Record<string, number> = {
  afinacao: 0.30,
  estabilidadeDeAltura: 0.12,
  tempoRitmico: 0.22,
  estabilidadeRitmica: 0.12,
  sustentacao: 0.09,
  acerto: 0.15,
};

/**
 * Mede uma tentativa a partir do sinal capturado.
 *
 * Não recebe valores de fallback e não produz nenhum. O que não vier medido
 * sai `null`, e a razão da ausência é registrada em `ausencias` — para a
 * interface poder dizer "não foi possível medir a afinação: não houve som
 * audível" em vez de exibir uma nota baixa que o aluno não causou.
 */
export function medirTentativa(
  sinal: SinalDaTentativa,
  nature: NaturezaMedicao
): MedicaoReal {
  const ausencias: string[] = [];
  const medidas: Record<string, number> = {};

  // --- afinação ------------------------------------------------------------
  const frequencias = (sinal.frequenciesHz ?? []).filter((f) => Number.isFinite(f) && f > 0);
  const frequenciaAlvo = sinal.notaAlvo ? frequenciaDaNota(sinal.notaAlvo) : null;

  let deviationCents: number | null = null;
  let notaDetectada: string | null = null;
  let pontuacaoAfinacao: number | null = null;
  let estabilidadeDeAltura: number | null = null;

  if (frequencias.length > 0) {
    // Mediana, não média: um único quadro espúrio de detecção não deve
    // deslocar a leitura da nota inteira.
    const ordenadas = [...frequencias].sort((a, b) => a - b);
    const mediana = ordenadas[Math.floor(ordenadas.length / 2)];
    notaDetectada = notaMaisProxima(mediana)?.nota ?? null;

    if (frequenciaAlvo) {
      deviationCents = Math.round(desvioEmCents(mediana, frequenciaAlvo) ?? 0);
      pontuacaoAfinacao = pontuarAfinacao(deviationCents);
      medidas.afinacao = pontuacaoAfinacao;
    } else {
      ausencias.push('Sem nota alvo definida: o desvio de afinação não pôde ser calculado.');
    }

    if (frequencias.length >= 4) {
      // Constância: dispersão das leituras, em cents, ao longo da nota.
      const centsDeCada = frequencias
        .map((f) => desvioEmCents(f, mediana))
        .filter((c): c is number => c !== null);
      const dispersao = desvioPadrao(centsDeCada);
      estabilidadeDeAltura = Math.max(0, Math.round(100 - dispersao * 2.2));
      medidas.estabilidadeDeAltura = estabilidadeDeAltura;
    }
  } else if (nature === 'ACOUSTICS') {
    ausencias.push('Não houve som audível para medir a afinação.');
  }

  // --- tempo e ritmo -------------------------------------------------------
  const ataques = (sinal.ataquesMs ?? []).filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  let bpmMedido: number | null = null;
  let desvioMedioMs: number | null = null;
  let pontuacaoTempo: number | null = null;
  let estabilidadeRitmica: number | null = null;

  if (ataques.length >= 2) {
    const intervalos: number[] = [];
    for (let i = 1; i < ataques.length; i++) intervalos.push(ataques[i] - ataques[i - 1]);

    const intervaloMedio = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
    if (intervaloMedio > 0) bpmMedido = Math.round(60000 / intervaloMedio);

    estabilidadeRitmica = Math.max(0, Math.round(100 - (desvioPadrao(intervalos) / intervaloMedio) * 220));
    medidas.estabilidadeRitmica = estabilidadeRitmica;

    if (sinal.bpmAlvo && sinal.bpmAlvo > 0) {
      // Desvio de cada ataque em relação à grade do metrônomo, ancorada no
      // primeiro ataque — o que se mede é a manutenção do andamento, não o
      // acerto do instante em que a pessoa começou.
      const intervaloAlvo = 60000 / sinal.bpmAlvo;
      const desvios = ataques.map((t, i) => Math.abs(t - (ataques[0] + i * intervaloAlvo)));
      desvioMedioMs = Math.round(desvios.reduce((a, b) => a + b, 0) / desvios.length);
      pontuacaoTempo = pontuarTempo(desvioMedioMs);
      medidas.tempoRitmico = pontuacaoTempo;
    } else {
      ausencias.push('Sem andamento alvo: o desvio de tempo não pôde ser calculado.');
    }
  } else if (nature === 'ACOUSTICS' && sinal.bpmAlvo) {
    ausencias.push('Ataques insuficientes para medir o andamento (são necessários ao menos dois).');
  }

  // --- sustentação ---------------------------------------------------------
  let pontuacaoSustentacao: number | null = null;
  if (sinal.duracaoAlvoSegundos && sinal.duracaoRealSegundos !== undefined) {
    pontuacaoSustentacao = pontuarSustentacao(sinal.duracaoAlvoSegundos, sinal.duracaoRealSegundos);
    medidas.sustentacao = pontuacaoSustentacao;
  }

  // --- acerto simbólico ----------------------------------------------------
  let correto: boolean | null = null;
  let pontuacaoAcerto: number | null = null;
  if (sinal.respostaEsperada !== undefined && sinal.respostaDada !== undefined) {
    const normalizar = (s: string) =>
      s.trim().toLowerCase().replace(/\s+/g, ' ');
    correto = normalizar(sinal.respostaDada) === normalizar(sinal.respostaEsperada);
    pontuacaoAcerto = correto ? 100 : 0;
    medidas.acerto = pontuacaoAcerto;
  } else if (nature === 'SIMBOLICA') {
    ausencias.push('Nenhuma resposta foi registrada.');
  }

  // --- nota global ---------------------------------------------------------
  const nomes = Object.keys(medidas);
  let notaGlobal: number | null = null;
  if (nomes.length > 0) {
    // Pesos renormalizados sobre o que foi medido: um exercício de teoria não
    // perde pontos por não ter afinação para medir.
    const somaPesos = nomes.reduce((a, n) => a + (PESOS[n] ?? 0), 0);
    if (somaPesos > 0) {
      notaGlobal = Math.round(
        nomes.reduce((a, n) => a + medidas[n] * (PESOS[n] ?? 0), 0) / somaPesos
      );
    }
  }

  return {
    nature,
    afinacao: {
      notaAlvo: sinal.notaAlvo ?? null,
      notaDetectada,
      deviationCents,
      pontuacao: pontuacaoAfinacao,
    },
    estabilidadeDeAltura,
    tempoRitmico: {
      bpmAlvo: sinal.bpmAlvo ?? null,
      bpmMedido,
      desvioMedioMs,
      pontuacao: pontuacaoTempo,
    },
    estabilidadeRitmica,
    sustentacao: {
      alvoSegundos: sinal.duracaoAlvoSegundos ?? null,
      realSegundos: sinal.duracaoRealSegundos ?? null,
      pontuacao: pontuacaoSustentacao,
    },
    acerto: {
      correto,
      tempoDeRespostaMs: sinal.tempoDeRespostaMs ?? null,
      pontuacao: pontuacaoAcerto,
    },
    notaGlobal,
    dimensoesMedidas: nomes,
    ausencias,
  };
}

// ---------------------------------------------------------------------------
// Domínio
// ---------------------------------------------------------------------------

export const LIMIAR_APROVACAO = 70;
export const TENTATIVAS_PARA_DOMINIO = 3;
export const LIMIAR_DOMINIO = 85;

/**
 * Uma tentativa só "passa" se houve medição.
 *
 * Sem medição não há aprovação — nem reprovação. É o terceiro estado que o
 * loop precisa ter para ser honesto: a tentativa aconteceu, mas não se sabe
 * como foi.
 */
export function tentativaAprovada(medicao: MedicaoReal): boolean | null {
  if (medicao.notaGlobal === null) return null;
  return medicao.notaGlobal >= LIMIAR_APROVACAO;
}

/**
 * Domínio de uma micro-habilidade.
 *
 * Exige constância, não um pico: três tentativas consecutivas acima do
 * limiar. Uma execução excelente isolada não é domínio — é sorte ou é um dia
 * bom, e a juruviara do brasão está lá justamente para lembrar disso.
 */
export function atingiuDominio(notasRecentes: number[]): boolean {
  if (notasRecentes.length < TENTATIVAS_PARA_DOMINIO) return false;
  return notasRecentes
    .slice(-TENTATIVAS_PARA_DOMINIO)
    .every((n) => n >= LIMIAR_DOMINIO);
}

/**
 * Próxima dificuldade sugerida.
 *
 * Sobe só com folga confortável e desce com dificuldade persistente. A faixa
 * do meio não mexe em nada: oscilar a dificuldade a cada tentativa destrói a
 * referência que o aluno usa para saber se está melhorando.
 */
export function ajustarDificuldade(
  atual: 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso',
  notasRecentes: number[]
): 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso' {
  const escala = ['iniciante', 'intermediario', 'avancado', 'virtuoso'] as const;
  const indice = escala.indexOf(atual);
  if (notasRecentes.length < 3) return atual;

  const ultimas = notasRecentes.slice(-3);
  const media = ultimas.reduce((a, b) => a + b, 0) / ultimas.length;

  if (media >= 92 && indice < escala.length - 1) return escala[indice + 1];
  if (media < 55 && indice > 0) return escala[indice - 1];
  return atual;
}

// ---------------------------------------------------------------------------
// Agregação de uma sessão
// ---------------------------------------------------------------------------

/** Média das dimensões presentes; `null` se nenhuma tentativa as trouxe. */
function mediaPresente(valores: (number | null | undefined)[]): number | null {
  const reais = valores.filter((v): v is number => typeof v === 'number');
  if (reais.length === 0) return null;
  return Math.round(reais.reduce((a, b) => a + b, 0) / reais.length);
}

/**
 * Consolida as medições de uma sessão numa só.
 *
 * Cada dimensão é a média das tentativas que a mediram — não das tentativas
 * que existiram. Uma sessão com dez exercícios de teoria e dois de canto tem
 * a afinação calculada sobre dois, e não diluída por dez ausências contadas
 * como zero.
 */
export function agregarMedicoes(medicoes: MedicaoReal[]): MedicaoReal {
  const presentes = medicoes.filter(Boolean);

  const desvios = presentes.map((m) => m.afinacao.deviationCents);
  const medidas: Record<string, number | null> = {
    afinacao: mediaPresente(presentes.map((m) => m.afinacao.pontuacao)),
    estabilidadeDeAltura: mediaPresente(presentes.map((m) => m.estabilidadeDeAltura)),
    tempoRitmico: mediaPresente(presentes.map((m) => m.tempoRitmico.pontuacao)),
    estabilidadeRitmica: mediaPresente(presentes.map((m) => m.estabilidadeRitmica)),
    sustentacao: mediaPresente(presentes.map((m) => m.sustentacao.pontuacao)),
    acerto: mediaPresente(presentes.map((m) => m.acerto.pontuacao)),
  };

  const nomes = Object.keys(medidas).filter((n) => medidas[n] !== null);
  const somaPesos = nomes.reduce((a, n) => a + (PESOS[n] ?? 0), 0);
  const notaGlobal =
    somaPesos > 0
      ? Math.round(nomes.reduce((a, n) => a + medidas[n]! * (PESOS[n] ?? 0), 0) / somaPesos)
      : null;

  return {
    nature: presentes.some((m) => m.nature === 'ACOUSTICS') ? 'ACOUSTICS' : 'SIMBOLICA',
    afinacao: {
      notaAlvo: presentes.find((m) => m.afinacao.notaAlvo)?.afinacao.notaAlvo ?? null,
      notaDetectada: null,
      // Desvio médio ABSOLUTO: quem ora sobe 30 cents e ora desce 30 não está
      // afinado, e a média com sinal daria zero — a melhor nota possível.
      deviationCents: mediaPresente(desvios.map((d) => (d === null ? null : Math.abs(d)))),
      pontuacao: medidas.afinacao,
    },
    estabilidadeDeAltura: medidas.estabilidadeDeAltura,
    tempoRitmico: {
      bpmAlvo: presentes.find((m) => m.tempoRitmico.bpmAlvo)?.tempoRitmico.bpmAlvo ?? null,
      bpmMedido: mediaPresente(presentes.map((m) => m.tempoRitmico.bpmMedido)),
      desvioMedioMs: mediaPresente(presentes.map((m) => m.tempoRitmico.desvioMedioMs)),
      pontuacao: medidas.tempoRitmico,
    },
    estabilidadeRitmica: medidas.estabilidadeRitmica,
    sustentacao: {
      alvoSegundos: null,
      realSegundos: null,
      pontuacao: medidas.sustentacao,
    },
    acerto: {
      correto: null,
      tempoDeRespostaMs: mediaPresente(presentes.map((m) => m.acerto.tempoDeRespostaMs)),
      pontuacao: medidas.acerto,
    },
    notaGlobal,
    dimensoesMedidas: nomes,
    ausencias: notaGlobal === null ? ['Nenhuma tentativa desta sessão pôde ser medida.'] : [],
  };
}

interface TentativaResumivel {
  medicao?: MedicaoReal;
}

const ROTULO_DIMENSAO: Record<string, string> = {
  afinacao: 'afinação',
  estabilidadeDeAltura: 'constância da altura',
  tempoRitmico: 'precisão de tempo',
  estabilidadeRitmica: 'constância do pulso',
  sustentacao: 'sustentação',
  acerto: 'acerto das respostas',
};

function valorDaDimensao(m: MedicaoReal, nome: string): number | null {
  switch (nome) {
    case 'afinacao': return m.afinacao.pontuacao;
    case 'tempoRitmico': return m.tempoRitmico.pontuacao;
    case 'estabilidadeDeAltura': return m.estabilidadeDeAltura;
    case 'estabilidadeRitmica': return m.estabilidadeRitmica;
    case 'sustentacao': return m.sustentacao.pontuacao;
    case 'acerto': return m.acerto.pontuacao;
    default: return null;
  }
}

/**
 * Descreve a sessão pelas dimensões que ela realmente mediu.
 *
 * Antes eram três frases fixas relatando afinação, ritmo e consistência —
 * sempre as mesmas, mesmo numa sessão de teoria, onde nenhuma das três
 * existe.
 */
export function descreverSessao(tentativas: TentativaResumivel[], total: number): string[] {
  const medidas = tentativas
    .map((t) => t.medicao)
    .filter((m): m is MedicaoReal => Boolean(m) && m!.notaGlobal !== null);

  if (medidas.length === 0) {
    return [
      `Nenhuma das ${total} tentativas pôde ser medida. Confira o microfone antes da próxima sessão.`,
    ];
  }

  const agregada = agregarMedicoes(medidas);
  const linhas: string[] = [];

  for (const nome of agregada.dimensoesMedidas) {
    const valor = valorDaDimensao(agregada, nome);
    if (valor !== null) linhas.push(`${ROTULO_DIMENSAO[nome] ?? nome}: ${valor} de 100`);
  }

  if (agregada.afinacao.deviationCents !== null) {
    linhas.push(`desvio médio de afinação: ${agregada.afinacao.deviationCents} cents`);
  }
  if (agregada.tempoRitmico.desvioMedioMs !== null) {
    linhas.push(`desvio médio em relação ao pulso: ${agregada.tempoRitmico.desvioMedioMs} ms`);
  }
  if (medidas.length < total) {
    linhas.push(`${total - medidas.length} de ${total} tentativas não puderam ser medidas`);
  }

  return linhas;
}

const ACAO_POR_DIMENSAO: Record<string, string> = {
  afinacao:
    'Trabalhe com nota longa e afinador à vista, sem andamento, até fixar a referência.',
  estabilidadeDeAltura:
    'A altura oscila dentro da própria nota. Sustente notas longas observando a estabilidade antes de voltar ao repertório.',
  tempoRitmico:
    'Reduza o andamento em 15% e só volte a subir quando o desvio médio ficar abaixo de 20 ms.',
  estabilidadeRitmica:
    'O pulso varia entre os ataques. Pratique com metrônomo em subdivisão, não apenas no tempo forte.',
  sustentacao:
    'As durações estão saindo curtas ou longas demais. Conte a duração em voz alta antes de tocar.',
  acerto:
    'A dificuldade está no reconhecimento, não na execução. Volte às lições da micro-habilidade.',
};

/**
 * Recomendações derivadas da dimensão mais fraca.
 *
 * Recomendação genérica é ruído: quem lê "pratique com andamento reduzido"
 * depois de uma sessão de teoria aprende a ignorar a seção inteira.
 */
export function recomendarProximoPasso(tentativas: TentativaResumivel[]): string[] {
  const medidas = tentativas
    .map((t) => t.medicao)
    .filter((m): m is MedicaoReal => Boolean(m) && m!.notaGlobal !== null);

  if (medidas.length === 0) {
    return ['Refaça a sessão com o microfone liberado para que haja o que analisar.'];
  }

  const agregada = agregarMedicoes(medidas);
  const ordenadas = agregada.dimensoesMedidas
    .map((nome) => [nome, valorDaDimensao(agregada, nome)] as [string, number | null])
    .filter((p): p is [string, number] => typeof p[1] === 'number')
    .sort((a, b) => a[1] - b[1]);

  if (ordenadas.length === 0) return [];

  const [pior, notaPior] = ordenadas[0];
  const saida = [
    `${ROTULO_DIMENSAO[pior] ?? pior} foi a dimensão mais baixa (${notaPior} de 100). ${ACAO_POR_DIMENSAO[pior] ?? ''}`.trim(),
  ];

  const melhor = ordenadas[ordenadas.length - 1];
  if (melhor[1] >= 85 && melhor[0] !== pior) {
    saida.push(
      `${ROTULO_DIMENSAO[melhor[0]] ?? melhor[0]} já está consolidada (${melhor[1]} de 100) — não precisa de mais tempo agora.`
    );
  }

  return saida;
}
