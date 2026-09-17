# 63 — DATABASE CONTRACT

## Rules
UUID/opaque IDs; UTC timestamps; created/updated; soft deletion where required; foreign keys; unique constraints; indexes derived from query patterns.

## Versioned content
Course/lesson/exercise/score/project versions are immutable snapshots where historical correctness matters.

## Audit tables
Admin actions, moderation, credential changes, entitlement changes and important security events.

## Media
Database stores metadata and references; raw media belongs in object storage.

## Migration
Every migration reviewed; rollback/recovery plan; production backup before destructive migration.
