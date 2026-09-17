import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id = 'app-toast',
  type = 'info',
  title,
  message,
  onDismiss,
  className,
}) => {
  const iconMap = {
    info: <Info className="w-5 h-5 text-stone-700 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-700 shrink-0" />,
  };

  const styleMap = {
    info: 'bg-white border-stone-200 text-stone-900',
    success: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
    warning: 'bg-amber-50/90 border-amber-300 text-amber-950',
    error: 'bg-red-50/90 border-red-300 text-anil-950',
  };

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={twMerge(
        clsx(
          'flex items-start gap-3 p-3.5 rounded-lg border shadow-md max-w-sm w-full select-none transition-all',
          styleMap[type],
          className
        )
      )}
    >
      {iconMap[type]}

      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold tracking-tight">{title}</h5>
        {message && <p className="text-[11px] opacity-90 mt-0.5 leading-normal">{message}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar notificação"
          className="p-1 -mr-1 -mt-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
