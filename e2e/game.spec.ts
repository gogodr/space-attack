import {test,expect, type Page} from '@playwright/test';
import type {GameEngine} from '../src/game/engine';
declare global {interface Window {__spaceAttack?: GameEngine}}
const start = async (page:Page) => {
  await page.goto('/');await page.getByRole('button',{name:'Launch mission'}).click();
  await page.waitForFunction(()=>window.__spaceAttack!.state.time > .1);
};
const finish = async (page:Page, victory:boolean) => {
  await page.evaluate(victory=>{
    const engine=window.__spaceAttack!;
    engine.prepareStep(1/60);
    engine.state.level= victory?15:1; engine.state.totalScore= victory?48000:500;
    engine.state.projectiles=[];
    if(victory) engine.state.enemies=[];
    else {const enemy=engine.state.enemies[0];enemy.mode='launched';enemy.y=-14;engine.state.enemies=[enemy];engine.state.lives=1;}
    engine.resolveStep([]);
  },victory);
};
test('keyboard play, pause, focus loss and fresh restart work without browser errors',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await start(page);
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(()=>window.__spaceAttack!.state.player.x)).toBeGreaterThan(0);
  await page.keyboard.down('Space');await page.waitForTimeout(250);await page.keyboard.up('Space');
  expect(await page.evaluate(()=>window.__spaceAttack!.state.projectiles.some(p=>p.side==='player'))).toBe(true);
  await page.keyboard.press('Escape');await expect(page.getByRole('heading',{name:'MISSION PAUSED'})).toBeVisible();
  const before=await page.evaluate(()=>window.__spaceAttack!.state.time);await page.waitForTimeout(300);
  expect(await page.evaluate(()=>window.__spaceAttack!.state.time)).toBe(before);
  await page.getByRole('button',{name:'Resume mission'}).click();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByRole('heading',{name:'MISSION PAUSED'})).toBeVisible();
  await page.getByRole('button',{name:'Restart run'}).click();
  expect(await page.evaluate(()=>({level:window.__spaceAttack!.state.level,lives:window.__spaceAttack!.state.lives,score:window.__spaceAttack!.state.totalScore}))).toEqual({level:1,lives:3,score:0});
  expect(errors).toEqual([]);
});
test('hit countdown freezes on pause and resumes with three seconds protection',async({page})=>{
  await start(page);
  await page.evaluate(()=>{const e=window.__spaceAttack!;const p=e.state.player;e.state.projectiles.push({id:'test-hit',side:'enemy',x:p.x,y:p.y+.2,previous:{x:p.x,y:p.y+.2},vy:-5});});
  await expect(page.getByRole('heading',{name:'REBOOTING'})).toBeVisible();
  expect(await page.evaluate(()=>window.__spaceAttack!.state.lives)).toBe(2);
  await page.getByRole('button',{name:'Pause countdown'}).click();
  const countdown=await page.evaluate(()=>window.__spaceAttack!.state.hitCountdown);await page.waitForTimeout(350);
  expect(await page.evaluate(()=>window.__spaceAttack!.state.hitCountdown)).toBe(countdown);
  await page.getByRole('button',{name:'Resume mission'}).click();
  await expect(page.getByText(/SHIELD ACTIVE/)).toBeVisible({timeout:8000});
  expect(await page.evaluate(()=>window.__spaceAttack!.state.protection)).toBeGreaterThan(2);
});
test('game over permits viewing without submission then submits nickname across clients',async({page,browser})=>{
  await start(page);await finish(page,false);
  await expect(page.getByRole('heading',{name:'GAME OVER'})).toBeVisible();
  await expect(page.getByLabel('Submit your score')).toBeVisible();
  const before=await page.request.get('/api/leaderboard');const entries=(await before.json()).entries;
  expect(entries.some((e:{nickname:string})=>e.nickname==='BrowserPilot')).toBe(false);
  let rejectOnce=true;
  await page.route('**/api/leaderboard',route=>{if(route.request().method()==='POST'&&rejectOnce){rejectOnce=false;return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'Please correct your nickname.'})});}return route.continue();});
  await page.getByLabel('Submit your score').fill('BrowserPilot');await page.getByRole('button',{name:'Submit',exact:true}).click();
  await expect(page.getByText('Please correct your nickname.')).toBeVisible();await expect(page.getByLabel('Submit your score')).toBeEnabled();
  await page.getByRole('button',{name:'Submit',exact:true}).click();
  await expect(page.getByText(/Score submitted/)).toBeVisible();
  const context=await browser.newContext();const second=await context.newPage();
  const result=await second.request.get('http://127.0.0.1:5174/api/leaderboard');
  expect((await result.json()).entries.some((e:{nickname:string;score:number})=>e.nickname==='BrowserPilot'&&e.score===500)).toBe(true);
  await page.screenshot({path:'screenshots/game-over-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Try again'}).click();await expect(page.getByRole('heading',{name:'GAME OVER'})).not.toBeVisible();
  await context.close();
});
test('victory shows congratulations, optional submission and restart',async({page})=>{
  await start(page);await finish(page,true);
  await expect(page.getByRole('heading',{name:'STELLAR VICTORY'})).toBeVisible();
  await expect(page.getByText('Congratulations, pilot. You saved the stars.')).toBeVisible();
  await expect(page.getByLabel('Submit your score')).toBeVisible();
  await page.screenshot({path:'screenshots/victory-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Play again'}).click();
  expect(await page.evaluate(()=>window.__spaceAttack!.state.level)).toBe(1);
});
test('mobile layout remains within viewport; backend outage never blocks restart',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/api/runs',route=>route.abort());await page.route('**/api/leaderboard',route=>route.abort());
  await start(page);await finish(page,false);
  await expect(page.getByText(/This run could not connect/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Try again'}).click();
  expect(await page.evaluate(()=>window.__spaceAttack!.state.lives)).toBe(3);
});
