// Card do Item editável no Carrinho (ticket 03 of carrinho).
import { test, expect } from '@playwright/test';
import { carrinho, itens, totalDoItem, totalDosItens, chip, verIngredientes, openVerIngredientes, escolher } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const abrirCarrinho = (page) => page.getByRole('button', { name: /^Carrinho · / }).click();

/** Retira as Camadas pelos chips de Ver ingredientes e aplica. */
async function retirar(page, ...nomes) {
  await openVerIngredientes(page);
  for (const nome of nomes) await chip(page, 'Retirar', nome).click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Whopper® com picles e cebola retirados: Ingredientes como no hero e "Sem picles e cebola" em vermelho', async ({ page }) => {
  // Retirados fora da ordem da Receita: a linha segue a Receita de baixo para cima.
  await retirar(page, 'Cebola', 'Picles');
  await adicionar(page).click();
  await abrirCarrinho(page);
  const item = itens(page).first();
  await expect(item.getByText('Ingredientes:')).toBeVisible();
  await expect(item.getByText('Pão com gergelim, carne grelhada, queijo derretido, ketchup, tomate fresco, alface crocante e maionese.', { exact: true })).toBeVisible();
  const sem = item.getByText('Sem picles e cebola', { exact: true });
  await expect(sem).toBeVisible();
  await expect(sem).toHaveCSS('color', 'rgb(217, 0, 0)');
});

test('Cheddar Duplo: sem nada retirado, "Todos os ingredientes"; um cheddar mantém "cheddar cremoso"; os dois o tiram', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await retirar(page, 'Cheddar inferior');
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await retirar(page, 'Cheddar superior', 'Cheddar inferior');
  await adicionar(page).click();
  await abrirCarrinho(page);

  const [todos, um, dois] = [0, 1, 2].map((i) => itens(page).nth(i));
  await expect(todos.getByText('Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.', { exact: true })).toBeVisible();
  const linha = todos.getByText('Todos os ingredientes', { exact: true });
  await expect(linha).toBeVisible();
  await expect(linha).not.toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(um.getByText('Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.', { exact: true })).toBeVisible();
  await expect(um.getByText('Sem cheddar inferior', { exact: true })).toBeVisible();
  await expect(dois.getByText('Pão com gergelim, duas carnes grelhadas e cebola crispy.', { exact: true })).toBeVisible();
  await expect(dois.getByText('Sem cheddar inferior e cheddar superior', { exact: true })).toBeVisible();
});

test('Quantidade de 1 a 99 com "−" desabilitado em 1; Total do item e Total dos itens acompanham', async ({ page }) => {
  await adicionar(page).click();
  await page.getByRole('banner').getByRole('link', { name: 'Bebidas' }).click();
  await adicionar(page).click();
  await abrirCarrinho(page);
  const whopper = itens(page).nth(0);
  const quantidade = whopper.getByRole('group', { name: 'Quantidade' });
  const menos = quantidade.getByRole('button', { name: 'Diminuir quantidade' });
  const mais = quantidade.getByRole('button', { name: 'Aumentar quantidade' });
  await expect(menos).toBeDisabled();
  await mais.click();
  await mais.click();
  await expect(quantidade).toContainText('3');
  await expect(totalDoItem(whopper)).toHaveText('R$ 95,70');
  // Coca-Cola: R$ 9,90.
  await expect(totalDosItens(page)).toHaveText('R$ 105,60');
  await expect(page.getByRole('button', { name: 'Carrinho · 4' })).toBeVisible();
  await expect(carrinho(page).getByText('4 unidades em 2 itens', { exact: true })).toBeVisible();
  await menos.click();
  await menos.click();
  await expect(menos).toBeDisabled();
  await expect(totalDoItem(whopper)).toHaveText('R$ 31,90');
  // At 1 the focus stays in the group, on "+".
  await expect(mais).toBeFocused();
  for (let i = 0; i < 98; i++) await page.keyboard.press('Enter');
  await expect(quantidade).toContainText('99');
  await expect(mais).toBeDisabled();
});

const bebida = (item) => item.getByRole('combobox', { name: 'Bebida do combo' });
const combo = (item) => item.getByRole('checkbox', { name: 'Transformar em combo' });

test('Combo no carrinho: marcar soma R$ 12,00 já sem bebida; sem Combo a Bebida fica desabilitada no mesmo lugar; desmarcar apaga a bebida', async ({ page }) => {
  await adicionar(page).click();
  await abrirCarrinho(page);
  const item = itens(page).first();
  await expect(combo(item)).not.toBeChecked();
  await expect(bebida(item)).toBeDisabled();
  await expect(bebida(item)).toHaveText('Selecione uma bebida');
  const lugar = await bebida(item).boundingBox();

  await combo(item).check();
  await expect(bebida(item)).toBeEnabled();
  await expect(totalDoItem(item)).toHaveText('R$ 43,90');
  await expect(totalDosItens(page)).toHaveText('R$ 43,90');
  expect(await bebida(item).boundingBox()).toEqual(lugar);

  await bebida(item).click();
  await item.getByRole('option', { name: 'Sprite' }).click();
  await expect(bebida(item)).toHaveText('Sprite');
  await expect(item.getByRole('listbox')).toBeHidden();

  await combo(item).uncheck();
  await expect(bebida(item)).toBeDisabled();
  await expect(bebida(item)).toHaveText('Selecione uma bebida');
  await expect(totalDoItem(item)).toHaveText('R$ 31,90');
  await combo(item).check();
  await expect(bebida(item)).toHaveText('Selecione uma bebida');
});

