import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  id: string; // Mandatory ID
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValueLabel?: boolean;
  variant?: 'primary' | 'success' | 'accent' | 'neutral';
  sizeVariant?: 'sm' | 'md' | 'lg' | 'kids';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  id,
  value,
  max = 100,
  label,
  showValueLabel = false,
  variant = 'primary',
  sizeVariant = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    kids: 'h-5 rounded-full',
  };

  const fillColors = {
    primary: 'bg-anil-800',
    accent: 'bg-anil-700',
    success: 'bg-emerald-600',
    neutral: 'bg-stone-700',
  };

  return (
    <div id={`${id}-wrapper`} className={twMerge(clsx('w-full flex flex-col gap-1.5', className))}>
      {(label || showValueLabel) && (
        <div className="flex justify-between items-center text-xs font-medium text-stone-700">
          {label && <span id={`${id}-label`}>{label}</span>}
          {showValueLabel && (
            <span id={`${id}-value-label`} className="font-mono text-stone-500 font-semibold">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        id={id}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progresso'}
        className={clsx('w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/60', heightClasses[sizeVariant])}
      >
        <div
          id={`${id}-fill`}
          style={{ width: `${percentage}%` }}
          className={clsx('h-full transition-all duration-300 ease-out rounded-full', fillColors[variant])}
        />
      </div>
    </div>
  );
};

export interface CircularProgressProps {
  id: string; // Mandatory ID
  value: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  label?: string;
  sublabel?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  id,
  value,
  size = 80,
  strokeWidth = 6,
  variant = 'primary',
  label,
  sublabel,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    primary: 'stroke-anil-800',
    success: 'stroke-emerald-600',
    warning: 'stroke-amber-600',
    danger: 'stroke-rose-600',
  };

  return (
    <div
      id={id}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Métrica percentual'}
      className={twMerge(clsx('relative inline-flex items-center justify-center select-none', className))}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-stone-200 fill-transparent"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={clsx('fill-transparent transition-all duration-500 ease-out', strokeColors[variant])}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        <span id={`${id}-value`} className="text-sm font-bold font-mono text-stone-900 leading-none">
          {percentage}%
        </span>
        {sublabel && (
          <span id={`${id}-sublabel`} className="text-[10px] text-stone-500 mt-0.5 leading-none">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
