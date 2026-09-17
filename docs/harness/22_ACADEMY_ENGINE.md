# 22 — ACADEMY ENGINE / COURSERA-LIKE ARCHITECTURE

## Curriculum graph
Program → Path → Course → Module → Lesson → Activity.

## Course screen contract
Overview, learning outcomes, skills, prerequisites, curriculum, estimated effort, content provenance, progress, assessment policy, certificate policy and discussion.

## Lesson types
Reading; video; audio; interactive; score; quiz; practice; simulator; assignment; reflection.

## Progress
Completion is not equal to mastery. Store both `completion_state` and `proficiency_state`.

## Assessment
Question bank, attempts, scoring rules, feedback, remediation and retry. For music tasks, assessment may come from engine telemetry.

## Academic history
Immutable activity records plus derived progress views. Never lose history because a course version changes; bind records to content version.
