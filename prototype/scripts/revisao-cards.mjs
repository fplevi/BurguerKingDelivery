// Visual evidence and geometry checks for ticket 02. Start Vite before running.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const phase = process.argv[2] ?? 'depois';
const output = new URL(`../../.scratch/revisao-interfaces/evidencias/cards-${phase}/`, import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const results = [];
try {
  for (const width of [320, 359, 360, 361, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:5173');
    for (const category of ['Hambúrgueres', 'Acompanhamentos', 'Bebidas', 'Sobremesas']) {
      await page.getByRole('navigation', { name: 'Categorias' }).getByRole('link', { name: category, exact: true }).click();
      await page.waitForFunction(category => document.querySelector('#grid').dataset.category === ({ 'Hambúrgueres': 'hamburgueres', 'Acompanhamentos': 'acompanhamentos', 'Bebidas': 'bebidas', 'Sobremesas': 'sobremesas' })[category], category);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.catalog-photo').evaluateAll(els => Promise.all(els.map(async el => {
        const img = el instanceof HTMLImageElement ? el : el.querySelector('img');
        img.loading = 'eager';
        await img.decode();
      })));
      const measurement = await page.locator('#grid').evaluate(grid => {
        const rect = el => el.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          columns: getComputedStyle(grid).gridTemplateColumns,
          fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
          cards: [...grid.querySelectorAll('.card')].map(card => {
            const photo = card.querySelector('.catalog-photo');
            const img = photo instanceof HTMLImageElement ? photo : photo.querySelector('img');
            const c = rect(card), p = rect(photo), n = rect(card.querySelector('.card-name'));
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let x0 = canvas.width, y0 = canvas.height, x1 = 0, y1 = 0;
            for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
              if (pixels[(y * canvas.width + x) * 4 + 3] > 24) {
                x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
              }
            }
            const style = getComputedStyle(photo);
            let drawn;
            if (photo === img) {
              const scale = (style.objectFit === 'contain' ? Math.min : Math.max)(p.width / canvas.width, p.height / canvas.height);
              const ox = (p.width - canvas.width * scale) / 2;
              const oy = (p.height - canvas.height * scale) * .56;
              drawn = { left: p.left + ox + x0 * scale, top: p.top + oy + y0 * scale, right: p.left + ox + x1 * scale, bottom: p.top + oy + y1 * scale };
            } else {
              const i = rect(img), scale = i.width / canvas.width;
              drawn = { left: i.left + x0 * scale, top: i.top + y0 * scale, right: i.left + x1 * scale, bottom: i.top + y1 * scale };
            }
            const range = document.createRange(); range.selectNodeContents(card.querySelector('.card-name'));
            const textVisible = [...range.getClientRects()].every(r => r.left >= c.left && r.right <= c.right && r.top >= n.top - 1 && r.bottom <= c.bottom - 1);
            return {
              name: card.querySelector('.card-name').textContent, selected: card.getAttribute('aria-pressed'),
              textVisible, photoOverName: p.bottom > n.top + 1,
              productContained: drawn.left >= Math.max(c.left, p.left) - 1 && drawn.right <= Math.min(c.right, p.right) + 1 && drawn.top >= Math.max(c.top, p.top) - 1 && drawn.bottom <= Math.min(c.bottom, p.bottom) + 1,
              asset: { width: canvas.width, height: canvas.height, bounds: [x0, y0, x1, y1] },
            };
          }),
        };
      });
      results.push({ width, category, ...measurement });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('#catalog').screenshot({ path: fileURLToPath(new URL(`${width}-${category}.png`, output)) });
      const selectable = page.locator('.card[data-product]');
      const longest = await selectable.evaluateAll(cards => cards.reduce((best, card, index) =>
        card.querySelector('.card-name').textContent.length > cards[best].querySelector('.card-name').textContent.length ? index : best, 0));
      const target = selectable.nth(longest);
      await target.click();
      await expect(target).toHaveAttribute('aria-pressed', 'true');
      await target.getByText('Selecionado').waitFor({ state: 'visible' });
      const selected = await target.evaluate(card => {
        const c = card.getBoundingClientRect(), name = card.querySelector('.card-name');
        const range = document.createRange(); range.selectNodeContents(name);
        return { name: name.textContent, overflow: document.documentElement.scrollWidth - innerWidth,
          textVisible: [...range.getClientRects()].every(r => r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom) };
      });
      results.at(-1).selected = selected;
      await target.screenshot({ path: fileURLToPath(new URL(`${width}-${category}-selecionado.png`, output)) });
    }
  }
  await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
  const failures = results.filter(r => r.overflow > 0 || r.selected.overflow > 0 || !r.selected.textVisible || r.cards.some(c => !c.textVisible || c.photoOverName || !c.productContained));
  console.log(JSON.stringify(failures.map(r => ({ width: r.width, category: r.category, overflow: r.overflow, cards: r.cards.filter(c => !c.textVisible || c.photoOverName || !c.productContained) })), null, 2));
  console.log(`${results.length - failures.length}/${results.length} category/viewport checks passed`);
  if (failures.length) process.exitCode = 1;
} finally { await browser.close(); }


