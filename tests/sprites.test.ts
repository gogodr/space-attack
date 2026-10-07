import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ATLAS,
  CLIPS,
  animationFrame,
  frameUV,
} from '../src/game/rendering/sprites/atlas';
import { enemySprite } from '../src/game/rendering/sprites/enemySprites';
import { GameEngine } from '../src/game/engine';

describe('sprite atlas', () => {
  it('matches the packed asset manifest without overlapping clips', () => {
    const manifest = JSON.parse(
      readFileSync(
        new URL('../public/assets/sprites/atlas.json', import.meta.url),
        'utf8',
      ),
    );
    expect(manifest.clips).toEqual(CLIPS);
    expect({
      width: manifest.width,
      height: manifest.height,
      cell: manifest.cell,
      columns: manifest.columns,
    }).toEqual(ATLAS);
    const occupied = Object.values(CLIPS).flatMap((clip) =>
      Array.from({ length: clip.count }, (_, i) => clip.first + i),
    );
    expect(new Set(occupied).size).toBe(28);
    expect(
      manifest.frames.map((frame: { index: number }) => frame.index),
    ).toEqual(occupied);
    const png = readFileSync(
      new URL(
        '../public/assets/sprites/space-attack-atlas.png',
        import.meta.url,
      ),
    );
    expect(png.readUInt32BE(16)).toBe(ATLAS.width);
    expect(png.readUInt32BE(20)).toBe(ATLAS.height);
    expect(png[25]).toBe(6); // RGBA PNG.
  });

  it('loops ships and lasers but clamps one-shot effects', () => {
    expect(animationFrame('enemy-a', 0)).toBe(4);
    expect(animationFrame('enemy-a', 1 / 6)).toBe(5);
    expect(animationFrame('enemy-a', 4 / 6)).toBe(4);
    expect(animationFrame('explosion', 0, 0)).toBe(16);
    expect(animationFrame('explosion', 0, 0.5)).toBe(18);
    expect(animationFrame('explosion', 0, 1)).toBe(19);
    expect(animationFrame('cancel', 0, -0.1)).toBe(20);
  });

  it('flips image rows to UV coordinates inside frame boundaries', () => {
    const top = frameUV(0),
      nextRow = frameUV(8),
      last = frameUV(27);
    expect(top.top).toBeGreaterThan(top.bottom);
    expect(nextRow.top).toBeLessThan(top.bottom);
    expect(top.left).toBeGreaterThan(0);
    expect(last.right).toBeLessThan(1);
    expect(last.bottom).toBeGreaterThan(0);
  });

  it('keeps three enemy identities after row changes and launches', () => {
    const engine = new GameEngine();
    engine.start();
    expect(new Set(engine.state.enemies.map(enemySprite))).toEqual(
      new Set(['enemy-a', 'enemy-b', 'enemy-c']),
    );
    const enemy = engine.state.enemies[0];
    const original = enemySprite(enemy);
    enemy.row = -1;
    enemy.mode = 'launched';
    expect(enemySprite(enemy)).toBe(original);
    delete enemy.variant;
    expect(enemySprite(enemy)).toBe('enemy-a');
  });
});
