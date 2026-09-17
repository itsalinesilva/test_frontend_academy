# 48 — UNIVERSAL UI STATES

Every data-driven screen must define:
- initial loading;
- skeleton/progressive loading when useful;
- empty with a meaningful next action;
- populated;
- processing for long-running operations;
- success confirmation;
- recoverable error;
- permission denied;
- unavailable/offline;
- stale data/sync conflict where applicable.

Do not use “Something went wrong” without recovery context. Do not show fake content while data is unavailable unless explicitly marked as sample/demo.
