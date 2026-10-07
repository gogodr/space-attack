# Space Attack — Work Backlog

Status: first playable implementation built October 7, 2026. This backlog translates the [roadmap](ROADMAP.md) into implementation tickets using the approved [game plan](GAME_PLAN.md). Current ticket states are recorded below.

Role definitions and shared working rules: [agents/README.md](agents/README.md).

## How to use this backlog

- States: Todo → Ready → In progress → Review → Done; Blocked requires a named blocker and next action.
- The execution record below overrides the original Todo state. The lead marks subsequent work Ready when its dependencies and contracts are satisfied.
- One role is accountable per ticket; supporting roles review their interfaces. Assign a concrete session/person when claiming work.
- Size is relative effort, not a calendar estimate: S = focused change; M = several connected changes; L = integration-heavy work that may need subtickets.
- Every ticket requires its acceptance criteria, relevant verification evidence, and the shared handoff format before Done.
- “Depends” names completion prerequisites. Contracts may be designed together, but implementation must not assume unfinished interfaces are stable.
- The user's October 7 instruction authorizes development using this backlog and agent briefs. Public publishing remains a separate follow-up.

## Milestone mapping

| Roadmap milestone | Tickets | Exit |
| --- | --- | --- |
| 0 — Rules | SA-01 | Accepted decisions captured without contradictions |
| 1 — Foundation/collision prototype | SA-02–05 | Buildable SPA, contracts, verified fast collisions |
| 2 — Player/shooting | SA-06–07 | Horizontal controls and correct fire cadence |
| 3 — Formation/launches | SA-08–10 | Stepped group motion, alternating launches, enemy fire |
| 4 — Combat/lifecycle | SA-11–14 | Correct scores, damage, protection, transitions |
| 5 — Screens/HUD | SA-15–17 | Complete screen flows and reliable reset |
| 6 — Progression | SA-18–19 | Playable 15-level campaign with correct victory |
| 7 — Art/audio/performance | SA-20–22 | Integrated retro presentation and measured performance |
| 8 — Online leaderboard/release | SA-23–29 | Shared nickname scores and complete release evidence |

Leaderboard contracts are designed in SA-02. Backend work can begin after its listed foundation dependencies; it need not wait until presentation is complete. Final integration still follows the roadmap release gate.

## Foundation

### SA-01 — Normalize approved decisions

Owner: Technical Lead. Size: S. Depends: none.

Work: reconcile remaining historical “proposed” wording with accepted tuning; record confirmed clear/hit precedence, escape protection, finite campaign, and shared leaderboard scope. Keep new engineering choices distinct.

Acceptance: no active rule requires recycling, local-only ranking, endless levels, or hit-pause-before-clear; zero-lives precedence and nonfatal clear precedence are explicit. Verification: document consistency review against the latest user decisions.

### SA-02 — Define architecture and shared contracts

Owner: Technical Lead. Support: Gameplay, Physics, UI, Backend. Size: M. Depends: SA-01.

Work: define module ownership, typed state/events, input edges, fixed-step phases, physics candidate ordering, HUD snapshot, and leaderboard API contract. Select backend approach and record setup/deployment implications.

Acceptance: all consumers have agreed data shapes and authoritative owners; pause/countdown versus active-time clocks are explicit; run identity and idempotency are specified; no player account flow. Verification: review representative shot, escape, clear/hit tie, and submission sequences through the contracts.

### SA-03 — Scaffold the SPA and development checks

Owner: Technical Lead. Size: M. Depends: SA-02.

Work: create React/TypeScript app, install compatible stable Fiber/Three/Rapier dependencies, establish module layout, environment template, and type/build/test commands.

Acceptance: documented setup launches the SPA; production build and type checks pass; no secrets in client configuration. Verification: run actual setup/build commands and record versions/results.

### SA-04 — Build arena and simulation/physics shell

Owner: Physics / Rendering. Support: Gameplay. Size: M. Depends: SA-03.

Work: implement orthographic 20×28 arena, responsive letterboxing, zero gravity, locked gameplay plane, fixed 1/60 s step, and explicit collider groups.

Acceptance: resize preserves world bounds; stepping is independent of render FPS; no depth drift; pause stops world stepping. Verification: resize and reduced-render-rate scenarios, plus position/time assertions.

