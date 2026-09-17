# 59 — TOOL CONTRACT TEMPLATE

Every new tool must instantiate this document pattern.

## Identity
Name; category; purpose; audience; version.

## Capability
What the tool can do completely. What is deliberately out of scope.

## Inputs
Microphone, MIDI, keyboard, touch, file, score, project, camera where justified.

## Outputs
Audio, MIDI, score, metrics, visual result, evidence, project state.

## State
Idle → setup → calibrating → running → paused → processing → result → saved/error.

## Persistence
Autosave; version; attempt; recovery.

## Integration
Academy, Skill Builder, Profile, Evidence, Community, Room.

## Engine
Adapter interface, engine version, timeout, confidence, fallback.

## Accessibility
Keyboard, screen reader, alternative input, captions/visual feedback.

## Tests
Golden fixtures + functional + failure + performance + security.

## Completeness gate
A category expert should be able to perform the tool's primary real-world workflow without encountering a fake control or dead end.
