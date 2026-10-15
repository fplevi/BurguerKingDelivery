// Checkout at #checkout: entry, indicador de etapas and Resumo do pedido (ticket 01 of checkout).
import { test, expect } from '@playwright/test';
import { carrinho, checkout, resumoDoPedido, etapas, escolher, aviso, openVerIngredientes, chip } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const abrirCarrinho = (page) => page.getByRole('button', { name: /^Carrinho · / }).click();
const continuar = (page) =>
  carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' });
const categorias = (page) => page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });

/** Whopper® combo with Sprite and without Cebola, plus a Batata Frita: then Carrinho → Continuar. */
async function irAoCheckout(page) {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola').click();
  await page.getByRole('button', { name: 'Aplicar alterações' }).click();
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await adicionar(page).click();
  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await escolher(page, 'Batata Frita');
  await page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await adicionar(page).click();
  await abrirCarrinho(page);
  await continuar(page).click();
  await expect(checkout(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Continuar sem pendências abre o Checkout em #checkout, no topo e com o foco no título', async ({ page }) => {
  await irAoCheckout(page);
  await expect(page).toHaveURL(/#checkout$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Finalizar pedido' })).toBeFocused();
  await expect(carrinho(page)).toBeHidden();
  await expect(aviso(page)).not.toHaveText(/pagamento não faz parte/);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('o indicador de etapas começa em Identificação, sem textos de estado', async ({ page }) => {
  await irAoCheckout(page);
  await expect(etapas(page)).toHaveText(['1Identificação', '2Endereço', '3Pagamento']);
  await expect(etapas(page).nth(0)).toHaveAttribute('aria-current', 'step');
  await expect(etapas(page).nth(1)).not.toHaveAttribute('aria-current');
  await expect(etapas(page).nth(2)).not.toHaveAttribute('aria-current');
  await expect(etapas(page).nth(0).getByText('Identificação')).toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(checkout(page).getByText(/Etapa atual|Pendente|Concluído/)).toHaveCount(0);
});

test('o Resumo do pedido mostra os Itens com Combo, bebida e o que foi retirado, e o Total dos itens', async ({ page }) => {
  await irAoCheckout(page);
  const itens = resumoDoPedido(page).getByRole('list', { name: 'Itens do pedido' }).getByRole('listitem');
  await expect(itens).toHaveCount(2);
  await expect(itens.nth(0)).toContainText('1× Whopper®');
  await expect(itens.nth(0)).toContainText('R$ 43,90');
  await expect(itens.nth(0).getByText('Combo · Sprite')).toBeVisible();
  await expect(itens.nth(0).getByText('Sem cebola')).toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(itens.nth(1)).toHaveText(/^2×\sBatata\sFrita\s*R\$\s19,80$/);
  await expect(resumoDoPedido(page).getByText('Total dos itens')).toBeVisible();
  await expect(resumoDoPedido(page)).toContainText('R$ 63,70');
  await expect(resumoDoPedido(page).getByText(/cupom/i)).toHaveCount(0);
});

test('Voltar ao carrinho, Editar carrinho e o Voltar do navegador levam ao Carrinho, que ainda volta ao cardápio', async ({ page }) => {
  await irAoCheckout(page);
  await checkout(page).getByRole('button', { name: 'Voltar ao carrinho' }).click();
  await expect(carrinho(page)).toBeVisible();
  await expect(page).toHaveURL(/#carrinho$/);

  await continuar(page).click();
  await resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' }).click();
  await expect(carrinho(page)).toBeVisible();

  await continuar(page).click();
  await page.goBack();
  await expect(carrinho(page)).toBeVisible();
  // The Carrinho's own way back still goes to the category it was opened from.
  await carrinho(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#acompanhamentos$/);
  await expect(page.getByRole('heading', { name: 'Escolha seu acompanhamento' })).toBeVisible();
});

test('o Checkout não tem categoria ativa no cabeçalho', async ({ page }) => {
  await irAoCheckout(page);
  await expect(categorias(page).locator('[aria-current]')).toHaveCount(0);
  await checkout(page).getByRole('button', { name: 'Voltar ao carrinho' }).click();
  await expect(carrinho(page)).toBeVisible();
});

test('#checkout pelo endereço, ou com o carrinho vazio, mostra o Carrinho', async ({ page }) => {
  await page.goto('/#checkout');
  await expect(carrinho(page)).toBeVisible();
  await expect(page).toHaveURL(/#carrinho$/);
  await expect(checkout(page)).toBeHidden();

  await page.goto('/');
  await page.evaluate(() => (location.hash = 'checkout'));
  await expect(carrinho(page)).toBeVisible();
  await expect(page).toHaveURL(/#carrinho$/);
});

test('#checkout com um combo ainda sem bebida mostra o Carrinho', async ({ page }) => {
  await adicionar(page).click();
  await abrirCarrinho(page);
  await carrinho(page).getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.evaluate(() => (location.hash = 'checkout'));
  await expect(page).toHaveURL(/#carrinho$/);
  await expect(checkout(page)).toBeHidden();
  await expect(carrinho(page)).toBeVisible();
});
