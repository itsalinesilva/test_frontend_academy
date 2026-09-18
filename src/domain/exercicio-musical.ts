import { EntityId } from './types';
import { FaixaDeMaterial } from './matricula-no-practice';

/**
 * EXERCÍCIO MUSICAL — os tipos do laço de prática.
 *
 * A TRADUÇÃO QUE ESTE ARQUIVO REGISTRA
 * ------------------------------------
 * A adaptação de um curso de idioma para música é quase direta, e isso não é
 * coincidência: **notação musical é uma língua escrita, e o ouvido é a escuta
 * dela.** Onde há alfabeto, palavra e frase, a música tem nota, intervalo e
 * progressão.
 *
 *   letra      → nota          pronúncia  → altura tocada
 *   palavra    → intervalo     escrita    → notação na pauta
 *   frase      → progressão    significado→ função harmônica
 *
 * ONDE ISTO VAI ALÉM DA REFERÊNCIA
 * --------------------------------
 * Clicar na alternativa certa prova que a pessoa **reconhece**. Tocar a nota
 * certa prova que ela **sabe**. Um curso de idioma no navegador não tem como
 * medir a segunda coisa; aqui há microfone, detecção de altura por
 * autocorrelação e medição de desvio em cents — e por isso os tipos
 * `TOCAR`, `CANTAR` e `BATER_RITMO` existem desde o primeiro exercício.
 *
 * Mapeamento completo em `docs/paridade/VOL2_ASTRA_DUOLINGO.md` §B10.
 */

/**
 * Os tipos de exercício.
 *
 * Os sete primeiros têm equivalente direto na referência; os quatro últimos
 * são da plataforma, e dependem de captura de áudio ou de instrumento.
 */
export enum TipoDeExercicio {
  /** "Qual destas pautas mostra Dó maior?" — reconhecimento visual. */
  RECONHECER_NOTACAO = 'RECONHECER_NOTACAO',
  /** Soa um intervalo; escolher o nome. Som → nome. */
  IDENTIFICAR_DE_OUVIDO = 'IDENTIFICAR_DE_OUVIDO',
  /** Dado I–IV–V–I em Dó, fazer o mesmo em Sol. Analogia. */
  SEGUIR_O_PADRAO = 'SEGUIR_O_PADRAO',
  /** Ouvir e montar na pauta com as notas de um banco. */
  ESCREVER_NA_PAUTA = 'ESCREVER_NA_PAUTA',
  /** Parear cifra ↔ pauta, som ↔ nome, intervalo ↔ distância. */
  COMBINAR_PARES = 'COMBINAR_PARES',
  /** Ditado: só áudio, e escrever o que se ouviu. */
  DITADO = 'DITADO',
  /** Escolher a função harmônica: tônica, subdominante, dominante. */
  FUNCAO_HARMONICA = 'FUNCAO_HARMONICA',

  // ── Além da referência: exigem o que a pessoa faz, não o que ela aponta ──
  /** Tocar a resposta no instrumento; o microfone confere a altura. */
  TOCAR = 'TOCAR',
  /** Solfejar; o afinador mede o desvio em cents. */
  CANTAR = 'CANTAR',
  /** Executar a célula rítmica no andamento; mede-se o desvio em ms. */
  BATER_RITMO = 'BATER_RITMO',
  /** Apontar a posição no braço do instrumento. */
  APONTAR_NO_BRACO = 'APONTAR_NO_BRACO',
}

/** Só estes exigem microfone — e a tela precisa saber antes de abrir. */
export const EXIGE_MICROFONE: readonly TipoDeExercicio[] = [
  TipoDeExercicio.TOCAR,
  TipoDeExercicio.CANTAR,
  TipoDeExercicio.BATER_RITMO,
] as const;

export function exigeMicrofone(tipo: TipoDeExercicio): boolean {
  return EXIGE_MICROFONE.includes(tipo);
}

/**
 * A etiqueta que prepara a atenção.
 *
 * Vem da referência, e é barata de fazer: dizer "conteúdo novo" antes de
 * cobrar muda a disposição de quem responde. `REVISAO` é o caso em que o
 * exercício **volta** dentro da mesma lição, depois de ter sido errado.
 */
