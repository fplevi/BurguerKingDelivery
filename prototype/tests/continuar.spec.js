// Validação do "Continuar" no Resumo do carrinho (ticket 05 of carrinho).
import { test, expect } from '@playwright/test';
import { carrinho, itens, escolher, aviso } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const abrirCarrinho = (page) => page.getByRole('button', { name: /^Carrinho · / }).click();
const continuar = (page) => carrinho(page).getByRole('button', { name: 'Continuar' });
const bebida = (item) => item.getByRole('combobox', { name: 'Bebida do combo' });
const combo = (item) => item.getByRole('checkbox', { name: 'Transformar em combo' });
const ERRO = 'Escolha a bebida do combo';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Continuar com combos sem bebida: o primeiro ganha o erro e a borda vermelha, e o seletor recebe o foco', async ({ page }) => {
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await abrirCarrinho(page);
  const [primeiro, segundo] = [itens(page).nth(0), itens(page).nth(1)];
  await combo(primeiro).check();
  await combo(segundo).check();
  await expect(carrinho(page).getByText(ERRO)).toHaveCount(0);

  await continuar(page).click();
  await expect(bebida(primeiro)).toBeFocused();
  await expect(bebida(primeiro)).toHaveAttribute('aria-invalid', 'true');
  await expect(bebida(primeiro)).toHaveAccessibleDescription(ERRO);
  await expect(bebida(primeiro)).toHaveCSS('border-top-color', 'rgb(217, 0, 0)');
  await expect(primeiro.getByText(ERRO, { exact: true })).toBeVisible();
  // Only the first one.
  await expect(segundo.getByText(ERRO)).toHaveCount(0);
  await expect(bebida(segundo)).not.toHaveAttribute('aria-invalid', 'true');
});

test('Continuar rola a tela até o combo sem bebida', async ({ page }, testInfo) => {
  const categoria = (nome) => page.getByRole('banner').getByRole('link', { name: nome }).click();
  await categoria('Bebidas');
  await adicionar(page).click();
  await categoria('Acompanhamentos');
  await adicionar(page).click();
  await categoria('Hambúrgueres');
  await adicionar(page).click();
  await categoria('Sobremesas');
  await adicionar(page).click();
  await categoria('Hambúrgueres');
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await abrirCarrinho(page);
  // Out of sight from Continuar: on the desktop the Resumo is at the top, so the last Item; on the phone it closes the list, so the Whopper®.
  const alvo = itens(page).nth(testInfo.project.name === 'desktop' ? 4 : 2);
  await combo(alvo).check();
  await continuar(page).scrollIntoViewIfNeeded();
  await expect(alvo).not.toBeInViewport();

  await continuar(page).click();
  await expect(alvo).toBeInViewport();
  await expect(bebida(alvo)).toBeFocused();
});

test('o erro some ao escolher a bebida ou ao desmarcar o combo', async ({ page }) => {
  await adicionar(page).click();
  await abrirCarrinho(page);
  const item = itens(page).first();
  await combo(item).check();
  await continuar(page).click();
  await expect(item.getByText(ERRO)).toBeVisible();

  await bebida(item).click();
  await item.getByRole('option', { name: 'Sprite' }).click();
  await expect(item.getByText(ERRO)).toHaveCount(0);
  await expect(bebida(item)).not.toHaveAttribute('aria-invalid', 'true');

  await combo(item).uncheck();
  await combo(item).check();
  await continuar(page).click();
  await expect(item.getByText(ERRO)).toBeVisible();
  await combo(item).uncheck();
  await expect(item.getByText(ERRO)).toHaveCount(0);
  await expect(bebida(item)).not.toHaveAttribute('aria-invalid', 'true');
});

test('Continuar sem pendências avisa que o pagamento não faz parte do protótipo', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await abrirCarrinho(page);
  await continuar(page).click();
  await expect(aviso(page)).toHaveText('Tudo certo! O pagamento não faz parte deste protótipo.');
  await expect(carrinho(page).getByText(ERRO)).toHaveCount(0);
});
