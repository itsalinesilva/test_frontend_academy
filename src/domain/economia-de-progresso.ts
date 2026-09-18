import { LicaoEmAndamento, licaoConcluida, precisao } from './exercicio-musical';

/**
 * A economia de progresso, em código.
 *
 * `docs/harness/76_ECONOMIA_DE_PROGRESSO.md` §2 se declara **a autoridade**:
 * valor que não está lá não é atribuído. Até agora, porém, a tabela existia
 * só como prosa — e foi exatamente por isso que o perfil pôde divergir dela e
 * anunciar 1920 de XP e nível 12 a quem nunca praticou.
 *
 * Aqui os mesmos valores existem como constante única. O documento continua
 * sendo a autoridade sobre *quanto vale cada coisa*; este módulo é o único
 * lugar autorizado a dizer esse número ao resto do sistema, e
 * `scripts/qa/economia.mjs` falha se os dois discordarem.
 *
 * AS QUATRO MOEDAS NÃO SE MISTURAM (§1)
 * -------------------------------------
 * **XP** mede esforço e nunca zera. **Score** mede qualidade. **Ofensiva**
 * mede constância e zera ao pular um dia. **Débito** mede erro e só sai
 * quitando.
 *
 * Uma moeda só apagaria a diferença entre quem pratica muito e erra muito e
 * quem pratica pouco e acerta — e essa diferença é informação verdadeira
 * sobre a pessoa.
 */

/** §2 — a tabela de contagem. Nenhum outro lugar declara valor de XP. */
export const XP = {
  // Academy — estudo
  LICAO_CONCLUIDA: 10,
  CHECKPOINT_ACERTADO: 5,
  ATIVIDADE_CONCLUIDA: 15,
  SIMULADO_CONCLUIDO: 25,
  PROVA_APROVADA: 100,
  PROVA_REPROVADA: 25,
  CURSO_CONCLUIDO: 250,
  CERTIFICADO_EMITIDO: 50,

  // Practice — treino
  EXERCICIO_ACERTADO: 25,
  EXERCICIO_ERRADO: 5,
  RODADA_CONCLUIDA: 20,
  MISSAO_DIARIA: 50,
  META_DO_DIA: 30,

  // Atlas — exploração
  OBRA_ANALISADA: 40,
  EXCURSAO_CONCLUIDA: 120,

  // Comunidade
  TOPICO_ABERTO: 10,
  RESPOSTA_PUBLICADA: 5,
  RESPOSTA_ACEITA: 30,
  AVALIACAO_ESCRITA: 15,
} as const;

/**
 * Errar também paga (§2).
 *
 * Cinco contra vinte e cinco: acertar vale muito mais, mas quem errou
 * praticou. XP mede esforço, e zerar o erro ensinaria a não tentar o que
 * ainda não se domina — que é justamente o que mais precisa ser tentado.
 */
export const EXERCICIOS_POR_RODADA = 10;

/** §6 — ninguém entra na liga antes disto. */
export const CONCLUSOES_PARA_ENTRAR_NA_LIGA = 3;

/**
 * Nível.
 *
 * Cada nível custa mais que o anterior — `100 × n`. É a única progressão que
 * não precisa de tabela nova a cada faixa, e mantém o nível como leitura de
 * esforço acumulado, não de mérito: ninguém *perde* nível.
 */
export const CUSTO_BASE_DO_NIVEL = 100;

export interface Nivel {
  nivel: number;
  /** Quanto do nível atual já foi vencido. */
  xpNoNivel: number;
  /** Quanto o nível atual custa por inteiro. */
  xpDoNivel: number;
}

export function custoDoNivel(nivel: number): number {
  return CUSTO_BASE_DO_NIVEL * nivel;
}

export function nivelDe(totalXp: number): Nivel {
  let nivel = 1;
  let restante = Math.max(0, Math.floor(totalXp));

  while (restante >= custoDoNivel(nivel)) {
    restante -= custoDoNivel(nivel);
    nivel += 1;
  }

  return { nivel, xpNoNivel: restante, xpDoNivel: custoDoNivel(nivel) };
}

/**
 * O que uma lição do Practice rende.
 *
 * A rodada só paga o bônus quando de fato teve dez exercícios **e** terminou.
 * Pagar o bônus a quem saiu no meio seria pagar por rodada que não houve.
 */
export function xpDaLicao(licao: LicaoEmAndamento): number {
  const porResposta =
    licao.acertos * XP.EXERCICIO_ACERTADO + licao.erros * XP.EXERCICIO_ERRADO;

  const rodadaInteira =
    licaoConcluida(licao) && licao.fila.length >= EXERCICIOS_POR_RODADA
      ? XP.RODADA_CONCLUIDA
      : 0;

  return porResposta + rodadaInteira;
}

/**
 * Score da lição — qualidade, e não esforço.
 *
 * `null` quando não houve resposta: é diferente de zero por cento. A tela
 * precisa distinguir "ainda não praticou" de "errou tudo", e foi confundir os
 * dois que fez o perfil anunciar 86% de precisão a quem nunca tocou.
 */
export function scoreDaLicao(licao: LicaoEmAndamento): number | null {
  const p = precisao(licao);
  return p === null ? null : Math.round(p * 10);
}
