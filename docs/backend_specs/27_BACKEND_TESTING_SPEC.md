# 27 — BACKEND TESTING SPEC

## Goal
Verify product behavior, not just HTTP status codes.

## Test pyramid
```text
Unit -> Domain/Service -> API Contract -> Integration
-> Engine -> End-to-End -> Performance/Security
```

## Unit tests
Domain rules, mastery, entitlements, permissions, XP/achievement rules, validation, score transforms, provenance and job state.

## API contract tests
Every endpoint: valid, invalid, unauthenticated, unauthorized, wrong owner, missing resource, conflict, pagination, persistence and retry/idempotency where applicable.

## Integration slices
Academy: login -> catalog -> course -> lesson -> assessment -> completion -> certificate -> profile.
Practice: login -> skill -> exercise -> input -> analysis -> feedback -> mastery -> achievement -> profile.
Teacher Room: professor -> room -> assignment -> student -> attempt -> progress.
Score: create -> edit -> playback -> revision -> export -> portfolio.
Studio: project -> track -> recording/import -> edit -> render/export.
Knowledge: source -> concept -> lesson -> exercise -> assessment -> publication -> provenance.

## Music engine tests
Pitch: clean tones, instrument, voice, vibrato, noise, silence, octave ambiguity.
Rhythm: metronomic, swing, syncopation, tempo changes, noisy onset.
MIDI: parse, serialize, round trip, timing, ordering, tempo, instruments.
MusicXML: parse/export/round trip, clefs, key/time signatures, voices, dynamics, articulations, tuplets, parts.
Notation: visual regression on representative scores.

## Practice evaluation
Use reference performances plus controlled pitch/rhythm/timing errors, incomplete input, silence, corrupt media and low-confidence analysis.

For fixed input + engine version + configuration + exercise version, results should be deterministic unless the engine explicitly declares nondeterminism.

## Knowledge tests
Verify source metadata, page/chapter references, concept extraction, provenance, copyright-safe transformation, correct lesson-source mapping and acyclic prerequisite graphs where required.

## Authorization
Test Student, Musician, Professor, parent, child, room owner, room member, admin and unauthenticated users.

## Security
Test broken access control, IDOR, injection, malformed media, upload abuse, rate limits, token misuse, privilege escalation, unsafe worker arguments, sensitive-data leakage and audit integrity.

## Async
Test enqueue, status, success, retry, failure, cancellation, duplicate submission, worker restart, idempotency and dead-letter behavior.

## Persistence
Test migrations, transactions, constraints, versioning, soft delete, cleanup, concurrent updates and optimistic locking where needed.

## Performance
Measure API latency, concurrent practice, realtime pitch processing, media upload, score rendering, job throughput, rankings and search. Establish budgets from real measurements.

## Release gate
No unresolved critical authorization issue, fake domain score, fake persistence, undocumented engine/job, critical migration/security failure or unexplained data loss.

## Regression rule
Every production bug produces a failing test, fix, passing regression test and documentation update when architecture/contracts change.
