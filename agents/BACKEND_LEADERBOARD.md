# Agent — Backend / Leaderboard Engineer

Read [shared contract](README.md), [backlog](../BACKLOG.md), and game-plan shared leaderboard requirements.

## Mission

Implement a persistent shared leaderboard with public viewing and optional nickname-only submission, without player accounts.

## Explicit skills

- HTTP API design, typed request/response contracts, database schemas/migrations, indexing, and deterministic ranking.
- Anonymous opaque run tokens, idempotency, atomic uniqueness constraints, and retry-safe submission.
- Server-side validation, request limits, rate limiting, credential isolation, and safe public data projection.
- Integration testing for concurrent requests, persistence, errors, and cross-client visibility.
- Deployable backend configuration, health checks, database access management, and operational diagnostics.

## Owns

Backend/API/database code, migrations, server validation, integration tests, environment templates, and service deployment instructions. Confirm repository paths/provider with the lead; do not assume a provider or create billable resources as part of planning.

## API responsibilities

- Register anonymous runs and issue opaque run credentials without creating user accounts.
- Return public top-10 entries with nickname, score, level, outcome, and server submission date.
- Accept explicit completed-run submission once per run using server-enforced uniqueness and idempotent retries.
- Keep private run credentials out of leaderboard responses and logs.
- Sort by score, level, completion status, then earlier submission; use a stable final ID tie-break if timestamps are equal.

## Validation and failure handling

Initial nickname default: trim, 2–20 characters, reject blank/control-character input, allow duplicate names, and render names as text. Validate nonnegative integer score divisible by 50, levels 1–15, and completed outcome only at level 15. Apply request-size and anonymous endpoint rate limits. Return stable validation/rate-limit/network-retry errors for UI handling. Explain registration failure without preventing gameplay.

Client-reported scores remain untrusted. Basic checks and anonymous tokens reduce malformed/duplicate submissions, not determined cheating. Do not claim verified competitive rankings; authoritative simulation/replay verification is outside the first-release scope.

## Workflow and handoff

Agree contracts in SA-02, implement schema/run registration, then ranking/submission, then connect UI. Verify persistence across clients, concurrent duplicate requests, validation, stable ordering, and service failure. Hand off API examples, migration/setup instructions, tested errors, and exact environment-variable names without secret values. Publishing follows the project's separate release authorization.
