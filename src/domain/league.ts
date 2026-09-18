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

export enum LeagueTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  CONSERVATORY = 'CONSERVATORY',
}

/** Da mais baixa à mais alta. A ordem é a mecânica de subida e queda. */
export const TIERS_IN_ORDER: readonly LeagueTier[] = [
  LeagueTier.BRONZE,
  LeagueTier.SILVER,
  LeagueTier.GOLD,
  LeagueTier.PLATINUM,
  LeagueTier.DIAMOND,
  LeagueTier.CONSERVATORY,
] as const;

export const TIER_NAME: Record<LeagueTier, string> = {
  [LeagueTier.BRONZE]: 'Bronze',
  [LeagueTier.SILVER]: 'Prata',
  [LeagueTier.GOLD]: 'Ouro',
  [LeagueTier.PLATINUM]: 'Platina',
  [LeagueTier.DIAMOND]: 'Diamante',
  [LeagueTier.CONSERVATORY]: 'Conservatório',
};

/**
 * O recorte em que a liga acontece.
 *
 * Responde "campeonato de quê". A mesma pessoa compete em vários ao mesmo
 * tempo — e é isso que dá sentido à comparação: "o melhor da plataforma" diz
 * pouco; "o melhor da tribo dos violinistas" diz muito.
 */
export type LeagueScopeType = 'PLATFORM' | 'COURSE' | 'TRIBE' | 'ERA';

export interface LeagueScope {
  tipo: LeagueScopeType;
  /** Ausente quando o tipo é `PLATAFORMA`, que não recorta nada. */
  entidadeId?: EntityId;
}

export function leagueScopeKey(r: LeagueScope): string {
  return r.entidadeId ? `${r.tipo}:${r.entidadeId}` : r.tipo;
}

/** A inscrição de alguém numa liga, numa semana. */
export interface LeagueEntry {
  userId: EntityId;
  recorte: LeagueScope;
  faixa: LeagueTier;
  /** Segunda-feira da semana, em ISO — `2026-09-14`. */
  semana: string;
  /** XP **da semana**. Esforço, não acúmulo histórico. */
  weeklyXp: number;
  /** Quando entrou nesta faixa. */
  desde: ISOTimestamp;
}

