import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, camada, chip, heroNote, dragTo } from './support.js';

// A device without WebGL: every webgl/webgl2 context request fails.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      return /webgl/i.test(type) ? null : getContext.call(this, type, ...rest);
    };
  });
  await page.goto('/');
});

test('sem WebGL, o hero mostra as ilustrações SVG', async ({ page }) => {
  const hero = page.locator('main #hero-stage');
  await expect(hero.locator('canvas')).toHaveCount(0);
  await expect(hero.locator('svg').first()).toBeVisible();
});

test('sem WebGL, o fluxo de retirada continua funcionando', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toHaveCount(0);
  await expect(camada(page, 'Queijo').locator('svg')).toBeVisible();

  await camada(page, 'Queijo').click();
  await dragTo(page, camada(page, 'Alface'), bandeja(page));
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await expect(chip(page, 'Recolocar', 'Alface')).toBeVisible();

  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(heroNote(page)).toHaveText('Sem queijo, alface');
});
