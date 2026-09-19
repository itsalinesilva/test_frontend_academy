# 21 — OPEN SOURCE / API CATALOG

## Purpose
Prevent reinvention and uncontrolled dependency selection.

Claude Code must evaluate existing libraries/APIs before implementing specialized capabilities.

## Required evaluation
For every production dependency record: package/repository, version, license, commercial compatibility, maintenance, security, documentation, performance, platform fit, alternatives, decision and rationale.

## Music/symbolic analysis
**music21** — candidate for symbolic music representation, music theory and computational musicology. Current repository documents BSD-3-Clause licensing. Use as an adapter, not as the whole music engine.

**librosa** — candidate for audio feature extraction and offline analysis.

**Essentia** — candidate for advanced audio/music information retrieval.

**aubio** — candidate for pitch/onset/beat/tempo processing.

**Mido / pretty_midi** — candidates for MIDI workflows.

## Score/notation
**OpenSheetMusicDisplay (OSMD)** — candidate for MusicXML rendering in browser/headless Node. It uses VexFlow and is not a complete interactive score editor. Use it for rendering, not as the entire Score Studio.

**VexFlow** — candidate for low-level browser notation rendering.

**Verovio** — candidate for engraving/rendering workflows.

**MuseScore ecosystem** — reference/integration target for professional notation formats and workflows; do not copy proprietary code/assets.

## Media
**FFmpeg** — baseline candidate for audio/video transcoding, extraction, conversion and rendering workers.

## ML
**ONNX Runtime** — candidate for portable inference.
**PyTorch** — candidate for custom ML/training/inference.

## Python services
**FastAPI** — candidate for internal typed Python service APIs.

## Node
Node.js + TypeScript are the primary application layer. Candidate frameworks/libraries include Fastify and schema validation such as Zod, subject to repository conventions.

## Data
PostgreSQL is the transactional source of truth.
Possible supporting technologies: Redis for cache/queues, pgvector for semantic retrieval, PostgreSQL full-text search, Neo4j only when graph workloads justify it.

## AI/external APIs
Potential adapters: Google OAuth, Gemini, email provider, object storage, payment provider later, monitoring/analytics. External providers must be isolated behind adapters.

## Governance
A dependency without a recorded license decision is not production-approved. Claude Code must re-check current versions/licenses at implementation time.
