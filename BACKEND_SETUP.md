# Shared leaderboard backend

Node.js **22.13 or newer** provides the built-in SQLite driver. Install the root project's dependencies, then use `npm run dev` for the Vite website and API together. Vite forwards `/api` to port 3001. Run `node --test server/*.test.mjs` for isolated HTTP/SQLite integration tests.

For a local production preview, run `npm run build`, then `npm start`. Express serves the built SPA and API on the same origin, including direct SPA route visits. No build output means API-only operation with an actionable 404. The Vercel deployment uses an Express API function and shared Neon Postgres instead of a local database file; see [DEPLOYMENT.md](DEPLOYMENT.md).

## Configuration

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3001` | API/production server port; Vite's local proxy expects this default |
| `HOST` | `127.0.0.1` | Listen interface; use `0.0.0.0` behind a hosting reverse proxy |
| `DATABASE_PATH` | `data/space-attack.sqlite` under the project | Persistent SQLite file; parent directories are created automatically |
| `DATABASE_URL` | Unset locally | Neon Postgres connection string; selects shared serverless storage when present; required on Vercel |

Keep `DATABASE_PATH` on persistent writable storage. Each deployment instance needs access to the same database to share scores. This implementation is intended for a single Node service on one host with local SQLite storage, rather than independent ephemeral replicas. Exclude the database and its `-wal`/`-shm` companion files from version control. Back up through SQLite's backup tooling or while the service is stopped; copying only the live main file can omit recent WAL data. Startup creates missing tables and indexes; there is no destructive reset.

Local/self-hosted operation does not trust forwarded headers by default. Vercel supplies HTTPS and trusted client forwarding; only there does the app trust one proxy hop. Postgres-backed rate counters retain per-client quotas across function instances. For another host, configure the actual trusted proxy topology before exposing the service.

## API

- `POST /api/runs` with `{}` returns HTTP 201 and `{id,token}`. Keep these credentials private for the current run; the database stores only a SHA-256 token digest.
- `GET /api/leaderboard` returns `{entries}` with up to 10 public records. Record fields are `id`, `nickname`, `score`, `level`, `completed`, and ISO `submittedAt`.
- `POST /api/leaderboard` accepts `{runId,token,nickname,score,level,completed}`. Initial success is HTTP 201 `{entry}`; an identical retry is HTTP 200 with the same entry. Conflicting retries are HTTP 409 and cannot overwrite a score.
- `GET /api/health` returns `{status:"ok"}` after checking database availability.

Nicknames are trimmed, contain 2–20 Unicode characters, reject controls, and need not be unique. Scores are safe nonnegative integers divisible by 50; levels are 1–15; successful completion requires level 15. Credentials are validated before submission, and one record per run is enforced atomically in SQLite. Public responses exclude run IDs and tokens. Error bodies are `{error:string}`; HTTP 400 indicates malformed fields/JSON, 403 invalid credentials, 413 oversized JSON, 429 rate limiting, and 500 a service failure.

Anonymous rate limits per client IP are 20 run registrations, 30 submission attempts, and 120 leaderboard reads per minute. JSON requests are limited to 4 KB. Nicknames must be displayed as plain text by clients. Play and final results must remain usable if registration or submission fails; the client must never fabricate a shared result.

These safeguards validate data and prevent duplicate submissions; browser-reported scores are **not cheat-proof**. Accounts and authoritative replay verification are outside this release's scope. Old anonymous registrations currently remain in the database; retention/cleanup should be configured with the hosting operation once usage is known.

## Module boundaries

`server/index.mjs` owns listening and graceful shutdown. `server/app.mjs` composes the application and exposes the existing `createApp({ databasePath, distPath, rateLimits })` test/embedding interface, returning `{ app, close }`.

| Module | Responsibility |
| --- | --- |
| `server/config.mjs` | Resolve application defaults relative to the project root |
| `server/database/connection.mjs` and `schema.mjs` | Open SQLite, configure pragmas, create existing tables/indexes additively |
| `server/repositories/runs.mjs` | Store anonymous registrations and read token hashes |
| `server/repositories/leaderboard.mjs` | SQL ranking, per-run lookup, inserts, and synchronous write transactions |
| `server/services/credentials.mjs` and `runs.mjs` | Generate credentials, hash/compare tokens, register runs |
| `server/services/submissionValidation.mjs` and `leaderboard.mjs` | Validate submissions, authenticate runs, project public data, enforce identical/conflicting retry behavior |
| `server/services/errors.mjs` | Expected request failures translated by HTTP middleware |
| `server/routes/health.mjs`, `runs.mjs`, `leaderboard.mjs` | HTTP request/response adapters |
| `server/middleware/` | Rate limits, error/404 responses, and production SPA serving |

Repositories receive their database connection; services receive repositories; routers receive services and rate-limit middleware. Business rules do not depend on Express. The leaderboard repository keeps the lookup and insert inside `BEGIN IMMEDIATE`/`COMMIT`, with rollback on failure and the existing unique constraint on `run_id`.

`database/storage.mjs` selects the storage adapter. The async service boundary works with both synchronous SQLite and asynchronous Neon repositories. The Postgres leaderboard repository uses `INSERT ... ON CONFLICT DO NOTHING`, followed by a separate lookup for retries so simultaneous requests see the committed winner. `PostgresRateLimitStore` uses atomic database upserts. Apply the additive Neon schema with `npm run db:migrate`; it never resets scores. `npm run test:postgres` verifies real shared storage in an isolated temporary schema.

The refactor preserves the on-disk schema and startup defaults. Existing databases remain compatible without migrations or resets. Run the HTTP integration suite after changes to verify public field projection, validation, ranking, persistence, concurrent retries, rate limiting, and SPA/API fallback boundaries.
