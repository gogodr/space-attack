import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ARENA, getLevelConfig, TUNING } from '../src/game/config';
import type { Enemy, Impact, Projectile } from '../src/game/types';

const run = () => { const engine = new GameEngine(); engine.start(); return engine; };
const tick = (e: GameEngine, dt = 1 / 60, impacts: Impact[] = []) => { e.prepareStep(dt); e.resolveStep(impacts); };
const laser = (id: string, side: 'player' | 'enemy' = 'player'): Projectile => ({ id, side, x: 0, y: 0, previous: { x: 0, y: 0 }, vy: side === 'player' ? 15 : -5 });
const enemy = (id: string, x = 0, y = 10, row = 0): Enemy => ({ id, x, y, previous: { x, y }, row, column: 0, mode: 'formation', direction: 1, age: 0, fireTimer: 10 });

describe('campaign and input', () => {
  it('shows a static formation on the start screen without advancing any gameplay', () => {
    const e = new GameEngine(); const first = e.state.enemies[0].x;
    expect(e.state.phase).toBe('start'); expect(e.state.enemies.length).toBe(18);
    tick(e, 10); expect(e.state.enemies[0].x).toBe(first); expect(e.state.time).toBe(0);
  });
  it('generates exactly 15 increasingly difficult levels with triple-speed player lasers', () => {
    for (let level = 1; level <= 15; level++) {
      const c = getLevelConfig(level); expect(c.count).toBe(18 + (level - 1) * 2); expect(c.playerLaserSpeed).toBe(3 * c.enemyLaserSpeed);
      if (level > 1) { const before = getLevelConfig(level - 1); expect(c.formationInterval).toBeLessThan(before.formationInterval); expect(c.descentSpeed).toBeGreaterThan(before.descentSpeed); }
    }
    expect(() => getLevelConfig(16)).toThrow();
  });
  it('moves only horizontally, clamps at arena boundaries and cancels opposing input', () => {
    const e = run(); e.input.right = true; tick(e, 2); expect(e.state.player.x).toBe(9.4); expect(e.state.player.y).toBe(ARENA.playerY);
    e.input.left = true; tick(e); expect(e.state.player.x).toBe(9.4);
  });
  it('keeps held firing slower than fresh taps, with a shared minimum gap', () => {
    const e = run(); e.input.fireHeld = true; e.input.firePressed = true; tick(e, 0.01); expect(e.state.projectiles.length).toBe(1);
    tick(e, 0.2); expect(e.state.projectiles.length).toBe(1);
    e.input.firePressed = true; tick(e, 0.001); expect(e.state.projectiles.length).toBe(2);
    e.input.firePressed = true; tick(e, 0.1); expect(e.state.projectiles.length).toBe(2);
    tick(e, 0.14); expect(e.state.projectiles.length).toBe(3);
  });
  it('saves previous coordinates and preserves generation-safe IDs on reset', () => {
    const e = run(); const id = e.state.enemies[0].id; e.input.right = true; tick(e); expect(e.state.previousPlayer.x).toBe(0);
    expect(e.state.player.x).toBeGreaterThan(0); e.start(); expect(e.state.enemies[0].id).not.toBe(id); expect(e.state.lives).toBe(3); expect(e.input.right).toBe(false);
  });
});

