import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressRingProps {
  id?: string;
  value: number; // 0 to 100
  size?: number; // diameter in px (default 48)
  strokeWidth?: number; // default 4
  colorVariant?: 'brand' | 'success' | 'warning' | 'neutral';
  showLabel?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  id = 'progress-ring',
  value,
  size = 48,
  strokeWidth = 4,
  colorVariant = 'brand',
  showLabel = false,
  isCompleted = false,
  className,
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorClasses = {
    brand: 'stroke-anil-800 text-anil-800',
    success: 'stroke-emerald-700 text-emerald-700',
    warning: 'stroke-amber-600 text-amber-600',
    neutral: 'stroke-stone-900 text-stone-900',
  };

  return (
    <div
      id={id}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={twMerge('relative inline-flex items-center justify-center shrink-0 select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-stone-200 fill-none"
        />
        {/* Progress active circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={clsx(
            'fill-none transition-all duration-300',
            isCompleted ? 'stroke-emerald-700' : colorClasses[colorVariant].split(' ')[0]
          )}
        />
      </svg>

      {showLabel && (
        <span
          id={`${id}-label`}
          className={clsx(
            'absolute text-[11px] font-bold tracking-tight',
            isCompleted ? 'text-emerald-700' : colorClasses[colorVariant].split(' ')[1]
          )}
        >
          {isCompleted ? '✓' : `${Math.round(normalizedValue)}%`}
        </span>
      )}
    </div>
  );
};
