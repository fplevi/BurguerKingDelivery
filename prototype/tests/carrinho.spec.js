// Carrinho as its own screen at #carrinho (ticket 02 of carrinho).
import { test, expect } from '@playwright/test';
import { carrinho, itens, totalDoItem, totalDosItens, card, escolher, aviso } from './support.js';

const categorias = (page) => page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('o botão Carrinho abre a tela #carrinho, sem diálogo, com o cabeçalho igual e nenhuma categoria ativa', async ({ page }) => {
  await page.getByRole('button', { name: 'Carrinho · 0' }).click();
  await expect(page).toHaveURL(/#carrinho$/);
  await expect(carrinho(page)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Seu carrinho' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Escolha seu hambúrguer' })).toBeHidden();
  await expect(categorias(page).getByRole('link')).toHaveCount(4);
  await expect(categorias(page).locator('[aria-current]')).toHaveCount(0);
  await expect(page.getByRole('banner').getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
});

test('carrinho vazio: "Seu carrinho está vazio", sem subtítulo nem Resumo, com Explorar cardápio', async ({ page }) => {
  await page.goto('/#carrinho');
  await expect(carrinho(page).getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await expect(carrinho(page).getByText('Escolha seus favoritos para começar.')).toBeVisible();
  await expect(carrinho(page).getByRole('button', { name: 'Explorar cardápio' })).toBeVisible();
  await expect(carrinho(page).getByText(/no carrinho$|unidades em/)).toHaveCount(0);
  await expect(carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' })).toHaveCount(0);
  await expect(carrinho(page).getByRole('list', { name: 'Itens' })).toHaveCount(0);
});

test('cada Item mostra foto, nome e Total do item; o subtítulo conta itens ou unidades, como o contador do cabeçalho', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Coca-Cola');
  await page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' }).click();
  await adicionar(page).click();
  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await adicionar(page).click();

  await page.getByRole('button', { name: 'Carrinho · 3' }).click();
  await expect(carrinho(page).getByText('3 unidades em 2 itens', { exact: true })).toBeVisible();
  await expect(itens(page)).toHaveCount(2);
  await expect(itens(page).nth(0).getByRole('heading')).toHaveText('Whopper®');
  await expect(totalDoItem(itens(page).nth(0))).toHaveText('R$ 87,80');
  await expect(itens(page).nth(1).getByRole('heading')).toHaveText('Batata Frita');
  await expect(totalDoItem(itens(page).nth(1))).toHaveText('R$ 9,90');
  for (const i of [0, 1]) {
    const photo = itens(page).nth(i).locator('img');
    await expect.poll(() => photo.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  }
});

test('o Resumo do carrinho soma os Totais do item, avisa da entrega e tem Continuar e Adicionar mais itens', async ({ page }) => {
  await adicionar(page).click();
  await adicionar(page).click();
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await adicionar(page).click();
  await page.getByRole('button', { name: 'Carrinho · 3' }).click();
  // Item idêntico soma ao adicionar: Whopper® × 2 (R$ 63,80) and the combo (R$ 43,90).
  await expect(itens(page)).toHaveCount(2);
  await expect(totalDoItem(itens(page).nth(0))).toHaveText('R$ 63,80');
  await expect(totalDoItem(itens(page).nth(1))).toHaveText('R$ 43,90');
  const resumo = carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' });
  await expect(totalDosItens(page)).toHaveText('R$ 107,70');
  await expect(resumo.getByText('Entrega calculada na próxima etapa.')).toBeVisible();
  await expect(resumo.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await expect(resumo.getByRole('button', { name: 'Adicionar mais itens' })).toBeVisible();
});

/** In Sobremesas, Sundae de Chocolate with Quantidade 2 (R$ 25,80): the state the way back must keep. */
async function sundaeEmSobremesas(page) {
  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await escolher(page, 'Sundae de Chocolate');
  await page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' }).click();
}
async function voltouASobremesas(page) {
  await expect(page).toHaveURL(/#sobremesas$/);
  await expect(carrinho(page)).toBeHidden();
  await expect(categorias(page).getByRole('link', { name: 'Sobremesas' })).toHaveAttribute('aria-current', 'page');
  await expect(card(page, 'Sundae de Chocolate')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 25,80');
}

test('Voltar ao cardápio e Adicionar mais itens levam à última categoria vista, com o estado dela', async ({ page }) => {
  await adicionar(page).click();
  await sundaeEmSobremesas(page);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await carrinho(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await voltouASobremesas(page);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await carrinho(page).getByRole('button', { name: 'Adicionar mais itens' }).click();
  await voltouASobremesas(page);
});

test('Explorar cardápio e o Voltar do navegador levam à última categoria vista, com o estado dela', async ({ page }) => {
  await sundaeEmSobremesas(page);
  await page.getByRole('button', { name: 'Carrinho · 0' }).click();
  await carrinho(page).getByRole('button', { name: 'Explorar cardápio' }).click();
  await voltouASobremesas(page);
  await page.getByRole('button', { name: 'Carrinho · 0' }).click();
  await expect(carrinho(page)).toBeVisible();
  await page.goBack();
  await voltouASobremesas(page);
});

test('aberto pelo endereço #carrinho, Voltar ao cardápio leva a Hambúrgueres', async ({ page }) => {
  await page.goto('/#carrinho');
  await carrinho(page).getByRole('button', { name: 'Voltar ao cardápio' }).click();
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Whopper®');
});

test('depois de adicionar, o cliente continua no cardápio', async ({ page }) => {
  await adicionar(page).click();
  await expect(aviso(page)).toHaveText('Adicionado ao carrinho: Whopper®');
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  await expect(carrinho(page)).toBeHidden();
  await expect(adicionar(page)).toBeVisible();
  expect(new URL(page.url()).hash).not.toBe('#carrinho');
});

test('com uma unidade por Item, o subtítulo diz "N itens no carrinho"', async ({ page }) => {
  await adicionar(page).click();
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await adicionar(page).click();
  await page.getByRole('button', { name: 'Carrinho · 2' }).click();
  await expect(carrinho(page).getByText('2 itens no carrinho', { exact: true })).toBeVisible();
});
