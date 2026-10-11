// Buscar, confirmar no mapa e salvar um novo endereço (ticket 04 of checkout): #endereco/buscar, #endereco/confirmar, #endereco/dados.
import { test, expect } from '@playwright/test';
import { paginaDeEndereco, irAosEnderecos, buscarEndereco, resultadosDaBusca } from './support.js';

const mapa = (page) => paginaDeEndereco(page).getByRole('application', { name: /^Mapa/ });

test('busca com "paulista" lista a Av. Paulista, 1578 e vizinhos; escolher um abre Confirmar localização com o mapa', async ({ page }) => {
  await irAosEnderecos(page);
  await buscarEndereco(page, 'paulista');
  await expect(resultadosDaBusca(page).filter({ hasText: 'Avenida Paulista, 1578' })).toHaveCount(1);
  expect(await resultadosDaBusca(page).count()).toBeGreaterThan(1);
  await resultadosDaBusca(page).filter({ hasText: 'Avenida Paulista, 1578' }).click();
  await expect(page).toHaveURL(/#endereco\/confirmar$/);
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Confirme o local da entrega' })).toBeVisible();
  await expect(mapa(page)).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('© OpenStreetMap contributors')).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('Av. Paulista, 1578').first()).toBeVisible();
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' })).toBeVisible();
});

test('Usar localização atual negada mostra Localização indisponível; concedida, Tentar localização novamente leva à Av. Paulista, 1578', async ({ page, context }) => {
  await context.clearPermissions();
  await irAosEnderecos(page);
  await paginaDeEndereco(page).getByRole('button', { name: /^Usar localização atual/ }).click();
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Não conseguimos acessar sua localização' })).toBeVisible();
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Usar endereço salvo' })).toBeVisible();
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -15.79, longitude: -47.88 }); // Brasília: still the Av. Paulista
  await paginaDeEndereco(page).getByRole('button', { name: 'Tentar localização novamente' }).click();
  await expect(page).toHaveURL(/#endereco\/confirmar$/);
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Confirme o local da entrega' })).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('Av. Paulista, 1578').first()).toBeVisible();
});

