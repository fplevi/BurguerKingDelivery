// Endereços de pedidos anteriores, editar e remover (ticket 05 of checkout): #endereco/anteriores, the menu ⋮ of each
// Endereço salvo, #endereco/editar and #endereco/remover.
import { test, expect } from '@playwright/test';
import { paginaDeEndereco, irAosEnderecos, irAoPagamento, enderecosSalvos, menuDoEndereco, checkout, aviso } from './support.js';

const menu = (page) => page.getByRole('dialog', { name: 'Opções do endereço' });

test('Endereços de pedidos anteriores: escolher um volta aos Endereços salvos com ele marcado, até o Pagamento', async ({ page }) => {
  await irAosEnderecos(page);
  await paginaDeEndereco(page).getByRole('button', { name: 'Endereços de pedidos anteriores' }).click();
  await expect(page).toHaveURL(/#endereco\/anteriores$/);
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Pedidos anteriores' })).toBeVisible();
  const anteriores = paginaDeEndereco(page).getByRole('list', { name: 'Endereços de pedidos anteriores' }).getByRole('button');
  await expect(anteriores).toHaveCount(3);
  await expect(anteriores.first()).toContainText('Último pedido em 5 de outubro');
  await anteriores.filter({ hasText: 'Rua dos Pinheiros, 870' }).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(enderecosSalvos(page).getByRole('radio', { checked: true })).toHaveAccessibleName(/Pedido anterior Rua dos Pinheiros, 870/);
  await expect(enderecosSalvos(page).getByRole('radio')).toHaveCount(3);
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(page.getByRole('region', { name: 'Finalizar pedido' }).getByText('Rua dos Pinheiros, 870')).toBeVisible();
  // Back from the list: the Pagamento's Back no longer reopens the Endereços de pedidos anteriores.
  await page.goBack();
  await expect(page).toHaveURL(/#endereco$/);
});

test('o Novo cliente não abre os Endereços de pedidos anteriores', async ({ page }) => {
  await irAosEnderecos(page, '11987654321');
  await page.evaluate(() => (location.hash = 'endereco/anteriores'));
  await expect(page).toHaveURL(/#endereco$/);
});

test('menu ⋮ pelo teclado: abre com Editar e Remover, Esc fecha e devolve o foco ao ⋮', async ({ page }) => {
  await irAosEnderecos(page);
  await menuDoEndereco(page, 'Trabalho').focus();
  await page.keyboard.press('Enter');
  await expect(menu(page)).toBeVisible();
  await expect(menu(page).getByRole('button', { name: 'Editar endereço' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu(page).getByRole('button', { name: 'Remover endereço' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toHaveCount(0);
  await expect(menuDoEndereco(page, 'Trabalho')).toBeFocused();
  // Nothing changed: Casa still marked.
  await expect(enderecosSalvos(page).getByRole('radio', { checked: true })).toHaveAccessibleName(/^Casa/);
});

test('Editar o endereço em uso: o formulário vem preenchido e a alteração já vale para o Checkout', async ({ page }) => {
  await irAoPagamento(page);
  await checkout(page).getByRole('button', { name: 'Alterar' }).click();
  await menuDoEndereco(page, 'Casa').click();
  await menu(page).getByRole('button', { name: 'Editar endereço' }).click();
  await expect(page).toHaveURL(/#endereco\/editar$/);
  const pagina = paginaDeEndereco(page);
  await expect(pagina.getByRole('heading', { name: 'Editar endereço' })).toBeVisible();
  await expect(pagina.getByRole('textbox', { name: 'Rua' })).toHaveValue('Av. Paulista');
  await expect(pagina.getByRole('textbox', { name: 'Bairro' })).toHaveValue('Bela Vista');
  await expect(pagina.getByRole('textbox', { name: 'Número' })).toHaveValue('1578');
  await expect(pagina.getByRole('textbox', { name: 'Complemento' })).toHaveValue('Apto. 21');
  await expect(pagina.getByRole('textbox', { name: 'Ponto de referência' })).toHaveValue('Portaria principal');
  await expect(pagina.getByRole('radio', { name: 'Casa' })).toBeChecked();
  await pagina.getByRole('textbox', { name: 'Número' }).fill('');
  await pagina.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(pagina.getByText('Informe o número ou marque Endereço sem número.')).toBeVisible();
  await pagina.getByRole('textbox', { name: 'Número' }).fill('1580');
  await pagina.getByRole('textbox', { name: 'Complemento' }).fill('Apto. 92');
  await pagina.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(enderecosSalvos(page).getByRole('radio', { checked: true })).toHaveAccessibleName(/^Casa Av\. Paulista, 1580 .*Apto\. 92/);
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar ao checkout' }).click();
  await expect(checkout(page).getByText('Av. Paulista, 1580')).toBeVisible();
  await expect(checkout(page).getByText('Apto. 92')).toBeVisible();
});

test('Editar: Voltar desiste sem mudar o endereço; o Voltar do navegador depois de salvar não reabre o formulário', async ({ page }) => {
  await irAosEnderecos(page);
  await menuDoEndereco(page, 'Trabalho').click();
  await menu(page).getByRole('button', { name: 'Editar endereço' }).click();
  await paginaDeEndereco(page).getByRole('textbox', { name: 'Rua' }).fill('Rua Frei Caneca');
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(enderecosSalvos(page).getByRole('radio', { name: /^Trabalho Rua Augusta, 1508/ })).toHaveCount(1);
  await menuDoEndereco(page, 'Trabalho').click();
  await menu(page).getByRole('button', { name: 'Editar endereço' }).click();
  await paginaDeEndereco(page).getByRole('checkbox', { name: 'Endereço sem número' }).check();
  await paginaDeEndereco(page).getByRole('radio', { name: 'Favoritos' }).check();
  await paginaDeEndereco(page).getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(enderecosSalvos(page).getByRole('radio', { name: /^Favoritos Rua Augusta, s\/n/ })).toHaveCount(1);
  await page.goForward();
  await expect(page).toHaveURL(/#endereco$/);
});

test('Remover o endereço marcado: confirmação, toast "Endereço removido." e nenhum marcado, com Entregar neste endereço desabilitado', async ({ page }) => {
  await irAosEnderecos(page);
  await menuDoEndereco(page, 'Casa').click();
  await menu(page).getByRole('button', { name: 'Remover endereço' }).click();
  await expect(page).toHaveURL(/#endereco\/remover$/);
  const pagina = paginaDeEndereco(page);
  await expect(pagina.getByRole('heading', { name: 'Remover endereço?' })).toBeVisible();
  await expect(pagina.getByText('Av. Paulista, 1578')).toBeVisible();
  await expect(pagina.getByText('Você poderá cadastrar esse endereço novamente.')).toBeVisible();
  // Cancelar keeps it.
  await pagina.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(enderecosSalvos(page).getByRole('radio')).toHaveCount(2);
  await menuDoEndereco(page, 'Casa').click();
  await menu(page).getByRole('button', { name: 'Remover endereço' }).click();
  await pagina.getByRole('button', { name: 'Remover endereço' }).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(aviso(page)).toHaveText('Endereço removido.');
  await expect(enderecosSalvos(page).getByRole('radio')).toHaveCount(1);
  await expect(enderecosSalvos(page).getByRole('radio', { name: /^Casa/ })).toHaveCount(0);
  await expect(enderecosSalvos(page).getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(pagina.getByRole('button', { name: 'Entregar neste endereço' })).toBeDisabled();
  await enderecosSalvos(page).getByRole('radio', { name: /^Trabalho/ }).check();
  await expect(pagina.getByRole('button', { name: 'Entregar neste endereço' })).toBeEnabled();
  // Forward never reopens the confirmation of an address already removed.
  await page.goForward();
  await expect(page).toHaveURL(/#endereco$/);
});

test('Remover o endereço em uso no Checkout: o Checkout pede um novo endereço', async ({ page }) => {
  await irAoPagamento(page);
  await checkout(page).getByRole('button', { name: 'Alterar' }).click();
  await menuDoEndereco(page, 'Casa').click();
  await menu(page).getByRole('button', { name: 'Remover endereço' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Remover endereço' }).click();
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' })).toBeDisabled();
  await page.evaluate(() => (location.hash = 'checkout'));
  await expect(page).toHaveURL(/#endereco$/);
});
