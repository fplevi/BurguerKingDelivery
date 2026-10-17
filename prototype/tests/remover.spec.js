// Remover Item com Desfazer (ticket 04 of carrinho).
import { test, expect } from '@playwright/test';
import { carrinho, itens, totalDoItem, totalDosItens, escolher } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const categoria = (page, nome) => page.getByRole('banner').getByRole('link', { name: nome }).click();
const removido = (page) => carrinho(page).getByRole('group', { name: 'Item removido' });
const desfazer = (page) => carrinho(page).getByRole('button', { name: 'Desfazer' });

/** Whopper® (Quantidade 2), Cheddar Duplo em combo com Sprite e Batata Frita, e abre o Carrinho. */
async function tresItens(page) {
  await page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).click();
  await page.getByRole('option', { name: 'Sprite', exact: true }).click();
  await adicionar(page).click();
  await categoria(page, 'Acompanhamentos');
  await escolher(page, 'Batata Frita');
  await adicionar(page).click();
  await page.getByRole('button', { name: 'Carrinho · 4' }).click();
  await expect(itens(page)).toHaveCount(3);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Remover tira o Item na hora e avisa "<nome> removido do carrinho."; Resumo, subtítulo e contador acompanham', async ({ page }) => {
  await tresItens(page);
  await expect(totalDosItens(page)).toHaveText('R$ 120,60');

  await itens(page).nth(1).getByRole('button', { name: 'Remover' }).click();
  await expect(itens(page)).toHaveCount(2);
  await expect(itens(page).getByRole('heading')).toHaveText(['Whopper®', 'Batata Frita']);
  await expect(removido(page)).toContainText('Cheddar Duplo removido do carrinho.');
  await expect(desfazer(page)).toBeVisible();
  await expect(totalDosItens(page)).toHaveText('R$ 73,70');
  await expect(carrinho(page).getByText('3 unidades em 2 itens', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Carrinho · 3' })).toBeVisible();
});

test('Desfazer devolve o Item na mesma posição e configuração, e o aviso some', async ({ page }) => {
  await tresItens(page);
  await itens(page).nth(1).getByRole('button', { name: 'Remover' }).click();
  await expect(desfazer(page)).toBeFocused();

  await desfazer(page).click();
  await expect(removido(page)).toHaveCount(0);
  await expect(itens(page).getByRole('heading')).toHaveText(['Whopper®', 'Cheddar Duplo', 'Batata Frita']);
  const cheddar = itens(page).nth(1);
  await expect(cheddar.getByRole('checkbox', { name: 'Transformar em combo' })).toBeChecked();
  await expect(cheddar.getByRole('combobox', { name: 'Bebida do combo' })).toHaveText('Sprite');
  await expect(totalDoItem(cheddar)).toHaveText('R$ 46,90');
  await expect(cheddar.getByRole('button', { name: 'Remover' })).toBeFocused();
  await expect(totalDosItens(page)).toHaveText('R$ 120,60');
  await expect(page.getByRole('button', { name: 'Carrinho · 4' })).toBeVisible();
});

test('o aviso some na próxima mudança do carrinho, e Desfazer some com ele', async ({ page }) => {
  await tresItens(page);
  await itens(page).nth(0).getByRole('button', { name: 'Remover' }).click();
  await expect(removido(page)).toContainText('Whopper® removido do carrinho.');

  await itens(page).nth(1).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await expect(totalDoItem(itens(page).nth(1))).toHaveText('R$ 19,80');
  await expect(removido(page)).toHaveCount(0);
  await expect(desfazer(page)).toHaveCount(0);

  // Remover outro troca o aviso: só o último removido volta.
  await itens(page).nth(0).getByRole('button', { name: 'Remover' }).click();
  await itens(page).nth(0).getByRole('button', { name: 'Remover' }).click();
  await expect(removido(page)).toContainText('Batata Frita removido do carrinho.');
  await desfazer(page).click();
  await expect(itens(page).getByRole('heading')).toHaveText(['Batata Frita']);
});

test('remover o último Item mostra o estado vazio com o aviso; Desfazer traz o Item de volta', async ({ page }) => {
  await categoria(page, 'Sobremesas');
  await escolher(page, 'BK® Mix de Brownie');
  await adicionar(page).click();
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await itens(page).first().getByRole('button', { name: 'Remover' }).click();

  await expect(carrinho(page).getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await expect(removido(page)).toContainText('BK® Mix de Brownie removido do carrinho.');
  await expect(carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();

  await desfazer(page).click();
  await expect(itens(page).getByRole('heading')).toHaveText(['BK® Mix de Brownie']);
  await expect(carrinho(page).getByText('1 item no carrinho', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
});

test('o aviso some ao sair da tela do Carrinho', async ({ page }) => {
  await tresItens(page);
  await itens(page).nth(2).getByRole('button', { name: 'Remover' }).click();
  await expect(removido(page)).toBeVisible();

  await carrinho(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Carrinho · 3' }).click();
  await expect(itens(page)).toHaveCount(2);
  await expect(removido(page)).toHaveCount(0);
});
