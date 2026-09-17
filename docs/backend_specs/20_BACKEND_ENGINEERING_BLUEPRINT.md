# 20 — BACKEND ENGINEERING BLUEPRINT

## Purpose
This document tells Claude Code what backend must exist for the music platform. It is an implementation specification, not a suggestion list.

## Authority
MASTER PRODUCT SPEC > DOMAIN MODEL > ARCHITECTURE > UX/API CONTRACTS > BACKEND SPECS > CODE.

## Non-negotiable rules
1. Implement real functionality; no fake scoring, placeholder engines, static progress, or mock APIs in production.
2. Reuse mature open-source libraries/APIs before reinventing specialized functionality.
3. Never copy proprietary code, assets, text, databases, or private implementation details from reference products.
4. Wrap third-party libraries behind adapters.
5. Every capability needs domain model, persistence, API contract, authorization, error states, observability, and tests.
6. Authorization and entitlements are server-side.
7. Node/TypeScript owns application/domain orchestration; Python owns DSP, audio, symbolic-music, ML and heavy processing.
8. Long-running work is asynchronous and observable.
9. Preserve educational source provenance.
10. Architecture must support future paid Student/Musician/Professor entitlements even if the initial system is free.
11. Do not remove difficult capabilities; preserve their contract and document blockers.
12. Do not invent product behavior already defined by product documents.

## Reference architecture
```text
React/Web/Mobile
      |
Node/TypeScript API + BFF
      |
      +-- Identity/Auth
      +-- Domain services
      +-- Community/Profile/Academy/Rooms
      +-- Realtime
      +-- Storage/Search
      +-- Job orchestration
      |
PostgreSQL + Object Storage + Cache
      |
Python service/workers
      +-- Audio/DSP
      +-- Pitch/Rhythm/Timing/Intonation
      +-- MIDI/MusicXML
      +-- Notation analysis
      +-- Practice evaluation
      +-- Knowledge/content ingestion
      +-- Media processing
      +-- ML/AI
```

## Node/TypeScript
Owns auth/session integration, authorization, domain rules, transactions, REST APIs, realtime events, Profile, Academy metadata/progression, community, Teacher Rooms, admin, storage metadata and job orchestration.

## Python
Owns pitch/rhythm/timing/intonation, audio analysis, voice analysis, MIDI/MusicXML processing, computational musicology, practice evaluation, media processing, model inference, content ingestion and heavy jobs.

## Required domains
Identity; Entitlements; Academy; Practice; Worlds/Gamification; Profile/Portfolio; Community; Teacher Room; Production Studio; Score Studio; Instruments/Voice/Tuner; Knowledge/Content; Admin/Audit.

## Cross-domain chain
```text
Source -> Concept -> Competency -> Objective -> Lesson -> Exercise
-> Attempt -> Measurement -> Feedback -> Mastery -> Evidence
-> Achievement/Credential -> Profile -> Academic/Practice History
```

## Core backend entities
User, Account, LoginIdentity, Profile, Entitlement, Program, Path, Course, Module, Lesson, Resource, Assessment, Quiz, Attempt, Certificate, Skill, MicroSkill, Exercise, PracticeSession, Measurement, Feedback, MasteryState, Streak, World, Passport, Achievement, Credential, Project, Recording, Score, Evidence, Forum, Post, Event, Room, RoomMembership, Assignment, Material, StudioProject, Track, Clip, AutomationLane, ScoreRevision, Source, SourceVersion, LicenseRecord, Concept, Competency, Dependency, ProvenanceLink, Job, AuditLog.

## Security
Never trust client role, plan, ownership, score, completion, or parent relationship. Validate identity, entitlement, ownership, room membership, parent-child permissions, admin permissions and resource access on the server.

## Storage
Relational DB for domain state. Object storage for audio/video/score/project assets. Cache only derived/temporary state.

## Realtime
Use only where needed: live practice feedback, room/live-class events, job status and explicitly supported collaborative features.

## Observability
Track API latency/errors, job duration/failure, engine version/confidence, queue depth, storage failures, external API failures, authorization denials and security/audit events.

## Implementation order
1. Identity/auth
2. Database/domain foundation
3. API/authz
4. Academy
5. Practice
6. Profile/evidence
7. Gamification
8. Community
9. Teacher Room
10. Media/storage
11. Music engines
12. Score Studio
13. Production Studio
14. Knowledge/content
15. Workers
16. Admin/operations
17. Integration/security/performance testing

## Definition of Done
A backend capability is done only when domain model, persistence, API, authz, business rules, states, history/audit behavior, tests, observability and documentation exist.
