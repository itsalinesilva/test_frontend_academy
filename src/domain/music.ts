import { EntityId, ISOTimestamp } from './types';

/**
 * MUSIC DOMAIN
 * Instruments, acoustics, temperaments, repertoire, notation events, and physical/vocal performance telemetry.
 */

export enum InstrumentFamily {
  STRINGS = 'STRINGS',
  KEYBOARDS = 'KEYBOARDS',
  WOODWINDS = 'WOODWINDS',
  BRASS = 'BRASS',
  PERCUSSION = 'PERCUSSION',
  VOICE = 'VOICE',
  HISTORICAL = 'HISTORICAL',
}

export enum TemperamentSystem {
  EQUAL = 'EQUAL',
  MEANTONE_QUARTER_COMMA = 'MEANTONE_QUARTER_COMMA',
  WELL_TEMPERED_WERCKMEISTER = 'WELL_TEMPERED_WERCKMEISTER',
  JUST_INTONATION = 'JUST_INTONATION',
  PYTHAGOREAN = 'PYTHAGOREAN',
}

export enum VocalRangeClassification {
  SOPRANO = 'SOPRANO',
  MEZZO_SOPRANO = 'MEZZO_SOPRANO',
  CONTRALTO = 'CONTRALTO',
  COUNTERTENOR = 'COUNTERTENOR',
  TENOR = 'TENOR',
  BARITONE = 'BARITONE',
  BASS = 'BASS',
}

export interface InstrumentDefinition {
  id: EntityId;
  slug: string;
  name: string;
  family: InstrumentFamily;
  clefDefault: 'treble' | 'bass' | 'alto' | 'tenor';
  rangeMinMidi: number; // e.g. 21 (A0)
  rangeMaxMidi: number; // e.g. 108 (C8)
  transpositionSemitones: number;
  openStringPitches?: string[]; // e.g. ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  historicalPeriodOrigin?: string;
}

export interface InstrumentConfiguration {
  id: EntityId;
  instrumentId: EntityId;
  userId: EntityId;
  tuningReferenceHz: number; // 440, 415, 432
  temperament: TemperamentSystem;
  capoPosition?: number;
  customStringTunings?: string[];
  transpositionShift: number;
  updatedAt: ISOTimestamp;
}

export interface MusicalTechnique {
  id: EntityId;
  instrumentFamily: InstrumentFamily;
  name: string;
  description: string;
  difficultyLevel: 'iniciante' | 'intermediario' | 'avancado' | 'virtuoso';
  articulationSign?: string;
  audioExampleUrl?: string;
}

export interface RepertoireWork {
  id: EntityId;
  title: string;
  opusOrCatalog: string; // e.g. "BWV 846", "Op. 27 No. 2"
  composerId: EntityId;
  composerName: string;
  eraId: EntityId;
  instrumentId: EntityId;
  difficultyLevel: number; // 1..10
  movementCount: number;
  publicDomainStatus: boolean;
  scoreUrl?: string;
  audioReferenceUrl?: string;
}

export interface PedagogicalMethod {
  id: EntityId;
  title: string;
  author: string;
  instrumentId: EntityId;
  school: string; // e.g. "Escola Russa de Piano", "Tradição Francesa de Solfejo"
  volumeNumber?: number;
  totalExercises: number;
  publicationYear?: number;
}

export interface ExerciseNotationRecord {
  id: EntityId;
  exerciseId: EntityId;
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
  keySignature: string;
  timeSignature: string;
  measureCount: number;
  encodedMusicXml?: string;
  encodedVexflowJson?: string;
  svgPreviewMarkup?: string;
}

export interface PitchEventTelemetry {
  noteName: string;
  octave: number;
  frequencyHz: number;
  expectedFrequencyHz: number;
  deviationCents: number;
  timestampMs: number;
  durationMs: number;
  velocity: number;
}

export interface TimingEventTelemetry {
  targetBeat: number;
  actualTimeMs: number;
  expectedTimeMs: number;
  deviationMs: number;
  isRushed: boolean;
  isDragged: boolean;
}

export interface RhythmEventTelemetry {
  measureIndex: number;
  beatFraction: number;
  durationFraction: number;
  expectedDivision: number;
  actualDivision: number;
  accuracyPercentage: number;
}

export interface InstrumentalFingering {
  noteId: string;
  instrumentId: EntityId;
  fingerNumber: number; // 1..5
  hand: 'LEFT' | 'RIGHT';
  positionNumber?: number;
  stringNumber?: number;
}

export interface InstrumentStringSpec {
  instrumentId: EntityId;
  stringIndex: number;
  standardPitch: string;
  gaugeMillimeters: number;
  material: string;
  openFrequencyHz: number;
}

export interface VoiceSessionTelemetry {
  id: EntityId;
  userId: EntityId;
  classification: VocalRangeClassification;
  pitchRangeMinHz: number;
  pitchRangeMaxHz: number;
  formantFrequenciesHz: number[];
  vibratoRateHz: number;
  vibratoExtentCents: number;
  recordedAt: ISOTimestamp;
}
