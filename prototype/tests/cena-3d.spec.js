import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, alterarIngredientes, camada, chip } from './support.js';

/** The hero visual: stage with the burger, "Remover ingredientes" and the note. */
const heroStage = (page) => page.locator('main #hero-stage');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('o hero desenha o Whopper em 3D, sem as ilustrações SVG', async ({ page }) => {
  await expect(heroStage(page).locator('canvas')).toBeVisible();
  await expect(heroStage(page).locator('svg').first()).toBeHidden();
});

/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });

test('o hero mostra o hambúrguer montado sem os ingredientes retirados, mais baixo', async ({ page }) => {
  await expect(heroCamada(page, 'Queijo')).toBeVisible();
  const antes = await heroCamada(page, 'Pão superior').boundingBox();

  await openAlterarIngredientes(page);
  for (const nome of ['Queijo', 'Tomate', 'Alface']) await camada(page, nome).click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(alterarIngredientes(page)).toBeHidden();

  for (const nome of ['Queijo', 'Tomate', 'Alface']) await expect(heroCamada(page, nome)).toBeHidden();
  await expect(heroCamada(page, 'Picles')).toBeVisible();
  const depois = await heroCamada(page, 'Pão superior').boundingBox();
  expect(depois.y).toBeGreaterThan(antes.y + 5);
});

/** Vertical distance between the centres of Pão inferior and Pão superior in the dialog. */
async function alturaAberta(page) {
  if (!(await alterarIngredientes(page).isVisible())) return Infinity;
  const topo = await camada(page, 'Pão superior').boundingBox();
  const base = await camada(page, 'Pão inferior').boundingBox();
  return base.y + base.height / 2 - (topo.y + topo.height / 2);
}

test('aplicar compacta as camadas abertas, com o pão superior descendo até a base', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Tomate').click();
  let aberta = 0;
  await expect.poll(async () => (aberta = await alturaAberta(page))).toBeGreaterThan(200);

  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect
    .poll(() => alturaAberta(page), { intervals: [50], timeout: 2000 })
    .toBeLessThan(aberta * 0.4);
  await expect(alterarIngredientes(page)).toBeHidden();
});
