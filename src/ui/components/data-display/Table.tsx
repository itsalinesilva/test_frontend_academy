import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  id: string; // Mandatory ID
  caption?: string;
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  id,
  caption,
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  className,
}: TableProps<T>) {
  return (
    <div
      id={`${id}-container`}
      className={twMerge(
        clsx(
          'w-full overflow-x-auto border border-stone-200 rounded-lg bg-white shadow-xs',
          className
        )
      )}
    >
      <table id={id} className="w-full text-left text-xs border-collapse">
        {caption && (
          <caption id={`${id}-caption`} className="sr-only">
            {caption}
          </caption>
        )}

        <thead id={`${id}-thead`} className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            {columns.map((col) => {
              const isSorted = sortColumn === col.id;
              const colId = `${id}-th-${col.id}`;

              return (
                <th
                  key={col.id}
                  id={colId}
                  scope="col"
                  style={{ width: col.width }}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={clsx(
                    'px-4 py-3 font-semibold select-none',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortable && 'cursor-pointer hover:bg-stone-100 hover:text-stone-900 transition-colors'
                  )}
                  onClick={() => col.sortable && onSort && onSort(col.id)}
                >
                  <div
                    className={clsx(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'justify-end w-full',
                      col.align === 'center' && 'justify-center w-full'
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-stone-400">
                        {isSorted && sortDirection === 'asc' && (
                          <ArrowUp className="w-3.5 h-3.5 text-stone-900" />
                        )}
                        {isSorted && sortDirection === 'desc' && (
                          <ArrowDown className="w-3.5 h-3.5 text-stone-900" />
                        )}
                        {!isSorted && <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody id={`${id}-tbody`} className="divide-y divide-stone-100 text-stone-700">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-stone-500">
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                  <span>Carregando dados acadêmicos...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-stone-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => {
              const rowKey = keyExtractor(item);
              const rowId = `${id}-row-${rowKey}`;

              return (
                <tr
                  key={rowKey}
                  id={rowId}
                  className={clsx(
                    'hover:bg-stone-50/80 transition-colors',
                    rowIdx % 2 === 1 && 'bg-stone-50/30'
                  )}
                >
                  {columns.map((col) => {
                    const cellId = `${rowId}-cell-${col.id}`;
                    return (
                      <td
                        key={col.id}
                        id={cellId}
                        className={clsx(
                          'px-4 py-3 align-middle',
                          col.align === 'right' && 'text-right font-mono',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.accessor ? col.accessor(item) : (item as Record<string, unknown>)[col.id] as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
