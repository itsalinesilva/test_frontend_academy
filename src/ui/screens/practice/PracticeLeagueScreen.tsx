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

/**
 * A liga, as missões e a ofensiva — a camada de rotina do Laboratório.
 *
 * As três existiam como componente testado e **sem rota**: a pessoa não tinha
 * como chegar a nenhuma delas. Esta tela é o endereço que faltava.
 *
 * TUDO AQUI COMEÇA VAZIO, E ISSO É CORRETO
 * ----------------------------------------
 * Não há inscrição em liga porque ninguém praticou o bastante; não há ofensiva
 * porque ninguém estudou ainda. Os componentes já sabem mostrar a **forma** do
 * que virá — esqueleto cinza na liga, "0 dias" sem constranger na ofensiva —
 * e é justamente por isso que podem ser expostos antes de haver dado.
 *
 * O que não se faz é inventar participante para a tabela parecer viva. Já
 * houve aqui um ranking com Bach em primeiro.
 */
export const PracticeLeagueScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();

  const [scope, setScope] = useState<LeagueScope>({ type: 'PLATFORM' });
  const [standings, setStandings] = useState<StandingRow[]>([]);

  useEffect(() => {
    /**
     * A apuração é pura e roda sobre as inscrições da semana. Sem inscrição,
     * devolve lista vazia — e a tabela mostra o esqueleto, que é o certo.
     */
    setStandings(computeStandings([], scope, LeagueTier.BRONZE, weekOf(new Date())));
  }, [scope]);

  const missoes = missionProgress(missionsOfTheDay(userId ?? 'visitante'), EMPTY_ACTIVITY);

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
          streakDays={0}
          week={WEEKDAY_INITIALS.map(() => false)}
          freezes={0}
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
          completions={0}
          closesAt="domingo às 23h59"
        />
      </div>
    </ScreenContainer>
  );
};
