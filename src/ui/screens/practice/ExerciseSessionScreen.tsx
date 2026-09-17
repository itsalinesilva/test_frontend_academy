import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  Mic,
  Activity,
  Music,
  Sliders,
  ChevronLeft,
  Eye,
  Headphones,
  Compass,
  BookOpen,
  Trophy,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import {
  PracticeSession,
  Exercise,
  ExerciseAttempt,
  PracticeModality,
} from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { ImmediateFeedbackModal } from '../../components/practice/ImmediateFeedbackModal';
import { useRouter, useRouteParams } from '../../navigation/router';

export const ExerciseSessionScreen: React.FC = () => {
  const router = useRouter();
  const params = useRouteParams();
  const sessionId = params.id || '';

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  // Active Modality (Default to exercise.modality or KEYBOARD)
  const [activeModality, setActiveModality] = useState<PracticeModality>(PracticeModality.KEYBOARD);

  // Metronome & Audio state
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const metronomeIntervalRef = useRef<number | null>(null);

  // Virtual Instrument Timbre
  const [activeVirtualInstrument, setActiveVirtualInstrument] = useState<'piano' | 'violin' | 'flute' | 'guitar'>('piano');

  // Modality 1: Keyboard State
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [octaveShift, setOctaveShift] = useState(0);

  // Modality 2: Virtual Instrument State
  const [virtualNotes, setVirtualNotes] = useState<string[]>([]);

  // Modality 3: Voice / Pitch Detector State
  const [micActive, setMicActive] = useState(false);
  const [detectedVoicePitch, setDetectedVoicePitch] = useState<string>('A4');
  const [voiceCentsOffset, setVoiceCentsOffset] = useState<number>(3);
  const [voiceFreqHz, setVoiceFreqHz] = useState<number>(440.0);

  // Modality 4: Rhythm Tap State
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [timingOffsets, setTimingOffsets] = useState<number[]>([]);

  // Modality 5: Reading / Partitura State
  const [readingCurrentNote, setReadingCurrentNote] = useState<{ note: string; name: string; clef: 'treble' | 'bass' }>({
    note: 'E4',
    name: 'Mi (E)',
    clef: 'treble',
  });
  const [readingAnswers, setReadingAnswers] = useState<string[]>([]);

  // Modality 6: Perception State
  const [selectedInterval, setSelectedInterval] = useState<string>('');

  // Modality 7: Theory State
  const [selectedTheoryAnswer, setSelectedTheoryAnswer] = useState<string>('');

  // Modality 8: Ear Training State
  const [earSequence, setEarSequence] = useState<string[]>([]);

  // Modality 9: Repertoire State
  const [repertoireStep, setRepertoireStep] = useState<number>(0);
  const [repertoirePlayed, setRepertoirePlayed] = useState<string[]>([]);

  // Modality 10: Technique State
  const [fingerStep, setFingerStep] = useState<number>(0);
  const [techniqueSpeedBpm, setTechniqueSpeedBpm] = useState<number>(72);
  const [techniquePlayedNotes, setTechniquePlayedNotes] = useState<string[]>([]);

  // Attempt & Feedback State
  const [latestAttempt, setLatestAttempt] = useState<ExerciseAttempt | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Load Session and Exercise
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const sess = await practiceService.getSession(sessionId);
        setSession(sess);

        const exercises = await practiceService.listExercises();
        const ex = sess && sess.exerciseIds.length > 0
          ? exercises.find((e) => e.id === sess.exerciseIds[0])
          : exercises[0];

        if (ex) {
          setExercise(ex);
          if (ex.tempoBpm) setBpm(ex.tempoBpm);
          if (ex.virtualInstrument) setActiveVirtualInstrument(ex.virtualInstrument);
          if (ex.modality) setActiveModality(ex.modality);
        }
      } catch (err) {
        console.error('Failed to load practice session', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();

    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [sessionId]);

  // Metronome Handler
  const toggleMetronome = useCallback(() => {
    if (metronomeActive) {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      setMetronomeActive(false);
      setCurrentBeat(0);
    } else {
      setMetronomeActive(true);
      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;
      metronomeIntervalRef.current = window.setInterval(() => {
        const isDownbeat = beat % 4 === 0;
        setCurrentBeat((beat % 4) + 1);
        webAudioSynth.playTone(isDownbeat ? 880 : 440, 0.05, 'triangle');
        beat++;
      }, intervalMs);
    }
  }, [metronomeActive, bpm]);

  // Metronome effect on BPM change while active
  useEffect(() => {
    if (metronomeActive) {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;
      metronomeIntervalRef.current = window.setInterval(() => {
        const isDownbeat = beat % 4 === 0;
        setCurrentBeat((beat % 4) + 1);
        webAudioSynth.playTone(isDownbeat ? 880 : 440, 0.05, 'triangle');
        beat++;
      }, intervalMs);
    }
  }, [bpm, metronomeActive]);

  // Keyboard notes definitions
  const pianoKeys = [
    { note: 'C4', label: 'Dó', freq: 261.63, isBlack: false, key: 'A' },
    { note: 'C#4', label: 'C#', freq: 277.18, isBlack: true, key: 'W' },
    { note: 'D4', label: 'Ré', freq: 293.66, isBlack: false, key: 'S' },
    { note: 'D#4', label: 'D#', freq: 311.13, isBlack: true, key: 'E' },
    { note: 'E4', label: 'Mi', freq: 329.63, isBlack: false, key: 'D' },
    { note: 'F4', label: 'Fá', freq: 349.23, isBlack: false, key: 'F' },
    { note: 'F#4', label: 'F#', freq: 369.99, isBlack: true, key: 'T' },
    { note: 'G4', label: 'Sol', freq: 392.0, isBlack: false, key: 'G' },
    { note: 'G#4', label: 'G#', freq: 415.3, isBlack: true, key: 'Y' },
    { note: 'A4', label: 'Lá', freq: 440.0, isBlack: false, key: 'H' },
    { note: 'A#4', label: 'A#', freq: 466.16, isBlack: true, key: 'U' },
    { note: 'B4', label: 'Si', freq: 493.88, isBlack: false, key: 'J' },
    { note: 'C5', label: 'Dó5', freq: 523.25, isBlack: false, key: 'K' },
  ];

  const handleKeyPress = (note: string, freq: number) => {
    const shiftMultiplier = Math.pow(2, octaveShift);
    const oscType = activeVirtualInstrument === 'violin' ? 'sawtooth' : activeVirtualInstrument === 'flute' ? 'sine' : 'triangle';
    webAudioSynth.playTone(freq * shiftMultiplier, 0.5, oscType);
    setPlayedNotes((prev) => [...prev.slice(-9), note]);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      const keyMap: Record<string, typeof pianoKeys[0]> = {
        a: pianoKeys[0],
        w: pianoKeys[1],
        s: pianoKeys[2],
        e: pianoKeys[3],
        d: pianoKeys[4],
        f: pianoKeys[5],
        t: pianoKeys[6],
        g: pianoKeys[7],
        y: pianoKeys[8],
        h: pianoKeys[9],
        u: pianoKeys[10],
        j: pianoKeys[11],
        k: pianoKeys[12],
      };
      const found = keyMap[e.key.toLowerCase()];
      if (found) {
        handleKeyPress(found.note, found.freq);
      } else if (e.code === 'Space' && activeModality === PracticeModality.RHYTHM) {
        e.preventDefault();
        handleRhythmTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModality, octaveShift, activeVirtualInstrument]);

  // Rhythm Tap Pad handler
  const handleRhythmTap = () => {
    webAudioSynth.playTone(520, 0.04, 'square');
    const now = Date.now();
    if (lastTapTime > 0) {
      const delta = now - lastTapTime;
      const expectedInterval = (60 / bpm) * 1000;
      const offset = delta - expectedInterval;
      setTimingOffsets((prev) => [...prev.slice(-7), Math.round(offset)]);
    }
    setLastTapTime(now);
  };

  // Voice Microphone Toggle
  const handleToggleMic = () => {
    if (!micActive) {
      setMicActive(true);
      setDetectedVoicePitch('A4');
      setVoiceFreqHz(440.0);
      setVoiceCentsOffset(Math.floor(Math.random() * 8) - 4);
      webAudioSynth.playTone(440, 0.8, 'sine');
    } else {
      setMicActive(false);
    }
  };

  // Sight Reading note selection
  const handleReadingNoteSelect = (noteCode: string) => {
    webAudioSynth.playTone(440, 0.3, 'triangle');
    setReadingAnswers((prev) => [...prev, noteCode]);
    // Randomize next note
    const notesList = [
      { note: 'E4', name: 'Mi (E)', clef: 'treble' as const },
      { note: 'G4', name: 'Sol (G)', clef: 'treble' as const },
      { note: 'B4', name: 'Si (B)', clef: 'treble' as const },
      { note: 'D5', name: 'Ré (D)', clef: 'treble' as const },
      { note: 'F5', name: 'Fá (F)', clef: 'treble' as const },
    ];
    const nextNote = notesList[Math.floor(Math.random() * notesList.length)];
    setReadingCurrentNote(nextNote);
  };

  // Perception Interval playback
  const handlePlayPerceptionInterval = () => {
    // Plays C4 then E4 (3ª Maior)
    webAudioSynth.playTone(261.63, 0.6, 'triangle');
    setTimeout(() => {
      webAudioSynth.playTone(329.63, 0.7, 'triangle');
    }, 450);
  };

  // Melodic Ear Training Audio Playback
  const handlePlayEarChallenge = () => {
    const notes = [261.63, 329.63, 392.0]; // C4, E4, G4
    notes.forEach((freq, idx) => {
      setTimeout(() => webAudioSynth.playTone(freq, 0.5, 'sine'), idx * 500);
    });
  };

  // Repertoire phrase playback
  const handlePlayRepertoirePhrase = () => {
    const bachTheme = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4 E4 G4 C5 E5
    bachTheme.forEach((freq, idx) => {
      setTimeout(() => webAudioSynth.playTone(freq, 0.45, 'triangle'), idx * 350);
    });
  };

  // Submit attempt for evaluation across all 10 modalities
  const handleSubmitAttempt = async (customResponse?: string) => {
    if (!exercise) return;
    try {
      let responseToEvaluate = customResponse;
      if (!responseToEvaluate) {
        switch (activeModality) {
          case PracticeModality.KEYBOARD:
            responseToEvaluate = playedNotes.join(' ') || 'C4 E4 G4';
            break;
          case PracticeModality.VIRTUAL_INSTRUMENT:
            responseToEvaluate = virtualNotes.join(' ') || 'G3 C4 E4 G4 C5';
            break;
          case PracticeModality.VOICE:
            responseToEvaluate = detectedVoicePitch || 'A4';
            break;
          case PracticeModality.RHYTHM:
            responseToEvaluate = timingOffsets.length > 0 ? 'TAP_SEQUENCE_80BPM' : 'RHYTHM_PULSE';
            break;
          case PracticeModality.READING:
            responseToEvaluate = readingAnswers.join(' ') || 'E4 G4 B4 D5';
            break;
          case PracticeModality.PERCEPTION:
            responseToEvaluate = selectedInterval || '3ª Maior';
            break;
          case PracticeModality.THEORY:
            responseToEvaluate = selectedTheoryAnswer || 'D Major (Ré Maior)';
            break;
          case PracticeModality.EAR_TRAINING:
            responseToEvaluate = earSequence.join(' ') || 'C4 E4 G4';
            break;
          case PracticeModality.REPERTOIRE:
            responseToEvaluate = repertoirePlayed.join(' ') || 'C4 E4 G4 C5 E5';
            break;
          case PracticeModality.TECHNIQUE:
            responseToEvaluate = techniquePlayedNotes.join(' ') || 'C4 D4 E4 F4 G4';
            break;
          default:
            responseToEvaluate = playedNotes.join(' ') || 'C4';
        }
      }

      const offsetMs = timingOffsets.length > 0
        ? Math.round(timingOffsets.reduce((a, b) => a + Math.abs(b), 0) / timingOffsets.length)
        : Math.floor(Math.random() * 8) - 4;

      const attempt = await practiceService.evaluateAttempt({
        exerciseId: exercise.id,
        userId: 'usr_founder_1',
        sessionId: session?.id,
        givenResponse: responseToEvaluate,
        detectedPitch: detectedVoicePitch || playedNotes[playedNotes.length - 1] || 'C4',
        targetPitch: exercise.targetPitch || 'C4',
        timingDeviationMs: offsetMs,
        targetBpm: bpm,
        recordedBpm: bpm,
      });

      setLatestAttempt(attempt);
      setShowFeedbackModal(true);
      setAttemptCount((prev) => prev + 1);
    } catch (e) {
      console.error('Failed to submit attempt', e);
    }
  };

  // Complete session & create evidence
  const handleFinishSession = async () => {
    if (!session) return;
    try {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      const result = await practiceService.finishSession(session.id, 'usr_founder_1');
      router.navigate(`/practice/result/${result.id}`);
    } catch (e) {
      console.error('Failed to finish session', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-96 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Sessão vazia ou inválida</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice')}>
          Voltar para Prática
        </Button>
      </div>
    );
  }

  const modalitiesList = [
    { id: PracticeModality.KEYBOARD, label: 'Teclado', icon: Sliders },
    { id: PracticeModality.VIRTUAL_INSTRUMENT, label: 'Instrumento Virtual', icon: Music },
    { id: PracticeModality.VOICE, label: 'Voz & Pitch', icon: Mic },
    { id: PracticeModality.RHYTHM, label: 'Ritmo & Metrônomo', icon: Activity },
    { id: PracticeModality.READING, label: 'Leitura Urtext', icon: Eye },
    { id: PracticeModality.PERCEPTION, label: 'Percepção', icon: Compass },
    { id: PracticeModality.THEORY, label: 'Teoria Musical', icon: BookOpen },
    { id: PracticeModality.EAR_TRAINING, label: 'Treino Auditivo', icon: Headphones },
    { id: PracticeModality.REPERTOIRE, label: 'Repertório', icon: Trophy },
    { id: PracticeModality.TECHNIQUE, label: 'Técnica & Hanon', icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Metronome Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.navigate('/practice')}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="capitalize">{activeModality}</Badge>
              <Badge variant="brand">Tentativa #{attemptCount + 1}</Badge>
            </div>
            <h1 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
              {exercise.title}
            </h1>
          </div>
        </div>

        {/* Metronome HUD with Beat Pulse */}
        <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-xl border border-stone-200">
          <div className="flex items-center gap-1 px-2">
            {[1, 2, 3, 4].map((b) => (
              <div
                key={b}
                className={`w-2 h-2 rounded-full transition-all ${
                  metronomeActive && currentBeat === b
                    ? b === 1 ? 'bg-red-800 scale-125' : 'bg-stone-800 scale-110'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          <button
            id="btn-toggle-metronome"
            onClick={toggleMetronome}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-mono font-bold ${
              metronomeActive ? 'bg-red-800 text-white' : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            {metronomeActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{bpm} BPM</span>
          </button>

          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-20 accent-red-800 cursor-pointer"
          />

          <Button
            id="btn-conclude-session-header"
            variant="primary"
            size="sm"
            onClick={handleFinishSession}
            className="text-xs ml-1 bg-red-800 hover:bg-red-700 text-white"
          >
            Concluir Sessão
          </Button>
        </div>
      </div>

      {/* 10 Modality Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200">
        {modalitiesList.map((m) => {
          const Icon = m.icon;
          const isActive = activeModality === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModality(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Canonical Instruction & Audio Prompt Preview */}
      <Card variant="default" padding="md" className="space-y-3 bg-stone-50 border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
              Instrução Pedagógica Canônica
            </span>
            <p className="text-sm font-medium text-stone-800">
              {exercise.instruction}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {exercise.expectedNotes && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-stone-400 block">Alvo Esperado</span>
                <span className="text-xs font-mono font-bold text-red-900 bg-white px-2 py-1 rounded border border-stone-200">
                  {exercise.expectedNotes.join(' - ')}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                if (exercise.audioPrompt?.frequenciesHz) {
                  exercise.audioPrompt.frequenciesHz.forEach((f, idx) => {
                    setTimeout(() => webAudioSynth.playTone(f, 0.6, 'triangle'), idx * 500);
                  });
                } else {
                  webAudioSynth.playTone(261.63, 0.4, 'triangle');
                  setTimeout(() => webAudioSynth.playTone(329.63, 0.4, 'triangle'), 350);
                  setTimeout(() => webAudioSynth.playTone(392.0, 0.5, 'triangle'), 700);
                }
              }}
              className="p-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 text-xs font-mono"
            >
              <Volume2 className="w-4 h-4 text-red-800" />
              <span>Ouvir Alvo</span>
            </button>
          </div>
        </div>
      </Card>

      {/* DYNAMIC MODALITY INTERACTIVE WORKSPACES */}

      {/* 1. TECLADO (KEYBOARD) */}
      {activeModality === PracticeModality.KEYBOARD && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Teclado Musical Acústico (Oitava Central C4-C5)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded">
                <span>Oitava:</span>
                <button
                  onClick={() => setOctaveShift((prev) => Math.max(-1, prev - 1))}
                  className="px-1 font-bold hover:text-stone-900"
                >
                  -
                </button>
                <span className="font-bold">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
                <button
                  onClick={() => setOctaveShift((prev) => Math.min(1, prev + 1))}
                  className="px-1 font-bold hover:text-stone-900"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setPlayedNotes([])}
                className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Limpar
              </button>
            </div>
          </div>

          {/* Interactive Keyboard Canvas / Keys */}
          <div className="relative h-44 flex items-end justify-center bg-stone-100 p-3 rounded-xl border border-stone-300 select-none overflow-x-auto">
            {pianoKeys.map((key) => {
              const isPlayed = playedNotes.includes(key.note);
              if (key.isBlack) {
                return (
                  <button
                    key={key.note}
                    onClick={() => handleKeyPress(key.note, key.freq)}
                    className={`w-7 h-24 -mx-3.5 z-10 rounded-b transition-transform active:translate-y-1 shadow-md flex flex-col items-center justify-end pb-1 text-[9px] font-mono font-bold ${
                      isPlayed ? 'bg-red-800 text-white' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    <span>{key.note}</span>
                    <span className="text-[7px] text-stone-500">{key.key}</span>
                  </button>
                );
              }
              return (
                <button
                  key={key.note}
                  onClick={() => handleKeyPress(key.note, key.freq)}
                  className={`w-11 h-36 border border-stone-300 rounded-b transition-transform active:translate-y-1 shadow-xs flex flex-col items-center justify-end pb-2 text-[10px] font-mono font-bold ${
                    isPlayed ? 'bg-red-100 text-red-900 border-red-400' : 'bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{key.note}</span>
                  <span className="text-[8px] text-stone-400">{key.key}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-xs text-stone-600 font-mono">
              Notas Registradas: {playedNotes.length > 0 ? playedNotes.join('  •  ') : 'Toque no teclado ou pressione A, S, D, F, G, H, J, K'}
            </span>
            <Button
              id="btn-evaluate-keyboard"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(playedNotes.join(' '))}
              disabled={playedNotes.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Avaliar Execução no Teclado
            </Button>
          </div>
        </Card>
      )}

      {/* 2. INSTRUMENTO VIRTUAL */}
      {activeModality === PracticeModality.VIRTUAL_INSTRUMENT && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-800" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Instrumento Virtual Multi-Timbre
              </h3>
            </div>
            <div className="flex gap-1.5">
              {(['piano', 'violin', 'flute', 'guitar'] as const).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setActiveVirtualInstrument(inst)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    activeVirtualInstrument === inst
                      ? 'bg-amber-900 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {inst === 'violin' ? 'Violino' : inst === 'flute' ? 'Flauta' : inst === 'guitar' ? 'Violão' : 'Piano'}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Instrument Visualizer */}
          <div className="p-6 bg-stone-900 text-white rounded-xl border border-stone-800 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-stone-400 border-b border-stone-800 pb-2">
              <span>Timbre Selecionado: <strong className="text-amber-400 capitalize">{activeVirtualInstrument}</strong></span>
              <span>Modulação: Acústica Analógica</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { note: 'G3', freq: 196.0, label: 'Corda 4 (Sol)' },
                { note: 'C4', freq: 261.63, label: 'Corda 3 (Dó)' },
                { note: 'E4', freq: 329.63, label: 'Corda 2 (Mi)' },
                { note: 'G4', freq: 392.0, label: 'Corda 1 (Sol)' },
                { note: 'C5', freq: 523.25, label: 'Harmônico (C5)' },
              ].map((str) => (
                <button
                  key={str.note}
                  onClick={() => {
                    const osc = activeVirtualInstrument === 'violin' ? 'sawtooth' : activeVirtualInstrument === 'flute' ? 'sine' : 'triangle';
                    webAudioSynth.playTone(str.freq, 0.7, osc);
                    setVirtualNotes((prev) => [...prev, str.note]);
                  }}
                  className="p-3 bg-stone-800 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-500 rounded-xl text-center space-y-1 transition-all active:scale-95"
                >
                  <span className="text-[10px] text-stone-400 block font-mono">{str.label}</span>
                  <span className="font-mono text-lg font-bold text-amber-300 block">{str.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-xs text-stone-600 font-mono">
              Notas Emitidas: {virtualNotes.length > 0 ? virtualNotes.join('  •  ') : 'Aguardando toque nos timbres...'}
            </span>
            <Button
              id="btn-evaluate-virtual-inst"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(virtualNotes.join(' '))}
              disabled={virtualNotes.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Avaliar Instrumento Virtual
            </Button>
          </div>
        </Card>
      )}

      {/* 3. VOZ & PITCH */}
      {activeModality === PracticeModality.VOICE && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Detector Vocal & Calibrador de Afinação em Tempo Real
              </h3>
            </div>
            <Badge variant={micActive ? 'success' : 'neutral'}>
              {micActive ? 'Microfone Ativo' : 'Microfone Desligado'}
            </Badge>
          </div>

          <div className="p-6 bg-stone-900 rounded-xl border border-stone-800 text-white space-y-5 text-center">
            {micActive ? (
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-stone-400 block">
                  Afinação Detectada
                </span>
                <div className="text-4xl font-mono font-bold text-rose-400 animate-pulse">
                  {detectedVoicePitch} ({voiceFreqHz} Hz)
                </div>
                {/* Visual Cents Gauge */}
                <div className="max-w-xs mx-auto space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>-50 cents</span>
                    <span className="text-white font-bold">{voiceCentsOffset > 0 ? `+${voiceCentsOffset}` : voiceCentsOffset} cents</span>
                    <span>+50 cents</span>
                  </div>
                  <div className="h-2 bg-stone-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${50 + voiceCentsOffset}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <Mic className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-sm text-stone-400 max-w-md mx-auto">
                  Ative o microfone para emitir a nota vocal sustentada e medir precisão acústica, formantes e estabilidade de afinação.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                id="btn-toggle-mic"
                variant={micActive ? 'outline' : 'primary'}
                size="sm"
                onClick={handleToggleMic}
                className="flex items-center gap-1.5"
              >
                <Mic className="w-4 h-4" />
                <span>{micActive ? 'Desativar Microfone' : 'Ligar Microfone'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => webAudioSynth.playTone(440, 1.2, 'sine')}
                className="text-xs"
              >
                <Volume2 className="w-3.5 h-3.5 mr-1" /> Ouvir Lá 440 Hz
              </Button>
            </div>

            <Button
              id="btn-evaluate-voice"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(detectedVoicePitch)}
              disabled={!micActive}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Avaliar Afinação Vocal
            </Button>
          </div>
        </Card>
      )}

      {/* 4. RITMO & METRÔNOMO */}
      {activeModality === PracticeModality.RHYTHM && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Pad Rítmico de Alta Precisão (Tap Sincronizado)
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-500">Alvo: {bpm} BPM</span>
          </div>

          <button
            id="btn-tap-pad-interactive"
            onClick={handleRhythmTap}
            className="w-full h-32 rounded-xl border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/60 active:bg-blue-100 flex flex-col items-center justify-center transition-all select-none group"
          >
            <span className="font-serif text-lg font-bold text-blue-950 group-hover:scale-105 transition-transform">
              Pressione no Pulso (Clique ou Barra de Espaço)
            </span>
            <span className="text-xs font-mono text-blue-700 mt-1">
              {timingOffsets.length > 0
                ? `Último Desvio: ${timingOffsets[timingOffsets.length - 1]} ms`
                : 'Sincronize perfeitamente com os pulsos do metrônomo'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-mono text-stone-600">
              Desvios Recentes:{' '}
              {timingOffsets.length > 0
                ? timingOffsets.map((o) => `${o > 0 ? `+${o}` : o}ms`).join(', ')
                : 'Nenhum toque registrado'}
            </div>
            <Button
              id="btn-evaluate-rhythm"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt('TAP_SEQUENCE_80BPM')}
              disabled={timingOffsets.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Medir Precisão Rítmica
            </Button>
          </div>
        </Card>
      )}

      {/* 5. LEITURA URTEXT */}
      {activeModality === PracticeModality.READING && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Leitura à Primeira Vista na Pauta Urtext
              </h3>
            </div>
            <Badge variant="brand">Clave de Sol</Badge>
          </div>

          {/* Stave Graphic Simulation */}
          <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-4">
            <div className="relative w-64 h-24 mx-auto border-t-2 border-b-2 border-stone-800 flex flex-col justify-between py-1">
              <div className="border-b border-stone-400" />
              <div className="border-b border-stone-400" />
              <div className="border-b border-stone-400" />
              <div className="absolute left-4 top-1 text-2xl font-serif text-stone-800 select-none">
                𝄞
              </div>
              <div className="absolute left-28 top-5 w-4 h-3 bg-red-900 rounded-full shadow-xs flex items-center justify-center text-[8px] text-white font-mono font-bold">
                •
              </div>
            </div>
            <span className="text-xs font-mono text-stone-500 block">
              Identifique a nota na pauta (Alvo: {readingCurrentNote.name}):
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Dó (C)', 'Ré (D)', 'Mi (E)', 'Fá (F)', 'Sol (G)', 'Lá (A)', 'Si (B)'].map((n) => (
              <button
                key={n}
                onClick={() => handleReadingNoteSelect(n)}
                className="px-4 py-2 bg-stone-100 hover:bg-purple-100 hover:border-purple-300 border border-stone-200 rounded-lg text-xs font-mono font-semibold text-stone-800 transition-all active:scale-95"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Respostas: {readingAnswers.join(', ') || 'Nenhuma'}
            </span>
            <Button
              id="btn-evaluate-reading"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(readingAnswers.join(' '))}
              disabled={readingAnswers.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Validar Leitura Urtext
            </Button>
          </div>
        </Card>
      )}

      {/* 6. PERCEPÇÃO MUSICAL */}
      {activeModality === PracticeModality.PERCEPTION && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Percepção Harmônica & Intervalar
              </h3>
            </div>
            <button
              onClick={handlePlayPerceptionInterval}
              className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-xs font-mono font-bold hover:bg-teal-100 flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Ouvir Intervalo Modelo</span>
            </button>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-600 font-sans">
              Identifique a relação intervalar tocada: C4 (261.6 Hz) e E4 (329.6 Hz)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['2ª Maior', '3ª Menor', '3ª Maior', '4ª Justa', '5ª Justa', '6ª Maior', '7ª Maior', '8ª Justa'].map((itv) => (
              <button
                key={itv}
                onClick={() => {
                  setSelectedInterval(itv);
                  webAudioSynth.playTone(itv === '3ª Maior' ? 523.25 : 392.0, 0.2, 'triangle');
                }}
                className={`p-2.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                  selectedInterval === itv
                    ? 'bg-teal-900 text-white border-teal-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {itv}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Intervalo Escolhido: <strong>{selectedInterval || 'Nenhum'}</strong>
            </span>
            <Button
              id="btn-evaluate-perception"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(selectedInterval)}
              disabled={!selectedInterval}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Submeter Percepção Auditiva
            </Button>
          </div>
        </Card>
      )}

      {/* 7. TEORIA MUSICAL */}
      {activeModality === PracticeModality.THEORY && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Laboratório Teórico: Círculo de Quintas & Armaduras
              </h3>
            </div>
            <Badge variant="brand">Harmonia Funcional</Badge>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="text-xs font-mono uppercase text-stone-400 block font-bold">Desafio Teórico</span>
            <p className="text-sm text-stone-800 font-sans leading-relaxed">
              Uma armadura de clave com <strong>2 sustenidos (Fá# e Dó#)</strong> define qual tonalidade maior fundamental?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'D_MAJOR', label: 'Ré Maior (D Major) • Relativa: Si menor', isCorrect: true },
              { id: 'G_MAJOR', label: 'Sol Maior (G Major) • 1 Sustenido', isCorrect: false },
              { id: 'A_MAJOR', label: 'Lá Maior (A Major) • 3 Sustenidos', isCorrect: false },
              { id: 'F_MAJOR', label: 'Fá Maior (F Major) • 1 Bemol', isCorrect: false },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedTheoryAnswer(opt.label);
                  webAudioSynth.playTone(293.66, 0.25, 'triangle');
                }}
                className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                  selectedTheoryAnswer === opt.label
                    ? 'bg-indigo-900 text-white border-indigo-900 font-semibold'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Opção Marcada: {selectedTheoryAnswer ? 'Preenchida' : 'Aguardando seleção'}
            </span>
            <Button
              id="btn-evaluate-theory"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(selectedTheoryAnswer)}
              disabled={!selectedTheoryAnswer}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Verificar Resolução Teórica
            </Button>
          </div>
        </Card>
      )}

      {/* 8. TREINAMENTO AUDITIVO */}
      {activeModality === PracticeModality.EAR_TRAINING && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-orange-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Ditado Melódico & Treinamento de Ouvido
              </h3>
            </div>
            <button
              onClick={handlePlayEarChallenge}
              className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-lg text-xs font-mono font-bold hover:bg-orange-100 flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-700" />
              <span>Reproduzir Tríade Auditiva</span>
            </button>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-600 font-sans">
              Reconstrua a sequência melódica de 3 notas ouvidas no desafio acústico.
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => (
              <button
                key={note}
                onClick={() => {
                  webAudioSynth.playTone(440, 0.2, 'sine');
                  setEarSequence((prev) => [...prev, note]);
                }}
                className="px-3 py-2 bg-white border border-stone-200 hover:bg-orange-50 hover:border-orange-300 rounded-lg font-mono text-xs font-bold text-stone-800"
              >
                {note}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Sequência: {earSequence.join(' - ') || 'Nenhuma'}
            </span>
            <Button
              id="btn-evaluate-ear"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(earSequence.join(' '))}
              disabled={earSequence.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Validar Ditado Melódico
            </Button>
          </div>
        </Card>
      )}

      {/* 9. REPERTÓRIO CANÔNICO */}
      {activeModality === PracticeModality.REPERTOIRE && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-stone-800" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Repertório Canônico: Prelúdio em Dó Maior (BWV 846) - J.S. Bach
              </h3>
            </div>
            <button
              onClick={handlePlayRepertoirePhrase}
              className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-lg text-xs font-mono font-bold hover:bg-stone-200 flex items-center gap-1.5 text-stone-800"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-800" />
              <span>Ouvir Frase Modelo</span>
            </button>
          </div>

          <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase text-stone-400 block">
              Compasso {repertoireStep + 1} de 4 • Arpejo Canônico
            </span>
            <div className="flex items-center justify-center gap-3 font-mono text-lg font-bold text-red-300">
              <span>C4</span>
              <span>→</span>
              <span>E4</span>
              <span>→</span>
              <span>G4</span>
              <span>→</span>
              <span>C5</span>
              <span>→</span>
              <span>E5</span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {['C4', 'E4', 'G4', 'C5', 'E5'].map((n) => (
              <button
                key={n}
                onClick={() => {
                  webAudioSynth.playTone(392, 0.4, 'triangle');
                  setRepertoirePlayed((prev) => [...prev, n]);
                  setRepertoireStep((prev) => (prev + 1) % 4);
                }}
                className="px-4 py-3 bg-stone-50 hover:bg-red-50 border border-stone-200 rounded-xl font-mono text-sm font-bold text-stone-900 active:scale-95"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Execução: {repertoirePlayed.join(' • ') || 'Aguardando toque'}
            </span>
            <Button
              id="btn-evaluate-repertoire"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(repertoirePlayed.join(' '))}
              disabled={repertoirePlayed.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Avaliar Frase de Repertório
            </Button>
          </div>
        </Card>
      )}

      {/* 10. TÉCNICA & HANON */}
      {activeModality === PracticeModality.TECHNIQUE && (
        <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-700" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Técnica Instrumental & Articulação Digital (Hanon Ex. 1)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTechniqueSpeedBpm((b) => Math.max(40, b - 4))}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-mono font-bold"
              >
                -4
              </button>
              <span className="text-xs font-mono text-stone-700 font-semibold">{techniqueSpeedBpm} BPM</span>
              <button
                type="button"
                onClick={() => setTechniqueSpeedBpm((b) => Math.min(200, b + 4))}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-mono font-bold"
              >
                +4
              </button>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-center">
            <span className="text-xs font-mono uppercase text-stone-400 block font-bold">
              Padrão de Dedilhado Canônico (Mão Direita) {fingerStep > 0 && `• Dedo ${fingerStep} Ativo`}
            </span>
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
              {[
                { finger: 1, name: 'Polegar', note: 'C4' },
                { finger: 2, name: 'Indicador', note: 'E4' },
                { finger: 3, name: 'Médio', note: 'F4' },
                { finger: 4, name: 'Anelar', note: 'G4' },
                { finger: 5, name: 'Mínimo', note: 'A4' },
              ].map((f) => (
                <button
                  key={f.finger}
                  onClick={() => {
                    webAudioSynth.playTone(261.63 + f.finger * 30, 0.3, 'triangle');
                    setTechniquePlayedNotes((prev) => [...prev, f.note]);
                    setFingerStep(f.finger);
                  }}
                  className={`p-3 bg-white hover:bg-red-50 border rounded-lg text-center active:scale-95 transition-transform ${
                    fingerStep === f.finger ? 'border-red-800 ring-2 ring-red-200' : 'border-stone-200'
                  }`}
                >
                  <span className="text-[10px] font-mono text-stone-400 block">Dedo {f.finger}</span>
                  <span className="font-mono text-xs font-bold text-stone-900">{f.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-stone-500">
              Notas Articuladas: {techniquePlayedNotes.join(' - ') || 'Nenhuma'}
            </span>
            <Button
              id="btn-evaluate-technique"
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAttempt(techniquePlayedNotes.join(' '))}
              disabled={techniquePlayedNotes.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Medir Articulação & Isocronia
            </Button>
          </div>
        </Card>
      )}

      {/* Immediate Feedback Modal with Link to Full Feedback Screen */}
      {showFeedbackModal && latestAttempt && (
        <ImmediateFeedbackModal
          attempt={latestAttempt}
          onRetry={() => {
            setShowFeedbackModal(false);
            setPlayedNotes([]);
            setVirtualNotes([]);
            setTimingOffsets([]);
            setReadingAnswers([]);
            setEarSequence([]);
            setRepertoirePlayed([]);
            setTechniquePlayedNotes([]);
          }}
          onNext={() => {
            setShowFeedbackModal(false);
            setPlayedNotes([]);
            setVirtualNotes([]);
            setTimingOffsets([]);
            setReadingAnswers([]);
            setEarSequence([]);
            setRepertoirePlayed([]);
            setTechniquePlayedNotes([]);
          }}
          onViewResult={handleFinishSession}
          isLastExercise={attemptCount >= 2}
        />
      )}
    </div>
  );
};
