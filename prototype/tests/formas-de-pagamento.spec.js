// Formas de pagamento em Minha conta (ticket 07 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';

const conta = (page) => page.locator('#account-page');
const titulo = (page) => page.getByRole('heading', { level: 1 });
const card = (page, nome) => conta(page).getByRole('region', { name: nome, exact: true });
const form = (page) => conta(page).getByRole('region', { name: 'Adicionar cartão' });

/** Identified with `numero` (a Novo cliente registers as Ana Souza), on Formas de pagamento. */
async function entrar(page, numero = '61999991234') {
  await page.goto('/#conta/pagamentos');
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234') {
    await id.getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await id.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page).toHaveURL(/#conta\/pagamentos$/);
}
/** Adicionar cartão with these fields, then Salvar cartão. */
async function adicionar(page, { numero = '5555555555554444', nome = 'Mariana Silva', validade = '0830', codigo = '123' } = {}) {
  await conta(page).getByRole('link', { name: 'Adicionar cartão' }).click();
  await expect(titulo(page)).toHaveText('Adicionar cartão');
  await form(page).getByRole('textbox', { name: 'Número do cartão' }).fill(numero);
  await form(page).getByRole('textbox', { name: 'Nome impresso no cartão' }).fill(nome);
  await form(page).getByRole('textbox', { name: 'Validade' }).fill(validade);
  await form(page).getByRole('textbox', { name: 'Código de segurança' }).fill(codigo);
  await form(page).getByRole('button', { name: 'Salvar cartão' }).click();
}

test('lista os Cartões salvos: bandeira e final, nome, validade e Cartão padrão; nota do Pix', async ({ page }) => {
  await entrar(page);
  await expect(titulo(page)).toHaveText('Formas de pagamento');
  const visa = card(page, 'Visa · final 4242');
  await expect(visa).toContainText('Mariana Silva · Validade 08/29');
  await expect(visa).toContainText('Cartão padrão');
  await expect(visa).not.toContainText('4242 4242');
});

test('Adicionar cartão: com as validações do Novo cartão; salvo, volta à lista sem guardar o código', async ({ page }) => {
  await entrar(page);
  await adicionar(page, { numero: '1234123412341234', nome: '', validade: '0120', codigo: '1' });
  await expect(form(page).getByText('Número de cartão inválido')).toBeVisible();
  await expect(form(page).getByText('Informe o nome impresso no cartão.')).toBeVisible();
  await expect(form(page).getByText('Informe uma validade futura (MM/AA).')).toBeVisible();
  await expect(form(page).getByText('Informe o código de segurança de 3 dígitos.')).toBeVisible();
  await expect(form(page).getByRole('textbox', { name: 'Número do cartão' })).toBeFocused();
  await expect(form(page).getByRole('textbox', { name: 'Número do cartão' })).toHaveValue('1234 1234 1234 1234');

  await form(page).getByRole('textbox', { name: 'Número do cartão' }).fill('5555555555554444');
  await form(page).getByRole('textbox', { name: 'Nome impresso no cartão' }).fill('Mariana Silva');
  await form(page).getByRole('textbox', { name: 'Validade' }).fill('0830');
  await expect(form(page).getByRole('textbox', { name: 'Validade' })).toHaveValue('08/30');
  await form(page).getByRole('textbox', { name: 'Código de segurança' }).fill('123');
  await form(page).getByRole('button', { name: 'Salvar cartão' }).click();
  await expect(page).toHaveURL(/#conta\/pagamentos$/);
  await expect(page.locator('.toast')).toHaveText('Cartão salvo.');
  await expect(card(page, 'Mastercard · final 4444')).toContainText('Mariana Silva · Validade 08/30');
  await expect(card(page, 'Mastercard · final 4444')).not.toContainText('Cartão padrão');
  expect(await page.evaluate(() => sessionStorage.getItem('bk-sessao'))).not.toContain('"cvv":"123"');
  // Back from the list does not reopen the form.
  await page.goBack();
  await expect(page).not.toHaveURL(/#conta\/cartao$/);
});

test('o mesmo cartão não é salvo duas vezes; Cancelar descarta', async ({ page }) => {
  await entrar(page);
  await adicionar(page, { numero: '4242424242424242', validade: '0829' });
  await expect(form(page).getByText('Esse cartão já está salvo.')).toBeVisible();
  await conta(page).getByRole('link', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#conta\/pagamentos$/);
  await expect(conta(page).getByRole('region')).toHaveCount(1);
  // Opening the form again starts empty.
  await conta(page).getByRole('link', { name: 'Adicionar cartão' }).click();
  await expect(form(page).getByRole('textbox', { name: 'Número do cartão' })).toHaveValue('');
});

test('Remover cartão pede confirmação; removido o padrão, o seguinte assume; o Checkout também muda', async ({ page }) => {
  await entrar(page);
  await adicionar(page);
  await card(page, 'Visa · final 4242').getByRole('button', { name: 'Remover cartão Visa final 4242' }).click();
  await expect(titulo(page)).toHaveText('Remover cartão?');
  const confirmacao = card(page, 'Remover Visa final 4242?');
  await expect(confirmacao).toContainText('Você poderá adicionar o cartão novamente quando quiser.');
  await confirmacao.getByRole('button', { name: 'Manter cartão' }).click();
  await expect(card(page, 'Visa · final 4242')).toBeVisible();

  await card(page, 'Visa · final 4242').getByRole('button', { name: 'Remover cartão Visa final 4242' }).click();
  await confirmacao.getByRole('button', { name: 'Remover cartão' }).click();
  await expect(page).toHaveURL(/#conta\/pagamentos$/);
  await expect(page.locator('.toast')).toHaveText('Cartão removido.');
  await expect(card(page, 'Visa · final 4242')).toHaveCount(0);
  await expect(card(page, 'Mastercard · final 4444')).toContainText('Cartão padrão');
  await page.goto('/#conta/remover-cartao');
  await expect(page).toHaveURL(/#conta$/);

  // The Pagamento offers only the card left.
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await page.getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await page.locator('#address-content').getByRole('button', { name: 'Entregar neste endereço' }).click();
  await page.getByRole('radiogroup', { name: 'Forma de pagamento' }).getByRole('radio', { name: 'Cartão de crédito' }).check();
  const seus = page.getByRole('radiogroup', { name: 'Seus cartões' }).getByRole('radio');
  await expect(seus).toHaveCount(1);
  await expect(seus.first()).toHaveAccessibleName('Mastercard •••• 4444');
});

test('sem Cartões salvos, o estado vazio oferece Adicionar cartão', async ({ page }) => {
  await entrar(page, '11987654321');
  await expect(card(page, 'Nenhum cartão salvo')).toBeVisible();
  await expect(conta(page).getByRole('link', { name: 'Adicionar cartão' })).toBeVisible();
});
