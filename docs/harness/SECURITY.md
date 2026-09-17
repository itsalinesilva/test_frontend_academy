# SECURITY.md — Baseline

## Authentication

Use a trusted identity provider.

Email address must be verified according to the provider's authentication guarantees.

Do not implement password handling manually if a trusted authentication provider can provide it securely.

## Authorization

Authorization layers:
- authentication;
- role/mode;
- capability;
- ownership;
- membership;
- visibility;
- entitlement.

## Admin

The founding admin allowlist:
- `alinealv.silv@gmail.com`
- `office.alinesilva@gmail.com`

Must be enforced server-side.

## Owner isolation

The backend derives user identity from authenticated credentials.

Never accept an arbitrary owner ID as authority.

## Input validation

Validate:
- body;
- params;
- query;
- file metadata;
- MIME type;
- size;
- ownership;
- permissions.

## Files

Media uploads must use:
- controlled size;
- MIME validation;
- safe filenames;
- object storage;
- access control;
- temporary/signed access where appropriate.

## Secrets

Never place:
- API keys;
- database passwords;
- service credentials;
- private keys

in source code or public frontend variables.

## Rate limiting

Apply rate limiting to:
- authentication;
- public APIs;
- uploads;
- expensive tool operations;
- AI operations;
- engine jobs.

## Audit

Privileged actions must be auditable.

## Privacy

Do not expose private Evidence, Projects, recordings, profile sections or Room data outside the user's configured visibility and authorization.

## Initial commercial state

The system is free.

Do not implement fake purchase flows.

Entitlement infrastructure may exist as an architectural layer but must not create artificial paywalls during the initial free stage.
