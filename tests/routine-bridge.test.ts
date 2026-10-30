// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  PersistentRoutineRepository,
  dayKey,
} from '../src/repositories/routine.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import {
  AVAILABLE_MISSIONS,
  EMPTY_ACTIVITY,
  missionProgress,
  missionsOfTheDay,
} from '../src/domain/missions';
import { computeStandings, LeagueTier, weekOf } from '../src/domain/league';

/**
 * A PONTE ENTRE A ACADEMIA E O LABORATÓRIO.
 *
 * O QUE ESTE ARQUIVO EXISTE PARA IMPEDIR
 * --------------------------------------
 * A liga e as missões tinham domínio e tinham interface, e não tinham meio.
 * `PracticeLeagueScreen` chamava:
 *
 *     computeStandings([], scope, LeagueTier.BRONZE, weekOf(new Date()))
 *
 * Um array vazio **literal**, logo abaixo de um comentário afirmando que a
 * apuração "roda sobre as inscrições da semana". As missões recebiam
 * `EMPTY_ACTIVITY` cravada; a ofensiva, `streakDays={0}` e `freezes={0}`.
 *
 * Nada disso aparecia como falha. A tela montava, os testes de componente
 * passavam, o estado vazio era elegante — e praticar todo dia durante um mês
 * não mudaria uma linha, porque nenhum dado tinha por onde chegar ali.
 *
 * E a ligação entre a Academia e o Laboratório existia como dois `navigate()`
 * numa tela de lição. Hiperlink não é integração: `DailyActivity` sempre teve
 * o campo `lessonsCompleted`, e nada nunca o preencheu.
 *
 * O que se cobra aqui é o caminho inteiro, e não cada peça: o que a pessoa faz
 * chega ao registro, o registro chega à apuração, e a apuração muda o que a
 * tela mostra.
 */

const LIMPO = () => {
  localStorage.clear();
  return new PersistentRoutineRepository(new LocalStorageAdapter());
};

describe('a atividade do dia é escrita pelas duas áreas', () => {
  let repo: PersistentRoutineRepository;
  beforeEach(() => {
    repo = LIMPO();
  });

  it('quem não fez nada tem o dia vazio — e não um dia maquiado', async () => {
    expect(await repo.atividadeDoDia('u_nova')).toEqual(EMPTY_ACTIVITY);
  });

  it('a sessão de prática credita XP do dia', async () => {
    await repo.somarAtividade('u_ana', { xpToday: 40, flawlessRounds: 1 });
    const hoje = await repo.atividadeDoDia('u_ana');

    expect(hoje.xpToday).toBe(40);
    expect(hoje.flawlessRounds).toBe(1);
  });

  it('a lição da Academia credita no MESMO registro', async () => {
    /**
     * O ponto da ponte. Não há um "registro do Laboratório" e outro "da
     * Academia": há a rotina da pessoa naquele dia, e as duas áreas escrevem
     * nela.
     */
    await repo.somarAtividade('u_ana', { xpToday: 40 });
    await repo.somarAtividade('u_ana', { lessonsCompleted: 1 });

    const hoje = await repo.atividadeDoDia('u_ana');
    expect(hoje.xpToday).toBe(40);
    expect(hoje.lessonsCompleted).toBe(1);
  });

  it('somar é somar: duas sessões acumulam, não substituem', async () => {
    // `{...atual, ...delta}` deixaria 30 em vez de 70, e ninguém veria.
    await repo.somarAtividade('u_ana', { xpToday: 40 });
    await repo.somarAtividade('u_ana', { xpToday: 30 });

    expect((await repo.atividadeDoDia('u_ana')).xpToday).toBe(70);
  });

  it('período do dia não se soma: praticar 3x de manhã é um período', async () => {
    await repo.somarAtividade('u_ana', { periodsPracticed: 1 });
    await repo.somarAtividade('u_ana', { periodsPracticed: 1 });
    await repo.somarAtividade('u_ana', { periodsPracticed: 1 });

    expect((await repo.atividadeDoDia('u_ana')).periodsPracticed).toBe(1);
  });

  it('o dia de uma pessoa não é o da outra', async () => {
    await repo.somarAtividade('u_ana', { xpToday: 40 });
    expect((await repo.atividadeDoDia('u_bia')).xpToday).toBe(0);
  });

  it('ontem não é hoje', async () => {
    const ontem = dayKey(new Date(Date.now() - 86_400_000));
    await repo.somarAtividade('u_ana', { xpToday: 40 }, ontem);

    expect((await repo.atividadeDoDia('u_ana')).xpToday).toBe(0);
    expect((await repo.atividadeDoDia('u_ana', ontem)).xpToday).toBe(40);
  });
});

