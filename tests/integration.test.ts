import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { createCollisionDetector } from '../src/game/collisions';
import { GameEngine } from '../src/game/engine';
import { ARENA, EXTENTS, TUNING } from '../src/game/config';
import type { Projectile } from '../src/game/types';

beforeAll(async () => { await RAPIER.init(); });
const detect = () => createCollisionDetector(RAPIER);
const dt = 1 / 60;
const start = () => { const engine = new GameEngine(); engine.start(); return engine; };
const beam = (id: string, side: 'player' | 'enemy', x: number, y: number): Projectile => ({ id, side, x, y, previous: { x, y: y + (side === 'player' ? -0.1 : 0.1) }, vy: side === 'player' ? 15 : -5 });
const step = (engine: GameEngine, seconds = dt) => { engine.prepareStep(seconds); engine.resolveStep(detect()(engine.state)); };

/** Deterministic fixture: fire a short swept laser at every currently visible enemy.
 * This verifies integration/transition accounting, not skill, fairness, or balance. */
function clearVisibleBatch(engine: GameEngine) {
  engine.prepareStep(dt);
  const visible = engine.state.enemies.filter(enemy => enemy.mode !== 'reserve');
  engine.state.projectiles.push(...visible.map(enemy => beam(`fixture-${enemy.id}`, 'player', enemy.x, enemy.y)));
  const candidates = detect()(engine.state);
  expect(candidates.filter(event => event.kind === 'kill')).toHaveLength(visible.length);
  engine.resolveStep(candidates);
  return visible.length;
}
function clearLevel(engine: GameEngine) {
  let killed = 0;
  let batches = 0;
  while (engine.state.phase === 'playing' && batches++ < 12) killed += clearVisibleBatch(engine);
  expect(batches).toBeLessThan(12);
  return killed;
}
function reachLevel(level: number) {
  const engine = start();
  while (engine.state.level < level) {
    clearLevel(engine);
    expect(engine.state.phase).toBe('level-complete');
    step(engine, TUNING.levelTransition);
  }
  return engine;
}