### SA-05 — Prove collision correctness

Owner: Physics / Rendering. Support: QA. Size: L. Depends: SA-04.

Work: prototype thin-target ship hits, opposing moving lasers, swept Rapier queries where needed, time-of-impact ordering, and candidate deduplication.

Acceptance: fastest configured lasers cannot cross targets undetected under tested low render rates; relative motion is accounted for; same-side interactions are excluded; cancellation wins exact ties; body/sensor configuration is demonstrated. Verification: reproducible integration tests and a visible collision prototype.

## Player and enemies

### SA-06 — Input and player movement

Owner: Gameplay. Support: UI. Size: M. Depends: SA-04.

Work: A/D and Left/Right movement, opposite-input cancellation, fixed bottom lane, collider-aware limits, focus handling, and input reset.

Acceptance: no vertical motion or side escape; W/S/Up/Down do not move the ship; gameplay keys do not scroll the page while playing; text entry is independent of gameplay. Verification: keyboard/focus/resize manual checks and movement-boundary tests.

### SA-07 — Player firing and projectile lifecycle

Owner: Gameplay. Support: Physics. Size: M. Depends: SA-05, SA-06.

Work: distinct tap edges, 0.20 s minimum shot gap, 0.24 s held cadence, key-repeat rejection, projectile IDs/cleanup, and 3× enemy laser speed.

Acceptance: tapping is faster than holding; toggling modes cannot bypass the minimum gap; spent/off-arena projectiles are removed; ratios hold across level configs. Verification: deterministic cadence tests and sustained-fire entity-count checks.

### SA-08 — Formation grid and longest-row turns

Owner: Gameplay. Support: Physics. Size: L. Depends: SA-04, SA-02.

Work: grid/slot IDs, discrete group steps, longest surviving row span, tie rule, downward turns, edge-step clamping, and shorter-row safety clamp.

Acceptance: reference recomputes after removals; internal holes do not shorten outer span; tied rows use the edge farthest toward travel; shorter offset rows stay inside without causing a turn; movement stays visibly stepped. Verification: deterministic full-row, hole, singleton, tied-row, and offset-row fixtures.

### SA-09 — Alternating launches and smooth descent

Owner: Gameplay. Support: Physics. Size: M. Depends: SA-08.

Work: lowest occupied row selection, left/right alternation across row changes, active-launch cap, continuous descent, and horizontal bounce.

Acceptance: first launch per level is left; singleton launches once; detach preserves world position; launches respect cap; launched enemies bounce inside collider-aware limits. Verification: sequence assertions and visual transition checks.

### SA-10 — Enemy fire and launch cues

Owner: Gameplay. Support: Art / Audio. Size: M. Depends: SA-07, SA-09.

Work: launched-only downward fire, initial warning/delay, per-level intervals, stable resettable fire timers.

Acceptance: formation enemies never shoot; lasers have no horizontal velocity; launch cues precede firing; pause/restart cannot leak shots. Verification: timer/direction tests and active scene inspection.

## Combat and run state

### SA-11 — Kills, cancellation, scores, and HP

Owner: Gameplay. Support: Physics. Size: L. Depends: SA-05, SA-07, SA-10.

Work: 1-HP kills worth 100; opposing-laser cancellation worth 50; consumed-entity guards; level/total scores; aggregate HP.

Acceptance: each kill/pair scores once; cancellations remove both lasers without changing enemy HP; score snapshots update both counters immediately; cleanup grants no points. Verification: duplicate callbacks, one-to-many overlaps, exact ties, and earlier-ship-hit scenarios.

### SA-12 — Escapes and hit/protection timing

Owner: Gameplay. Support: QA. Size: L. Depends: SA-11.

Work: 3 lives; permanent zero-score escapes; nonfatal hit freeze for 5 s; post-hit protection for 3 active seconds; escape protection refresh without pause; invulnerable contact/laser handling.

Acceptance: escapes reduce HP/count and one life each once; protection does not suppress escape penalties; repeated hit callbacks cannot stack damage; focus/manual pause freezes countdown; protection does not elapse on paused/transition screens. Verification: deterministic clock tests, simultaneous escapes, refresh behavior, and protected-player contacts.

### SA-13 — Outcome arbitration and level transitions

Owner: Gameplay. Support: QA. Size: M. Depends: SA-12.

