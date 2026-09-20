import React, { useEffect, useState } from 'react';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LeagueBoard } from '../../components/practice/LeagueBoard';
import { MissionsPanel } from '../../components/practice/MissionsPanel';
import { StreakPanel } from '../../components/practice/StreakPanel';
import {
  LeagueScope,
  LeagueTier,
  StandingRow,
  computeStandings,
  weekOf,
} from '../../../domain/league';
import {
  EMPTY_ACTIVITY,
  missionProgress,
  missionsOfTheDay,
  missionDeadline,
} from '../../../domain/missions';
import { WEEKDAY_INITIALS } from '../../../domain/study-attendance';
import { routineRepository } from '../../../repositories/routine.repository';
import { practiceService } from '../../../services/application/practice.service';
import { DailyActivity } from '../../../domain/missions';
import { StreakTracker } from '../../../domain/practice';

/**
 * A liga, as missões e a ofensiva — a camada de rotina do Laboratório.
 *
 * As três existiam como componente testado e **sem rota**: a pessoa não tinha
 * como chegar a nenhuma delas. Esta tela é o endereço que faltava.
 *
 * ELA COMEÇAVA VAZIA, E CONTINUAVA VAZIA PARA SEMPRE
 * --------------------------------------------------
 * O comentário anterior dizia que tudo começa vazio "e isso é correto". Era
 * meia verdade que escondia um defeito inteiro: a tela chamava
 *
 *     computeStandings([], scope, LeagueTier.BRONZE, weekOf(new Date()))
 *
 * com um array vazio **literal**, e passava `EMPTY_ACTIVITY` cravada às
 * missões, `streakDays={0}`, `freezes={0}` e `completions={0}`. Praticar todo
 * dia durante um mês não mudaria uma linha, porque nenhum dado tinha por onde
 * chegar aqui.
 *
 * É o defeito mais caro que existe, porque não parece defeito: o código está
 * escrito, os testes de componente passam, a tela monta e o estado vazio é
 * elegante. O que faltava era o meio — nada gravava inscrição de liga nem
 * atividade do dia. `routine.repository.ts` passou a gravar, e esta tela
 * passou a ler.
 *
 * O estado vazio continua correto para quem chegou agora. A diferença é que
 * agora ele **deixa de ser vazio** quando a pessoa estuda.
 *
 * O que não se faz é inventar participante para a tabela parecer viva. Já
 * houve aqui um ranking com Bach em primeiro.
 */
export const PracticeLeagueScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();

  const [scope, setScope] = useState<LeagueScope>({ type: 'PLATFORM' });
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [atividade, setAtividade] = useState<DailyActivity>(EMPTY_ACTIVITY);
  const [ofensiva, setOfensiva] = useState<StreakTracker | null>(null);

  useEffect(() => {
    let vivo = true;

    /**
     * A apuração é pura, e roda sobre as inscrições DE VERDADE da semana.
     * Sem inscrição devolve lista vazia — e aí o esqueleto é a resposta certa,
     * porque não há mesmo ninguém. Antes ele era a única resposta possível.
     */
    routineRepository.inscricoesDaSemana().then((inscricoes) => {
      if (vivo) {
        setStandings(computeStandings(inscricoes, scope, LeagueTier.BRONZE, weekOf(new Date())));
      }
    });

    return () => {
      vivo = false;
    };
  }, [scope]);

  useEffect(() => {
    if (!userId) return;
    let vivo = true;

    routineRepository.atividadeDoDia(userId).then((a) => vivo && setAtividade(a));
    practiceService.getStreak(userId).then((s) => vivo && setOfensiva(s));

    return () => {
      vivo = false;
    };
  }, [userId]);

  const missoes = missionProgress(missionsOfTheDay(userId ?? 'visitante'), atividade);

  /**
   * Os sete dias da semana corrente, lidos do calendário da ofensiva.
   *
   * `WEEKDAY_INITIALS.map(() => false)` devolvia sete dias apagados sempre —
   * inclusive para quem estudou hoje.
   */
  const inicioDaSemana = new Date();
  inicioDaSemana.setDate(inicioDaSemana.getDate() - inicioDaSemana.getDay());
  const diasComEstudo = WEEKDAY_INITIALS.map((_, i) => {
    const dia = new Date(inicioDaSemana);
    dia.setDate(inicioDaSemana.getDate() + i);
    const iso = dia.toISOString().slice(0, 10);
    return (ofensiva?.calendarHistory ?? []).some(
      (d) => d.date === iso && d.completedMinutes > 0
    );
  });

  return (
    <ScreenContainer
      id="practice-league"
      title="Liga e rotina"
      subtitle="A classificação da semana, as missões do dia e a sua ofensiva."
      badgeLabel="Semanal"
      badgeVariant="neutral"
      secondaryActions={[{ label: 'Voltar ao percurso', onClick: () => navigate('/practice/path') }]}
    >
      <div className="mx-auto w-full max-w-lg space-y-10 px-4 py-6">
        <MissionsPanel missions={missoes} deadline={missionDeadline()} />

        <StreakPanel
          streakDays={ofensiva?.currentStreakDays ?? 0}
          week={diasComEstudo}
          freezes={ofensiva?.freezeDaysAvailable ?? 0}
          goal={null}
        />

        <LeagueBoard
          tier={LeagueTier.BRONZE}
          scope={scope}
          availableScopes={[
            { scope: { type: 'PLATFORM' }, label: 'Plataforma' },
            { scope: { type: 'HOUSE', entityId: 'house_violinists' }, label: 'Violinistas' },
          ]}
          onChangeScope={setScope}
          standings={standings}
          nameOf={(id) => id}
          viewerId={userId}
          /* Missões cumpridas hoje — contadas, e não cravadas em zero. */
          completions={missoes.filter((m) => m.cumprida).length}
          closesAt="domingo às 23h59"
        />
      </div>
    </ScreenContainer>
  );
};
