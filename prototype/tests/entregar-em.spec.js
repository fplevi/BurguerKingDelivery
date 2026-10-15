// Endereço de entrega no topo do cardápio, escolhido sem Identificação (ticket 02 of minha-conta-pedidos, ADR 0002).
import { test, expect } from '@playwright/test';
import { carrinho, checkout, continuarDoCarrinho, paginaDeEndereco, buscarEndereco, resultadosDaBusca } from './support.js';

const hero = (page) => page.locator('section.hero');
const informar = (page) => hero(page).getByRole('button', { name: 'Informar endereço de entrega' });
const alterar = (page) => hero(page).getByRole('button', { name: 'Alterar o endereço de entrega' });
const dados = (page) => paginaDeEndereco(page).locator('[data-address-form]');

/** From the menu, a visitor: Informar endereço → Busca `texto` → the result `lugar` → Confirmar localização. */
async function escolherLugar(page, texto, lugar) {
  await (await informar(page).isVisible() ? informar(page) : alterar(page)).click();
  await buscarEndereco(page, texto);
  await resultadosDaBusca(page).filter({ hasText: lugar }).click();
}
/** The visitor's whole flow, with a complement: back on the menu. */
async function entregarNaPaulista(page) {
  await escolherLugar(page, 'paulista', 'Avenida Paulista, 1578');
  await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
  await dados(page).getByRole('textbox', { name: 'Complemento' }).fill('Apto. 21');
  await dados(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
}

test('sem endereço, cada categoria mostra "Onde vamos entregar?" no topo; o Carrinho não tem a linha', async ({ page }) => {
  for (const categoria of ['', '#acompanhamentos', '#bebidas', '#sobremesas']) {
    await page.goto('/' + categoria);
    await expect(hero(page).getByText('Onde vamos entregar?')).toBeVisible();
    await expect(informar(page)).toHaveText('Informar endereço');
  }
  await page.getByRole('banner').getByRole('button', { name: /^Carrinho · / }).click();
  await expect(carrinho(page)).toBeVisible();
  await expect(page.getByText('Onde vamos entregar?')).toBeHidden();
});

test('o visitante escolhe o endereço sem se identificar e volta à categoria de onde saiu', async ({ page }) => {
  await page.goto('/#bebidas');
  await escolherLugar(page, 'paulista', 'Avenida Paulista, 1578');
  // Not a step of the Checkout: no indicador de etapas, and the way back is the menu.
  await expect(paginaDeEndereco(page).getByRole('list', { name: 'Etapas do pedido' })).toHaveCount(0);
  await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
  await expect(page).toHaveURL(/#endereco\/dados$/);
  await expect(dados(page).getByRole('group', { name: 'Como você quer salvar?' })).toHaveCount(0);
  await expect(dados(page).getByRole('button', { name: 'Salvar endereço' })).toHaveCount(0);
  await dados(page).getByRole('textbox', { name: 'Complemento' }).fill('Apto. 21');
  await dados(page).getByRole('button', { name: 'Entregar neste endereço' }).click();

  await expect(page).toHaveURL(/#bebidas$/);
  await expect(hero(page)).toContainText('Entregar em Av. Paulista, 1578 · Bela Vista');
  await expect(alterar(page)).toHaveText('Alterar');
  // No message when we deliver there.
  await expect(page.locator('.toast')).toBeHidden();
  await page.reload();
  await expect(hero(page)).toContainText('Entregar em Av. Paulista, 1578 · Bela Vista');
});

test('Voltar ao cardápio, em Seus endereços aberto pelo cardápio, volta à categoria sem mudar nada', async ({ page }) => {
  await page.goto('/#sobremesas');
  await informar(page).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#sobremesas$/);
  await expect(informar(page)).toBeVisible();
});

test('fora da região: avisa e Voltar ao cardápio mantém o endereço anterior', async ({ page }) => {
  await page.goto('/#acompanhamentos');
  await entregarNaPaulista(page);
  await escolherLugar(page, 'estrada do campo', 'Estrada do Campo, 120');
  await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Ainda não entregamos nessa região' })).toBeVisible();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#acompanhamentos$/);
  await expect(hero(page)).toContainText('Entregar em Av. Paulista, 1578 · Bela Vista');
});

test('identificado no Checkout, o endereço do visitante continua marcado e pode ser salvo', async ({ page }) => {
  await page.goto('/');
  await entregarNaPaulista(page);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  // Not identified yet: the Identificação comes first.
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();

  // The Endereço step is not skipped: the visitor's address, first and marked, above Casa and Trabalho.
  await expect(page).toHaveURL(/#endereco$/);
  const enderecos = paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' }).getByRole('radio');
  await expect(enderecos).toHaveCount(3);
  await expect(enderecos.first()).toBeChecked();
  await expect(enderecos.first()).toHaveAccessibleName(/^Novo endereço Av\. Paulista, 1578/);

  await paginaDeEndereco(page).getByRole('button', { name: 'Salvar o endereço Av. Paulista, 1578' }).click();
  await expect(page).toHaveURL(/#endereco\/dados$/);
  await expect(dados(page).getByRole('textbox', { name: 'Complemento' })).toHaveValue('Apto. 21');
  await dados(page).getByRole('radio', { name: 'Favoritos' }).check();
  await dados(page).getByRole('button', { name: 'Salvar endereço' }).click();

  await expect(page).toHaveURL(/#endereco$/);
  await expect(enderecos).toHaveCount(3);
  const favoritos = paginaDeEndereco(page).getByRole('radio', { name: /^Favoritos Av\. Paulista, 1578/ });
  await expect(favoritos).toBeChecked();
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(checkout(page).getByRole('heading', { name: 'Endereço de entrega' })).toBeVisible();
  await expect(checkout(page).getByText('Favoritos', { exact: true })).toBeVisible();
});

test('identificado, Alterar abre Seus endereços; escolher outro volta ao cardápio com ele e o Checkout usa o mesmo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(checkout(page).getByText('Av. Paulista, 1578')).toBeVisible();

  await page.goto('/#bebidas');
  await expect(hero(page)).toContainText('Entregar em Av. Paulista, 1578 · Bela Vista');
  await alterar(page).click();
  await expect(paginaDeEndereco(page).getByRole('radiogroup', { name: 'Endereços salvos' })).toBeVisible();
  await paginaDeEndereco(page).getByRole('radio', { name: /^Trabalho/ }).check();
  await paginaDeEndereco(page).getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(hero(page)).toContainText('Entregar em Rua Augusta, 1508 · Consolação');

  await page.getByRole('banner').getByRole('button', { name: /^Carrinho · / }).click();
  await continuarDoCarrinho(page);
  await expect(checkout(page).getByText('Rua Augusta, 1508')).toBeVisible();
});
