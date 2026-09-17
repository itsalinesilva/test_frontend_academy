# 13 — DEFINITION OF DONE

A feature is not done when it renders.

## Functional
Happy path; validation; persistence; authorization; loading/empty/error/success/processing/offline states; undo/redo where editing; autosave where relevant; recovery; import/export where category requires it.

## Quality
Unit + integration + contract + E2E + accessibility + performance + security tests appropriate to risk.

## Tool completeness
A tool is complete only when its canonical workflow can be performed end-to-end, results are trustworthy, state survives reload, errors are recoverable, media/notation/audio are handled correctly, and outputs integrate with profile/evidence where relevant.

## Academic
Prerequisites, progression, assessment, feedback, source provenance and completion must be coherent.

## Kids
Guardian controls, safe defaults, age-appropriate language, privacy, moderation and continuity of history.

## Release
No critical security issue; no data-loss path; migrations reversible or backed up; observability present; docs updated; ADR created for architectural change.

A SCREEN IS NOT COMPLETE WHEN:

- it renders;
- it looks polished;
- buttons exist;
- mock data appears.

A SCREEN IS COMPLETE ONLY WHEN:

UI
+
UX FLOW
+
DOMAIN MODEL
+
DATA CONTRACT
+
API
+
BUSINESS LOGIC
+
PERMISSIONS
+
PERSISTENCE
+
ERROR STATES
+
EMPTY STATES
+
LOADING STATES
+
RESPONSIVE BEHAVIOR
+
ACCESSIBILITY
+
ANALYTICS
+
TESTS
+
INTEGRATION