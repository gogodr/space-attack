# Space Attack — Game Plan

Status: approved specification; implementation started October 7, 2026.
Date: October 7, 2026
Development sequence: [ROADMAP.md](ROADMAP.md)

## 1. Concept and scope

Space Attack is a single-player, Space Invaders-inspired browser game contained in a single-page application (SPA). The player pilots a spaceship anchored near the bottom of the arena, dodges downward laser fire, and shoots upward to destroy successive enemy formations.

Use React Three Fiber (`@react-three/fiber`) for the game scene and `@react-three/rapier` for collision logic. Present 3D objects in a fixed, front-facing, orthographic view with gameplay constrained to a 2D plane. React DOM renders menus and HUD overlays.

The first release includes the start screen, complete combat loop, 15 increasingly difficult levels, requested HUD, game-over screen, a special congratulations screen after level 15, restart, and a leaderboard accessible from both end screens with optional score submission. Implementation is authorized and underway; public hosting follows the reviewable build and release checks.

## 2. Required gameplay

- Enemies begin at the top in multiple rows. The formation moves side to side and down as a group in slow, clearly marked steps. The longest row reaching a horizontal arena limit determines when the group reverses direction.
- Enemies detach starting at the bottom horizontal extremes. Launched enemies descend smoothly while moving horizontally and bouncing off the arena sides.
- Only launched enemies shoot small lasers straight down.
- An enemy laser hitting the player costs a life. An enemy reaching the bottom alive also costs a life.
- The player moves horizontally along a fixed bottom lane and fires lasers straight up. Player lasers travel exactly three times as fast as enemy lasers.
- Destroying enemies earns points. Escaped enemies are also considered eliminated, but award no points and cost one life each. Once all enemies are destroyed or escaped, advance the level if lives remain; otherwise enter game over.
- All enemies have exactly 1 HP and die from a single player-laser hit. Subsequent levels contain more enemies and faster enemy behavior, up to a final level 15. Clearing level 15 with lives remaining shows a special congratulations screen.
- Controls support A/D or Left/Right for horizontal movement and Space to shoot. W/S and Up/Down have no movement effect because the ship is anchored vertically.
- Top left: level score. Top right: accumulated score. Bottom left: enemy HP bar. Bottom right: remaining lives represented by player-ship icons.
- Include a start screen, a game-over screen with Restart, and a congratulations screen. Both end screens let the player view the leaderboard and optionally submit the completed run's score.

## 3. Confirmed rules and initial tuning

The user has accepted the tuning values and implementation interpretations in this plan as the initial baseline. They remain adjustable through later playtesting, but are no longer pending decisions. The edge rules and shared online leaderboard requirements below supersede earlier proposals.

| Topic | Initial proposal |
| --- | --- |
| Starting lives | Confirmed: 3 per run. Proposed: no replenishment between levels |
| Enemy durability | Confirmed: every enemy has 1 HP and dies in one hit |
| Scoring | Proposed: 100 points per destroyed enemy. Confirmed: 50 points per player/enemy laser cancellation. No points for nonlethal hits, escapes, or survival |
| Firing | Confirmed: hold Space for repeat fire; repeated distinct taps can fire slightly faster. Proposed minimum intervals: 0.24 seconds held, 0.20 seconds tapped |
| Player damage | After a nonfatal hit, pause for 5 seconds then grant 3 seconds of invulnerability, unless a simultaneous clear takes precedence. Nonfatal escapes grant protection without pausing; fatal damage goes directly to game over |
| Enemy contact | A launched enemy touching the ship causes damage through the same player-hit rule |
| Escaped enemies (confirmed) | Remove the enemy permanently, award no points, and deduct one life |
| Formation at bottom | Every surviving enemy that crosses the bottom threshold counts as an escape and is removed |
| Pause | Escape toggles pause; losing window focus pauses and clears held inputs |
| Visual direction | Confirmed: retro, 16-bit-inspired art without actual 16-bit graphics constraints, plus audio reminiscent of arcade space games |

Confirmed escape rule: an enemy reaching the bottom alive is considered eliminated. Remove it permanently, award no score, and deduct one life. Both destroyed and escaped enemies count toward level completion. An escaped enemy's remaining HP is removed from the aggregate enemy HP bar. There is no recycling or re-entry mechanic.

