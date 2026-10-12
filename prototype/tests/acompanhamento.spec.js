// Acompanhamento ao vivo de um Pedido confirmado (ticket 09 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';
import { irAoPagamento, checkout, formaDePagamento, confirmarEPagar, pedidoConfirmado } from './support.js';

const cartaoDeCredito = (page) => formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' });
const campo = (page, nome) => checkout(page).getByRole('textbox', { name: nome, exact: true });

const conta = (page) => page.locator('#account-page');
const regiao = (page, nome) => conta(page).getByRole('region', { name: nome, exact: true });
const etapas = (page) => regiao(page, 'Situação do pedido').getByRole('listitem');
const mapa = (page) => regiao(page, 'Acompanhe sua entrega').getByRole('img', { name: /^Mapa/ });
const whatsapp = 'https://wa.me/5561999077204?text=Ol%C3%A1%2C%20vi%20seu%20projeto%20do%20Burger%20King%20e%20gostei%20bastante.%20Podemos%20conversar%3F';

/** Mariana identified, with a Pedido of the session confirmed `ago` ms before now, on its acompanhamento. */
async function acompanhar(page, ago) {
  await page.goto('/#conta');
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
  await page.evaluate((ago) => {
    const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
    const item = { product: 'whopper', qty: 1, combo: true, drink: 'Coca-Cola', removed: ['onion'], price: 4390 };
    s.orders = [{ id: 'BK-10483', phone: s.customer.phone, confirmedAt: Date.now() - ago, address: s.customer.addresses[0], fee: 890, total: 5280, paidWith: 'Pix', items: [item] }];
    sessionStorage.setItem('bk-sessao', JSON.stringify(s));
  }, ago);
  await page.reload();
  await page.evaluate(() => (location.hash = 'conta/pedidos/BK-10483'));
  await expect(page.getByRole('heading', { level: 1, name: 'Pedido #BK-10483' })).toBeVisible();
}

