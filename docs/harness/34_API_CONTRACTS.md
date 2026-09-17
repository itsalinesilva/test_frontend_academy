# 34 — API CONTRACTS

## Canonical resources
`/auth`, `/users`, `/profiles`, `/academy`, `/worlds`, `/works`, `/instruments`, `/skills`, `/exercises`, `/practice`, `/studio/projects`, `/scores`, `/voice`, `/community`, `/forums`, `/rooms`, `/evidence`, `/credentials`, `/admin`.

## Response envelope
Successful writes return resource + metadata/requestId/version where useful. Errors use stable `code`, `message`, `details`, `requestId`.

## Pagination
Cursor-based for feeds, topics and large collections.

## Validation
Schema-first validation at API boundary. IDs and enums are server-defined.

## Contract tests
Frontend generated/typed client must test against mock/contract server and selected integration environment.
