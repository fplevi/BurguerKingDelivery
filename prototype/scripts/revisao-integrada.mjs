// Evidence through public flows; complements the per-family collectors.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buscarEndereco, resultadosDaBusca, paginaDeEndereco, openVerIngredientes, verIngredientes, chip, carrinho, checkout, formaDePagamento, pedidoConfirmado } from '../tests/support.js';

const output = new URL('../../.scratch/revisao-interfaces/evidencias/integrada/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [320, 360, 390, 768, 1023, 1024, 1025, 1160, 1280, 1919, 1920, 1921]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto(process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:4198');
    async function capture(state) {
      await page.evaluate(() => document.fonts.ready);
      await page.locator('img[src]').evaluateAll(images => Promise.all(images.map(async img => {
        img.loading = 'eager';
        await img.decode();
      })));
      const measure = await page.evaluate(() => {
        const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
        const root = document.querySelector('.playground.open') ?? [...document.querySelectorAll('main > section:not(.catalog)')].find(visible);
        const icons = [...document.querySelectorAll('.bk-icon, svg.icon, .navigation-arrow')].filter(visible).map(el => {
          const r = el.getBoundingClientRect();
          return { asset: el.getAttribute('src') ?? el.getAttribute('class'), width: r.width, height: r.height };
        });
        return { overflow: document.documentElement.scrollWidth - innerWidth, fonts: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status })), body: getComputedStyle(document.body).backgroundColor, header: getComputedStyle(document.querySelector('header')).backgroundColor, title: root?.querySelector('h1,h2')?.textContent, icons };
      });
      expect(measure.overflow, `${width}/${state}: overflow`).toBe(0);
      for (const icon of measure.icons) {
        expect(icon.width, `${width}/${state}: ${icon.asset}`).toBeGreaterThanOrEqual(16);
        expect(icon.width % 8).toBe(0);
      }
      results.push({ width, state, ...measure });
      if ([320, 390, 768, 1280, 1920].includes(width)) {
        const path = fileURLToPath(new URL(`${width}-${state}.png`, output));
        if (state === 'personalizacao') {
          await page.locator('.playground.open').evaluate(el => { el.scrollTop = 0; });
          await page.locator('.playground.open').screenshot({ path });
        } else await page.screenshot({ path, fullPage: true });
      }
    }
    await page.locator('#deliver-change').click();
    await buscarEndereco(page, 'paulista');
    await resultadosDaBusca(page).filter({ hasText: 'Avenida Paulista, 1578' }).click();
    await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
    await paginaDeEndereco(page).getByRole('textbox', { name: 'Complemento' }).fill('Apto. 21');
    await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
    await expect(page.locator('#deliver-to')).toContainText('Paulista');
    await capture('endereco-visitante');
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Tomate').click();
    await capture('personalizacao');
    await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
    await page.locator('#combo').check();
    await page.locator('#drink').click();
    await page.getByRole('option', { name: 'Coca-Cola', exact: true }).click();
    await page.locator('#qty-plus').click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.getByRole('button', { name: /^Carrinho · / }).click();
    await expect(carrinho(page)).toContainText('R$ 87,80');
    await expect(carrinho(page)).toContainText('Sem tomate');
    await capture('carrinho');
    await page.clock.runFor(3000);
    await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar', exact: true }).click();
    await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
    await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
    await capture('codigo');
    await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
    await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
    await expect(paginaDeEndereco(page).getByRole('radio').first()).toBeChecked();
    await expect(paginaDeEndereco(page)).toContainText('Paulista');
    await capture('endereco-identificado');
    await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
    await expect(checkout(page)).toContainText('R$ 87,80');
    await expect(checkout(page)).toContainText('Apto. 21');
    await formaDePagamento(page).getByRole('radio', { name: 'Pix', exact: true }).check();
    await capture('pagamento');
    await checkout(page).getByRole('button', { name: 'Gerar Pix', exact: true }).click();
    await page.clock.runFor(11_500);
    await expect(pedidoConfirmado(page)).toBeVisible();
    const back = pedidoConfirmado(page).getByRole('button', { name: 'Voltar', exact: true });
    await expect(back).toHaveCount(1);
    await capture('confirmado');
    await back.click();
    await expect(page).toHaveURL(/#hamburgueres$/);
    await page.goBack();
    await expect(pedidoConfirmado(page)).toBeVisible();
    await page.getByRole('button', { name: 'Acompanhar pedido', exact: true }).click();
    await expect(page.locator('#account-page')).toContainText('Apto. 21');
    await capture('acompanhamento');
    await page.locator('#account-page').getByRole('link', { name: 'Voltar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Meus pedidos', exact: true })).toBeVisible();
    await capture('pedidos');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Meus pedidos', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
    await page.close();
    await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
    console.log(`${width}: percurso completo aprovado`);
  }
} finally { await browser.close(); }
