# 22 — BACKEND API CONTRACT

## Base
`/api/v1`

Success:
```json
{"data": {}, "meta": {}}
```

Error:
```json
{"error":{"code":"DOMAIN_ERROR","message":"...","details":{},"requestId":"..."}}
```

All endpoints validate input, enforce authorization, use stable IDs, paginate collections and avoid leaking internal errors.

## Identity
`POST /auth/session`
`POST /auth/link-google`
`GET /me`
`GET /me/entitlements`
`GET /me/permissions`

Administrator identities configured server-side:
- alinealv.silv@gmail.com
- office.alinesilva@gmail.com

## Profile
`GET /profiles/:userId`
`PATCH /profiles/me`
`GET /profiles/me/activity`
`GET /profiles/me/learning`
`GET /profiles/me/practice`
`GET /profiles/me/achievements`
`GET /profiles/me/credentials`
`GET /profiles/me/portfolio`
`GET /profiles/me/evidence`

## Academy
`GET /academy`
`GET /academy/catalog`
`GET /academy/courses/:courseId`
`GET /academy/courses/:courseId/curriculum`
`GET /academy/lessons/:lessonId`
`POST /academy/lessons/:lessonId/progress`
`POST /academy/assessments/:assessmentId/attempts`
`GET /academy/assessments/:assessmentId/results`
`GET /academy/history`
`GET /academy/certificates`

## Practice
`GET /practice`
`GET /practice/skills`
`GET /practice/skills/:skillId`
`GET /practice/exercises/:exerciseId`
`POST /practice/sessions`
`POST /practice/attempts`
`POST /practice/attempts/:attemptId/analyze`
`GET /practice/attempts/:attemptId`
`GET /practice/mastery`
`GET /practice/history`
`GET /practice/streak`
`GET /practice/ranking`

## Music engines
`POST /music/pitch/analyze`
`POST /music/rhythm/analyze`
`POST /music/timing/analyze`
`POST /music/intonation/analyze`
`POST /music/audio/features`
`POST /music/midi/parse`
`POST /music/musicxml/parse`
`POST /music/musicxml/render`

Large media jobs return job IDs.

## Score Studio
`GET /scores`
`POST /scores`
`GET /scores/:scoreId`
`PATCH /scores/:scoreId`
`POST /scores/:scoreId/revisions`
`POST /scores/:scoreId/import/musicxml`
`POST /scores/:scoreId/export/musicxml`
`POST /scores/:scoreId/render`

## Production Studio
`GET /studio/projects`
`POST /studio/projects`
`GET /studio/projects/:projectId`
`PATCH /studio/projects/:projectId`
`POST /studio/projects/:projectId/tracks`
`POST /studio/projects/:projectId/recordings`
`POST /studio/projects/:projectId/render`
`POST /studio/projects/:projectId/export`

## Teacher Rooms
`POST /rooms`
`GET /rooms/:roomId`
`PATCH /rooms/:roomId`
`GET /rooms/:roomId/students`
`POST /rooms/:roomId/members`
`GET /rooms/:roomId/courses`
`POST /rooms/:roomId/assignments`
`GET /rooms/:roomId/progress`
`POST /rooms/:roomId/events`
`GET /rooms/:roomId/analytics`

## Community
`GET /forums`
`GET /forums/:forumId/posts`
`POST /forums/:forumId/posts`
`POST /posts/:postId/report`
`GET /feed`
`POST /connections`
`GET /events`
`POST /events/:eventId/rsvp`

No direct messaging API.

## Gamification
`GET /gamification/worlds`
`GET /gamification/passports`
`GET /gamification/achievements`
`GET /gamification/credentials`
`GET /gamification/rankings`

XP/achievements derive from authoritative domain events.

## Knowledge/admin
`GET /knowledge/concepts/:id`
`GET /knowledge/sources/:id`
`GET /knowledge/provenance/:id`
`POST /admin/content/ingestion`
`POST /admin/content/generate-course`
`POST /admin/content/validate`

## Jobs
`POST /jobs`
`GET /jobs/:jobId`
`POST /jobs/:jobId/cancel`

Job records contain ID, type, owner, status, progress, retries, timestamps, errors and output references.

## Authorization order
Identity -> account state -> parent/child relation -> title/role -> entitlement -> ownership -> room membership -> moderation/safety -> admin permission.

## Contract tests
Every endpoint needs happy path, validation, auth, authorization, missing resource, conflict, persistence and retry/idempotency tests where relevant.
