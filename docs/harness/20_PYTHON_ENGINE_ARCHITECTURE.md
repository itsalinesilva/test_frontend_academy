# 20 — PYTHON MUSIC ENGINE ARCHITECTURE

Python is used where specialized scientific/audio/music libraries materially improve correctness or development efficiency.

## Candidates
music21: symbolic music/theory/score analysis. librosa: audio analysis. Essentia: audio/music descriptors. numpy/scipy: numerical processing. pretty_midi/mido: MIDI. soundfile/pydub: audio I/O. aubio: pitch/onset. pedalboard or equivalent: effects. FluidSynth/ecosystem: synthesis where licensing/architecture permit.

## Engine contract
Input schema → validation → deterministic processing where possible → normalized result → provenance/version metadata.

Example result:
`engine_version, request_id, status, metrics, segments, warnings, confidence, artifacts, processing_ms`.

## Never
Do not expose arbitrary Python execution to users. Do not let the engine define entitlements or user ownership. Do not couple UI to a specific library.

## Reliability
CPU/memory limits; timeout; queue; retries; deterministic test fixtures; golden audio/MIDI fixtures; engine version pinning.
