import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SwitchProps {
  id: string; // Mandatory ID
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
  sizeVariant?: 'sm' | 'md' | 'kids';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  sizeVariant = 'md',
  className,
}) => {
  const trackClasses = {
    sm: 'w-7 h-4',
    md: 'w-10 h-5',
    kids: 'w-12 h-6',
  };

  const thumbClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    kids: 'w-5 h-5',
  };

  const translateClasses = {
    sm: checked ? 'translate-x-3' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    kids: checked ? 'translate-x-6' : 'translate-x-0.5',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div
      id={`${id}-container`}
      className={twMerge(clsx('flex items-center justify-between gap-4 select-none', className))}
    >
      <div className="flex flex-col text-left">
        <label
          id={`${id}-label`}
          htmlFor={id}
          onClick={() => !disabled && onChange(!checked)}
          className={clsx(
            'text-stone-900 font-medium cursor-pointer',
            sizeVariant === 'sm' && 'text-xs',
            sizeVariant === 'md' && 'text-sm',
            sizeVariant === 'kids' && 'text-base font-semibold',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {label}
        </label>
        {description && (
          <span id={`${id}-desc`} className="text-xs text-stone-500 mt-0.5">
            {description}
          </span>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          trackClasses[sizeVariant],
          checked ? 'bg-red-800' : 'bg-stone-300 hover:bg-stone-400'
        )}
      >
        <span
          id={`${id}-thumb`}
          aria-hidden="true"
          className={clsx(
            'inline-block rounded-full bg-white shadow-xs transform transition-transform duration-150 ease-in-out pointer-events-none',
            thumbClasses[sizeVariant],
            translateClasses[sizeVariant]
          )}
        />
      </button>
    </div>
  );
};
