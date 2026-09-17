import React from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StreakProps {
  id?: string;
  days: number;
  longestStreak?: number;
  isFrozen?: boolean;
  freezeDaysLeft?: number;
  compact?: boolean;
  className?: string;
}

export const Streak: React.FC<StreakProps> = ({
  id = 'streak-widget',
  days,
  longestStreak = days,
  isFrozen = false,
  freezeDaysLeft = 0,
  compact = false,
  className,
}) => {
  if (compact) {
    return (
      <div
        id={id}
        aria-label={`Sequência de prática: ${days} dias`}
        className={twMerge(
          clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold select-none border transition-colors',
            isFrozen
              ? 'bg-sky-50 border-sky-200 text-sky-800'
              : days > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-stone-100 border-stone-200 text-stone-500'
          ),
          className
        )}
      >
        {isFrozen ? (
          <Snowflake className="w-3.5 h-3.5 text-sky-600 animate-pulse shrink-0" />
        ) : (
          <Flame
            className={clsx(
              'w-3.5 h-3.5 shrink-0',
              days > 0 ? 'text-amber-600 fill-amber-500' : 'text-stone-400'
            )}
          />
        )}
        <span className="font-mono">{days}</span>
        <span className="text-[10px] uppercase tracking-wider font-sans">dias</span>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={twMerge(
        'p-3.5 bg-white border border-stone-200 rounded-lg shadow-xs flex items-center justify-between select-none gap-3 min-w-[220px]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center border shrink-0',
            isFrozen
              ? 'bg-sky-50 border-sky-200 text-sky-600'
              : days > 0
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-stone-100 border-stone-200 text-stone-400'
          )}
        >
          {isFrozen ? (
            <Snowflake className="w-5 h-5" />
          ) : (
            <Flame className={clsx('w-5 h-5', days > 0 && 'fill-amber-500')} />
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-stone-900">{days}</span>
            <span className="text-xs font-semibold text-stone-600">dias de sequência</span>
          </div>
          <div className="text-[11px] text-stone-500">Recorde pessoal: {longestStreak} dias</div>
        </div>
      </div>

      {freezeDaysLeft > 0 && (
        <div
          id={`${id}-freeze-badge`}
          title={`${freezeDaysLeft} congelamento(s) de sequência disponível(is)`}
          className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[10px] font-mono shrink-0"
        >
          <Snowflake className="w-3 h-3" />
          <span>{freezeDaysLeft}</span>
        </div>
      )}
    </div>
  );
};
