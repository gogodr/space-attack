# Space Attack — Development Roadmap

Status: adopted development sequence; implementation underway. See BACKLOG.md execution record and DEVELOPMENT.md for current verification and remaining release work.
Date: October 7, 2026
Specification: [GAME_PLAN.md](GAME_PLAN.md)

Implementation tickets: [BACKLOG.md](BACKLOG.md). Role briefs and shared development contract: [agents/README.md](agents/README.md).

Milestones are dependency-based, not calendar promises. Complete each exit criterion before building features that depend on it.

## Milestone 0 — Agree on the game rules

Deliverables: reviewed game plan incorporating confirmed 1-HP enemies, longest-row boundary turns, alternating left/right launches, 3 lives, faster tapped than held fire, 5-second hit pause followed by 3-second invulnerability, a 15-level campaign, retro visuals/audio, and end-screen leaderboard viewing with optional submission. Escapes remove enemies, award no points, and deduct one life each; opposing-laser cancellations award 50 points.

Exit criteria:

- Required mechanics and proposed defaults are clearly distinguished.
- Level completion and enemy escape handling are compatible.
- Record accepted tuning and confirmed edge behavior: fatal damage goes directly to game over; escapes grant 3 seconds of protection without a pause; a clear precedes a nonfatal hit pause. Leaderboard viewing and optional nickname-only submission use shared online storage without player accounts.

Current status: gameplay tuning, edge behavior, and online leaderboard scope accepted; playable implementation exists. Backend uses Node/Express with persistent SQLite; public hosting selection remains release work.

## Milestone 1 — SPA foundation and collision prototype

Depends on: milestone 0.

- Scaffold React/TypeScript SPA and pin compatible Three.js, Fiber, and Rapier versions.
- Establish the fixed logical arena, orthographic camera, responsive canvas, DOM overlay, zero-gravity physics, and fixed simulation step.
- Prototype one ship, enemy, and fast projectile with explicit colliders/groups.
- Confirm collision events work for the selected body types and validate fast shots using Rapier shape casts if needed, including opposing lasers crossing between steps with relative motion accounted for.
- Add loading/failure states and development scripts for type checking, production build, and meaningful automated tests.

Exit criteria: a projectile reliably hits a thin target at both baseline and maximum planned speed, including under reduced rendering frame rates; resizing preserves world bounds; no dependency/runtime initialization errors.

## Milestone 2 — Player and shooting

Depends on: milestone 1.

- Implement fixed-height movement using A/D and Left/Right, neutral opposing inputs, and collider-aware side limits.
- Add Space firing with separate tap/hold cadence (proposed 0.20/0.24 seconds), ignoring browser key-repeat events and enforcing a global minimum shot interval. Include projectile cleanup and the exact 3:1 player/enemy laser speed relationship.
- Implement gameplay input focus, focus-loss pause, and input reset.

Exit criteria: the player cannot leave the arena or move vertically; rapid distinct taps fire slightly faster than holding; browser key repeat and tap/hold switching cannot bypass the minimum interval; scrolling is suppressed only while appropriate; movement and firing rates are stable across frame rates.

## Milestone 3 — Formation and launch behavior

Depends on: milestone 2.

- Spawn the level-1 multi-row grid with stable IDs and formation slots.
- Implement discrete horizontal ticks and downward edge steps; select the longest occupied row as the side-boundary reference for direction reversal. Implement the proposed row-span measurement, deterministic tie rule, recomputation after kills/launches, and safety clamp for offset shorter rows.
- Implement alternating bottom-row extreme selection, launch timers, and active-enemy limits.
- Transition selected enemies smoothly into descending movement with horizontal side bounces.
- Add launched-enemy downward fire and initial launch/fire cues.

Exit criteria: formation motion is visibly stepped while launched motion is smooth; the longest row determines turns and no enemy leaves the arena; test tied rows, internal holes, shorter offset rows, and changes to the longest row; launches alternate left/right across row changes; singleton rows never double-launch; detached enemies do not jump; only launched enemies fire straight down.

## Milestone 4 — Complete combat and life cycle

Depends on: milestone 3.

