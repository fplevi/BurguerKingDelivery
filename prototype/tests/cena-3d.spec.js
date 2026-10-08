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
