// Layouts do Checkout no celular e no desktop (ticket 09 of checkout; Figma 239-8996 and 217-6185).
import { test, expect } from '@playwright/test';
import { checkout, resumoDoPedido, irAoPagamento, formaDePagamento, paginaDeEndereco, irAosEnderecos, gerarPix, pixPendente } from './support.js';

/** The fixed footer of the Pagamento on the phone (Figma "Checkout / ação fixa"): Total do pedido and the payment action. */
const rodapeDoPagamento = (page) => checkout(page).getByRole('region', { name: 'Total do pedido e pagamento' });
const semRolagemHorizontal = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
const caixa = async (locator) => {
  await expect(locator).toBeVisible();
  return locator.boundingBox();
};
/** `locator` is a bar fixed at the bottom of the 390 × 844 screen, in the whole width. */
async function fixoNoRodape(locator) {
  const box = await caixa(locator);
  expect(box.x).toBe(0);
  expect(box.width).toBe(390);
  expect(Math.abs(box.y + box.height - 844)).toBeLessThanOrEqual(1);
}
const noFim = (page) => page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));

test.describe('celular (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the 390 × 844 project');

  test('390: Pagamento com Total do pedido e a ação fixos no rodapé, que acompanham a Forma de pagamento e ficam na tela ao rolar', async ({ page }) => {
    await irAoPagamento(page);
    const rodape = rodapeDoPagamento(page);
    await expect(rodape).toContainText('Total do pedido');
    await expect(rodape.getByText('R$ 40,80', { exact: true })).toBeVisible();
    await expect(rodape.getByRole('button', { name: 'Confirmar e pagar R$ 40,80' })).toBeDisabled();
    await fixoNoRodape(rodape);

    await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
    await expect(rodape.getByRole('button', { name: 'Confirmar e pagar R$ 40,80' })).toBeEnabled();
    // Only one payment action on screen: the Resumo do pedido keeps its note and Editar carrinho (Figma newCard).
    await expect(checkout(page).getByRole('button', { name: /^Confirmar e pagar / })).toHaveCount(1);
    await expect(resumoDoPedido(page).getByText('Confira o endereço antes de confirmar.')).toBeVisible();
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await fixoNoRodape(rodape);

    await formaDePagamento(page).getByRole('radio', { name: 'Pix' }).check();
    await expect(rodape.getByRole('button', { name: 'Gerar Pix' })).toBeVisible();
    await expect(checkout(page).getByRole('button', { name: 'Gerar Pix' })).toHaveCount(1);
  });

  test('390: uma coluna, o Resumo do pedido abaixo do conteúdo e, no fim da página, Editar carrinho acima do rodapé; sem rolagem horizontal', async ({ page }) => {
    await irAoPagamento(page);
    await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
    const forma = checkout(page).getByRole('region', { name: 'Forma de pagamento' });
    const [f, r] = [await caixa(forma), await caixa(resumoDoPedido(page))];
    expect(r.y).toBeGreaterThanOrEqual(f.y + f.height);
    expect(r.x).toBe(f.x);
    expect(r.width).toBe(f.width);
    await noFim(page);
    const [b, editar] = [await caixa(rodapeDoPagamento(page)), await caixa(resumoDoPedido(page).getByRole('button', { name: 'Editar carrinho' }))];
    expect(editar.y + editar.height).toBeLessThanOrEqual(b.y);
    await semRolagemHorizontal(page);
  });

  test('390: no fluxo de endereço, a ação principal fica fixa no rodapé e o fim do conteúdo termina acima dela; sem rolagem horizontal', async ({ page }) => {
    await irAosEnderecos(page);
    const endereco = paginaDeEndereco(page);
    // Seus endereços: "Entregar neste endereço" (Figma Endereço 01), the last content being "Endereços de pedidos anteriores".
    const entregar = endereco.getByRole('button', { name: 'Entregar neste endereço' });
    await fixoNoRodape(entregar.locator('..'));
    await noFim(page);
    await fixoNoRodape(entregar.locator('..'));
    const [acao, anteriores] = [await caixa(entregar.locator('..')), await caixa(endereco.getByRole('button', { name: 'Endereços de pedidos anteriores' }))];
    expect(anteriores.y + anteriores.height).toBeLessThanOrEqual(acao.y);
    await semRolagemHorizontal(page);

    // Confirmar localização (Figma Endereço 03) and Dados de entrega (Figma Endereço 04).
    await endereco.getByRole('button', { name: /^Buscar endereço e número/ }).click();
    await endereco.getByRole('searchbox', { name: 'Buscar endereço e número' }).fill('paulista');
    await endereco.getByRole('list', { name: 'Resultados da busca' }).getByRole('button').filter({ hasText: 'Avenida Paulista, 1578' }).click();
    const confirmar = endereco.getByRole('button', { name: 'Confirmar localização' });
    await fixoNoRodape(confirmar.locator('..'));
    await semRolagemHorizontal(page);
    await confirmar.click();
    const salvar = endereco.getByRole('button', { name: 'Salvar endereço' });
    await fixoNoRodape(salvar.locator('..'));
    await noFim(page);
    const [rodape, nota] = [await caixa(salvar.locator('..')), await caixa(endereco.getByText(/^\* Campos obrigatórios/))];
    expect(nota.y + nota.height).toBeLessThanOrEqual(rodape.y);
    await semRolagemHorizontal(page);

    // The toast "Endereço salvo" shows above the fixed action, not over it.
    await salvar.click();
    const toast = page.getByRole('status').filter({ hasText: 'Endereço salvo e selecionado.' });
    const [t, fixa] = [await caixa(toast), await caixa(entregar.locator('..'))];
    expect(t.y + t.height).toBeLessThanOrEqual(fixa.y);
  });

  test('390: no cartão Endereço de entrega, complemento e referência em linhas separadas e o divisor antes da previsão', async ({ page }) => {
    await irAoPagamento(page);
    const cartao = checkout(page).getByRole('region', { name: 'Endereço de entrega' });
    const [apto, portaria, previsao] = [
      await caixa(cartao.getByText('Apto. 21', { exact: true })),
      await caixa(cartao.getByText('Portaria principal', { exact: true })),
      await caixa(cartao.getByText('Entrega estimada: 30–45 min')),
    ];
    expect(portaria.y).toBeGreaterThanOrEqual(apto.y + apto.height);
    expect(portaria.x).toBe(apto.x);
    expect(previsao.y).toBeGreaterThanOrEqual(portaria.y + portaria.height);
    expect(await cartao.getByText('Entrega estimada: 30–45 min').evaluate((p) => getComputedStyle(p).borderTopStyle)).toBe('solid');
  });

  test('390: sem o rodapé do pagamento no Pix pendente e no Pedido confirmado; sem rolagem horizontal', async ({ page }) => {
    await irAoPagamento(page);
    await gerarPix(page);
    await expect(rodapeDoPagamento(page)).toHaveCount(0);
    await semRolagemHorizontal(page);
    await pixPendente(page).getByRole('button', { name: 'Escolher outra forma de pagamento' }).click();
    await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
    await checkout(page).getByRole('textbox', { name: 'Código de segurança' }).fill('123');
    await rodapeDoPagamento(page).getByRole('button', { name: 'Confirmar e pagar R$ 40,80' }).click();
    await expect(page.getByRole('region', { name: 'Pedido confirmado!' })).toBeVisible();
    await semRolagemHorizontal(page);
  });
});

