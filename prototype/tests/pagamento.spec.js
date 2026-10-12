// Pagamento com cartão and the Pedido confirmado (ticket 06 of checkout).
import { test, expect } from '@playwright/test';
import {
  checkout,
  etapas,
  resumoDoPedido,
  irAoPagamento,
  continuarDoCarrinho,
  formaDePagamento,
  seusCartoes,
  confirmarEPagar,
  pedidoConfirmado,
  openVerIngredientes,
  verIngredientes,
  chip,
} from './support.js';

const cartaoDeCredito = (page) => formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' });
const campo = (page, nome) => checkout(page).getByRole('textbox', { name: nome, exact: true });
const enderecoDeEntrega = (page) => checkout(page).getByRole('region', { name: 'Endereço de entrega' });
const falha = (page) => checkout(page).getByRole('alert').filter({ hasText: 'Não conseguimos aprovar o pagamento.' });

/** Cartão de crédito → "Adicionar novo cartão" → the Novo cartão filled with `numero` (16 digits, typed as they come). */
async function novoCartao(page, numero, { nome = 'Mariana Silva', validade = '0829', cvv = '123' } = {}) {
  await cartaoDeCredito(page).check();
  await checkout(page).getByRole('button', { name: 'Adicionar novo cartão' }).click();
  await preencherCartao(page, numero, { nome, validade, cvv });
}
/** Fills the Novo cartão on screen. */
async function preencherCartao(page, numero, { nome = 'Mariana Silva', validade = '0829', cvv = '123' } = {}) {
  await campo(page, 'Número do cartão').fill(numero);
  await campo(page, 'Nome impresso no cartão').fill(nome);
  await campo(page, 'Validade').fill(validade);
  await campo(page, 'Código de segurança').fill(cvv);
}

test('Forma de pagamento: Pix ou Cartão de crédito, uma só, e a ação do Resumo do pedido acompanha a escolha', async ({ page }) => {
  await irAoPagamento(page);
  const pix = formaDePagamento(page).getByRole('radio', { name: 'Pix' }),
    cartao = cartaoDeCredito(page);
  await expect(pix).toHaveAccessibleDescription('Pague com QR Code ou código Pix.');
  await expect(cartao).toHaveAccessibleDescription('Pagamento à vista. Use um cartão salvo ou adicione outro.');
  await expect(pix).not.toBeChecked();
  await expect(cartao).not.toBeChecked();
  await expect(confirmarEPagar(page)).toBeDisabled();

  await cartao.check();
  await expect(cartao).toBeChecked();
  await expect(cartao).toBeFocused();
  await expect(confirmarEPagar(page)).toHaveText('Confirmar e pagar R$ 40,80');
  await expect(seusCartoes(page)).toBeVisible();
  await expect(resumoDoPedido(page).getByText('Confira o endereço antes de confirmar.')).toBeVisible();

  await pix.check();
  await expect(pix).toBeChecked();
  await expect(cartao).not.toBeChecked();
  await expect(seusCartoes(page)).toHaveCount(0);
  await expect(confirmarEPagar(page)).toHaveCount(0);
  await expect(checkout(page).getByRole('button', { name: 'Gerar Pix' })).toBeVisible();
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
});

