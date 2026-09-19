import { EntityId, ISOTimestamp } from './types';

/**
 * Pertencimento — Grêmio, Casa e Clube.
 *
 * Os três respondem a perguntas diferentes, e é por isso que são três:
 *
 *   **Grêmio** — onde a pessoa se forma. Nasce da matrícula num curso.
 *   **Casa**   — onde a pessoa se compromete. Nasce da prática recorrente.
 *   **Clube**  — com quem a pessoa se organiza. Nasce da vontade dela.
 *
 * Antes disto existia "tribo", uma palavra só carregando as três funções — e
 * por isso ela nunca coube em lugar nenhum. A estrutura inteira está em
 * `80_INSTITUTIONAL_ARCHITECTURE.md`, que é a autoridade.
 *
 * O QUE ESTE MÓDULO NÃO DECIDE
 * ----------------------------
 * Nada de permissão. Pertencer a um Grêmio não autoriza coisa alguma: a
 * autorização continua vindo de concessão assinada pelo servidor. Pertencimento
 * é fato social; permissão é fato técnico. Decidir uma pela outra seria
 * exatamente o defeito que `checkAdminAuthority` existe para barrar.
 */

// ---------------------------------------------------------------------------
// Grêmio — pertencimento acadêmico
// ---------------------------------------------------------------------------

export interface Guild {
  id: EntityId;
  /** O curso que o origina. Um Grêmio por curso, sempre. */
  courseId: EntityId;
  name: string;
  description: string;
}

/**
 * O Grêmio de quem se matriculou.
 *
 * **Não há formulário, convite nem escolha**: o pertencimento é consequência
 * da matrícula. Perguntar seria oferecer a alguém a opção de não pertencer ao
 * lugar onde ela está estudando.
 */
export interface GuildMembership {
  userId: EntityId;
  guildId: EntityId;
  since: ISOTimestamp;
  /**
   * O Grêmio **não expira** quando o curso termina — por isso não há campo de
   * saída. Expirar transformaria formação em assinatura.
   */
}

export function guildIdForCourse(courseId: EntityId): EntityId {
  return `guild_${courseId}`;
}

// ---------------------------------------------------------------------------
// Casa — pertencimento prático
// ---------------------------------------------------------------------------

export type HouseNature = 'INSTRUMENT' | 'DISCIPLINE' | 'CRAFT';

export interface HouseBond {
  userId: EntityId;
  houseId: EntityId;
  since: ISOTimestamp;
  /** Sessões de prática que sustentam o vínculo. */
  sessions: number;
}

/**
 * Quantas sessões de prática abrem uma Casa.
 *
 * Três, o mesmo número da entrada na liga — e pela mesma razão: uma sessão é
 * curiosidade, três já é hábito começando. Abrir a Casa na primeira sessão
 * esvaziaria o sentido de "praticante"; exigir trinta faria a Casa chegar
 * depois de a pessoa já se sentir uma.
 */
export const SESSIONS_TO_JOIN_HOUSE = 3;

export function qualifiesForHouse(sessions: number): boolean {
  return sessions >= SESSIONS_TO_JOIN_HOUSE;
}

// ---------------------------------------------------------------------------
// Clube — o que a comunidade cria
// ---------------------------------------------------------------------------

export interface Club {
  id: EntityId;
  /**
   * O Grêmio a que o Clube se vincula. **Obrigatório.**
   *
   * Sem isto, os Clubes ficariam soltos e a Comunidade viraria uma rede social
   * genérica que por acaso fala de música. A vinculação é o que a mantém sendo
   * o corpo social de um conservatório.
   */
  guildId: EntityId;
  name: string;
  description: string;
  /** Quem criou. O Clube é dos participantes, não da instituição. */
  createdBy: EntityId;
  createdAt: ISOTimestamp;
}

export interface ClubMembership {
  userId: EntityId;
  clubId: EntityId;
  since: ISOTimestamp;
}

/**
 * Pode entrar no Clube?
 *
 * Só quem tem o Grêmio-base. A regra não é burocracia: é o que garante que
 * quem discute violino barroco num Clube já esteja no Grêmio de Violino — e
 * portanto tenha contexto para a conversa.
 */
export function canJoinClub(club: Club, guildIds: readonly EntityId[]): boolean {
  return guildIds.includes(club.guildId);
}

/**
 * Por que não pode entrar. `null` quando pode.
 *
 * Nomeia o que falta, como o cadeado do percurso: um "você não pode" sem
 * motivo é lido como exclusão arbitrária.
 */
export function joinClubBlockReason(
  club: Club,
  guildIds: readonly EntityId[],
  guildName: (id: EntityId) => string
): string | null {
  if (canJoinClub(club, guildIds)) return null;
  return `Este Clube pertence ao ${guildName(club.guildId)}. Matricule-se no curso para entrar.`;
}

// ---------------------------------------------------------------------------
// A carteira de pertencimento — o que o Passaporte mostra
// ---------------------------------------------------------------------------

/**
 * As seis perguntas de `80 §10`, respondidas.
 *
 * Cada campo pode vir vazio, e vazio é vazio: nenhum pertencimento de exemplo,
 * nenhum Grêmio sugerido preenchendo a lacuna. Pertencimento falso é afirmação
 * sobre a vida de alguém.
 */
export interface MembershipCard {
  /** Cursos em andamento. Vazio quando não há. */
  enrolledCourses: { id: EntityId; title: string }[];
  guilds: { id: EntityId; name: string }[];
  /** Laboratórios em que praticou. */
  labs: { id: EntityId; name: string }[];
  houses: { id: EntityId; name: string }[];
  clubs: { id: EntityId; name: string; guildId: EntityId }[];
}

export const EMPTY_MEMBERSHIP_CARD: MembershipCard = {
  enrolledCourses: [],
  guilds: [],
  labs: [],
  houses: [],
  clubs: [],
};

export function isConnectedToCommunity(card: MembershipCard): boolean {
  return card.clubs.length > 0;
}

export function hasAnyMembership(card: MembershipCard): boolean {
  return (
    card.enrolledCourses.length > 0 ||
    card.guilds.length > 0 ||
    card.labs.length > 0 ||
    card.houses.length > 0 ||
    card.clubs.length > 0
  );
}

/**
 * Todo Clube da carteira tem o Grêmio correspondente.
 *
 * Existe como função — e não só como comentário — porque é a invariante que a
 * regra "não existe Clube sem Grêmio" produz. Uma carteira que a viole indica
 * que alguém entrou num Clube por um caminho que não devia existir.
 */
export function cardIsCoherent(card: MembershipCard): boolean {
  const guildIds = card.guilds.map((g) => g.id);
  return card.clubs.every((c) => guildIds.includes(c.guildId));
}
