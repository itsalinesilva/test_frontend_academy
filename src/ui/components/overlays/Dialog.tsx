import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export interface DialogProps {
  id: string; // Mandatory ID
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'kids';
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  id,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;
  const descId = `${id}-description`;

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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    kids: 'max-w-xl p-8',
  };

  return (
    <div
      id={`${id}-backdrop`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={twMerge(
          clsx(
            'w-full bg-white rounded-lg border border-stone-200 shadow-xl overflow-hidden text-stone-900 animate-in zoom-in-95 duration-150',
            sizeClasses[size],
            className
          )
        )}
      >
        <div id={`${id}-header`} className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-stone-100">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-stone-900 font-sans tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-stone-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            id={`${id}-close-btn`}
            type="button"
            onClick={onClose}
            aria-label="Fechar diálogo"
            className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-anil-800"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div id={`${id}-body`} className="p-6 text-sm text-stone-700">
          {children}
        </div>

        {footer && (
          <div
            id={`${id}-footer`}
            className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
