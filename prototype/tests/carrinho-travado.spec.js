// Carrinho travado enquanto o Pix está pendente (ticket 08 of checkout).
import { test, expect } from '@playwright/test';
import { checkout, resumoDoPedido, irAoPagamento, gerarPix, pixPendente, carrinho, itens, totalDoItem, totalDosItens, avisoDoPix, aviso, pedidoConfirmado, formaDePagamento, confirmarEPagar, paginaDeEndereco, enderecosSalvos } from './support.js';

test('Com o Pix pendente, o Checkout não tem "Voltar ao carrinho" nem "Editar carrinho"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  await expect(checkout(page).getByRole('button', { name: 'Voltar', exact: true })).toBeHidden();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toHaveCount(0);
  // Expired, still pending.
  await page.clock.runFor(600_000);
  await expect(checkout(page).getByRole('region', { name: 'Seu Pix expirou' })).toBeVisible();
  await expect(checkout(page).getByRole('button', { name: 'Voltar', exact: true })).toBeHidden();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toHaveCount(0);
  // "Escolher outra forma de pagamento" brings them back.
  await checkout(page).getByRole('button', { name: 'Escolher outra forma de pagamento' }).click();
  await expect(checkout(page).getByRole('button', { name: 'Voltar', exact: true })).toBeVisible();
  await expect(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' })).toBeEnabled();
  await expect(pixPendente(page)).toHaveCount(0);
});

test('Com o Pix pendente, o Carrinho mostra os Itens só para leitura, com o aviso e "Voltar ao pagamento"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  // The header stays free: the Carrinho opens.
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page)).toBeVisible();
  const aviso = avisoDoPix(page);
  await expect(aviso).toBeVisible();
  await expect(aviso.getByText('Há um Pix aguardando pagamento.', { exact: true })).toBeVisible();
  // Read-only: the Item is there, with its Quantidade and Total do item, but nothing changes it.
  await expect(itens(page)).toHaveCount(1);
  const item = itens(page).first();
  await expect(item.getByRole('heading', { name: 'Whopper®' })).toBeVisible();
  await expect(item.getByText('Quantidade: 1', { exact: true })).toBeVisible();
  await expect(totalDoItem(item)).toHaveText('R$ 31,90');
  await expect(item.getByRole('button')).toHaveCount(0);
  await expect(item.getByRole('checkbox')).toHaveCount(0);
  await expect(item.getByRole('combobox')).toHaveCount(0);
  await expect(carrinho(page).getByRole('button', { name: 'Continuar' })).toHaveCount(0);
  await expect(totalDosItens(page)).toHaveText('R$ 31,90');
  // Back to the Pix.
  await aviso.getByRole('button', { name: 'Voltar ao pagamento' }).click();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(pixPendente(page)).toBeVisible();
  await expect(pixPendente(page).getByText('Aguardando pagamento', { exact: true })).toBeVisible();
});

test('Com o Pix pendente, "Adicionar ao carrinho" não adiciona e mostra o toast; só "Escolher outra forma de pagamento" destrava', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  const bloqueio = 'Conclua o pagamento ou escolha outra forma de pagamento para alterar o carrinho.';
  const categorias = page.getByRole('navigation', { name: 'Categorias' });
  for (const categoria of ['Hambúrgueres', 'Acompanhamentos']) {
    await categorias.getByRole('link', { name: categoria }).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(aviso(page)).toHaveText(bloqueio);
    await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  }
  // Expired: still locked.
  await page.clock.runFor(600_000);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(bloqueio);
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

  // Back to the Pix, "Escolher outra forma de pagamento": the cart is free again.
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await avisoDoPix(page).getByRole('button', { name: 'Voltar ao pagamento' }).click();
  await checkout(page).getByRole('button', { name: 'Escolher outra forma de pagamento' }).click();
  await categorias.getByRole('link', { name: 'Acompanhamentos' }).click();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(/^Adicionado ao carrinho: /);
  await expect(page.getByRole('button', { name: 'Carrinho · 2' })).toBeVisible();
  await page.getByRole('button', { name: 'Carrinho · 2' }).click();
  await expect(avisoDoPix(page)).toHaveCount(0);
  await expect(itens(page).first().getByRole('button', { name: 'Remover' })).toBeVisible();
});

