// Layouts of Ver ingredientes (ticket 03 of ver-ingredientes; Figma 284-11569 desktop and 294-11399 below 1024px).
import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, chip, retirado, recolocarTodos, TITULO } from './support.js';

const acao = (page, nome) => verIngredientes(page).getByRole('button', { name: nome, exact: true });
const caixa = async (locator) => {
  await expect(locator).toBeVisible();
  return locator.boundingBox();
};
/** Scrolls the dialog (it scrolls itself; the page under it stays put). */
const rolar = (page, y) => verIngredientes(page).evaluate((el, y) => el.scrollTo(0, y), y);
const semRolagemHorizontal = async (page) =>
  expect(await verIngredientes(page).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('celular (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the 390 × 844 project');

  test('390: Cancelar e Aplicar alterações numa barra fixa embaixo, que fica na tela ao rolar', async ({ page }) => {
    await openVerIngredientes(page);
    const embaixo = async () => {
      const [cancelar, aplicar] = [await caixa(acao(page, 'Cancelar')), await caixa(acao(page, 'Aplicar alterações'))];
      expect(Math.abs(cancelar.y + cancelar.height + 24 - 844)).toBeLessThanOrEqual(1);
      expect(aplicar.y).toBe(cancelar.y);
      expect(cancelar.x).toBe(16);
      expect(Math.round(aplicar.x + aplicar.width)).toBe(390 - 16);
    };
    await embaixo();
    await rolar(page, 2000);
    await expect.poll(() => verIngredientes(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await embaixo();
  });

  test('390: o cabeçalho tem só o título', async ({ page }) => {
    await openVerIngredientes(page);
    const titulo = await caixa(verIngredientes(page).getByRole('heading', { name: TITULO }));
    expect(titulo.y).toBeLessThan(76);
    const cancelar = await caixa(acao(page, 'Cancelar'));
    expect(cancelar.y).toBeGreaterThan(844 / 2);
  });

  test('390: uma coluna — palco com a legenda, Bandeja, chips e Recolocar todos, que termina acima da barra', async ({ page }) => {
    await openVerIngredientes(page);
    const legenda = await caixa(verIngredientes(page).getByText('O seu Whopper® do seu jeito.'));
    const b = await caixa(bandeja(page));
    expect(b.y).toBeGreaterThan(legenda.y + legenda.height);
    expect(b.x).toBe(16);
    expect(b.width).toBe(358);
    expect(b.height).toBe(213);
    const c = await caixa(ingredientes(page));
    expect(c.y).toBeGreaterThan(b.y + b.height);

    await rolar(page, 5000);
    const [r, cancelar] = [await caixa(recolocarTodos(page)), await caixa(acao(page, 'Cancelar'))];
    expect(r.y + r.height).toBeLessThanOrEqual(cancelar.y - 24);
    await semRolagemHorizontal(page);
  });

  test('390: cards de 94 × 88; a Bandeja cresce uma linha a partir do 4º ingrediente', async ({ page }) => {
    await openVerIngredientes(page);
    for (const nome of ['Queijo', 'Picles', 'Ketchup']) await chip(page, 'Retirar', nome).click();
    const card = await caixa(retirado(page, 'Picles'));
    expect([card.width, card.height]).toEqual([94, 88]);
    expect((await caixa(bandeja(page))).height).toBe(213);
    await chip(page, 'Retirar', 'Cebola').click();
    expect((await caixa(bandeja(page))).height).toBe(213 + 88 + 8);
  });
});

test.describe('tablet (768 de largura)', () => {
  test.skip(({ isMobile }) => isMobile, 'set in the desktop project');
  test.use({ viewport: { width: 768, height: 1024 } });

  test('768: também uma coluna, com a barra fixa embaixo', async ({ page }) => {
    await openVerIngredientes(page);
    const [palco, b] = [await caixa(verIngredientes(page).getByText('O seu Whopper® do seu jeito.')), await caixa(bandeja(page))];
    expect(b.y).toBeGreaterThan(palco.y);
    const cancelar = await caixa(acao(page, 'Cancelar'));
    expect(Math.abs(cancelar.y + cancelar.height + 24 - 1024)).toBeLessThanOrEqual(1);
    await semRolagemHorizontal(page);
  });
});

test.describe('desktop (≥ 1024px)', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('1024: palco e painel de 440px lado a lado, ações no cabeçalho', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await openVerIngredientes(page);
    const painel = await caixa(bandeja(page));
    expect(Math.round(painel.x + painel.width)).toBe(1024 - 24);
    expect(painel.width).toBe(392);
    const [titulo, cancelar] = [await caixa(verIngredientes(page).getByRole('heading', { name: TITULO })), await caixa(acao(page, 'Cancelar'))];
    expect(Math.abs(cancelar.y + cancelar.height / 2 - (titulo.y + titulo.height / 2))).toBeLessThan(8);
  });
});
