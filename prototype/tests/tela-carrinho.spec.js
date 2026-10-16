// Entering and leaving the Carrinho screen: scroll, focus, announcements and the drink list (code review of carrinho).
import { test, expect } from '@playwright/test';
import { carrinho, itens, escolher } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const botaoCarrinho = (page, n) => page.getByRole('banner').getByRole('button', { name: `Carrinho · ${n}` });
const anuncio = (page) => carrinho(page).getByRole('status');
const scrollY = (page) => page.evaluate(() => Math.round(scrollY));

/** Whopper® em combo com Coca-Cola, Cheddar Duplo e Batata Frita: um Carrinho mais alto que a tela. */
async function tresItens(page) {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Coca-Cola');
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await page.getByRole('banner').getByRole('link', { name: 'Acompanhamentos' }).click();
  await adicionar(page).click();
}

/** Focuses the header's Carrinho button, scrolls the menu down with the wheel and opens the Carrinho with Enter. */
async function abrirRolado(page) {
  await botaoCarrinho(page, 3).focus();
  await page.mouse.move(100, 400);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(100);
  const cardapio = await scrollY(page);
  await page.keyboard.press('Enter');
  await expect(carrinho(page)).toBeVisible();
  return cardapio;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('o Carrinho abre no topo, e voltar ao cardápio devolve a rolagem que o cardápio tinha', async ({ page }) => {
  await tresItens(page);
  const cardapio = await abrirRolado(page);
  await expect.poll(() => scrollY(page)).toBe(0);

  await carrinho(page).getByRole('button', { name: 'Adicionar mais itens' }).click();
  await expect(carrinho(page)).toBeHidden();
  await expect.poll(() => scrollY(page)).toBe(cardapio);
});

test('abrir o Carrinho leva o foco ao título "Seu carrinho"; voltar ao cardápio o devolve ao botão Carrinho', async ({ page }) => {
  await adicionar(page).click();
  await botaoCarrinho(page, 1).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Seu carrinho' })).toBeFocused();

  await carrinho(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(carrinho(page)).toBeHidden();
  await expect(botaoCarrinho(page, 1)).toBeFocused();
});

test('remover e mudar a Quantidade são anunciados numa região viva que não é recriada', async ({ page }) => {
  await tresItens(page);
  await botaoCarrinho(page, 3).click();
  const regiao = await anuncio(page).elementHandle();

  await itens(page).nth(1).getByRole('button', { name: 'Remover' }).click();
  await expect(anuncio(page)).toHaveText('Cheddar Duplo removido do carrinho.');
  // The visual notice with Desfazer is not a second live region.
  await expect(anuncio(page)).toHaveCount(1);

  await itens(page).nth(0).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await expect(anuncio(page)).toHaveText('Whopper®: quantidade 2');
  await itens(page).nth(0).getByRole('button', { name: 'Diminuir quantidade' }).click();
  await expect(anuncio(page)).toHaveText('Whopper®: quantidade 1');
  expect(await regiao.evaluate((el) => el.isConnected)).toBe(true);
  // Quantidade itself is no longer a live region rebuilt on every change.
  await expect(itens(page).locator('[aria-live]')).toHaveCount(0);
});

test('a lista de bebidas aberta não continua aberta depois de sair do Carrinho e voltar', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await adicionar(page).click();
  await botaoCarrinho(page, 1).click();
  const bebida = itens(page).first().getByRole('combobox', { name: 'Bebida do combo' });
  await bebida.focus();
  await page.keyboard.press('ArrowDown');
  await expect(bebida).toHaveAttribute('aria-expanded', 'true');

  await page.goBack();
  await expect(carrinho(page)).toBeHidden();
  await botaoCarrinho(page, 1).focus();
  await page.keyboard.press('Enter');
  await expect(carrinho(page)).toBeVisible();
  await expect(bebida).toHaveAttribute('aria-expanded', 'false');
  await expect(itens(page).first().getByRole('listbox')).toBeHidden();
});
