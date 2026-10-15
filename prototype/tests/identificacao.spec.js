// Identificação do Checkout: celular, Código de confirmação, Cliente cadastrado × Novo cliente (ticket 02 of checkout).
import { test, expect } from '@playwright/test';
import { carrinho, checkout, etapas, aviso } from './support.js';

const identificacao = (page) => checkout(page).getByRole('region', { name: 'Identificação' });
const celular = (page) => identificacao(page).getByRole('textbox', { name: 'Celular com DDD' });
const codigo = (page) => identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' });
const botao = (page, name) => identificacao(page).getByRole('button', { name, exact: true });

/** A Whopper® in the cart, then Carrinho → Continuar: the Checkout opens on Identificação. */
async function irAoCheckout(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await expect(checkout(page)).toBeVisible();
}

test('o celular ganha a máscara (DD) 9XXXX-XXXX e os envios só se habilitam com 11 dígitos', async ({ page }) => {
  await irAoCheckout(page);
  await expect(identificacao(page).getByRole('heading', { name: 'Qual é o seu celular?' })).toBeVisible();
  await expect(identificacao(page).getByText('Seus dados só serão recuperados após a confirmação.')).toBeVisible();
  await expect(celular(page)).toHaveAttribute('placeholder', '(00) 00000-0000');
  await expect(botao(page, 'Receber código pelo WhatsApp')).toBeDisabled();
  await expect(botao(page, 'Receber por SMS')).toBeDisabled();

  await celular(page).pressSequentially('6199999123');
  await expect(celular(page)).toHaveValue('(61) 99999-123');
  await expect(botao(page, 'Receber código pelo WhatsApp')).toBeDisabled();
  await celular(page).pressSequentially('4');
  await expect(celular(page)).toHaveValue('(61) 99999-1234');
  await expect(botao(page, 'Receber código pelo WhatsApp')).toBeEnabled();
  await expect(botao(page, 'Receber por SMS')).toBeEnabled();
  // No room for a 12th digit; letters never get in.
  await celular(page).pressSequentially('5a');
  await expect(celular(page)).toHaveValue('(61) 99999-1234');
  await celular(page).press('Backspace');
  await expect(celular(page)).toHaveValue('(61) 99999-123');
  await expect(botao(page, 'Receber por SMS')).toBeDisabled();
});

const endereco = (page) => page.getByRole('region', { name: 'Endereço de entrega' });
const etapasDoEndereco = (page) => endereco(page).getByRole('list', { name: 'Etapas do pedido' }).getByRole('listitem');

/** Celular typed and the code requested by `canal` ('WhatsApp' or 'SMS'). */
async function pedirCodigo(page, numero, canal = 'WhatsApp') {
  await celular(page).fill(numero);
  await botao(page, canal === 'SMS' ? 'Receber por SMS' : 'Receber código pelo WhatsApp').click();
  await expect(identificacao(page).getByRole('heading', { name: 'Confirme seu celular' })).toBeVisible();
}
async function confirmar(page, numero, canal) {
  await pedirCodigo(page, numero, canal);
  await codigo(page).fill('123456');
  await botao(page, 'Confirmar e continuar').click();
}

