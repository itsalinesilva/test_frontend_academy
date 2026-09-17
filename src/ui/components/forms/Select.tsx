import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string; // Mandatory ID
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  sizeVariant?: 'sm' | 'md' | 'lg' | 'kids';
  hideLabel?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  error,
  helperText,
  sizeVariant = 'md',
  hideLabel = false,
  className,
  disabled,
  ...props
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs pr-8',
    md: 'px-3 py-2 text-sm pr-9',
    lg: 'px-4 py-2.5 text-base pr-10',
    kids: 'px-4 py-3.5 text-base min-h-[48px] pr-10 font-medium',
  };

  const selectClasses = twMerge(
    clsx(
      'w-full bg-white border rounded text-stone-900 appearance-none focus:outline-none focus:ring-2 transition-all duration-150 cursor-pointer',
      sizeClasses[sizeVariant],
      error
        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
        : 'border-stone-300 hover:border-stone-400 focus:ring-red-800 focus:border-red-800',
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
        <select
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={selectClasses}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <div
          className="absolute right-3 pointer-events-none flex items-center text-stone-500"
          aria-hidden="true"
        >
          {error ? (
            <AlertCircle id={`${id}-error-icon`} className="w-4 h-4 text-rose-600" />
          ) : (
            <ChevronDown id={`${id}-chevron-icon`} className="w-4 h-4" />
          )}
        </div>
      </div>

      {error ? (
        <span id={errorId} role="alert" className="text-xs text-rose-700 font-medium mt-0.5">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-xs text-stone-500 mt-0.5">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
