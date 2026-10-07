# Implementation contracts

Project root is this directory. React 19 / Fiber 9 / Rapier 2; TypeScript/Vite SPA. Backend: Express on Node 22, using SQLite locally and Neon Postgres for Vercel. Local review uses Vite proxy; Vercel serves the static SPA and API function on one HTTPS origin. Database files and credentials are excluded from version control. Deployment configuration and commands are in DEPLOYMENT.md.

## Module layout

The composition roots assemble focused modules; gameplay rules, HTTP transport, persistence, rendering, and UI state are separate responsibilities.

```text
src/
  App.tsx                    application layout composition
  app/
    useGame.ts               engine instance, run registration, final result, actions
    useKeyboardControls.ts   held keys, focus loss, pause and keyboard ownership
    useGameAudio.ts          simulation-to-audio binding and settings
    styles/                  base layout, accessibility and responsive cascade
  ui/
    GameCabinet.tsx           arena, HUD and screen composition
    Masthead.tsx              brand and audio controls
    FlightManual.tsx          keyboard/scoring reference
    MissionPanel.tsx          campaign progress presentation
    Footer.tsx                footer/pause action
    PhaseAnnouncement.tsx     restrained accessible phase announcements
    ProtectionIndicator.tsx   shield timer presentation
    ShipIcon.tsx              shared life icon
    hud/                      score/level HUD and HP/lives HUD
    screens/                  individual start/pause/hit/clear/end screens and router
    leaderboard/              list, form, read/submission hooks and composition
  game/
    simulation/               lifecycle, state initialization, runtime clocks, step order
    systems/                  formation, launches, reserves, movement, weapons,
                              combat, feedback, input and transitions
    physics/                  Rapier step bridge, impact candidates, swept queries,
                              shared collider depth and interaction masks
    rendering/
      GameScene.tsx           Canvas/Physics composition
      scene/                  camera, starfield, loading and error boundary
      entities/               player, enemy, laser and reusable body binding
      sprites/                shared atlas material, UVs, animation and enemy identities
      effects/                explosion/cancellation sprite presentation
    config/                   arena/extents, tuning and level generation
    types/                    entities, state/input, events, levels and leaderboard
    utils/                    shared simulation math
  audio/                      synth voices, music sequence, cues and audio lifecycle
  services/leaderboard/        HTTP transport, errors, endpoint client and API types
server/
  app.mjs                    Express composition root and database ownership
  index.mjs                  process startup/shutdown
  config.mjs                 project-relative paths and app configuration
  database/                  connection lifecycle and unchanged schema
  repositories/              run/leaderboard SQL and transaction boundaries
  services/                  registration, credentials, validation and submission rules
  routes/                    HTTP health/run/leaderboard adapters
  middleware/                rate limits, API errors and production SPA serving
api/index.mjs                Vercel API composition entry point
public/assets/sprites/       runtime atlas PNG and frame manifest
art/sprites/                 generated source sheets and provenance (not deployed)
```

Individual UI components have collocated CSS where appropriate. `src/styles.css` is an ordered import entry point; shared and responsive rules preserve the original cascade. Source is formatted using the project's `.prettierrc.json` conventions.

## Dependency boundaries

- React components display state and dispatch controller actions. The `app/` hooks own React/browser lifecycle, request cancellation and immutable end-of-run snapshots.
- `GameEngine` in `game/simulation/` owns the run, subscription revision and prepare/resolve gate. It delegates individual rules to systems; systems do not import React, Three.js, Rapier or HTTP services.
- Simulation actions provide entity IDs and sound cues. Runtime clocks are separate from the public world state; tests can still inspect the existing state contract.
- Rendering reads authoritative state. `EntityBody` shares physics-to-view synchronization without deciding scores or damage. Player, enemy and laser components supply their own visuals and collider settings.
- `SimulationBridge` advances the engine and asks the Rapier detector for impact candidates. Sweeps consider both trajectories and initial overlaps; combat resolves candidates once in the established order.
- Audio cue definitions and musical sequencing delegate oscillator creation to `SynthVoice`. `ArcadeAudio` owns settings and sequencer lifecycle; the React hook handles cleanup.
- The leaderboard client delegates requests/timeouts to its HTTP module. UI read/submission hooks own loading/error/retry presentation, not backend validation or ranking.
- Server routes adapt HTTP to injected async services. Services implement validation, credential checks and retry semantics without Express dependencies. Repositories own SQL and atomic submission handling. The storage factory selects SQLite or Neon; the Postgres migration script initializes its additive schema. Rate-limit stores are local for SQLite and shared database counters for Neon.

Existing import paths (`game/engine.ts`, `game/config.ts`, `game/types.ts`, `game/Scene.tsx`, `game/collisions.ts`, `audio.ts`, and `services/leaderboard.ts`) are compatibility re-export facades. They contain no competing implementations. New work belongs in the owning module above, not in these facades.

Ownership for future development: Gameplay → simulation/systems/config; Physics/Rendering → physics/rendering; UI → app/ui/client service; Art/Audio → art/public assets/audio; Backend → server; QA → behavioral and browser tests. Shared type changes must identify affected consumers before integration.

## Stable integration contracts

Engine interface: `new GameEngine()`, mutable `.state: GameState`, `.input: InputState`, `.start()`, `.toStart()`, `.togglePause()`, `.prepareStep(dt)` (advance movement/timers), `.resolveStep(impacts)` (resolve collision/escapes/transitions), `.subscribe(listener): unsubscribe`, `.getSnapshot(): number` stable revision for React external-store hook, `.onSound?: (cue: SoundCue)=>void`. `prepareStep` advances countdowns but freezes gameplay outside playing; scene only computes hits when still playing. Engine emits after resolving or frozen-clock changes. UI changes input state directly. IDs include run generation to prevent stale-body reuse.

Scene interface: `GameScene({engine}: {engine:GameEngine})` under DOM container; owns Canvas and Rapier Physics. Uses a fixed tick, Rapier shape casts with relative movement for collision candidates, and stable impact ordering; mesh overlap does not decide hits. The engine is authoritative for all score/life/outcome changes.

Leaderboard API: `POST /api/runs` → `{id,token}`; `GET /api/leaderboard` → `{entries:LeaderboardEntry[]}`; `POST /api/leaderboard` body `{runId,token,nickname,score,level,completed}` → `{entry:LeaderboardEntry}`. Errors `{error:string}`. Duplicate identical submission returns existing entry; conflicting retry returns 409. Nickname 2–20 trimmed characters, no control characters; score integer ≥0 divisible by 50; level 1–15; completed requires level 15. Public entries never include tokens. Server timestamps and atomic one-entry-per-run enforcement. No player accounts. UI registration failure permits play but disables submission for that run. Client-reported scores are not cheat-proof.

Approved gameplay tuning and edge precedence are in GAME_PLAN.md; latest user decisions win over historical wording. Fatal damage precedes every clear. Nonfatal clear skips hit pause but retains life loss and protection. Escape protection never suppresses later escape penalties.