Invulnerability suppresses projectile/contact damage but does not suppress escaped-enemy penalties. Each nonfatal escape deducts one life and grants or refreshes invulnerability to 3 seconds of active simulation time without pausing gameplay. Durations do not stack. Several distinct escapes may therefore cost several lives even during protection. Lives are always clamped at zero; a fatal escape goes directly to game over.

On a valid projectile/contact hit, deduct one life, consume the hitting laser if applicable, and enter a 5-second hit-pause state if lives remain and the level was not cleared in the same step. Freeze enemy/player movement, physics, firing, launch clocks, and all gameplay timers; only the visible countdown advances. Resume with 3 seconds of invulnerability measured in active simulation time. Additional hit callbacks in the same step must not deduct additional lives. A fatal hit enters game over immediately. Escapes grant 3 seconds of protection without a pause. For a simultaneous clear and nonfatal hit, apply the life loss but prioritize the clear: skip the hit pause and carry 3 seconds of protection into the next level. On level 15, show congratulations directly instead. Zero lives always takes precedence over any clear, including the final level.

Manual pause or loss of focus also freezes the hit-pause countdown. Resume the countdown only after the player returns and resumes; do not silently restart combat in a hidden tab.

For firing, ignore browser-generated key-repeat events. A fresh Space keydown attempts a tap shot, subject to a proposed global 0.20-second minimum gap since any shot. Keeping Space down produces subsequent shots at a proposed 0.24-second interval. Releasing and pressing again allows the faster tap cadence without bypassing the global limit. This makes rapid deliberate tapping up to 20% faster than holding. Clear held input on pauses and require a fresh press on resumption.

## 4. Formation and launch rules

1. Spawn a centered grid with stable enemy IDs, row/column slots, and a shared formation anchor.
2. On each formation tick, move the anchor one horizontal step. Do not interpolate this movement into a smooth drift.
3. Use the longest occupied row as the boundary reference. Proposed precise interpretation: measure each row's horizontal span from the outer collider edge of its leftmost surviving formation enemy to the outer collider edge of its rightmost; internal holes do not shorten that span. Recompute after kills and launches. For equally long rows, use the tied row farthest toward the current travel direction. When this reference reaches the arena side, take one downward step and reverse the group on the next formation tick. Shorten a final horizontal step to meet the boundary exactly if needed. Apply a safety clamp to all surviving formation members so an offset shorter row can never leave the arena; that clamp does not itself cause a reversal.
4. At each launch interval, choose the leftmost surviving enemy of the lowest occupied formation row, then the rightmost on the next interval. Alternate sides and recompute candidates after kills or launches.
5. If only one enemy remains in that row, select it once. Move to the next occupied row only after the lower row has no formation enemies.
6. Detach at the enemy's current world position with no jump. Descend at constant vertical speed and move horizontally at constant speed; reverse horizontal direction at the sides without changing downward speed.
7. Give launches an initial direction toward the center. A sole centered enemy alternates initial direction. Start firing after a short telegraphed delay, then use the level's firing interval.
8. Cap simultaneous launched enemies for readability. When the cap is reached, delay further launches. Formation movement continues.

Only enemies still in formation participate in selecting the longest row; launched and reserve enemies do not. Keep the existing formation direction if no formation enemies remain, and select a new reference when reserve enemies enter. Formation enemies can be shot but do not fire. Left/right launch alternation is confirmed and persists across row changes, resetting to left at the start of each level.

## 5. Combat, score, and level resolution

Each player laser damages at most one enemy and is then removed. Enemy lasers disappear on hitting the player or leaving the arena. When a player laser collides with an enemy laser, both cancel each other and despawn, awarding the player 50 points once for that pair. These points increase both the level score and accumulated score immediately. Lasers from the same side do not collide, and enemies do not collide with one another. A contact-damaging enemy remains alive but cannot repeatedly damage the invulnerable player.

For each fixed simulation step, collect collision and boundary events, then resolve them in a stable order:

