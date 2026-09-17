# 61 — AUDIO ENGINE CONTRACT

## Capabilities
Capture, playback, decode/encode through permitted codecs, waveform generation, trimming, gain, fades, routing, mixing, rendering.

## Real-time vs offline
Real-time monitoring paths have strict latency budgets. Heavy processing is queued/offline.

## File model
Original asset immutable. Edits reference source plus non-destructive edit graph where possible.

## Safety
Validate media headers, duration, sample rate/channel limits, storage quotas and processing cost.

## Python bridge
DSP analysis/effects can be Python services. Browser must never call Python service directly.
