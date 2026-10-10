// Acompanhamentos, Bebidas and Sobremesas (ticket 04 of revisao-figma): photo-only pages, same hero and grid.
import { test, expect } from '@playwright/test';
import { card, escolher, openVerIngredientes, verIngredientes, chip, descricao } from './support.js';

const categorias = (page) => page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
const titulo = (page) => page.getByRole('heading', { level: 1 });
const total = (page) => page.getByText('Total do item').locator('strong');
const aumentar = (page) => page.getByRole('group', { name: 'Quantidade' }).getByRole('button', { name: 'Aumentar quantidade' });
const grade = (page) => page.locator('#catalog').getByRole('button');
/** The grid's cards, in order, by name (the selected one also holds the badge). */
const nomes = (lista) => lista.map((n) => new RegExp(`^(Selecionado\s*)?${n}$`));

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Bebidas: Coca-Cola selecionada, foto, descrição, card sem combo e grade "Escolha sua bebida" na ordem do Figma', async ({ page }) => {
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await expect(page).toHaveURL(/#bebidas$/);
  await expect(categorias(page).getByRole('link', { name: 'Bebidas' })).toHaveAttribute('aria-current', 'page');
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).not.toHaveAttribute('aria-current');
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await expect(page.getByRole('main').getByRole('img', { name: 'Coca-Cola Original' })).toBeVisible();
  await expect(page.getByText('O sabor clássico, gelado e na lata. Perfeito para acompanhar seu pedido.')).toBeVisible();
  await expect(total(page)).toHaveText('R$ 9,90');
  await expect(page.getByRole('button', { name: /Ver ingredientes/ })).toBeHidden();
  await expect(page.getByRole('checkbox', { name: 'Transformar em combo' })).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'Bebida do combo' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Escolha sua bebida' })).toBeVisible();
  await expect(grade(page)).toHaveText(nomes(['Coca-Cola', 'Coca-Cola Zero', 'Natural One Laranja', 'Natural One Uva', 'Sprite', 'Fanta Laranja', 'Água de Copo']));
  await expect(card(page, 'Coca-Cola')).toHaveAttribute('aria-pressed', 'true');
});

test('ir e voltar entre as categorias mantém a seleção de cada uma e o hambúrguer com a Personalização, o combo e a quantidade', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await aumentar(page).click();

  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await expect(titulo(page)).toHaveAccessibleName('BK® Mix de Brownie');
  await expect(total(page)).toHaveText('R$ 23,90');
  await escolher(page, 'Sundae de Chocolate');
  await expect(titulo(page)).toHaveAccessibleName('Sundae de Chocolate');
  await aumentar(page).click();
  await expect(total(page)).toHaveText('R$ 25,80');

  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await expect(page.getByRole('heading', { name: 'Escolha seu acompanhamento' })).toBeVisible();
  await expect(total(page)).toHaveText('R$ 9,90');
  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await expect(card(page, 'Sundae de Chocolate')).toHaveAttribute('aria-pressed', 'true');
  await expect(total(page)).toHaveText('R$ 25,80');

  await categorias(page).getByRole('link', { name: 'Hambúrgueres' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Cheddar Duplo');
  await expect(page.getByRole('heading', { name: 'Escolha seu hambúrguer' })).toBeVisible();
  await expect(card(page, 'Cheddar Duplo')).toHaveAttribute('aria-pressed', 'true');
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');
  await expect(page.getByRole('combobox', { name: 'Bebida do combo' }).locator('option:checked')).toHaveText('Sprite');
  await expect(total(page)).toHaveText('R$ 93,80');
  await expect(page.locator('#hero-stage canvas')).toBeVisible();
  await openVerIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Cebola crispy')).toBeVisible();
});

test('o endereço com #acompanhamentos abre a categoria, e voltar no navegador retorna à anterior', async ({ page }) => {
  await page.goto('/#acompanhamentos');
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await expect(categorias(page).getByRole('link', { name: 'Acompanhamentos' })).toHaveAttribute('aria-current', 'page');
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await page.goBack();
  await expect(titulo(page)).toHaveAccessibleName('Batata Frita');
  await page.goto('/#qualquer-coisa');
  await expect(titulo(page)).toHaveAccessibleName('Whopper Clássico');
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
});

test('acompanhamento, bebida e sobremesa chegam ao carrinho com nome × quantidade e total; Item idêntico soma', async ({ page }) => {
  const adicionar = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await escolher(page, 'Onion Rings');
  await aumentar(page).click();
  await adicionar.click();
  await expect(page.getByRole('status')).toHaveText('Onion Rings adicionado ao carrinho');
  // Back to Quantidade 1, the same product still selected.
  await expect(card(page, 'Onion Rings')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Quantidade' })).toHaveText(/^\D*1\D*$/);
  await adicionar.click();

  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await adicionar.click();
  await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
  await escolher(page, 'BK® Mix Crocante');
  await adicionar.click();

  await page.getByRole('button', { name: 'Carrinho · 5' }).click();
  const carrinho = page.getByRole('dialog', { name: 'Seu carrinho' });
  await expect(carrinho.locator('.cart-row')).toHaveCount(3);
  await expect(carrinho.getByText('Onion Rings × 3')).toBeVisible();
  await expect(carrinho.getByText('R$ 47,70', { exact: true })).toBeVisible();
  await expect(carrinho.getByText('Coca-Cola × 1')).toBeVisible();
  await expect(carrinho.getByText('R$ 9,90', { exact: true })).toBeVisible();
  await expect(carrinho.getByText('BK® Mix Crocante × 1')).toBeVisible();
  await expect(carrinho.getByText('R$ 23,90', { exact: true })).toBeVisible();
  await expect(carrinho.getByText('Combo')).toHaveCount(0);
  await expect(carrinho.getByText(/^Sem:/)).toHaveCount(0);
  await expect(carrinho.getByText('Total: R$ 81,50')).toBeVisible();
});

test('todos os produtos das três categorias têm foto, nome, descrição e preço', async ({ page }) => {
  const todas = {
    Acompanhamentos: ['Esferas do Dragão de Pepperoni', 'Batata Frita', 'Balde de Batata', 'Onion Rings', 'BK Chicken', 'Molhão Baconese', 'Cebola Crispy', 'Molhão Maionese Cítrica'],
    Bebidas: ['Coca-Cola', 'Coca-Cola Zero', 'Natural One Laranja', 'Natural One Uva', 'Sprite', 'Fanta Laranja', 'Água de Copo'],
    Sobremesas: ['BK® Mix Nutella® com Brownie', 'BK® Mix Leite em Pó com Nutella®', 'BK® Mix Cookies com Nutella®', 'BK® Mix Biscoff®', 'BK® Mix de Brownie', 'BK® Mix Crocante', 'Sundae de Chocolate', 'Sundae de Doce de Leite'],
  };
  for (const [categoria, lista] of Object.entries(todas)) {
    await categorias(page).getByRole('link', { name: categoria }).click();
    await expect(grade(page)).toHaveText(nomes(lista));
    for (const nome of lista) {
      await escolher(page, nome);
      for (const img of [page.locator('#product-photo'), card(page, nome).locator('img')]) {
        await expect(img).toBeVisible();
        await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
      }
      await expect(page.locator('#product-description')).toHaveText(/\S.+\.$/);
      await expect(total(page)).toHaveText(/^R\$\s\d+,\d\d$/);
    }
  }
  await expect(page.getByText(/Consultar preço/)).toHaveCount(0);
});
