# 37 — OBSERVABILITY

Every request: request ID, actor ID where permitted, route, status, latency.

Metrics: API latency/error; auth failures; job queue depth; Python engine latency/error; audio processing; score processing; uploads; sync conflicts; E2E funnel events.

Logs: structured, redacted, no raw secrets, no unnecessary child data.

Traces: Node request → job → engine → storage where supported.

Alerts: error rate, latency, queue backlog, storage failures, engine outage, auth anomaly.
