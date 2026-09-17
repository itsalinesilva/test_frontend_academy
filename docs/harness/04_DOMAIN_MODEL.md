# 04 — DOMAIN MODEL / CONTRACT

## Identidade
`User(id, email, auth_provider, status, created_at)`
`Profile(user_id, display_name, avatar_url, bio, headline, instruments, links, visibility_config)`
`RoleAssignment(user_id, role, status, source, granted_at)`
`GuardianLink(guardian_user_id, child_user_id, permissions, consent_state)`

## Academic
`Program`, `Path`, `Course`, `Module`, `Lesson`, `Activity`, `Assessment`, `Enrollment`, `ProgressRecord`, `Certificate`.

## Music graph
`World`, `Era`, `Composer`, `Work`, `Instrument`, `Technique`, `Skill`, `Concept`, `Method`, `Exercise`, `RepertoireItem`.

## Practice
`PracticeSession`, `PracticeAttempt`, `SimulatorSession`, `TelemetryEvent`, `PracticeResult`, `Recording`, `Annotation`.

## Studio
`Project`, `Track`, `Region`, `Asset`, `Take`, `Clip`, `MidiEvent`, `AutomationLane`, `PluginInstance`, `Bus`, `MixVersion`, `ExportJob`.

## Score
`Score`, `ScorePart`, `Measure`, `NotationEvent`, `PlaybackConfig`, `ScoreVersion`.

## Social
`Connection`, `Post`, `Comment`, `Forum`, `Topic`, `Event`, `RoomMembership`, `Reaction`, `Report`, `ModerationAction`.

## Teacher
`School`, `Room`, `RoomCourse`, `RoomModule`, `RoomLesson`, `Assignment`, `Submission`, `Attendance`, `LiveEvent`.

## Evidence
`Evidence`, `Artifact`, `PortfolioItem`, `Credential`, `Badge`, `Microcredential`, `EvidenceVisibility`.

## Entitlement
`Plan`, `Entitlement`, `Feature`, `UsageLimit`, `UserEntitlement`, `CapabilityGrant`.

## Admin
`AdminAudit`, `FeatureFlag`, `ContentStatus`, `ModerationCase`, `SystemHealthSnapshot`.

## Relações essenciais
User 1—1 Profile; User 1—N Roles; User N—N Connections; Profile 1—N Evidence; Evidence N—N Skill; Course N—N Skill; Exercise N—N Skill; Attempt N—1 Exercise; PracticeSession 1—N Attempt; Room 1—N RoomCourse; Professor N—N Room membership/ownership conforme capability; Artifact pode pertencer a Project, Practice, Score ou Lesson; Credential referencia Evidence.

## Invariantes
IDs imutáveis; timestamps server-side; ownership server-side; soft delete para entidades relevantes; versões para conteúdo/partituras/projetos; idempotency keys para operações de escrita críticas.
