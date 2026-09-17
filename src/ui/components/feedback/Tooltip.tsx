import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TooltipProps {
  id?: string;
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

let tooltipCounter = 0;

export const Tooltip: React.FC<TooltipProps> = ({
  id: explicitId,
  content,
  children,
  position = 'top',
  className,
}) => {
  const [autoId] = useState(() => `tooltip-${++tooltipCounter}`);
  const id = explicitId || autoId;
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.cloneElement(children as React.ReactElement<any>, {
        'aria-describedby': isVisible ? id : undefined,
      })}

      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={twMerge(
            clsx(
              'absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-stone-900 border border-stone-800 rounded shadow-md pointer-events-none whitespace-nowrap animate-in fade-in-50 duration-150',
              positionClasses[position],
              className
            )
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
