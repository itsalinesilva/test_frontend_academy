import React from 'react';

export interface LiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive';
  id?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  id = 'a11y-live-region',
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
