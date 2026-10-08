import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, alterarIngredientes, bandeja, camada, chip, retirado, retirados } from './support.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

/** The picture inside a bandeja button actually shows something (3D image or SVG). */
async function expectPicture(button) {
  const image = button.locator('img');
  if (await image.count()) {
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  } else {
    await expect(button.locator('svg')).toBeVisible();
  }
}

test('o ingrediente retirado aparece na bandeja como imagem da própria camada', async ({ page }) => {
  await openAlterarIngredientes(page);
  await expect(retirados(page).getByRole('button')).toHaveCount(0);
  await camada(page, 'Queijo').click();
  await expect(retirado(page, 'Queijo')).toBeVisible();
  await expect(retirado(page, 'Queijo').locator('img')).toHaveCount(1);
  await expectPicture(retirado(page, 'Queijo'));
});

test('tocar na imagem da bandeja recoloca o ingrediente e atualiza o chip', async ({ page }) => {
  await openAlterarIngredientes(page);
  await camada(page, 'Tomate').click();
  await chip(page, 'Retirar', 'Alface').click();
  await expect(retirados(page).getByRole('button')).toHaveCount(2);

  await retirado(page, 'Tomate').click();
  await expect(retirado(page, 'Tomate')).toHaveCount(0);
  await expect(chip(page, 'Retirar', 'Tomate')).toHaveAttribute('aria-pressed', 'true');
  await expect(camada(page, 'Tomate')).toBeVisible();
  // Focus stays in the bandeja while something is left there.
  await expect(retirado(page, 'Alface')).toBeFocused();
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Sem alface ·')).toBeVisible();
});

test('a imagem da bandeja recoloca pelo teclado', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Cebola').click();
  await retirado(page, 'Cebola').focus();
  await page.keyboard.press('Enter');
  await expect(retirado(page, 'Cebola')).toHaveCount(0);
  await expect(chip(page, 'Retirar', 'Cebola')).toBeFocused();
});

test('recolocar pelo chip tira a imagem da bandeja', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await expect(retirado(page, 'Picles')).toBeVisible();
  await chip(page, 'Recolocar', 'Picles').click();
  await expect(retirado(page, 'Picles')).toHaveCount(0);
});

test('Recolocar todos esvazia a bandeja e cancelar descarta o rascunho', async ({ page }) => {
  await openAlterarIngredientes(page);
  for (const nome of ['Queijo', 'Ketchup', 'Maionese']) await chip(page, 'Retirar', nome).click();
  await expect(retirados(page).getByRole('button')).toHaveCount(3);
  await bandeja(page).getByRole('button', { name: 'Recolocar todos' }).click();
  await expect(retirados(page).getByRole('button')).toHaveCount(0);

  await chip(page, 'Retirar', 'Ketchup').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await openAlterarIngredientes(page);
  await expect(retirados(page).getByRole('button')).toHaveCount(0);

  // An applied Personalização comes back into the bandeja when reopening.
  await chip(page, 'Retirar', 'Ketchup').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(alterarIngredientes(page)).toBeHidden();
  await openAlterarIngredientes(page);
  await expect(retirado(page, 'Ketchup')).toBeVisible();
  await expectPicture(retirado(page, 'Ketchup'));
});

test.describe('sem WebGL', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl/i.test(type) ? null : getContext.call(this, type, ...rest);
      };
    });
    await page.goto('/');
  });

  test('a bandeja mostra a ilustração SVG do ingrediente e recoloca ao tocar', async ({ page }) => {
    await openAlterarIngredientes(page);
    await camada(page, 'Queijo').click();
    await expect(retirado(page, 'Queijo').locator('svg')).toBeVisible();
    await retirado(page, 'Queijo').click();
    await expect(chip(page, 'Retirar', 'Queijo')).toHaveAttribute('aria-pressed', 'true');
  });
});
