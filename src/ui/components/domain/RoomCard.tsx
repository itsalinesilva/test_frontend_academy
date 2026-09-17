import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { Avatar } from '../data-display/Avatar';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { UserRole } from '../../../domain/types';

export interface RoomCardProps {
  id: string; // Mandatory ID
  roomName: string;
  masterName: string;
  masterRole?: UserRole;
  currentTopic: string;
  memberCount: number;
  status: 'ao_vivo' | 'agendada' | 'offline';
  scheduledTimeText?: string;
  onEnterRoom: () => void;
  className?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  id,
  roomName,
  masterName,
  masterRole = UserRole.PROFESSOR,
  currentTopic,
  memberCount,
  status,
  scheduledTimeText,
  onEnterRoom,
  className,
}) => {
  const statusConfig = {
    ao_vivo: {
      badge: (
        <Badge id={`${id}-status-badge`} variant="primary" size="sm" hasDot className="animate-pulse">
          AO VIVO AGORA
        </Badge>
      ),
      ctaText: 'Entrar na Sala ao Vivo',
      ctaVariant: 'primary' as const,
    },
    agendada: {
      badge: (
        <Badge id={`${id}-status-badge`} variant="warning" size="sm" hasDot>
          Programada
        </Badge>
      ),
      ctaText: 'Ver Detalhes & Inscrição',
      ctaVariant: 'outline' as const,
    },
    offline: {
      badge: (
        <Badge id={`${id}-status-badge`} variant="neutral" size="sm">
          Offline
        </Badge>
      ),
      ctaText: 'Acessar Materiais',
      ctaVariant: 'outline' as const,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <article
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between gap-4 text-stone-900 transition-all hover:border-stone-400',
          className
        )
      )}
    >
      <div className="space-y-3">
        {/* Header with status and members count */}
        <div className="flex items-center justify-between gap-2">
          {currentStatus.badge}
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span id={`${id}-members-count`}>{memberCount} participantes</span>
          </div>
        </div>

        {/* Room Name & Topic */}
        <div>
          <h3 id={`${id}-title`} className="text-base font-semibold text-stone-900 font-sans tracking-tight">
            {roomName}
          </h3>
          <p id={`${id}-topic`} className="text-xs text-stone-600 mt-1 line-clamp-2">
            Tópico em discussão: <span className="font-medium text-stone-800">{currentTopic}</span>
          </p>
        </div>

        {/* Master / Host Info */}
        <div className="flex items-center gap-2.5 pt-1">
          <Avatar
            id={`${id}-master-avatar`}
            name={masterName}
            role={masterRole}
            size="sm"
          />
          <div className="flex flex-col text-xs">
            <span id={`${id}-master-name`} className="font-semibold text-stone-900">
              {masterName}
            </span>
            <span className="text-[11px] text-stone-500">Mestre / Mediador</span>
          </div>
        </div>

        {scheduledTimeText && status === 'agendada' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Início: {scheduledTimeText}</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-stone-100">
        <Button
          id={`${id}-enter-btn`}
          size="md"
          variant={currentStatus.ctaVariant}
          onClick={onEnterRoom}
          className="w-full"
          trailingIcon={<ArrowRight className="w-4 h-4" />}
        >
          {currentStatus.ctaText}
        </Button>
      </div>
    </article>
  );
};
