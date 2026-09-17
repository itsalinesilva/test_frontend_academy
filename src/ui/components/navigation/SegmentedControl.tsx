import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentOption {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  id: string; // Mandatory ID
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  sizeVariant?: 'sm' | 'md' | 'kids';
  className?: string;
  ariaLabel?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  id,
  options,
  value,
  onChange,
  sizeVariant = 'md',
  className,
  ariaLabel = 'Seletor de modo',
}) => {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
    kids: 'p-1.5 text-base font-semibold min-h-[48px]',
  };

  const itemSizeClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
    kids: 'px-5 py-2.5 min-h-[40px]',
  };

  return (
    <div
      id={id}
      role="group"
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          'inline-flex items-center bg-stone-100 border border-stone-200 rounded-lg select-none',
          sizeClasses[sizeVariant],
          className
        )
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        const optId = `${id}-option-${opt.id}`;

        return (
          <button
            key={opt.id}
            id={optId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.id)}
            className={clsx(
              'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-800 disabled:opacity-40 disabled:cursor-not-allowed',
              itemSizeClasses[sizeVariant],
              isSelected
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            )}
          >
            {opt.icon && (
              <span id={`${optId}-icon`} className="w-4 h-4 shrink-0" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            <span id={`${optId}-label`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
