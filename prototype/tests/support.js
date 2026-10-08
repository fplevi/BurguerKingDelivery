// Test helpers: locate things the way the customer does (roles and accessible names).
import { expect } from '@playwright/test';

/** The full-screen "Alterar ingredientes" dialog (its visible title is still "Do seu jeito."). */
export const alterarIngredientes = (page) => page.getByRole('dialog', { name: 'Do seu jeito.' });

/** Bandeja: the aside holding removed ingredients, chips and "Recolocar todos". */
export const bandeja = (page) => alterarIngredientes(page).getByRole('complementary');

/** Chip in the bandeja for an ingredient; its label is "Retirar X" or "Recolocar X". */
export const chip = (page, action, name) =>
  bandeja(page).getByRole('button', { name: `${action} ${name}`, exact: true });

/**
 * Camada of the opened burger. Layers and chips share the label "Retirar X";
 * the layer comes first in the dialog (stage before bandeja).
 */
export const camada = (page, name) =>
  alterarIngredientes(page).getByRole('button', { name: `Retirar ${name}`, exact: true }).first();

export async function openAlterarIngredientes(page) {
  await page.getByRole('button', { name: /Remover ingredientes/ }).click();
  await expect(alterarIngredientes(page)).toBeVisible();
}

/** Press on `source`, move the pointer in steps and release over the centre of `target`. */
export async function dragTo(page, source, target) {
  await source.hover();
  await page.mouse.down();
  const box = await target.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** Text under the hero burger describing the applied Personalização. */
export const heroNote = (page) => page.locator('main').getByText(/^(Sem |Preparado com todos)/);
