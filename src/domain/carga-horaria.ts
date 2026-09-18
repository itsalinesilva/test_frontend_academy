import { LessonBlock } from './academy';
import { Questao } from './booklet';

/**
 * Cálculo de carga horária.
 *
 * POR QUE ISTO EXISTE
 * -------------------
 * Os minutos de cada capítulo eram números escolhidos à mão — "40 min" porque
 * parecia razoável. Um curso que declara 35 horas sem ter contado nada está
 * dizendo ao aluno uma coisa que não verificou.
 *
 * Aqui a carga é **medida**: conta-se o texto que o aluno lê, o tempo de cada
 * laboratório e o tempo de cada questão. Muda o conteúdo, muda a carga.
 *
 * AS CONSTANTES, E DE ONDE VÊM
 * ----------------------------
 * A velocidade de leitura de texto técnico fica bem abaixo da leitura
 * corrente, porque quem estuda relê, para para pensar e volta. Usamos **160
 * palavras por minuto**, valor intermediário na faixa usualmente citada para
 * leitura de estudo — não é o extremo conservador, e convém dizer isso: quem
 * lê devagar levará mais tempo que o anunciado.
 *
 * Uma limitação conhecida: tabelas e exemplos musicais contam poucas palavras
 * e são lidos devagar, então a estimativa os subestima. Capítulos com muita
 * tabela têm carga real um pouco maior que a calculada.
 *
 * Os tempos de laboratório e de questão são medidos pelo que a interação
 * exige, não estimados por impressão.
 */

/** Palavras por minuto, leitura de estudo de texto técnico. */
export const PALAVRAS_POR_MINUTO = 160;

/**
 * Minutos por tipo de bloco, além do texto que ele contém.
 *
 * Um laboratório de intervalo exige ouvir, comparar e pedir a análise — três
 * ações, cada uma com sua espera. Um checkpoint exige ler quatro alternativas,
 * decidir e ler a explicação.
 */
export const MINUTOS_POR_BLOCO: Record<LessonBlock['kind'], number> = {
  MARKDOWN: 0, // só o tempo do texto
  CALLOUT: 0, // idem
  AUDIO_EXAMPLE: 1,
  INTERVAL_LAB: 2,
  CHORD_LAB: 2,
  SCALE_LAB: 2,
  KEYBOARD: 1,
  STAFF: 1,
  DIAGRAM: 1,
  CHECKPOINT: 2,
  SLIDES: 2,
  VIDEO_PLACEHOLDER: 0,
};

/**
 * Minutos para responder uma questão, conforme o tamanho.
 *
 * Entre três e cinco minutos: uma questão curta de reconhecimento resolve-se
 * em três; uma longa, com alternativas extensas que exigem comparação, leva
 * cinco. O tamanho do enunciado somado ao das alternativas é o que separa.
 */
export function minutosDaQuestao(q: Questao): number {
  const palavras =
    contarPalavras(q.enunciado) +
    q.alternativas.reduce((a, alt) => a + contarPalavras(alt.texto), 0);

  if (palavras <= 30) return 3;
  if (palavras <= 60) return 4;
  return 5;
}

export function contarPalavras(texto: string): number {
  return texto
    .replace(/[#*_`|>-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Todo o texto que o aluno lê num bloco. */
function textoDoBloco(b: LessonBlock): string {
  switch (b.kind) {
    case 'MARKDOWN':
      return b.markdown;
    case 'CALLOUT':
      return `${b.title} ${b.text}`;
    case 'CHECKPOINT':
      return `${b.question} ${b.options.join(' ')} ${b.explanation}`;
    case 'AUDIO_EXAMPLE':
      return `${b.title} ${b.description ?? ''}`;
    case 'INTERVAL_LAB':
    case 'CHORD_LAB':
      return `${b.title} ${b.prompt ?? ''}`;
    case 'SCALE_LAB':
      return b.title;
    case 'KEYBOARD':
      return b.title ?? '';
    case 'STAFF':
      return `${b.title ?? ''} ${b.caption ?? ''}`;
    case 'DIAGRAM':
      return `${b.title} ${b.caption ?? ''}`;
    case 'SLIDES':
      return `${b.title} ${b.slides.map((s) => `${s.heading} ${s.body} ${s.note ?? ''}`).join(' ')}`;
    case 'VIDEO_PLACEHOLDER':
      return b.topic;
    default:
      return '';
  }
}

export interface CargaDaLicao {
  minutosDeLeitura: number;
  minutosDeInteracao: number;
  minutosDeExercicio: number;
  total: number;
  palavras: number;
}

/**
 * Carga de uma lição: leitura + interação + exercícios do capítulo.
 *
 * O resultado é arredondado para cima, ao minuto. Arredondar de cinco em
 * cinco parecia mais honesto quanto à precisão — e colapsava cento e vinte e
 * seis lições em três valores, escondendo que um capítulo tem o dobro do
 * texto do outro. A perda de informação era pior que a falsa precisão.
 */
export function calcularCargaDaLicao(
  blocos: LessonBlock[],
  questoes: Questao[] = []
): CargaDaLicao {
  const palavras = blocos.reduce((a, b) => a + contarPalavras(textoDoBloco(b)), 0);
  const minutosDeLeitura = palavras / PALAVRAS_POR_MINUTO;
  const minutosDeInteracao = blocos.reduce((a, b) => a + (MINUTOS_POR_BLOCO[b.kind] ?? 0), 0);
  const minutosDeExercicio = questoes.reduce((a, q) => a + minutosDaQuestao(q), 0);

  const bruto = minutosDeLeitura + minutosDeInteracao + minutosDeExercicio;

  return {
    minutosDeLeitura: Math.round(minutosDeLeitura),
    minutosDeInteracao,
    minutosDeExercicio,
    total: Math.max(5, Math.ceil(bruto)),
    palavras,
  };
}

/** Carga do curso, em horas, arredondada para cima. */
export function horasDoCurso(minutosDasLicoes: number[]): number {
  return Math.ceil(minutosDasLicoes.reduce((a, m) => a + m, 0) / 60);
}
