// The three layouts of the Figma (ticket 03 of revisao-figma): header, hero, grid.
import { test, expect } from '@playwright/test';
import { card } from './support.js';

const cabecalho = (page) => page.getByRole('banner');
const categorias = (page) => cabecalho(page).getByRole('navigation', { name: 'Categorias' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('cabeçalho do Figma: logo, Entregar em, as quatro categorias com Hambúrgueres ativo e o carrinho com contador', async ({ page }) => {
  await expect(cabecalho(page).getByRole('link', { name: 'Burger King' }).getByRole('img')).toBeVisible();
  // Only visual: the address flow is another front.
  await expect(cabecalho(page).getByText('Entregar em', { exact: true })).toBeVisible();
  await expect(cabecalho(page).getByText('Av. Paulista, 1578 - Bela Vista', { exact: true })).toBeVisible();
  const links = categorias(page).getByRole('link');
  await expect(links).toHaveText(['Hambúrgueres', 'Acompanhamentos', 'Bebidas', 'Sobremesas']);
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
  for (const outra of ['Acompanhamentos', 'Bebidas', 'Sobremesas'])
    await expect(categorias(page).getByRole('link', { name: outra })).not.toHaveAttribute('aria-current');
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('os 6 hambúrgueres sem Receita parecem iguais aos outros, sem "Em breve", e clicar neles não faz nada', async ({ page }) => {
  await expect(page.getByText(/Em breve/)).toHaveCount(0);
  await expect(page.getByText(/estão disponíveis nesta validação/)).toHaveCount(0);
  await expect(card(page, 'Whopper Clássico')).toContainText('Selecionado');
  for (const nome of ['Stacker Duplo Bacon', 'Rodeio Duplo', 'Big King', 'Cheeseburger Duplo', 'Cheeseburger', 'Rodeio']) {
    await card(page, nome).click();
    await expect(card(page, nome)).toHaveAttribute('aria-pressed', 'false');
    await expect(card(page, nome).getByText('Selecionado')).toBeHidden();
  }
  await expect(card(page, 'Whopper Clássico')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Whopper Clássico');
  await expect(page.getByRole('status')).toBeHidden();
});

test('o preço do hambúrguer aparece só no Total do item, como no Figma', async ({ page }) => {
  await expect(page.getByRole('main').getByText('R$ 31,90', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 31,90');
});
