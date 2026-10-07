# QA integration verification

Date: October 7, 2026. Reference role: [QA / Balance Engineer](agents/QA_BALANCE.md).

## Executed checks

`npx vitest run tests/integration.test.ts` passed **7 tests** with Vitest 5.0.3 and real initialized Rapier WASM on Windows / Node 22.23.1.

| Scenario | Observed result |
| --- | --- |
| All 15 levels using actual level generation and Rapier collision candidates | All 480 enemies eliminated, 48,000 points, three lives retained, victory at level 15; a further tick never produces level 16 |
| Late-level reserve drainage | Levels 11–15 remain playing after destroying all initial visible enemies; reserve enemies remain counted, enter safe top positions, and can be destroyed to finish the level |
| Difficulty and laser speed across campaign | Every level adds two enemies and increases enemy horizontal/descent/projectile speed while shortening formation/launch/fire intervals; player laser speed remains exactly triple |
| Real simultaneous final enemy hit and player hit | Nonfatal damage loses one life, skips hit pause, clears the level, and preserves three seconds of protection into the next level; fatal damage produces game over |
| Equal-time laser cancellation and player hit, including initial static overlap | Cancellation takes precedence, despawns both projectiles, awards 50 points once, preserves life; duplicate candidates and repeated resolution cannot rescore |
| Real swept hit before a later possible cancellation | The earlier hit consumes the hostile laser, costs one life, starts hit pause, and awards no cancellation points |
| Final level's last escaped enemy with one protected life | Escape still costs that life, awards no points, eliminates the enemy, and causes game over instead of victory |
| Restart after full deterministic victory | Resets scores, level, lives, protection, timers, inputs, projectiles, effects, and enemy roster; entity generations differ and stale candidates cannot score |

The campaign fixture injects a short swept player beam at each visible enemy, then feeds the resulting real Rapier candidates into the unchanged engine. This is deliberately a deterministic integration fixture. It proves collision-to-score accounting, reserve drainage, and transition rules; **it is not a human playthrough or evidence of difficulty balance**.

## Issue discovered and resolved

Initial tests showed that Rapier's shape cast can return no hit for already-intersecting shapes with zero relative motion. The technical lead added a Rapier `intersectsShape` check at previous positions before the moving shape cast, yielding time of impact zero for initial overlaps. The integration test now explicitly exercises that case, including cancellation priority over a simultaneous player hit. The real moving-cast test also passes.

## Backend verification performed during implementation

`node --test server/*.test.mjs` passed **7 tests**. They exercise registration/public field privacy, hashed credential storage, malformed submission/credential/JSON/body rejection, concurrent identical retries, competing conflicting submissions, duplicate nicknames, deterministic tie ranking, top-10 limits, persistence after closing/reopening the service, rate limits, health checks, and Express 5 production SPA fallback. SQLite emitted Node's experimental-feature notice; no tests failed.

## Verification still required for release

Independent browser/device verification belongs to the integrator's browser report. These automated checks do not establish browser compatibility, keyboard focus behavior, WebGL initialization, music/mute behavior, HUD readability, or production performance. Do not describe unexecuted checks as passed.

Full human playthroughs of levels 1–5 and the entire 15-level campaign remain necessary to assess launch telegraphs, enemy firing density, fairness, and practical completion difficulty. No reference hardware or measured 60 FPS result is claimed here. Provider selection, persistent hosting storage, HTTPS, and cross-browser access to a deployed shared leaderboard remain operational release work. The local backend is ready for integration and retains scores across service restarts; no public deployment has occurred.
