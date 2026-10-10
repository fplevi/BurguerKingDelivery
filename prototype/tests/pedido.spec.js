import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, chip } from './support.js';

const carrinho = (page) => page.getByRole('dialog', { name: 'Seu carrinho' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Whopper personalizado chega ao carrinho com os ingredientes retirados', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Tomate').click();
  await chip(page, 'Retirar', 'Ketchup').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByRole('status')).toHaveText('Whopper adicionado ao carrinho');
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();

  await expect(carrinho(page)).toBeVisible();
  await expect(carrinho(page).getByText('Whopper Clássico · R$ 43,90')).toBeVisible();
  await expect(carrinho(page).getByText('Combo M · Sem tomate, ketchup')).toBeVisible();
  await expect(carrinho(page).getByText('Total: R$ 43,90')).toBeVisible();
});

const total = (page) => page.getByText('Total do item').locator('strong');
const combo = (page) => page.getByRole('checkbox', { name: 'Transformar em combo' });

test('o Combo começa desmarcado e soma R$ 12,00, sem tamanhos', async ({ page }) => {
  await expect(combo(page)).not.toBeChecked();
  await expect(total(page)).toHaveText('R$ 31,90');
  await combo(page).check();
  await expect(total(page)).toHaveText('R$ 43,90');
  for (const tamanho of ['P', 'M', 'G']) await expect(page.getByRole('button', { name: tamanho, exact: true })).toHaveCount(0);
  await combo(page).uncheck();
  await expect(total(page)).toHaveText('R$ 31,90');
});

const bebida = (page) => page.getByRole('combobox', { name: 'Bebida do combo' });
const bebidas = ['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Fanta Laranja', 'Natural One Laranja', 'Natural One Uva', 'Água de Copo'];

test('a Bebida do combo só se escolhe com o Combo marcado e nunca vem preenchida', async ({ page }) => {
  await expect(bebida(page)).toBeDisabled();
  await expect(bebida(page).locator('option:checked')).toHaveText('Selecione uma bebida');
  await combo(page).check();
  await expect(bebida(page)).toBeEnabled();
  await expect(bebida(page).locator('option:checked')).toHaveText('Selecione uma bebida');
  await expect(bebida(page).locator('option:not([disabled])')).toHaveText(bebidas);
  await bebida(page).selectOption('Sprite');
  await expect(total(page)).toHaveText('R$ 43,90');
  await combo(page).uncheck();
  await expect(bebida(page)).toBeDisabled();
  await expect(bebida(page).locator('option:checked')).toHaveText('Selecione uma bebida');
});

test('item pode ser removido do carrinho', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('Combo M · Todos os ingredientes')).toBeVisible();
  await carrinho(page).getByRole('button', { name: 'Remover item' }).click();
  await expect(carrinho(page).getByText('Seu carrinho está vazio.')).toBeVisible();
  await carrinho(page).getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('grade de produtos mostra os oito hambúrgueres oficiais com o Whopper selecionado', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Escolha seu hambúrguer' })).toBeVisible();
  const cards = page.locator('#catalog').getByRole('button');
  await expect(cards).toHaveCount(8);
  await expect(cards.filter({ hasText: 'Whopper Clássico' })).toHaveAttribute('aria-pressed', 'true');
  await expect(cards.filter({ hasText: 'Whopper Clássico' })).toContainText('★ Selecionado');
  await expect(cards.filter({ hasText: 'Cheddar Duplo' })).toHaveAttribute('aria-pressed', 'false');
  await expect(cards.filter({ hasText: 'Em breve neste protótipo' })).toHaveCount(6);
  for (let i = 0; i < 8; i++) {
    // The official product photo (decorative, alt="") must actually load.
    const photo = cards.nth(i).locator('img');
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  }
  for (const antigo of ['Whopper Duplo', 'Bacon Supreme', 'Cheese Burger']) await expect(cards.filter({ hasText: antigo })).toHaveCount(0);
});
