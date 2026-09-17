import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessStateProps {
  id?: string;
  title: string;
  message: string;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  id = 'success-state-container',
  title,
  message,
  onDismiss,
  onAction,
  actionLabel = 'Concluir',
}) => {
  const handleAction = onAction || onDismiss;

  return (
    <div
      id={id}
      role="status"
      className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-6 text-stone-900"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          id={`${id}-icon`}
          className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h3 id={`${id}-title`} className="text-base font-semibold text-emerald-950">
            {title}
          </h3>
          <p id={`${id}-message`} className="text-sm text-stone-700 mt-1">
            {message}
          </p>
          {handleAction && (
            <button
              id={`${id}-dismiss-button`}
              type="button"
              onClick={handleAction}
              className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-medium bg-emerald-900 text-white rounded hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
