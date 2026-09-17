import { EntityId, ISOTimestamp } from './types';
import { VisibilityScope } from './identity';

/**
 * CREATION DOMAIN
 * Scores, revisions, compositions, digital audio workstations, multitrack mixing, MIDI, and renders.
 */

export enum ScoreStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TrackType {
  AUDIO = 'AUDIO',
  MIDI = 'MIDI',
  INSTRUMENT = 'INSTRUMENT',
  AUX_BUS = 'AUX_BUS',
  MASTER = 'MASTER',
}

export enum EffectPluginType {
  PARAMETRIC_EQ = 'PARAMETRIC_EQ',
  COMPRESSOR = 'COMPRESSOR',
  CONVOLUTION_REVERB = 'CONVOLUTION_REVERB',
  STEREO_DELAY = 'STEREO_DELAY',
  CHORUS = 'CHORUS',
  LIMITER = 'LIMITER',
}

export enum AudioRenderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ScoreRevision {
  id: EntityId;
  scoreId: EntityId;
  revisionNumber: number;
  authorId: EntityId;
  changeSummary: string;
  musicXmlData: string;
  midiData?: string;
  checksumSha256: string;
  createdAt: ISOTimestamp;
}

export interface Score {
  id: EntityId;
  ownerId: EntityId;
  title: string;
  subtitle?: string;
  composer: string;
  arranger?: string;
  lyricist?: string;
  keySignature: string;
  timeSignature: string;
  tempoBpm: number;
  clefs: string[];
  partCount: number;
  isPublic: boolean;
  visibility: VisibilityScope;
  status: ScoreStatus;
  currentRevisionId?: EntityId;
  version: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

export interface Composition {
  id: EntityId;
  userId: EntityId;
  scoreId?: EntityId;
  audioProjectId?: EntityId;
  title: string;
  genre: string;
  eraInspiration?: string;
  durationSeconds: number;
  instrumentation: string[];
  rightsStatus: 'ALL_RIGHTS_RESERVED' | 'CREATIVE_COMMONS' | 'PUBLIC_DOMAIN';
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface MidiEventData {
  tick: number;
  type: 'NOTE_ON' | 'NOTE_OFF' | 'CONTROL_CHANGE' | 'PROGRAM_CHANGE' | 'PITCH_BEND';
  channel: number;
  noteNumber?: number;
  velocity?: number;
  controller?: number;
  value?: number;
}

export interface AutomationPoint {
  tick: number;
  value: number; // 0..1 normalized
  curve: number; // -1..1 curvature
}

export interface AutomationLane {
  id: EntityId;
  trackId: EntityId;
  parameterName: 'volume' | 'pan' | 'send_a' | 'send_b' | 'plugin_param';
  points: AutomationPoint[];
  isEnabled: boolean;
}

export interface AudioEffect {
  id: EntityId;
  trackId: EntityId;
  pluginType: EffectPluginType;
  order: number;
  isBypassed: boolean;
  parametersJson: Record<string, number | string | boolean>;
}

export interface AudioTake {
  id: EntityId;
  clipId: EntityId;
  takeNumber: number;
  audioUrl: string;
  waveformData?: number[];
  recordingSessionId?: EntityId;
  rating?: number; // 1..5
  isSelected: boolean;
  recordedAt: ISOTimestamp;
}

export interface AudioClip {
  id: EntityId;
  trackId: EntityId;
  name: string;
  startTick: number;
  lengthTicks: number;
  offsetTicks: number;
  audioFileUrl?: string;
  midiEvents?: MidiEventData[];
  color: string;
  isLooping: boolean;
  selectedTakeId?: EntityId;
}

export interface MixerChannel {
  id: EntityId;
  projectId: EntityId;
  trackId: EntityId;
  faderLevelDb: number; // -inf to +6 dB
  panPosition: number; // -1 (L) to +1 (R)
  isMuted: boolean;
  isSolo: boolean;
  inputSource: string;
  outputBusId?: EntityId;
  sends: { busId: EntityId; sendLevelDb: number }[];
}

export interface AudioTrack {
  id: EntityId;
  projectId: EntityId;
  name: string;
  order: number;
  type: TrackType;
  isMuted: boolean;
  isSolo: boolean;
  volumeDb: number;
  pan: number;
  color: string;
  clipIds: EntityId[];
  effectIds: EntityId[];
  automationIds: EntityId[];
}

export interface AudioProject {
  id: EntityId;
  userId: EntityId;
  title: string;
  bpm: number;
  timeSignature: string;
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  trackIds: EntityId[];
  masterVolumeDb: number;
  isTemplate: boolean;
  visibility: VisibilityScope;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

export interface AudioRecording {
  id: EntityId;
  userId: EntityId;
  title: string;
  source: 'MIC' | 'LINE' | 'DAW_RENDER' | 'PRACTICE';
  durationSeconds: number;
  fileUrl: string;
  format: 'WAV' | 'FLAC' | 'MP3' | 'OGG';
  sampleRate: number;
  channels: 1 | 2;
  bitRateKbps?: number;
  evidenceId?: EntityId;
  createdAt: ISOTimestamp;
}

export interface AudioRenderJob {
  id: EntityId;
  projectId: EntityId;
  userId: EntityId;
  format: 'WAV' | 'MP3';
  qualityBitrate?: number;
  durationSeconds: number;
  outputUrl?: string;
  status: AudioRenderStatus;
  errorMessage?: string;
  createdAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
}
