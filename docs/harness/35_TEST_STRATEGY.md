# 35 — TEST STRATEGY / QUALITY ENGINE

## Unit
Domain rules, scoring, entitlement, progression, visibility, provenance, parsers.

## Integration
API + database; storage; queues; Python adapters; authentication; authorization.

## Contract
Node ↔ frontend; Node ↔ Python; external APIs; storage; media.

## E2E
Signup; profile; academy enrollment; lesson; exercise; practice recording; score creation; production save; publish evidence; forum post; Room create; student submission; admin action.

## Tool-specific golden tests
Audio fixtures for pitch/timing; MIDI fixtures; score fixtures; deterministic expected outputs with tolerance ranges.

## Non-functional
Accessibility WCAG target; performance budgets; mobile; offline; security; load; media stress; data recovery.

## Regression rule
Every production defect becomes a regression test where practical.
