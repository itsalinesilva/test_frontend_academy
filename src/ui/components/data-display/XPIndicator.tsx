import React from 'react';
import { Zap, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface XPIndicatorProps {
  id?: string;
  totalXp: number;
  level?: number;
  currentLevelXp?: number;
  nextLevelXp?: number;
  compact?: boolean;
  className?: string;
}

export const XPIndicator: React.FC<XPIndicatorProps> = ({
  id = 'xp-indicator',
  totalXp,
  level = 1,
  currentLevelXp = 0,
  nextLevelXp = 500,
  compact = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentLevelXp / (nextLevelXp || 1)) * 100)));

  if (compact) {
    return (
      <div
        id={id}
        aria-label={`${totalXp} Pontos de Experiência, Nível ${level}`}
        className={twMerge(
          'inline-flex items-center gap-1.5 px-2 py-1 bg-stone-100 border border-stone-200 rounded text-xs font-semibold text-stone-800 select-none',
          className
        )}
      >
        <Zap className="w-3.5 h-3.5 text-red-800 fill-red-800 shrink-0" />
        <span className="font-mono">{totalXp.toLocaleString()} XP</span>
        <span className="text-[10px] text-stone-500 font-mono">Nv. {level}</span>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={twMerge(
        'p-3 bg-white border border-stone-200 rounded-lg shadow-xs flex flex-col gap-2 select-none min-w-[200px]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-800">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">Nível {level}</div>
            <div className="text-[11px] text-stone-500 font-mono">{totalXp.toLocaleString()} XP Totais</div>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-red-800">{percentage}%</span>
      </div>

      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
        <div
          id={`${id}-progress-fill`}
          style={{ width: `${percentage}%` }}
          className="h-full bg-red-800 transition-all duration-300 rounded-full"
        />
      </div>

      <div className="flex justify-between text-[10px] text-stone-500 font-mono">
        <span>{currentLevelXp} XP</span>
        <span>{nextLevelXp} XP</span>
      </div>
    </div>
  );
};
