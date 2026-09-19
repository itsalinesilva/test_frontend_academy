import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PaginationProps {
  id?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

let paginationCounter = 0;

export const Pagination: React.FC<PaginationProps> = ({
  id: explicitId,
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}) => {
  const [autoId] = React.useState(() => `pagination-${++paginationCounter}`);
  const id = explicitId || autoId;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      id={id}
      aria-label="Paginação de resultados"
      className={twMerge('flex items-center justify-center gap-1.5 select-none py-3', className)}
    >
      <button
        id={`${id}-prev`}
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        aria-label="Página anterior"
        className="inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div id={`${id}-pages`} className="flex items-center gap-1">
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                id={`${id}-ellipsis-${idx}`}
                className="w-8 text-center text-stone-400 font-mono"
              >
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              id={`${id}-page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-current={isCurrent ? 'page' : undefined}
              className={clsx(
                'w-9 h-9 text-sm font-medium rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
                isCurrent
                  ? 'bg-anil-800 text-white font-semibold'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        id={`${id}-next`}
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        aria-label="Próxima página"
        className="inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
