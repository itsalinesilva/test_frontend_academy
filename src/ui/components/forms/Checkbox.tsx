import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string; // Mandatory ID
  label: React.ReactNode;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  sizeVariant?: 'sm' | 'md' | 'kids';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  description,
  error,
  indeterminate = false,
  sizeVariant = 'md',
  checked = false,
  disabled = false,
  className,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const boxSizeClasses = {
    sm: 'w-4 h-4 rounded',
    md: 'w-5 h-5 rounded',
    kids: 'w-6 h-6 rounded-md',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    kids: 'w-4 h-4',
  };

  const isCheckedOrIndeterminate = checked || indeterminate;

  return (
    <div id={`${id}-wrapper`} className={twMerge(clsx('flex items-start gap-3 select-none', className))}>
      <div className="relative flex items-center justify-center pt-0.5">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-describedby={description ? `${id}-desc` : error ? `${id}-error` : undefined}
          className="sr-only peer"
          {...props}
        />

        <div
          id={`${id}-visual-box`}
          aria-hidden="true"
          className={clsx(
            'flex items-center justify-center border transition-all duration-150 cursor-pointer',
            boxSizeClasses[sizeVariant],
            isCheckedOrIndeterminate
              ? 'bg-red-800 border-red-800 text-white'
              : 'bg-white border-stone-300 hover:border-stone-400',
            error && !isCheckedOrIndeterminate && 'border-rose-500 bg-rose-50/30',
            disabled && 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-red-800 peer-focus-visible:ring-offset-2'
          )}
        >
          {indeterminate ? (
            <Minus className={clsx(iconSizeClasses[sizeVariant], 'stroke-[3]')} />
          ) : checked ? (
            <Check className={clsx(iconSizeClasses[sizeVariant], 'stroke-[3]')} />
          ) : null}
        </div>
      </div>

      <label
        id={`${id}-label`}
        htmlFor={id}
        className={clsx(
          'flex flex-col text-left cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span
          className={clsx(
            'text-stone-900 font-medium',
            sizeVariant === 'sm' && 'text-xs',
            sizeVariant === 'md' && 'text-sm',
            sizeVariant === 'kids' && 'text-base font-semibold'
          )}
        >
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className="text-xs text-stone-500 mt-0.5">
            {description}
          </span>
        )}
        {error && (
          <span id={`${id}-error`} role="alert" className="text-xs text-rose-700 font-medium mt-0.5">
            {error}
          </span>
        )}
      </label>
    </div>
  );
};