test('Cliente cadastrado (61) 99999-1234 confirma pelo WhatsApp e vai direto ao Endereço', async ({ page }) => {
  await irAoCheckout(page);
  await pedirCodigo(page, '61999991234');
  await expect(identificacao(page).getByText('Enviamos um código pelo WhatsApp para (61) 99999-1234.')).toBeVisible();
  await expect(codigo(page)).toBeFocused();
  await expect(botao(page, 'Confirmar e continuar')).toBeDisabled();
  await codigo(page).fill('123456');
  await botao(page, 'Confirmar e continuar').click();

  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Endereço de entrega' })).toBeFocused();
  await expect(checkout(page)).toBeHidden();
  await expect(etapasDoEndereco(page).nth(0)).toHaveText('Identificação, concluída');
  await expect(etapasDoEndereco(page).nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('banner').getByText('Entregar em')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Como podemos te chamar?' })).toHaveCount(0);
  // The Checkout's place in history became #endereco: Back goes to the Carrinho.
  await page.goBack();
  await expect(carrinho(page)).toBeVisible();
});

test('Cliente cadastrado (61) 90000-0000 confirma por SMS e também vai direto ao Endereço', async ({ page }) => {
  await irAoCheckout(page);
  await confirmar(page, '61900000000', 'SMS');
  await expect(endereco(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Como podemos te chamar?' })).toHaveCount(0);
});

test('Reenviar código e trocar de canal atualizam o destino e mostram o toast, sem sair da confirmação', async ({ page }) => {
  await irAoCheckout(page);
  await pedirCodigo(page, '61999991234', 'SMS');
  const destino = identificacao(page).getByText(/^Enviamos um código/);
  await expect(destino).toHaveText('Enviamos um código por SMS para (61) 99999-1234.');
  await expect(page.getByRole('status').filter({ hasText: 'Enviamos' })).toHaveCount(0);

  await botao(page, 'Reenviar código').click();
  await expect(aviso(page)).toHaveText('Enviamos um código por SMS para (61) 99999-1234.');
  await expect(aviso(page)).toBeVisible();

  await botao(page, 'Receber pelo WhatsApp').click();
  await expect(destino).toHaveText('Enviamos um código pelo WhatsApp para (61) 99999-1234.');
  await expect(aviso(page)).toHaveText('Enviamos um código pelo WhatsApp para (61) 99999-1234.');
  await expect(botao(page, 'Receber pelo WhatsApp')).toHaveCount(0);
  await expect(botao(page, 'Receber por SMS')).toBeFocused();

  await botao(page, 'Receber por SMS').click();
  await expect(destino).toHaveText('Enviamos um código por SMS para (61) 99999-1234.');
  await expect(identificacao(page).getByRole('heading', { name: 'Confirme seu celular' })).toBeVisible();
  await expect(etapas(page).nth(0)).toHaveAttribute('aria-current', 'step');
});

test('Código incorreto mostra o erro e desabilita Confirmar até o código mudar', async ({ page }) => {
  await irAoCheckout(page);
  await pedirCodigo(page, '61999991234');
  await codigo(page).fill('654321');
  await botao(page, 'Confirmar e continuar').click();
  await expect(identificacao(page).getByText('Código incorreto. Confira e tente novamente.')).toBeVisible();
  await expect(codigo(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(codigo(page)).toHaveCSS('border-color', 'rgb(217, 0, 0)');
  await expect(codigo(page)).toBeFocused();
  await expect(codigo(page)).toHaveValue('654321');
  await expect(botao(page, 'Confirmar e continuar')).toBeDisabled();
  await expect(page).toHaveURL(/#checkout$/);

  // Resending does not change the code: the error stays.
  await botao(page, 'Reenviar código').click();
  await expect(botao(page, 'Confirmar e continuar')).toBeDisabled();

  await codigo(page).press('End');
  await codigo(page).press('Backspace');
  await expect(identificacao(page).getByText('Código incorreto. Confira e tente novamente.')).toHaveCount(0);
  await expect(codigo(page)).toHaveAttribute('aria-invalid', 'false');
  await expect(codigo(page)).toBeFocused();
  await codigo(page).pressSequentially('6');
  await expect(codigo(page)).toHaveValue('654326');
  await expect(botao(page, 'Confirmar e continuar')).toBeEnabled();

  // No limit of attempts: wrong again, then right.
  await botao(page, 'Confirmar e continuar').click();
  await expect(identificacao(page).getByText('Código incorreto. Confira e tente novamente.')).toBeVisible();
  await codigo(page).fill('123456');
  await botao(page, 'Confirmar e continuar').click();
  await expect(endereco(page)).toBeVisible();
});

test('o código aceita só dígitos, até 6', async ({ page }) => {
  await irAoCheckout(page);
  await pedirCodigo(page, '61999991234');
  await codigo(page).pressSequentially('12a34567');
  await expect(codigo(page)).toHaveValue('123456');
});

test('Alterar celular volta ao celular preenchido, e o novo envio pede um novo código', async ({ page }) => {
  await irAoCheckout(page);
  await pedirCodigo(page, '61999991234');
  await codigo(page).fill('123');
  await botao(page, 'Alterar celular').click();
  await expect(identificacao(page).getByRole('heading', { name: 'Qual é o seu celular?' })).toBeVisible();
  await expect(celular(page)).toHaveValue('(61) 99999-1234');
  await expect(celular(page)).toBeFocused();

  await celular(page).fill('11987654321');
  await botao(page, 'Receber por SMS').click();
  await expect(identificacao(page).getByText('Enviamos um código por SMS para (11) 98765-4321.')).toBeVisible();
  await expect(codigo(page)).toHaveValue('');
  await expect(botao(page, 'Confirmar e continuar')).toBeDisabled();
});

test('Novo cliente (qualquer outro celular) passa pelo cadastro: nome obrigatório, e-mail opcional e celular só para leitura', async ({ page }) => {
  await irAoCheckout(page);
  await confirmar(page, '11987654321');
  const cadastro = identificacao(page);
  await expect(cadastro.getByRole('heading', { name: 'Como podemos te chamar?' })).toBeVisible();
  await expect(cadastro.getByText('Complete seus dados para receber seu pedido.')).toBeVisible();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(etapas(page).nth(0)).toHaveAttribute('aria-current', 'step');
  const nome = cadastro.getByRole('textbox', { name: 'Nome completo' });
  const email = cadastro.getByRole('textbox', { name: 'E-mail (opcional)' });
  const seuCelular = cadastro.getByRole('textbox', { name: 'Celular', exact: true });
  await expect(seuCelular).toHaveValue('(11) 98765-4321');
  await expect(seuCelular).not.toBeEditable();

  await botao(page, 'Continuar').click();
  await expect(cadastro.getByText('Informe seu nome completo.')).toBeVisible();
  await expect(nome).toHaveAttribute('aria-invalid', 'true');
  await expect(nome).toBeFocused();

  await nome.fill('Ana Souza');
  await email.fill('ana@');
  await botao(page, 'Continuar').click();
  await expect(cadastro.getByText('Informe seu nome completo.')).toHaveCount(0);
  await expect(cadastro.getByText('Informe um e-mail válido.')).toBeVisible();
  await expect(nome).toHaveValue('Ana Souza');
  await expect(email).toBeFocused();
  await expect(email).toHaveValue('ana@');

  await email.fill('');
  await botao(page, 'Continuar').click();
  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
});

test('Novo cliente com e-mail válido segue para o Endereço', async ({ page }) => {
  await irAoCheckout(page);
  await confirmar(page, '11987654321', 'SMS');
  await identificacao(page).getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
  await identificacao(page).getByRole('textbox', { name: 'E-mail (opcional)' }).fill('ana@email.com');
  await botao(page, 'Continuar').click();
  await expect(endereco(page)).toBeVisible();
});

test('na sessão, o celular confirmado não pede o código de novo: o Checkout abre no Endereço', async ({ page }) => {
  await irAoCheckout(page);
  await confirmar(page, '61999991234');
  await expect(endereco(page)).toBeVisible();
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(checkout(page)).toBeHidden();
});

test('#endereco abre sem carrinho e sem celular confirmado (ADR 0002): o visitante escolhe só o Endereço de entrega', async ({ page }) => {
  await page.goto('/#endereco');
  await expect(endereco(page)).toBeVisible();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(carrinho(page)).toBeHidden();
  await expect(endereco(page).getByRole('button', { name: /^Buscar endereço e número/ })).toBeVisible();
  // Endereços de pedidos anteriores need a Cliente cadastrado.
  await page.evaluate(() => (location.hash = 'endereco/anteriores'));
  await expect(page).toHaveURL(/#endereco$/);
});

// Fronteira confirmada: apresentação e ações públicas do Código de confirmação.
test('Código apresenta Alterar celular antes do campo e ações empilhadas na ordem revisada', async ({ page }) => {
  await irAoCheckout(page);
  await celular(page).fill('61999991234');
  await botao(page, 'Receber código pelo WhatsApp').click();
  const change = await botao(page, 'Alterar celular').boundingBox();
  const input = await codigo(page).boundingBox();
  expect(change.y + change.height).toBeLessThanOrEqual(input.y);
  const actions = await Promise.all(['Confirmar e continuar', 'Receber por SMS', 'Reenviar código'].map(name => botao(page, name).boundingBox()));
  for (let i = 1; i < actions.length; i++) {
    expect(actions[i].y).toBeGreaterThanOrEqual(actions[i - 1].y + actions[i - 1].height);
    expect(actions[i].x).toBeCloseTo(actions[0].x, 0);
    expect(actions[i].width).toBeCloseTo(actions[0].width, 0);
  }
  await expect(botao(page, 'Confirmar e continuar')).toBeDisabled();
});
