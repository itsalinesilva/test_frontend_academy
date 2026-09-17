import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Award, RotateCcw, Bookmark, Share2 } from 'lucide-react';
import { CircularProgress } from '../data-display/Progress';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';

export interface MetricItem {
  name: string;
  score: number; // 0-100
  feedback?: string;
  status: 'excelente' | 'adequado' | 'atencao';
}

export interface PracticeResultCardProps {
  id: string; // Mandatory ID
  exerciseTitle: string;
  instrumentOrMode: string;
  overallScore: number; // 0-100
  attemptNumber?: number;
  pitchAccuracy: number;
  timingAccuracy: number;
  coveragePercent: number;
  pedagogicalFeedback: string;
  onRetry?: () => void;
  onSaveEvidence?: () => void;
  onShare?: () => void;
  className?: string;
}

export const PracticeResultCard: React.FC<PracticeResultCardProps> = ({
  id,
  exerciseTitle,
  instrumentOrMode,
  overallScore,
  attemptNumber = 1,
  pitchAccuracy,
  timingAccuracy,
  coveragePercent,
  pedagogicalFeedback,
  onRetry,
  onSaveEvidence,
  onShare,
  className,
}) => {
  const isApproved = overallScore >= 70;

  return (
    <div
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden flex flex-col',
          className
        )
      )}
    >
      {/* Header */}
      <div
        id={`${id}-header`}
        className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500">
              Tentativa #{attemptNumber} • {instrumentOrMode}
            </span>
            {isApproved ? (
              <Badge id={`${id}-badge-status`} variant="success" size="sm">
                Atingiu Critério
              </Badge>
            ) : (
              <Badge id={`${id}-badge-status`} variant="warning" size="sm">
                Necessita Revisão
              </Badge>
            )}
          </div>
          <h3 id={`${id}-title`} className="text-base font-semibold text-stone-900 mt-0.5">
            Resultado da Prática: {exerciseTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onShare && (
            <button
              id={`${id}-share-btn`}
              type="button"
              onClick={onShare}
              title="Compartilhar resultado"
              aria-label="Compartilhar resultado"
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onSaveEvidence && (
            <Button
              id={`${id}-save-evidence-btn`}
              size="sm"
              variant="outline"
              onClick={onSaveEvidence}
              leadingIcon={<Bookmark className="w-3.5 h-3.5" />}
            >
              Salvar Evidência
            </Button>
          )}
          {onRetry && (
            <Button
              id={`${id}-retry-btn`}
              size="sm"
              variant="primary"
              onClick={onRetry}
              leadingIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Praticar Novamente
            </Button>
          )}
        </div>
      </div>

      {/* Score and Metrics Matrix */}
      <div id={`${id}-body`} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Overall Circular Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-lg border border-stone-100 text-center">
          <CircularProgress
            id={`${id}-circular-score`}
            value={overallScore}
            size={96}
            strokeWidth={8}
            variant={overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'danger'}
            sublabel="Acurácia Global"
          />
          <span className="text-xs text-stone-600 mt-2 font-medium">Pontuação Avaliada</span>
        </div>

        {/* Detailed Breakdown */}
        <div className="md:col-span-3 space-y-3 text-xs">
          {/* Pitch metric */}
          <div id={`${id}-metric-pitch`} className="p-3 bg-stone-50/70 rounded border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Acurácia de Afinação (Pitch)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pitchAccuracy}%` }}
                  className={clsx(
                    'h-full rounded-full',
                    pitchAccuracy >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                  )}
                />
              </div>
              <span className="font-mono font-bold text-stone-900 w-10 text-right">{pitchAccuracy}%</span>
            </div>
          </div>

          {/* Timing metric */}
          <div id={`${id}-metric-timing`} className="p-3 bg-stone-50/70 rounded border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Precisão Rítmica & Ataque (Timing)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${timingAccuracy}%` }}
                  className={clsx(
                    'h-full rounded-full',
                    timingAccuracy >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                  )}
                />
              </div>
              <span className="font-mono font-bold text-stone-900 w-10 text-right">{timingAccuracy}%</span>
            </div>
          </div>

          {/* Coverage metric */}
          <div id={`${id}-metric-coverage`} className="p-3 bg-stone-50/70 rounded border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Cobertura da Partitura</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${coveragePercent}%` }}
                  className="h-full rounded-full bg-stone-700"
                />
              </div>
              <span className="font-mono font-bold text-stone-900 w-10 text-right">{coveragePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pedagogical Feedback Note */}
      <div id={`${id}-feedback-box`} className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-start gap-3 text-xs text-stone-700">
        <Award className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-semibold text-stone-900">Parecer Pedagógico do Motor:</span>
          <p className="mt-0.5 leading-relaxed text-stone-600">{pedagogicalFeedback}</p>
        </div>
      </div>
    </div>
  );
};