describe('formation and launches', () => {
  it('moves in marked steps with no interpolation between ticks', () => {
    const e = run(); const x = e.state.enemies[0].x; tick(e, 0.4); expect(e.state.enemies[0].x).toBe(x);
    tick(e, 0.4); expect(e.state.enemies[0].x).toBeCloseTo(x + 0.65);
  });
  it('uses longest row span, including holes, rather than the farthest singleton', () => {
    const e = run(); e.state.enemies = [enemy('left', -6, 10, 0), enemy('right', 6, 10, 0), enemy('single', 9.45, 8, 1)];
    tick(e, 0.8); expect(e.state.enemies[0].x).toBeCloseTo(-5.35); expect(e.state.enemies[1].x).toBeCloseTo(6.65);
    expect(e.state.enemies[2].x).toBe(9.45); expect(e.state.enemies[0].y).toBe(10);
    tick(e, 0.8); expect(e.state.enemies[0].x).toBeCloseTo(-4.7); expect(e.state.enemies[0].y).toBe(10);
  });
  it('breaks longest-span ties toward travel, then descends and reverses next tick', () => {
    const e = run(); e.state.enemies = [enemy('a', -4, 10, 0), enemy('b', 4, 10, 0), enemy('c', 1.4, 8, 1), enemy('d', 9.4, 8, 1)];
    tick(e, 0.8); expect(e.state.enemies[3].x).toBeCloseTo(9.45); expect(e.state.enemies[0].x).toBeCloseTo(-3.95);
    tick(e, 0.8); expect(e.state.enemies[0].y).toBeCloseTo(9.4); expect(e.state.enemies[0].x).toBeCloseTo(-3.95);
    tick(e, 0.8); expect(e.state.enemies[0].x).toBeCloseTo(-4.6);
  });
  it('launches alternate bottom-left and bottom-right without a position jump', () => {
    const e = run(); e.state.config.formationInterval = 100; const bottom = e.state.enemies.filter(x => x.row === 2);
    tick(e, 2.5); expect(bottom[0].mode).toBe('launched'); expect(bottom[0].x).toBe(-6.25); expect(bottom[0].direction).toBe(1);
    tick(e, 2.5); expect(bottom[5].mode).toBe('launched'); expect(bottom[5].x).toBe(6.25); expect(bottom[5].direction).toBe(-1);
    tick(e, 2.5); expect(e.state.enemies.filter(x => x.mode === 'launched').length).toBe(2);
  });
  it('only launched enemies fire, after the telegraphed delay', () => {
    const e = run(); e.state.config.formationInterval = 100; tick(e, 2.5); expect(e.state.projectiles.length).toBe(0);
    tick(e, 0.69); expect(e.state.projectiles.length).toBe(0); tick(e, 0.01); expect(e.state.projectiles[0].side).toBe('enemy');
  });
  it('bounces launched enemies while preserving smooth downward motion', () => {
    const e = run(); e.state.enemies = [enemy('bounce', 9.4, 8)]; e.state.enemies[0].mode = 'launched';
    tick(e, 0.1); expect(e.state.enemies[0].x).toBeCloseTo(9.2); expect(e.state.enemies[0].y).toBeCloseTo(7.8); expect(e.state.enemies[0].direction).toBe(-1);
  });
  it('includes reserves in HP and admits them only into safe top slots', () => {
    const e = run();
    for (let level = 1; level < 11; level++) { e.state.enemies = []; tick(e); tick(e, TUNING.levelTransition); }
    expect(e.state.level).toBe(11); expect(e.state.initialHP).toBe(38); expect(e.state.enemies.filter(x => x.mode === 'reserve').length).toBe(2);
    e.state.enemies = e.state.enemies.filter(x => !(x.mode === 'formation' && x.row === 0 && x.column === 0));
    tick(e); expect(e.state.enemies.filter(x => x.mode === 'reserve').length).toBe(1); expect(e.state.enemies.length).toBe(37);
    expect(e.state.enemies.find(x => x.column === 0 && x.y === 11)?.mode).toBe('formation');
  });
});

describe('combat arbitration', () => {
  it('cancels opposing lasers once for 50 points and never reduces enemy HP', () => {
    const e = run(); e.state.projectiles = [laser('p'), laser('e', 'enemy')]; const hp = e.state.enemies.length;
    tick(e, 0.01, [{ kind: 'cancel', a: 'p', b: 'e', toi: 0.1 }, { kind: 'cancel', a: 'e', b: 'p', toi: 0.1 }]);
    expect(e.state.totalScore).toBe(50); expect(e.state.levelScore).toBe(50); expect(e.state.projectiles).toHaveLength(0); expect(e.state.enemies).toHaveLength(hp);
  });
  it('ignores same-side cancellation', () => {
    const e = run(); e.state.projectiles = [laser('a'), laser('b')]; tick(e, 0.01, [{ kind: 'cancel', a: 'a', b: 'b', toi: 0 }]);
    expect(e.state.projectiles).toHaveLength(2); expect(e.state.totalScore).toBe(0);
  });
  it('kills a 1HP enemy once, consuming the player laser', () => {
    const e = run(); const id = e.state.enemies[0].id; e.state.projectiles = [laser('p'), laser('p2')];
    tick(e, 0.01, [{ kind: 'kill', projectile: 'p', enemy: id, toi: 0 }, { kind: 'kill', projectile: 'p2', enemy: id, toi: 0 }]);
    expect(e.state.totalScore).toBe(100); expect(e.state.enemies).toHaveLength(17); expect(e.state.projectiles.map(p => p.id)).toEqual(['p2']);
  });
  it('gives cancellation priority over ship hits only on equal impact times', () => {
    const e = run(); e.state.projectiles = [laser('p'), laser('e', 'enemy')];
    tick(e, 0.01, [{ kind: 'hit', projectile: 'e', toi: 0.5 }, { kind: 'cancel', a: 'p', b: 'e', toi: 0.5 }]);
    expect(e.state.lives).toBe(3); expect(e.state.totalScore).toBe(50);
    e.state.projectiles = [laser('p'), laser('e', 'enemy')];
    tick(e, 0.01, [{ kind: 'cancel', a: 'p', b: 'e', toi: 0.5 }, { kind: 'hit', projectile: 'e', toi: 0.4 }]);
    expect(e.state.lives).toBe(2); expect(e.state.totalScore).toBe(50); expect(e.state.phase).toBe('hit-pause');
  });
  it('deducts at most one projectile/contact life per step and consumes protected lasers', () => {
    const e = run(); e.state.projectiles = [laser('a', 'enemy'), laser('b', 'enemy')];
    tick(e, 0.01, [{ kind: 'hit', projectile: 'a', toi: 0 }, { kind: 'hit', projectile: 'b', toi: 0.1 }]);
    expect(e.state.lives).toBe(2); expect(e.state.projectiles).toHaveLength(0); tick(e, 5);
    e.state.projectiles = [laser('c', 'enemy')]; tick(e, 0.01, [{ kind: 'hit', projectile: 'c', toi: 0 }]);
    expect(e.state.lives).toBe(2); expect(e.state.projectiles).toHaveLength(0);
  });
  it('resolves kills before escape penalties for the killed enemy', () => {
    const e = run(); e.state.enemies = [enemy('escaping', 0, -14)]; e.state.projectiles = [laser('p')];
    tick(e, 0.01, [{ kind: 'kill', projectile: 'p', enemy: 'escaping', toi: 0.1 }]);
    expect(e.state.lives).toBe(3); expect(e.state.totalScore).toBe(100); expect(e.state.phase).toBe('level-complete');
  });
  it('escapes remove enemies without score or pause and refresh protection', () => {
    const e = run(); e.state.enemies[0].y = -14; tick(e); expect(e.state.lives).toBe(2); expect(e.state.phase).toBe('playing');
    expect(e.state.protection).toBe(3); expect(e.state.enemies.length).toBe(17); expect(e.state.totalScore).toBe(0);
    e.state.enemies[0].y = -14; tick(e); expect(e.state.lives).toBe(1); expect(e.state.protection).toBe(3);
  });
  it('protection never prevents several same-step escape life penalties', () => {
    const e = run(); e.state.protection = 3; for (const n of e.state.enemies.slice(0, 3)) n.y = -14;
    tick(e); expect(e.state.lives).toBe(0); expect(e.state.phase).toBe('game-over');
  });
});

