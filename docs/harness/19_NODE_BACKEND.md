# 19 — NODE BACKEND CONTRACT

Node is the application/backend authority for identity, profiles, academic data, community, rooms, entitlements, orchestration, metadata and API contracts.

## Modules
Auth; Users; Profiles; Academy; MusicGraph; Worlds; Practice; StudioMetadata; ScoreMetadata; Community; Rooms; Evidence; Credentials; Notifications; Admin; Entitlements; Search; Media.

## Service pattern
Controller/route → schema validation → authorization → application service → repository/domain → event/outbox → response.

## Background jobs
Media processing, audio proxy generation, score conversion, credential generation, analytics aggregation, notifications and Python engine jobs.

## Idempotency
Uploads, submissions, credential issuance, publishing and payment-related future endpoints require idempotency.

## API versioning
`/api/v1`. Breaking changes require version/ADR.
