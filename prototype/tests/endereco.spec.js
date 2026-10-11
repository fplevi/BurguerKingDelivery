// Seus endereços (#endereco) and the address in the Checkout's Pagamento (ticket 03 of checkout).
import { test, expect } from '@playwright/test';
import { carrinho, checkout, etapas, resumoDoPedido } from './support.js';

/** Seus endereços (#endereco): the page titled "Endereço de entrega" (the Checkout's card has the same name, as an h2). */
const endereco = (page) =>
  page.getByRole('region', { name: 'Endereço de entrega' }).filter({ has: page.getByRole('heading', { level: 1, name: 'Endereço de entrega' }) });
const salvos = (page) => endereco(page).getByRole('radiogroup', { name: 'Endereços salvos' });
const salvo = (page, rotulo) => salvos(page).getByRole('radio', { name: new RegExp(`^${rotulo}\\b`) });
/** The card of an Endereço salvo (the label around its radio). */
const cartao = (page, rotulo) => salvos(page).locator('label', { has: page.getByRole('radio', { name: new RegExp(`^${rotulo}\\b`) }) });
const entregar = (page) => endereco(page).getByRole('button', { name: 'Entregar neste endereço' });

/** A Whopper® in the cart, Carrinho → Continuar, celular `numero` confirmed (a Novo cliente also registers): #endereco. */
async function irAoEndereco(page, numero = '61999991234') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234' && numero !== '61900000000') {
    await checkout(page).getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await checkout(page).getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(endereco(page)).toBeVisible();
}

test('Cliente cadastrado vê os Endereços salvos Casa e Trabalho, com Casa marcada, e os atalhos', async ({ page }) => {
  await irAoEndereco(page);
  await expect(salvos(page).getByRole('radio')).toHaveCount(2);
  await expect(salvo(page, 'Casa')).toBeChecked();
  await expect(salvo(page, 'Trabalho')).not.toBeChecked();
  const casa = cartao(page, 'Casa');
  await expect(casa).toContainText('Av. Paulista, 1578');
  await expect(casa).toContainText('Bela Vista, São Paulo — SP');
  await expect(casa).toContainText('Apto. 21 · Portaria principal');
  const trabalho = cartao(page, 'Trabalho');
  await expect(trabalho).toContainText('Rua Augusta, 1508');
  await expect(trabalho).toContainText('Consolação, São Paulo — SP');
  await expect(trabalho).toContainText('8º andar · Recepção');
  await expect(endereco(page).getByRole('button', { name: /^Buscar endereço e número/ })).toBeVisible();
  await expect(endereco(page).getByRole('button', { name: /^Usar localização atual/ })).toBeVisible();
  await expect(endereco(page).getByRole('button', { name: 'Endereços de pedidos anteriores' })).toBeVisible();
  await expect(entregar(page)).toBeEnabled();
  await expect(endereco(page).getByRole('button', { name: 'Voltar ao checkout' })).toBeVisible();
});

test('Novo cliente vê só a busca e Usar localização atual, sem seções vazias nem Entregar neste endereço', async ({ page }) => {
  await irAoEndereco(page, '11987654321');
  await expect(endereco(page).getByRole('button', { name: /^Buscar endereço e número/ })).toBeVisible();
  await expect(endereco(page).getByRole('button', { name: /^Usar localização atual/ })).toBeVisible();
  await expect(endereco(page).getByText('Endereços salvos')).toHaveCount(0);
  await expect(endereco(page).getByRole('radio')).toHaveCount(0);
  await expect(endereco(page).getByRole('button', { name: 'Endereços de pedidos anteriores' })).toHaveCount(0);
  await expect(entregar(page)).toHaveCount(0);
});

/** The Endereço de entrega card of the Checkout's Pagamento. */
const pagamento = (page) => checkout(page).getByRole('region', { name: 'Endereço de entrega' });