describe('a missão do dia avança com o que a pessoa fez', () => {
  it('sem atividade, nenhuma missão está cumprida', () => {
    const missoes = missionProgress(missionsOfTheDay('u_ana'), EMPTY_ACTIVITY);
    expect(missoes.every((m) => !m.cumprida)).toBe(true);
  });

  it('A MISSÃO DE LIÇÃO SÓ PODE SER CUMPRIDA PORQUE A ACADEMIA ESCREVE', async () => {
    /**
     * A prova mais direta de que a ponte existe.
     *
     * Havia uma missão dependendo de `lessonsCompleted`, e o único lugar que
     * poderia preencher esse campo era a conclusão de lição na Academia — que
     * nunca o preenchia. A missão era incumprível por construção.
     */
    const repo = LIMPO();
    await repo.somarAtividade('u_ana', { lessonsCompleted: 2, xpToday: 30 });
    const atividade = await repo.atividadeDoDia('u_ana');

    const missoes = missionProgress(AVAILABLE_MISSIONS, atividade);
    const queOlhamLicao = missoes.filter((m) => m.missao.condicao.tipo === 'LESSON_COMPLETED');

    /**
     * A TRAVA DE NÃO-VACUIDADE.
     *
     * A primeira versão deste teste filtrava por `'LICOES'`, e o tipo real é
     * `'LESSON_COMPLETED'`. A lista vinha vazia, o `for` não rodava nenhuma
     * vez, e o teste passava **medindo nada** — verde sobre cegueira, dentro
     * do arquivo escrito para impedir exatamente isso.
     *
     * Sem esta linha, o mesmo erro volta na próxima vez que um nome mudar.
     */
    expect(queOlhamLicao.length, 'nenhuma missão olha lição — o teste mediria nada').toBeGreaterThan(0);

    for (const m of queOlhamLicao) {
      // O progresso e limitado ao alvo: duas licoes numa missao de uma licao
      // marcam 1 de 1, e nao 2 de 1. Cobrar `2` aqui seria cobrar um defeito.
      expect(m.feito, `a missão "${m.missao.titulo}" não viu a lição concluída`).toBe(
        Math.min(2, m.alvo)
      );
      expect(m.cumprida, `a missão "${m.missao.titulo}" não foi dada por cumprida`).toBe(true);
    }
  });

  it('a missão de lição NÃO avança só com prática', () => {
    // O espelho do caso acima: se avançasse, não seria a Academia escrevendo.
    const missoes = missionProgress(AVAILABLE_MISSIONS, { ...EMPTY_ACTIVITY, xpToday: 500 });
    const licao = missoes.filter((m) => m.missao.condicao.tipo === 'LESSON_COMPLETED');

    expect(licao.length).toBeGreaterThan(0);
    for (const m of licao) expect(m.cumprida).toBe(false);
  });

  it('progresso não passa do alvo declarado', async () => {
    const repo = LIMPO();
    await repo.somarAtividade('u_ana', { xpToday: 10_000 });
    const missoes = missionProgress(missionsOfTheDay('u_ana'), await repo.atividadeDoDia('u_ana'));

    for (const m of missoes) {
      expect(m.feito).toBeLessThanOrEqual(m.alvo);
    }
  });
});

describe('a liga apura sobre inscrições de verdade', () => {
  let repo: PersistentRoutineRepository;
  beforeEach(() => {
    repo = LIMPO();
  });

  it('semana sem ninguém devolve tabela vazia — e aí o esqueleto é a verdade', async () => {
    const inscricoes = await repo.inscricoesDaSemana();
    expect(computeStandings(inscricoes, { type: 'PLATFORM' }, LeagueTier.BRONZE, weekOf(new Date()))).toEqual([]);
  });

  it('praticar INSCREVE: não há botão de entrar na liga', async () => {
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 40);

    const inscricao = await repo.inscricaoDe('u_ana', { type: 'PLATFORM' });
    expect(inscricao).not.toBeNull();
    expect(inscricao?.weeklyXp).toBe(40);
  });

  it('praticar de novo soma na MESMA inscrição, e não cria outra', async () => {
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 40);
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 25);

    const daSemana = await repo.inscricoesDaSemana();
    expect(daSemana).toHaveLength(1);
    expect(daSemana[0].weeklyXp).toBe(65);
  });

  it('A TABELA ORDENA QUEM PRATICOU — o caminho inteiro', async () => {
    /**
     * Do que a pessoa fez até o que a tela mostra, sem pular etapa. Era este
     * caminho que estava cortado no meio pelo `[]` literal.
     */
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 40);
    await repo.creditarXpDaSemana('u_bia', { type: 'PLATFORM' }, LeagueTier.BRONZE, 90);
    await repo.creditarXpDaSemana('u_caio', { type: 'PLATFORM' }, LeagueTier.BRONZE, 65);

    const tabela = computeStandings(
      await repo.inscricoesDaSemana(),
      { type: 'PLATFORM' },
      LeagueTier.BRONZE,
      weekOf(new Date())
    );

    expect(tabela.map((l) => l.userId)).toEqual(['u_bia', 'u_caio', 'u_ana']);
    expect(tabela[0].posicao).toBe(1);
  });

  it('a semana passada não entra na tabela desta', async () => {
    const passada = weekOf(new Date(Date.now() - 7 * 86_400_000));
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 40, passada);

    expect(await repo.inscricoesDaSemana()).toEqual([]);
    expect(await repo.inscricoesDaSemana(passada)).toHaveLength(1);
  });

  it('recortes diferentes são inscrições diferentes', async () => {
    await repo.creditarXpDaSemana('u_ana', { type: 'PLATFORM' }, LeagueTier.BRONZE, 40);
    await repo.creditarXpDaSemana(
      'u_ana',
      { type: 'HOUSE', entityId: 'house_violinists' },
      LeagueTier.BRONZE,
      40
    );

    expect(await repo.inscricoesDaSemana()).toHaveLength(2);
  });
});
