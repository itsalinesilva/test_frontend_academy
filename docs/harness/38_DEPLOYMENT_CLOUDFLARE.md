# 38 — DEPLOYMENT / CLOUDFLARE

GitHub is source of truth. CI runs lint/typecheck/unit/integration/security scans and builds.

Cloudflare can provide DNS, CDN, WAF, rate limiting and edge protections. Application compute may run separately; do not force Python engines into edge runtime.

Environments: local → preview → staging → production.

Secrets are environment-managed, never committed.

Database migrations run as controlled release steps. Backups and restore drills are required before production.

Media storage uses object storage with signed access.