Work: terminal outcome reducer, fatal precedence, nonfatal clear-before-hit-pause, residual projectile cleanup, and carried protection.

Acceptance: fatal damage always produces game over; clear plus nonfatal hit retains life loss, skips hit pause, and grants protection next level; reserves prevent early clear; final surviving clear routes to victory. Verification: explicit truth table covering final kill/escape with one or multiple lives, with/without simultaneous hit.

### SA-14 — Combat integration regression suite

Owner: QA / Balance. Support: Gameplay, Physics. Size: M. Depends: SA-11–13.

Work: independent scenarios joining real physics events to run-state resolution; reproducible fixtures for fast shots and competing outcomes.

Acceptance: scenarios verify behavior rather than mock away collision detection; failed cases report reproducible entity/timing setup; no duplicate score/life losses or stale projectiles. Verification: run suite under baseline and reduced rendering cadence.

## Screens and progression

### SA-15 — Screen shell and four-corner HUD

Owner: UI / Accessibility. Size: M. Depends: SA-03, SA-12, SA-13.

Work: loading/error/start/play/manual-pause/hit-pause/level-clear/game-over/congratulations screens and exact HUD layout.

Acceptance: keyboard-operated menus; readable 5-second countdown; level score/total/HP/ship lives in requested corners; HUD outside combat area; no rapid screen-reader score spam. Verification: focus traversal, screenshots at representative sizes, and state-driven screen checks.

### SA-16 — Restart and focus lifecycle

Owner: UI / Accessibility. Support: Gameplay, Physics. Size: M. Depends: SA-15.

Work: reset and resume flows, visibility handling, input clearing, entity/timer cleanup, fresh completed-run/submission state.

Acceptance: repeated restarts restore level 1, 3 lives, zero scores, no protection/old projectiles; hidden tabs cannot silently resume combat; form focus never fires weapons. Verification: repeated end-screen/restart cycles and focus loss during hit countdown/protection.

### SA-17 — Special victory presentation flow

Owner: UI / Accessibility. Support: Art / Audio. Size: S. Depends: SA-15, SA-13.

Work: distinct congratulations messaging, final score, Play Again, return-to-start, and leaderboard/submission slots.

Acceptance: victory differs clearly from defeat; fatal final damage never flashes victory; final run record stays immutable for later submission. Verification: final-level scenario fixtures and keyboard navigation.

### SA-18 — All 15 level configurations and reserves

Owner: Gameplay. Size: M. Depends: SA-09, SA-13.

Work: accepted progression formulas, 18→46 enemies, 36 visible formation capacity, safe reserve insertion from level 11, no level 16.

Acceptance: every level increases count and enemy speed/firing cadence; all enemies stay 1 HP; initial HP includes reserves; no occupied-slot insertion or premature clear; last level ends the run. Verification: all-config assertions and reserve-heavy late-level integration scenarios.

### SA-19 — Full-campaign balance pass

Owner: QA / Balance. Support: Gameplay. Size: L. Depends: SA-14, SA-16–18.

Work: playtest first five levels then the complete campaign, recording density, time-to-clear, life loss, launch fairness, and reserve behavior.

Acceptance: full campaign can complete without a progression fault; difficult patterns remain readable; tuning concerns are documented with reproducible evidence and proposed changes, not silently applied. Verification: recorded full-run notes plus late-level stress scenarios.

## Presentation

### SA-20 — Retro visual assets and integration

Owner: Art / Audio. Support: Physics, UI. Size: L. Depends: SA-04, SA-15.

Work: style sheet, player/enemy assets, laser distinction, backdrop, pixel-like textures, arcade typography, effects, and provenance manifest.

Acceptance: 16-bit-inspired look without historical hardware restrictions; ship/laser silhouettes remain readable; hitboxes align; effects do not obscure threats; sources/licenses are recorded. Verification: inspect integrated scenes, HUD, defeat, and victory at target viewport sizes.

### SA-21 — Retro audio and controls

Owner: Art / Audio. Support: UI. Size: M. Depends: SA-15, SA-17.

Work: music loop and shot/cancellation/explosion/countdown/defeat/victory cues, user-interaction audio initialization, independent music/effects controls, mute/pause behavior.