test('Entregar neste endereço leva ao Pagamento, com o endereço, a Taxa de entrega e o Total do pedido', async ({ page }) => {
  await irAoEndereco(page);
  await salvo(page, 'Trabalho').check();
  await expect(salvo(page, 'Trabalho')).toBeChecked();
  await expect(salvo(page, 'Casa')).not.toBeChecked();
  await expect(salvo(page, 'Trabalho')).toBeFocused();
  await entregar(page).click();

  await expect(checkout(page)).toBeVisible();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(endereco(page)).toBeHidden();
  await expect(etapas(page).nth(0)).toHaveText('Identificação, concluída');
  await expect(etapas(page).nth(1)).toHaveText('Endereço, concluída');
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(pagamento(page).getByText('Trabalho', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('Rua Augusta, 1508', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('São Paulo — SP', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('8º andar', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('Recepção', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('Entrega estimada: 30–45 min')).toBeVisible();
  await expect(checkout(page).getByRole('region', { name: 'Identificação' })).toHaveCount(0);

  const resumo = resumoDoPedido(page);
  await expect(resumo.locator('.order-line', { hasText: 'Total dos itens' })).toContainText('R$ 31,90');
  await expect(resumo.locator('.order-line', { hasText: 'Taxa de entrega' })).toContainText('R$ 8,90');
  await expect(resumo.getByText('Total do pedido').locator('..')).toContainText('R$ 40,80');

  // Back: Seus endereços, with the address chosen still marked.
  await page.goBack();
  await expect(endereco(page)).toBeVisible();
  await expect(salvo(page, 'Trabalho')).toBeChecked();
});

/** Seus endereços → Entregar neste endereço with `rotulo`: the Pagamento. */
async function entregarEm(page, rotulo) {
  await salvo(page, rotulo).check();
  await entregar(page).click();
  await expect(pagamento(page)).toBeVisible();
}

test('Alterar volta a Seus endereços com o endereço em uso marcado; Entregar troca o endereço do Pagamento', async ({ page }) => {
  await irAoEndereco(page);
  await entregarEm(page, 'Casa');
  await expect(pagamento(page).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('Apto. 21', { exact: true })).toBeVisible();
  await expect(pagamento(page).getByText('Portaria principal', { exact: true })).toBeVisible();

  await pagamento(page).getByRole('button', { name: 'Alterar' }).click();
  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Endereço de entrega' })).toBeFocused();
  await expect(salvo(page, 'Casa')).toBeChecked();
  await entregarEm(page, 'Trabalho');
  await expect(pagamento(page).getByText('Rua Augusta, 1508', { exact: true })).toBeVisible();

  // Entregar returned to the same Pagamento: Back goes to the first Seus endereços, then to the Carrinho.
  await page.goBack();
  await expect(endereco(page)).toBeVisible();
  await page.goBack();
  await expect(carrinho(page)).toBeVisible();
});

test('Voltar ao checkout volta ao Pagamento sem trocar o endereço; Voltar do navegador também', async ({ page }) => {
  await irAoEndereco(page);
  await entregarEm(page, 'Casa');
  await pagamento(page).getByRole('button', { name: 'Alterar' }).click();
  await salvo(page, 'Trabalho').check();
  await endereco(page).getByRole('button', { name: 'Voltar ao checkout' }).click();
  await expect(pagamento(page).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Finalizar pedido' })).toBeFocused();

  // Alterar again: the address in use is the one marked.
  await pagamento(page).getByRole('button', { name: 'Alterar' }).click();
  await expect(salvo(page, 'Casa')).toBeChecked();
  await page.goBack();
  await expect(pagamento(page).getByText('Av. Paulista, 1578', { exact: true })).toBeVisible();
  await page.goForward();
  await expect(endereco(page)).toBeVisible();
  await endereco(page).getByRole('button', { name: 'Voltar ao checkout' }).click();
  await expect(pagamento(page)).toBeVisible();
  await expect(page).toHaveURL(/#checkout$/);
});

test('sem endereço escolhido, Voltar ao checkout volta ao Carrinho', async ({ page }) => {
  await irAoEndereco(page);
  await endereco(page).getByRole('button', { name: 'Voltar ao checkout' }).click();
  await expect(carrinho(page)).toBeVisible();
  await expect(page).toHaveURL(/#carrinho$/);
});

test('na sessão, com o endereço escolhido, o Continuar do Carrinho abre o Checkout no Pagamento', async ({ page }) => {
  await irAoEndereco(page);
  await entregarEm(page, 'Trabalho');
  await resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' }).click();
  await expect(carrinho(page)).toBeVisible();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await expect(pagamento(page).getByText('Rua Augusta, 1508', { exact: true })).toBeVisible();
  await expect(etapas(page).nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(page).toHaveURL(/#checkout$/);
});

test('Novo cliente: o Checkout continua em Seus endereços enquanto não há endereço', async ({ page }) => {
  await irAoEndereco(page, '11987654321');
  await page.evaluate(() => (location.hash = 'checkout'));
  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
});
