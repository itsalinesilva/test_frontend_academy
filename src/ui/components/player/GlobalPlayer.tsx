import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  X,
  Music2,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface PlayerTrack {
  id: string;
  title: string;
  composer: string;
  period: string;
  key: string;
  meter: string;
  tempoBpm: number;
  durationSeconds: number;
  // Notes sequence: [frequencyHz, durationFraction][]
  notes: [number, number][];
}

export const CANONICAL_TRACKS: PlayerTrack[] = [
  {
    id: 'track-bach-prelude',
    title: 'Prelúdio nº 1 em Dó Maior (BWV 846)',
    composer: 'Johann Sebastian Bach',
    period: 'Barroco Tardio',
    key: 'Dó Maior (C Major)',
    meter: '4/4',
    tempoBpm: 60,
    durationSeconds: 16,
    notes: [
      [261.63, 0.25], [329.63, 0.25], [392.00, 0.25], [523.25, 0.25], [659.25, 0.25], [392.00, 0.25], [523.25, 0.25], [659.25, 0.25],
      [261.63, 0.25], [329.63, 0.25], [392.00, 0.25], [523.25, 0.25], [659.25, 0.25], [392.00, 0.25], [523.25, 0.25], [659.25, 0.25],
      [261.63, 0.25], [293.66, 0.25], [440.00, 0.25], [587.33, 0.25], [698.46, 0.25], [440.00, 0.25], [587.33, 0.25], [698.46, 0.25],
      [246.94, 0.25], [293.66, 0.25], [392.00, 0.25], [493.88, 0.25], [659.25, 0.25], [392.00, 0.25], [493.88, 0.25], [659.25, 0.25],
      [261.63, 1.0],  [329.63, 1.0],  [392.00, 1.0],  [523.25, 1.5],
    ],
  },
  {
    id: 'track-mozart-k545',
    title: 'Sonata Fácil em Dó Maior (K. 545 - Tema)',
    composer: 'Wolfgang Amadeus Mozart',
    period: 'Classicismo Vienense',
    key: 'Dó Maior (C Major)',
    meter: '4/4',
    tempoBpm: 120,
    durationSeconds: 12,
    notes: [
      [523.25, 0.5], [659.25, 0.5], [783.99, 0.5], [493.88, 0.25], [523.25, 0.25], [587.33, 0.5],
      [523.25, 0.5], [0, 0.25],     [587.33, 0.5], [698.46, 0.5], [880.00, 0.5], [659.25, 0.25], [698.46, 0.25], [783.99, 0.5],
      [659.25, 0.5], [523.25, 0.5], [587.33, 0.5], [493.88, 0.5], [523.25, 1.0],
    ],
  },
  {
    id: 'track-beethoven-ode',
    title: 'Ode à Alegria (Sinfonia nº 9, Op. 125)',
    composer: 'Ludwig van Beethoven',
    period: 'Transição Clássico-Romântica',
    key: 'Ré Maior (D Major)',
    meter: '4/4',
    tempoBpm: 108,
    durationSeconds: 14,
    notes: [
      [329.63, 0.5], [329.63, 0.5], [349.23, 0.5], [392.00, 0.5],
      [392.00, 0.5], [349.23, 0.5], [329.63, 0.5], [293.66, 0.5],
      [261.63, 0.5], [261.63, 0.5], [293.66, 0.5], [329.63, 0.5],
      [329.63, 0.75], [293.66, 0.25], [293.66, 1.0],
    ],
  },
  {
    id: 'track-edinburgh-cadence',
    title: 'Cadência Perfeita I - IV - V - I com Resolução',
    composer: 'Cátedra de Teoria de Edimburgo',
    period: 'Sistema Tonal Acústico',
    key: 'Dó Maior (C Major)',
    meter: '4/4',
    tempoBpm: 72,
    durationSeconds: 10,
    notes: [
      // Tonic C
      [261.63, 0.75], [329.63, 0.75], [392.00, 0.75],
      // Subdominant F
      [349.23, 0.75], [440.00, 0.75], [523.25, 0.75],
      // Dominant G
      [392.00, 0.75], [493.88, 0.75], [587.33, 0.75],
      // Resolution C
      [261.63, 1.5],  [329.63, 1.5],  [523.25, 1.5],
    ],
  },
  {
    id: 'track-diapason-a440',
    title: 'Lá 440 Hz • Afinação Padrão de Referência',
    composer: 'Padrão Internacional ISO 16',
    period: 'Acústica Fundamental',
    key: 'Lá (A4)',
    meter: 'Contínuo',
    tempoBpm: 60,
    durationSeconds: 8,
    notes: [
      [440.00, 2.0], [440.00, 2.0], [440.00, 2.0], [440.00, 2.0],
    ],
  },
];

