import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'kids';
  isLoading?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
}

let iconBtnCounter = 0;

export const IconButton: React.FC<IconButtonProps> = ({
  id: explicitId,
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  isSelected = false,
  isActive = false,
  disabled = false,
  className,
  ...props
}) => {
  const [autoId] = React.useState(() => `icon-btn-${++iconBtnCounter}`);
  const id = explicitId || autoId;

  const baseClasses =
    'inline-flex items-center justify-center rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0';

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 text-xs min-w-[32px] min-h-[32px]',
    md: 'w-10 h-10 p-2 text-sm min-w-[40px] min-h-[40px]',
    lg: 'w-12 h-12 p-3 text-base min-w-[48px] min-h-[48px]',
    kids: 'w-14 h-14 p-3.5 text-lg min-w-[52px] min-h-[52px] rounded-lg',
  };

  const variantClasses = {
    primary:
      'bg-anil-800 text-white hover:bg-anil-900 active:bg-anil-950 focus:ring-anil-800 focus:ring-offset-stone-50 border border-transparent shadow-xs',
    secondary:
      'bg-stone-900 text-white hover:bg-stone-800 active:bg-black focus:ring-stone-900 focus:ring-offset-stone-50 border border-transparent',
    outline:
      'border border-stone-300 text-stone-800 bg-white hover:bg-stone-50 active:bg-stone-100 focus:ring-stone-400',
    ghost:
      'text-stone-700 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 focus:ring-stone-300 border border-transparent',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 focus:ring-rose-700 border border-transparent',
    accent:
      'bg-stone-100 text-red-900 hover:bg-stone-200 active:bg-stone-300 focus:ring-anil-800 border border-red-200',
  };

  const stateClass = isSelected || isActive
    ? 'bg-red-50 text-red-900 border-red-300 ring-1 ring-anil-800'
    : '';

  const computedClass = twMerge(
    clsx(baseClasses, sizeClasses[size], variantClasses[variant], stateClass, className)
  );

  return (
    <button
      id={id}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-pressed={isSelected}
      disabled={disabled || isLoading}
      className={computedClass}
      {...props}
    >
      {isLoading ? (
        <Loader2 id={`${id}-spinner`} className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        <span id={`${id}-icon`} className="inline-flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </button>
  );
};
