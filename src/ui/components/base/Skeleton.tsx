import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

let skeletonCounter = 0;

export const Skeleton: React.FC<SkeletonProps> = ({
  id: explicitId,
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const [autoId] = React.useState(() => `skel-${++skeletonCounter}`);
  const id = explicitId || autoId;

  const variantClasses = {
    text: 'h-4 w-full rounded-xs my-1',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-md w-full',
    card: 'rounded-lg border border-stone-200 p-4 w-full min-h-[120px]',
  };

  const computedStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      id={id}
      aria-hidden="true"
      role="status"
      className={twMerge(
        clsx(
          'bg-stone-200/80 animate-pulse select-none',
          variantClasses[variant],
          className
        )
      )}
      style={computedStyle}
      {...props}
    />
  );
};
