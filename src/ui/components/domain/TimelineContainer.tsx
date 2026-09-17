import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Play, Pause, Square, Circle, Volume2, Mic, Piano, Music } from 'lucide-react';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'instrument' | 'master';
  isMuted?: boolean;
  isSolo?: boolean;
  volumePercent?: number;
  blocks: {
    startBar: number;
    durationBars: number;
    label: string;
    type?: 'audio' | 'midi';
  }[];
}

export interface TimelineContainerProps {
  id: string; // Mandatory ID
  projectName?: string;
  bpm?: number;
  timecode?: string;
  currentBar?: number;
  currentPositionSec?: number;
  totalDurationSec?: number;
  isPlaying?: boolean;
  isRecording?: boolean;
  tracks?: TimelineTrack[];
  onTogglePlay?: () => void;
  onToggleRecord?: () => void;
  onStop?: () => void;
  onToggleMuteTrack?: (trackId: string) => void;
  onToggleSoloTrack?: (trackId: string) => void;
  className?: string;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  id,
  projectName = 'Projeto Musical Principal',
  bpm = 120,
  timecode = '00:01:24.08',
  currentBar = 3,
  currentPositionSec: _currentPositionSec,
  totalDurationSec: _totalDurationSec,
  isPlaying = false,
  isRecording = false,
  tracks = [
    {
      id: 't-1',
      name: 'Vocal Principal (Guia)',
      type: 'audio',
      isMuted: false,
      isSolo: false,
      volumePercent: 85,
      blocks: [{ startBar: 1, durationBars: 4, label: 'Tomada 01 (Voz)', type: 'audio' }],
    },
    {
      id: 't-2',
      name: 'Piano Acústico',
      type: 'midi',
      isMuted: false,
      isSolo: false,
      volumePercent: 90,
      blocks: [{ startBar: 1, durationBars: 6, label: 'Harmonia I', type: 'midi' }],
    },
    {
      id: 't-3',
      name: 'Metrônomo / Click',
      type: 'instrument',
      isMuted: true,
      isSolo: false,
      volumePercent: 60,
      blocks: [{ startBar: 1, durationBars: 8, label: 'Click 4/4', type: 'audio' }],
    },
  ],
  onTogglePlay,
  onToggleRecord,
  onStop,
  onToggleMuteTrack,
  onToggleSoloTrack,
  className,
}) => {
  const bars = [1, 2, 3, 4, 5, 6, 7, 8];

  const trackIcons = {
    audio: Mic,
    midi: Piano,
    instrument: Music,
    master: Volume2,
  };

  return (
    <div
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-stone-900 text-stone-100 border border-stone-800 rounded-lg overflow-hidden shadow-md flex flex-col',
          className
        )
      )}
    >
      {/* DAW Transport Bar */}
      <div
        id={`${id}-transport`}
        className="px-4 py-2 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-3">
          <span id={`${id}-project-name`} className="font-semibold text-stone-200 tracking-wide">
            {projectName}
          </span>
          <Badge id={`${id}-bpm-badge`} variant="neutral" size="sm" className="bg-stone-800 text-stone-300 border-stone-700">
            {bpm} BPM • 4/4
          </Badge>
          <span id={`${id}-timecode`} className="font-mono text-xs text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
            {timecode}
          </span>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center gap-2">
          {onTogglePlay && (
            <Button
              id={`${id}-play-btn`}
              size="sm"
              variant={isPlaying ? 'primary' : 'outline'}
              onClick={onTogglePlay}
              leadingIcon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              className={!isPlaying ? 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700' : ''}
            >
              {isPlaying ? 'Pausar' : 'Play'}
            </Button>
          )}

          {onStop && (
            <button
              id={`${id}-stop-btn`}
              type="button"
              onClick={onStop}
              title="Parar e resetar"
              aria-label="Parar timeline"
              className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {onToggleRecord && (
            <button
              id={`${id}-rec-btn`}
              type="button"
              onClick={onToggleRecord}
              title="Gravar"
              aria-label="Gravar na timeline"
              className={clsx(
                'p-1.5 rounded transition-colors flex items-center gap-1 font-mono text-xs px-2.5',
                isRecording
                  ? 'bg-red-900/80 text-red-100 border border-red-700'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-red-400'
              )}
            >
              <Circle className="w-3 h-3 fill-red-600 text-red-600" />
              <span>REC</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Track Workspace */}
      <div id={`${id}-workspace`} className="flex flex-col overflow-x-auto select-none">
        {/* Time Ruler */}
        <div className="flex border-b border-stone-800 bg-stone-900/80">
          <div className="w-48 shrink-0 px-3 py-1.5 text-[11px] font-mono text-stone-400 border-r border-stone-800">
            Trilhas ({tracks.length})
          </div>
          <div className="flex-1 grid grid-cols-8 divide-x divide-stone-800 text-[10px] font-mono text-stone-400">
            {bars.map((bar) => (
              <div
                key={bar}
                id={`${id}-ruler-bar-${bar}`}
                className={clsx(
                  'px-2 py-1 flex items-center justify-between',
                  bar === currentBar && 'bg-red-950/30 text-red-400 font-bold'
                )}
              >
                <span>Compasso {bar}</span>
                <span className="text-[9px] text-stone-600">.1</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks List */}
        <div id={`${id}-track-list`} className="divide-y divide-stone-800/80 relative">
          {tracks.map((track) => {
            const TrackIcon = trackIcons[track.type] || Music;
            const trackId = `${id}-track-${track.id}`;

            return (
              <div key={track.id} id={trackId} className="flex h-14 hover:bg-stone-800/40 transition-colors">
                {/* Track Header / Controls */}
                <div className="w-48 shrink-0 px-3 py-2 border-r border-stone-800 flex items-center justify-between gap-2 bg-stone-900">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrackIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                    <span id={`${trackId}-name`} className="text-xs font-medium text-stone-200 truncate">
                      {track.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`${trackId}-mute-btn`}
                      type="button"
                      onClick={() => onToggleMuteTrack && onToggleMuteTrack(track.id)}
                      aria-pressed={track.isMuted}
                      className={clsx(
                        'w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors',
                        track.isMuted
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      )}
                    >
                      M
                    </button>
                    <button
                      id={`${trackId}-solo-btn`}
                      type="button"
                      onClick={() => onToggleSoloTrack && onToggleSoloTrack(track.id)}
                      aria-pressed={track.isSolo}
                      className={clsx(
                        'w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors',
                        track.isSolo
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      )}
                    >
                      S
                    </button>
                  </div>
                </div>

                {/* Track Lane / Audio Blocks */}
                <div className="flex-1 grid grid-cols-8 divide-x divide-stone-800/40 relative items-center px-1">
                  {track.blocks.map((block, bIdx) => (
                    <div
                      key={bIdx}
                      id={`${trackId}-block-${bIdx}`}
                      style={{
                        gridColumnStart: block.startBar,
                        gridColumnEnd: block.startBar + block.durationBars,
                      }}
                      className={clsx(
                        'h-10 rounded border mx-1 px-2 py-1 flex flex-col justify-between overflow-hidden shadow-xs select-none',
                        track.isMuted
                          ? 'bg-stone-800 border-stone-700 text-stone-500 opacity-60'
                          : block.type === 'midi'
                          ? 'bg-stone-800/90 border-stone-600 text-stone-100'
                          : 'bg-red-950/70 border-red-800 text-red-100'
                      )}
                    >
                      <span className="text-[10px] font-medium truncate">{block.label}</span>
                      {/* Waveform / MIDI visual representation */}
                      <div className="flex items-center gap-0.5 h-3 opacity-60">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-current w-1 rounded-xs"
                            style={{ height: `${((i * 7) % 10) + 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Timeline Playhead line */}
          <div
            id={`${id}-playhead-line`}
            style={{ left: `calc(12rem + ${(currentBar - 1) * 12.5}%)` }}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none shadow-sm z-10"
            aria-label="Cursor de reprodução"
          />
        </div>
      </div>
    </div>
  );
};
