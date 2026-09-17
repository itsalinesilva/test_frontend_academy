# 16 — SCREEN CONTRACTS

Every screen contract uses the same schema:

`purpose → actor → entry points → required data → layout regions → primary action → secondary actions → state machine → permissions → mutations → events → persistence → responsive behavior → accessibility → analytics → tests → exit paths`.

## Example: Course Detail
Purpose: allow a learner to understand and enter a course.
Actor: authenticated user; Kids variant uses simplified copy.
Data: course metadata, outcomes, prerequisites, curriculum, instructor/author, duration, skills, progress, source/provenance summary.
Regions: breadcrumb/context, title, outcomes, skills, curriculum, progress, CTA, materials, discussion.
Primary action: Enroll/Continue.
States: loading, available, enrolled, completed, unavailable, unauthorized, error.
Events: course.viewed, course.enrolled, course.continued.

## Example: Lesson
Regions: lesson header, content, media, activity, navigation, notes/materials, progress.
Exit: previous/next/module/course/Academy.

## Example: Simulator
Setup: instrument, exercise, level, method/preset, input device.
Runtime: score/visualization, input feedback, transport, pause/restart, calibration.
Result: pitch/timing/accuracy/coverage metrics, feedback, retry, save evidence, publish.

## Example: Production Project
Regions: project header, browser, timeline, tracks, editor, mixer, transport, inspector, version status.
Must support autosave, undo/redo, recovery and non-destructive editing.

## Example: Teacher Room
Public view and teacher-management view are distinct route capabilities but same Room entity. Student sees course/community/events; teacher sees management controls.

## Example: Profile
Header + selected lenses. Public profile uses server-approved visibility. Owner sees private controls and edit actions.

## Example: Admin
Admin pages must show scope, filters, search, pagination, audit context, confirmation for destructive operations and role-aware controls.

## Must Have on ALL Screens: 

SCREEN ID
SCREEN NAME
DOMAIN
USER TYPE
ENTRY POINTS
EXIT POINTS
PURPOSE
PRIMARY JOB
SECONDARY JOBS
INFORMATION HIERARCHY
LAYOUT
COMPONENT TREE
DATA REQUIRED
API REQUIRED
ACTIONS
STATES
PERMISSIONS
RESPONSIVE BEHAVIOR
ACCESSIBILITY
ANALYTICS
RELATED ENTITIES
RELATED SCREENS
REFERENCE PATTERNS
ANTI-PATTERNS
ACCEPTANCE CRITERIA
TEST CASES