1. Resolve projectile impacts in time-of-impact order within the step, using swept queries where necessary. For exact ties, opposing-laser cancellation takes precedence over ship hits; use stable entity IDs to break remaining ties. A cancellation consumes both projectiles and awards 50 points once. A consumed projectile cannot cancel another laser or damage a ship later in the step. Same-side lasers pass through each other.
2. For valid ship impacts, apply enemy damage and award kill points once per enemy ID; apply at most one projectile/contact life loss per step when vulnerable and queue hit pause. While invulnerable, contacts and enemy lasers cause no damage; proposed behavior is to consume lasers touching the protected ship. A laser that hit a ship earlier in the step cannot subsequently cancel another laser.
3. Resolve escapes for surviving enemies, once per enemy ID: remove the enemy and its remaining HP, deduct one life, and award no points. An enemy destroyed in this step cannot also escape.
4. If lives reach zero, enter game over. Game over takes precedence over a simultaneous level clear.
5. Otherwise, when no living enemies remain, prioritize level clear over any queued hit pause. Remove residual projectiles; levels 1–14 transition to the next level and level 15 transitions directly to congratulations. Apply any life loss already resolved. A simultaneous nonfatal hit grants 3 seconds of protection for the next level; protection from an escape also carries forward. Transition screens do not consume protection time. Transition cleanup awards no cancellation points.
6. If the level is still active, enter any queued 5-second hit pause; on expiry, grant 3 seconds of invulnerability and resume. An escape by itself never queues a pause and immediately grants or refreshes 3 seconds of protection. Resolve same-step projectile hits before escape penalties as above; protection from an escape does not retroactively cancel an already-resolved hit.

Level score is the points earned during the current level from enemy kills and opposing-laser cancellations. Accumulated score includes all points earned so far in the run, including the current level, and updates immediately on a kill or cancellation. Cancellations do not change enemy HP, enemy count, or lives directly. On advancing, reset level score only. On restart, reset scores, lives, level, entities, timers, input, and invulnerability.

The bottom-left bar represents aggregate remaining enemy HP: `sum(current HP of living enemies) / total initial level HP`. Include reserve enemies waiting to spawn. With 1 HP enemies, the bar also represents the fraction of enemies remaining. Both kills and escapes decrease it immediately; only kills award points. Label it “Enemy HP” and show a numeric fraction.

## 6. Level progression and initial tuning

Use one centralized level configuration generator, with the following starting values treated as playtest hypotheses. World units are abstract arena units, not pixels.

| Parameter | Level 1 baseline | Progression proposal |
| --- | --- | --- |
| Arena | 20 units wide × 28 units tall | Fixed logical arena; responsive letterboxing |
| Enemy count | 18, arranged as 3 rows × 6 columns | Add 2 enemies every level through level 15 (46 enemies) |
| Visible formation capacity | 6 columns × 6 rows | Extra enemies wait in reserve and enter safe top slots |
| Formation tick | 0.8 seconds | `max(0.22, 0.8 × 0.94^(level−1))` seconds |
| Formation step | 0.65 horizontal / 0.6 downward | Fixed distance; quicker ticks increase speed |
| Launch interval | 2.5 seconds | `max(0.65, 2.5 × 0.93^(level−1))` seconds |
| Launched descent speed | 2 units/second | `min(6, 2 × 1.07^(level−1))` |
| Launched horizontal speed | 3 units/second | `min(8, 3 × 1.06^(level−1))` |
| Enemy laser speed | 5 units/second | `min(10, 5 × 1.04^(level−1))` |
| Player laser speed | 15 units/second | Always `3 × current enemy laser speed` |
| Enemy firing interval | 1.8 seconds | `max(0.65, 1.8 × 0.95^(level−1))` seconds |
| Active launched cap | 2 | Increase by 1 every 3 levels, to a maximum of 6 |
| Player movement speed | 9 units/second | Fixed initially |
| Player firing intervals | Tap: 0.20 seconds minimum; hold: 0.24 seconds | Fixed across levels; tune while preserving faster repeated taps |

The campaign contains exactly 15 levels. The proposed 36-enemy visible formation capacity requires reserves from level 11 onward, reaching 10 reserve enemies at level 15. Reserves count toward initial HP and the level-clear condition and enter only safe top-row positions. This preserves increasing total enemy counts without overcrowding the arena. Proposed speed/interval caps above are not reached within levels 1–15, so each level has faster movement and firing than the previous one. Clearing level 15 ends the run successfully; never generate level 16.

Tune the first five levels, then playtest the full 15-level campaign, including reserves and the final difficulty curve. Favor readable launch cues and dodgeable patterns.

## 7. Screens and interface

