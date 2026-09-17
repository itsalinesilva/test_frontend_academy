import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserRole } from '../../../domain/types';

export interface AvatarProps {
  id?: string;
  name: string;
  src?: string;
  role?: UserRole;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

let avatarCounter = 0;

export const Avatar: React.FC<AvatarProps> = ({
  id: explicitId,
  name,
  src,
  role,
  size = 'md',
  isOnline,
  className,
}) => {
  const [autoId] = useState(() => `avatar-${++avatarCounter}`);
  const id = explicitId || autoId;
  const [imageFailed, setImageFailed] = useState(false);

  const getInitials = (n: string) => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
  };

  const roleIndicatorColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-800 text-white',
    [UserRole.PROFESSOR]: 'bg-stone-800 text-stone-100',
    [UserRole.MUSICO]: 'bg-stone-700 text-stone-100',
    [UserRole.ALUNO]: 'bg-stone-200 text-stone-800',
    [UserRole.CRIANCA]: 'bg-amber-600 text-white',
  };

  const showImage = src && !imageFailed;

  return (
    <div
      id={`${id}-container`}
      className={twMerge(clsx('relative inline-flex shrink-0 select-none', className))}
    >
      <div
        id={id}
        aria-label={name}
        className={clsx(
          'rounded-full flex items-center justify-center font-semibold uppercase tracking-wider overflow-hidden bg-stone-200 text-stone-800 border border-stone-300',
          sizeClasses[size]
        )}
      >
        {showImage ? (
          <img
            id={`${id}-image`}
            src={src}
            alt={name}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span id={`${id}-initials`}>{getInitials(name)}</span>
        )}
      </div>

      {role && (
        <span
          id={`${id}-role-badge`}
          title={`Papel: ${role}`}
          className={clsx(
            'absolute -bottom-0.5 -right-0.5 text-[9px] font-bold px-1 rounded-full border border-white leading-none flex items-center justify-center',
            roleIndicatorColors[role]
          )}
        >
          {role.charAt(0)}
        </span>
      )}

      {isOnline !== undefined && !role && (
        <span
          id={`${id}-online-indicator`}
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusDotSizes[size],
            isOnline ? 'bg-emerald-500' : 'bg-stone-400'
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
