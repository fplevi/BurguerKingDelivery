import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, recolocarTodos, camada, chip, descricao, dragTo, escolher, TITULO } from './support.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('abre Ver ingredientes em tela cheia a partir do hero', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page)).toBeVisible();
  await expect(verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await expect(chip(page, 'Retirar', 'Queijo')).toHaveAttribute('aria-pressed', 'true');
});

test('retira um ingrediente tocando na camada', async ({ page }) => {
  await openVerIngredientes(page);
  await camada(page, 'Queijo').click();
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await expect(verIngredientes(page).getByText('Whopper® · Sem queijo')).toBeVisible();
});

test('retira um ingrediente pelo teclado com Enter e Espaço', async ({ page }) => {
  await openVerIngredientes(page);
  await camada(page, 'Tomate').focus();
  await page.keyboard.press('Enter');
  await expect(chip(page, 'Recolocar', 'Tomate')).toBeVisible();

  await camada(page, 'Cebola').focus();
  await page.keyboard.press(' ');
  await expect(chip(page, 'Recolocar', 'Cebola')).toBeVisible();
  await expect(verIngredientes(page).getByText('Whopper® · Sem cebola e tomate')).toBeVisible();
});

test('retira um ingrediente arrastando a camada até a bandeja', async ({ page }) => {
  await openVerIngredientes(page);
  await dragTo(page, camada(page, 'Alface'), bandeja(page));
  await expect(chip(page, 'Recolocar', 'Alface')).toBeVisible();
});

test('arrastar e soltar fora da bandeja não retira o ingrediente', async ({ page }) => {
  await openVerIngredientes(page);
  await dragTo(page, camada(page, 'Alface'), page.getByRole('heading', { name: TITULO }));
  await expect(chip(page, 'Retirar', 'Alface')).toBeVisible();
});

test('retira e recoloca pelos chips', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await expect(chip(page, 'Recolocar', 'Picles')).toHaveAttribute('aria-pressed', 'false');
  await expect(camada(page, 'Picles')).toBeHidden();

  await chip(page, 'Recolocar', 'Picles').click();
  await expect(chip(page, 'Retirar', 'Picles')).toHaveAttribute('aria-pressed', 'true');
  await expect(camada(page, 'Picles')).toBeVisible();
});

test('Recolocar todos desfaz as retiradas do rascunho', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await chip(page, 'Retirar', 'Maionese').click();
  await recolocarTodos(page).click();
  await expect(chip(page, 'Retirar', 'Picles')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Maionese')).toBeVisible();
  await expect(verIngredientes(page).getByText('Whopper® · Todos os ingredientes')).toBeVisible();
});

test('a Base (pães e carne) não pode ser retirada', async ({ page }) => {
  await openVerIngredientes(page);
  for (const base of ['Pão inferior', 'Carne grelhada', 'Pão superior']) {
    await expect(camada(page, base)).toBeDisabled();
    await expect(ingredientes(page).getByRole('button', { name: new RegExp(base) })).toHaveCount(0);
  }
  await camada(page, 'Carne grelhada').click({ force: true });
  await expect(verIngredientes(page).getByText('Whopper® · Todos os ingredientes')).toBeVisible();
});

const WHOPPER = 'Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup, cebola, tomate fresco, alface crocante e maionese.';

test('a descrição do Whopper lista as camadas, sem linha de personalização', async ({ page }) => {
  await expect(descricao(page)).toHaveText(WHOPPER);
  await expect(page.getByText(/Preparado com todos|Seu favorito/)).toHaveCount(0);
});

test('aplicar fecha Ver ingredientes e tira da descrição o que foi retirado', async ({ page }) => {
  await expect(descricao(page)).toHaveText(WHOPPER);
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Queijo').click();
  await chip(page, 'Retirar', 'Cebola').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(descricao(page)).toHaveText('Pão com gergelim, carne grelhada, picles, ketchup, tomate fresco, alface crocante e maionese.');
  await expect(page.getByRole('button', { name: /Ver ingredientes/ })).toBeFocused();
});

