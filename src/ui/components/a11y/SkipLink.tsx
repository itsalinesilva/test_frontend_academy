import React from 'react';

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Pular para o conteúdo principal',
}) => {
  return (
    <a
      id="skip-to-content-link"
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-anil-500 focus:rounded"
    >
      {label}
    </a>
  );
};
