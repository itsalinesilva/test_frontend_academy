import { EntityId, ISOTimestamp } from './types';

/**
 * LIGA — competição semanal por desempenho.
 *
 * A DECISÃO QUE ESTE ARQUIVO REGISTRA
 * -----------------------------------
 * A liga se constrói **agora**, completa, mesmo sem haver um único
 * participante. A instrução foi direta:
 *
 *   *"Você vai criar a liga, obviamente. O que você não vai criar é
 *   resultados falsos. Temos que criar tudo, porque o projeto precisa ficar
 *   completo. O que não há de dados não há e ponto — mas quando houver, e
 *   vai haver, tem que estar tudo pronto pra isso acontecer."*
 *
 * A distinção é a que atravessa o projeto inteiro: **mecanismo ≠ dado**.
 * Construir a apuração, a subida, a queda e o fechamento da semana é
 * engenharia. Preencher a tabela com Bach em primeiro lugar é mentira — e já
 * aconteceu aqui.
 *
 * Por isso tudo abaixo é função pura: recebe as inscrições que existirem e
 * devolve o resultado. Com zero inscrições, devolve zero linhas, e isso não é
 * falha — é a resposta certa.
 */

export enum FaixaDaLiga {
  BRONZE = 'BRONZE',
  PRATA = 'PRATA',
  OURO = 'OURO',
  PLATINA = 'PLATINA',
  DIAMANTE = 'DIAMANTE',
  CONSERVATORIO = 'CONSERVATORIO',
}

/** Da mais baixa à mais alta. A ordem é a mecânica de subida e queda. */
export const FAIXAS_EM_ORDEM: readonly FaixaDaLiga[] = [
  FaixaDaLiga.BRONZE,
  FaixaDaLiga.PRATA,
  FaixaDaLiga.OURO,
  FaixaDaLiga.PLATINA,
  FaixaDaLiga.DIAMANTE,
  FaixaDaLiga.CONSERVATORIO,
] as const;

export const NOME_DA_FAIXA: Record<FaixaDaLiga, string> = {
  [FaixaDaLiga.BRONZE]: 'Bronze',
  [FaixaDaLiga.PRATA]: 'Prata',
  [FaixaDaLiga.OURO]: 'Ouro',
  [FaixaDaLiga.PLATINA]: 'Platina',
  [FaixaDaLiga.DIAMANTE]: 'Diamante',
  [FaixaDaLiga.CONSERVATORIO]: 'Conservatório',
};

/**
 * O recorte em que a liga acontece.
 *
 * Responde "campeonato de quê". A mesma pessoa compete em vários ao mesmo
 * tempo — e é isso que dá sentido à comparação: "o melhor da plataforma" diz
 * pouco; "o melhor da tribo dos violinistas" diz muito.
 */
export type TipoDeRecorte = 'PLATAFORMA' | 'CURSO' | 'TRIBO' | 'ERA';

export interface RecorteDaLiga {
  tipo: TipoDeRecorte;
  /** Ausente quando o tipo é `PLATAFORMA`, que não recorta nada. */
  entidadeId?: EntityId;
}

export function chaveDoRecorte(r: RecorteDaLiga): string {
  return r.entidadeId ? `${r.tipo}:${r.entidadeId}` : r.tipo;
}

/** A inscrição de alguém numa liga, numa semana. */
export interface InscricaoNaLiga {
  userId: EntityId;
  recorte: RecorteDaLiga;
  faixa: FaixaDaLiga;
  /** Segunda-feira da semana, em ISO — `2026-09-14`. */
  semana: string;
  /** XP **da semana**. Esforço, não acúmulo histórico. */
  xpDaSemana: number;
  /** Quando entrou nesta faixa. */
  desde: ISOTimestamp;
}

export interface LinhaDaClassificacao {
  posicao: number;
  userId: EntityId;
  xpDaSemana: number;
  /** Para onde vai no fim da semana, se a posição se mantiver. */
  destino: 'SOBE' | 'FICA' | 'CAI';
}

// ---------------------------------------------------------------------------
// Regras
// ---------------------------------------------------------------------------

/**
 * Quantos concluídos para entrar.
 *
 * Existe para que a liga não seja uma lista de gente que abriu a plataforma
 * e não fez nada. Três é o número da referência, e serve.
 */
export const CONCLUIDOS_PARA_ENTRAR = 3;

/** Fração do topo que sobe, e fração da base que cai. */
export const FRACAO_QUE_SOBE = 0.2;
export const FRACAO_QUE_CAI = 0.2;

/**
 * A segunda-feira da semana de uma data.
 *
 * A semana da liga vai de segunda a domingo, **no fuso do dispositivo** — a
 * mesma regra que a ofensiva usa para virar o dia. Ter duas noções de "hoje"
 * faria a pessoa fechar a ofensiva num dia e trocar de semana de liga noutro.
 *
 * Por isso a data é lida pelos acessores LOCAIS e só depois normalizada: um
 * instante à meia-noite UTC pode ainda ser o domingo anterior aqui, e é o
 * domingo daqui que vale.
 *
 * Calcular isso em dois lugares diferentes é como duas telas passam a
 * discordar sobre em que semana a pessoa está.
 */
export function semanaDe(data: Date): string {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  // getUTCDay: 0 = domingo. Recuar até segunda.
  const diaDaSemana = d.getUTCDay();
  const recuo = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
  d.setUTCDate(d.getUTCDate() - recuo);
  return d.toISOString().slice(0, 10);
}

