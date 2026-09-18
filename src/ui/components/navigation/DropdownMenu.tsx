import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownMenuProps {
  id: string; // Mandatory ID
  trigger: React.ReactNode;
  items: (DropdownMenuItem | 'separator')[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  id,
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div id={`${id}-wrapper`} ref={containerRef} className={twMerge(clsx('relative inline-block text-left', className))}>
      <button
        type="button"
        id={`${id}-trigger-box`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="cursor-pointer"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={`${id}-trigger`}
          className={clsx(
            'absolute z-50 mt-1.5 w-56 rounded-md bg-white border border-stone-200 shadow-lg py-1 focus:outline-none transition-all duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, idx) => {
            if (item === 'separator') {
              return (
                <div
                  key={`sep-${idx}`}
                  id={`${id}-sep-${idx}`}
                  role="separator"
                  className="my-1 border-t border-stone-100"
                />
              );
            }

            const isDanger = item.variant === 'danger';
            const itemId = `${id}-item-${item.id}`;

            return (
              <button
                key={item.id}
                id={itemId}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                  isDanger
                    ? 'text-rose-700 hover:bg-rose-50 focus:bg-rose-50'
                    : 'text-stone-700 hover:bg-stone-100 focus:bg-stone-100 hover:text-stone-900'
                )}
              >
                {item.icon && (
                  <span id={`${itemId}-icon`} className="w-4 h-4 shrink-0 text-stone-500" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span id={`${itemId}-label`} className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
