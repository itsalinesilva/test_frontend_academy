import { describe, it, expect } from 'vitest';
import {
  Club,
  EMPTY_MEMBERSHIP_CARD,
  MembershipCard,
  SESSIONS_TO_JOIN_HOUSE,
  canJoinClub,
  cardIsCoherent,
  guildIdForCourse,
  hasAnyMembership,
  isConnectedToCommunity,
  joinClubBlockReason,
  qualifiesForHouse,
} from '../src/domain/membership';

/**
 * Pertencimento.
 *
 * Grêmio, Casa e Clube respondem a perguntas diferentes — onde a pessoa se
 * forma, onde ela se compromete, com quem ela se organiza. Antes disto havia
 * "tribo", uma palavra só carregando as três, e por isso ela nunca coube.
 *
 * O caso mais consequente aqui é o do Clube sem Grêmio: sem essa regra a
 * Comunidade vira uma rede social genérica que por acaso fala de música.
 */

const clube: Club = {
  id: 'club_barroco',
  guildId: 'guild_violin',
  name: 'Clube de Violino Barroco',
  description: 'Repertório e prática histórica.',
  createdBy: 'u_ana',
  createdAt: '2026-09-19T10:00:00.000Z',
};

describe('o Grêmio nasce do curso', () => {
  it('cada curso tem o seu, derivado e não sorteado', () => {
    // Derivado: matricular duas vezes não cria dois Grêmios.
    expect(guildIdForCourse('c_teoria')).toBe(guildIdForCourse('c_teoria'));
    expect(guildIdForCourse('c_teoria')).not.toBe(guildIdForCourse('c_violino'));
  });
});

describe('a Casa nasce da prática recorrente', () => {
  it('uma sessão não abre Casa', () => {
    // Uma sessão é curiosidade; abrir a Casa ali esvaziaria "praticante".
    expect(qualifiesForHouse(1)).toBe(false);
  });

  it('o limiar declarado abre', () => {
    expect(qualifiesForHouse(SESSIONS_TO_JOIN_HOUSE)).toBe(true);
  });

  it('o limiar é o mesmo da entrada na liga', () => {
    // Três, e pela mesma razão: é onde a curiosidade vira hábito começando.
    expect(SESSIONS_TO_JOIN_HOUSE).toBe(3);
  });
});

describe('não existe Clube sem Grêmio', () => {
  it('quem tem o Grêmio-base entra', () => {
    expect(canJoinClub(clube, ['guild_violin'])).toBe(true);
  });

  it('quem não tem, não entra', () => {
    expect(canJoinClub(clube, ['guild_theory'])).toBe(false);
    expect(canJoinClub(clube, [])).toBe(false);
  });

  it('o bloqueio diz o motivo e o caminho', () => {
    /**
     * "Você não pode" sem motivo é lido como exclusão arbitrária. O motivo
     * aqui nomeia o Grêmio e diz o que fazer — como o cadeado do percurso.
     */
    const motivo = joinClubBlockReason(clube, [], () => 'Grêmio de Violino')!;
    expect(motivo).toContain('Grêmio de Violino');
    expect(motivo).toMatch(/matricule-se/i);
  });

  it('quem pode entrar não recebe motivo nenhum', () => {
    expect(joinClubBlockReason(clube, ['guild_violin'], () => 'x')).toBeNull();
  });

  it('todo Clube declara o Grêmio a que pertence', () => {
    // O campo é obrigatório no tipo; este caso guarda a intenção.
    expect(clube.guildId).toBeTruthy();
  });
});

describe('a carteira de pertencimento', () => {
  const cheia: MembershipCard = {
    enrolledCourses: [{ id: 'c_violino', title: 'Violino' }],
    guilds: [{ id: 'guild_violin', name: 'Grêmio de Violino' }],
    labs: [{ id: 'lab_violin', name: 'Laboratório de Violino' }],
    houses: [{ id: 'house_violinists', name: 'Casa do Violino' }],
    clubs: [{ id: 'club_barroco', name: 'Clube de Violino Barroco', guildId: 'guild_violin' }],
  };

  it('vazia é vazia, e não traz sugestão nenhuma', () => {
    /**
     * Pertencimento de exemplo seria afirmação falsa sobre a vida de alguém —
     * pior que dado inventado numa tabela.
     */
    expect(hasAnyMembership(EMPTY_MEMBERSHIP_CARD)).toBe(false);
    expect(EMPTY_MEMBERSHIP_CARD.guilds).toEqual([]);
    expect(EMPTY_MEMBERSHIP_CARD.houses).toEqual([]);
    expect(EMPTY_MEMBERSHIP_CARD.clubs).toEqual([]);
  });

  it('responde às seis perguntas do passaporte', () => {
    expect(Object.keys(cheia).sort()).toEqual(
      ['clubs', 'enrolledCourses', 'guilds', 'houses', 'labs'].sort()
    );
  });

  it('estar conectada à Comunidade é ter Clube', () => {
    expect(isConnectedToCommunity(cheia)).toBe(true);
    expect(isConnectedToCommunity(EMPTY_MEMBERSHIP_CARD)).toBe(false);
  });

  it('dá para ter Grêmio sem Casa — matriculou-se e não praticou', () => {
    expect(
      hasAnyMembership({ ...EMPTY_MEMBERSHIP_CARD, guilds: cheia.guilds })
    ).toBe(true);
  });

  it('dá para ter Casa sem Grêmio — pratica sem cursar', () => {
    // Caso previsto desde 18/09, e não exceção a tolerar.
    const card = { ...EMPTY_MEMBERSHIP_CARD, houses: cheia.houses };
    expect(hasAnyMembership(card)).toBe(true);
    expect(cardIsCoherent(card)).toBe(true);
  });
});

describe('a carteira coerente', () => {
  it('Clube com o Grêmio correspondente é coerente', () => {
    expect(
      cardIsCoherent({
        ...EMPTY_MEMBERSHIP_CARD,
        guilds: [{ id: 'guild_violin', name: 'Grêmio de Violino' }],
        clubs: [{ id: 'club_a', name: 'A', guildId: 'guild_violin' }],
      })
    ).toBe(true);
  });

  it('Clube sem o Grêmio correspondente é incoerente', () => {
    /**
     * Indica que alguém entrou num Clube por um caminho que não devia
     * existir — e é por isso que a invariante é função, e não comentário.
     */
    expect(
      cardIsCoherent({
        ...EMPTY_MEMBERSHIP_CARD,
        guilds: [],
        clubs: [{ id: 'club_a', name: 'A', guildId: 'guild_violin' }],
      })
    ).toBe(false);
  });

  it('carteira vazia é coerente', () => {
    expect(cardIsCoherent(EMPTY_MEMBERSHIP_CARD)).toBe(true);
  });
});