export type EtiquetaDoExercicio = 'CONTEUDO_NOVO' | 'PADRAO_NOVO' | 'PRATICA' | 'REVISAO';

export const TEXTO_DA_ETIQUETA: Record<EtiquetaDoExercicio, string> = {
  CONTEUDO_NOVO: 'Conteúdo novo',
  PADRAO_NOVO: 'Padrão novo',
  PRATICA: 'Prática',
  REVISAO: 'Corrija o erro de antes',
};

/** Uma alternativa — seja nota, acorde, nome ou pauta. */
export interface Alternativa {
  id: string;
  /** O que se lê. */
  rotulo: string;
  /**
   * O que se ouve ao tocar nela, em hertz.
   *
   * Na referência, clicar na palavra faz o personagem falá-la. Aqui a
   * alternativa **soa** — e num produto de música isso não é enfeite: é a
   * própria matéria do exercício.
   */
  frequenciasHz?: number[];
  /** Notação a desenhar, quando a alternativa é uma pauta. */
  notas?: string[];
}

export interface ExercicioMusical {
  id: EntityId;
  tipo: TipoDeExercicio;
  etiqueta: EtiquetaDoExercicio;
  /** Faixa de material — governa para quem este exercício aparece. */
  faixa: FaixaDeMaterial;
  /** Uma linha, no imperativo: "Ouça e identifique o intervalo". */
  enunciado: string;

  /** O que soa ao abrir o exercício, quando há. */
  audio?: {
    frequenciasHz: number[];
    /** Sequência ou simultâneo — melódico ou harmônico. */
    modo: 'SEQUENCIA' | 'ACORDE';
    /** Andamento, para células rítmicas. */
    bpm?: number;
  };

  alternativas: Alternativa[];
  /** Identificadores das alternativas corretas. Mais de um em `COMBINAR_PARES`. */
  corretas: string[];
  /** O que o aluno lê depois de responder. É a parte que ensina. */
  explicacao: string;

  /** Tonalidade do exercício — governa o som de acerto. Ver §B10.5. */
  tonalidadeHz?: number;
  /** Tolerância em cents, nos tipos que medem altura. */
  toleranciaCents?: number;
  /** Tolerância em milissegundos, nos tipos que medem tempo. */
  toleranciaMs?: number;
}

// ---------------------------------------------------------------------------
// O laço da lição
// ---------------------------------------------------------------------------

/**
 * Estado de uma lição em andamento.
 *
 * O que a referência resolve bem, e que este tipo preserva: **o erro não
 * termina a lição**. O exercício errado volta mais tarde, marcado como
 * revisão, e a lição só fecha quando o que se errou foi refeito.
 *
 * Isso não é punição: é repetição espaçada dentro da sessão. O erro vira a
 * matéria da própria lição.
 */
export interface LicaoEmAndamento {
  licaoId: EntityId;
  /** A fila, na ordem em que será apresentada. */
  fila: ExercicioMusical[];
  /** Posição atual na fila. */
  indice: number;
  /** Errados que ainda precisam voltar. */
  aRefazer: EntityId[];
  /** Vidas restantes. Zero **não** trava — passa a acumular débito. */
  vidas: number;
  /** Acertos seguidos. Governa o combo. */
  seguidos: number;
  /** Maior sequência da lição. */
  melhorSequencia: number;
  acertos: number;
  erros: number;
}

export const VIDAS_POR_LICAO = 5;

/**
 * A partir de quantos acertos seguidos o combo acende.
 *
 * Na referência, a barra muda de verde para amarelo. Cinco é o ponto em que
 * a sequência deixa de ser sorte.
 */
export const SEGUIDOS_PARA_COMBO = 5;

export function iniciarLicao(licaoId: EntityId, fila: ExercicioMusical[]): LicaoEmAndamento {
  return {
    licaoId,
    fila,
    indice: 0,
    aRefazer: [],
    vidas: VIDAS_POR_LICAO,
    seguidos: 0,
    melhorSequencia: 0,
    acertos: 0,
    erros: 0,
  };
}