- Make every enemy exactly 1 HP and kill it on one player-laser hit. Resolve points, contact damage, and bottom escapes.
- On a nonfatal player hit without a simultaneous clear, deduct one life and freeze gameplay for 5 seconds with a countdown, then resume with 3 seconds of invulnerability measured in active simulation time. Freeze the countdown on manual/focus pause. Nonfatal escapes grant or refresh 3 seconds of protection immediately without pausing; protection never suppresses escape penalties. Fatal damage goes directly to game over.
- Implement opposing-laser cancellation: despawn both lasers and award 50 points to level and accumulated scores once per pair. Same-side lasers pass through each other. Resolve projectile impacts by time of impact, prioritize cancellation on exact ties, and prevent consumed lasers from producing further hits or points.
- Remove escaped enemies permanently, subtract their remaining HP from the enemy HP total, award no points, deduct one life each, and clean up their entities.
- Implement ordered event resolution, once-only scoring, and deterministic simultaneous-event outcomes.
- Add level-clear and game-over transitions with game-over precedence on zero lives. A clear takes precedence over a simultaneous nonfatal hit pause: retain the life loss, skip the pause, and carry 3 seconds of protection into the next level, or show congratulations directly after level 15. Transition screens do not consume protection time.

Exit criteria: every destroyed enemy scores once; a projectile hits at most one target; repeated callbacks do not duplicate damage; destroyed enemies cannot also escape; surviving escapes cost exactly one life each and never award points; escaped enemies are removed and reduce the HP bar once; lives never become negative; queued enemies prevent premature level clear; a final escape clears the level if lives remain, otherwise it triggers game over.

## Milestone 5 — Screens and requested HUD

Depends on: milestone 4.

- Build start, pause, hit-pause countdown, level-complete, game-over, and special congratulations screens, including restart/play again. Provide leaderboard viewing and optional submission controls on both end screens; connect persistence in milestone 8.
- Add level score top left, accumulated score top right, aggregate enemy HP bottom left, and ship-shaped life icons bottom right.
- Add the current level indicator, controls help, readable labels, and keyboard focus behavior.
- Ensure complete restart cleanup of simulation state and physics entities.

Exit criteria: full start → play → game over → restart and level-15 clear → congratulations → play again flows work without reload; hit countdown and protection feedback are readable; score reset/retention rules match the plan; HP reflects all living enemies; life icons track lives; repeated restarts leave no old entities, timers, or submission state.

## Milestone 6 — Progression and balance

Depends on: milestone 5.

- Implement the centralized level configuration formulas and persistent run score/lives.
- Limit the campaign to levels 1–15 and route a surviving final clear to congratulations. Never generate level 16.
- Add reserve-spawn handling for levels 11–15 under the proposed six-row formation capacity.
- Tune levels 1–5, then playtest the full campaign, firing density, and readability.
- Verify that each of the 15 levels increases enemy count and enemy movement/firing speed; retain exactly 1 HP per enemy throughout.

Exit criteria: clearing levels 1–14 starts the next with correct scores, lives, count, and speeds; clearing level 15 with lives remaining shows congratulations and preserves the final score; a fatal final escape shows game over; no level 16 exists; the 3:1 projectile speed ratio holds throughout; formations and reserves fit safely; no progression softlocks; the full campaign is playable under the chosen difficulty target.

## Milestone 7 — Retro presentation and performance

Depends on: milestone 6.

- Replace placeholders with original/licensed 16-bit-inspired ship art, pixel-like textures, crisp arcade typography, and a subdued space background, using modern rendering without historical hardware constraints.
- Add readable shot, cancellation, hit, death, launch, and transition feedback. Create retro arcade-inspired sound effects/music, a hit countdown cue, game-over sting, and special victory fanfare. Provide music/effects controls and mute; ensure visuals convey gameplay without audio.
- Check resize behavior, focus/keyboard navigation, reduced-effects preference, and unsupported-renderer messaging.
- Profile at maximum simultaneous entities on the agreed reference device; pool projectiles or reuse resources where profiling shows a need.
- Run the cross-browser smoke checks and production build.

Exit criteria: a complete multi-level run and restart work in supported browsers; no stale state, runaway entity growth, or known blocking collision faults; measured performance meets the agreed baseline; asset attribution is recorded if required.

Complete milestone 8 before considering the first release finished. Hosting/publishing is a separate follow-up decision after the playable build is reviewable.

## Milestone 8 — End-screen leaderboard and release verification

Depends on: milestones 5–7. Shared online storage is confirmed. This is required for the first release; individual player submission is optional. Design the API/database contract during foundation work so completed-run IDs can be integrated early.

