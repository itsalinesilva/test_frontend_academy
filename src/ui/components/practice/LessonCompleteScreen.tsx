import React, { useState } from 'react';
import {
  AchievementKey,
  Achievement,
  STREAK_GOALS,
  StreakGoal,
} from '../../../domain/lesson-completion';
import { Award, Crosshair, Flame, Repeat, Sparkles, Target, Trophy } from 'lucide-react';

interface LessonCompleteScreenProps {
  achievements: Achievement[];
  /**
   * Mostrar a etapa que propõe uma meta de constância.
   *
   * Quem decide é `convemPropormeta`: não se propõe no primeiro dia, nem a
   * quem já escolheu.
   */
  offerStreakGoal: boolean;
  onChooseStreakGoal: (meta: StreakGoal) => void;
  onReviewLesson: () => void;
  onFinish: () => void;
}

/**
 * O encerramento.
 *
 * Uma conquista por tela, e não um painel com seis números. Cada tela dá
 * tempo de a conquista *chegar*; num painel único todas competem, e nenhuma é
 * lida.
 *
 * O que aparece aqui foi decidido em `domain/encerramento-da-licao.ts`, e esta
 * tela não acrescenta nada: se a lista veio com dois itens, são duas telas.
 * Isso é o que garante que não exista "Ofensiva: 0 dias" — a conquista que
 * não aconteceu simplesmente não está na lista.
 *
 * A ÚLTIMA ETAPA NÃO É COMEMORAÇÃO
 * --------------------------------
 * É onde se oferece **revisar a lição**. O momento em que a pessoa acabou é o
 * único em que ela ainda lembra o que errou; oferecer a revisão depois, no
 * mapa, é oferecer a quem já esqueceu.
 */
export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({
  achievements,
  offerStreakGoal,
  onChooseStreakGoal,
  onReviewLesson,
  onFinish,
}) => {
  const [step, setEtapa] = useState(0);

  const total = achievements.length + (offerStreakGoal ? 1 : 0) + 1; // +1: o fecho
  const atGoalStep = offerStreakGoal && step === achievements.length;
  const atSummary = step >= total - 1;
  const achievement = achievements[step];

  const next = () => setEtapa((e) => Math.min(e + 1, total - 1));

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="px-4 py-4 sm:px-8">
        <ol className="mx-auto flex max-w-md gap-1.5" aria-label={`Etapa ${step + 1} de ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <li
              key={i}
              aria-hidden="true"
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-anil-700' : 'bg-stone-200'
              }`}
            />
          ))}
        </ol>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-8">
        {achievement && <AchievementCard achievement={achievement} />}

        {atGoalStep && (
          <StreakGoalChoice
            onChoose={(m) => {
              onChooseStreakGoal(m);
              next();
            }}
            onDismiss={next}
          />
        )}

        {atSummary && (
          <section className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-ouro-500" aria-hidden="true" />
            <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">Lição concluída</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              O que você errou voltou nesta mesma lição e foi refeito. É assim que ela fecha.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-left">
              {achievements.map((q) => (
                <div
                  key={q.chave}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-3"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                    {q.titulo}
                  </dt>
                  <dd className="mt-0.5 font-serif text-lg font-bold text-stone-900">{q.valor}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {atSummary ? (
            <>
              <button
                type="button"
                onClick={onFinish}
                className="rounded-lg bg-anil-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
              >
                Voltar ao percurso
              </button>
              <button
                type="button"
                onClick={onReviewLesson}
                className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-8 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <Repeat className="h-4 w-4" aria-hidden="true" />
                Revisar esta lição
              </button>
            </>
          ) : (
            !atGoalStep && (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-anil-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
              >
                Continuar
              </button>
            )
          )}
        </div>
      </footer>
    </div>
  );
};

const ICON: Record<AchievementKey, React.ElementType> = {
  XP: Sparkles,
  ACCURACY: Crosshair,
  SEQUENCE: Target,
  LEVEL: Award,
  STREAK: Flame,
  DAILY_GOAL: Target,
  LEAGUE_ENTRY: Trophy,
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const Icon = ICON[achievement.chave];
  return (
    <section className="text-center">
      <Icon className="mx-auto h-12 w-12 text-ouro-500" aria-hidden="true" />
      <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-anil-800">
        {achievement.titulo}
      </p>
      <p className="mt-1 font-serif text-5xl font-bold text-stone-900">{achievement.valor}</p>
      <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-stone-600">
        {achievement.legenda}
      </p>
    </section>
  );
};

/**
 * A meta de constância.
 *
 * Escolhida pela pessoa, e nunca imposta: uma meta que alguém pôs no lugar da
 * pessoa não é compromisso dela, é cobrança de fora. Por isso também não há
 * opção recomendada nem destaque em nenhuma delas.
 *
 * E por isso existe "agora não". Uma etapa que só avança escolhendo não é
 * escolha — é pedágio, e a pessoa aprende a clicar em qualquer coisa para
 * sair dali. A meta que sairia daí não valeria nada.
 */
const StreakGoalChoice: React.FC<{
  onChoose: (meta: StreakGoal) => void;
  onDismiss: () => void;
}> = ({ onChoose, onDismiss }) => (
  <section className="text-center">
    <Flame className="mx-auto h-12 w-12 text-ouro-500" aria-hidden="true" />
    <h1 className="mt-6 font-serif text-2xl font-bold text-stone-900">
      Quer marcar uma meta de constância?
    </h1>
    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
      É só um alvo seu, para acompanhar. Não muda o que a plataforma libera, e você pode
      trocar depois.
    </p>

    <div className="mt-8 flex flex-col gap-2">
      {STREAK_GOALS.map((meta) => (
        <button
          key={meta}
          type="button"
          onClick={() => onChoose(meta)}
          className="rounded-xl border-2 border-stone-200 bg-white px-6 py-4 text-left transition-colors hover:border-anil-700"
        >
          <span className="font-serif text-lg font-bold text-stone-900">{meta} dias</span>
          <span className="ml-2 text-xs text-stone-500">
            {meta === 7 ? 'uma semana' : meta === 14 ? 'duas semanas' : 'um mês'}
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={onDismiss}
        className="mt-1 py-2 text-sm text-stone-500 underline-offset-2 transition-colors hover:text-stone-800 hover:underline"
      >
        Agora não
      </button>
    </div>
  </section>
);
