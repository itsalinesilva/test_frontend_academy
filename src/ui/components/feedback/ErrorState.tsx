import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface ErrorStateProps {
  id?: string;
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  id = 'error-state-container',
  title = 'Não foi possível concluir a operação',
  message,
  details,
  onRetry,
  retryLabel = 'Tentar novamente',
}) => {
  return (
    <div
      id={id}
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50/50 p-6 text-stone-900"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          id={`${id}-icon`}
          className="w-5 h-5 text-rose-700 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h3 id={`${id}-title`} className="text-base font-semibold text-rose-900">
            {title}
          </h3>
          <p id={`${id}-message`} className="text-sm text-stone-700 mt-1">
            {message}
          </p>
          {details && (
            <pre
              id={`${id}-details`}
              className="mt-3 p-3 bg-white/80 rounded border border-rose-100 text-xs font-mono text-stone-600 overflow-x-auto"
            >
              {details}
            </pre>
          )}
          {onRetry && (
            <button
              id={`${id}-retry-button`}
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-rose-900 text-white rounded hover:bg-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{retryLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
