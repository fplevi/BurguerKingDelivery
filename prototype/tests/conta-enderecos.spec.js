// Endereços em Minha conta (ticket 06 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';

const conta = (page) => page.locator('#account-page');
/** The address pages (busca, mapa, dados), titled "Endereços" when opened from Minha conta. */
const paginaDeEndereco = (page) => page.locator('#address-page');
const resultadosDaBusca = (page) => paginaDeEndereco(page).getByRole('list', { name: 'Resultados da busca' }).getByRole('button');
const titulo = (page) => page.getByRole('heading', { level: 1 });
const card = (page, nome) => conta(page).getByRole('region', { name: nome, exact: true });

/** Identified with `numero` (a Novo cliente registers as Ana Souza), on Endereços. */
async function entrar(page, numero = '61999991234') {
  await page.goto('/#conta/enderecos');
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234') {
    await id.getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await id.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page).toHaveURL(/#conta\/enderecos$/);
}

test('lista os Endereços salvos com Editar e Remover', async ({ page }) => {
  await entrar(page);
  await expect(titulo(page)).toHaveText('Endereços');
  await expect(card(page, 'Casa')).toContainText('Av. Paulista, 1578');
  await expect(card(page, 'Casa')).toContainText('Bela Vista, São Paulo — SP · Apto. 21 · Portaria principal');
  await expect(card(page, 'Trabalho')).toContainText('Rua Augusta, 1508');
  await expect(card(page, 'Casa').getByRole('button', { name: 'Editar endereço Casa' })).toBeVisible();
  const remover = card(page, 'Casa').getByRole('button', { name: 'Remover endereço Casa' });
  await expect(remover).toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(remover).toHaveCSS('border-top-width', '0px');
  await expect(remover).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('Adicionar endereço: busca, mapa e dados de entrega; salvo, volta à lista com ele', async ({ page }) => {
  await entrar(page);
  await conta(page).getByRole('button', { name: 'Adicionar endereço' }).click();
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await expect(paginaDeEndereco(page).getByRole('list', { name: 'Etapas do pedido' })).toHaveCount(0);
  await expect(page.locator('#address-back')).toHaveText('Voltar aos endereços');
  await expect(titulo(page)).toHaveText('Endereços');
  await buscarEnderecoAqui(page, 'augusta');
  await resultadosDaBusca(page).filter({ hasText: 'Rua Augusta, 1508' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
  const dados = paginaDeEndereco(page).locator('[data-address-form]');
  await dados.getByRole('textbox', { name: 'Complemento' }).fill('Sala 3');
  await dados.getByRole('radio', { name: 'Favoritos' }).check();
  await dados.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page).toHaveURL(/#conta\/enderecos$/);
  await expect(page.locator('.toast')).toHaveText('Endereço salvo.');
  await expect(card(page, 'Favoritos')).toContainText('Consolação, São Paulo — SP · Sala 3');
  // Back from the list does not reopen the address pages.
  await page.goBack();
  await expect(page).not.toHaveURL(/#endereco/);
});

/** The Busca opened by Adicionar endereço (already on #endereco/buscar). */
async function buscarEnderecoAqui(page, texto) {
  await paginaDeEndereco(page).getByRole('searchbox', { name: 'Buscar endereço e número' }).fill(texto);
}

test('Voltar aos endereços, na busca, volta sem salvar', async ({ page }) => {
  await entrar(page);
  await conta(page).getByRole('button', { name: 'Adicionar endereço' }).click();
  await page.locator('#address-back').click();
  await expect(page).toHaveURL(/#conta\/enderecos$/);
  await expect(conta(page).getByRole('region')).toHaveCount(2);
});

test('Editar endereço: os dados atuais; salvar volta à lista com as mudanças', async ({ page }) => {
  await entrar(page);
  await card(page, 'Trabalho').getByRole('button', { name: 'Editar endereço Trabalho' }).click();
  await expect(page).toHaveURL(/#endereco\/editar$/);
  const dados = paginaDeEndereco(page).locator('[data-address-form]');
  await expect(dados.getByRole('textbox', { name: 'Complemento' })).toHaveValue('8º andar');
  await dados.getByRole('textbox', { name: 'Complemento' }).fill('9º andar');
  await dados.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page).toHaveURL(/#conta\/enderecos$/);
  await expect(card(page, 'Trabalho')).toContainText('9º andar');
});

test('Remover endereço pede confirmação: Manter não muda; Remover tira só ele e limpa o Endereço de entrega em uso', async ({ page }) => {
  await entrar(page);
  // Casa as the Endereço de entrega, from the menu.
  await page.goto('/');
  await page.getByRole('button', { name: 'Informar endereço de entrega' }).click();
  await page.locator('#address-content').getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(page.getByText('Entregar em Av. Paulista, 1578 · Bela Vista')).toBeVisible();

  await page.goto('/#conta/enderecos');
  await card(page, 'Casa').getByRole('button', { name: 'Remover endereço Casa' }).click();
  await expect(titulo(page)).toHaveText('Remover endereço?');
  const confirmacao = card(page, 'Casa · Av. Paulista, 1578');
  await expect(confirmacao).toContainText('O endereço sai da sua lista. Os pedidos anteriores continuam no histórico.');
  await confirmacao.getByRole('button', { name: 'Manter endereço' }).click();
  await expect(page).toHaveURL(/#conta\/enderecos$/);
  await expect(card(page, 'Casa')).toBeVisible();

  await card(page, 'Casa').getByRole('button', { name: 'Remover endereço Casa' }).click();
  await confirmacao.getByRole('button', { name: 'Remover endereço' }).click();
  await expect(page).toHaveURL(/#conta\/enderecos$/);
  await expect(page.locator('.toast')).toHaveText('Endereço removido.');
  await expect(card(page, 'Casa')).toHaveCount(0);
  await expect(card(page, 'Trabalho')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Onde vamos entregar?')).toBeVisible();
  // #conta/remover-endereco without an address chosen: Minha conta.
  await page.goto('/#conta/remover-endereco');
  await expect(page).toHaveURL(/#conta$/);
});

test('sem Endereços salvos, o estado vazio oferece Adicionar endereço', async ({ page }) => {
  await entrar(page, '11987654321');
  await expect(card(page, 'Nenhum endereço salvo')).toBeVisible();
  await expect(conta(page).getByRole('button', { name: 'Adicionar endereço' })).toBeVisible();
});
