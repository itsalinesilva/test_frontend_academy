import { describe, it, expect } from 'vitest';
import {
  LeagueTier,
  TIERS_IN_ORDER,
  LeagueEntry,
  LeagueScope,
  computeStandings,
  closeWeek,
  tierAbove,
  tierBelow,
  weekOf,
  standingOf,
  leagueScopeKey,
} from '../src/domain/league';

/**
 * A liga existe inteira — sem um único participante.
 *
 * É a distinção que atravessa o projeto: **mecanismo ≠ dado**. Construir a
 * apuração, a subida, a queda e o fechamento da semana é engenharia, e se faz
 * agora. Preencher a tabela com Bach em primeiro lugar é mentira — e já
 * aconteceu aqui, com Clara Schumann em segundo.
 *
 * Estes casos provam que a mecânica está pronta para quando houver gente, e
 * que com zero gente ela devolve zero linhas sem quebrar.
 */

const PLATFORM: LeagueScope = { type: 'PLATFORM' };
const HOUSE_VIOLIN: LeagueScope = { type: 'HOUSE', entityId: 'house_violinists' };
const SEMANA = '2026-09-14';

const inscrito = (
  userId: string,
  xp: number,
  faixa = LeagueTier.GOLD,
  recorte = PLATFORM
): LeagueEntry => ({
  userId,
  recorte,
  faixa,
  semana: SEMANA,
  weeklyXp: xp,
  desde: '2026-09-07T00:00:00.000Z',
});

describe('sem participante, a liga não inventa nenhum', () => {
  it('a classificação vazia devolve lista vazia, e não quebra', () => {
    expect(computeStandings([], PLATFORM, LeagueTier.GOLD, SEMANA)).toEqual([]);
  });

  it('fechar uma semana sem ninguém não produz inscrição', () => {
    expect(closeWeek([], SEMANA, '2026-09-21')).toEqual([]);
  });

  it('quem não está inscrito não tem posição — e isso é diferente de ser o último', () => {
    // A tela precisa distinguir "ainda não entrou" de "está por último".
    const classificacao = computeStandings([inscrito('ana', 100)], PLATFORM, LeagueTier.GOLD, SEMANA);
    expect(standingOf(classificacao, 'bruno')).toBeNull();
    expect(standingOf(classificacao, 'ana')?.posicao).toBe(1);
  });
});

describe('a classificação ordena por esforço da semana', () => {
  it('quem fez mais XP na semana fica na frente', () => {
    const c = computeStandings(
      [inscrito('ana', 120), inscrito('bruno', 340), inscrito('carla', 80)],
      PLATFORM,
      LeagueTier.GOLD,
      SEMANA
    );
    expect(c.map((l) => l.userId)).toEqual(['bruno', 'ana', 'carla']);
    expect(c.map((l) => l.posicao)).toEqual([1, 2, 3]);
  });

  it('o empate é desempatado de forma ESTÁVEL', () => {
    /**
     * O critério é arbitrário de propósito; o que não pode é ser instável.
     * Sem desempate fixo, duas apurações da mesma semana devolveriam ordens
     * diferentes, e a pessoa veria a própria posição oscilar sem nada ter
     * acontecido.
     */
    const inscricoes = [inscrito('zeca', 100), inscrito('ana', 100), inscrito('bruno', 100)];
    const uma = computeStandings(inscricoes, PLATFORM, LeagueTier.GOLD, SEMANA);
    const outra = computeStandings([...inscricoes].reverse(), PLATFORM, LeagueTier.GOLD, SEMANA);
    expect(uma).toEqual(outra);
  });

  it('a liga só conta o XP DA SEMANA, não o acumulado', () => {
    // Senão quem começou primeiro ficaria no topo para sempre, e a competição
    // deixaria de existir para quem chega depois.
    const c = computeStandings([inscrito('ana', 10), inscrito('bruno', 20)], PLATFORM, LeagueTier.GOLD, SEMANA);
    expect(c[0].userId).toBe('bruno');
    expect(c[0].weeklyXp).toBe(20);
  });
});

