// Rendered evidence for ticket 07 through the existing account browser flows.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../../.scratch/revisao-interfaces/evidencias/conta/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    const root = page.locator('#account-page');
    const button = name => root.getByRole('button', { name, exact: true });
    async function capture(state) {
      await page.evaluate(() => document.fonts.ready);
      const measure = await page.evaluate(() => {
        const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          body: getComputedStyle(document.body).backgroundColor,
          header: getComputedStyle(document.querySelector('header')).backgroundColor,
          fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
          spacing: [...document.querySelectorAll('#account-page, #account-page *')].filter(visible).flatMap(el => ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'].map(property => ({ element: el.id || el.className.baseVal || el.className, property, value: getComputedStyle(el)[property] }))).filter(item => item.value.endsWith('px') && ![0, 4, 8, 12, 16].includes(parseFloat(item.value)) && parseFloat(item.value) % 8 !== 0 && item.element !== 'account-page'),
          actions: [...document.querySelectorAll('#account-page .code-actions button')].filter(visible).map(el => ({ text: el.textContent, y: el.getBoundingClientRect().y, height: el.getBoundingClientRect().height })),
          icons: [...document.querySelectorAll('#account-page .account-nav svg')].filter(visible).map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })),
        };
      });
      expect(measure.overflow, `${width} ${state}`).toBe(0);
      expect(measure.body).toBe('rgb(245, 235, 220)');
      expect(measure.header).toBe('rgb(250, 242, 229)');
      expect(measure.spacing, `${width} ${state}`).toEqual([]);
      for (const icon of measure.icons) expect(icon).toEqual({ width: 24, height: 24 });
      for (let i = 1; i < measure.actions.length; i++) expect(measure.actions[i].y).toBeGreaterThanOrEqual(measure.actions[i - 1].y + measure.actions[i - 1].height);
      if ([390, 768, 1280, 1920].includes(width)) await page.screenshot({ path: fileURLToPath(new URL(`${width}-${state}.png`, output)), fullPage: true });
      results.push({ width, state, ...measure });
    }
    await page.clock.install();
    await page.goto(`${process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:4190'}/#conta`);
    const id = page.locator('#signin-content');
    await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
    await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
    await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
    await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
    for (const route of ['conta', 'conta/dados', 'conta/enderecos', 'conta/pagamentos', 'conta/cartao', 'conta/sair', 'conta/celular']) {
      await page.evaluate(hash => { location.hash = hash; }, route);
      await expect(page).toHaveURL(new RegExp(`#${route}$`));
      await expect(root).toBeVisible();
      await capture(route.replaceAll('/', '-'));
    }
    await root.getByRole('textbox', { name: 'Celular com DDD' }).fill('11988884321');
    await button('Receber código pelo WhatsApp').click();
    await capture('novo-celular-whatsapp');
    await root.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('000000');
    await button('Confirmar e continuar').click();
    await capture('novo-celular-incorreto');
    await button('Reenviar código').click();
    await capture('novo-celular-reenvio');
    await button('Receber por SMS').click();
    await capture('novo-celular-sms');
    await root.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
    await button('Confirmar e continuar').click();
    await expect(page).toHaveURL(/#conta\/dados$/);
    await capture('celular-atualizado');
    await page.clock.runFor(3000);
    await root.getByRole('textbox', { name: 'Nome completo' }).fill('');
    await button('Salvar alterações').click();
    await capture('dados-invalidos');
    await root.getByRole('textbox', { name: 'Nome completo' }).fill('Mariana Silva');
    await button('Salvar alterações').click();
    await capture('dados-salvos');
    await page.clock.runFor(3000);
    await page.evaluate(() => { location.hash = 'conta/celular'; });
    await root.getByRole('textbox', { name: 'Celular com DDD' }).fill('61900000000');
    await button('Receber código pelo WhatsApp').click();
    await root.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
    await button('Confirmar e continuar').click();
    await capture('celular-vinculado');
    await root.getByRole('link', { name: 'Voltar', exact: true }).click();
    await expect(page).toHaveURL(/#conta\/dados$/);
    await page.evaluate(() => { location.hash = 'conta/enderecos'; });
    for (const label of ['Trabalho', 'Casa']) {
      await root.getByRole('button', { name: `Remover endereço ${label}`, exact: true }).click();
      await capture(`remover-endereco-${label}`);
      await button('Remover endereço').click();
      await expect(page).toHaveURL(/#conta\/enderecos$/);
      await capture(`endereco-removido-${label}`);
      await page.clock.runFor(3000);
    }
    await expect(root.getByText('Nenhum endereço salvo')).toBeVisible();
    await page.evaluate(() => { location.hash = 'conta/pagamentos'; });
    while (await root.locator('[data-card-remove]').count()) {
      await root.locator('[data-card-remove]').first().click();
      await capture('remover-cartao');
      await button('Remover cartão').click();
      await expect(page).toHaveURL(/#conta\/pagamentos$/);
    }
    await capture('nenhum-cartao');
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
console.log(`${results.length} combinações verificadas.`);