describe('damage timers and level outcomes', () => {
  it('freezes five-second hit pause, pauses that countdown manually, resumes with three active seconds protection', () => {
    const e = run(); e.state.projectiles = [laser('hit', 'enemy')]; tick(e, 0.01, [{ kind: 'hit', projectile: 'hit', toi: 0 }]);
    const time = e.state.time, position = e.state.enemies[0].x; tick(e, 2); expect(e.state.hitCountdown).toBe(3);
    expect(e.state.time).toBe(time); expect(e.state.enemies[0].x).toBe(position); e.togglePause(); tick(e, 10); expect(e.state.hitCountdown).toBe(3);
    e.togglePause(); tick(e, 3); expect(e.state.phase).toBe('playing'); expect(e.state.protection).toBe(3);
    tick(e, 1); expect(e.state.protection).toBe(2); e.togglePause(); tick(e, 9); expect(e.state.protection).toBe(2);
  });
  it('prioritizes nonfatal clear over hit pause and carries protection into next level', () => {
    const e = run(); e.state.enemies = [enemy('last')]; e.state.projectiles = [laser('p'), laser('bad', 'enemy')];
    tick(e, 0.01, [{ kind: 'hit', projectile: 'bad', toi: 0 }, { kind: 'kill', projectile: 'p', enemy: 'last', toi: 0.1 }]);
    expect(e.state.phase).toBe('level-complete'); expect(e.state.lives).toBe(2); expect(e.state.protection).toBe(3); expect(e.state.totalScore).toBe(100);
    tick(e, 1.5); expect(e.state.level).toBe(2); expect(e.state.levelScore).toBe(0); expect(e.state.totalScore).toBe(100); expect(e.state.protection).toBe(3);
  });
  it('gives fatal damage precedence over a simultaneous clear', () => {
    const e = run(); e.state.lives = 1; e.state.enemies = [enemy('last')]; e.state.projectiles = [laser('p'), laser('bad', 'enemy')];
    tick(e, 0.01, [{ kind: 'kill', projectile: 'p', enemy: 'last', toi: 0 }, { kind: 'hit', projectile: 'bad', toi: 0 }]);
    expect(e.state.phase).toBe('game-over'); expect(e.state.lives).toBe(0); expect(e.state.hitCountdown).toBe(0);
  });
  it('ends after level 15 with congratulations and no level 16', () => {
    const e = run();
    for (let level = 1; level <= 15; level++) {
      expect(e.state.level).toBe(level); e.state.enemies = []; tick(e);
      if (level < 15) { expect(e.state.phase).toBe('level-complete'); tick(e, 1.5); }
    }
    expect(e.state.phase).toBe('victory'); tick(e, 10); expect(e.state.level).toBe(15);
  });
  it('publishes stable external-store snapshots until changes occur', () => {
    const e = run(); const first = e.getSnapshot(); let calls = 0; const unsubscribe = e.subscribe(() => calls++);
    expect(e.getSnapshot()).toBe(first); tick(e); expect(e.getSnapshot()).toBeGreaterThan(first); expect(calls).toBe(1);
    unsubscribe(); tick(e); expect(calls).toBe(1);
  });
});
