# ADMIN.md — Administrative Surface

## Founding administrators

The initial server-side allowlist MUST contain exactly:

- `alinealv.silv@gmail.com`
- `office.alinesilva@gmail.com`

The implementation should make this configuration easy to move from code to environment/configuration without changing authorization logic.

Example conceptual configuration:

```text
ADMIN_EMAIL_ALLOWLIST=
alinealv.silv@gmail.com,
office.alinesilva@gmail.com
```

Do not expose secrets through frontend configuration.

## Access flow

```text
Google/Email authentication
        ↓
verified identity
        ↓
server resolves email/identity
        ↓
AdminAllowlist
        ↓
admin authorization
        ↓
Admin routes/API
```

Never:

```text
frontend email === admin
```

without server-side enforcement.

## Required Admin areas

### Overview
- active users;
- new users;
- active sessions;
- course activity;
- practice activity;
- content activity;
- errors;
- jobs;
- engine health;
- storage;
- API health.

### Users
- search;
- view;
- status;
- roles/modes;
- capabilities;
- profile;
- activity;
- evidence;
- reports;
- audit history.

### Academy
- programs;
- paths;
- courses;
- modules;
- lessons;
- activities;
- assessments;
- publishing state;
- provenance;
- content moderation.

### Skill Builder
- exercises;
- presets;
- tool definitions;
- attempts;
- results;
- engine status;
- failed processing jobs.

### Community
- posts;
- forums;
- reports;
- moderation;
- events;
- rankings.

### Rooms
- rooms;
- professors;
- members;
- courses;
- lessons;
- events;
- moderation.

### Studio
- projects;
- media;
- tool usage;
- processing jobs;
- failures;
- storage.

### Engines
- engine registry;
- versions;
- health;
- latency;
- error rate;
- job queue;
- last successful execution.

### Security
- authentication events;
- authorization failures;
- suspicious activity;
- rate limits;
- audit log.

### Configuration
- feature flags;
- catalog settings;
- tool availability;
- entitlements;
- system configuration.

## Audit

Every privileged mutation should record:
- actor;
- action;
- resource;
- timestamp;
- result;
- request correlation ID;
- relevant before/after state where appropriate.

Avoid logging secrets, access tokens, passwords or raw sensitive payloads.
