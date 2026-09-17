# 36 — SECURITY / PRIVACY

Threat model assets: identity, child data, private profile data, media, project files, credentials, admin actions, source/IP metadata.

Controls: least privilege; server authorization; secure cookies/tokens; CSP; CSRF strategy; rate limits; input/output encoding; upload scanning; secrets management; audit; backups; deletion/export workflows.

Child mode requires privacy-by-default and policy/legal review before public launch.

Do not expose internal engine endpoints directly to browsers.

Do not trust user-provided role/title, score, credential or achievement claims.
