// Identifique-se pelo header e páginas privadas (ticket 03 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';
import { carrinho, checkout, continuarDoCarrinho } from './support.js';

const cabecalho = (page) => page.getByRole('banner');
const pagina = (page) => page.getByRole('region', { name: 'Identifique-se' });
const identificacao = (page) => pagina(page).getByRole('region', { name: 'Identificação' });
const botao = (page, name) => identificacao(page).getByRole('button', { name, exact: true });

/** Celular `numero` and the code: a Cliente cadastrado is identified; a Novo cliente gets the form. */
async function confirmar(page, numero = '61999991234', canal = 'Receber código pelo WhatsApp') {
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await botao(page, canal).click();
  await identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await botao(page, 'Confirmar e continuar').click();
}

test('Identifique-se abre a página do Figma e, confirmado o celular, volta à página de origem com o nome', async ({ page }) => {
  await page.goto('/#bebidas');
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await expect(page).toHaveURL(/#identificar$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Identifique-se' })).toBeFocused();
  await expect(pagina(page).getByText('Seu celular é sua identificação. Sem senha e sem precisar criar uma conta.')).toBeVisible();
  await expect(identificacao(page).getByRole('heading', { name: 'Qual é o seu celular?' })).toBeVisible();
  await expect(page.locator('section.hero')).toBeHidden();

  await confirmar(page);
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' })).toBeVisible();
  // Back does not reopen Identifique-se: it was the next entry.
  await cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' }).click();
  await expect(page).toHaveURL(/#conta$/);
});

test('SMS, reenviar, trocar o canal, alterar o celular e código incorreto, como no Checkout', async ({ page }) => {
  await page.goto('/');
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await botao(page, 'Receber por SMS').click();
  await expect(identificacao(page).getByText('Enviamos um código por SMS para (61) 99999-1234.')).toBeVisible();
  await botao(page, 'Reenviar código').click();
  await expect(page.locator('.toast')).toContainText('(61) 99999-1234');
  await botao(page, 'Receber pelo WhatsApp').click();
  await expect(identificacao(page).getByText('Enviamos um código pelo WhatsApp para (61) 99999-1234.')).toBeVisible();
  await identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('000000');
  await botao(page, 'Confirmar e continuar').click();
  await expect(identificacao(page).getByText('Código incorreto. Confira e tente novamente.')).toBeVisible();
  await expect(page).toHaveURL(/#identificar$/);
  await botao(page, 'Alterar celular').click();
  await expect(identificacao(page).getByRole('textbox', { name: 'Celular com DDD' })).toHaveValue('(61) 99999-1234');
});

test('Novo cliente informa nome e e-mail antes de voltar', async ({ page }) => {
  await page.goto('/#sobremesas');
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await confirmar(page, '11987654321');
  await expect(identificacao(page).getByRole('heading', { name: 'Como podemos te chamar?' })).toBeVisible();
  await botao(page, 'Continuar').click();
  await expect(identificacao(page).getByText('Informe seu nome completo.')).toBeVisible();
  await identificacao(page).getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
  await identificacao(page).getByRole('textbox', { name: 'E-mail (opcional)' }).fill('ana@exemplo.com');
  await botao(page, 'Continuar').click();
  await expect(page).toHaveURL(/#sobremesas$/);
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Ana' })).toBeVisible();
});

test('Fechar volta à página de origem sem mexer no Carrinho', async ({ page }) => {
  await page.goto('/#acompanhamentos');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await pagina(page).getByRole('button', { name: 'Fechar' }).click();
  await expect(page).toHaveURL(/#acompanhamentos$/);
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
});

test('página privada sem identificação passa pela Identificação e depois abre; identificado, Identifique-se leva a Minha conta', async ({ page }) => {
  await page.goto('/#conta');
  await expect(page).toHaveURL(/#identificar$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Minha conta' })).toBeHidden();
  await confirmar(page);
  await expect(page).toHaveURL(/#conta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Minha conta' })).toBeVisible();

  await page.goto('/#identificar');
  await expect(page).toHaveURL(/#conta$/);
});

test('a identificação é uma só: pelo header pula a do Checkout; pelo Checkout, o header já mostra o nome', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await confirmar(page);
  await cabecalho(page).getByRole('button', { name: 'Carrinho · 1' }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  // Mariana, identified, with no Endereço de entrega yet: straight to Seus endereços.
  await expect(page).toHaveURL(/#endereco$/);
  await expect(checkout(page)).toBeHidden();

  const outra = await page.context().newPage();
  await outra.goto('/');
  await outra.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(outra);
  await checkout(outra).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await checkout(outra).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(outra).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(outra).getByRole('button', { name: 'Confirmar e continuar' }).click();
  await expect(cabecalho(outra).getByRole('button', { name: 'Minha conta · Mariana' })).toBeVisible();
  await expect(carrinho(outra)).toBeHidden();
});
