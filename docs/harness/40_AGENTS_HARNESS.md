# 40 — AGENTS / HARNESS

## Agent roles
Architect: protects contracts. Product: protects user flows. UI: protects design system. Backend: protects domain/API. Engine: protects DSP/music correctness. QA: tries to break features. Security: threat-models. Content: protects provenance/IP. Release: protects reproducibility.

## Universal rules
1. Read relevant docs.
2. Search before creating.
3. Reuse existing abstractions.
4. Never duplicate a domain entity in a feature.
5. Never bypass API authorization.
6. Never silently change contracts.
7. Never mark incomplete tools as complete.
8. Test before/after.
9. Document architectural changes.
10. Leave repository cleaner than found.

## Do
Use typed schemas; small commits; feature flags; fixtures; adapters; dependency pinning; accessible components; deterministic tests.

## Don't
Do not hardcode user roles; do not put secrets in code; do not create fake engine outputs; do not clone competitor UI; do not embed huge data blobs in components; do not silently remove requested features.

## Completion report
Agent must report: files changed, contracts used, tests run, known limitations, new dependencies, license review needed, migrations, screenshots/routes validated.
