# 41 — REPOSITORY STRUCTURE

`apps/web` React web app.
`apps/mobile` native mobile app.
`apps/api` Node API.
`services/engine-*` Python engine services.
`packages/contracts` shared schemas/types.
`packages/design-system` UI components/tokens.
`packages/music-domain` domain models/value objects where shared safely.
`packages/tool-sdk` Tool/Engine adapter contracts.
`packages/test-fixtures` music/audio/score fixtures.
`content/` structured authored content and provenance metadata.
`docs/` this package.
`infra/` deployment/Cloudflare/CI.

Keep generated files separate from authored source. Avoid circular imports between feature packages.