Acceptance: no required gameplay information depends on sound; pause behavior is correct; loops/cues do not clip or stack excessively; assets have provenance. Verification: audible playthrough and mute/focus/countdown checks.

### SA-22 — Performance and resource cleanup

Owner: Physics / Rendering. Support: QA. Size: M. Depends: SA-18, SA-20, SA-21.

Work: agree reference desktop/browser, profile maximum simultaneous load, cap catch-up work, and optimize measured bottlenecks.

Acceptance: measured results support the 60 FPS target on the agreed baseline or document concrete remaining failures; repeated restarts do not cause unbounded entity/resource growth. Verification: reproducible profile scenario with hardware/browser/settings and frame data.

## Shared online leaderboard

### SA-23 — Persistent schema and anonymous run registration

Owner: Backend / Leaderboard. Support: Technical Lead. Size: M. Depends: SA-02, SA-03.

Work: backend skeleton, schema/migration, anonymous opaque run IDs/tokens, environment configuration, and unique run submission constraint.

Acceptance: no user accounts; tokens are not public leaderboard data; schema persists across restarts; run registration returns typed errors; no secrets enter SPA bundles. Verification: migration/setup and registration integration tests.

### SA-24 — Ranked reads and idempotent submissions

Owner: Backend / Leaderboard. Size: L. Depends: SA-23.

Work: public top-10 API; explicit nickname submission; server timestamp; score/level/outcome/nickname validation; deterministic ordering; rate/request limits.

Acceptance: duplicate nicknames allowed; 2–20-character trimmed nickname default enforced; scores are nonnegative integers divisible by 50; completed means level 15; concurrent/retried submission creates one record; public responses exclude run credentials. Verification: positive/negative API tests, concurrency tests, and ranking ties. Document that these controls do not establish cheat-proof scores.

### SA-25 — Client service and anonymous run lifecycle

Owner: UI / Accessibility. Support: Backend, Gameplay. Size: M. Depends: SA-16, SA-23, SA-24.

Work: typed service client, start-of-run registration, completed-run snapshot, same-ID retry, and explicit registration-unavailable state.

Acceptance: registration failure does not block play; affected run cannot falsely appear submitted; each restart uses a new run identity; final score cannot change during submission. Verification: simulated registration failure, delayed responses across restart, and submission retry.

### SA-26 — End-screen leaderboard and nickname form

Owner: UI / Accessibility. Support: Backend. Size: M. Depends: SA-17, SA-25.

Work: leaderboard viewing and optional Submit Score on both end screens; nickname form; loading/empty/error/success states; accessible retry and skip/restart paths.

Acceptance: merely ending/viewing a run never submits it; no account/email/password requested; nickname is rendered as plain text; success requires server acknowledgement; declining or failure never blocks restart. Verification: both outcomes, keyboard form flow, duplicate click, errors, and successful retry.

### SA-27 — Cross-client integration and service readiness

Owner: Backend / Leaderboard. Support: QA, Technical Lead. Size: M. Depends: SA-24, SA-26.

Work: connect frontend/backend in a review environment; configure origin/environment values; document migrations, service setup, health checks, and credential handling.

Acceptance: a score from one client appears in another; data survives service restart; idempotency works end to end; failure paths stay usable. Verification: two independent browser clients and backend outage/recovery checks. Do not publish publicly or provision paid resources merely to close this ticket without applicable authorization.

## Release gate

### SA-28 — Final browser and end-to-end verification

Owner: QA / Balance. Size: L. Depends: SA-19, SA-22, SA-27.

Work: verify supported Chromium/Firefox/WebKit-based browsers where available, keyboard/focus/resize, full campaign, defeat/victory/restart, audio, and online ranking/submission.

Acceptance: no blocking combat/progression/reset/leaderboard faults; unsupported or untested environments are explicitly recorded; evidence covers both terminal outcomes and optional submission. Verification: reproducible test report with actual results and remaining defects.

### SA-29 — Integration sign-off and delivery instructions

Owner: Technical Lead. Support: all roles. Size: M. Depends: SA-28.

Work: close or explicitly track defects, review milestone exits, provide setup/build/backend/migration instructions, configuration templates, known limitations, and reviewable build handoff.

Acceptance: clean setup is reproducible; required checks pass; every required feature has evidence; account-free shared leaderboard is included; anti-cheat limitations are stated accurately; publishing remains a separately authorized follow-up. Verification: lead review of the complete evidence and clean setup smoke check.

