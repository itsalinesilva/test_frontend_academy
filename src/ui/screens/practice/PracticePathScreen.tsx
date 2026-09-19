import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { PracticePathMap } from '../../components/practice/PracticePathMap';
import { ExerciseScreen } from '../../components/practice/ExerciseScreen';
import { LessonCompleteScreen } from '../../components/practice/LessonCompleteScreen';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Dimension, DIMENSIONS } from '../../../domain/music-grammar';
import {
  LessonInProgress,
  answer,
  isLessonComplete,
  queueReview,
  skip,
  startLesson,
} from '../../../domain/music-exercise';
import { Level, generateLesson } from '../../../domain/exercise-generator';
import {
  Achievement,
  StreakGoal,
  completionSequence,
  shouldOfferStreakGoal,
} from '../../../domain/lesson-completion';
import { pathRepository } from '../../../repositories/practice-path.repository';

/**
 * O percurso, de ponta a ponta.
 *
 * O QUE ESTAVA FALTANDO
 * ---------------------
 * Oito componentes prontos e testados — mapa, exercício, encerramento, liga,
 * matrícula, missões, réguas, ofensiva — e **nenhuma rota**. Código que
 * ninguém roda: a suíte passava, o `tsc` passava, e a pessoa não conseguia
 * chegar a nada disso.
 *
 * O `practice-path.repository` estava no mesmo estado: existia, gravava, e
 * ninguém o chamava. Foi a pergunta "está sincronizado?" que o encontrou.
 *
 * O QUE ESTA TELA FAZ
 * -------------------
 * Costura os três que formam o laço principal:
 *
 *   mapa → lição → encerramento → mapa com o nó concluído
 *
 * E grava no meio do caminho. Sem a gravação o laço seria uma demonstração:
 * a pessoa concluiria o nó, voltaria ao mapa e o veria fechado de novo.
 */

type Etapa =
  | { fase: 'MAPA' }
  | { fase: 'LICAO'; dimension: Dimension; lesson: LessonInProgress }
  | { fase: 'FIM'; dimension: Dimension; achievements: Achievement[] };

const EXERCICIOS_POR_LICAO = 8;

export const PracticePathScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();

  const [completed, setCompleted] = useState<Dimension[] | null>(null);
  const [streakGoal, setStreakGoal] = useState<StreakGoal | null>(null);
  const [etapa, setEtapa] = useState<Etapa>({ fase: 'MAPA' });

  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    pathRepository.forUser(userId).then((record) => {
      if (!vivo) return;
      setCompleted(record.completed);
      setStreakGoal(record.streakGoal);
    });
    return () => {
      vivo = false;
    };
  }, [userId]);

  /**
   * Abrir um nó gera a lição.
   *
   * A semente sai do identificador da pessoa mais a dimensão: a mesma pessoa
   * reencontra a mesma lição se voltar, em vez de receber outra a cada
   * abertura. Trocar a pergunta no meio da resposta é a falha que o gerador
   * determinístico existe para impedir.
   */
  const abrirNo = useCallback(
    (dimension: Dimension) => {
      const semente = [...(userId ?? 'anon'), ...dimension].reduce(
        (a, c) => (a * 31 + c.charCodeAt(0)) >>> 0,
        7
      );
      const exercicios = generateLesson(dimension, Level.RECOGNIZE, semente, EXERCICIOS_POR_LICAO);

      if (exercicios.length === 0) {
        /**
         * Nó sem gerador ainda. Não se abre uma lição vazia: seria levar a
         * pessoa a uma tela onde não há o que responder.
         */
        return;
      }

      setEtapa({
        fase: 'LICAO',
        dimension,
        lesson: startLesson(`percurso_${dimension}`, exercicios),
      });
    },
    [userId]
  );

  const aoResponder = (isCorrect: boolean) => {
    if (etapa.fase !== 'LICAO') return;

    let lesson = answer(etapa.lesson, isCorrect);
    lesson = queueReview(lesson);

    if (!isLessonComplete(lesson) && lesson.index < lesson.queue.length) {
      setEtapa({ ...etapa, lesson });
      return;
    }
    encerrar(etapa.dimension, lesson);
  };

  const encerrar = (dimension: Dimension, lesson: LessonInProgress) => {
    const achievements = completionSequence(lesson, {
      xpBefore: 0,
      streakDays: 0,
      sustainedDayNow: false,
      metDailyGoalNow: false,
      completionsBefore: completed?.length ?? 0,
    });
    setEtapa({ fase: 'FIM', dimension, achievements });
  };

  /** Concluir grava. Sem isto o nó reabriria fechado na próxima visita. */
  const concluir = async (dimension: Dimension) => {
    if (userId) {
      const record = await pathRepository.completeNode(userId, dimension);
      setCompleted(record.completed);
    } else {
      setCompleted((atual) => [...(atual ?? []), dimension]);
    }
    setEtapa({ fase: 'MAPA' });
  };

  if (etapa.fase === 'LICAO') {
    return (
      <ExerciseScreen
        lesson={etapa.lesson}
        onAnswer={aoResponder}
        onSkip={() => setEtapa({ ...etapa, lesson: skip(etapa.lesson) })}
        onExit={() => setEtapa({ fase: 'MAPA' })}
      />
    );
  }

  if (etapa.fase === 'FIM') {
    return (
      <LessonCompleteScreen
        achievements={etapa.achievements}
        offerStreakGoal={shouldOfferStreakGoal(0, streakGoal)}
        onChooseStreakGoal={(meta) => {
          setStreakGoal(meta);
          if (userId) void pathRepository.setStreakGoal(userId, meta);
        }}
        onReviewLesson={() => abrirNo(etapa.dimension)}
        onFinish={() => void concluir(etapa.dimension)}
      />
    );
  }

  return (
    <ScreenContainer
      id="practice-path"
      title="Percurso"
      subtitle="As seções do Laboratório, na ordem em que se estuda."
      badgeLabel={
        completed === null ? 'Carregando' : `${completed.length} de ${Object.keys(DIMENSIONS).length}`
      }
      badgeVariant="neutral"
      state={completed === null ? 'loading' : 'populated'}
      loadingMessage="Abrindo o percurso…"
      secondaryActions={[
        { label: 'Missões', onClick: () => navigate('/practice/missions') },
        { label: 'Liga', onClick: () => navigate('/practice/league') },
      ]}
    >
      <PracticePathMap completed={completed ?? []} onOpenNode={abrirNo} />
    </ScreenContainer>
  );
};
