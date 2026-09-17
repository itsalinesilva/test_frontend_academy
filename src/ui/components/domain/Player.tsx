import React from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PlayerProps {
  id?: string;
  isPlaying?: boolean;
  currentTimeSeconds?: number;
  durationSeconds?: number;
  volume?: number; // 0 to 1
  isMuted?: boolean;
  isLooping?: boolean;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSeek?: (seconds: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  onToggleLoop?: () => void;
  title?: string;
  artist?: string;
  className?: string;
}

export const Player: React.FC<PlayerProps> = ({
  id = 'audio-player',
  isPlaying = false,
  currentTimeSeconds = 0,
  durationSeconds = 180,
  volume = 0.8,
  isMuted = false,
  isLooping = false,
  onTogglePlay,
  onStop,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleLoop,
  title,
  artist,
  className,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id={id}
      className={twMerge(
        'w-full bg-stone-950 border border-stone-800 rounded-lg p-3 sm:p-4 text-stone-200 select-none shadow-md flex flex-col gap-2 font-mono text-xs',
        className
      )}
    >
      {/* Title info */}
      {(title || artist) && (
        <div className="flex items-center justify-between truncate text-stone-400 pb-1 border-b border-stone-900">
          <div className="truncate">
            <span className="text-stone-100 font-bold truncate">{title}</span>
            {artist && <span className="text-stone-500 ml-2 truncate">({artist})</span>}
          </div>
          <span className="text-[10px] text-red-500 font-bold">REPRODUTOR CANÔNICO</span>
        </div>
      )}

      {/* Progress timeline bar */}
      <div className="flex items-center gap-3">
        <span className="w-10 text-right text-[11px] text-stone-400">
          {formatTime(currentTimeSeconds)}
        </span>

        <input
          type="range"
          min={0}
          max={durationSeconds}
          value={currentTimeSeconds}
          onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
          aria-label="Barra de busca temporal"
          className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-700"
        />

        <span className="w-10 text-left text-[11px] text-stone-400">
          {formatTime(durationSeconds)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Loop Toggle */}
        <button
          type="button"
          onClick={onToggleLoop}
          aria-label="Repetição em loop"
          className={clsx(
            'p-1.5 rounded cursor-pointer transition-colors',
            isLooping ? 'bg-anil-950 text-red-400 border border-anil-800' : 'text-stone-500 hover:text-stone-300'
          )}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Center: Main Transport Controls */}
        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Anterior"
              className="p-1.5 text-stone-400 hover:text-stone-100 cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {onStop && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Parar"
              className="p-2 text-stone-400 hover:text-stone-100 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-stone-400" />
            </button>
          )}

          {/* Big Play/Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            className="w-10 h-10 rounded-full bg-anil-800 hover:bg-anil-900 text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-anil-500 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Próximo"
              className="p-1.5 text-stone-400 hover:text-stone-100 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Volume slider */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Mudo'}
            className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume de áudio"
            className="w-16 h-1 bg-stone-800 rounded appearance-none cursor-pointer accent-stone-300"
          />
        </div>
      </div>
    </div>
  );
};
