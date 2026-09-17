import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Play, Pause, Clock, Volume2 } from 'lucide-react';
import { Badge } from '../base/Badge';

export interface MediaCardProps {
  id: string; // Mandatory ID
  title: string;
  performerOrLecturer: string;
  mediaType: 'palestra' | 'ensaio' | 'demonstracao' | 'masterclass';
  durationText: string;
  provenanceCitation?: string;
  isPlaying?: boolean;
  onTogglePlay: () => void;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  id,
  title,
  performerOrLecturer,
  mediaType,
  durationText,
  provenanceCitation,
  isPlaying = false,
  onTogglePlay,
  className,
}) => {
  return (
    <article
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs flex flex-col transition-all hover:border-stone-400',
          className
        )
      )}
    >
      {/* Media Visual / Waveform Banner */}
      <div
        id={`${id}-media-banner`}
        className="relative h-28 bg-stone-900 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={onTogglePlay}
      >
        {/* Subtle decorative waveform graphic */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-25" aria-hidden="true">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="bg-stone-300 w-1.5 rounded-full transition-all duration-200"
              style={{ height: `${((i * 13) % 48) + 12}px` }}
            />
          ))}
        </div>

        {/* Play / Pause button overlay */}
        <button
          id={`${id}-play-btn`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          aria-label={isPlaying ? 'Pausar reprodução' : 'Reproduzir áudio acadêmico'}
          className={clsx(
            'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-white',
            isPlaying ? 'bg-red-800 text-white' : 'bg-white/90 text-stone-900 group-hover:bg-white group-hover:scale-105'
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-stone-950/80 px-2 py-0.5 rounded text-[11px] font-mono text-stone-300 flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-400" aria-hidden="true" />
          <span id={`${id}-duration`}>{durationText}</span>
        </div>
      </div>

      {/* Media Details */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge id={`${id}-type-badge`} variant="neutral" size="sm">
              {mediaType}
            </Badge>
            {isPlaying && (
              <span className="text-[10px] font-mono text-red-800 font-semibold flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" /> REPRODUZINDO
              </span>
            )}
          </div>

          <h4 id={`${id}-title`} className="text-sm font-semibold text-stone-900 line-clamp-1">
            {title}
          </h4>
          <p id={`${id}-performer`} className="text-xs text-stone-500 mt-0.5 truncate">
            {performerOrLecturer}
          </p>
        </div>

        {provenanceCitation && (
          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-400 truncate">
            Fonte: {provenanceCitation}
          </div>
        )}
      </div>
    </article>
  );
};
