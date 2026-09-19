import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  id?: string;
  variant?: 'neutral' | 'brand' | 'accent' | 'primary' | 'success' | 'warning' | 'error' | 'danger' | 'muted';
  size?: 'sm' | 'md' | 'kids';
  hasDot?: boolean;
}

let badgeCounter = 0;

export const Badge: React.FC<BadgeProps> = ({
  id: explicitId,
  children,
  variant = 'neutral',
  size = 'sm',
  hasDot = false,
  className,
  ...props
}) => {
  const [autoId] = React.useState(() => `badge-${++badgeCounter}`);
  const id = explicitId || autoId;

  const variantStyles = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    muted: 'bg-stone-100 text-stone-500 border-stone-200',
    brand: 'bg-red-50 text-red-900 border-red-200',
    primary: 'bg-anil-800 text-white border-anil-800',
    accent: 'bg-red-100 text-anil-950 border-red-300 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const dotColors = {
    neutral: 'bg-stone-400',
    muted: 'bg-stone-400',
    brand: 'bg-anil-700',
    primary: 'bg-white',
    accent: 'bg-anil-700',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    error: 'bg-rose-600',
    danger: 'bg-rose-600',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    kids: 'px-3 py-1.5 text-sm font-semibold tracking-wide',
  };

  return (
    <span
      id={id}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded border whitespace-nowrap select-none transition-colors',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {hasDot && (
        <span
          id={`${id}-dot`}
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      <span id={`${id}-label`} className="truncate">{children}</span>
    </span>
  );
};