test('a lista de bebidas abre por cima, sem empurrar o resto, com as 7 bebidas, e responde ao teclado', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Coca-Cola');
  await adicionar(page).click();
  await escolher(page, 'Cheddar Duplo');
  await adicionar(page).click();
  await abrirCarrinho(page);
  const [primeiro, segundo] = [itens(page).nth(0), itens(page).nth(1)];
  const antes = await segundo.boundingBox();
  const totalAntes = await totalDoItem(primeiro).boundingBox();

  await bebida(primeiro).focus();
  await page.keyboard.press('ArrowDown');
  const lista = primeiro.getByRole('listbox', { name: 'Bebida do combo' });
  await expect(lista).toBeVisible();
  await expect(bebida(primeiro)).toHaveAttribute('aria-expanded', 'true');
  await expect(lista.getByRole('option')).toHaveText(['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Fanta Laranja', 'Natural One Laranja', 'Natural One Uva', 'Água de Copo']);
  await expect(lista.getByRole('option', { name: 'Coca-Cola', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(await segundo.boundingBox()).toEqual(antes);
  expect(await totalDoItem(primeiro).boundingBox()).toEqual(totalAntes);
  // The list sits over the next card.
  const caixa = await lista.boundingBox();
  expect(caixa.y + caixa.height).toBeGreaterThan(antes.y);

  // The active option follows the arrows; Enter chooses it and closes, focus stays on the combobox.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const ativa = await bebida(primeiro).getAttribute('aria-activedescendant');
  await expect(page.locator(`#${ativa}`)).toHaveText('Sprite');
  await page.keyboard.press('Enter');
  await expect(lista).toBeHidden();
  await expect(bebida(primeiro)).toHaveText('Sprite');
  await expect(bebida(primeiro)).toBeFocused();

  // Escape closes without changing; End and Home jump; Space opens.
  await page.keyboard.press('Space');
  await expect(lista).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator(`#${await bebida(primeiro).getAttribute('aria-activedescendant')}`)).toHaveText('Água de Copo');
  await page.keyboard.press('Escape');
  await expect(lista).toBeHidden();
  await expect(bebida(primeiro)).toHaveText('Sprite');
  await expect(bebida(primeiro)).toBeFocused();

  // Pressing outside closes it too.
  await bebida(primeiro).click();
  await expect(lista).toBeVisible();
  await carrinho(page).getByRole('heading', { name: 'Seu carrinho' }).click();
  await expect(lista).toBeHidden();
});

test('Itens editados até ficarem iguais continuam separados', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await adicionar(page).click();
  await adicionar(page).click();
  await abrirCarrinho(page);
  await expect(itens(page)).toHaveCount(2);
  const segundo = itens(page).nth(1);
  await combo(segundo).check();
  await bebida(segundo).click();
  await segundo.getByRole('option', { name: 'Sprite' }).click();
  await expect(itens(page)).toHaveCount(2);
  await expect(totalDoItem(itens(page).nth(0))).toHaveText('R$ 43,90');
  await expect(totalDoItem(segundo)).toHaveText('R$ 43,90');
  await expect(totalDosItens(page)).toHaveText('R$ 87,80');
  await expect(carrinho(page).getByText('2 itens no carrinho', { exact: true })).toBeVisible();
});

test('todo Item tem "Remover": na linha do nome a partir de 1024px, abaixo dele no mobile', async ({ page }, testInfo) => {
  await adicionar(page).click();
  await page.getByRole('banner').getByRole('link', { name: 'Sobremesas' }).click();
  await adicionar(page).click();
  await abrirCarrinho(page);
  for (const i of [0, 1]) {
    const item = itens(page).nth(i);
    const nome = await item.getByRole('heading').boundingBox();
    const remover = await item.getByRole('button', { name: 'Remover' }).boundingBox();
    const centro = (b) => b.y + b.height / 2;
    if (testInfo.project.name === 'desktop') {
      expect(Math.abs(centro(remover) - centro(nome))).toBeLessThan(4);
      expect(remover.x).toBeGreaterThan(nome.x + nome.width);
    } else expect(remover.y).toBeGreaterThanOrEqual(nome.y + nome.height);
  }
});

test('produto só foto: foto, nome e Total do item, sem Ingredientes, Combo nem Bebida', async ({ page }) => {
  await page.getByRole('banner').getByRole('link', { name: 'Acompanhamentos' }).click();
  await escolher(page, 'Batata Frita');
  await adicionar(page).click();
  await abrirCarrinho(page);
  const item = itens(page).first();
  await expect(item.getByRole('heading')).toHaveText('Batata Frita');
  await expect(item.getByRole('group', { name: 'Quantidade' })).toBeVisible();
  await expect(totalDoItem(item)).toHaveText('R$ 9,90');
  await expect(item.getByText('Ingredientes:')).toHaveCount(0);
  await expect(item.getByRole('checkbox')).toHaveCount(0);
  await expect(item.getByRole('combobox')).toHaveCount(0);
});
