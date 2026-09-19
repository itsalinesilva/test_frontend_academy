import React from 'react';
import {
  STREAK_CLUBS,
  WEEKDAY_INITIALS,
  earnedStreakClubs,
  nextStreakClub,
} from '../../../domain/study-attendance';
import { Flame, Lock, Snowflake } from 'lucide-react';

interface StreakPanelProps {
  streakDays: number;
  /** Sete posições, de domingo a sábado: houve estudo naquele dia? */
  week: readonly boolean[];
  /** Congelamentos guardados — protegem um dia perdido cada. */
  freezes: number;
  /** Meta de constância que a pessoa escolheu, se escolheu. */
  goal: number | null;
}

/**
 * A ofensiva.
 *
 * ZERO SE DECLARA SEM CONSTRANGER
 * -------------------------------
 * "0 dias" não vem acompanhado de cara triste, de "não perca!" nem de nada
 * que sugira falta. Quem está em zero ou nunca começou, ou parou — e nos dois
 * casos a informação útil é como recomeçar, não a repreensão.
 *
 * É a regra da casa, e já era antes desta tela: em `domain/frequencia.ts`, o
 * dia de hoje **nunca conta como falta**, porque senão às 00h01 toda ofensiva
 * apareceria quebrada.
 *
 * O CLUBE MOSTRA O DEGRAU, E NÃO SÓ O CADEADO
 * -------------------------------------------
 * Diz quantos dias faltam. Cadeado sem número é convite a desistir — a pessoa
 * não sabe se está perto ou a um ano de distância.
 */
export const StreakPanel: React.FC<StreakPanelProps> = ({
  streakDays,
  week,
  freezes,
  goal,
}) => {
  const earnedClubs = earnedStreakClubs(streakDays);
  const upcoming = nextStreakClub(streakDays);

  return (
    <section aria-labelledby="titulo-ofensiva" className="space-y-4">
      <header className="flex items-center gap-3">
        <Flame
          className={`h-8 w-8 ${streakDays > 0 ? 'text-ouro-500' : 'text-stone-300'}`}
          aria-hidden="true"
        />
        <div>
          <h2 id="titulo-ofensiva" className="font-serif text-2xl font-bold text-stone-900">
            {streakDays === 1 ? '1 dia' : `${streakDays} dias`} de ofensiva
          </h2>
          <p className="text-xs leading-relaxed text-stone-600">
            {streakDays === 0
              ? 'Uma lição, atividade ou exercício hoje já começa uma.'
              : 'Um dia inteiro sem praticar zera a contagem.'}
          </p>
        </div>
      </header>

      <ol className="flex justify-between gap-1" aria-label="Esta semana">
        {WEEKDAY_INITIALS.map((initial, i) => {
          const studied = week[i] === true;
          return (
            <li key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  studied
                    ? 'border-ouro-500 bg-ouro-500 text-white'
                    : 'border-stone-200 bg-white text-stone-300'
                }`}
              >
                {studied && <Flame className="h-4 w-4" aria-hidden="true" />}
                <span className="sr-only">
                  {WEEKDAY_NAMES[i]}: {studied ? 'estudou' : 'sem registro'}
                </span>
              </span>
              <span aria-hidden="true" className="font-mono text-[10px] text-stone-400">
                {initial}
              </span>
            </li>
          );
        })}
      </ol>

      {freezes > 0 && (
        <p className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-600">
          <Snowflake className="h-4 w-4 shrink-0 text-anil-700" aria-hidden="true" />
          {freezes === 1
            ? '1 congelamento guardado — protege um dia perdido.'
            : `${freezes} congelamentos guardados — protegem um dia perdido cada.`}
        </p>
      )}

      {goal !== null && (
        <p className="text-xs text-stone-600">
          Sua meta é de <strong>{goal} dias</strong>.{' '}
          {streakDays >= goal
            ? 'Cumprida.'
            : `Faltam ${goal - streakDays}.`}
        </p>
      )}

      <div>
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Clubes
        </h3>
        <ul className="mt-2 space-y-1.5">
          {STREAK_CLUBS.map((club) => {
            const isEarned = earnedClubs.some((c) => c.id === club.id);
            const isNext = upcoming?.club.id === club.id;

            return (
              <li
                key={club.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${
                  isEarned
                    ? 'border-ouro-500/40 bg-white'
                    : 'border-stone-200 bg-stone-50 text-stone-400'
                }`}
              >
                {isEarned ? (
                  <Flame className="h-4 w-4 shrink-0 text-ouro-500" aria-hidden="true" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span className="flex-1 text-sm font-medium">{club.nome}</span>
                <span className="font-mono text-[11px]">
                  {isEarned ? (
                    <span className="text-ouro-600">alcançado</span>
                  ) : isNext ? (
                    /* O degrau, e não só o cadeado: sem o número a pessoa não
                       sabe se está perto ou a um ano de distância. */
                    <>faltam {upcoming!.daysLeft} dias</>
                  ) : (
                    <>{club.requiredDays} dias</>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

const WEEKDAY_NAMES = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];