test.describe('desktop (≥ 1024px)', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('1280: conteúdo à esquerda e Resumo do pedido à direita, com a ação; sem rodapé fixo nem rolagem horizontal', async ({ page }) => {
    await irAoPagamento(page);
    await formaDePagamento(page).getByRole('radio', { name: 'Cartão de crédito' }).check();
    await expect(rodapeDoPagamento(page)).toBeHidden();
    await expect(resumoDoPedido(page).getByRole('button', { name: 'Confirmar e pagar R$ 40,80' })).toBeVisible();
    const [cartao, r] = [await caixa(checkout(page).getByRole('region', { name: 'Endereço de entrega' })), await caixa(resumoDoPedido(page))];
    expect(r.x).toBeGreaterThanOrEqual(cartao.x + cartao.width);
    expect(Math.abs(r.y - cartao.y)).toBeLessThanOrEqual(1);
    await semRolagemHorizontal(page);
  });

  test('1280: no fluxo de endereço, a ação principal fica no conteúdo, logo depois dele', async ({ page }) => {
    await irAosEnderecos(page);
    const endereco = paginaDeEndereco(page);
    const [anteriores, entregar] = [
      await caixa(endereco.getByRole('button', { name: 'Endereços de pedidos anteriores' })),
      await caixa(endereco.getByRole('button', { name: 'Entregar neste endereço' })),
    ];
    expect(entregar.y).toBeGreaterThanOrEqual(anteriores.y + anteriores.height);
    expect(entregar.y - (anteriores.y + anteriores.height)).toBeLessThan(60);
    expect(entregar.width).toBeLessThan(600);
    await semRolagemHorizontal(page);
  });
});
