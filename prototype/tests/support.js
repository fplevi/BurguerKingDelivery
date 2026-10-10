// Test helpers: locate things the way the customer does (roles and accessible names).
import { expect } from '@playwright/test';

/** Visible title of the full-screen Ver ingredientes dialog. */
export const TITULO = 'Ver ingredientes';

/** The full-screen "Ver ingredientes" dialog, named by its title. */
export const verIngredientes = (page) => page.getByRole('dialog', { name: TITULO, exact: true });

/** Bandeja: the aside holding removed ingredients, chips and "Recolocar todos". */
export const bandeja = (page) => verIngredientes(page).getByRole('complementary');

/** Chip in the bandeja for an ingredient; its label is "Retirar X" or "Recolocar X". */
export const chip = (page, action, name) =>
  bandeja(page)
    .getByRole('group', { name: /^Personalize seu / })
    .getByRole('button', { name: `${action} ${name}`, exact: true });

/** List of Ingredientes retirados in the bandeja, each an image button "Recolocar X". */
export const retirados = (page) => bandeja(page).getByRole('list', { name: 'Ingredientes retirados' });

/** Image of a removed ingredient in the bandeja. */
export const retirado = (page, name) =>
  retirados(page).getByRole('button', { name: `Recolocar ${name}`, exact: true });

/**
 * Camada of the opened burger. Layers and chips share the label "Retirar X";
 * the layer comes first in the dialog (stage before bandeja).
 */
export const camada = (page, name) =>
  verIngredientes(page).getByRole('button', { name: `Retirar ${name}`, exact: true }).first();

export async function openVerIngredientes(page) {
  await page.getByRole('button', { name: /Ver ingredientes/ }).click();
  await expect(verIngredientes(page)).toBeVisible();
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

/** Card of the product grid, by the product's name (the selected one also holds the badge). */
export const card = (page, nome) =>
  page.locator('#catalog').getByRole('button', { name: new RegExp(`^(Selecionado\\s*)?${nome}$`) });

/** Chooses a product in the grid, as the customer does. */
export async function escolher(page, nome) {
  await card(page, nome).click();
  await expect(card(page, nome)).toHaveAttribute('aria-pressed', 'true');
}