test('Acompanhar pedido, na confirmação do Checkout, abre o acompanhamento do Pedido confirmado', async ({ page }) => {
  await irAoPagamento(page);
  await cartaoDeCredito(page).check();
  await campo(page, 'Código de segurança').fill('123');
  await confirmarEPagar(page).click();
  await pedidoConfirmado(page).getByRole('button', { name: 'Acompanhar pedido' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos\/BK-10483$/);
  await expect(regiao(page, 'Pedido realizado')).toContainText('Pedido #BK-10483 · Hoje,');
  await expect(regiao(page, 'Pedido realizado')).toContainText(/Chega entre \d+h\d\d e \d+h\d\d/);
  await expect(etapas(page)).toHaveCount(8);
  await expect(etapas(page).first()).toHaveAttribute('aria-current', 'step');
  // Before the retirada: the route, no entregador yet, the loja's WhatsApp.
  await expect(regiao(page, 'Acompanhe sua entrega')).toContainText('Rota entre a loja e seu endereço');
  await expect(regiao(page, 'Acompanhe sua entrega')).toContainText('Acompanhe o motoboy após a retirada');
  await expect(mapa(page)).toHaveAccessibleName('Mapa: a loja, o seu endereço e a rota');
  await expect(regiao(page, 'Entregador ainda não atribuído')).toContainText('O contato aparece após a retirada');
  await expect(conta(page).getByRole('link', { name: 'WhatsApp do entregador' })).toHaveCount(0);
  const loja = conta(page).getByRole('link', { name: 'WhatsApp da loja' });
  await expect(loja).toHaveAttribute('href', whatsapp);
  await expect(loja).toHaveAttribute('target', '_blank');
  // The Items, as paid.
  await expect(conta(page).getByRole('complementary', { name: 'Resumo do pedido' })).toContainText('Total do pedido');
  // Not a new Pedido, nor the cart back.
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('a caminho: a moto no mapa, a distância restante, o entregador com WhatsApp e a linha do tempo até ali', async ({ page }) => {
  await acompanhar(page, 55_000);
  await expect(regiao(page, 'Pedido a caminho')).toBeVisible();
  await expect(mapa(page)).toHaveAccessibleName('Mapa: a loja, o seu endereço e a rota com o entregador');
  await expect(regiao(page, 'Acompanhe sua entrega')).toContainText('Localização atualizada agora');
  await expect(regiao(page, 'Acompanhe sua entrega')).toContainText('BK → Casa · 2,4 km');
  await expect(regiao(page, 'Acompanhe sua entrega').getByRole('status')).toHaveText(/^A caminho · \d,\d km restantes$/);
  await expect(regiao(page, 'Acompanhe sua entrega')).toContainText('Av. Paulista, 1578 · Apto. 21');
  const entregador = regiao(page, 'Carlos · seu entregador');
  await expect(entregador).toContainText('Honda CG · placa ABC •••4');
  await expect(entregador.getByRole('link', { name: 'WhatsApp do entregador' })).toHaveAttribute('href', whatsapp);

  const lista = etapas(page);
  await expect(lista).toHaveText([/^Pedido realizado\d+h\d\d · Concluído$/, /^Pagamento confirmado/, /^Pedido em preparação/, /^Aguardando retirada/, /^Pedido retirado\d+h\d\d · Concluído$/, /^Pedido a caminho\d+h\d\d · Em andamento$/, 'Pedido chegouPróxima etapa', 'Pedido entreguePróxima etapa']);
  await expect(lista.nth(5)).toHaveAttribute('aria-current', 'step');
});

test('a situação avança sozinha: o entregador aparece na retirada e a moto anda até o endereço', async ({ page }) => {
  await acompanhar(page, 38_000);
  await expect(regiao(page, 'Aguardando retirada')).toBeVisible();
  await expect(regiao(page, 'Entregador ainda não atribuído')).toBeVisible();
  await expect(regiao(page, 'Pedido retirado')).toBeVisible({ timeout: 5_000 });
  await expect(regiao(page, 'Carlos · seu entregador')).toBeVisible();
  const moto = conta(page).locator('.map-rider');
  const antes = Number(await moto.getAttribute('x'));
  await expect(regiao(page, 'Acompanhe sua entrega').getByRole('status')).toHaveText(/^A caminho/, { timeout: 5_000 });
  await expect.poll(async () => Number(await moto.getAttribute('x'))).toBeGreaterThan(antes);
  // Reloading keeps the step reached (it comes from the confirmation's time).
  await page.reload();
  await expect(regiao(page, 'Carlos · seu entregador')).toBeVisible();
});

test('#BK-10482, fixo em Pedido retirado: saindo da loja, com 2,4 km restantes', async ({ page }) => {
  await acompanhar(page, 5 * 60_000);
  await page.evaluate(() => (location.hash = 'conta/pedidos/BK-10482'));
  await expect(regiao(page, 'Pedido retirado')).toBeVisible();
  await expect(regiao(page, 'Acompanhe sua entrega').getByRole('status')).toHaveText('Saindo da loja · 2,4 km restantes');
  await expect(etapas(page).nth(4)).toHaveAttribute('aria-current', 'step');
});

test('Acompanhar pedido de Minha conta e de Meus pedidos abre o mesmo acompanhamento', async ({ page }) => {
  await acompanhar(page, 15_000);
  await page.evaluate(() => (location.hash = 'conta'));
  await regiao(page, 'Pedido em andamento').getByRole('link', { name: 'Acompanhar pedido' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos\/BK-10483$/);
  await page.evaluate(() => (location.hash = 'conta/pedidos'));
  await conta(page).getByRole('link', { name: 'Acompanhar pedido #BK-10483' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos\/BK-10483$/);
  await expect(conta(page).getByRole('navigation', { name: 'Minha conta' }).locator('a[aria-current=page]')).toHaveText('Meus pedidos');
});
