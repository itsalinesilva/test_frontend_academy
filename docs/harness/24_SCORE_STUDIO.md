# 24 — SCORE STUDIO

## Required capability
Create/open a score; choose instruments; staff; clef; key signature; time signature; note/rest input; duration; accidentals; ties/slurs; dynamics/articulations; measures; voices; playback; tempo; MIDI; edit; undo/redo; save/version; print/export/import where licensing/engine supports.

## Modes
Write, Play, Arrange, Engrave, Practice, Perform, Analyze.

## Practice integration
A score can become an exercise. It can map notes to simulator input, timing targets and playback.

## Architecture
Score model is independent of renderer. Renderer can use open-source notation engine/library. Playback is separate service. Score versions are immutable snapshots plus command history as needed.

## Quality gate
A user must be able to open a blank staff, select clef, enter notes, hear them, edit them, save and reopen without loss. This is minimum completeness, not the final feature set.
