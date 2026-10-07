# Vercel deployment

**Production:** https://space-attack-mu.vercel.app. Deployed October 7, 2026; Vercel deployment `dpl_DEK2WG5ksm3DeibBL4DZYKYm9ZNt` is READY. Public homepage/API/database health, asset routing and real Chromium gameplay smoke checks pass. Evidence is retained in `screenshots/vercel-verification.json` and `screenshots/vercel-production-desktop.png`.

Space Attack uses Vercel for the Vite SPA and an Express API function. A free Neon Postgres database stores the shared, nickname-only leaderboard. The Vercel project is `gogodr/space-attack`; local `.vercel/project.json` records its link and is excluded from Git.

## Runtime and storage

`vercel.json` builds with `npm run build`, serves `dist/`, routes `/api/*` to `api/index.mjs`, and preserves static asset paths. SPA routes fall back to `index.html`; unknown API routes remain JSON 404s. The Node 22 API exports the Express app without opening a listening socket. Database credentials stay in server environment variables and are never exposed as `VITE_*` values.

`DATABASE_URL` selects Neon via HTTP queries. Without it, normal local development uses the existing SQLite file. A Vercel function refuses to start without `DATABASE_URL`, preventing accidental ephemeral leaderboard storage. Vercel's trusted forwarding hop supplies client IPs; shared Postgres rate counters enforce quotas across function instances and store hashed keys instead of raw IPs.

The additive Postgres schema uses `sa_runs`, `sa_entries`, and `sa_rate_limits`. Run tokens are hashed, one score per run is enforced by a unique database constraint, and concurrent identical/conflicting submissions retain the established retry semantics. The SQLite database is preserved. Local preview scores are not automatically copied into the new online leaderboard.

## Deployment commands

From this project directory, after Vercel login/project linking and Neon marketplace acceptance:

```powershell
npx vercel integration add neon --name space-attack-leaderboard --plan free_v3 --metadata region=iad1 --metadata auth=false
npx vercel env pull .env.local --environment production
npm run db:migrate
npm run test:postgres
npm test
npm run test:e2e
npx vercel --prod --yes
```

Provision the database only once. Reuse the connected resource for subsequent deployments. The free plan is explicit; no paid upgrade or auto-recharge is configured. Database and API use the `iad1` region. The CLI deploy path works independently of GitHub integration; automatic Git deployments require a GitHub Login Connection in Vercel and repository linking.

`npm run test:postgres` uses a uniquely named temporary schema in the connected Neon database and removes only that test schema afterward. It tests two API instances, persistence, token validation, concurrent retry handling, database constraints, and shared rate limits without adding test scores to the real leaderboard.

`.vercelignore` excludes art source sheets, screenshots, local databases, secrets, tests and project briefs from uploaded deployment sources. The runtime atlas remains in `public/assets/sprites/`. `.env*` files and `.vercel/` are excluded from version control. Keep previews isolated from production scores when testing future database changes.

## Verification and ongoing operation

After deployment, check `/`, `/api/health`, `/api/leaderboard`, unknown API paths, the sprite atlas, and a direct SPA route. Play and verify a game-over/victory screen, nickname submission, shared reads, and restart. Deployment smoke checks should not submit fabricated scores to the public leaderboard.

Human campaign balancing, broader browser/device coverage, and reference-device performance measurements remain follow-up work. Browser-reported scores are not cheat-proof. Configure database backups and review free-plan usage in the connected Neon/Vercel dashboards as traffic grows.

Official references: [Vercel Express](https://vercel.com/docs/frameworks/backend/express), [Vercel integration CLI](https://vercel.com/docs/cli/integration), [Vercel request headers](https://vercel.com/docs/headers/request-headers), [Neon driver](https://github.com/neondatabase/serverless).

## Codex Sites deployment

Space Attack is also deployed at https://space-attack-arcade-gogodr.thegogodr.chatgpt.site (owner-private). Sites hosts the same Vite SPA; its browser requests use the Vercel API and existing Neon database, so scores are shared between both deployments. No database credentials are copied into the Sites frontend.

The separate Sites checkout is `../space-attack-sites`. Its `.openai/hosting.json` records project `appgprj_6ac66384e02881918064947c6768a106`; `scripts/build-sites.mjs` builds with the public `VITE_API_BASE_URL`. Source commit `9879f969e672ead6209f225511de07526ba6302a` was pushed and packaged with the bundled Sites workflow. Deployment `appgdep_6ac6658981d4819194fc2fbf30ccd7f1` succeeded on October 7, 2026.

Vercel production `CORS_ORIGINS` allows the exact Sites origin. The API supports GET/POST/OPTIONS, does not grant credentialed CORS, and preserves existing run-token and rate-limit behavior. Future Sites changes must be made in its checkout, built, pushed and published through the Sites workflow; changes in this Vercel checkout do not automatically sync there. Keep the API origin allowlist aligned with the actual successful Sites URL.
