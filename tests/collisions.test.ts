import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { createCollisionDetector } from '../src/game/collisions';
import { GameEngine } from '../src/game/engine';
import type { Projectile } from '../src/game/types';

beforeAll(async () => { await RAPIER.init(); });
const projectile = (id:string,side:'player'|'enemy',startY:number,endY:number,x=0):Projectile => ({id,side,x,y:endY,previous:{x,y:startY},vy:side==='player'?30:-10});
describe('real Rapier swept collision candidates', () => {
  it('detects opposing lasers that cross completely between ticks', () => {
    const engine = new GameEngine(); engine.start(); engine.prepareStep(1/60);
    engine.state.enemies=[]; engine.state.projectiles=[projectile('p','player',0,2),projectile('e','enemy',2,0)];
    const events = createCollisionDetector(RAPIER)(engine.state);
    expect(events).toContainEqual(expect.objectContaining({kind:'cancel',a:'p',b:'e'}));
    expect(events[0].toi).toBeGreaterThanOrEqual(0); expect(events[0].toi).toBeLessThan(1);
    engine.resolveStep(events); expect(engine.state.totalScore).toBe(50); expect(engine.state.projectiles).toHaveLength(0);
  });
  it('sweeps through a thin enemy and scores only once even with duplicate events', () => {
    const engine=new GameEngine(); engine.start(); engine.prepareStep(1/60); const enemy=engine.state.enemies[0];
    enemy.x=0; enemy.y=1; enemy.previous={x:0,y:1}; engine.state.enemies=[enemy];
    engine.state.projectiles=[projectile('p','player',-1,3)];
    const events=createCollisionDetector(RAPIER)(engine.state); expect(events.some(e=>e.kind==='kill')).toBe(true);
    engine.resolveStep([...events,...events]); expect(engine.state.totalScore).toBe(100);
  });
  it('does not generate same-side laser hits or off-axis cancellation', () => {
    const engine=new GameEngine();engine.start();engine.state.enemies=[];
    engine.state.projectiles=[projectile('p','player',0,2),projectile('p2','player',2,0),projectile('e','enemy',2,0,2)];
    expect(createCollisionDetector(RAPIER)(engine.state)).toEqual([]);
  });
  it('accounts for the moving player trajectory', () => {
    const engine=new GameEngine();engine.start();engine.state.enemies=[];
    engine.state.previousPlayer={x:-2,y:-12};engine.state.player={x:2,y:-12};
    engine.state.projectiles=[projectile('e','enemy',-11,-13)];
    expect(createCollisionDetector(RAPIER)(engine.state)).toContainEqual(expect.objectContaining({kind:'hit',projectile:'e'}));
  });
});
