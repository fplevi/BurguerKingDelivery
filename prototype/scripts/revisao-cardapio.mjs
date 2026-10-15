// Evidence collector, not a pixel-comparison test. Start Vite before running.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../../.scratch/revisao-interfaces/evidencias/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const measurements = [];
try {
  for (const width of [320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:4181');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.bk-icon').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await page.locator('.catalog-photo').evaluateAll(images => Promise.all(images.map(async el => {
      const img = el instanceof HTMLImageElement ? el : el.querySelector('img');
      img.loading = 'eager';
      await img.decode();
    })));
    await page.waitForFunction(() => document.querySelector('#hero-burger .layer')?.style.width);
    await page.locator('#hero-stage').screenshot();
    measurements.push(await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      fonts: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status })),
      quantityFont: getComputedStyle(document.querySelector('#qty')).fontFamily,
      icons: [...document.querySelectorAll('.bk-icon')].map(el => ({
        asset: el.getAttribute('src'), width: el.width, height: el.height,
        loaded: el.complete && el.naturalWidth > 0,
        control: el.closest('button')?.getBoundingClientRect().toJSON(),
      })),
      purchase: document.querySelector('.purchase').getBoundingClientRect().toJSON(),
    })));
    if ([390, 768, 1280, 1920].includes(width)) {
      await page.screenshot({ path: new URL(`cardapio-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
    }
  }
  await writeFile(new URL('medidas.json', output), JSON.stringify(measurements, null, 2));
  console.log(JSON.stringify(measurements.map(({ width, overflow, fonts }) => ({ width, overflow, fonts }))));
} finally {
  await browser.close();
}