- Select the backend provider and implement an HTTPS API plus persistent database for a shared top-10 leaderboard. Use public reads and nickname-only submission; do not add player accounts or login.
- Add anonymous server-issued run tokens/IDs, immutable final-run records, a unique submission constraint per run, and idempotent retries. Integrate anonymous run registration at game start; registration failure must not block gameplay, but makes that run ineligible for online submission with a clear explanation.
- Validate nicknames server-side (initial default: trimmed, 2–20 characters, no control characters), render them as plain text, and allow duplicate names. Enforce server timestamps, request limits, anonymous endpoint rate limits, valid levels/outcomes, and nonnegative integer scores in 50-point increments. Document that client-reported scores are not cheat-proof; authoritative score verification is separate scope.
- Define tie ordering: score descending, level reached descending, successful completion before defeat, then earlier submission.
- Add viewing on both game-over and congratulations screens. Allow players to inspect the list without submitting. Save only on an explicit Submit Score action, using an immutable completed-run ID and score to prevent duplicate submission.
- Show nickname and completion status alongside score, level, and date. Handle loading, empty lists, validation failures, submitted state, and retryable network errors without blocking restart. Require an explicit nickname submission action and server acknowledgement before displaying success.
- Run the final full-campaign, game-over, congratulations, optional-submission, and restart acceptance checks.

Exit criteria: scores submitted in one browser are visible in another; neither viewing nor submission requires an account; both end screens offer viewing and optional nickname submission; merely ending/viewing a run never submits it; retries and duplicate requests create at most one entry per run; records persist and sort consistently; validation/rate limits work; declining submission or network failure never blocks restart; the complete 15-level campaign passes release verification.

Backend deployment, database migrations, API configuration, and cross-origin configuration are part of this milestone. Keep infrastructure credentials out of the SPA. Public publishing remains a follow-up after the integrated build is reviewable.

## Verification strategy

| Layer | Meaningful checks |
| --- | --- |
| Pure game rules | Alternating launch order with holes/singletons/row changes; longest-row span/ties/boundary behavior; 15-level configuration progression and terminal level; exactly 1 HP; tap versus hold cadence and key-repeat rejection; 3:1 laser ratio; score reset rules; aggregate HP including reserves and excluding eliminated enemies; escapes never score |
| Physics integration | Body/group interactions; thin-target fast shots; opposing lasers crossing between steps at maximum relative speed; same-side lasers pass through; cancellation despawns both and scores exactly 50 once; consumed lasers cannot hit ships or cancel again; time-of-impact ordering and exact-tie cancellation priority; side bounces; hit/escape same-step ordering; duplicate event deduplication |
| Run integration | Nonfatal hit freezes gameplay for 5 seconds then grants 3 active seconds of protection; focus/manual pause freezes countdown; repeated hits do not stack life loss; fatal damage enters game over; nonfatal escapes refresh 3 seconds of protection without pausing or suppressing later escape penalties; clear plus nonfatal hit skips hit pause, retains life loss, and carries protection forward; final escape/kill at level 15 selects victory or game over correctly; duplicate escape events deduct once; reserves prevent early clear; full restart clears state; leaderboard viewing never auto-submits and repeated submission cannot duplicate a run |
| Online leaderboard | Cross-browser shared results; nickname-only submission; duplicate nicknames allowed; server validation and plain-text nickname rendering; stable ranking; idempotent retries; rate limits; anonymous registration failure; network errors and recovery; no credentials in client code |
| Browser/manual | Keyboard controls and menus; focus loss during hit countdown/protection; resize; HUD readability; full 15-level difficulty curve; retro art/audio and mute controls; game-over/congratulations leaderboard flows; production loading and frame performance |

Use deterministic initial conditions or seeded randomness for reproducing failures. Test behavior and state transitions rather than snapshots of implementation details. Do not add tests to this documentation-only phase.

## First release definition of done

- Required mechanics in the game plan are playable in one SPA using Fiber rendering and Rapier collision logic.
- The requested HUD, start screen, 5-second hit pause, 3-second post-pause protection, game-over screen, special congratulations screen, and restart are complete.
- Exactly 15 levels increase enemy numbers and speed while keeping all enemies at 1 HP; longest-row turns and alternating launches match the plan.
- Collision correctness, life-loss rules, score accounting, and restart behavior pass verification, including 50-point opposing-laser cancellations updating both scores without changing enemy HP or count; transition cleanup grants no cancellation points.
- No known issue prevents a player from completing multiple levels or starting a new run.
- Both end screens provide the shared online leaderboard and optional nickname-only score submission without player accounts.
- Retro 16-bit-inspired visuals and arcade-style audio are complete and readable during play.
