import React from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  shortcutHint?: string; // e.g. "⌘K"
  size?: 'sm' | 'md' | 'lg' | 'kids';
}

let searchCounter = 0;

export const Search: React.FC<SearchProps> = ({
  id: explicitId,
  value,
  onValueChange,
  onClear,
  isLoading = false,
  shortcutHint,
  size = 'md',
  placeholder = 'Buscar cursos, obras, professores, ferramentas…',
  disabled = false,
  className,
  ...props
}) => {
  const [autoId] = React.useState(() => `search-${++searchCounter}`);
  const id = explicitId || autoId;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 py-1.5 pl-8 pr-8 text-xs',
    md: 'h-10 py-2 pl-9 pr-9 text-sm',
    lg: 'h-12 py-3 pl-11 pr-11 text-base',
    kids: 'h-14 py-3.5 pl-12 pr-12 text-base rounded-xl font-medium',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-5 h-5 left-3.5',
    kids: 'w-6 h-6 left-4',
  };

  const handleClear = () => {
    onValueChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div id={`${id}-wrapper`} className={twMerge('relative flex items-center w-full', className)}>
      <span
        id={`${id}-icon-container`}
        className={clsx(
          'absolute text-stone-400 pointer-events-none flex items-center justify-center',
          iconSizes[size]
        )}
      >
        {isLoading ? (
          <Loader2 id={`${id}-loading`} className="animate-spin w-4 h-4 text-anil-800" />
        ) : (
          <SearchIcon id={`${id}-search-icon`} className="w-full h-full" aria-hidden="true" />
        )}
      </span>

      <input
        ref={inputRef}
        id={id}
        type="search"
        role="searchbox"
        aria-label={props['aria-label'] || 'Buscar no sistema'}
        value={value}
        disabled={disabled || isLoading}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'w-full bg-white border border-stone-200 rounded text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-anil-800 focus:border-anil-800 transition-colors',
          'disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed',
          sizeClasses[size]
        )}
        {...props}
      />

      {value && !disabled && (
        <button
          id={`${id}-clear-button`}
          type="button"
          onClick={handleClear}
          aria-label="Limpar campo de busca"
          className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-700 rounded focus:outline-none focus:ring-2 focus:ring-anil-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {!value && shortcutHint && !disabled && (
        <kbd
          id={`${id}-shortcut-hint`}
          className="hidden sm:inline-flex absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-400 bg-stone-100 border border-stone-200 rounded select-none pointer-events-none"
        >
          {shortcutHint}
        </kbd>
      )}
    </div>
  );
};
