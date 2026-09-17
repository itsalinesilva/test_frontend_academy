# 27 — INSTRUMENT SIMULATORS

## Simulator contract
A simulator must represent the meaningful control model of the instrument category, not merely play samples.

## Violin example
Staff/note → string candidates → position → finger → intonation target → bow timing → audio feedback. Suzuki level presets can configure exercise/repertoire when rights permit.

## Guitar
Staff/tab → string → fret → fingering → chord/scale → timing → sound.

## Piano
Staff → key → octave → fingering → hand → chord → timing.

## Winds
Note → fingering model → register/breath target → timing → pitch.

## Percussion
Notation → limb/sticking → subdivision → timing → dynamics.

## Voice
Pitch target → vocal input → contour → timing → feedback.

## Input modes
MIDI, microphone, touch/keyboard, camera-assisted features only when reliable and privacy-compliant.

## Engine/UI separation
Simulator UI handles visualization and controls. Engine handles detection/physics/scoring. Tool adapter normalizes output.