describe('gameplay authority integrated with real Rapier candidates', () => {
  it('completes every real level and drains reserves without early clear or level 16', () => {
    const engine = start();
    let totalKilled = 0;
    let previousConfig = engine.state.config;
    for (let level = 1; level <= 15; level++) {
      const config = engine.state.config;
      expect(engine.state.level).toBe(level);
      expect(config.count).toBe(18 + (level - 1) * 2);
      expect(config.playerLaserSpeed).toBe(config.enemyLaserSpeed * 3);
      if (level > 1) {
        expect(config.formationInterval).toBeLessThan(previousConfig.formationInterval);
        expect(config.launchInterval).toBeLessThan(previousConfig.launchInterval);
        expect(config.fireInterval).toBeLessThan(previousConfig.fireInterval);
        expect(config.horizontalSpeed).toBeGreaterThan(previousConfig.horizontalSpeed);
        expect(config.descentSpeed).toBeGreaterThan(previousConfig.descentSpeed);
        expect(config.enemyLaserSpeed).toBeGreaterThan(previousConfig.enemyLaserSpeed);
      }
      previousConfig = config;
      if (config.count > TUNING.visibleCapacity) {
        const reserves = config.count - TUNING.visibleCapacity;
        const firstKilled = clearVisibleBatch(engine);
        expect(firstKilled).toBe(TUNING.visibleCapacity);
        expect(engine.state.phase).toBe('playing');
        expect(engine.state.enemies).toHaveLength(reserves);
        expect(engine.state.enemies.every(enemy => enemy.mode === 'reserve')).toBe(true);
        totalKilled += firstKilled + clearLevel(engine);
      } else totalKilled += clearLevel(engine);
      expect(engine.state.enemies).toHaveLength(0);
      expect(engine.state.initialHP).toBe(config.count);
      expect(engine.state.totalScore).toBe(totalKilled * TUNING.killPoints);
      expect(engine.state.levelScore).toBe(config.count * TUNING.killPoints);
      expect(engine.state.lives).toBe(3);
      if (level < 15) {
        expect(engine.state.phase).toBe('level-complete');
        step(engine, TUNING.levelTransition);
        expect(engine.state.levelScore).toBe(0);
      }
    }
    expect(totalKilled).toBe(480);
    expect(engine.state.totalScore).toBe(48000);
    expect(engine.state.phase).toBe('victory');
    step(engine, 100);
    expect(engine.state.level).toBe(15);
  });

  it.each([3, 1])('resolves real same-step final kill and damage with %i initial lives', lives => {
    const engine = start();
    engine.state.enemies = [engine.state.enemies[0]];
    const enemy = engine.state.enemies[0];
    enemy.x = 4; enemy.y = 5;
    engine.state.lives = lives;
    engine.prepareStep(dt);
    engine.state.projectiles = [beam('kill', 'player', enemy.x, enemy.y), beam('damage', 'enemy', engine.state.player.x, engine.state.player.y)];
    const candidates = detect()(engine.state);
    expect(candidates).toContainEqual(expect.objectContaining({ kind: 'kill', toi: 0 }));
    expect(candidates).toContainEqual(expect.objectContaining({ kind: 'hit', toi: 0 }));
    engine.resolveStep(candidates);
    expect(engine.state.lives).toBe(lives - 1);
    expect(engine.state.totalScore).toBe(100);
    expect(engine.state.phase).toBe(lives === 1 ? 'game-over' : 'level-complete');
    expect(engine.state.hitCountdown).toBe(0);
    if (lives !== 1) {
      expect(engine.state.protection).toBe(3);
      step(engine, TUNING.levelTransition);
      expect(engine.state.level).toBe(2);
      expect(engine.state.protection).toBe(3);
    }
  });

  it('cancellation wins a real equal-time player hit and duplicate candidate delivery remains safe', () => {
    const engine = start();
    engine.prepareStep(dt);
    engine.state.projectiles = [beam('player-laser', 'player', 0, ARENA.playerY), beam('enemy-laser', 'enemy', 0, ARENA.playerY)];
    // Also cover the lead's initial-overlap fallback: a zero-relative-motion
    // cast alone can report no impact for shapes already intersecting.
    for (const projectile of engine.state.projectiles) projectile.previous = { x: projectile.x, y: projectile.y };
    const candidates = detect()(engine.state);
    expect(candidates).toContainEqual(expect.objectContaining({ kind: 'cancel', toi: 0 }));
    expect(candidates).toContainEqual(expect.objectContaining({ kind: 'hit', toi: 0 }));
    engine.resolveStep([...candidates.reverse(), ...candidates]);
    expect(engine.state.lives).toBe(3);
    expect(engine.state.phase).toBe('playing');
    expect(engine.state.totalScore).toBe(50);
    expect(engine.state.projectiles).toHaveLength(0);
    engine.resolveStep(candidates);
    expect(engine.state.totalScore).toBe(50);
  });

  it('a swept enemy laser that hits before a later cancellation costs a life and no points', () => {
    const engine = start();
    engine.prepareStep(dt);
    engine.state.projectiles = [beam('late-player', 'player', 0, -13.3), beam('falling', 'enemy', 0, -13.3)];
    engine.state.projectiles[1].previous.y = -10;
    const candidates = detect()(engine.state);
    const hit = candidates.find(event => event.kind === 'hit');
    const cancel = candidates.find(event => event.kind === 'cancel');
    expect(hit).toBeDefined(); expect(cancel).toBeDefined();
    expect(hit!.toi).toBeLessThan(cancel!.toi);
    engine.resolveStep(candidates.reverse());
    expect(engine.state.lives).toBe(2);
    expect(engine.state.totalScore).toBe(0);
    expect(engine.state.phase).toBe('hit-pause');
  });

  it('final escaped enemy defeats a one-life player even while protected', () => {
    const engine = reachLevel(15);
    const score = engine.state.totalScore;
    engine.state.enemies = [engine.state.enemies[0]];
    engine.state.enemies[0].y = ARENA.bottom + EXTENTS.enemy.y;
    engine.state.lives = 1;
    engine.state.protection = 3;
    step(engine);
    expect(engine.state.enemies).toHaveLength(0);
    expect(engine.state.lives).toBe(0);
    expect(engine.state.phase).toBe('game-over');
    expect(engine.state.level).toBe(15);
    expect(engine.state.totalScore).toBe(score);
  });

  it('restart after full victory resets run state and ignores prior-generation collision candidates', () => {
    const engine = reachLevel(15);
    clearLevel(engine);
    expect(engine.state.phase).toBe('victory');
    const oldId = engine.state.effects[0].id;
    engine.state.protection = 2;
    engine.input.fireHeld = true;
    engine.input.right = true;
    engine.start();
    expect(engine.state.phase).toBe('playing');
    expect(engine.state.level).toBe(1);
    expect(engine.state.lives).toBe(3);
    expect(engine.state.levelScore).toBe(0);
    expect(engine.state.totalScore).toBe(0);
    expect(engine.state.protection).toBe(0);
    expect(engine.state.time).toBe(0);
    expect(engine.state.hitCountdown).toBe(0);
    expect(engine.state.levelCountdown).toBe(0);
    expect(engine.state.projectiles).toHaveLength(0);
    expect(engine.state.effects).toHaveLength(0);
    expect(engine.input).toEqual({ left: false, right: false, fireHeld: false, firePressed: false });
    expect(engine.state.enemies).toHaveLength(18);
    expect(engine.state.enemies.every(enemy => enemy.id.split('-')[0] !== oldId.split('-')[0])).toBe(true);
    engine.prepareStep(dt);
    engine.resolveStep([{ kind: 'kill', projectile: 'stale-shot', enemy: oldId, toi: 0 }]);
    expect(engine.state.totalScore).toBe(0);
    expect(engine.state.enemies).toHaveLength(18);
  });
});