describe('os recortes não se misturam', () => {
  it('a liga da tribo não traz quem compete só na plataforma', () => {
    const inscricoes = [
      inscrito('ana', 100, LeagueTier.GOLD, PLATFORM),
      inscrito('bruno', 300, LeagueTier.GOLD, HOUSE_VIOLIN),
    ];

    const naTribo = computeStandings(inscricoes, HOUSE_VIOLIN, LeagueTier.GOLD, SEMANA);
    expect(naTribo).toHaveLength(1);
    expect(naTribo[0].userId).toBe('bruno');
  });

  it('a mesma pessoa compete em vários recortes ao mesmo tempo', () => {
    const inscricoes = [
      inscrito('ana', 100, LeagueTier.GOLD, PLATFORM),
      inscrito('ana', 100, LeagueTier.SILVER, HOUSE_VIOLIN),
    ];
    expect(computeStandings(inscricoes, PLATFORM, LeagueTier.GOLD, SEMANA)).toHaveLength(1);
    expect(computeStandings(inscricoes, HOUSE_VIOLIN, LeagueTier.SILVER, SEMANA)).toHaveLength(1);
  });

  it('faixas diferentes do mesmo recorte não se misturam', () => {
    const inscricoes = [
      inscrito('ana', 500, LeagueTier.DIAMOND),
      inscrito('bruno', 10, LeagueTier.BRONZE),
    ];
    expect(computeStandings(inscricoes, PLATFORM, LeagueTier.BRONZE, SEMANA)).toHaveLength(1);
  });

  it('a chave do recorte distingue plataforma de tribo', () => {
    expect(leagueScopeKey(PLATFORM)).not.toBe(leagueScopeKey(HOUSE_VIOLIN));
  });
});

describe('subida e queda', () => {
  const dez = Array.from({ length: 10 }, (_, i) => inscrito(`u${i}`, (10 - i) * 10));

  it('o topo sobe e a base cai', () => {
    const c = computeStandings(dez, PLATFORM, LeagueTier.GOLD, SEMANA);
    expect(c[0].destino).toBe('PROMOTED');
    expect(c[9].destino).toBe('RELEGATED');
    expect(c[5].destino).toBe('STAYS');
  });

  it('quem está sozinho não sobe nem cai', () => {
    /**
     * Com um participante só, "os 20% do topo" e "os 20% da base" seriam a
     * mesma pessoa — e ela subiria e cairia ao mesmo tempo. Competição de um
     * não é competição.
     */
    const c = computeStandings([inscrito('ana', 100)], PLATFORM, LeagueTier.GOLD, SEMANA);
    expect(c[0].destino).toBe('STAYS');
  });

  it('ninguém sobe da faixa mais alta', () => {
    const c = computeStandings(
      dez.map((i) => ({ ...i, faixa: LeagueTier.CONSERVATORY })),
      PLATFORM,
      LeagueTier.CONSERVATORY,
      SEMANA
    );
    expect(c[0].destino).toBe('STAYS');
    expect(c[9].destino).toBe('RELEGATED');
  });

  it('ninguém cai da faixa mais baixa', () => {
    const c = computeStandings(
      dez.map((i) => ({ ...i, faixa: LeagueTier.BRONZE })),
      PLATFORM,
      LeagueTier.BRONZE,
      SEMANA
    );
    expect(c[9].destino).toBe('STAYS');
    expect(c[0].destino).toBe('PROMOTED');
  });

  it('as faixas vizinhas estão na ordem declarada', () => {
    expect(tierAbove(LeagueTier.BRONZE)).toBe(LeagueTier.SILVER);
    expect(tierBelow(LeagueTier.SILVER)).toBe(LeagueTier.BRONZE);
    expect(tierAbove(LeagueTier.CONSERVATORY)).toBe(LeagueTier.CONSERVATORY);
    expect(tierBelow(LeagueTier.BRONZE)).toBe(LeagueTier.BRONZE);
  });
});

