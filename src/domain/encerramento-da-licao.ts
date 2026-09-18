import {
  LicaoEmAndamento,
  SEGUIDOS_PARA_COMBO,
  licaoConcluida,
  precisao,
} from './exercicio-musical';
import {
  CONCLUSOES_PARA_ENTRAR_NA_LIGA,
  XP,
  nivelDe,
  xpDaLicao,
} from './economia-de-progresso';

/**
 * O que se mostra quando a lição acaba.
 *
 * A referência encerra em etapas — uma conquista por tela, e não um painel
 * com seis números. A razão é que cada tela dá tempo de a conquista *chegar*;
 * um painel único faz todas competirem, e nenhuma é lida.
 *
 * A REGRA DURA
 * ------------
 * **Nenhuma tela de conquista sem conquista.** Não existe "Ofensiva: 0 dias"
 * nem "Melhor sequência: 1". Uma tela comemorando o que não aconteceu ensina
 * a pessoa a pular a sequência inteira — e aí a conquista real, quando vier,
 * também será pulada.
 *
 * Por isso este módulo **decide**, e a tela só desenha o que ele devolveu. Se
 * a lista vier com dois itens, são duas telas.
 */

export type ChaveDaConquista =
  | 'XP'
  | 'PRECISAO'
  | 'SEQUENCIA'
  | 'NIVEL'
  | 'OFENSIVA'
  | 'META_DO_DIA'
  | 'ENTRADA_NA_LIGA';

export interface Conquista {
  chave: ChaveDaConquista;
  /** O nome da coisa. */
  titulo: string;
  /** O número, já formatado — é o que a pessoa lê primeiro. */
  valor: string;
  /** Uma linha dizendo o que aquilo significa. Nunca vazia. */
  legenda: string;
}

export interface ContextoDoEncerramento {
  /** XP acumulado antes desta lição — para saber se ela fez subir de nível. */
  xpAcumuladoAntes: number;
  /** Dias de ofensiva depois desta lição. */
  ofensivaEmDias: number;
  /** Esta lição foi o que sustentou o dia, ou o dia já estava sustentado? */
  sustentouODiaAgora: boolean;
  /** A meta do dia se cumpriu com esta lição? */
  cumpriuAMetaAgora: boolean;
  /** Quantas lições ou exercícios a pessoa já havia concluído antes desta. */
  conclusoesAntes: number;
}

/**
 * A sequência de telas do encerramento, em ordem.
 *
 * A ordem não é decorativa: começa no que a lição rendeu — que é o que a
 * pessoa acabou de fazer — e termina no que mudou de lugar no mundo dela
 * (nível, ofensiva, liga). Ir do geral ao particular faria a conquista maior
 * chegar antes de a pessoa saber por quê.
 *
 * Lição não concluída não encerra: quem saiu no meio não colheu.
 */
export function sequenciaDeEncerramento(
  licao: LicaoEmAndamento,
  contexto: ContextoDoEncerramento
): Conquista[] {
  if (!licaoConcluida(licao)) return [];

  const conquistas: Conquista[] = [];
  const ganho = xpDaLicao(licao);

  conquistas.push({
    chave: 'XP',
    titulo: 'Experiência',
    valor: `+${ganho} XP`,
    legenda:
      licao.erros > 0
        ? `${licao.acertos} acertos e ${licao.erros} erros — o erro também conta, porque você praticou.`
        : 'Cada resposta certa vale mais, e nenhuma tentativa vale zero.',
  });

  const acerto = precisao(licao);
  if (acerto !== null) {
    conquistas.push({
      chave: 'PRECISAO',
      titulo: 'Precisão',
      valor: `${acerto}%`,
      legenda:
        acerto === 100
          ? 'Lição inteira sem um erro.'
          : 'Proporção de acertos entre o que você respondeu — pular não entra na conta.',
    });
  }

  /** Sequência só é sequência a partir do limiar; "1 seguido" não é notícia. */
  if (licao.melhorSequencia >= SEGUIDOS_PARA_COMBO) {
    conquistas.push({
      chave: 'SEQUENCIA',
      titulo: 'Sequência',
      valor: `${licao.melhorSequencia} seguidos`,
      legenda: 'Foi a maior corrida de acertos desta lição.',
    });
  }

  const antes = nivelDe(contexto.xpAcumuladoAntes);
  const agora = nivelDe(contexto.xpAcumuladoAntes + ganho);
  if (agora.nivel > antes.nivel) {
    conquistas.push({
      chave: 'NIVEL',
      titulo: 'Novo nível',
      valor: `Nível ${agora.nivel}`,
      legenda: `O próximo custa ${agora.xpDoNivel} de experiência.`,
    });
  }

  /** Só se esta lição sustentou o dia: repetir a ofensiva a cada lição é ruído. */
  if (contexto.sustentouODiaAgora) {
    conquistas.push({
      chave: 'OFENSIVA',
      titulo: 'Ofensiva',
      valor: contexto.ofensivaEmDias === 1 ? '1 dia' : `${contexto.ofensivaEmDias} dias`,
      legenda:
        contexto.ofensivaEmDias === 1
          ? 'Começou hoje. Volte amanhã e vira dois.'
          : 'Dias seguidos de estudo. Um dia inteiro sem praticar zera.',
    });
  }

  if (contexto.cumpriuAMetaAgora) {
    conquistas.push({
      chave: 'META_DO_DIA',
      titulo: 'Meta do dia',
      valor: `+${XP.META_DO_DIA} XP`,
      legenda: 'Você cumpriu o que tinha combinado consigo para hoje.',
    });
  }

  /** A entrada na liga acontece uma vez, e é notícia uma vez. */
  const conclusoesAgora = contexto.conclusoesAntes + 1;
  if (
    contexto.conclusoesAntes < CONCLUSOES_PARA_ENTRAR_NA_LIGA &&
    conclusoesAgora >= CONCLUSOES_PARA_ENTRAR_NA_LIGA
  ) {
    conquistas.push({
      chave: 'ENTRADA_NA_LIGA',
      titulo: 'Você entrou na liga',
      valor: 'Bronze',
      legenda: 'A classificação é por experiência da semana, de segunda a domingo.',
    });
  }

  return conquistas;
}

/** §3 — a pessoa escolhe a própria meta de constância. */
export const METAS_DE_OFENSIVA = [7, 14, 30] as const;
export type MetaDeOfensiva = (typeof METAS_DE_OFENSIVA)[number];

/**
 * Convém propor a meta agora?
 *
 * Só quem já tem ofensiva viva e ainda não escolheu meta. Propor no primeiro
 * dia é pedir compromisso a quem ainda não sabe se vai voltar; propor a quem
 * já escolheu é insistir.
 */
export function convemPropormeta(
  ofensivaEmDias: number,
  metaAtual: MetaDeOfensiva | null
): boolean {
  return metaAtual === null && ofensivaEmDias >= 2;
}

/**
 * Quanto falta para a meta.
 *
 * `null` quando não há meta — a tela não deve inventar uma para ter o que
 * mostrar.
 */
export function faltamParaAMeta(
  ofensivaEmDias: number,
  meta: MetaDeOfensiva | null
): number | null {
  if (meta === null) return null;
  return Math.max(0, meta - ofensivaEmDias);
}
