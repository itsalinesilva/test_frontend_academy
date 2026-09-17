import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface NoteItem {
  id: string;
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  octave: number;
  duration: 'whole' | 'half' | 'quarter' | 'eighth';
  accidental?: 'sharp' | 'flat' | 'natural';
}

export interface StaffProps {
  id?: string;
  clef?: 'treble' | 'bass' | 'alto';
  timeSignature?: string; // "4/4", "3/4", "6/8"
  notes?: NoteItem[];
  measureCount?: number;
  interactive?: boolean;
  onMeasureClick?: (measureIndex: number) => void;
  className?: string;
}

export const Staff: React.FC<StaffProps> = ({
  id = 'musical-staff',
  clef = 'treble',
  timeSignature = '4/4',
  notes = [],
  measureCount = 4,
  interactive = false,
  onMeasureClick,
  className,
}) => {
  // 5 lines spaced by 12px
  const staffLines = [30, 42, 54, 66, 78];

  return (
    <div
      id={id}
      className={twMerge(
        'w-full bg-white border border-stone-200 rounded-sm p-4 overflow-x-auto shadow-xs select-none',
        className
      )}
    >
      <svg
        className="w-full min-w-[540px] h-32"
        viewBox="0 0 600 110"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Clef label / symbol representation */}
        <text
          x="12"
          y="72"
          fontFamily="serif"
          fontSize="48"
          fill="#1c1917"
          className="select-none font-bold"
        >
          {clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡'}
        </text>

        {/* Time Signature */}
        <text
          x="44"
          y="52"
          fontFamily="serif"
          fontSize="22"
          fontWeight="bold"
          fill="#1c1917"
        >
          {timeSignature.split('/')[0]}
        </text>
        <text
          x="44"
          y="76"
          fontFamily="serif"
          fontSize="22"
          fontWeight="bold"
          fill="#1c1917"
        >
          {timeSignature.split('/')[1]}
        </text>

        {/* 5 Staff Lines */}
        {staffLines.map((y, idx) => (
          <line
            key={idx}
            x1="0"
            y1={y}
            x2="600"
            y2={y}
            stroke="#44403c"
            strokeWidth="1.5"
          />
        ))}

        {/* Bar Lines dividing measures */}
        {Array.from({ length: measureCount }).map((_, idx) => {
          const x = 70 + ((idx + 1) * (520 / measureCount));
          return (
            <g
              key={idx}
              onClick={() => interactive && onMeasureClick && onMeasureClick(idx)}
              className={interactive ? 'cursor-pointer hover:opacity-80' : undefined}
            >
              <line
                x1={x}
                y1={30}
                x2={x}
                y2={78}
                stroke="#1c1917"
                strokeWidth={idx === measureCount - 1 ? '3' : '1.5'}
              />
              <text x={x - 20} y="22" fontSize="9" fill="#a8a29e" fontFamily="mono">
                M{idx + 1}
              </text>
            </g>
          );
        })}

        {/* Sample Placed Notes */}
        {notes.map((note, idx) => {
          const noteX = 90 + idx * 45;
          // Approximate Y based on octave
          const noteY = 54;
          return (
            <g key={note.id} className="cursor-pointer hover:opacity-80">
              <ellipse
                cx={noteX}
                cy={noteY}
                rx="6"
                ry="4.5"
                fill="#1c1917"
                transform={`rotate(-20 ${noteX} ${noteY})`}
              />
              <line
                x1={noteX + 5.5}
                y1={noteY}
                x2={noteX + 5.5}
                y2={noteY - 26}
                stroke="#1c1917"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
