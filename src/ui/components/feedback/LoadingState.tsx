import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  id?: string;
  message?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  id = 'loading-state-container',
  message = 'Carregando dados acadêmicos...',
  description,
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <Loader2
        id={`${id}-spinner`}
        className="w-8 h-8 text-stone-700 animate-spin mb-4"
        aria-hidden="true"
      />
      <p id={`${id}-message`} className="text-base font-medium text-stone-800">
        {message}
      </p>
      {description && (
        <p id={`${id}-description`} className="text-sm text-stone-500 mt-1 max-w-md">
          {description}
        </p>
      )}
    </div>
  );
};
