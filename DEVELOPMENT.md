# Development handoff — first playable build

Built October 7, 2026 using the approved game plan, roadmap, backlog and agent briefs. Application source lives in this directory.

## Run

Requires Node 22.13+ (tested Node 22.23.1). In this project directory:

```powershell
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The development launcher starts Vite and the leaderboard API on port 3001. A/D or Left/Right moves; Space taps/holds fire; Escape pauses. Losing focus pauses the game. This is desktop-keyboard gameplay; narrow layouts work but no touch controls are included.

For production review:

```powershell
npm run build
npm start
```

Then open http://127.0.0.1:3001. The Node service serves both the built SPA and API. See BACKEND_SETUP.md for database persistence, host/port configuration, reverse proxy and HTTPS requirements.

## Implemented

React 19 + React Three Fiber 9 + React Three Rapier 2 render and simulate the arcade arena. Rapier swept moving-shape queries account for both projectile trajectories, including initial overlap and cancellation priority. All ship visuals are original voxel-style geometry merged into one mesh per ship; audio is original procedural WebAudio. Google Fonts supplies Barlow Condensed and DM Mono with local font fallbacks.

The game includes horizontal controls, faster tap fire, discrete formation steps determined by the longest row, alternating launches, smooth descent/bounces, enemy fire, 1-HP enemies, 100-point kills, 50-point laser cancellation, escape penalties/protection, hit countdown, invulnerability, reserves, all 15 levels, HUD, start/pause/clear/defeat/victory screens, restart, music/effects toggles, and end-screen nickname submission.

Leaderboard storage is shared service-side SQLite, not browser storage. Two clients connected to the same service see the same entries. Viewing never submits a run; explicit optional submission uses anonymous credentials and idempotent retries. Input correction is possible after a validation rejection. Network failure leaves play/results/restart usable. The game is currently served locally; worldwide access needs hosting. Client scores have basic validation and duplicate prevention, not authoritative anti-cheat.

## Verification commands

```powershell
npm run typecheck
npm run build
npm test
npx playwright install chromium
npm run test:e2e
npm audit
```

The browser suite starts its own test-mode Vite server on 5174 and API on 3002 with `work/browser-tests.sqlite`, separate from preview scores. A test-only engine hook enables deterministic end-screen fixtures; it is absent in normal development and production builds. Do not run two browser suites concurrently against the same ports/database. Screenshots are under `screenshots/`.

Completed verification: 36 gameplay/Rapier tests, seven API/SQLite integration tests, and five Chromium browser tests. Browser checks cover keyboard movement/fire, pause/focus loss, hit countdown/protection, defeat/victory screens, validation-error recovery, nickname submission, a second browser client's shared reads, restart, narrow viewport and backend outage. Production build and type checks pass. Dependency audit reports zero vulnerabilities.

Independent QA's deterministic campaign destroys 480 enemies across all 15 levels for 48,000 points. That fixture verifies mechanics, reserve drainage and transitions; it does not establish human balance or campaign fairness. See VERIFICATION_QA.md for the exact scenarios.

## Component/module refactor — October 7, 2026

The initial monolithic implementation has been reorganized into focused modules. `App.tsx`, `rendering/GameScene.tsx`, `simulation/GameEngine.ts`, and `server/app.mjs` now compose their respective layers. Individual screens, HUDs, render entities, visual assets, simulation systems, audio modules, client transport, server routes/services/repositories, and middleware have dedicated files. UI styles are readable, split by component/responsibility, and imported in the original cascade order.

The existing public import paths remain compatibility facades. Engine stepping/subscription contracts, API routes, database schema, scores, pause/protection rules, visual presentation, and nickname retry behavior are preserved. No gameplay tuning or schema migration was introduced.

Post-refactor verification: production build/typecheck passes; 36 gameplay/real-Rapier checks, seven server/SQLite checks, and five Chromium browser checks pass. Existing tests exercise the new modules through the same public contracts. The development preview was restarted at its existing URL to use the refactored backend. See [ARCHITECTURE.md](ARCHITECTURE.md) for module ownership and dependency directions.

## Remaining release work (unchanged)

- Human playtesting of the complete campaign, especially levels 11–15, followed by documented tuning changes if needed.
- Subjective audio review and final visual polish.
- Agreed reference-device performance measurement; no 60 FPS guarantee is claimed yet. Three.js and embedded Rapier WASM produce sizable vendor chunks; loading/performance should be measured on the deployment target.
- Additional browser/device coverage beyond tested Chromium and the 390px layout.
- Public hosting with HTTPS, persistent disk/database backup and correctly configured trusted proxy rate limiting. No public service has been provisioned.

Use BACKLOG.md's execution record to continue development. The first playable version is ready for review; SA-29 release sign-off remains open until the remaining gates are satisfied.
