import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; // Mandatory ID
  label: string;
  error?: string;
  helperText?: string;
  successText?: string;
  isLoading?: boolean;
  sizeVariant?: 'sm' | 'md' | 'lg' | 'kids';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  hideLabel?: boolean;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  error,
  helperText,
  successText,
  isLoading = false,
  sizeVariant = 'md',
  leadingIcon,
  trailingIcon,
  hideLabel = false,
  className,
  disabled,
  ...props
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const successId = `${id}-success`;

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
    kids: 'px-4 py-3.5 text-base min-h-[48px]',
  };

  const inputClasses = twMerge(
    clsx(
      'w-full bg-white border rounded text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all duration-150',
      sizeClasses[sizeVariant],
      leadingIcon && 'pl-9',
      (trailingIcon || isLoading || error || successText) && 'pr-9',
      error
        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
        : successText
        ? 'border-emerald-400 focus:ring-emerald-500 focus:border-emerald-500'
        : 'border-stone-300 hover:border-stone-400 focus:ring-anil-800 focus:border-anil-800',
      disabled && 'bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200 hover:border-stone-200',
      className
    )
  );

  return (
    <div id={`${id}-field-group`} className="flex flex-col gap-1 w-full text-left">
      <label
        id={`${id}-label`}
        htmlFor={id}
        className={clsx(
          'text-xs font-semibold text-stone-700 select-none',
          hideLabel && 'sr-only',
          disabled && 'text-stone-400',
          sizeVariant === 'kids' && 'text-sm font-bold'
        )}
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {leadingIcon && (
          <div
            id={`${id}-leading-icon`}
            className="absolute left-3 text-stone-500 pointer-events-none flex items-center"
            aria-hidden="true"
          >
            {leadingIcon}
          </div>
        )}

        <input
          id={id}
          disabled={disabled || isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : successText ? successId : helperText ? helperId : undefined
          }
          className={inputClasses}
          {...props}
        />

        <div className="absolute right-3 flex items-center pointer-events-none gap-1" aria-hidden="true">
          {isLoading && (
            <Loader2 id={`${id}-loading-spinner`} className="w-4 h-4 text-stone-500 animate-spin" />
          )}
          {!isLoading && error && (
            <AlertCircle id={`${id}-error-icon`} className="w-4 h-4 text-rose-600" />
          )}
          {!isLoading && !error && successText && (
            <CheckCircle2 id={`${id}-success-icon`} className="w-4 h-4 text-emerald-600" />
          )}
          {!isLoading && !error && !successText && trailingIcon && (
            <div className="text-stone-500">{trailingIcon}</div>
          )}
        </div>
      </div>

      {error ? (
        <span id={errorId} role="alert" className="text-xs text-rose-700 font-medium mt-0.5 flex items-center gap-1">
          {error}
        </span>
      ) : successText ? (
        <span id={successId} className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
          {successText}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-xs text-stone-500 mt-0.5">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