/**
 * Apura a classificação de um recorte.
 *
 * **Função pura, e é o ponto.** Recebe as inscrições que existirem e devolve
 * a tabela. Com a lista vazia, devolve vazio — e a tela mostra o esqueleto,
 * que é a forma correta de exibir uma tabela sem gente: mostra o **formato**,
 * sem inventar participante.
 */
export function apurarClassificacao(
  inscricoes: InscricaoNaLiga[],
  recorte: RecorteDaLiga,
  faixa: FaixaDaLiga,
  semana: string
): LinhaDaClassificacao[] {
  const chave = chaveDoRecorte(recorte);
  const participantes = inscricoes
    .filter(
      (i) =>
        chaveDoRecorte(i.recorte) === chave && i.faixa === faixa && i.semana === semana
    )
    /**
     * Empate desempatado pelo identificador.
     *
     * Não por ser justo — é arbitrário —, mas por ser **estável**: sem
     * critério de desempate, duas apurações da mesma semana devolveriam
     * ordens diferentes, e a pessoa veria a própria posição oscilar sem nada
     * ter acontecido.
     */
    .sort((a, b) => b.xpDaSemana - a.xpDaSemana || a.userId.localeCompare(b.userId));

  const total = participantes.length;
  const quantosSobem = total === 0 ? 0 : Math.max(1, Math.floor(total * FRACAO_QUE_SOBE));
  const quantosCaem = total === 0 ? 0 : Math.max(1, Math.floor(total * FRACAO_QUE_CAI));

  return participantes.map((i, indice) => ({
    posicao: indice + 1,
    userId: i.userId,
    xpDaSemana: i.xpDaSemana,
    destino: destinoDaPosicao(indice, total, quantosSobem, quantosCaem, faixa),
  }));
}

function destinoDaPosicao(
  indice: number,
  total: number,
  quantosSobem: number,
  quantosCaem: number,
  faixa: FaixaDaLiga
): LinhaDaClassificacao['destino'] {
  /**
   * Quem está sozinho não sobe nem cai.
   *
   * Com um participante só, "os 20% do topo" e "os 20% da base" seriam a
   * mesma pessoa — e ela subiria e cairia ao mesmo tempo. Competição de um
   * não é competição.
   */
  if (total < 2) return 'FICA';

  const noTopo = FAIXAS_EM_ORDEM.indexOf(faixa) === FAIXAS_EM_ORDEM.length - 1;
  const naBase = FAIXAS_EM_ORDEM.indexOf(faixa) === 0;

  if (indice < quantosSobem) return noTopo ? 'FICA' : 'SOBE';
  if (indice >= total - quantosCaem) return naBase ? 'FICA' : 'CAI';
  return 'FICA';
}

/** A faixa seguinte, ou a mesma se já for a mais alta. */
export function faixaAcima(faixa: FaixaDaLiga): FaixaDaLiga {
  const i = FAIXAS_EM_ORDEM.indexOf(faixa);
  return FAIXAS_EM_ORDEM[Math.min(i + 1, FAIXAS_EM_ORDEM.length - 1)];
}

/** A faixa anterior, ou a mesma se já for a mais baixa. */
export function faixaAbaixo(faixa: FaixaDaLiga): FaixaDaLiga {
  const i = FAIXAS_EM_ORDEM.indexOf(faixa);
  return FAIXAS_EM_ORDEM[Math.max(i - 1, 0)];
}

/**
 * Fecha a semana: aplica subidas e quedas, e abre a semana seguinte.
 *
 * O XP da semana **zera**. É o que faz a liga medir esforço recente em vez de
 * acúmulo histórico — sem isso, quem começou primeiro ficaria no topo para
 * sempre, e a competição deixaria de existir para quem chega depois.
 */
export function fecharSemana(
  inscricoes: InscricaoNaLiga[],
  semana: string,
  proximaSemana: string
): InscricaoNaLiga[] {
  const recortes = new Map<string, RecorteDaLiga>();
  for (const i of inscricoes) recortes.set(chaveDoRecorte(i.recorte), i.recorte);

  const resultado: InscricaoNaLiga[] = [];
  const agora = new Date().toISOString();

  for (const recorte of recortes.values()) {
    for (const faixa of FAIXAS_EM_ORDEM) {
      for (const linha of apurarClassificacao(inscricoes, recorte, faixa, semana)) {
        const nova =
          linha.destino === 'SOBE'
            ? faixaAcima(faixa)
            : linha.destino === 'CAI'
              ? faixaAbaixo(faixa)
              : faixa;

        resultado.push({
          userId: linha.userId,
          recorte,
          faixa: nova,
          semana: proximaSemana,
          xpDaSemana: 0,
          desde: nova === faixa ? existenteDesde(inscricoes, linha.userId, recorte) ?? agora : agora,
        });
      }
    }
  }
  return resultado;
}

function existenteDesde(
  inscricoes: InscricaoNaLiga[],
  userId: EntityId,
  recorte: RecorteDaLiga
): ISOTimestamp | null {
  const chave = chaveDoRecorte(recorte);
  return (
    inscricoes.find((i) => i.userId === userId && chaveDoRecorte(i.recorte) === chave)?.desde ??
    null
  );
}

/**
 * A posição de alguém, sem precisar da tabela inteira.
 *
 * `null` quando a pessoa não está inscrita — e `null` é diferente de estar em
 * último. A tela precisa distinguir "ainda não entrou" de "está por último".
 */
export function posicaoDe(
  classificacao: LinhaDaClassificacao[],
  userId: EntityId
): LinhaDaClassificacao | null {
  return classificacao.find((l) => l.userId === userId) ?? null;
}
