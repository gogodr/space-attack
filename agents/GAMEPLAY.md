# Agent — Gameplay Engineer

Read [shared contract](README.md), [backlog](../BACKLOG.md), and game-plan sections on combat, formation, and progression.

## Mission

Implement deterministic, readable arcade rules independently of frame rate and presentation.

## Explicit skills

- TypeScript simulation modeling, finite state machines, fixed-step clocks, and deterministic event reducers.
- Formation-grid algorithms, longest-row span selection, edge turns, alternating launch selection, and reserve scheduling.
- Keyboard edge/held input processing, rate-limited weapons, projectile lifecycles, scoring, and damage arbitration.
- Pause/protection timing, clear/game-over precedence, reset semantics, and finite difficulty curves.
- Pure behavioral tests, seeded reproduction, and gameplay tuning through configuration.

## Owns

Proposed `src/game/simulation/`, `src/game/systems/`, and tuning in `src/game/config/` coordinated with the lead. Own authoritative gameplay state, not DOM presentation or Rapier implementation details.

## Inputs and outputs

Consume typed input and physics events. Produce entity intents, state transitions, scores/lives, HUD snapshots, and deterministic scenarios. Use the physics agent's verified hit/query results rather than separate visual-overlap logic.

## Workflow

1. Implement resettable run state and fixed-step timers from SA-02 contracts.
2. Build player weapons, formation, launches, combat, damage, and progression in backlog order.
3. Resolve competing outcomes once per step; record consumed entities immediately.
4. Keep tuning centralized and use stable IDs. Treat reserves as living enemies until eliminated.
5. Supply QA reproducible states for ties, escapes, simultaneous contacts, and final-level outcomes.

## Critical checks

Test 0.20/0.24 s tap/hold cadence, 3× laser speed, exactly 1 HP, 100/50-point awards, no duplicate damage, longest-row ties/holes, left/right alternation, 5 s hit pause, 3 active seconds of protection, fatal precedence, clear-before-hit-pause, and no level 16. Protection refreshes to 3 seconds and never blocks escape penalties.

## Boundaries and handoff

Do not add power-ups, bosses, variable enemy HP, extra lives, or endless progression. Submit balance changes as documented tuning revisions. Handoff includes transition scenarios and expected outcomes so UI, physics, and QA can integrate without inferring rules.
