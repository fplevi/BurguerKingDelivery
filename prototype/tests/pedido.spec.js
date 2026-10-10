import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, chip, card, escolher, aviso } from './support.js';

const carrinho = (page) => page.getByRole('dialog', { name: 'Seu carrinho' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const total = (page) => page.getByText('Total do item').locator('strong');
const combo = (page) => page.getByRole('checkbox', { name: 'Transformar em combo' });
const bebida = (page) => page.getByRole('combobox', { name: 'Bebida do combo' });
const bebidas = ['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Fanta Laranja', 'Natural One Laranja', 'Natural One Uva', 'Água de Copo'];
const quantidade = (page) => page.getByRole('group', { name: 'Quantidade' });
const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });

test('Whopper personalizado chega ao carrinho com combo, bebida, quantidade e ingredientes retirados', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Tomate').click();
  await chip(page, 'Retirar', 'Ketchup').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await combo(page).check();
  await bebida(page).selectOption('Coca-Cola');
  await quantidade(page).getByRole('button', { name: 'Aumentar quantidade' }).click();

  await adicionar(page).click();
  await expect(aviso(page)).toHaveText('Adicionado ao carrinho: Whopper®');
  await page.getByRole('button', { name: 'Carrinho · 2' }).click();

  await expect(carrinho(page)).toBeVisible();
  await expect(carrinho(page).getByText('Whopper® × 2')).toBeVisible();
  await expect(carrinho(page).getByText('Combo · Coca-Cola')).toBeVisible();
  await expect(carrinho(page).getByText('Sem: tomate, ketchup')).toBeVisible();
  await expect(carrinho(page).getByText('R$ 87,80', { exact: true })).toBeVisible();
  await expect(carrinho(page).getByText('Total: R$ 87,80')).toBeVisible();
});

test('depois de adicionar, o card e o hambúrguer voltam ao padrão com o mesmo hambúrguer selecionado', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await combo(page).check();
  await bebida(page).selectOption('Sprite');
  await quantidade(page).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await adicionar(page).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Cheddar Duplo');
  await expect(card(page, 'Cheddar Duplo')).toHaveAttribute('aria-pressed', 'true');
  await expect(combo(page)).not.toBeChecked();
  await expect(bebida(page)).toBeDisabled();
  await expect(bebida(page).locator('option:checked')).toHaveText('Selecione uma bebida');
  await expect(quantidade(page)).toHaveText(/^\D*1\D*$/);
  await expect(total(page)).toHaveText('R$ 34,90');
  await openVerIngredientes(page);
  await expect(chip(page, 'Retirar', 'Cebola crispy')).toBeVisible();
});

test('Item idêntico soma na quantidade do que já está no carrinho', async ({ page }) => {
  await adicionar(page).click();
  await adicionar(page).click();
  await combo(page).check();
  await bebida(page).selectOption('Sprite');
  await adicionar(page).click();
  await page.getByRole('button', { name: 'Carrinho · 3' }).click();
  await expect(carrinho(page).getByText('Whopper® × 2')).toBeVisible();
  await expect(carrinho(page).getByText('Whopper® × 1')).toBeVisible();
  await expect(carrinho(page).getByText('Combo · Sprite')).toBeVisible();
  await expect(carrinho(page).getByText('Total: R$ 107,70')).toBeVisible();
});

test('trocar de hambúrguer volta o card ao padrão', async ({ page }) => {
  await combo(page).check();
  await bebida(page).selectOption('Sprite');
  await quantidade(page).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await escolher(page, 'Cheddar Duplo');
  await expect(combo(page)).not.toBeChecked();
  await expect(bebida(page).locator('option:checked')).toHaveText('Selecione uma bebida');
  await expect(quantidade(page)).toHaveText(/^\D*1\D*$/);
  await expect(total(page)).toHaveText('R$ 34,90');
});

test('o Combo começa desmarcado e soma R$ 12,00, sem tamanhos', async ({ page }) => {
  await expect(combo(page)).not.toBeChecked();
  await expect(total(page)).toHaveText('R$ 31,90');
  await combo(page).check();
  await expect(total(page)).toHaveText('R$ 43,90');
  for (const tamanho of ['P', 'M', 'G']) await expect(page.getByRole('button', { name: tamanho, exact: true })).toHaveCount(0);
  await combo(page).uncheck();
  await expect(total(page)).toHaveText('R$ 31,90');
});

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

test('adicionar um combo sem bebida pede a Bebida do combo e não adiciona', async ({ page }) => {
  await combo(page).check();
  const adicionar = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await expect(adicionar).toBeEnabled();
  await expect(page.getByText('Escolha a bebida do combo')).toHaveCount(0);
  await adicionar.click();
  await expect(bebida(page)).toBeFocused();
  await expect(bebida(page)).toHaveAccessibleDescription('Escolha a bebida do combo');
  await expect(bebida(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(bebida(page)).toHaveCSS('border-color', 'rgb(217, 0, 0)');
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
  await bebida(page).selectOption('Coca-Cola');
  await expect(page.getByText('Escolha a bebida do combo')).toHaveCount(0);
  await expect(bebida(page)).not.toHaveAttribute('aria-invalid', 'true');
});

test('a Quantidade começa em 1 e multiplica o Total do item', async ({ page }) => {
  const menos = quantidade(page).getByRole('button', { name: 'Diminuir quantidade' });
  const mais = quantidade(page).getByRole('button', { name: 'Aumentar quantidade' });
  await expect(quantidade(page)).toHaveText(/^\D*1\D*$/);
  await expect(menos).toBeDisabled();
  await mais.click();
  await mais.click();
  await expect(quantidade(page)).toHaveText(/^\D*3\D*$/);
  await expect(total(page)).toHaveText('R$ 95,70');
  await combo(page).check();
  await expect(total(page)).toHaveText('R$ 131,70');
  await menos.click();
  await expect(total(page)).toHaveText('R$ 87,80');
});

test('item pode ser removido do carrinho', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('Whopper® × 1')).toBeVisible();
  await carrinho(page).getByRole('button', { name: 'Remover item' }).click();
  await expect(carrinho(page).getByText('Seu carrinho está vazio.')).toBeVisible();
  await carrinho(page).getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('grade de produtos mostra os oito hambúrgueres oficiais com o Whopper selecionado', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Escolha seu hambúrguer' })).toBeVisible();
  const cards = page.locator('#catalog').getByRole('button');
  await expect(cards).toHaveCount(8);
  await expect(cards.filter({ hasText: 'Whopper®' })).toHaveAttribute('aria-pressed', 'true');
  await expect(cards.filter({ hasText: 'Whopper®' })).toContainText('Selecionado');
  await expect(cards.filter({ hasText: 'Cheddar Duplo' })).toHaveAttribute('aria-pressed', 'false');
  for (let i = 0; i < 8; i++) {
    // The official product photo (decorative, alt="") must actually load.
    const photo = cards.nth(i).locator('img');
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  }
  for (const antigo of ['Whopper Duplo', 'Bacon Supreme', 'Cheese Burger']) await expect(cards.filter({ hasText: antigo })).toHaveCount(0);
});
