# 33 — MOBILE OFFLINE / SYNC

## Local data
Cache courses/lessons, practice presets, selected score data and pending attempts where safe. Media can use resumable downloads/uploads.

## LocalStorage
Web/mobile may use local storage only for non-sensitive preferences/cache. Sensitive auth tokens require platform-secure storage.

## Sync
Client mutation has idempotency key + client timestamp + server revision. Conflict policy differs by entity.

## Conflict
Profile text: latest/merge policy. Practice attempts: append-only. Score/project: versioned merge or explicit conflict UI. Credentials: server authoritative.

## Offline UX
Show sync state; never claim upload completed until server confirms.