export interface GlobalPlayerProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalPlayer: React.FC<GlobalPlayerProps> = ({
  id = 'global-audio-player',
  isOpen,
  onClose,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const activeTrack = CANONICAL_TRACKS[currentTrackIndex];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Initialize or resume Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopAudio = useCallback(() => {
    // Clear scheduled timeouts
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    // Stop and disconnect active nodes
    activeOscillatorsRef.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignored
      }
    });
    activeOscillatorsRef.current = [];

    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const playActiveTrack = useCallback(() => {
    stopAudio();
    const ctx = getAudioContext();
    const notes = activeTrack.notes;
    let accumulatedTime = 0;
    const speedFactor = playbackSpeed;

    const masterGain = ctx.createGain();
    const effectiveVolume = isMuted ? 0 : volume * 0.35;
    masterGain.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(([freq, durationFrac]) => {
      const stepDuration = (durationFrac * (60 / activeTrack.tempoBpm)) / speedFactor;

      if (freq > 0) {
        const timeoutId = window.setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Envelope
            noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.03);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stepDuration * 0.95);

            osc.connect(noteGain);
            noteGain.connect(masterGain);

            osc.start();
            osc.stop(ctx.currentTime + stepDuration);

            activeOscillatorsRef.current.push({ osc, gain: noteGain });
          } catch (e) {
            console.warn('[GlobalPlayer] Note error', e);
          }
        }, accumulatedTime * 1000);

        timeoutsRef.current.push(timeoutId);
      }

      accumulatedTime += stepDuration;
    });

    // Track timer
    const totalDuration = activeTrack.durationSeconds / speedFactor;
    const startTimestamp = Date.now();

    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimestamp) / 1000;
      if (elapsed >= totalDuration) {
        setIsPlaying(false);
        setProgress(100);
        setCurrentTimeSec(Math.round(totalDuration));
        stopAudio();
      } else {
        setCurrentTimeSec(Math.round(elapsed));
        setProgress((elapsed / totalDuration) * 100);
      }
    }, 100);
  }, [activeTrack, getAudioContext, isMuted, playbackSpeed, stopAudio, volume]);

  useEffect(() => {
    if (isPlaying) {
      playActiveTrack();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isPlaying, playActiveTrack, stopAudio]);

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudio();
    } else {
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    stopAudio();
    setProgress(0);
    setCurrentTimeSec(0);
    setCurrentTrackIndex((prev) => (prev + 1) % CANONICAL_TRACKS.length);
    if (isPlaying) {
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  const handlePrevTrack = () => {
    stopAudio();
    setProgress(0);
    setCurrentTimeSec(0);
    setCurrentTrackIndex((prev) => (prev - 1 + CANONICAL_TRACKS.length) % CANONICAL_TRACKS.length);
    if (isPlaying) {
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    const newTime = (val / 100) * activeTrack.durationSeconds;
    setCurrentTimeSec(Math.round(newTime));
  };

  if (!isOpen) return null;

  return (
    <aside
      id={id}
      aria-label="Tocador de Áudio e Repertório Global"
      className={clsx(
        'fixed bottom-14 lg:bottom-4 right-2 sm:right-6 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border border-stone-700/80 rounded-2xl shadow-2xl transition-all duration-200 select-none max-w-full',
        isMinimized ? 'w-72 sm:w-80 p-3' : 'w-[94vw] sm:w-[540px] p-4'
      )}
    >
      {/* Minimized view */}
      {isMinimized ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-red-700 hover:bg-red-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{activeTrack.title}</p>
            <p className="text-[10px] text-stone-400 truncate">{activeTrack.composer}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
              title="Expandir player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
              title="Fechar player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded View */
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-red-950/80 border border-red-800 text-red-400 rounded">
                <Music2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-serif font-bold text-stone-200">Repertório Canônico Auditivo</span>
                <span className="text-[10px] font-mono text-stone-400 ml-2">
                  Trilha {currentTrackIndex + 1} de {CANONICAL_TRACKS.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                title="Minimizar tocador"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  stopAudio();
                  onClose();
                }}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
                title="Fechar tocador"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Track Info Card */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
                {activeTrack.title}
              </h4>
              <p className="text-xs text-stone-400 truncate">{activeTrack.composer}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                  {activeTrack.key}
                </span>
                <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                  {activeTrack.meter}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {activeTrack.tempoBpm} BPM
                </span>
              </div>
            </div>

            {/* Sound Wave Animation */}
            <div className="flex items-end gap-1 h-8 px-2 bg-stone-950/60 rounded border border-stone-800 self-center">
              {[40, 75, 55, 90, 60, 80].map((h, i) => (
                <span
                  key={i}
                  className={clsx(
                    'w-1 rounded-full bg-red-600 transition-all duration-300',
                    isPlaying ? 'animate-pulse' : 'opacity-30'
                  )}
                  style={{ height: isPlaying ? `${h}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>0:{currentTimeSec.toString().padStart(2, '0')}</span>
              <span>0:{activeTrack.durationSeconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTrack}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Faixa anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-red-700 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md focus:ring-2 focus:ring-red-400"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                title="Próxima faixa"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed selection */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">Vel:</span>
              {[0.75, 1, 1.25].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={clsx(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors',
                    playbackSpeed === spd
                      ? 'bg-red-800 text-white font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  )}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Volume & Mute */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className="text-stone-400 hover:text-white"
                title={isMuted ? 'Desativar mudo' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-red-600 hidden sm:block"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
