// Pagamento com Pix: Pix pendente, copiar, aprovação em 10 s, expiração em 10:00 e outra forma de pagamento (ticket 07 of checkout).
import { test, expect } from '@playwright/test';
import { checkout, etapas, resumoDoPedido, irAoPagamento, formaDePagamento, pedidoConfirmado, aviso, gerarPix, pixPendente, pixExpirado } from './support.js';

test('Gerar Pix abre "Só falta pagar o Pix" com QR Code, valor, contagem ao vivo e Aguardando pagamento', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  const pix = pixPendente(page);
  await expect(pix.getByRole('heading', { name: 'Só falta pagar o Pix' })).toBeFocused();
  for (const texto of [
    'Escaneie o QR Code com o app do seu banco.',
    'Valor a pagar: R$ 40,80',
    'Este código expira em 10:00',
    'Aguardando pagamento',
    'Assim que o pagamento for aprovado, confirmamos seu pedido.',
    'QR e valores demonstrativos para este protótipo.',
  ])
    await expect(pix.getByText(texto, { exact: true })).toBeVisible();
  await expect(pix.getByRole('img', { name: 'QR Code do Pix' })).toBeVisible();
  await expect(pix.getByRole('button', { name: 'Copiar código Pix' })).toHaveClass(/primary/);
  await expect(pix.getByRole('button', { name: 'Escolher outra forma de pagamento' })).toBeVisible();
  // The address and the Forma de pagamento give way to the Pix; still the Pagamento step.
  await expect(formaDePagamento(page)).toHaveCount(0);
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Gerar Pix' })).toHaveCount(0);
  await expect(resumoDoPedido(page).getByText('Total do pedido').locator('..')).toContainText('R$ 40,80');

  // The countdown goes on live.
  await page.clock.runFor(1000);
  await expect(pix.getByText('Este código expira em 09:59', { exact: true })).toBeVisible();
  await page.clock.runFor(65_000);
  await expect(pix.getByText('Este código expira em 08:54', { exact: true })).toBeVisible();
});

test('Copiar código Pix vai para a área de transferência com o toast, e copiar não aprova', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  await pixPendente(page).getByRole('button', { name: 'Copiar código Pix' }).click();
  await expect(aviso(page)).toHaveText('Código Pix copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^000201.*br\.gov\.bcb\.pix/);
  await page.clock.runFor(30_000);
  await expect(pixPendente(page).getByText('Aguardando pagamento', { exact: true })).toBeVisible();
  await expect(page.getByText('Pagamento aprovado!')).toHaveCount(0);
  await expect(page).toHaveURL(/#checkout$/);
});

test('(61) 99999-1234: o Pix é aprovado 10 s depois de gerado, passa por Pagamento aprovado e chega a "Pago com Pix"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await gerarPix(page);
  await page.clock.runFor(9_000);
  await expect(pixPendente(page).getByText('Aguardando pagamento', { exact: true })).toBeVisible();

  await page.clock.runFor(1_000);
  const aprovado = checkout(page).getByRole('status').filter({ hasText: 'Pagamento aprovado!' });
  await expect(aprovado).toBeVisible();
  await expect(aprovado).toBeFocused();
  await expect(aprovado.getByText('Estamos confirmando seu pedido.')).toBeVisible();
  await expect(aprovado.getByText('R$ 40,80')).toBeVisible();
  await expect(etapas(page)).toHaveText(['Identificação, concluída', 'Endereço, concluída', 'Pagamento, concluída']);
  await expect(page.locator('header')).toHaveJSProperty('inert', true);

  await page.clock.runFor(1_500);
  await expect(page).toHaveURL(/#pedido\/BK1024$/);
  const pedido = pedidoConfirmado(page);
  await expect(pedido.getByText('Pago com Pix · R$ 40,80', { exact: true })).toBeVisible();
  await expect(pedido.getByText('Pedido #BK1024', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
  await expect(page.locator('header')).toHaveJSProperty('inert', false);
});

test('(61) 90000-0000: o Pix expira em 10:00; Gerar novo Pix volta a Aguardando pagamento com o mesmo Pedido', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  await page.clock.runFor(599_000);
  await expect(pixPendente(page).getByText('Este código expira em 00:01', { exact: true })).toBeVisible();
  await page.clock.runFor(1_000);
  const expirado = pixExpirado(page);
  await expect(expirado).toBeVisible();
  await expect(expirado.getByRole('heading', { name: 'Seu Pix expirou' })).toBeFocused();
  await expect(expirado.getByText('Gere um novo código para concluir o pagamento.')).toBeVisible();
  await expect(expirado.getByText('Valor a pagar: R$ 40,80', { exact: true })).toBeVisible();
  await expect(expirado.getByRole('button', { name: 'Gerar novo Pix' })).toHaveClass(/primary/);
  await expect(expirado.getByRole('button', { name: 'Escolher outra forma de pagamento' })).toBeVisible();
  await expect(expirado.getByRole('button', { name: 'Copiar código Pix' })).toHaveCount(0);
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');

  await expirado.getByRole('button', { name: 'Gerar novo Pix' }).click();
  await expect(pixPendente(page).getByText('Este código expira em 10:00', { exact: true })).toBeVisible();
  await expect(pixPendente(page).getByText('Aguardando pagamento', { exact: true })).toBeVisible();
  await expect(pixPendente(page).getByText('Valor a pagar: R$ 40,80', { exact: true })).toBeVisible();
  await expect(pixPendente(page).getByRole('heading', { name: 'Só falta pagar o Pix' })).toBeFocused();
  // Never approved: it expires again 10:00 later.
  await page.clock.runFor(600_000);
  await expect(pixExpirado(page)).toBeVisible();
});

test('Escolher outra forma de pagamento cancela o Pix e a aprovação agendada, sem forma pré-selecionada', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await gerarPix(page);
  await page.clock.runFor(5_000);
  await pixPendente(page).getByRole('button', { name: 'Escolher outra forma de pagamento' }).click();
  await expect(pixPendente(page)).toHaveCount(0);
  await expect(formaDePagamento(page)).toBeVisible();
  await expect(formaDePagamento(page).getByRole('radio', { name: 'Pix' })).not.toBeChecked();
  await expect(formaDePagamento(page).getByRole('radio', { name: 'Pix' })).toBeFocused();
  await expect(formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' })).not.toBeChecked();
  await expect(checkout(page).getByRole('region', { name: 'Endereço de entrega' }).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toBeEnabled();
  // The approval that was due at 10 s never comes.
  await page.clock.runFor(30_000);
  await expect(page).toHaveURL(/#checkout$/);
  await expect(page.getByText('Pagamento aprovado!')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

  // A new Pix starts over: approved 10 s after it, as #BK1024.
  await gerarPix(page);
  await page.clock.runFor(11_500);
  await expect(page).toHaveURL(/#pedido\/BK1024$/);
});