export function exercicioAtual(licao: LicaoEmAndamento): ExercicioMusical | null {
  return licao.fila[licao.indice] ?? null;
}

/**
 * Registra a resposta e devolve o estado seguinte.
 *
 * **Função pura.** O estado da lição não é mutado: devolve-se outro. É o que
 * permite testar o laço inteiro sem interface, e o que evita que duas partes
 * da tela discordem sobre quantas vidas restam.
 */
export function responder(
  licao: LicaoEmAndamento,
  acertou: boolean
): LicaoEmAndamento {
  const atual = exercicioAtual(licao);
  if (!atual) return licao;

  if (acertou) {
    const seguidos = licao.seguidos + 1;
    return {
      ...licao,
      indice: licao.indice + 1,
      seguidos,
      melhorSequencia: Math.max(licao.melhorSequencia, seguidos),
      acertos: licao.acertos + 1,
      /**
       * Acertar na revisão tira o exercício da fila de pendências.
       *
       * Sem isto, um exercício errado uma vez voltaria para sempre — e a
       * lição não fecharia nunca.
       */
      aRefazer: licao.aRefazer.filter((id) => id !== atual.id),
    };
  }

  return {
    ...licao,
    indice: licao.indice + 1,
    seguidos: 0,
    erros: licao.erros + 1,
    /** Vidas não ficam negativas: ao chegar a zero, o débito é que acumula. */
    vidas: Math.max(0, licao.vidas - 1),
    aRefazer: licao.aRefazer.includes(atual.id)
      ? licao.aRefazer
      : [...licao.aRefazer, atual.id],
  };
}

/** Pular não pune, e não entra na contagem de erro — mas também não acerta. */
export function pular(licao: LicaoEmAndamento): LicaoEmAndamento {
  return { ...licao, indice: licao.indice + 1, seguidos: 0 };
}

/**
 * Acabou a fila e não há pendência?
 *
 * A lição **não** fecha só por chegar ao fim da fila: se houver exercício
 * errado, ele volta. Ver `prepararRevisao`.
 */
export function licaoConcluida(licao: LicaoEmAndamento): boolean {
  return licao.indice >= licao.fila.length && licao.aRefazer.length === 0;
}

/**
 * Enfileira de novo o que foi errado, marcado como revisão.
 *
 * Chamado quando a fila acaba e ainda há pendência. Os exercícios voltam com
 * a etiqueta `REVISAO` — que é o que a referência mostra como "corrija o erro
 * de antes".
 */
export function prepararRevisao(licao: LicaoEmAndamento): LicaoEmAndamento {
  if (licao.indice < licao.fila.length || licao.aRefazer.length === 0) return licao;

  const paraRefazer = licao.aRefazer
    .map((id) => licao.fila.find((e) => e.id === id))
    .filter((e): e is ExercicioMusical => e !== undefined)
    .map((e) => ({ ...e, etiqueta: 'REVISAO' as const }));

  return { ...licao, fila: [...licao.fila, ...paraRefazer] };
}

/** O combo está aceso? Governa a cor da barra de progresso. */
export function emCombo(licao: LicaoEmAndamento): boolean {
  return licao.seguidos >= SEGUIDOS_PARA_COMBO;
}

/**
 * Quanto da lição já passou, de 0 a 1.
 *
 * Conta sobre a fila **atual**, que cresce quando há revisão. Por isso a
 * barra pode recuar ao entrar em revisão — e isso é honesto: ainda falta.
 */
export function progresso(licao: LicaoEmAndamento): number {
  if (licao.fila.length === 0) return 1;
  return Math.min(1, licao.indice / licao.fila.length);
}

/**
 * Precisão da lição.
 *
 * `null` antes da primeira resposta — e `null` é diferente de zero por cento.
 * A tela precisa distinguir "ainda não respondeu" de "errou tudo".
 */
export function precisao(licao: LicaoEmAndamento): number | null {
  const respondidas = licao.acertos + licao.erros;
  return respondidas === 0 ? null : Math.round((licao.acertos / respondidas) * 100);
}