test('Pix aprovado com o cliente fora do Checkout: toast de pagamento aprovado com "Ver pedido"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await gerarPix(page);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(avisoDoPix(page)).toBeVisible();
  await page.clock.runFor(11_500);
  // Still on the Carrinho, now closed (empty); the toast tells and links to the Pedido confirmado.
  await expect(page).toHaveURL(/#carrinho$/);
  await expect(aviso(page)).toBeVisible();
  await expect(aviso(page)).toContainText('Pagamento aprovado! Pedido #BK-10483 confirmado.');
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
  await expect(carrinho(page).getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await aviso(page).getByRole('link', { name: 'Ver pedido' }).click();
  await expect(page).toHaveURL(/#pedido\/BK-10483$/);
  await expect(pedidoConfirmado(page).getByText('Pago com Pix · R$ 40,80', { exact: true })).toBeVisible();
});

test('Sem Pix pendente, editar o carrinho descarta o Pedido ainda não confirmado', async ({ page }) => {
  await irAoPagamento(page);
  await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
  await checkout(page).getByRole('textbox', { name: 'Código de segurança', exact: true }).fill('000');
  await confirmarEPagar(page).click();
  const falha = checkout(page).getByRole('alert').filter({ hasText: 'Não conseguimos aprovar o pagamento.' });
  await expect(falha).toBeVisible();
  // The recusado Pedido is pending; Editar carrinho is free, and changing the cart discards it.
  await resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' }).click();
  await itens(page).first().getByRole('button', { name: 'Aumentar quantidade' }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await expect(checkout(page)).toBeVisible();
  await expect(falha).toHaveCount(0);
  await expect(confirmarEPagar(page)).toHaveText('Confirmar e pagar R$ 72,70');
  await expect(resumoDoPedido(page).getByText('2× Whopper®')).toBeVisible();
});

test('Pix aprovado com o cliente no cardápio: o toast com "Ver pedido" e o cardápio destravado', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await gerarPix(page);
  await page.getByRole('navigation', { name: 'Categorias' }).getByRole('link', { name: 'Bebidas' }).click();
  await page.clock.runFor(11_500);
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(aviso(page).getByRole('link', { name: 'Ver pedido' })).toHaveAttribute('href', '#pedido/BK-10483');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(/^Adicionado ao carrinho: /);
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
});

// Nothing that changes the Pedido changes while it is being paid (card processing, Pix pendente).
/** Cartão de crédito with the saved Visa and its código de segurança `cvv`, the clock paused, and "Confirmar e pagar": the processing. */
async function processarCartao(page, cvv) {
  await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
  await checkout(page).getByRole('textbox', { name: 'Código de segurança', exact: true }).fill(cvv);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await confirmarEPagar(page).click();
  await expect(checkout(page).getByRole('heading', { name: 'Processando pagamento' })).toBeVisible();
}

test('Processando o cartão, o Voltar do navegador leva a Seus endereços e ao Carrinho travados; aprovado, o cliente fica onde está, com "Ver pedido"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await processarCartao(page, '123');
  await page.goBack();
  await expect(page).toHaveURL(/#endereco$/);
  const noEndereco = paginaDeEndereco(page).getByRole('group', { name: 'Pagamento em processamento' });
  await expect(noEndereco.getByText('Seu pagamento está sendo processado.', { exact: true })).toBeVisible();
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  const noCarrinho = carrinho(page).getByRole('group', { name: 'Pagamento em processamento' });
  await expect(noCarrinho.getByText('Seu pagamento está sendo processado.', { exact: true })).toBeVisible();
  await expect(itens(page).first().getByRole('button')).toHaveCount(0);
  await expect(carrinho(page).getByRole('button', { name: 'Continuar' })).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Categorias' }).getByRole('link', { name: 'Bebidas' }).click();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText('Aguarde o processamento do pagamento para alterar o carrinho.');
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

  await page.clock.runFor(1600);
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(aviso(page)).toContainText('Pagamento aprovado! Pedido #BK-10483 confirmado.');
  await expect(page.getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
  await aviso(page).getByRole('link', { name: 'Ver pedido' }).click();
  await expect(page).toHaveURL(/#pedido\/BK-10483$/);
  await expect(pedidoConfirmado(page).getByText('Pago com cartão Visa •••• 4242 · R$ 40,80', { exact: true })).toBeVisible();
});

test('Cartão recusado com o cliente fora do Checkout: o toast com "Voltar ao pagamento" e o carrinho destravado', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page);
  await processarCartao(page, '000');
  await page.goBack();
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await page.clock.runFor(1600);
  await expect(page).toHaveURL(/#carrinho$/);
  await expect(aviso(page)).toContainText('Não conseguimos aprovar o pagamento.');
  await expect(itens(page).first().getByRole('button', { name: 'Remover' })).toBeVisible();
  await aviso(page).getByRole('link', { name: 'Voltar ao pagamento' }).click();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(checkout(page).getByRole('alert').filter({ hasText: 'Não conseguimos aprovar o pagamento.' })).toBeVisible();
});

test('Com o Pix pendente, Seus endereços não muda o endereço do Pedido: o aviso com "Voltar ao pagamento", até "Escolher outra forma de pagamento"', async ({ page }) => {
  await page.clock.install();
  await irAoPagamento(page, '61900000000');
  await gerarPix(page);
  await page.goBack();
  await expect(page).toHaveURL(/#endereco$/);
  const endereco = paginaDeEndereco(page),
    avisoDoEndereco = endereco.getByRole('group', { name: 'Pix aguardando pagamento' });
  await expect(avisoDoEndereco.getByText('Há um Pix aguardando pagamento.', { exact: true })).toBeVisible();
  await expect(avisoDoEndereco.getByText('Para alterar o endereço, escolha outra forma de pagamento.', { exact: true })).toBeVisible();
  await expect(enderecosSalvos(page)).toHaveCount(0);
  await expect(endereco.getByRole('button', { name: 'Entregar neste endereço' })).toHaveCount(0);
  await expect(endereco.getByRole('button', { name: /^Buscar endereço/ })).toHaveCount(0);
  await expect(endereco.getByRole('button', { name: 'Voltar ao checkout' })).toBeHidden();
  // The other address pages lead to it too (Editar or Remover the address in use, say).
  for (const pagina of ['endereco/editar', 'endereco/remover', 'endereco/buscar']) {
    await page.evaluate((h) => (location.hash = h), pagina);
    await expect(page).toHaveURL(/#endereco$/);
    await expect(avisoDoEndereco).toBeVisible();
  }
  await avisoDoEndereco.getByRole('button', { name: 'Voltar ao pagamento' }).click();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(pixPendente(page)).toBeVisible();

  // "Escolher outra forma de pagamento": Alterar opens Seus endereços as usual.
  await pixPendente(page).getByRole('button', { name: 'Escolher outra forma de pagamento' }).click();
  await checkout(page).getByRole('region', { name: 'Endereço de entrega' }).getByRole('button', { name: 'Alterar' }).click();
  await expect(enderecosSalvos(page)).toBeVisible();
  await expect(avisoDoEndereco).toHaveCount(0);
});
