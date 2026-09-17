# 60 — SCORE ENGINE CONTRACT

## Canonical model
Score → Parts → Staves → Measures → Voices → NotationEvents.

## Operations
createScore, addPart, setClef, setKey, setTime, insertNote, insertRest, editEvent, deleteEvent, transpose, playback, import, export, validate.

## Determinism
Same score version + playback config should yield equivalent symbolic output. Renderer may differ but semantic model must remain stable.

## Error policy
Unsupported notation is explicit. Import warnings are retained with import record.

## Adapter
UI → ScoreService → ScoreEngineAdapter → selected engine. Engine can change without changing screen contract.
