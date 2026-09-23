import React, { useEffect, useState } from 'react';
import { useRouter } from '../../navigation/router';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ExerciseScreen } from '../../components/practice/ExerciseScreen';
import { Button } from '../../components/base/Button';
import { acervoService } from '../../../services/application/acervo.service';
import {
  LessonInProgress,
  accuracy,
  answer,
  isLessonComplete,
  queueReview,
  skip,
  startLesson,
} from '../../../domain/music-exercise';
import { praticaDaObra } from '../../../domain/pratica-da-obra';

/**
 * A PRÁTICA SOBRE UMA OBRA — `/practice?obra=<id>` (AC-1i).
 *
 * A ficha da obra oferecia "Levar à prática" e o Laboratório ignorava a obra.
 * Aqui a lição é feita da própria peça (`pratica-da-obra.ts`), e roda na mesma
 * tela de exercício do percurso — quem já respondeu no Laboratório não
 * precisa aprender outra.
 */
export const PraticaDaObraScreen: React.FC<{ obraId: string }> = ({ obraId }) => {
  const { navigate } = useRouter();
  const [titulo, setTitulo] = useState<string | null>(null);
  const [licao, setLicao] = useState<LessonInProgress | null>(null);
  const [inicial, setInicial] = useState<LessonInProgress | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [fim, setFim] = useState<LessonInProgress | null>(null);

  useEffect(() => {
    let vivo = true;
    acervoService.fichaDaObra(obraId).then((ficha) => {
      if (!vivo) return;
      setCarregando(false);
      if (!ficha) {
        setAviso('A obra pedida não está no acervo.');
        return;
      }
      const faixa = acervoService.faixaDaObra(ficha.obra);
      if (!faixa) {
        setAviso('Esta obra ainda não tem transcrição própria — e é dela que a prática é feita.');
        return;
      }
      const exercicios = praticaDaObra({ ...faixa, id: obraId });
      if (exercicios.length === 0) {
        setAviso('A transcrição desta obra é curta demais para render uma prática.');
        return;
      }
      setTitulo(faixa.titulo);
      const nova = startLesson(`obra_${obraId}`, exercicios);
      setInicial(nova);
      setLicao(nova);
    });
    return () => {
      vivo = false;
    };
  }, [obraId]);

  if (licao && !fim) {
    return (
      <ExerciseScreen
        lesson={licao}
        onAnswer={(certo) => {
          const proxima = queueReview(answer(licao, certo));
          if (isLessonComplete(proxima) || proxima.index >= proxima.queue.length) setFim(proxima);
          else setLicao(proxima);
        }}
        onSkip={() => setLicao(skip(licao))}
        onExit={() => navigate(`/acervo/obra/${obraId}`)}
      />
    );
  }

  const aproveitamento = fim ? accuracy(fim) : null;

  return (
    <ScreenContainer
      id="pratica-da-obra"
      title={titulo ? `Prática: ${titulo}` : 'Prática sobre a obra'}
      subtitle="Notas, intervalos, compasso e o som da própria peça."
      badgeLabel="Laboratório"
      badgeVariant="brand"
      state={carregando ? 'loading' : 'populated'}
      loadingMessage="Preparando a prática…"
    >
      <div className="space-y-4">
        {aviso && (
          <p role="status" className="rounded-lg border border-ouro-300 bg-ouro-50 p-4 text-sm text-stone-800">
            {aviso}
          </p>
        )}

        {fim && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-serif text-lg font-bold text-emerald-950">Prática concluída.</p>
            <p className="mt-1 text-sm text-stone-700">
              {fim.correct} {fim.correct === 1 ? 'acerto' : 'acertos'}
              {aproveitamento !== null ? `, ${aproveitamento}% de aproveitamento` : ''}. As perguntas
              são sempre as mesmas para esta peça: voltar a elas é como se estuda uma obra.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {fim && inicial && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFim(null);
                setLicao(inicial);
              }}
            >
              Praticar de novo
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate(`/acervo/obra/${obraId}`)}>
            Voltar à ficha da obra
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/score?obra=${obraId}`)}>
            Abrir na partitura
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
