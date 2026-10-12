// Dados pessoais e Alterar celular (ticket 05 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';

const cabecalho = (page) => page.getByRole('banner');
const conta = (page) => page.locator('#account-page');
const titulo = (page) => page.getByRole('heading', { level: 1 });
const dados = (page) => conta(page).getByRole('region', { name: 'Dados pessoais' });
const troca = (page) => conta(page).getByRole('region', { name: 'Alterar celular' });

/** Mariana identified, on `pagina` (a page of Minha conta). */
async function entrar(page, pagina = '#conta/dados') {
  await page.goto('/' + pagina);
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
}
/** Alterar celular to `numero`, by WhatsApp, with the code `codigo`. */
async function trocarPara(page, numero, codigo = '123456') {
  await dados(page).getByRole('link', { name: 'Alterar celular' }).click();
  await expect(titulo(page)).toHaveText('Alterar celular');
  await troca(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await troca(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await troca(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill(codigo);
  await troca(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
}

test('Dados pessoais abre com o cadastro; salvar atualiza o nome no header', async ({ page }) => {
  await entrar(page);
  await expect(titulo(page)).toHaveText('Dados pessoais');
  await expect(conta(page).getByRole('navigation', { name: 'Minha conta' }).locator('a[aria-current=page]')).toHaveText('Dados pessoais');
  await expect(dados(page).getByRole('textbox', { name: 'Celular' })).toHaveValue('(61) 99999-1234');
  await expect(dados(page).getByRole('textbox', { name: 'Celular' })).toHaveAttribute('readonly', '');
  await expect(dados(page).getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Mariana Silva');
  await expect(dados(page).getByRole('textbox', { name: 'E-mail (opcional)' })).toHaveValue('');

  await dados(page).getByRole('textbox', { name: 'Nome completo' }).fill('Mari Silva');
  await dados(page).getByRole('textbox', { name: 'E-mail (opcional)' }).fill('mari@exemplo.com');
  await dados(page).getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.locator('.toast')).toHaveText('Dados atualizados.');
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Mari' })).toBeVisible();
  await page.reload();
  await expect(dados(page).getByRole('textbox', { name: 'E-mail (opcional)' })).toHaveValue('mari@exemplo.com');
});

test('erros mantêm o que foi digitado; Cancelar descarta e volta a Minha conta', async ({ page }) => {
  await entrar(page);
  await dados(page).getByRole('textbox', { name: 'Nome completo' }).fill('');
  await dados(page).getByRole('textbox', { name: 'E-mail (opcional)' }).fill('mari@');
  await dados(page).getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(dados(page).getByText('Informe seu nome completo.')).toBeVisible();
  await expect(dados(page).getByText('Informe um e-mail válido.')).toBeVisible();
  await expect(dados(page).getByRole('textbox', { name: 'Nome completo' })).toBeFocused();
  await expect(dados(page).getByRole('textbox', { name: 'E-mail (opcional)' })).toHaveValue('mari@');
  await dados(page).getByRole('link', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#conta$/);
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' })).toBeVisible();
  await page.goto('/#conta/dados');
  await expect(dados(page).getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Mariana Silva');
  await expect(dados(page).getByText('Informe seu nome completo.')).toHaveCount(0);
});

test('Alterar celular: código pelo canal escolhido; confirmado, o mesmo cadastro com o novo celular', async ({ page }) => {
  await entrar(page);
  await dados(page).getByRole('link', { name: 'Alterar celular' }).click();
  await expect(page).toHaveURL(/#conta\/celular$/);
  await expect(conta(page).getByText('Confirme um novo celular para manter seus dados e pedidos vinculados a você.')).toBeVisible();
  // The current celular is not a new one.
  await troca(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await troca(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await expect(troca(page).getByText('Este já é o seu celular. Informe um número diferente.')).toBeVisible();

  await troca(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('11988884321');
  await troca(page).getByRole('button', { name: 'Receber por SMS' }).click();
  await expect(titulo(page)).toHaveText('Confirmar novo celular');
  await expect(troca(page).getByText('Enviamos um código por SMS para (11) 98888-4321. Confirme para atualizar seu celular.')).toBeVisible();
  await troca(page).getByRole('button', { name: 'Receber pelo WhatsApp' }).click();
  await expect(page.locator('.toast')).toContainText('pelo WhatsApp para (11) 98888-4321');
  // A wrong code changes nothing.
  await troca(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('000000');
  await troca(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  await expect(troca(page).getByText('Código incorreto. Confira e tente novamente.')).toBeVisible();
  await troca(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await troca(page).getByRole('button', { name: 'Confirmar e continuar' }).click();

  await expect(page).toHaveURL(/#conta\/dados$/);
  await expect(page.locator('.toast')).toHaveText('Celular atualizado.');
  await expect(dados(page).getByRole('textbox', { name: 'Celular' })).toHaveValue('(11) 98888-4321');
  // Same cadastro: name, Endereços salvos and the fixed Pedidos stay.
  await expect(dados(page).getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Mariana Silva');
  await page.goto('/#conta');
  await expect(conta(page).getByText('Seu cadastro está vinculado ao celular (11) 98888-4321.')).toBeVisible();
  await expect(conta(page).getByRole('region', { name: 'Pedido em andamento' })).toContainText('#BK-10482');
  // Back from Dados pessoais does not reopen the code.
  await page.goBack();
  await expect(page).not.toHaveURL(/#conta\/celular$/);
});

test('Cancelar e Alterar celular, no código, não mudam o vínculo', async ({ page }) => {
  await entrar(page);
  await dados(page).getByRole('link', { name: 'Alterar celular' }).click();
  await troca(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('11988884321');
  await troca(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await troca(page).getByRole('button', { name: 'Alterar celular' }).click();
  await expect(titulo(page)).toHaveText('Alterar celular');
  await expect(troca(page).getByRole('textbox', { name: 'Celular com DDD' })).toBeFocused();
  await expect(troca(page).getByRole('textbox', { name: 'Celular com DDD' })).toHaveValue('(11) 98888-4321');
  await conta(page).getByRole('link', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#conta\/dados$/);
  await expect(dados(page).getByRole('textbox', { name: 'Celular' })).toHaveValue('(61) 99999-1234');
  // Starting over begins empty.
  await dados(page).getByRole('link', { name: 'Alterar celular' }).click();
  await expect(troca(page).getByRole('textbox', { name: 'Celular com DDD' })).toHaveValue('');
});

test('celular de outro cadastro: "Celular já vinculado", sem juntar cadastros', async ({ page }) => {
  await entrar(page);
  await trocarPara(page, '61900000000');
  await expect(titulo(page)).toHaveText('Este celular já tem um cadastro');
  await expect(titulo(page)).toBeFocused();
  const aviso = conta(page).getByRole('region', { name: 'Não foi possível vincular este número.' });
  await expect(aviso).toContainText('Este celular já está vinculado a outro cadastro. Seus dados e pedidos permanecem no celular atual.');
  await aviso.getByRole('button', { name: 'Informar outro celular' }).click();
  await expect(titulo(page)).toHaveText('Alterar celular');
  await expect(troca(page).getByRole('textbox', { name: 'Celular com DDD' })).toHaveValue('');
  await conta(page).getByRole('link', { name: 'Cancelar' }).click();
  await expect(dados(page).getByRole('textbox', { name: 'Celular' })).toHaveValue('(61) 99999-1234');
});
