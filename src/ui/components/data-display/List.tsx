import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronRight } from 'lucide-react';

export interface ListItemProps {
  id: string; // Mandatory ID
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  metadata?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  sizeVariant?: 'sm' | 'md' | 'kids';
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  id,
  title,
  subtitle,
  metadata,
  leading,
  trailing,
  onClick,
  disabled = false,
  isActive = false,
  sizeVariant = 'md',
  className,
}) => {
  const isClickable = Boolean(onClick) && !disabled;

  const sizeClasses = {
    sm: 'p-2.5 text-xs',
    md: 'p-3.5 text-sm',
    kids: 'p-4 sm:p-5 text-base min-h-[56px]',
  };

  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      id={id}
      type={isClickable ? 'button' : undefined}
      onClick={isClickable ? onClick : undefined}
      disabled={disabled}
      className={twMerge(
        clsx(
          'w-full flex items-center justify-between gap-3 text-left transition-colors select-none',
          sizeClasses[sizeVariant],
          isClickable && 'cursor-pointer hover:bg-stone-50 active:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-anil-800',
          isActive && 'bg-stone-100/80 font-medium',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {leading && (
          <div id={`${id}-leading`} className="shrink-0 flex items-center text-stone-500" aria-hidden="true">
            {leading}
          </div>
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              id={`${id}-title`}
              className={clsx(
                'font-medium text-stone-900 truncate',
                sizeVariant === 'kids' ? 'text-base font-semibold' : 'text-sm'
              )}
            >
              {title}
            </span>
            {metadata && (
              <span id={`${id}-metadata`} className="text-xs text-stone-500 shrink-0 font-normal">
                {metadata}
              </span>
            )}
          </div>
          {subtitle && (
            <p id={`${id}-subtitle`} className="text-xs text-stone-500 mt-0.5 truncate font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {trailing && <div id={`${id}-trailing`}>{trailing}</div>}
        {isClickable && (
          <ChevronRight id={`${id}-chevron`} className="w-4 h-4 text-stone-400" aria-hidden="true" />
        )}
      </div>
    </Component>
  );
};

export interface ListProps {
  id: string; // Mandatory ID
  children: React.ReactNode;
  divider?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const List: React.FC<ListProps> = ({
  id,
  children,
  divider = true,
  className,
  ariaLabel,
}) => {
  return (
    <div
      id={id}
      role="list"
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg overflow-hidden',
          divider && 'divide-y divide-stone-100',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
