# 43 — RELEASE GATES

Gate 0 repository reproducible.
Gate 1 auth/roles/admin secure.
Gate 2 database/backups/migrations.
Gate 3 core user vertical slice.
Gate 4 academic slice.
Gate 5 practice slice.
Gate 6 profile/community/evidence.
Gate 7 tools.
Gate 8 teacher.
Gate 9 mobile/offline.
Gate 10 security/performance/accessibility.

A gate fails if critical flow has fake data, unhandled error, data-loss path, unauthorized access, missing audit or broken mobile behavior where in scope.
