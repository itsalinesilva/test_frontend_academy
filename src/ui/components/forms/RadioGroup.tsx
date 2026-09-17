import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  id: string; // Mandatory ID
  name: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  sizeVariant?: 'sm' | 'md' | 'kids';
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  name,
  label,
  options,
  value,
  onChange,
  orientation = 'vertical',
  sizeVariant = 'md',
  disabled = false,
  error,
  className,
}) => {
  const outerSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    kids: 'w-6 h-6',
  };

  const innerDotClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    kids: 'w-3 h-3',
  };

  return (
    <fieldset
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={twMerge(clsx('flex flex-col gap-2 text-left', className))}
    >
      <legend id={`${id}-legend`} className="text-xs font-semibold text-stone-700 mb-1">
        {label}
      </legend>

      <div
        className={clsx(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap items-center'
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled;
          const optionId = `${id}-option-${option.value}`;

          return (
            <label
              key={option.value}
              id={`${optionId}-label-container`}
              htmlFor={optionId}
              className={clsx(
                'flex items-start gap-3 cursor-pointer select-none',
                isOptionDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className="relative flex items-center justify-center pt-0.5">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isOptionDisabled}
                  onChange={() => onChange(option.value)}
                  className="sr-only peer"
                />

                <div
                  id={`${optionId}-visual-circle`}
                  aria-hidden="true"
                  className={clsx(
                    'rounded-full border flex items-center justify-center transition-all duration-150',
                    outerSizeClasses[sizeVariant],
                    isSelected
                      ? 'border-anil-800 bg-white ring-1 ring-anil-800'
                      : 'border-stone-300 bg-white hover:border-stone-400',
                    isOptionDisabled && 'bg-stone-100 border-stone-200',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-anil-800 peer-focus-visible:ring-offset-2'
                  )}
                >
                  {isSelected && (
                    <span
                      id={`${optionId}-dot`}
                      className={clsx('rounded-full bg-anil-800', innerDotClasses[sizeVariant])}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <span
                  id={`${optionId}-text`}
                  className={clsx(
                    'text-stone-900 font-medium',
                    sizeVariant === 'sm' && 'text-xs',
                    sizeVariant === 'md' && 'text-sm',
                    sizeVariant === 'kids' && 'text-base font-semibold'
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span id={`${optionId}-desc`} className="text-xs text-stone-500 mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs text-rose-700 font-medium mt-1">
          {error}
        </span>
      )}
    </fieldset>
  );
};
