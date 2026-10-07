import { ARENA, EXTENTS, TUNING } from '../config';
import type { GameState, Impact } from '../types';
import type { SimulationActions } from '../simulation/contracts';
import { EPS } from '../utils/math';
import { addScore, addEffect } from './feedback';

/** Consumes contacts once in impact order, then charges all remaining escapes. */

export function resolveCombat(
  state: GameState,
  impacts: Impact[],
  actions: SimulationActions,
): boolean {
  const projectiles = new Map(state.projectiles.map((p) => [p.id, p]));
  const enemies = new Map(state.enemies.map((e) => [e.id, e]));
  let hit = false;
  const impactKey = (i: Impact) =>
    i.kind === 'cancel'
      ? [i.a, i.b].sort().join(':')
      : i.kind === 'kill'
        ? `${i.projectile}:${i.enemy}`
        : `${i.projectile ?? ''}:${i.enemy ?? ''}`;
  const sorted = [...impacts].sort(
    (a, b) =>
      a.toi - b.toi ||
      Number(b.kind === 'cancel') - Number(a.kind === 'cancel') ||
      impactKey(a).localeCompare(impactKey(b)),
  );
  for (const impact of sorted) {
    if (impact.kind === 'cancel') {
      const a = projectiles.get(impact.a),
        b = projectiles.get(impact.b);
      if (!a || !b || a.side === b.side) continue;
      projectiles.delete(a.id);
      projectiles.delete(b.id);
      addScore(state, TUNING.cancelPoints);
      addEffect(state, actions, 'cancel', {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
      actions.sound('cancel');
    } else if (impact.kind === 'kill') {
      const p = projectiles.get(impact.projectile),
        e = enemies.get(impact.enemy);
      if (!p || p.side !== 'player' || !e || e.mode === 'reserve') continue;
      projectiles.delete(p.id);
      enemies.delete(e.id);
      addScore(state, TUNING.killPoints);
      addEffect(state, actions, 'kill', e);
      actions.sound('kill');
    } else {
      const p = impact.projectile
        ? projectiles.get(impact.projectile)
        : undefined;
      const e = impact.enemy ? enemies.get(impact.enemy) : undefined;
      if (
        impact.projectile
          ? !p || p.side !== 'enemy'
          : !e || e.mode !== 'launched'
      )
        continue;
      if (p) projectiles.delete(p.id);
      if (state.protection > EPS || hit || state.lives <= 0) continue;
      state.lives = Math.max(0, state.lives - 1);
      hit = true;
      addEffect(state, actions, 'hit', state.player);
      actions.sound('hit');
    }
  }
  for (const enemy of enemies.values()) {
    if (enemy.mode === 'reserve' || enemy.y - EXTENTS.enemy.y > ARENA.bottom)
      continue;
    enemies.delete(enemy.id);
    state.lives = Math.max(0, state.lives - 1);
    state.protection = TUNING.protection;
    addEffect(state, actions, 'escape', enemy);
    actions.sound('escape');
  }
  state.enemies = [...enemies.values()];
  state.projectiles = [...projectiles.values()].filter(
    (p) =>
      p.y - EXTENTS.laser.y <= ARENA.top &&
      p.y + EXTENTS.laser.y >= ARENA.bottom,
  );
  return hit;
}
