# 05 — API / SECURITY / INFRASTRUCTURE

## Stack alvo
Frontend: React + TypeScript. Node.js/TypeScript API. PostgreSQL. Object Storage. Redis/queue opcional. Python engine services. Cloudflare DNS/WAF/CDN/edge quando aplicável. GitHub CI.

## Auth
Google OAuth/OIDC + e-mail conforme provedor escolhido. Sessões com tokens/secure cookies conforme arquitetura. Não confiar em claims client-side.

## Authorization
RBAC + capability + ownership + resource policy. Ex.: `room.create` exige teacher entitlement; `admin.users.read` exige admin role; child profile exige guardian/resource policy.

## API layers
Route → Auth → Authorization → Validation → Application Service → Domain → Repository → Event → Response.

## Python boundary
Node nunca importa diretamente código Python. `EngineGateway` chama serviço/worker Python por HTTP/gRPC/queue e recebe schema normalizado. Timeouts, retries, circuit breaker, versioning e fallback são obrigatórios.

## Media
Uploads assinados, content-type validation, size limits, malware scanning quando aplicável, transcoding assíncrono, object metadata, lifecycle policies.

## Segurança
OWASP baseline; CSRF quando aplicável; XSS/CSP; rate limits; secret manager; encryption in transit/at rest; audit logs; least privilege; dependency scanning; SAST; SBOM; backup/restore.

## Admin
Allowlist seed dos dois e-mails fundadores; role persistida; autorização no servidor; toda ação mutável gera audit record.
