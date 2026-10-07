# Space Attack — Development Agents

These are project-specific role briefs to reference during development. They do not install tools, create running agents, or change Codex configuration. Start an agent with its role file, this shared contract, the assigned backlog ticket, and the relevant specification sections. Roles describe responsibilities and competencies; actual tool availability depends on the development session.

## Source of truth

1. Latest explicit user decisions.
2. [Game plan](../GAME_PLAN.md), including accepted tuning and confirmed edge behavior.
3. [Roadmap](../ROADMAP.md).
4. [Backlog](../BACKLOG.md) and the assigned ticket.
5. This shared contract and the role-specific brief.

The game plan's accepted-tuning decision supersedes older “proposed” wording for already accepted values. New engineering defaults are not new gameplay requirements. If sources disagree, record the discrepancy and resolve it using this order; do not quietly change gameplay.

## Roster

| Role | Brief | Primary ownership |
| --- | --- | --- |
| Technical Lead / Integrator | [TECH_LEAD.md](TECH_LEAD.md) | Architecture, contracts, dependencies, integration, release readiness |
| Gameplay Engineer | [GAMEPLAY.md](GAMEPLAY.md) | Simulation rules, formation, launch behavior, damage, progression |
| Physics / Rendering Engineer | [PHYSICS_RENDERING.md](PHYSICS_RENDERING.md) | Fiber scene, Rapier collision detection, coordinate system, performance |
| UI / Accessibility Engineer | [UI_ACCESSIBILITY.md](UI_ACCESSIBILITY.md) | Screens, HUD, input integration, focus, leaderboard user flows |
| Art / Audio Designer | [ART_AUDIO.md](ART_AUDIO.md) | Retro art direction, visual/audio assets, feedback, asset provenance |
| Backend / Leaderboard Engineer | [BACKEND_LEADERBOARD.md](BACKEND_LEADERBOARD.md) | Shared ranking API, anonymous runs, validation, persistence |
| QA / Balance Engineer | [QA_BALANCE.md](QA_BALANCE.md) | Behavioral verification, cross-browser checks, full-campaign playtesting |

These are seven logical roles, not a requirement for seven simultaneous agents. A single session may adopt several roles sequentially. When parallel work is authorized, assign independent tickets within available concurrency; one active writer owns each file. Creating these briefs does not itself authorize future cross-chat messaging or unattended execution.

## Shared game invariants

- React Three Fiber rendering; React Three Rapier collision logic; SPA; fixed orthographic gameplay plane.
- All enemies have 1 HP. Enemy kill: 100 points. Opposing-laser cancellation: 50 points and both lasers despawn. Same-side lasers pass through.
- Player lasers travel exactly 3× the current enemy laser speed. A consumed projectile cannot generate a second hit or score.
- Formation moves in discrete steps. The longest occupied row controls turns; launches alternate left/right from the lowest occupied row. Use the accepted span/tie/safety-clamp interpretation in the game plan.
- Three lives per run. Tap fire minimum interval 0.20 s; held fire interval 0.24 s; ignore browser key repeat. Horizontal-only player movement.
- Nonfatal hit: 5 s frozen gameplay, then 3 s active-time invulnerability. Fatal damage: immediate game over.
- Escape: eliminate enemy, no score, lose one life, refresh 3 s protection without pausing. Protection does not prevent further escape penalties.
- Apply life losses before deciding the outcome. Zero lives wins over any clear. Otherwise clear precedes a same-step hit pause; protection carries into the next level. Follow the specification's projectile ordering and hit-before-escape ordering.
- Exactly 15 levels; final surviving clear shows congratulations. HP includes reserves and excludes eliminated enemies.
- Both end screens show the shared online leaderboard. Submission is optional and nickname-only. No player accounts or automatic score submission.

## Collaboration and file ownership

Before implementation, the lead maps proposed module paths onto the actual repository and records any repository instructions. Proposed paths in role files are ownership guidance, not files created by this planning package.

The implemented module map is now documented in [ARCHITECTURE.md](../ARCHITECTURE.md). Follow its ownership boundaries during subsequent development. The original top-level engine/config/types/scene/audio/client files are re-export facades; add behavior to the focused modules, not to those facades.

1. Claim a Ready ticket in the backlog; record owner, dependencies, and touched modules.
2. Agree on shared interfaces before parallel edits. The lead owns cross-cutting configuration and interface changes; specialists propose changes with consumers identified.
3. Implement only the assigned scope. Shared-file edits require coordinating ownership; do not overwrite another agent's changes.
4. Add meaningful behavioral verification for risky logic. Report what was actually run and distinguish tests from manual review.
5. Handoff with evidence and remaining risks. The lead integrates dependency changes; QA verifies milestone exits. Do not mark Done solely because code was written.

## Shared implementation contracts

Define these together in SA-02 before consumers implement them:

- `LevelConfig`: level 1–15, counts, speeds, formation/launch/fire timing, immutable tuning.
- `RunState`: phase, level, lives, level/total scores, hit countdown, protection remaining, completed-run ID/outcome.
- `EnemyState`: stable ID, row/slot, 1 HP, formation/launched/reserve/destroyed/escaped lifecycle.
- `ProjectileState`: stable ID, faction, prior/current position, velocity, consumed flag.
- `SimulationEvent`: typed hit, cancellation, escape, clear, and transition events with stable IDs and ordering metadata.
- Input snapshot: held horizontal controls and distinct fire-press edges; DOM key repeat never becomes a tap.
- HUD snapshot: low-frequency observable state; rendering transforms do not force full React rerenders every tick.
- Leaderboard contract: anonymous run registration, public top-10 query, explicit idempotent completed-run submission, ranked response, and predictable errors.

## Required handoff format

```text
Ticket / role:
Outcome and changed files:
Contracts changed and affected consumers:
Verification commands or manual steps and observed results:
Acceptance criteria met / unmet:
Risks, limitations, and follow-up ticket IDs:
Backlog status and next owner:
```

Report unavailable tools, failed checks, or incomplete coverage plainly. Do not invent build results, measurements, or deployment success. Milestone completion requires the actual exit criteria in the roadmap.
