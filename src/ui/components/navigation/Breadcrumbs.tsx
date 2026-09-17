import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BreadcrumbItem {
  id?: string;
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

export interface BreadcrumbsProps {
  id: string; // Mandatory ID
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  id,
  items,
  showHomeIcon = true,
  className,
}) => {
  return (
    <nav
      id={id}
      aria-label="Trilha de navegação"
      className={twMerge(clsx('flex items-center text-xs text-stone-500 overflow-x-auto', className))}
    >
      <ol id={`${id}-list`} className="flex items-center gap-1.5 whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;
          const itemId = `${id}-item-${item.id || index}`;

          return (
            <li key={item.id || index} id={`${itemId}-wrapper`} className="inline-flex items-center gap-1.5">
              {index === 0 && showHomeIcon && (
                <Home className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
              )}

              {isLast ? (
                <span
                  id={itemId}
                  aria-current="page"
                  className="font-semibold text-stone-900 truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  id={itemId}
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-stone-900 transition-colors underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-red-800 rounded px-1"
                >
                  {item.label}
                </button>
              ) : (
                <span id={itemId} className="text-stone-500 truncate max-w-[200px]">
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