export interface StandingRow {
  posicao: number;
  userId: EntityId;
  weeklyXp: number;
  /** Para onde vai no fim da semana, se a posição se mantiver. */
  destino: 'PROMOTED' | 'STAYS' | 'RELEGATED';
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
export const COMPLETIONS_TO_ENTER = 3;

/** Fração do topo que sobe, e fração da base que cai. */
export const FRACTION_PROMOTED = 0.2;
export const FRACTION_RELEGATED = 0.2;

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
export function weekOf(data: Date): string {
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
export function computeStandings(
  inscricoes: LeagueEntry[],
  recorte: LeagueScope,
  faixa: LeagueTier,
  semana: string
): StandingRow[] {
  const chave = leagueScopeKey(recorte);
  const participantes = inscricoes
    .filter(
      (i) =>
        leagueScopeKey(i.recorte) === chave && i.faixa === faixa && i.semana === semana
    )
    /**
     * Empate desempatado pelo identificador.
     *
     * Não por ser justo — é arbitrário —, mas por ser **estável**: sem
     * critério de desempate, duas apurações da mesma semana devolveriam
     * ordens diferentes, e a pessoa veria a própria posição oscilar sem nada
     * ter acontecido.
     */
    .sort((a, b) => b.weeklyXp - a.weeklyXp || a.userId.localeCompare(b.userId));

  const total = participantes.length;
  const quantosSobem = total === 0 ? 0 : Math.max(1, Math.floor(total * FRACTION_PROMOTED));
  const quantosCaem = total === 0 ? 0 : Math.max(1, Math.floor(total * FRACTION_RELEGATED));

  return participantes.map((i, indice) => ({
    posicao: indice + 1,
    userId: i.userId,
    weeklyXp: i.weeklyXp,
    destino: destinoDaPosicao(indice, total, quantosSobem, quantosCaem, faixa),
  }));
}

function destinoDaPosicao(
  indice: number,
  total: number,
  quantosSobem: number,
  quantosCaem: number,
  faixa: LeagueTier
): StandingRow['destino'] {
  /**
   * Quem está sozinho não sobe nem cai.
   *
   * Com um participante só, "os 20% do topo" e "os 20% da base" seriam a
   * mesma pessoa — e ela subiria e cairia ao mesmo tempo. Competição de um
   * não é competição.
   */
  if (total < 2) return 'STAYS';

  const noTopo = TIERS_IN_ORDER.indexOf(faixa) === TIERS_IN_ORDER.length - 1;
  const naBase = TIERS_IN_ORDER.indexOf(faixa) === 0;

  if (indice < quantosSobem) return noTopo ? 'STAYS' : 'PROMOTED';
  if (indice >= total - quantosCaem) return naBase ? 'STAYS' : 'RELEGATED';
  return 'STAYS';
}

/** A faixa seguinte, ou a mesma se já for a mais alta. */
export function tierAbove(faixa: LeagueTier): LeagueTier {
  const i = TIERS_IN_ORDER.indexOf(faixa);
  return TIERS_IN_ORDER[Math.min(i + 1, TIERS_IN_ORDER.length - 1)];
}

/** A faixa anterior, ou a mesma se já for a mais baixa. */
export function tierBelow(faixa: LeagueTier): LeagueTier {
  const i = TIERS_IN_ORDER.indexOf(faixa);
  return TIERS_IN_ORDER[Math.max(i - 1, 0)];
}

/**
 * Fecha a semana: aplica subidas e quedas, e abre a semana seguinte.
 *
 * O XP da semana **zera**. É o que faz a liga medir esforço recente em vez de
 * acúmulo histórico — sem isso, quem começou primeiro ficaria no topo para
 * sempre, e a competição deixaria de existir para quem chega depois.
 */
export function closeWeek(
  inscricoes: LeagueEntry[],
  semana: string,
  proximaSemana: string
): LeagueEntry[] {
  const recortes = new Map<string, LeagueScope>();
  for (const i of inscricoes) recortes.set(leagueScopeKey(i.recorte), i.recorte);

  const resultado: LeagueEntry[] = [];
  const agora = new Date().toISOString();

  for (const recorte of recortes.values()) {
    for (const faixa of TIERS_IN_ORDER) {
      for (const linha of computeStandings(inscricoes, recorte, faixa, semana)) {
        const nova =
          linha.destino === 'PROMOTED'
            ? tierAbove(faixa)
            : linha.destino === 'RELEGATED'
              ? tierBelow(faixa)
              : faixa;

        resultado.push({
          userId: linha.userId,
          recorte,
          faixa: nova,
          semana: proximaSemana,
          weeklyXp: 0,
          desde: nova === faixa ? existenteDesde(inscricoes, linha.userId, recorte) ?? agora : agora,
        });
      }
    }
  }
  return resultado;
}

function existenteDesde(
  inscricoes: LeagueEntry[],
  userId: EntityId,
  recorte: LeagueScope
): ISOTimestamp | null {
  const chave = leagueScopeKey(recorte);
  return (
    inscricoes.find((i) => i.userId === userId && leagueScopeKey(i.recorte) === chave)?.desde ??
    null
  );
}

/**
 * A posição de alguém, sem precisar da tabela inteira.
 *
 * `null` quando a pessoa não está inscrita — e `null` é diferente de estar em
 * último. A tela precisa distinguir "ainda não entrou" de "está por último".
 */
export function standingOf(
  classificacao: StandingRow[],
  userId: EntityId
): StandingRow | null {
  return classificacao.find((l) => l.userId === userId) ?? null;
}
