// Acompanhamentos, Bebidas and Sobremesas (ticket 04 of revisao-figma): photo-only pages, same hero and grid.
import { test, expect } from '@playwright/test';
import { card, escolher, openVerIngredientes, verIngredientes, chip, descricao } from './support.js';

const categorias = (page) => page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
const titulo = (page) => page.getByRole('heading', { level: 1 });
const total = (page) => page.getByText('Total do item').locator('strong');
const aumentar = (page) => page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' });
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

test('ir e voltar entre as categorias mantém a seleção de cada uma e o hambúrguer com a Personalização, o combo e a quantidade', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await aumentar(page).click();

  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await expect(titulo(page)).toHaveAccessibleName('BK® Mix de Brownie');
  await expect(total(page)).toHaveText('R$ 23,90');
  await escolher(page, 'Sundae de Chocolate');
  await expect(titulo(page)).toHaveAccessibleName('Sundae de Chocolate');
  await aumentar(page).click();
  await expect(total(page)).toHaveText('R$ 25,80');

  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await expect(page.getByRole('heading', { name: 'Escolha seu acompanhamento' })).toBeVisible();
  await expect(total(page)).toHaveText('R$ 9,90');
  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await expect(card(page, 'Sundae de Chocolate')).toHaveAttribute('aria-pressed', 'true');
  await expect(total(page)).toHaveText('R$ 25,80');

  await categorias(page).getByRole('link', { name: 'Hambúrgueres' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Cheddar Duplo');
  await expect(page.getByRole('heading', { name: 'Escolha seu hambúrguer' })).toBeVisible();
  await expect(card(page, 'Cheddar Duplo')).toHaveAttribute('aria-pressed', 'true');
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');
  await expect(page.getByRole('combobox', { name: 'Bebida do combo' }).locator('option:checked')).toHaveText('Sprite');
  await expect(total(page)).toHaveText('R$ 93,80');
  await expect(page.locator('#hero-stage canvas')).toBeVisible();
  await openVerIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Cebola crispy')).toBeVisible();
});

test('o endereço com #acompanhamentos abre a categoria, e voltar no navegador retorna à anterior', async ({ page }) => {
  await page.goto('/#acompanhamentos');
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await expect(categorias(page).getByRole('link', { name: 'Acompanhamentos' })).toHaveAttribute('aria-current', 'page');
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await page.goBack();
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await page.goto('/#qualquer-coisa');
  await expect(titulo(page)).toHaveAccessibleName('Whopper Clássico');
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
});
