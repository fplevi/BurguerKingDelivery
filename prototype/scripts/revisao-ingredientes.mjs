// Evidence collector for ticket 03; start Vite before running.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const phase = process.argv[2] ?? 'depois';
const output = new URL(`../../.scratch/revisao-interfaces/evidencias/ingredientes-${phase}/`, import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [320, 360, 390, 768, 1023, 1024, 1025, 1280, 1440, 1919, 1920, 1921]) {
    const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width, height: 900 }, isMobile: width <= 390, hasTouch: width <= 390 });
    await page.goto(process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:5173');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => performance.getEntriesByName('burger-scene:entrance-end:assembled').length);
    await page.getByRole('button', { name: 'Ver ingredientes', exact: true }).click();
    await page.waitForFunction(() => performance.getEntriesByName('burger-scene:first-frame:open').length);
    const dialog = page.getByRole('dialog', { name: 'Ver ingredientes', exact: true });
    const controls = dialog.getByRole('group', { name: 'Ingredientes', exact: true });
    for (const state of ['inicial', 'retirados', 'todos-retirados']) {
      if (state === 'retirados') for (const name of ['Picles', 'Cebola']) await controls.getByRole('button', { name: `Retirar ${name}`, exact: true }).click();
      if (state === 'todos-retirados') {
        const remaining = controls.getByRole('button', { name: /^Retirar / });
        while (await remaining.count()) await remaining.first().click();
      }
      // Bring the last control above the fixed bar, as a customer scrolling would.
      await dialog.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.mouse.move(0, 0);
      const measurement = await dialog.evaluate(el => {
        const box = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
        const reset = el.querySelector('#reset'), actions = el.querySelector('.pg-actions');
        return {
          overflow: el.scrollWidth - el.clientWidth,
          reset: box(reset), actions: box(actions),
          tray: box(el.querySelector('.tray')),
          fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
          controls: [...el.querySelectorAll('.ingredient-chip,.tray-item,.pg-actions button')].map(e => ({ text: e.textContent, box: box(e), overflow: e.scrollWidth - e.clientWidth })),
          iconSizes: [...el.querySelectorAll('.ingredient-chip .chip-now')].map(e => box(e)),
        };
      });
      results.push({ width, state, ...measurement });
      await page.screenshot({ path: fileURLToPath(new URL(`${width}-${state}-painel.png`, output)) });
      await dialog.evaluate(el => el.scrollTop = 0);
      if (state === 'inicial') await page.screenshot({ path: fileURLToPath(new URL(`${width}-inicial.png`, output)) });
    }
    await page.close();
  }
  await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ combinations: results.length, overflow: results.filter(r => r.overflow > 0).map(r => [r.width, r.state]), coveredReset: results.filter(r => r.width < 1024 && r.reset.bottom > r.actions.y).map(r => [r.width, r.state]) }));
} finally {
  await browser.close();
}
