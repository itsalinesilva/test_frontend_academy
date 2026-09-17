# 18 — FRONTEND ARCHITECTURE

Feature-based TypeScript architecture.

`app/` shell, routing, providers. `features/academy`, `worlds`, `community`, `studio`, `practice`, `rooms`, `profile`, `admin`. `components/` design system. `lib/` cross-cutting. `api/` typed clients. `state/` server/cache/local state.

## Rules
Pages compose feature modules; pages do not own domain logic. Components consume typed view models. API responses are validated at boundaries. Domain calculations are not implemented in JSX.

## State
Server state: query/cache layer. UI state: local. Long-running editors: dedicated state machine/store. Offline queues: explicit mutation queue.

## Routing
Authorization and entitlement are checked server-side; frontend guards are UX only.

## Media
Use streaming/previews and background processing. Never load entire raw media unnecessarily.

## Editor architecture
Score and Studio use command-based editing where possible: command → validate → apply → history → persistence/event.
