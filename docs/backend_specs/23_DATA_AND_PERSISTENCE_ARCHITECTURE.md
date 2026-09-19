# 23 — DATA AND PERSISTENCE ARCHITECTURE

## Principle
The database is the durable representation of the learner's academic, musical, social and professional history.

## Relational domains
Identity, profile, Academy, Practice, mastery, gamification, community, rooms, Studio, Score Studio, credentials, provenance, jobs and audit.

## Object storage
Audio, video, source files, score exports, project assets, teacher materials and generated media.

Every media object stores owner, type, size, checksum where appropriate, visibility, provenance, timestamps and access policy.

## Identity
```text
User
 ├─ Account
 ├─ LoginIdentity[]
 ├─ Profile
 ├─ Entitlement[]
 ├─ Achievement[]
 ├─ Credential[]
 ├─ LearningHistory[]
 ├─ PracticeHistory[]
 ├─ PortfolioItem[]
 ├─ Evidence[]
 └─ RoomMembership[]
```

Email is an identity attribute, not the sole immutable database identity.

## Academy
```text
Program -> Path -> Course -> Module -> Lesson
Lesson -> Resource / Exercise / Assessment
```
Course versions must be supported so completed learning remains traceable to the content version used.

## Practice
```text
Skill -> MicroSkill -> Exercise -> ExerciseVariant
Exercise -> PracticeAttempt -> Measurement -> AnalysisResult
-> Feedback -> MasteryUpdate -> Evidence
```
Raw measurements and derived scores remain distinguishable.

## Evidence
Evidence stores user, activity, artifact, measurements, context, timestamp, visibility, provenance and verification state.

## Event model
Prefer durable domain events for:
- PracticeAttemptCompleted
- CourseCompleted
- AssessmentPassed
- ProjectPublished
- TeacherEvaluationRecorded
- ScoreCreated
- EvidenceVerified

Derived totals such as XP/rankings can be materialized but should be rebuildable where practical.

## Knowledge graph
Nodes: Source, SourceLocation, Concept, Competency, Objective, Lesson, Exercise, Assessment, Skill, Dependency, Course, Credential.

Relations:
`SOURCE_DESCRIBES_CONCEPT`
`CONCEPT_SUPPORTS_COMPETENCY`
`CONCEPT_PREREQUISITE_OF`
`LESSON_TEACHES_CONCEPT`
`EXERCISE_PRACTICES_CONCEPT`
`ASSESSMENT_MEASURES_COMPETENCY`
`SKILL_DEPENDS_ON_SKILL`
`CONTENT_DERIVED_FROM_SOURCE`

## Provenance
Store source, edition/version, page/chapter/section where available, rights/license, extraction/transformation method, reviewer and publication status.

Copyrighted sources are synthesized, not reproduced wholesale.

## Search
Start with PostgreSQL/full-text. Add vector search only when it materially improves knowledge retrieval/recommendations. Add graph DB only when graph queries justify it.

## Cache
Never use cache as the source of truth for permissions, grades, ownership, completion or financial state.

## Versioning
Version courses, lessons, exercises, assessments, scores, Studio projects, knowledge sources and generated content.

## Deletion
Soft-delete when history/audit requires preservation. Media deletion must clean object, DB reference, derived assets, indexes and caches.

## Migrations
All schema changes are migration-controlled and reviewable. No ad-hoc production schema edits.
