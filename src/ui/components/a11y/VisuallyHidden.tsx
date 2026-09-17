import React from 'react';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  id?: string;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, id }) => {
  return (
    <span id={id} className="sr-only">
      {children}
    </span>
  );
};
