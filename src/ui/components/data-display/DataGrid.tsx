import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, Search as SearchIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Pagination } from '../navigation/Pagination';

export interface DataGridColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataGridProps<T extends { id: string }> {
  id?: string;
  columns: DataGridColumn<T>[];
  data: T[];
  pageSize?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  searchable?: boolean;
  className?: string;
}

export function DataGrid<T extends { id: string }>({
  id = 'data-grid',
  columns,
  data,
  pageSize = 10,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  searchable = false,
  className,
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const result = valA < valB ? -1 : 1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allCurrentIds = paginatedData.map((d) => d.id);
      const unique = Array.from(new Set([...selectedIds, ...allCurrentIds]));
      onSelectionChange(unique);
    } else {
      const currentIdsSet = new Set(paginatedData.map((d) => d.id));
      onSelectionChange(selectedIds.filter((id) => !currentIdsSet.has(id)));
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  const isAllSelected =
    paginatedData.length > 0 && paginatedData.every((d) => selectedIds.includes(d.id));

  return (
    <div id={id} className={twMerge('w-full flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden select-none', className)}>
      {searchable && (
        <div className="p-3 border-b border-stone-200 bg-stone-50/50 flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filtrar dados..."
            className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-700">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Selecionar todas as linhas"
                    className="rounded border-stone-300 text-anil-800 focus:ring-anil-800"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx('px-4 py-3', col.sortable && 'cursor-pointer hover:bg-stone-100')}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-stone-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-anil-800" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-anil-800" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-sm text-stone-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-stone-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={clsx(
                      'transition-colors',
                      isSelected ? 'bg-red-50/50' : 'hover:bg-stone-50/70',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          aria-label={`Selecionar linha ${row.id}`}
                          className="rounded border-stone-300 text-anil-800 focus:ring-anil-800"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(row, idx) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-stone-200 bg-stone-50/40 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            {filteredData.length} registros no total
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
