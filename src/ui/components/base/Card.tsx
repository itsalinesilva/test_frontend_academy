import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 'flat' | 'subtle' | 'elevated' | 'sunken';
  variant?: string;
  isInteractive?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'kids';
}

let cardCounter = 0;

export const Card: React.FC<CardProps> = ({
  id: explicitId,
  title,
  subtitle,
  headerAction,
  footer,
  elevation = 'flat',
  variant,
  isInteractive = false,
  interactive,
  padding = 'md',
  children,
  className,
  ...props
}) => {
  const [autoId] = React.useState(() => `card-${++cardCounter}`);
  const id = explicitId || autoId;
  const effectiveInteractive = interactive !== undefined ? interactive : isInteractive;

  const elevationClasses = {
    flat: 'bg-white border border-stone-200',
    subtle: 'bg-white border border-stone-200 shadow-xs',
    elevated: 'bg-white border border-stone-200 shadow-md',
    sunken: 'bg-stone-50 border border-stone-200',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
    kids: 'p-6 sm:p-8',
  };

  const interactiveClasses = effectiveInteractive
    ? 'cursor-pointer hover:border-stone-400 hover:shadow-sm active:bg-stone-50/50 transition-all duration-150'
    : '';

  const variantClass = variant === 'muted' ? 'bg-stone-50' : '';

  return (
    <div
      id={id}
      className={twMerge(
        clsx(
          'rounded-lg text-stone-900 overflow-hidden',
          elevationClasses[elevation],
          interactiveClasses,
          variantClass,
          className
        )
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div
          id={`${id}-header`}
          className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-stone-100"
        >
          <div>
            {title && (
              <h3 id={`${id}-title`} className="text-base font-semibold text-stone-900 font-sans tracking-normal">
                {title}
              </h3>
            )}
            {subtitle && (
              <p id={`${id}-subtitle`} className="text-xs text-stone-500 mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div id={`${id}-header-action`} className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div id={`${id}-body`} className={paddingClasses[padding]}>
        {children}
      </div>

      {footer && (
        <div
          id={`${id}-footer`}
          className="px-6 py-3 bg-stone-50 border-t border-stone-100 text-xs text-stone-600 flex items-center justify-between"
        >
          {footer}
        </div>
      )}
    </div>
  );
};
