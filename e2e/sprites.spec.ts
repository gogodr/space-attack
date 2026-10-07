import { expect, test, type Page } from '@playwright/test';
import type { GameEngine } from '../src/game/engine';

declare global {
  interface Window {
    __spaceAttack?: GameEngine;
  }
}

async function spritePixels(page: Page, png: Buffer) {
  const coloredPixels = await page.evaluate(async (encoded) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    const colored: number[] = [];
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i],
        g = pixels[i + 1],
        b = pixels[i + 2];
      // Neutral decorative stars can twinkle; the saturated sprite pixels freeze.
      if (Math.max(r, g, b) - Math.min(r, g, b) > 80) colored.push(i);
    }
    return colored;
  }, png.toString('base64'));
  expect(coloredPixels.length).toBeGreaterThan(100);
  return coloredPixels;
}

function changedPixels(a: number[], b: number[]) {
  const left = new Set(a),
    right = new Set(b);
  return (
    a.filter((pixel) => !right.has(pixel)).length +
    b.filter((pixel) => !left.has(pixel)).length
  );
}

test('one atlas renders animated ships and effects, and freezes on pause', async ({
  page,
}) => {
  const atlasRequests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/space-attack-atlas.png'))
      atlasRequests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch mission' }).click();
  await page.waitForFunction(() => window.__spaceAttack!.state.time > 0.1);
  await page.screenshot({
    path: 'screenshots/gameplay-sprites-desktop.png',
    fullPage: true,
  });

  await page.evaluate(() => {
    const engine = window.__spaceAttack!;
    engine.state.time = 0;
    engine.state.effects = [
      { id: 'visual-explosion', kind: 'kill', x: -2, y: 0, remaining: 0.3 },
      { id: 'visual-cancel', kind: 'cancel', x: 2, y: 0, remaining: 0.2 },
    ];
    engine.togglePause();
  });
  // The DOM pause overlay is outside the WebGL canvas being compared.
  const canvas = page.locator('canvas');
  await page.locator('.screen-overlay').evaluate((element) => {
    (element as HTMLElement).style.visibility = 'hidden';
  });
  await page.waitForTimeout(150);
  const frozen = await spritePixels(page, await canvas.screenshot());
  await page.waitForTimeout(250);
  const still = await spritePixels(page, await canvas.screenshot());
  // Tiny alpha-edge differences may reflect the stars behind otherwise frozen art.
  expect(changedPixels(frozen, still)).toBeLessThan(frozen.length * 0.02);
  expect(await page.evaluate(() => window.__spaceAttack!.state.time)).toBe(0);

  await page.evaluate(() => {
    const engine = window.__spaceAttack!;
    engine.state.time = 0.22;
    engine.state.effects[0].remaining = 0.1;
    engine.prepareStep(1 / 60);
    engine.resolveStep([]);
  });
  await page.waitForTimeout(150);
  expect(
    changedPixels(frozen, await spritePixels(page, await canvas.screenshot())),
  ).toBeGreaterThan(30);
  await canvas.screenshot({ path: 'screenshots/sprites-effects-arena.png' });
  expect(new Set(atlasRequests).size).toBe(1);
  expect(errors).toEqual([]);
});
