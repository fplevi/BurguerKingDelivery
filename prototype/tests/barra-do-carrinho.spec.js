import { test, expect } from '@playwright/test';
import { carrinho, itens } from './support.js';

const barra = (page) => page.getByRole('complementary', { name: 'Barra do carrinho' });
const finalizar = (page) => barra(page).getByRole('button', { name: 'Finalizar pedido' });

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('conta unidades adicionadas, soma categorias e volta ao estado vazio', async ({ page }) => {
  await expect(finalizar(page)).toBeDisabled();
  await expect(barra(page)).toContainText('0 itens');
  await expect(barra(page)).toContainText('R$ 0,00');
  await page.getByRole('button', { name: 'Aumentar quantidade', exact: true }).click();
  await expect(finalizar(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(barra(page)).toContainText('2 itens');
  await expect(barra(page)).toContainText('R$ 63,80');
  for (const categoria of ['Acompanhamentos', 'Bebidas', 'Sobremesas', 'Hambúrgueres']) {
    await page.getByRole('banner').getByRole('link', { name: categoria, exact: true }).click();
    await expect(barra(page)).toContainText('2 itens');
    await expect(finalizar(page)).toBeEnabled();
  }
  await page.getByRole('banner').getByRole('link', { name: 'Bebidas', exact: true }).click();
  const preco = await page.locator('#total').textContent();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(barra(page)).toContainText('3 itens');
  await finalizar(page).click();
  await expect(carrinho(page)).toBeVisible();
  await expect(barra(page)).toBeHidden();
  await expect(itens(page).nth(1)).toContainText(preco);
  await itens(page).first().getByRole('button', { name: 'Remover', exact: true }).click();
  await itens(page).first().getByRole('button', { name: 'Remover', exact: true }).click();
  await carrinho(page).getByRole('button', { name: 'Explorar cardápio' }).click();
  await expect(finalizar(page)).toBeDisabled();
  await expect(barra(page)).toContainText('0 itens');
  await expect(barra(page)).toContainText('R$ 0,00');
});

test('abre revisão por teclado, restaura foco e respeita as outras telas', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(barra(page)).toContainText('1 item');
  await finalizar(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Seu carrinho', exact: true })).toBeFocused();
  await carrinho(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(finalizar(page)).toBeFocused();
  await page.getByRole('button', { name: 'Ver ingredientes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Ver ingredientes', exact: true })).toBeVisible();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(barra(page)).toBeVisible();
  await page.goto('/#checkout');
  await expect(barra(page)).toBeHidden();
  await page.goto('/#endereco');
  await expect(barra(page)).toBeHidden();
});

test('barra fixa, notificações e último produto ficam acessíveis nos breakpoints existentes', async ({ page }, testInfo) => {
  for (const width of [390, 1023, 1024, 1280, 1919, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#hamburgueres');
    await expect(barra(page)).toBeVisible();
    const box = await barra(page).boundingBox();
    expect(Math.abs(box.y + box.height - 844)).toBeLessThanOrEqual(1);
    expect(box.width).toBe(width);
    const summary = await page.locator('.menu-cart-summary').boundingBox();
    const button = await finalizar(page).boundingBox();
    if (width < 1024) expect(button.y).toBeGreaterThanOrEqual(summary.y + summary.height);
    else expect(button.x).toBeGreaterThan(summary.x + summary.width);
    const last = page.locator('#grid .card').last();
    await last.scrollIntoViewIfNeeded();
    expect((await last.boundingBox()).y + (await last.boundingBox()).height).toBeLessThanOrEqual(box.y + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    if ([390, 1280, 1920].includes(width) && testInfo.project.name === 'desktop') {
      await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('#catalog').scrollTop = 0; });
      await page.screenshot({ path: testInfo.outputPath(`barra-${width}.png`) });
    }
  }
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.locator('#toast')).toBeVisible();
  const toast = await page.locator('#toast').boundingBox();
  expect(toast.y + toast.height).toBeLessThan((await barra(page).boundingBox()).y);
});
