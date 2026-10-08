import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, alterarIngredientes, camada } from './support.js';

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