test('Localização indisponível: Usar endereço salvo volta aos Endereços salvos; o Novo cliente não tem esse botão', async ({ page, context }) => {
  await context.clearPermissions();
  await irAosEnderecos(page);
  await paginaDeEndereco(page).getByRole('button', { name: /^Usar localização atual/ }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Usar endereço salvo' }).click();
  await expect(paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' })).toBeVisible();
  await irAosEnderecos(page, '11987654321');
  await paginaDeEndereco(page).getByRole('button', { name: /^Usar localização atual/ }).click();
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Não conseguimos acessar sua localização' })).toBeVisible();
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Usar endereço salvo' })).toHaveCount(0);
});

/** The tiles' position on screen. */
const tiles = async (page) => (await mapa(page).locator('img').first().boundingBox());

test('Confirmar localização: arrastar o mapa move-o sob o marcador sem mudar o endereço; Centralizar no endereço o traz de volta', async ({ page }) => {
  await irAosEnderecos(page);
  await buscarEndereco(page, 'paulista');
  await resultadosDaBusca(page).filter({ hasText: 'Avenida Paulista, 1578' }).click();
  const before = await tiles(page);
  const box = await mapa(page).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 40, box.y + box.height / 3 + 30, { steps: 8 });
  await page.mouse.up();
  const after = await tiles(page);
  expect(after.y - before.y).toBeCloseTo(30, 0);
  expect(after.x).toBeLessThan(before.x);
  await expect(paginaDeEndereco(page).getByText('Av. Paulista, 1578').first()).toBeVisible();
  // The arrow keys move it too.
  await mapa(page).press('ArrowUp');
  expect((await tiles(page)).y).toBeCloseTo(after.y + 24, 0);
  await paginaDeEndereco(page).getByRole('button', { name: 'Centralizar no endereço' }).click();
  expect(await tiles(page)).toEqual(before);
});

/** Busca "paulista" → Avenida Paulista, 1578 → Confirmar localização: the Dados de entrega (#endereco/dados). */
async function irAosDados(page, numero) {
  await irAosEnderecos(page, numero);
  await buscarEndereco(page, 'paulista');
  await resultadosDaBusca(page).filter({ hasText: 'Avenida Paulista, 1578' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
  await expect(page).toHaveURL(/#endereco\/dados$/);
}
const campo = (page, nome) => paginaDeEndereco(page).getByRole('textbox', { name: nome, exact: true });
const salvar = (page) => paginaDeEndereco(page).getByRole('button', { name: 'Salvar endereço' });

test('Dados de entrega começam pelo local escolhido; Rua, Bairro e Número são obrigatórios', async ({ page }) => {
  await irAosDados(page);
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Complete o endereço' })).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('© OpenStreetMap contributors')).toBeVisible();
  await expect(campo(page, 'Rua')).toHaveValue('Av. Paulista');
  await expect(campo(page, 'Bairro')).toHaveValue('Bela Vista');
  await expect(campo(page, 'Número')).toHaveValue('1578');
  await expect(campo(page, 'Complemento')).toHaveValue('');
  await expect(paginaDeEndereco(page).getByRole('radio', { name: 'Casa' })).toBeChecked();
  await campo(page, 'Rua').fill('');
  await campo(page, 'Bairro').fill(' ');
  await campo(page, 'Número').fill('');
  await campo(page, 'Ponto de referência').fill('Em frente ao MASP');
  await salvar(page).click();
  await expect(page).toHaveURL(/#endereco\/dados$/);
  await expect(campo(page, 'Rua')).toHaveAttribute('aria-invalid', 'true');
  await expect(campo(page, 'Rua')).toBeFocused();
  await expect(paginaDeEndereco(page).getByText('Informe a rua.')).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('Informe o bairro.')).toBeVisible();
  await expect(paginaDeEndereco(page).getByText('Informe o número ou marque Endereço sem número.')).toBeVisible();
  await expect(campo(page, 'Ponto de referência')).toHaveValue('Em frente ao MASP');
});

test('Salvar endereço "sem número" e "sem complemento" como Trabalho volta à lista com ele marcado e o toast; Entregar neste endereço o usa', async ({ page }) => {
  await irAosDados(page);
  await campo(page, 'Complemento').fill('Sala 3');
  await paginaDeEndereco(page).getByRole('checkbox', { name: 'Endereço sem número' }).check();
  await expect(campo(page, 'Número')).toBeDisabled();
  await expect(campo(page, 'Número')).toHaveValue('');
  await paginaDeEndereco(page).getByRole('checkbox', { name: 'Endereço sem complemento' }).check();
  await expect(campo(page, 'Complemento')).toBeDisabled();
  await expect(campo(page, 'Complemento')).toHaveValue('');
  await campo(page, 'Ponto de referência').fill('Em frente ao MASP');
  await paginaDeEndereco(page).getByRole('radio', { name: 'Trabalho' }).check();
  await salvar(page).click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(page.locator('#toast')).toHaveText('Endereço salvo e selecionado.');
  const salvos = paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' }).getByRole('radio');
  await expect(salvos).toHaveCount(3);
  await expect(salvos.nth(2)).toBeChecked();
  await expect(salvos.nth(2)).toHaveAccessibleName(/^Trabalho Av\. Paulista, s\/n Bela Vista, São Paulo — SP Em frente ao MASP$/);
  // Back from the list does not reopen the address pages: it goes where the list came from.
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  const cartao = page.getByRole('region', { name: 'Finalizar pedido' }).getByRole('region', { name: 'Endereço de entrega' });
  await expect(cartao).toContainText('Trabalho');
  await expect(cartao).toContainText('Av. Paulista, s/n');
  await expect(cartao).toContainText('Em frente ao MASP');
});

test('Novo cliente salva o primeiro endereço: aparece marcado, com Entregar neste endereço', async ({ page }) => {
  await irAosDados(page, '11987654321');
  await campo(page, 'Número').fill('1000');
  await campo(page, 'Complemento').fill('Apto. 5');
  await salvar(page).click();
  const salvos = paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' }).getByRole('radio');
  await expect(salvos).toHaveCount(1);
  await expect(salvos.first()).toBeChecked();
  await expect(salvos.first()).toHaveAccessibleName(/^Casa Av\. Paulista, 1000 Bela Vista, São Paulo — SP Apto\. 5$/);
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' })).toBeEnabled();
});

test('Voltar percorre Dados de entrega → Confirmar localização → Busca → Seus endereços; Ajustar localização no mapa volta ao mapa', async ({ page }) => {
  await irAosDados(page);
  const voltar = paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true });
  await paginaDeEndereco(page).getByRole('button', { name: 'Ajustar localização no mapa' }).click();
  await expect(page).toHaveURL(/#endereco\/confirmar$/);
  await expect(mapa(page)).toBeVisible();
  await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
  await voltar.click();
  await expect(page).toHaveURL(/#endereco\/confirmar$/);
  await voltar.click();
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await expect(paginaDeEndereco(page).getByRole('searchbox', { name: 'Buscar endereço e número' })).toHaveValue('paulista');
  await voltar.click();
  await expect(page).toHaveURL(/#endereco$/);
  await expect(voltar).toBeHidden();
  await expect(paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' })).toBeVisible();
});

test('Voltar ao checkout numa página do novo endereço volta ao Pagamento, de onde veio por Alterar', async ({ page }) => {
  await irAosEnderecos(page);
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await page.getByRole('region', { name: 'Finalizar pedido' }).getByRole('button', { name: 'Alterar' }).click();
  await buscarEndereco(page, 'augusta');
  await resultadosDaBusca(page).first().click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar ao checkout' }).click();
  await expect(page).toHaveURL(/#checkout$/);
  await expect(page.getByRole('region', { name: 'Finalizar pedido' }).getByRole('region', { name: 'Endereço de entrega' })).toContainText('Casa');
  // The same history entry as before Alterar: Back goes to the Seus endereços that came before it.
  await page.goBack();
  await expect(page).toHaveURL(/#endereco$/);
  await page.goForward();
  await page.goForward();
  await expect(page).toHaveURL(/#endereco$/);
});

test('sem um local escolhido, #endereco/confirmar e #endereco/dados levam à Busca', async ({ page }) => {
  await irAosEnderecos(page);
  await page.evaluate(() => (location.hash = 'endereco/confirmar'));
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await page.evaluate(() => (location.hash = 'endereco/dados'));
  await expect(page).toHaveURL(/#endereco\/buscar$/);
});

test('busca: vazia pede uma rua, "augusta" acha a Rua Augusta, 1508 e sem correspondência não encontra nada', async ({ page }) => {
  await irAosEnderecos(page);
  await paginaDeEndereco(page).getByRole('button', { name: /^Buscar endereço e número/ }).click();
  const campo = paginaDeEndereco(page).getByRole('searchbox', { name: 'Buscar endereço e número' });
  await expect(campo).toBeFocused();
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Digite uma rua, número ou lugar' })).toBeVisible();
  await campo.pressSequentially('Rua Augusta');
  await expect(campo).toBeFocused();
  await expect(resultadosDaBusca(page)).toHaveCount(1);
  await expect(resultadosDaBusca(page)).toContainText('Rua Augusta, 1508');
  await campo.fill('Rua sem resultado');
  await expect(resultadosDaBusca(page)).toHaveCount(0);
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Não encontramos esse endereço' })).toBeVisible();
});

test('"estrada do campo" está fora da região: não segue; Escolher outro endereço volta à busca e Voltar ao cardápio, ao cardápio', async ({ page }) => {
  await irAosEnderecos(page);
  await buscarEndereco(page, 'estrada do campo');
  await resultadosDaBusca(page).filter({ hasText: 'Estrada do Campo, 120' }).click();
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Ainda não entregamos nessa região' })).toBeVisible();
  await expect(paginaDeEndereco(page)).toContainText('Estrada do Campo, 120');
  await expect(paginaDeEndereco(page)).toContainText('Fora da área de entrega');
  await expect(paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' })).toHaveCount(0);
  // Not even by typing the Dados de entrega.
  await page.evaluate(() => (location.hash = 'endereco/dados'));
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await resultadosDaBusca(page).filter({ hasText: 'Estrada do Campo, 120' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Escolher outro endereço' }).click();
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await expect(paginaDeEndereco(page).getByRole('searchbox', { name: 'Buscar endereço e número' })).toHaveValue('estrada do campo');
  await resultadosDaBusca(page).filter({ hasText: 'Estrada do Campo, 120' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await expect(page).toHaveURL(/#hamburgueres$/);
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeVisible();
});
