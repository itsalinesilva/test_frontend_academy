import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'kids';
  isLoading?: boolean;
  isSuccess?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

let buttonCounter = 0;

export const Button: React.FC<ButtonProps> = ({
  id: explicitId,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  className,
  ...props
}) => {
  const [autoId] = React.useState(() => `btn-${++buttonCounter}`);
  const id = explicitId || autoId;

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Rule: Button horizontal padding must be exactly 2x vertical padding
  // Kids mode: Minimum 48px touch target, larger typography, high clarity
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs focus:ring-1 min-h-[32px]',
    md: 'px-4 py-2 text-sm focus:ring-2 min-h-[40px]',
    lg: 'px-6 py-3 text-base focus:ring-2 min-h-[48px]',
    xl: 'px-8 py-4 text-lg focus:ring-2 min-h-[56px] font-semibold',
    kids: 'px-8 py-4 text-base font-semibold focus:ring-2 min-h-[52px] tracking-wide rounded-md',
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

  const successClass = isSuccess ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-transparent' : '';

  const computedClass = twMerge(
    clsx(baseClasses, sizeClasses[size], variantClasses[variant], successClass, className)
  );

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={computedClass}
      {...props}
    >
      {isLoading ? (
        <Loader2
          id={`${id}-loading-spinner`}
          className="w-4 h-4 mr-2 animate-spin shrink-0"
          aria-hidden="true"
        />
      ) : leadingIcon ? (
        <span id={`${id}-leading-icon`} className="mr-2 inline-flex items-center shrink-0">
          {leadingIcon}
        </span>
      ) : null}

      <span id={`${id}-label`} className="truncate">
        {children}
      </span>

      {!isLoading && trailingIcon && (
        <span id={`${id}-trailing-icon`} className="ml-2 inline-flex items-center shrink-0">
          {trailingIcon}
        </span>
      )}
    </button>
  );
};