## Scheduling guidance

Start with SA-01 → SA-02 → SA-03 → SA-04/05. Then independent ownership allows player/formation work, backend implementation after SA-03, and early asset design once the scene contract exists. Do not start shared-module edits concurrently without an ownership agreement. Integrate combat before balance work; complete cross-client leaderboard verification before the final release gate.

For each claimed ticket, append a short execution record with status, assigned session/person, changed files, verification evidence, blockers, and next action. The ticket definitions above remain the acceptance baseline.

## Execution record — October 7, 2026

Lead/integrator coordinated three specialist sessions using the prepared briefs: Gameplay Engineer, UI/Accessibility with Art/Audio, and Backend/Leaderboard with independent QA. Source ownership followed ARCHITECTURE.md. Implementation evidence and commands: [DEVELOPMENT.md](DEVELOPMENT.md), [VERIFICATION_QA.md](VERIFICATION_QA.md), browser screenshots, and the automated test suites.

| Tickets | State | Owner/session | Evidence and next action |
| --- | --- | --- | --- |
| SA-01–03 | Done | Lead | Approved rules recorded; typed contracts, lockfile, build, scripts and dependency audit complete |
| SA-04–05 | Done | Lead / Physics | Fiber arena and Rapier moving-shape queries; real collision regression suite and browser rendering pass |
| SA-06–13 | Done | Gameplay | 25 gameplay tests plus collision/integration suites verify controls, weapons, formation, launches, damage and outcome ordering |
| SA-14 | Done | Independent QA | Seven real-Rapier integration tests, including the 15-level deterministic campaign |
| SA-15–17 | Done | UI / lead | Chromium tests verify menus/HUD, hit countdown, restart, focus handling and terminal screens; screenshots visually inspected |
| SA-18 | Done | Gameplay / QA | All 15 configs, increasing difficulty, reserve drainage and no level 16 verified |
| SA-19 | In progress | QA / player playtesting | Deterministic campaign passes; complete human campaign/balance review remains |
| SA-20 | Review | Art/Audio / lead | Original voxel-style ship geometry and integrated retro presentation; final visual polish remains reviewable |
| SA-21 | Review | Art/Audio / UI | Original WebAudio music/cues and toggles integrated; subjective audible quality review remains |
| SA-22 | In progress | Physics / QA | Ship pixels merged into one draw per ship, split build chunks; agreed-device 60 FPS measurement remains |
| SA-23–26 | Done | Backend / UI / lead | Seven API tests and browser score-flow checks; server validation, persistence, idempotency, nickname-only submission and failure recovery pass |
| SA-27 | Review | Backend / lead | Two browser clients share service data; production SPA route tests pass; hosting configuration/HTTPS remains |
| SA-28 | In progress | QA / lead | Chromium and narrow-layout checks pass; additional browser/device and full human playthrough coverage remain |
| SA-29 | Todo | Lead | Setup instructions delivered; final release sign-off follows remaining QA/performance/hosting work |

There are no known blocking defects in the tested paths. Do not interpret deterministic fixtures as human difficulty verification or the local service as a publicly hosted online game.

## SA-30 — Component/module architecture refactor

State: Done. Owner: Technical Lead, with Gameplay, UI and Backend specialists. Requested October 7, 2026 after the first playable review. Depends: completed first-playable implementation.

Work: split the game and server into clear component/module responsibilities. Keep composition roots small; give screens/HUD/entities/visuals, gameplay systems, audio/client modules, and backend routes/services/repositories/middleware dedicated files. Format source and split CSS while preserving cascade. Document dependencies and future ownership.

Acceptance: public import/API contracts and gameplay/presentation behavior are preserved; there are no competing copies of the old implementation; database schema/data are unchanged; the new structure compiles and all existing behavioral/browser checks pass.

Evidence: `npm run build` passes; `npm test` passes 36 gameplay/physics checks and seven server checks; `npm run test:e2e` passes five Chromium checks. Architecture is documented in [ARCHITECTURE.md](ARCHITECTURE.md), and backend boundaries in [BACKEND_SETUP.md](BACKEND_SETUP.md). Preview restarted at http://127.0.0.1:5173. Original release/balance/performance gates remain as recorded above.
