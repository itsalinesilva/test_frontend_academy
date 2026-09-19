# 26 — ASYNC WORKERS AND JOBS

## Purpose
Keep heavy processing out of ordinary HTTP requests.

## Job families
Music: audio, pitch, rhythm, timing, voice, MIDI, MusicXML, score rendering, audio rendering.
Media: transcoding, waveform, thumbnails, extraction, conversion.
Knowledge: ingestion, OCR, extraction, embeddings, graph construction, course generation, assessment generation, validation.
Platform: rankings, analytics, search indexing, cleanup, exports.

## State machine
```text
QUEUED -> RUNNING -> SUCCEEDED
             |-> RETRYING -> FAILED
QUEUED -> CANCELLED
```

Every transition is recorded.

## Job record
ID, type, owner, input references, status, progress, attempt count, timestamps, worker, engine/model version, error and output references.

## Idempotency
Retries must not duplicate certificates, XP, evidence, media, payments or score revisions. Use idempotency keys or deterministic job identities.

## Queue requirements
Retries, dead-letter handling, concurrency limits, priority, cancellation, observability and scheduling.

## Worker security
Never execute unrestricted user-controlled shell commands. External media tools use safe argument construction and controlled environments.

## Progress
Only report measurable progress. Do not fake percentages.

## Failure classification
Transient, permanent input error, dependency failure, timeout, authorization, unsupported format or internal bug. Automatically retry only retryable failures.

## Suggested priority
1. realtime user-critical
2. interactive user processing
3. classroom/assessment
4. content generation
5. indexing/analytics
6. maintenance

## Reconciliation
Detect orphaned media, incomplete analyses, stale jobs, inconsistent progress and failed indexing.

## Recovery
Worker restarts must not corrupt state. Jobs resume or retry safely.
