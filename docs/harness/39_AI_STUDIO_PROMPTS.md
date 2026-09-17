# 39 — AI STUDIO IMPLEMENTATION PROMPTS

## Prompt 00 — Read before coding
“Read the repository and all `/docs` contracts. Do not code until you produce a dependency map, identify existing implementation, list contradictions, and state which contract governs each decision. Never invent a replacement architecture.”

## Prompt 01 — Shell
“Implement only the application shell from 17_DESIGN_SYSTEM, 18_FRONTEND_ARCHITECTURE and 15_SCREEN_CATALOG. Create routes and empty/loading/error states for all canonical areas. Do not fabricate product content or decorative cards. Use typed contracts.”

## Prompt 02 — Auth/profile
“Implement signup/login/OAuth callback/profile setup/title selection/admin authorization according to 02, 31 and 32. Admin allowlist is server-side. Add tests for unauthorized role escalation.”

## Prompt 03 — Academy
“Implement Academy end-to-end using 22 and 16: catalog → course → lesson → activity → result → progress. Use seeded placeholder content only through the content schema; do not hardcode curriculum into components.”

## Prompt 04 — Practice
“Implement Skill Builder workflow using 23. Engine must be an adapter. Start with a mock deterministic engine contract, then replace with Python service without changing UI/domain contract.”

## Prompt 05 — Profile/evidence
“Implement unified profile lenses and evidence publishing using 02 and 30. Visibility must be server-filtered.”

## Prompt 06 — Community
“Implement Feed/Forums/Topics/Events/Connections without DM. Add report/moderation states.”

## Prompt 07 — Rooms
“Implement Room public/student/teacher views using 28. Teacher controls require capability.”

## Prompt 08 — Score
“Implement Score Studio around an engine abstraction. A blank score must support staff/clef/note input/playback/save/reopen before expanding.”

## Prompt 09 — Production
“Implement Production Studio as a real editor architecture, not a static mock. Build project state, timeline, track model, commands, autosave, undo/redo and audio engine adapter before visual polish.”

## Prompt 10 — Admin
“Implement admin console only after authorization contracts. Every mutation must be audited.”

## Prompt 11 — Quality pass
“Run all tests, inspect every route against SCREEN_CATALOG and SCREEN_CONTRACTS, enumerate missing states and incomplete functionality. Do not hide gaps.”

## Prompt 12 — Refactor gate
“Do not refactor for aesthetics. Identify duplicated domain logic, inconsistent state, missing types, security gaps and performance risks. Propose changes; implement only contract-compatible changes.”
