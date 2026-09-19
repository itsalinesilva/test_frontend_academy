import React from 'react';
import { Lock, CheckCircle2, Play, FileText, FileMusic, Headphones } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface LessonCardProps {
  id?: string;
  orderIndex: number;
  title: string;
  durationMinutes?: number;
  type?: 'READING' | 'AUDIO' | 'SCORE' | 'INTERACTIVE';
  status?: 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  onSelect?: () => void;
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  id = 'lesson-card',
  orderIndex,
  title,
  durationMinutes,
  type = 'READING',
  status = 'NOT_STARTED',
  onSelect,
  className,
}) => {
  const isLocked = status === 'LOCKED';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  const typeIcon = {
    READING: <FileText className="w-4 h-4" />,
    AUDIO: <Headphones className="w-4 h-4" />,
    SCORE: <FileMusic className="w-4 h-4" />,
    INTERACTIVE: <Play className="w-4 h-4" />,
  };

  return (
    <div
      id={id}
      onClick={!isLocked && onSelect ? onSelect : undefined}
      role={!isLocked && onSelect ? 'button' : undefined}
      tabIndex={!isLocked && onSelect ? 0 : undefined}
      aria-disabled={isLocked}
      className={twMerge(
        clsx(
          'flex items-center justify-between p-3.5 bg-white border rounded-lg transition-all select-none gap-3',
          isLocked
            ? 'border-stone-200 bg-stone-50/70 text-stone-400 opacity-80 cursor-not-allowed'
            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
          isInProgress && 'border-red-300 ring-1 ring-anil-800/20 bg-red-50/10'
        ),
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Status Indicator Icon */}
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0',
            isLocked && 'bg-stone-200 text-stone-500',
            isCompleted && 'bg-emerald-100 text-emerald-800',
            isInProgress && 'bg-anil-800 text-white',
            status === 'NOT_STARTED' && 'bg-stone-100 text-stone-700 border border-stone-300'
          )}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          ) : (
            <span>{orderIndex}</span>
          )}
        </div>

        {/* Title and metadata */}
        <div className="truncate">
          <h4
            className={clsx(
              'text-sm font-semibold truncate',
              isLocked ? 'text-stone-400' : 'text-stone-900'
            )}
          >
            {title}
          </h4>

          <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
            <span className="flex items-center gap-1">
              {typeIcon[type]}
              <span className="capitalize">{type.toLowerCase()}</span>
            </span>

            {durationMinutes !== undefined && (
              <span>{durationMinutes} min</span>
            )}
          </div>
        </div>
      </div>

      {/* Trailing Tag */}
      <div className="shrink-0 text-xs">
        {isCompleted && (
          <span className="font-semibold text-emerald-700 text-xs">Concluída</span>
        )}
        {isInProgress && (
          <span className="font-semibold text-anil-800 text-xs">Em andamento</span>
        )}
      </div>
    </div>
  );
};
