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
