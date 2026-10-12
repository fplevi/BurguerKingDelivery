// Header novo e Sessão guardada na aba (ticket 01 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';
import { carrinho, checkout } from './support.js';

const cabecalho = (page) => page.getByRole('banner');
const identificacao = (page) => checkout(page).getByRole('region', { name: 'Identificação' });
const endereco = (page) => page.locator('#address-page');

/** A Whopper® in the cart, then the Identificação of the Checkout with `phone` (Mariana: Cliente cadastrado). */
async function identificar(page, phone = '61999991234') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await cabecalho(page).getByRole('button', { name: /^Carrinho · / }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(phone);
  await identificacao(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await identificacao(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
}

test('visitante: o Carrinho só com o ícone e o contador, e Identifique-se à direita dele', async ({ page }) => {
  await page.goto('/');
  const carrinhoNoHeader = cabecalho(page).getByRole('button', { name: 'Carrinho · 0' });
  await expect(carrinhoNoHeader).toHaveText('0');
  const conta = cabecalho(page).getByRole('button', { name: 'Identifique-se' });
  await expect(conta).toHaveText('Identifique-se');
  const [c, i] = [await carrinhoNoHeader.boundingBox(), await conta.boundingBox()];
  expect(i.x).toBeGreaterThan(c.x + c.width);
});

test('identificado, o header mostra o primeiro nome e leva a Minha conta', async ({ page }) => {
  await identificar(page);
  await expect(endereco(page)).toBeVisible();
  const conta = cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' });
  await expect(conta).toHaveText('Mariana');
  await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toHaveCount(0);
  await conta.click();
  await expect(page).toHaveURL(/#conta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Minha conta' })).toBeFocused();
});

test('Novo cliente com nome longo: só o primeiro nome, cortado com reticências', async ({ page }) => {
  await identificar(page, '61988887777');
  await identificacao(page).getByRole('textbox', { name: /Nome completo/ }).fill('Maximiliano-Bartolomeu-Albuquerque Souza');
  await identificacao(page).getByRole('button', { name: 'Continuar' }).click();
  const nome = cabecalho(page).locator('#account-name');
  await expect(nome).toHaveText('Maximiliano-Bartolomeu-Albuquerque');
  expect(await nome.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).textOverflow)).toBe('ellipsis');
});

test('recarregar mantém o cliente, o Carrinho e o Endereço de entrega', async ({ page }) => {
  await identificar(page);
  await endereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(checkout(page).getByRole('heading', { name: 'Endereço de entrega' })).toBeVisible();
  await page.reload();
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' })).toBeVisible();
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  // Same Checkout: no Identificação again, the Pagamento with the Casa address.
  await expect(checkout(page).getByRole('heading', { name: 'Endereço de entrega' })).toBeVisible();
  await expect(checkout(page).getByText('Av. Paulista, 1578')).toBeVisible();
});

test('uma aba nova começa sem a sessão da outra', async ({ page, context }) => {
  await identificar(page);
  await expect(endereco(page)).toBeVisible();
  const outra = await context.newPage();
  await outra.goto('/');
  await expect(cabecalho(outra).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
  await expect(cabecalho(outra).getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});
