# 10 — IMPLEMENTATION ORDER / PHASES 0–15

0. Repository/harness/ADR/CI/security baseline.
1. Design system + application shell + routing.
2. Auth, profile, roles, guardian and admin seed.
3. Domain model, database migrations, storage, events.
4. Academy core: catalog, course, lesson, progress.
5. Practice/Skill Builder core + attempt/progress engine.
6. Worlds/Atlas/Music Graph/passports/badges.
7. Community/forums/posts/events/connections.
8. Profile/evidence/portfolio.
9. Score Studio.
10. Audio/Production Studio.
11. Instrument/Voice/Ear/Tuner engines.
12. Rooms/Teacher/School.
13. Python engine services and normalized adapters.
14. Mobile native + offline sync + media workflows.
15. hardening, observability, entitlement/commercial layer, release.

## Rule
Vertical slices precede horizontal perfection. Every phase ships a coherent end-to-end path while engines become progressively deeper.

## Initial implementation strategy
Use AI Studio to generate the web frontend and Node backend skeleton. Integrate complex engines behind stable interfaces. Never allow generated UI code to become the domain authority.
