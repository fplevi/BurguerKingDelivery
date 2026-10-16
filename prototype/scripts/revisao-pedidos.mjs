// Visual evidence through the existing account flow; session fixtures freeze each Situação.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../../.scratch/revisao-interfaces/evidencias/pedidos/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [320, 359, 360, 390, 768, 1023, 1024, 1025, 1158, 1159, 1160, 1161, 1280, 1919, 1920, 1921]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto(`${process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:4190'}/#conta/pedidos`);
    const root = page.locator('#account-page');
    const id = page.locator('#signin-content');
    await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
    await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
    await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
    await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
    await expect(root.getByRole('heading', { name: 'Pedido #BK-10482', exact: true })).toBeVisible();
    async function capture(state) {
      await page.evaluate(() => document.fonts.ready);
      const measure = await page.evaluate(() => {
        const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
        const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
        const all = [...document.querySelectorAll('#account-page, #account-page *')].filter(visible);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          body: getComputedStyle(document.body).backgroundColor,
          header: getComputedStyle(document.querySelector('header')).backgroundColor,
          fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
          spacing: all.flatMap(el => ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'].map(property => ({ element: el.id || el.className.baseVal || el.className, property, value: getComputedStyle(el)[property] }))).filter(item => item.value.endsWith('px') && ![0, 4, 8, 12, 16].includes(parseFloat(item.value)) && parseFloat(item.value) % 8 !== 0 && item.element !== 'account-page'),
          headings: [...document.querySelectorAll('#account-page h2')].map(el => ({ text: el.textContent, family: getComputedStyle(el).fontFamily, weight: getComputedStyle(el).fontWeight })),
          controls: all.filter(el => el.matches('.account-action')).map(el => ({ text: el.textContent, ...box(el), overflow: el.scrollWidth > el.clientWidth + 1 })),
          back: all.filter(el => el.matches('a') && el.textContent.trim() === 'Voltar').map(el => el.getAttribute('href')),
          map: document.querySelector('.track-map') ? box(document.querySelector('.track-map')) : null,
          pins: [...document.querySelectorAll('.track-map image')].map(el => ({ src: el.getAttribute('href'), width: el.getAttribute('width'), height: el.getAttribute('height') })),
          icons: all.filter(el => el.matches('.track-whatsapp-icon')).map(box),
          clipped: all.filter(el => el.matches('h1,h2,p,.tl-name,.tl-when')).filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent),
        };
      });
      results.push({ width, state, ...measure });
      await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
      expect(measure.overflow, `${width} ${state}`).toBe(0);
      expect(measure.spacing, `${width} ${state}`).toEqual([]);
      expect(measure.clipped, `${width} ${state}`).toEqual([]);
      expect(measure.body).toBe('rgb(245, 235, 220)');
      expect(measure.header).toBe('rgb(250, 242, 229)');
      for (const c of measure.controls) { expect(c.height).toBeGreaterThanOrEqual(48); expect(c.overflow).toBe(false); }
      for (const icon of measure.icons) { expect(icon.width).toBe(16); expect(icon.height).toBe(16); }
      if ([320, 390, 768, 1024, 1160, 1280, 1920].includes(width)) await page.screenshot({ path: fileURLToPath(new URL(`${width}-${state}.png`, output)), fullPage: true });
    }
    await capture('lista');
    await root.getByRole('link', { name: 'Acompanhar pedido #BK-10482', exact: true }).click();
    await expect(root.locator('.track')).toBeVisible();
    await capture('retirado-fixo');
    await root.getByRole('link', { name: 'Voltar', exact: true }).click();
    await expect(page).toHaveURL(/#conta\/pedidos$/);
    for (const order of ['BK-10397', 'BK-10276']) {
      await root.getByRole('link', { name: `Ver detalhes do pedido #${order}`, exact: true }).click();
      await expect(root.locator('.track')).toBeVisible();
      await capture(order === 'BK-10397' ? 'entregue' : 'cancelado');
      await root.getByRole('link', { name: 'Voltar', exact: true }).click();
    }
    for (let step = 0; step < 8; step++) {
      await page.evaluate(step => {
        const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
        s.orders = [{ id: 'BK-10483', phone: s.customer.phone, confirmedAt: Date.now() - step * 10000, address: s.customer.addresses[0], fee: 890, total: 5280, paidWith: 'Pix', items: [{ product: 'whopper', qty: 1, combo: true, drink: 'Coca-Cola', removed: ['onion'], price: 4390 }] }];
        sessionStorage.setItem('bk-sessao', JSON.stringify(s));
      }, step);
      await page.reload();
      await page.evaluate(() => { location.hash = 'conta/pedidos/BK-10483'; });
      await expect(root.locator('.track')).toBeVisible();
      await capture(`etapa-${step}`);
    }
    await page.evaluate(() => {
      const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
      s.customer.phone = '11988884321'; s.customer.key = '11988884321'; s.orders = [];
      sessionStorage.setItem('bk-sessao', JSON.stringify(s));
    });
    await page.reload();
    await page.evaluate(() => { location.hash = 'conta/pedidos'; });
    await expect(root.locator('.orders-empty')).toBeVisible();
    await capture('vazio');
    await root.getByRole('link', { name: 'Voltar', exact: true }).click();
    await expect(page).toHaveURL(/#conta$/);
    await page.close();
  }
} finally { await browser.close(); }
console.log(`${results.length} combinações verificadas`);
