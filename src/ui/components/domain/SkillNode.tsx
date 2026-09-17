import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkillNodeProps {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  level?: number; // 0 to 5
  maxLevel?: number; // default 5
  progressPercentage?: number; // 0 to 100 for current level
  isLocked?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  id = 'skill-node',
  title,
  icon,
  level = 0,
  maxLevel = 5,
  progressPercentage = 0,
  isLocked = false,
  isActive = false,
  onClick,
  className,
}) => {
  const isMastered = level >= maxLevel;

  return (
    <div
      id={id}
      className={twMerge('flex flex-col items-center select-none gap-2', className)}
    >
      <div className="relative inline-flex items-center justify-center">
        {/* Progress Circular Track */}
        {!isLocked && (
          <svg className="w-18 h-18 -rotate-90 pointer-events-none" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="32"
              strokeWidth="4"
              className="stroke-stone-200 fill-none"
            />
            <circle
              cx="36"
              cy="36"
              r="32"
              strokeWidth="4"
              strokeDasharray={201}
              strokeDashoffset={201 - (progressPercentage / 100) * 201}
              strokeLinecap="round"
              className="stroke-anil-800 fill-none transition-all duration-300"
            />
          </svg>
        )}

        {/* Main Node Button */}
        <button
          type="button"
          disabled={isLocked}
          onClick={!isLocked ? onClick : undefined}
          aria-label={`${title}, Nível ${level} de ${maxLevel}${isLocked ? ', Bloqueado' : ''}`}
          className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-anil-800',
            !isLocked && 'cursor-pointer active:scale-95 shadow-md',
            isLocked && 'bg-stone-200 text-stone-400 cursor-not-allowed border-2 border-stone-300',
            !isLocked && !isMastered && 'bg-anil-800 text-white hover:bg-anil-900 border-2 border-anil-950',
            isMastered && 'bg-amber-500 text-stone-950 hover:bg-amber-600 border-2 border-amber-700',
            isActive && 'ring-4 ring-anil-800/30 ring-offset-2 animate-pulse',
            !isLocked && 'absolute top-2 left-2'
          )}
        >
          {isLocked ? (
            <Lock className="w-6 h-6" />
          ) : isMastered ? (
            <Crown className="w-7 h-7 fill-amber-200 text-stone-950" />
          ) : icon ? (
            <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
          ) : (
            <span className="font-bold text-base font-mono">{level}</span>
          )}
        </button>

        {/* Crown Badge for Mastery Level */}
        {!isLocked && level > 0 && (
          <div
            id={`${id}-crown-badge`}
            className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-900 border border-amber-600 rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono flex items-center gap-0.5 shadow-xs"
          >
            <Crown className="w-2.5 h-2.5 fill-stone-900" />
            <span>{level}</span>
          </div>
        )}
      </div>

      {/* Skill Label */}
      <span className="text-xs font-semibold text-stone-800 text-center max-w-[100px] leading-tight line-clamp-2">
        {title}
      </span>
    </div>
  );
};
