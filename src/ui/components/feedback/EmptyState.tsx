import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state-container',
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-stone-300 bg-stone-50/50"
    >
      <div id={`${id}-icon-wrapper`} className="text-stone-400 mb-3" aria-hidden="true">
        {icon || <Inbox className="w-8 h-8 stroke-1" />}
      </div>
      <h4 id={`${id}-title`} className="text-base font-semibold text-stone-800">
        {title}
      </h4>
      <p id={`${id}-description`} className="text-sm text-stone-500 mt-1 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          id={`${id}-action-button`}
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-xs font-medium rounded bg-stone-900 text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
