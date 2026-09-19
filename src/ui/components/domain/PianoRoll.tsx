import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MidiNote {
  id: string;
  pitch: number; // MIDI note number (e.g. 60 = C4)
  startBeat: number;
  durationBeats: number;
  velocity: number; // 0 to 127
}

export interface PianoRollProps {
  id?: string;
  notes?: MidiNote[];
  totalBeats?: number;
  startPitch?: number; // default 72 (C5)
  octavesCount?: number; // default 2
  onNoteClick?: (note: MidiNote) => void;
  className?: string;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  id = 'piano-roll',
  notes = [],
  totalBeats = 16,
  startPitch = 72,
  octavesCount = 2,
  onNoteClick,
  className,
}) => {
  const pitchCount = octavesCount * 12;
  const pitches = Array.from({ length: pitchCount }, (_, i) => startPitch - i);

  const isBlackKey = (pitch: number) => {
    const noteInOctave = pitch % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getPitchLabel = (pitch: number) => {
    const name = noteNames[pitch % 12];
    const octave = Math.floor(pitch / 12) - 1;
    return `${name}${octave}`;
  };

  return (
    <div
      id={id}
      className={twMerge(
        'w-full bg-stone-950 border border-stone-800 rounded-sm flex select-none overflow-x-auto font-mono text-xs',
        className
      )}
    >
      {/* Left Keyboard Column */}
      <div className="w-14 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0">
        {pitches.map((p) => {
          const black = isBlackKey(p);
          return (
            <div
              key={p}
              className={clsx(
                'h-5 px-1 flex items-center justify-end text-[10px] border-b border-stone-800/80 font-mono select-none',
                black ? 'bg-stone-950 text-stone-400 font-normal' : 'bg-stone-100 text-stone-900 font-bold'
              )}
            >
              <span>{getPitchLabel(p)}</span>
            </div>
          );
        })}
      </div>

      {/* Right Grid Area */}
      <div className="flex-1 relative bg-stone-900/60 min-w-[480px]">
        {pitches.map((p) => {
          const black = isBlackKey(p);
          return (
            <div
              key={p}
              className={clsx(
                'h-5 border-b border-stone-800/40 w-full relative',
                black ? 'bg-stone-950/40' : 'bg-stone-900/20'
              )}
            />
          );
        })}

        {/* Drawn MIDI Notes */}
        {notes.map((note) => {
          const pitchIndex = pitches.indexOf(note.pitch);
          if (pitchIndex === -1) return null;

          const leftPercent = (note.startBeat / totalBeats) * 100;
          const widthPercent = (note.durationBeats / totalBeats) * 100;

          return (
            <div
              key={note.id}
              role={onNoteClick ? 'button' : undefined}
              tabIndex={onNoteClick ? 0 : undefined}
              aria-label={`Nota ${getPitchLabel(note.pitch)}, velocidade ${note.velocity}`}
              onClick={() => onNoteClick && onNoteClick(note)}
              onKeyDown={(e) => {
                if (onNoteClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onNoteClick(note);
                }
              }}
              style={{
                top: `calc(${pitchIndex * 20}px + 1px)`,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '18px',
              }}
              title={`Nota: ${getPitchLabel(note.pitch)} | Velocidade: ${note.velocity}`}
              className="absolute bg-anil-700 hover:bg-red-600 border border-red-500 rounded-xs shadow-xs cursor-pointer z-10 flex items-center px-1 text-[9px] text-white font-bold truncate"
            >
              {getPitchLabel(note.pitch)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