describe('fechar a semana', () => {
  const dez = Array.from({ length: 10 }, (_, i) => inscrito(`u${i}`, (10 - i) * 10));

  it('o XP da semana zera', () => {
    // É o que faz a liga medir esforço recente, e não acúmulo histórico.
    for (const i of closeWeek(dez, SEMANA, '2026-09-21')) {
      expect(i.weeklyXp, i.userId).toBe(0);
    }
  });

  it('a semana seguinte é a declarada, e todos migram para ela', () => {
    const proxima = closeWeek(dez, SEMANA, '2026-09-21');
    expect(proxima).toHaveLength(10);
    for (const i of proxima) expect(i.semana).toBe('2026-09-21');
  });

  it('quem subiu começa a semana na faixa de cima', () => {
    const proxima = closeWeek(dez, SEMANA, '2026-09-21');
    expect(proxima.find((i) => i.userId === 'u0')!.faixa).toBe(LeagueTier.PLATINUM);
    expect(proxima.find((i) => i.userId === 'u9')!.faixa).toBe(LeagueTier.SILVER);
    expect(proxima.find((i) => i.userId === 'u5')!.faixa).toBe(LeagueTier.GOLD);
  });

  it('quem ficou preserva desde quando está na faixa', () => {
    const proxima = closeWeek(dez, SEMANA, '2026-09-21');
    expect(proxima.find((i) => i.userId === 'u5')!.desde).toBe('2026-09-07T00:00:00.000Z');
  });

  it('fechar duas vezes a mesma semana dá o mesmo resultado', () => {
    // Fechamento não pode depender de quantas vezes rodou.
    expect(closeWeek(dez, SEMANA, '2026-09-21').map((i) => i.faixa)).toEqual(
      closeWeek(dez, SEMANA, '2026-09-21').map((i) => i.faixa)
    );
  });

  it('cada recorte é fechado separadamente', () => {
    const inscricoes = [
      ...dez,
      inscrito('v0', 500, LeagueTier.BRONZE, HOUSE_VIOLIN),
      inscrito('v1', 10, LeagueTier.BRONZE, HOUSE_VIOLIN),
    ];
    const proxima = closeWeek(inscricoes, SEMANA, '2026-09-21');

    expect(proxima.filter((i) => i.recorte.type === 'PLATFORM')).toHaveLength(10);
    expect(proxima.filter((i) => i.recorte.type === 'HOUSE')).toHaveLength(2);
    // v0 lidera o Bronze da tribo e sobe; v1 está na base e não cai, por ser Bronze
    expect(proxima.find((i) => i.userId === 'v0')!.faixa).toBe(LeagueTier.SILVER);
    expect(proxima.find((i) => i.userId === 'v1')!.faixa).toBe(LeagueTier.BRONZE);
  });
});

describe('a semana vai de segunda a domingo, no fuso do dispositivo', () => {
  /**
   * As datas abaixo são construídas LOCALMENTE, de propósito.
   *
   * A semana da liga segue o mesmo fuso que a ofensiva usa para virar o dia —
   * ter duas noções de "hoje" faria a pessoa fechar a ofensiva num dia e
   * trocar de semana de liga noutro.
   *
   * Um caso anterior escrevia `new Date('2026-09-21T00:01:00Z')` e esperava a
   * semana nova. Em qualquer fuso a oeste de Greenwich, aquele instante ainda
   * é o domingo anterior — e o domingo daqui é que vale. O teste é que estava
   * misturando instante UTC com data local.
   */
  const local = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia, 12, 0, 0);

  it('qualquer dia da semana devolve a mesma segunda-feira', () => {
    const segunda = weekOf(local(2026, 9, 14));
    for (const dia of [14, 17, 20]) {
      expect(weekOf(local(2026, 9, dia)), String(dia)).toBe(segunda);
    }
  });

  it('domingo pertence à semana que começou na segunda anterior', () => {
    expect(weekOf(local(2026, 9, 20))).toBe(weekOf(local(2026, 9, 14)));
  });

  it('a segunda seguinte abre uma semana nova', () => {
    expect(weekOf(local(2026, 9, 21))).not.toBe(weekOf(local(2026, 9, 20)));
  });

  it('a segunda-feira devolvida é, de fato, uma segunda-feira', () => {
    for (const dia of [14, 15, 16, 17, 18, 19, 20]) {
      const s = weekOf(local(2026, 9, dia));
      expect(new Date(`${s}T12:00:00Z`).getUTCDay(), `dia ${dia}`).toBe(1);
    }
  });
});

describe('as faixas', () => {
  it('vão da mais baixa à mais alta, sem repetição', () => {
    expect(new Set(TIERS_IN_ORDER).size).toBe(TIERS_IN_ORDER.length);
    expect(TIERS_IN_ORDER[0]).toBe(LeagueTier.BRONZE);
    expect(TIERS_IN_ORDER[TIERS_IN_ORDER.length - 1]).toBe(LeagueTier.CONSERVATORY);
  });
});
