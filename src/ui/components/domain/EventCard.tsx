import React from 'react';
import { Calendar, Clock, Video, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../base/Button';
import { twMerge } from 'tailwind-merge';

export interface EventCardProps {
  id?: string;
  title: string;
  hostName: string;
  hostTitle?: string;
  startDate: string;
  timeString: string;
  type?: 'MASTERCLASS' | 'RECITAL' | 'EXAM_BOARD' | 'WORKSHOP';
  isLiveNow?: boolean;
  isRegistered?: boolean;
  attendeesCount?: number;
  onRegister?: () => void;
  onJoinLive?: () => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id = 'event-card',
  title,
  hostName,
  hostTitle,
  startDate,
  timeString,
  type = 'MASTERCLASS',
  isLiveNow = false,
  isRegistered = false,
  attendeesCount = 0,
  onRegister,
  onJoinLive,
  className,
}) => {
  return (
    <article
      id={id}
      className={twMerge(
        'p-5 bg-white border border-stone-200 rounded-lg shadow-xs hover:border-stone-300 transition-colors select-none flex flex-col justify-between gap-4',
        isLiveNow && 'border-red-300 ring-1 ring-red-800/30',
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {type}
          </span>

          {isLiveNow ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-800 text-white text-[11px] font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              AO VIVO AGORA
            </span>
          ) : (
            <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {startDate}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug">
          {title}
        </h3>

        <div className="text-xs text-stone-600">
          Orientador: <strong className="text-stone-800">{hostName}</strong>
          {hostTitle && <span className="text-stone-400"> ({hostTitle})</span>}
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-stone-500 font-mono">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeString}
          </span>
          {attendeesCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {attendeesCount} inscritos
            </span>
          )}
        </div>

        {isLiveNow ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onJoinLive}
            leadingIcon={<Video className="w-4 h-4" />}
          >
            Entrar na Sala
          </Button>
        ) : (
          <Button
            variant={isRegistered ? 'outline' : 'secondary'}
            size="sm"
            onClick={onRegister}
            leadingIcon={isRegistered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
          >
            {isRegistered ? 'Inscrito' : 'Inscrever-se'}
          </Button>
        )}
      </div>
    </article>
  );
};
