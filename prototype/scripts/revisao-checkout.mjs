// Ticket 06: collect rendered states against a local Vite/preview server.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { checkout, continuarDoCarrinho, formaDePagamento, confirmarEPagar, pedidoConfirmado } from '../tests/support.js';
const output = new URL('../../.scratch/revisao-interfaces/evidencias/checkout/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921]) {
    const context = await browser.newContext({ baseURL: process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:4185', viewport: { width, height: 844 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const button = name => checkout(page).getByRole('button', { name, exact: true });
    const input = name => checkout(page).getByRole('textbox', { name, exact: true });
    async function capture(state) {
      await page.evaluate(() => document.fonts.ready);
      const measure = await page.evaluate(() => {
        const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
        const rect = el => el && ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height });
        const toast = document.querySelector('#toast');
        return { overflow: document.documentElement.scrollWidth - innerWidth,
          body: getComputedStyle(document.body).backgroundColor,
          header: getComputedStyle(document.querySelector('header')).backgroundColor,
          fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
          codeActions: [...document.querySelectorAll('.code-actions button')].filter(visible).map(el => ({ text: el.textContent, ...rect(el) })),
          toast: visible(toast) ? rect(toast) : null,
          bar: rect(document.querySelector('.pay-bar')),
          spacing: [...document.querySelectorAll('#checkout-page, #checkout-page *, #order-page, #order-page *, #signin-page, #signin-page *')].filter(visible).flatMap(el => ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'].map(property => ({ element: el.id || el.className, property, value: getComputedStyle(el)[property] }))).filter(item => item.value.endsWith('px') && ![0, 4, 8, 12, 16].includes(parseFloat(item.value)) && parseFloat(item.value) % 8 !== 0),
          brokenImages: [...document.images].filter(visible).filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
        };
      });
      expect(measure.overflow, `${width} ${state}`).toBe(0);
      if (!state.startsWith('novo-celular')) expect(measure.body).toBe('rgb(245, 235, 220)');
      expect(measure.header).toBe('rgb(250, 242, 229)');
      expect(measure.brokenImages).toEqual([]);
      expect(measure.spacing, `${width} ${state}: spacing`).toEqual([]);
      if (measure.toast && measure.bar && width < 1024) expect(measure.toast.y + measure.toast.height).toBeLessThan(measure.bar.y);
      for (let i = 1; i < measure.codeActions.length; i++) expect(measure.codeActions[i].y).toBeGreaterThanOrEqual(measure.codeActions[i-1].y + measure.codeActions[i-1].height);
      if ([320, 390, 768, 1280, 1920].includes(width)) await page.screenshot({ path: fileURLToPath(new URL(`${width}-${state}.png`, output)), fullPage: true });
      results.push({ width, state, ...measure });
    }
    await page.clock.install();
    await page.goto('/');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await continuarDoCarrinho(page);
    await page.clock.runFor(4000);
    await capture('celular');
    await input('Celular com DDD').fill('61999991234');
    await button('Receber código pelo WhatsApp').click();
    await capture('whatsapp');
    await input('Código de 6 dígitos').fill('000000');
    await button('Confirmar e continuar').click();
    await capture('codigo-incorreto');
    await button('Reenviar código').click();
    await capture('reenviado');
    await button('Receber por SMS').click();
    await capture('sms');
    await input('Código de 6 dígitos').fill('123456');
    await button('Confirmar e continuar').click();
    await page.getByRole('button', { name: 'Entregar neste endereço' }).click();
    await page.clock.runFor(4000);
    await capture('pagamento');
    await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
    await capture('cartao-salvo');
    await confirmarEPagar(page).click();
    await capture('validacao-cartao');
    await input('Código de segurança').fill('000');
    await confirmarEPagar(page).click();
    await capture('cartao-processando');
    await page.clock.runFor(1500);
    await capture('cartao-recusado');
    await button('Adicionar novo cartão').click();
    await capture('novo-cartao');
    await formaDePagamento(page).getByRole('radio', { name: 'Pix' }).check();
    await button('Gerar Pix').click();
    await capture('pix-pendente');
    await button('Copiar código Pix').click();
    await capture('pix-copiado');
    await page.clock.runFor(10_000);
    await capture('pix-aprovado');
    await page.clock.runFor(1500);
    await expect(pedidoConfirmado(page)).toBeVisible();
    await capture('pedido-confirmado');
    await page.goto('/#conta/celular');
    await page.getByRole('textbox', { name: 'Celular com DDD' }).fill('11988887777');
    await page.getByRole('button', { name: 'Receber código pelo WhatsApp', exact: true }).click();
    await capture('novo-celular-whatsapp');
    await page.getByRole('button', { name: 'Receber por SMS', exact: true }).click();
    await capture('novo-celular-sms');
    async function identify(phone) {
      await page.evaluate(() => sessionStorage.clear());
      await page.goto('/');
      await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
      await continuarDoCarrinho(page);
      await page.clock.runFor(4000);
      await input('Celular com DDD').fill(phone);
      await button('Receber código pelo WhatsApp').click();
      await input('Código de 6 dígitos').fill('123456');
      await button('Confirmar e continuar').click();
    }
    await identify('11977776666');
    await capture('novo-cliente');
    await identify('61900000000');
    await page.getByRole('button', { name: 'Entregar neste endereço' }).click();
    await formaDePagamento(page).getByRole('radio', { name: 'Pix' }).check();
    await button('Gerar Pix').click();
    await page.clock.fastForward(600_000);
    await expect(checkout(page).getByRole('heading', { name: 'Seu Pix expirou' })).toBeVisible();
    await capture('pix-expirado');
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/#identificar');
    await expect(page.getByRole('button', { name: 'Fechar', exact: true })).toHaveCount(0);
    await capture('identifique-se');
    await context.close();
  }
} finally {
  await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(`${results.length} combinações conferidas`);