test('com tudo retirado, a descrição fica só com a Base', async ({ page }) => {
  await openVerIngredientes(page);
  for (const nome of ['Queijo', 'Picles', 'Ketchup', 'Cebola', 'Tomate', 'Alface', 'Maionese']) await chip(page, 'Retirar', nome).click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim e carne grelhada.');
});

test('cancelar preserva a personalização anterior', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Queijo').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, carne grelhada, picles, ketchup, cebola, tomate fresco, alface crocante e maionese.');

  await openVerIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await chip(page, 'Recolocar', 'Queijo').click();
  await chip(page, 'Retirar', 'Picles').click();
  await verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(descricao(page)).toHaveText('Pão com gergelim, carne grelhada, picles, ketchup, cebola, tomate fresco, alface crocante e maionese.');

  await openVerIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Picles')).toBeVisible();
});

test('Esc cancela; não há botão de fechar', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page).getByRole('button', { name: /fechar|✕/i })).toHaveCount(0);
  await chip(page, 'Retirar', 'Alface').click();
  await page.keyboard.press('Escape');
  await expect(verIngredientes(page)).toBeHidden();
  await expect(descricao(page)).toHaveText(WHOPPER);
});

test('no desktop, Cancelar e Aplicar alterações ficam no cabeçalho, à direita do título', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'abaixo de 1024px as ações vão para uma barra fixa embaixo (ticket 03)');
  await openVerIngredientes(page);
  const titulo = await verIngredientes(page).getByRole('heading', { name: TITULO }).boundingBox();
  const palco = await camada(page, 'Pão superior').boundingBox();
  for (const nome of ['Cancelar', 'Aplicar alterações']) {
    const acao = await verIngredientes(page).getByRole('button', { name: nome, exact: true }).boundingBox();
    expect(acao.x).toBeGreaterThan(titulo.x + titulo.width);
    expect(Math.abs(acao.y + acao.height / 2 - (titulo.y + titulo.height / 2))).toBeLessThan(8);
    expect(acao.y + acao.height).toBeLessThan(palco.y);
  }
});

test('a legenda abaixo do hambúrguer leva o nome do produto', async ({ page }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page).getByText('O seu Whopper® do seu jeito.', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await expect(verIngredientes(page).getByText('O seu Cheddar Duplo do seu jeito.', { exact: true })).toBeVisible();
});

test('as 10 camadas abertas seguem a receita brasileira, de baixo para cima', async ({ page }) => {
  const receita = ['Pão inferior', 'Carne grelhada', 'Queijo', 'Picles', 'Ketchup', 'Cebola', 'Tomate', 'Alface', 'Maionese', 'Pão superior'];
  await openVerIngredientes(page);
  // Wait for the opening animation to settle, then read each layer's vertical centre.
  await expect.poll(async () => {
    const centres = [];
    for (const nome of receita) {
      const box = await camada(page, nome).boundingBox();
      centres.push(box.y + box.height / 2);
    }
    return centres.every((y, i) => i === 0 || y < centres[i - 1]);
  }).toBe(true);

  const removiveis = receita.filter((n) => !['Pão inferior', 'Carne grelhada', 'Pão superior'].includes(n));
  await expect(ingredientes(page).getByRole('button'))
    .toHaveText(removiveis.map((n) => new RegExp(`${n}$`)));
});

test('retira só o ketchup e mantém a maionese', async ({ page }) => {
  await openVerIngredientes(page);
  await camada(page, 'Ketchup').click();
  await expect(chip(page, 'Recolocar', 'Ketchup')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Maionese')).toHaveAttribute('aria-pressed', 'true');
  await expect(camada(page, 'Maionese')).toBeVisible();
  await expect(verIngredientes(page).getByText('Whopper® · Sem ketchup ·')).toBeVisible();

  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, carne grelhada, queijo derretido, picles, cebola, tomate fresco, alface crocante e maionese.');

  await openVerIngredientes(page);
  await chip(page, 'Recolocar', 'Ketchup').click();
  await chip(page, 'Retirar', 'Maionese').click();
  await expect(chip(page, 'Retirar', 'Ketchup')).toHaveAttribute('aria-pressed', 'true');
  await expect(verIngredientes(page).getByText('Whopper® · Sem maionese ·')).toBeVisible();
});