| State | Contents and behavior |
| --- | --- |
| Loading | Asset/physics initialization progress; actionable error state if initialization fails |
| Start | Space Attack title, Start button, concise controls, sound/music controls |
| Playing | Scene with four-corner HUD; current level number near the top center |
| Paused | Resume and restart controls; combat, timers, and physics frozen |
| Hit pause | 5-second countdown after a nonfatal hit; gameplay frozen, followed by 3 seconds of invulnerability on resumption |
| Level complete | After levels 1–14, brief level score summary and next-level notice; retain lives and total score. Level 15 leads to congratulations instead |
| Game over | Final total, level reached, Restart, return to start, view leaderboard, optional Submit Score action |
| Congratulations | Special level-15 completion message and celebratory visuals/audio, final total, Play Again, return to start, view leaderboard, optional Submit Score action |

Reserve HUD margins outside the collision arena so the lower HP bar and life icons never obscure the player. Use DOM text/buttons for crisp rendering, keyboard focus, and accessible labels. Life icons should include a textual accessible count. Do not announce rapidly changing scores on every update to screen readers. Use shape and motion as well as color to distinguish threats.

Keep a fixed gameplay aspect ratio across viewport sizes, resizing the canvas display without changing world bounds or difficulty. Initial target is desktop keyboard play; touch controls and gamepads are later scope. Prevent arrow/Space page scrolling only while gameplay owns focus. Opposing horizontal inputs cancel each other.

## 8. Technical design