test('Cartão salvo com código de segurança válido: processamento com a tela desabilitada e Pedido confirmado #BK-10483', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await cartaoDeCredito(page).check();
  const visa = seusCartoes(page).getByRole('radio', { name: 'Visa •••• 4242' });
  await expect(visa).toBeChecked();
  await expect(visa).toHaveAccessibleDescription('Mariana Silva · validade 08/29');
  const cvv = campo(page, 'Código de segurança');
  await expect(cvv).toHaveAccessibleDescription(/Confirme o código de segurança do cartão\./);

  // Without the código de segurança, nothing is processed.
  await confirmarEPagar(page).click();
  await expect(cvv).toHaveAttribute('aria-invalid', 'true');
  await expect(cvv).toBeFocused();
  await expect(checkout(page).getByText('Processando pagamento')).toHaveCount(0);

  await cvv.fill('12a3');
  await expect(cvv).toHaveValue('123');
  await expect(cvv).toHaveAttribute('aria-invalid', 'false');
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await confirmarEPagar(page).click();

  // Processing (~1.5 s): the address and the Forma de pagamento give way to it, the screen is disabled.
  await expect(checkout(page).getByRole('heading', { name: 'Processando pagamento' })).toBeVisible();
  await expect(checkout(page).getByText('Aguarde a confirmação do seu cartão.')).toBeVisible();
  await expect(checkout(page).getByRole('status').getByText('R$ 40,80')).toBeVisible();
  await expect(formaDePagamento(page)).toHaveCount(0);
  await expect(checkout(page).getByRole('button', { name: 'Voltar ao carrinho' })).toBeDisabled();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toBeDisabled();
  await expect(page.locator('header')).toHaveJSProperty('inert', true);
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
  await page.clock.runFor(1400);
  await expect(page).toHaveURL(/#checkout$/);

  await page.clock.runFor(200);
  await expect(page).toHaveURL(/#pedido\/BK-10483$/);
  const pedido = pedidoConfirmado(page);
  await expect(pedido).toBeVisible();
  await expect(checkout(page)).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'Pedido confirmado!' })).toBeFocused();
  await expect(page.locator('header')).toHaveJSProperty('inert', false);
  const passos = pedido.getByRole('list', { name: 'Etapas do pedido' }).getByRole('listitem');
  await expect(passos).toHaveText(['Identificação, concluída', 'Endereço, concluída', 'Pagamento, concluída']);
  await expect(pedido.locator('[aria-current]')).toHaveCount(0);
  for (const texto of ['Seu pedido já está com a gente.', 'Pedido #BK-10483', 'Previsão de entrega: 30–45 min', 'Av. Paulista, 1578', 'Apto. 21', 'Portaria principal'])
    await expect(pedido.getByText(texto, { exact: true })).toBeVisible();
  await expect(pedido.getByText('Pago com cartão Visa •••• 4242 · R$ 40,80', { exact: true })).toBeVisible();
  const resumo = pedido.getByRole('complementary', { name: 'Resumo do pedido' });
  await expect(resumo.getByText('1× Whopper®')).toBeVisible();
  await expect(resumo.getByText('Total do pedido').locator('..')).toContainText('R$ 40,80');
  await expect(resumo.getByRole('button')).toHaveCount(0);
  await expect(page.locator('header .location')).toBeHidden();
  // The cart closed: empty, the counter at 0.
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('Cartão salvo com CVV 000 é recusado: Itens, Personalizações e endereço ficam, com outro cartão ou Pix', async ({ page }) => {
  await irAoPagamento(page, '61999991234', async (page) => {
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Cebola').click();
    await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  });
  await cartaoDeCredito(page).check();
  await campo(page, 'Código de segurança').fill('000');
  await confirmarEPagar(page).click();
  await expect(falha(page)).toBeVisible();
  await expect(falha(page)).toContainText('Confira os dados ou escolha outra forma de pagamento.');
  await expect(page).toHaveURL(/#checkout$/);
  await expect(confirmarEPagar(page)).toBeFocused();
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(enderecoDeEntrega(page).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await expect(resumoDoPedido(page).getByText('1× Whopper®')).toBeVisible();
  await expect(resumoDoPedido(page).getByText('Sem cebola')).toBeVisible();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  await expect(page.getByText('Pedido confirmado!')).toHaveCount(0);
  // Another card or the Pix are right there.
  await expect(checkout(page).getByRole('button', { name: 'Adicionar novo cartão' })).toBeEnabled();
  await expect(formaDePagamento(page).getByRole('radio', { name: 'Pix' })).toBeEnabled();

  // Reviewing the data clears the failure; a valid código confirms the same Pedido as #BK-10483.
  await campo(page, 'Código de segurança').fill('321');
  await expect(falha(page)).toHaveCount(0);
  await confirmarEPagar(page).click();
  await expect(page).toHaveURL(/#pedido\/BK-10483$/);
  await expect(pedidoConfirmado(page).getByRole('complementary', { name: 'Resumo do pedido' }).getByText('Sem cebola')).toBeVisible();
});

test('Novo cartão: a bandeira vem do número; Visa aprovado sem salvar, com o número mascarado', async ({ page }) => {
  await irAoPagamento(page);
  await cartaoDeCredito(page).check();
  await checkout(page).getByRole('button', { name: 'Adicionar novo cartão' }).click();
  await expect(campo(page, 'Número do cartão')).toBeFocused();
  await expect(seusCartoes(page).getByRole('radio', { name: 'Visa •••• 4242' })).not.toBeChecked();
  await expect(checkout(page).getByRole('checkbox', { name: 'Salvar cartão para os próximos pedidos' })).not.toBeChecked();
  await campo(page, 'Número do cartão').pressSequentially('4242424242424242');
  await expect(campo(page, 'Número do cartão')).toHaveValue('4242 4242 4242 4242');
  await expect(campo(page, 'Número do cartão')).toHaveAccessibleDescription(/Bandeira: Visa/);
  await campo(page, 'Nome impresso no cartão').fill('Mariana Silva');
  await campo(page, 'Validade').pressSequentially('0829');
  await expect(campo(page, 'Validade')).toHaveValue('08/29');
  await campo(page, 'Código de segurança').fill('123');
  await confirmarEPagar(page).click();
  await expect(page).toHaveURL(/#pedido\/BK-10483$/);
  await expect(pedidoConfirmado(page).getByText('Pago com cartão Visa •••• 4242 · R$ 40,80', { exact: true })).toBeVisible();
});

test('Novo cartão: campos obrigatórios e "Número de cartão inválido" sem chegar ao processamento', async ({ page }) => {
  await irAoPagamento(page);
  await cartaoDeCredito(page).check();
  await checkout(page).getByRole('button', { name: 'Adicionar novo cartão' }).click();
  await confirmarEPagar(page).click();
  for (const nome of ['Número do cartão', 'Nome impresso no cartão', 'Validade', 'Código de segurança'])
    await expect(campo(page, nome)).toHaveAttribute('aria-invalid', 'true');
  await expect(campo(page, 'Número do cartão')).toBeFocused();

  await preencherCartao(page, '4111111111111111', { validade: '0120' });
  await confirmarEPagar(page).click();
  await expect(checkout(page).getByText('Número de cartão inválido', { exact: true })).toBeVisible();
  await expect(campo(page, 'Validade')).toHaveAttribute('aria-invalid', 'true');
  await expect(campo(page, 'Número do cartão')).toBeFocused();
  await expect(checkout(page).getByText('Processando pagamento')).toHaveCount(0);
  await expect(page).toHaveURL(/#checkout$/);
});

test('Novo cartão 4000 0000 0000 0002 é recusado e continua preenchido para revisar', async ({ page }) => {
  await irAoPagamento(page);
  await novoCartao(page, '4000000000000002');
  await confirmarEPagar(page).click();
  await expect(falha(page)).toBeVisible();
  await expect(campo(page, 'Número do cartão')).toHaveValue('4000 0000 0000 0002');
  await expect(page.getByText('Pedido confirmado!')).toHaveCount(0);
});

test('Mastercard salvo entra em Seus cartões; o próximo checkout da sessão reaproveita tudo e confirma #BK-10484', async ({ page }) => {
  await irAoPagamento(page);
  await novoCartao(page, '5555555555554444', { nome: 'Mariana S Silva', validade: '1230' });
  await expect(campo(page, 'Número do cartão')).toHaveAccessibleDescription(/Bandeira: Mastercard/);
  await checkout(page).getByRole('checkbox', { name: 'Salvar cartão para os próximos pedidos' }).check();
  await confirmarEPagar(page).click();
  await expect(pedidoConfirmado(page).getByText('Pago com cartão Mastercard •••• 4444 · R$ 40,80', { exact: true })).toBeVisible();

  // A new checkout: no Identificação, the same address, the cards saved, no Forma de pagamento chosen yet.
  await pedidoConfirmado(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await expect(enderecoDeEntrega(page).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await expect(cartaoDeCredito(page)).not.toBeChecked();
  await cartaoDeCredito(page).check();
  await expect(seusCartoes(page).getByRole('radio')).toHaveCount(2);
  const master = seusCartoes(page).getByRole('radio', { name: 'Mastercard •••• 4444' });
  await expect(master).toHaveAccessibleDescription('Mariana S Silva · validade 12/30');
  await master.check();
  await expect(master).toBeFocused();
  await campo(page, 'Código de segurança').fill('456');
  await confirmarEPagar(page).click();
  await expect(page).toHaveURL(/#pedido\/BK-10484$/);
  await expect(pedidoConfirmado(page).getByText('Pedido #BK-10484', { exact: true })).toBeVisible();
  await expect(pedidoConfirmado(page).getByText('Pago com cartão Mastercard •••• 4444 · R$ 40,80', { exact: true })).toBeVisible();
});

test('O nome impresso de um cartão salvo aparece como texto em Seus cartões', async ({ page }) => {
  const nome = '<b>Ana</b> & "Cia"';
  await irAoPagamento(page);
  await novoCartao(page, '5555555555554444', { nome, validade: '1230' });
  await expect(campo(page, 'Nome impresso no cartão')).toHaveValue(nome);
  await checkout(page).getByRole('checkbox', { name: 'Salvar cartão para os próximos pedidos' }).check();
  await confirmarEPagar(page).click();
  await pedidoConfirmado(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await cartaoDeCredito(page).check();
  await expect(seusCartoes(page).getByRole('radio', { name: 'Mastercard •••• 4444' })).toHaveAccessibleDescription(`${nome} · validade 12/30`);
});

test('Pedido confirmado: Acompanhar pedido abre o acompanhamento, Voltar ao cardápio leva à última categoria e o Voltar do navegador ao cardápio', async ({ page }) => {
  await irAoPagamento(page);
  await cartaoDeCredito(page).check();
  await campo(page, 'Código de segurança').fill('123');
  await confirmarEPagar(page).click();
  const pedido = pedidoConfirmado(page);
  await expect(pedido).toBeVisible();
  await expect(pedido.getByRole('button', { name: 'Acompanhar pedido' })).toHaveClass(/primary/);
  await expect(pedido.getByRole('button', { name: 'Voltar ao cardápio' })).toHaveClass(/secondary/);
  await pedido.getByRole('button', { name: 'Acompanhar pedido' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos\/BK-10483$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Pedido #BK-10483' })).toBeVisible();
  await page.goBack();
  await expect(pedido).toBeVisible();

  // Back: the menu, without the cart bought nor the Checkout.
  await page.goBack();
  await expect(page.locator('#catalog')).toBeVisible();
  await expect(checkout(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();

  // Forward: the Pedido confirmado again.
  await page.goForward();
  await expect(pedido).toBeVisible();
});

test('Voltar ao cardápio leva à última categoria vista; #pedido sem Pedido confirmado leva ao cardápio', async ({ page }) => {
  await page.goto('/#pedido/BK-10483');
  await expect(page.locator('#catalog')).toBeVisible();
  await expect(pedidoConfirmado(page)).toBeHidden();

  await page.goto('/#sobremesas');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61900000000');
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  await page.getByRole('button', { name: 'Entregar neste endereço' }).click();
  await cartaoDeCredito(page).check();
  await campo(page, 'Código de segurança').fill('123');
  await confirmarEPagar(page).click();
  await pedidoConfirmado(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await expect(page).toHaveURL(/#sobremesas$/);
  await expect(page.getByRole('link', { name: 'Sobremesas' })).toHaveAttribute('aria-current', 'page');
  // An id not confirmed in this session: the menu.
  await page.evaluate(() => (location.hash = 'pedido/BK-10484'));
  await expect(page).toHaveURL(/#sobremesas$/);
});
