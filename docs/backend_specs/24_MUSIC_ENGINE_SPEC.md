# 24 — MUSIC ENGINE SPEC

## Objective
Provide real music functionality for practice, creation, notation and feedback. Engines are domain services, not UI simulations.

## 1. Pitch Engine
Input: microphone/audio/reference.
Output: timestamped pitch, note, cents deviation, confidence, contour, stability.
Modes: realtime and batch.

## 2. Rhythm Engine
Onsets, beat alignment, duration comparison, tempo estimation and rhythmic deviation.

## 3. Timing Engine
Onset timing, latency, tempo adherence and synchronization against a reference.

## 4. Intonation Engine
Contextual pitch/timing evaluation for sustained and musical phrases.

## 5. Audio Feature Engine
RMS/energy, spectral features, onset, tempo, silence and pitch-related features.

## 6. Voice Engine
Pitch tracking, range, stability, onset and sustained-note evaluation. It must not make medical diagnoses.

## 7. Tuner Engine
Realtime pitch, nearest target, cents deviation, stability and instrument-specific tuning profiles.

## 8. MIDI Engine
Parse/create/edit/serialize/analyze MIDI. Quantization only when explicitly requested.

## 9. MusicXML Engine
Parse, validate, normalize, transform and export MusicXML using a canonical score model.

## 10. Notation Engine
Canonical score objects: score, part, staff, measure, voice, note, rest, chord symbol, dynamic, articulation, lyric, layout and playback metadata.

Rendering may use OSMD/VexFlow/Verovio adapters. A renderer is not the complete editor.

## 11. Instrument Evaluation
Generic pipeline:
```text
Expected event -> observed event -> feature extraction
-> instrument-specific comparison -> score -> feedback
```
Instrument-specific modules can support strings, piano, guitar, winds, percussion and voice where signal quality permits. Never fabricate unsupported fingering/string detection.

## 12. Practice Evaluation
Inputs: exercise definition, expected score, attempt, measurements, instrument context.
Outputs: accuracy, pitch/rhythm/timing, completeness, errors, feedback, mastery delta and evidence.

## 13. Exercise Generation
Generate variants from structured templates and constraints. Every exercise has objective, skill, difficulty, expected result, evaluator, provenance and version.

## 14. Mastery Engine
Inputs: attempts, correctness, difficulty, confidence, recency, repetition and teacher evaluation.
Outputs: mastery state, next review, difficulty adaptation and progression.
The algorithm must be versioned/configurable.

## 15. Playback
Convert canonical score/MIDI representation to playback events. Browser playback may be client-side; server rendering is used for export/analysis.

## 16. Audio rendering
Use established media/synthesis libraries instead of implementing codecs from scratch.

## 17. Measurement contract
```json
{
  "timestampMs": 1234,
  "durationMs": 250,
  "expected": {},
  "observed": {},
  "metrics": {},
  "confidence": 0.97
}
```
Measurements are immutable after analysis; corrections create a new analysis version.

## 18. Realtime vs batch
Realtime: tuner, basic pitch feedback and low-latency practice.
Batch: uploaded recordings, long analysis, video, rendering and heavy ML.

## 19. Calibration
Every engine needs synthetic fixtures, known reference recordings, tolerance tests, noise tests and regression datasets.

## 20. Versioning
Persist engine version, model version, configuration, input artifact, output artifact and timestamp for every analysis.

## 21. Adapter rule
Libraries are replaceable implementations behind stable domain interfaces. Benchmark specialized libraries before committing to production.
