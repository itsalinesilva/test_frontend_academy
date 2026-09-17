import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface KeyboardKey {
  pitch: number; // MIDI number
  noteName: string;
  isBlack: boolean;
  keyBinding?: string;
}

export interface InstrumentKeyboardProps {
  id?: string;
  startOctave?: number; // default 4 (C4 = 60)
  octavesCount?: number; // default 2
  activePitches?: number[];
  onNoteDown?: (pitch: number) => void;
  onNoteUp?: (pitch: number) => void;
  showKeyBindings?: boolean;
  className?: string;
}

export const InstrumentKeyboard: React.FC<InstrumentKeyboardProps> = ({
  id = 'instrument-keyboard',
  startOctave = 4,
  octavesCount = 2,
  activePitches = [],
  onNoteDown,
  onNoteUp,
  showKeyBindings = true,
  className,
}) => {
  const [internalActive, setInternalActive] = useState<number[]>([]);

  const keyBindingsList = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K', 'O', 'L', 'P'];

  // Generate keys for octaves
  const keys: KeyboardKey[] = [];
  let bindingIdx = 0;

  for (let oct = 0; oct < octavesCount; oct++) {
    const currentOctave = startOctave + oct;
    const basePitch = (currentOctave + 1) * 12;
    const notesInOctave = [
      { name: 'C', black: false },
      { name: 'C#', black: true },
      { name: 'D', black: false },
      { name: 'D#', black: true },
      { name: 'E', black: false },
      { name: 'F', black: false },
      { name: 'F#', black: true },
      { name: 'G', black: false },
      { name: 'G#', black: true },
      { name: 'A', black: false },
      { name: 'A#', black: true },
      { name: 'B', black: false },
    ];

    notesInOctave.forEach((n, idx) => {
      keys.push({
        pitch: basePitch + idx,
        noteName: `${n.name}${currentOctave}`,
        isBlack: n.black,
        keyBinding: keyBindingsList[bindingIdx++] || undefined,
      });
    });
  }

  const handleMouseDown = (pitch: number) => {
    setInternalActive((prev) => [...prev, pitch]);
    if (onNoteDown) onNoteDown(pitch);
  };

  const handleMouseUp = (pitch: number) => {
    setInternalActive((prev) => prev.filter((p) => p !== pitch));
    if (onNoteUp) onNoteUp(pitch);
  };

  const isPitchActive = (pitch: number) =>
    activePitches.includes(pitch) || internalActive.includes(pitch);

  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div
      id={id}
      aria-label="Teclado Virtual Polifônico"
      className={twMerge(
        'relative flex items-start justify-center p-3 bg-stone-900 border border-stone-800 rounded-lg shadow-md select-none overflow-x-auto min-h-[160px]',
        className
      )}
    >
      <div className="relative flex items-start">
        {/* White Keys Row */}
        {whiteKeys.map((key) => {
          const active = isPitchActive(key.pitch);
          return (
            <button
              key={key.pitch}
              type="button"
              onMouseDown={() => handleMouseDown(key.pitch)}
              onMouseUp={() => handleMouseUp(key.pitch)}
              onMouseLeave={() => handleMouseUp(key.pitch)}
              aria-label={key.noteName}
              className={clsx(
                'relative w-10 sm:w-11 h-36 sm:h-40 border border-stone-300 rounded-b-md transition-colors cursor-pointer flex flex-col justify-end items-center pb-2 shrink-0 focus:outline-none',
                active
                  ? 'bg-red-800 text-white shadow-inner'
                  : 'bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-700 shadow-xs'
              )}
            >
              <span className="text-[10px] font-mono font-bold">{key.noteName}</span>
              {showKeyBindings && key.keyBinding && (
                <span className="text-[9px] font-mono text-stone-400 mt-0.5">{key.keyBinding}</span>
              )}
            </button>
          );
        })}

        {/* Black Keys Positioned Absolutely */}
        {keys.map((key) => {
          if (!key.isBlack) return null;

          // Calculate offset based on pitch
          const noteInOct = key.pitch % 12;
          const octaveIndex = Math.floor((key.pitch - (startOctave + 1) * 12) / 12);
          const whiteIndexInOct: Record<number, number> = {
            1: 0.65, // C#
            3: 1.65, // D#
            6: 3.65, // F#
            8: 4.65, // G#
            10: 5.65, // A#
          };

          const whiteOffset = octaveIndex * 7 + (whiteIndexInOct[noteInOct] || 0);
          const active = isPitchActive(key.pitch);

          return (
            <button
              key={key.pitch}
              type="button"
              onMouseDown={() => handleMouseDown(key.pitch)}
              onMouseUp={() => handleMouseUp(key.pitch)}
              onMouseLeave={() => handleMouseUp(key.pitch)}
              aria-label={key.noteName}
              style={{
                left: `calc(${whiteOffset} * 2.5rem + 0.35rem)`, // Approx white key width
              }}
              className={clsx(
                'absolute top-0 z-10 w-6 sm:w-7 h-22 sm:h-24 rounded-b-md transition-colors cursor-pointer flex flex-col justify-end items-center pb-1.5 focus:outline-none shadow-md',
                active
                  ? 'bg-red-600 text-white border-2 border-red-800'
                  : 'bg-stone-950 hover:bg-stone-900 border border-stone-800 text-stone-400'
              )}
            >
              {showKeyBindings && key.keyBinding && (
                <span className="text-[9px] font-mono font-bold text-stone-300">{key.keyBinding}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
