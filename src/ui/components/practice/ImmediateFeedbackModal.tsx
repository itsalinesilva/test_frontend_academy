import React from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import {
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ExerciseAttempt } from '../../../domain/practice';
import { useRouter } from '../../navigation/router';

export interface ImmediateFeedbackProps {
  attempt: ExerciseAttempt;
  onRetry: () => void;
  onNext: () => void;
  onViewResult?: () => void;
  isLastExercise?: boolean;
}

export const ImmediateFeedbackModal: React.FC<ImmediateFeedbackProps> = ({
  attempt,
  onRetry,
  onNext,
  onViewResult,
  isLastExercise = false,
}) => {
  const router = useRouter();
  const { medicao, immediateFeedback, isCorrect, xpEarned } = attempt;
  const semMedicao = medicao.notaGlobal === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card
        variant="default"
        padding="lg"
        className={`w-full max-w-lg border-2 shadow-2xl space-y-5 bg-white ${
          isCorrect ? 'border-emerald-500' : 'border-amber-500'
        }`}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isCorrect ? 'success' : 'warning'}>
                  {isCorrect ? 'Aprovado' : 'Ajuste Necessário'}
                </Badge>
                <Badge variant="neutral">
                  +{xpEarned} XP
                </Badge>
                {immediateFeedback.badgeAwarded && (
                  <Badge variant="brand" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {immediateFeedback.badgeAwarded}
                  </Badge>
                )}
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">
                {immediateFeedback.headline}
              </h3>
            </div>
          </div>
        </div>

        {/* Immediate Feedback Description */}
        <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1.5">
          <p className="leading-relaxed">{immediateFeedback.details}</p>
          <p className="text-stone-500 font-medium italic">
            Dica do Mestre: {immediateFeedback.correctiveAction}
          </p>
        </div>

        {/*
          Grade de medição.

          Cada célula mostra o que FOI medido. O que não foi aparece como
          "não medido", e não como zero: zero é uma nota ruim, ausência é a
          ausência de informação, e confundir as duas faz o aluno corrigir
          um erro que ele não cometeu.
        */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          <Celula
            rotulo="Afinação"
            valor={medicao.afinacao.pontuacao}
            detalhe={
              medicao.afinacao.desvioCents !== null
                ? `${medicao.afinacao.desvioCents > 0 ? '+' : ''}${medicao.afinacao.desvioCents} cents`
                : null
            }
          />
          <Celula
            rotulo="Tempo"
            valor={medicao.tempoRitmico.pontuacao}
            detalhe={
              medicao.tempoRitmico.desvioMedioMs !== null
                ? `${medicao.tempoRitmico.desvioMedioMs} ms do pulso`
                : null
            }
          />
          <Celula
            rotulo="Pulso"
            valor={medicao.estabilidadeRitmica}
            detalhe={
              medicao.tempoRitmico.bpmMedido !== null
                ? `${medicao.tempoRitmico.bpmMedido} BPM medidos`
                : null
            }
          />
          <Celula
            rotulo="Altura firme"
            valor={medicao.estabilidadeDeAltura}
            detalhe={medicao.afinacao.notaDetectada}
          />
          <Celula rotulo="Sustentação" valor={medicao.sustentacao.pontuacao} detalhe={null} />
          <Celula
            rotulo="Resposta"
            valor={medicao.acerto.pontuacao}
            detalhe={
              medicao.acerto.correto === null
                ? null
                : medicao.acerto.correto
                  ? 'correta'
                  : 'incorreta'
            }
          />
          <div className="col-span-2 rounded border border-stone-200 bg-stone-50 p-2">
            <span className="block font-mono text-[10px] uppercase text-stone-500">
              Nota da tentativa
            </span>
            <span className="font-mono text-lg font-bold text-anil-800">
              {medicao.notaGlobal !== null ? `${medicao.notaGlobal}/100` : '—'}
            </span>
            <span className="block font-mono text-[9px] text-stone-400">
              {medicao.dimensoesMedidas.length > 0
                ? `média de ${medicao.dimensoesMedidas.length} ${medicao.dimensoesMedidas.length === 1 ? 'dimensão medida' : 'dimensões medidas'}`
                : 'nada foi medido'}
            </span>
          </div>
        </div>

        {/* O que não pôde ser medido, e por quê. */}
        {medicao.ausencias.length > 0 && (
          <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2.5">
            {medicao.ausencias.map((a, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-amber-900">
                {a}
              </li>
            ))}
          </ul>
        )}

        {/* Action Buttons: Retry vs Full Feedback vs Next vs Finish */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-200">
          <div className="flex items-center gap-2">
            <Button
              id="btn-retry-attempt"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{semMedicao ? 'Repetir a captura' : 'Tentar Novamente'}</span>
            </Button>
            <Button
              id="btn-open-full-feedback"
              variant="outline"
              size="sm"
              onClick={() => router.navigate(`/practice/feedback/${attempt.id}`)}
              className="flex items-center gap-1.5 text-xs text-stone-600"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Tela Completa</span>
            </Button>
          </div>

          {isLastExercise && onViewResult ? (
            <Button
              id="btn-finish-practice"
              variant="primary"
              size="sm"
              onClick={onViewResult}
              className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Concluir & Evidência</span>
            </Button>
          ) : (
            <Button
              id="btn-next-exercise"
              variant="primary"
              size="sm"
              onClick={onNext}
              className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
            >
              <span>Próximo Exercício</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * Uma célula da grade.
 *
 * O traço no lugar do número é deliberado: preencher com zero faria o aluno
 * enxergar uma nota baixa onde houve apenas falta de sinal.
 */
const Celula: React.FC<{
  rotulo: string;
  valor: number | null;
  detalhe: string | null;
}> = ({ rotulo, valor, detalhe }) => (
  <div
    className={`rounded border p-2 ${
      valor === null ? 'border-stone-100 bg-stone-50/50' : 'border-stone-100 bg-stone-50'
    }`}
  >
    <span className="block font-mono text-[10px] uppercase text-stone-500">{rotulo}</span>
    <span
      className={`font-mono font-bold ${valor === null ? 'text-stone-300' : 'text-stone-900'}`}
    >
      {valor === null ? '—' : valor}
    </span>
    <span className="block font-mono text-[9px] text-stone-400">
      {valor === null ? 'não medido' : (detalhe ?? '')}
    </span>
  </div>
);
