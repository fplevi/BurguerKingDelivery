import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, camada, chip, retirado, recolocarTodos, dragTo } from './support.js';

// Painel of Ver ingredientes (ticket 02): the Bandeja apart from the chips, the chips' states and icons, Recolocar todos.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

/** The original SVG used as the visible chip icon's mask. */
const icone = (botao) => botao.locator('.bk-icon:visible').evaluate(el =>
  [...el.classList].find(name => name.startsWith('chip-icon-')).replace('chip-icon-', ''));

test('a Bandeja tem só o título, o texto fixo e os ingredientes retirados', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(bandeja(page).getByRole('heading', { name: 'Ingredientes retirados' })).toBeVisible();
  await expect(bandeja(page).getByText('Arraste os ingredientes para cá.', { exact: true })).toBeVisible();
  await expect(bandeja(page).getByRole('button')).toHaveCount(0);

  await chip(page, 'Retirar', 'Queijo').click();
  await expect(retirado(page, 'Queijo')).toBeVisible();
  // The text doesn't change with the state any more.
  await expect(bandeja(page).getByText('Arraste os ingredientes para cá.', { exact: true })).toBeVisible();
  await expect(bandeja(page).getByRole('button')).toHaveCount(1);
});

test('os chips ficam fora da Bandeja, sob o título Ingredientes', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page).getByRole('heading', { name: 'Ingredientes', exact: true })).toBeVisible();
  await expect(ingredientes(page).getByRole('button')).toHaveCount(7);
  await expect(bandeja(page).getByRole('group')).toHaveCount(0);
  await expect(verIngredientes(page).getByText(/^Personalize seu/)).toHaveCount(0);
});

test('o texto de ajuda segue o dispositivo de entrada', async ({ page }, testInfo) => {
  await openVerIngredientes(page);
  const toque = testInfo.project.name === 'mobile-390';
  await expect(verIngredientes(page).getByText(`${toque ? 'Toque' : 'Clique'} para retirar ou recolocar.`, { exact: true })).toBeVisible();
});

test('Recolocar todos fica desabilitado com a Bandeja vazia', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(recolocarTodos(page)).toBeDisabled();
  await chip(page, 'Retirar', 'Picles').click();
  await expect(recolocarTodos(page)).toBeEnabled();
  await recolocarTodos(page).click();
  await expect(recolocarTodos(page)).toBeDisabled();
});

test('soltar sobre os chips, fora da Bandeja, não retira o ingrediente', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no celular os chips ficam abaixo da dobra');
  await openVerIngredientes(page);
  await dragTo(page, camada(page, 'Alface'), ingredientes(page));
  await expect(chip(page, 'Retirar', 'Alface')).toBeVisible();
  await expect(bandeja(page).getByRole('button')).toHaveCount(0);
});

test('chip presente: marrom-escuro com Check; retirado: creme com Plus', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola').click();
  const presente = chip(page, 'Retirar', 'Queijo'),
    retirada = chip(page, 'Recolocar', 'Cebola');
  await page.mouse.move(0, 0);
  await expect(presente).toHaveCSS('background-color', 'rgb(63, 18, 8)');
  await expect(retirada).toHaveCSS('background-color', 'rgb(251, 243, 232)');
  expect(await icone(presente)).toBe('check');
  expect(await icone(retirada)).toBe('plus');
  await expect(ingredientes(page)).not.toContainText(/[✓＋−]/);
});

test('no foco, o ícone do chip mostra o que o clique vai fazer', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Tomate').click();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(chip(page, 'Recolocar', 'Tomate')).toBeFocused();
  expect(await icone(chip(page, 'Recolocar', 'Tomate'))).toBe('check');
  await page.keyboard.press('Tab');
  await expect(chip(page, 'Retirar', 'Alface')).toBeFocused();
  expect(await icone(chip(page, 'Retirar', 'Alface'))).toBe('minus');
});

test('com mouse, o hover mostra a ação e dá borda marrom ao retirado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'sem hover no toque');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Ketchup').click();
  await chip(page, 'Retirar', 'Maionese').hover();
  expect(await icone(chip(page, 'Retirar', 'Maionese'))).toBe('minus');
  await chip(page, 'Recolocar', 'Ketchup').hover();
  expect(await icone(chip(page, 'Recolocar', 'Ketchup'))).toBe('check');
  await expect(chip(page, 'Recolocar', 'Ketchup')).toHaveCSS('border-color', 'rgb(63, 18, 8)');
});

test('no desktop, Bandeja de 400px e cards de 104 × 88 com a imagem da Camada', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'o celular está em layout-ver-ingredientes.spec.js');
  await openVerIngredientes(page);
  expect((await bandeja(page).boundingBox()).height).toBe(400);
  await chip(page, 'Retirar', 'Picles').click();
  const card = await retirado(page, 'Picles').boundingBox();
  expect([card.width, card.height]).toEqual([104, 88]);
  await expect(retirado(page, 'Picles').locator('img')).toHaveCount(1);
});

test('no desktop, com os 7 retirados a Bandeja rola e mantém 3 cards por linha', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no celular a Bandeja cresce em vez de rolar');
  await openVerIngredientes(page);
  for (const nome of ['Queijo', 'Picles', 'Ketchup', 'Cebola', 'Tomate', 'Alface', 'Maionese']) await chip(page, 'Retirar', nome).click();
  const lista = bandeja(page).getByRole('list', { name: 'Ingredientes retirados' });
  expect(await lista.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  const linhas = await lista.getByRole('listitem').evaluateAll((itens) => new Set(itens.map((li) => Math.round(li.getBoundingClientRect().top))).size);
  expect(linhas).toBe(3);
});
