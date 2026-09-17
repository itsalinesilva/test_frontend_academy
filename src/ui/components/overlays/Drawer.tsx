import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export interface DrawerProps {
  id: string; // Mandatory ID
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  position = 'right',
  size = 'md',
  children,
  footer,
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-xl',
  };

  const positionClasses = {
    right: 'inset-y-0 right-0',
    left: 'inset-y-0 left-0',
  };

  return (
    <div
      id={`${id}-backdrop`}
      className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={drawerRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={twMerge(
          clsx(
            'fixed z-50 bg-white border-stone-200 shadow-2xl flex flex-col h-full w-full transform transition-transform duration-200 ease-in-out',
            positionClasses[position],
            sizeClasses[size],
            position === 'right' ? 'border-l' : 'border-r',
            className
          )
        )}
      >
        <div id={`${id}-header`} className="flex items-start justify-between gap-4 px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-stone-900 font-sans">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            id={`${id}-close-btn`}
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-anil-800"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div id={`${id}-body`} className="flex-1 overflow-y-auto p-6 text-sm text-stone-700">
          {children}
        </div>

        {footer && (
          <div id={`${id}-footer`} className="p-4 bg-stone-50 border-t border-stone-100 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
