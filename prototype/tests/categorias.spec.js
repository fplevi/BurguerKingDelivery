// Acompanhamentos, Bebidas and Sobremesas (ticket 04 of revisao-figma): photo-only pages, same hero and grid.
import { test, expect } from '@playwright/test';
import { card, escolher } from './support.js';

const categorias = (page) => page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
const titulo = (page) => page.getByRole('heading', { level: 1 });
const total = (page) => page.getByText('Total do item').locator('strong');
const grade = (page) => page.locator('#catalog').getByRole('button');
/** The grid's cards, in order, by name (the selected one also holds the badge). */
const nomes = (lista) => lista.map((n) => new RegExp(`^(Selecionado\s*)?${n}$`));

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Bebidas: Coca-Cola selecionada, foto, descrição, card sem combo e grade "Escolha sua bebida" na ordem do Figma', async ({ page }) => {
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(categorias(page).getByRole('link', { name: 'Bebidas' })).toHaveAttribute('aria-current', 'page');
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).not.toHaveAttribute('aria-current');
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await expect(page.getByRole('main').getByRole('img', { name: 'Coca-Cola Original' })).toBeVisible();
  await expect(page.getByText('O sabor clássico, gelado e na lata. Perfeito para acompanhar seu pedido.')).toBeVisible();
  await expect(total(page)).toHaveText('R$ 9,90');
  await expect(page.getByRole('button', { name: /Ver ingredientes/ })).toBeHidden();
  await expect(page.getByRole('checkbox', { name: 'Transformar em combo' })).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'Bebida do combo' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Escolha sua bebida' })).toBeVisible();
  await expect(grade(page)).toHaveText(nomes(['Coca-Cola', 'Coca-Cola Zero', 'Natural One Laranja', 'Natural One Uva', 'Sprite', 'Fanta Laranja', 'Água de Copo']));
  await expect(card(page, 'Coca-Cola')).toHaveAttribute('aria-pressed', 'true');
});