Proposed foundation: React + TypeScript + Vite, Three.js, React Three Fiber, and React Three Rapier. Select and pin compatible stable versions during setup. Fiber is the React renderer for Three.js; Rapier supplies the physics integration and collider events. Official references: [Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction), [React Three Rapier documentation](https://pmndrs.github.io/react-three-rapier/).

Use a zero-gravity Rapier world, fixed 1/60-second simulation steps, and a single gameplay plane with depth translation and unwanted rotations locked. Proposed actor bodies are kinematic, with explicit simple colliders and collision groups. Test kinematic/sensor interaction settings explicitly in the first collision prototype. Movement follows game rules; physics detects hits rather than pushing ships around.

Do not rely on visual mesh overlap. Configure interactions for player laser → enemy, enemy laser → player, player laser ↔ enemy laser, and enemy → player; use Rapier queries or boundary sensors for escape detection. Validate fast-projectile detection at maximum configured speed, including opposing lasers crossing between simulation steps. Prototype swept Rapier shape casts between previous and next projectile positions; account for both projectiles' relative motion when testing opposing lasers. Do not assume continuous collision detection alone solves sensor tunneling. Deduplicate query and event results by entity/projectile IDs, record consumed projectiles immediately, and award cancellation points once per resolved pair.

Use a central simulation owner for clocks, entity lifecycles, events, and level transitions. Keep high-frequency transforms in the simulation/refs; publish score, lives, and screen-state changes to React as needed. Keep render frame rate separate from simulation speed, cap catch-up work after stalls, and pause on lost focus. No game logic should depend on frame counts.

Suggested module boundaries:

```text
src/
  app/          SPA shell and screen switching
  game/
    config/     arena, tuning, level configuration
    simulation/ fixed tick, event resolution, run state
    systems/    input, formation, launches, weapons, damage, progression
    entities/   player, enemy, projectile identity and components
    physics/    colliders, groups, Rapier queries, boundary handling
    rendering/  camera, models, effects, background
  ui/           HUD, start, pause, level complete, game over
  services/     leaderboard persistence and explicit score submission
```

Core records: `RunState` (including hit-pause countdown, invulnerability timer, completed-run ID and outcome), `LevelConfig` (levels 1–15), `EnemyState` (formation/launched/reserve/destroyed/escaped), `ProjectileState`, and typed combat events. Destroyed and escaped are terminal states; preserve the distinction for scoring and life-loss rules. Use stable IDs and resettable timers. Store per-enemy HP and derive aggregate HP rather than maintaining competing counters.

## 9. Shared online leaderboard and optional submission

Leaderboard viewing is required on both the game-over and congratulations screens. Submitting a score is optional: do not save a leaderboard entry automatically when the run ends. Freeze the final score and outcome, let the player view existing scores without submitting, and provide an explicit Submit Score action. Submit each completed run at most once and show submitted, loading, empty, and error states as appropriate. Viewing or declining submission must never block restarting.

Confirmed scope: a shared online leaderboard, accessible across browsers and players, showing the top 10 entries with nickname, score, level reached, completion status, and server-recorded submission date. Players submit with a nickname only; no accounts, login, email, or password. Order by score descending, level reached descending, successful completion before defeat, then earlier submission. Nicknames are display labels, not verified or unique identities; allow duplicates. Backend/network failure must not block play, viewing the final result, or restarting.

Use an HTTPS leaderboard API and persistent database alongside the SPA. Public reads return the ranked top 10. An explicit submission sends the nickname and a completed-run record; server-side validation and database constraints enforce valid values and one accepted submission per run. Use an opaque anonymous run token/ID issued by the server when a run starts, with idempotent retries. No user account is created. Keep the final score immutable in the client and report success only after server acknowledgement. If run registration is unavailable, allow gameplay and explain at the end that the run cannot be submitted; do not fabricate an online result or silently save it as a shared entry.

Implementation defaults: accept a trimmed nickname of 2–20 characters, reject blank/control-character input, and render nicknames as plain text. Enforce these checks server-side too. Add request-size limits, rate limiting for anonymous run creation/submission, and server timestamps. Validate level range 1–15, completion only at level 15, nonnegative integer scores in 50-point increments, and consistency with available run data. These checks prevent malformed submissions and simple duplication; they do not prove that a browser-reported score was honestly earned. Competitive anti-cheat via authoritative simulation or replay verification is separate work, not an implied guarantee of this account-free leaderboard.

End-screen flow: fetch and display scores independently of submission; let the player enter a nickname and choose Submit Score or simply restart. Show loading, empty, success, validation-error, and retryable network-error states. Retry with the same run ID to avoid duplicate records. Only disclose the nickname and gameplay result in public entries; keep run tokens private. Select the backend/hosting provider during implementation without introducing account requirements for players.

## 10. Art and audio direction

Use 16-bit-era-inspired silhouettes, a restrained vibrant palette, stylized pixel-like textures, compact explosion animations, and crisp arcade typography. Render with modern Three.js techniques; do not enforce historical color, resolution, or hardware limits. Preserve clear hitboxes, readable threats, and strong separation between player lasers, enemy lasers, and the background. Effects should support gameplay rather than hide projectiles.

Audio should recall retro arcade space games through original or licensed synthesized laser sounds, explosion bursts, warning cues, and energetic melodic loops. Add distinct cancellation feedback, a hit-pause countdown cue, game-over sting, and a special victory fanfare. Initialize audio after user interaction; provide independent music/effects controls and mute. Reduce music during hit pause and suspend gameplay audio during manual/focus pause. Visual feedback must convey all gameplay information without sound.

## 11. Quality goals and exclusions

Target smooth 60 FPS on an agreed reference desktop at the maximum intended simultaneous entity count. Establish the hardware/browser baseline during setup before claiming a performance result. Verify Chromium, Firefox, and WebKit-based browsers where available, keyboard-only menus, focus loss, resizing, restart cleanup, and low frame rates.

Out of scope for the first release: multiplayer, bosses, power-ups, weapon upgrades, mobile controls, monetization, persistent campaigns, player accounts, and authoritative anti-cheat/replay verification. Shared online leaderboard infrastructure is included.

Highest-risk prototype questions: fast-projectile detection, kinematic collision configuration, stepped formation motion, simultaneous hit/escape resolution, and fair late-level projectile density. Resolve these before detailed art.

## 12. Decision status

- Confirmed: escaped enemies are eliminated, award no points, and cost one life. A level clears when every enemy is destroyed or escaped, provided lives remain.
- Confirmed: all enemies have 1 HP; the longest row determines formation turns; launches alternate left/right.
- Confirmed: 3 lives per run; held fire is slightly slower than repeated taps; a hit triggers 5 seconds of frozen gameplay followed by 3 seconds of invulnerability.
- Confirmed: exactly 15 levels, with a special congratulations screen on completion; retro 16-bit-inspired visuals and arcade-style audio.
- Confirmed: both end screens offer leaderboard viewing and optional score submission.
- Accepted initial tuning: 100-point enemy kills, 0.20/0.24-second tap/hold intervals, contact damage, formation-row span/tie handling, reserve spawning, and the level progression table.
- Confirmed edge behavior: fatal damage goes directly to game over; nonfatal escapes grant 3 seconds of invulnerability without a pause; a simultaneous clear takes precedence over a nonfatal hit pause while retaining life loss and carrying protection to the next level.
- Confirmed leaderboard: shared online, nickname-only submissions, no player accounts; viewing and submission remain independent.

The gameplay decisions above are settled for implementation. Remaining engineering choices include the backend provider and deployment setup. Nickname constraints and anonymous submission controls above are implementation defaults; tune them if needed without changing the account-free user flow.
