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
  const { measurement, immediateFeedback, isCorrect, xpEarned } = attempt;

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

        {/* 10 Measurements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-stone-50 rounded border border-stone-100">
            <span className="text-[10px] text-stone-500 uppercase block font-mono">Afinação</span>
            <span className="font-bold font-mono text-stone-900">
              {measurement.pitch.centsAccuracy}%
            </span>
            <span className="text-[9px] text-stone-400 block font-mono">
              {measurement.pitch.deviationCents > 0 ? `+${measurement.pitch.deviationCents}` : measurement.pitch.deviationCents} cents
            </span>
          </div>

          <div className="p-2 bg-stone-50 rounded border border-stone-100">
            <span className="text-[10px] text-stone-500 uppercase block font-mono">Timing</span>
            <span className="font-bold font-mono text-stone-900">
              {measurement.timing.timingScore}%
            </span>
            <span className="text-[9px] text-stone-400 block font-mono">
              {measurement.timing.deviationMs > 0 ? `+${measurement.timing.deviationMs}` : measurement.timing.deviationMs} ms
            </span>
          </div>

          <div className="p-2 bg-stone-50 rounded border border-stone-100">
            <span className="text-[10px] text-stone-500 uppercase block font-mono">Ritmo / BPM</span>
            <span className="font-bold font-mono text-stone-900">
              {measurement.rhythm.stabilityScore}%
            </span>
            <span className="text-[9px] text-stone-400 block font-mono">
              {measurement.tempo.recordedBpm} BPM
            </span>
          </div>

          <div className="p-2 bg-stone-50 rounded border border-stone-100">
            <span className="text-[10px] text-stone-500 uppercase block font-mono">Score Total</span>
            <span className="font-bold font-mono text-red-800">
              {measurement.score}/1000
            </span>
            <span className="text-[9px] text-stone-400 block font-mono">
              Precisão {measurement.accuracy}%
            </span>
          </div>
        </div>

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
              <span>Tentar Novamente</span>
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
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white"
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
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white"
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
