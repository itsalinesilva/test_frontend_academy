import React from 'react';
import { Play, Target, Zap, Clock } from 'lucide-react';
import { Button } from '../base/Button';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PracticeCardProps {
  id?: string;
  title: string;
  skillName: string;
  category?: string;
  difficulty?: 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso';
  accuracyPercentage?: number;
  xpReward?: number;
  estimatedMinutes?: number;
  onStart?: () => void;
  className?: string;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
  id = 'practice-card',
  title,
  skillName,
  category = 'Percepção Rítmica',
  difficulty = 'iniciante',
  accuracyPercentage,
  xpReward = 20,
  estimatedMinutes = 5,
  onStart,
  className,
}) => {
  const difficultyColors = {
    iniciante: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    intermediario: 'bg-amber-50 text-amber-800 border-amber-200',
    avancado: 'bg-red-50 text-red-800 border-red-200',
    virtuoso: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <article
      id={id}
      className={twMerge(
        'p-4 bg-white border border-stone-200 rounded-lg shadow-xs flex flex-col justify-between gap-3 hover:border-stone-300 transition-colors select-none',
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {category}
          </span>
          <span
            className={clsx(
              'text-[10px] uppercase font-bold px-2 py-0.5 rounded border',
              difficultyColors[difficulty]
            )}
          >
            {difficulty}
          </span>
        </div>

        <h4 className="text-sm font-bold text-stone-900 tracking-tight leading-snug">
          {title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-stone-600">
          <Target className="w-3.5 h-3.5 text-red-800 shrink-0" />
          <span className="truncate">{skillName}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-stone-500 font-mono">
          <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
            <Zap className="w-3.5 h-3.5 text-red-800 fill-red-800" />
            +{xpReward} XP
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            {estimatedMinutes}m
          </span>

          {accuracyPercentage !== undefined && (
            <span className="font-semibold text-emerald-700">
              {accuracyPercentage}% precisão
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onStart}
          leadingIcon={<Play className="w-3.5 h-3.5 fill-white" />}
        >
          Praticar
        </Button>
      </div>
    </article>
  );
};
