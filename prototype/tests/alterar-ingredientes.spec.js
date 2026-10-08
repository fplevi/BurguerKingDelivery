import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, alterarIngredientes, bandeja, camada, chip, heroNote, dragTo, TITULO } from './support.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('abre Alterar ingredientes em tela cheia a partir do hero', async ({ page }) => {
  await openAlterarIngredientes(page);
  await expect(alterarIngredientes(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar e fechar' })).toBeFocused();
  await expect(chip(page, 'Retirar', 'Queijo')).toHaveAttribute('aria-pressed', 'true');
});

test('retira um ingrediente tocando na camada', async ({ page }) => {
  await openAlterarIngredientes(page);
  await camada(page, 'Queijo').click();
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Sem queijo')).toBeVisible();
});

test('retira um ingrediente pelo teclado com Enter e Espaço', async ({ page }) => {
  await openAlterarIngredientes(page);
  await camada(page, 'Tomate').focus();
  await page.keyboard.press('Enter');
  await expect(chip(page, 'Recolocar', 'Tomate')).toBeVisible();

  await camada(page, 'Cebola').focus();
  await page.keyboard.press(' ');
  await expect(chip(page, 'Recolocar', 'Cebola')).toBeVisible();
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Sem tomate, cebola')).toBeVisible();
});

test('retira um ingrediente arrastando a camada até a bandeja', async ({ page }) => {
  await openAlterarIngredientes(page);
  await dragTo(page, camada(page, 'Alface'), bandeja(page));
  await expect(chip(page, 'Recolocar', 'Alface')).toBeVisible();
});

test('arrastar e soltar fora da bandeja não retira o ingrediente', async ({ page }) => {
  await openAlterarIngredientes(page);
  await dragTo(page, camada(page, 'Alface'), page.getByRole('heading', { name: TITULO }));
  await expect(chip(page, 'Retirar', 'Alface')).toBeVisible();
});

test('retira e recoloca pelos chips', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await expect(chip(page, 'Recolocar', 'Picles')).toHaveAttribute('aria-pressed', 'false');
  await expect(camada(page, 'Picles')).toBeHidden();

  await chip(page, 'Recolocar', 'Picles').click();
  await expect(chip(page, 'Retirar', 'Picles')).toHaveAttribute('aria-pressed', 'true');
  await expect(camada(page, 'Picles')).toBeVisible();
});

test('Recolocar todos desfaz as retiradas do rascunho', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await chip(page, 'Retirar', 'Maionese').click();
  await bandeja(page).getByRole('button', { name: 'Recolocar todos' }).click();
  await expect(chip(page, 'Retirar', 'Picles')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Maionese')).toBeVisible();
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Todos os ingredientes')).toBeVisible();
});

test('a Base (pães e carne) não pode ser retirada', async ({ page }) => {
  await openAlterarIngredientes(page);
  for (const base of ['Pão inferior', 'Carne grelhada', 'Pão superior']) {
    await expect(camada(page, base)).toBeDisabled();
    await expect(bandeja(page).getByRole('button', { name: new RegExp(base) })).toHaveCount(0);
  }
  await camada(page, 'Carne grelhada').click({ force: true });
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Todos os ingredientes')).toBeVisible();
});

test('aplicar fecha Alterar ingredientes e atualiza o texto do hero', async ({ page }) => {
  await expect(heroNote(page)).toHaveText('Preparado com todos os ingredientes');
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Queijo').click();
  await chip(page, 'Retirar', 'Cebola').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(alterarIngredientes(page)).toBeHidden();
  await expect(heroNote(page)).toHaveText('Sem queijo, cebola');
  await expect(page.getByRole('button', { name: /Remover ingredientes/ })).toBeFocused();
});

test('cancelar preserva a personalização anterior', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Queijo').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(heroNote(page)).toHaveText('Sem queijo');

  await openAlterarIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await chip(page, 'Recolocar', 'Queijo').click();
  await chip(page, 'Retirar', 'Picles').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(alterarIngredientes(page)).toBeHidden();
  await expect(heroNote(page)).toHaveText('Sem queijo');

  await openAlterarIngredientes(page);
  await expect(chip(page, 'Recolocar', 'Queijo')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Picles')).toBeVisible();
});

test('Esc e o botão de fechar também cancelam', async ({ page }) => {
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Alface').click();
  await page.keyboard.press('Escape');
  await expect(alterarIngredientes(page)).toBeHidden();
  await expect(heroNote(page)).toHaveText('Preparado com todos os ingredientes');

  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Alface').click();
  await page.getByRole('button', { name: 'Cancelar e fechar' }).click();
  await expect(heroNote(page)).toHaveText('Preparado com todos os ingredientes');
});

test('retira só o ketchup e mantém a maionese', async ({ page }) => {
  await openAlterarIngredientes(page);
  await camada(page, 'Ketchup').click();
  await expect(chip(page, 'Recolocar', 'Ketchup')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Maionese')).toHaveAttribute('aria-pressed', 'true');
  await expect(camada(page, 'Maionese')).toBeVisible();
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Sem ketchup ·')).toBeVisible();

  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(heroNote(page)).toHaveText('Sem ketchup');

  await openAlterarIngredientes(page);
  await chip(page, 'Recolocar', 'Ketchup').click();
  await chip(page, 'Retirar', 'Maionese').click();
  await expect(chip(page, 'Retirar', 'Ketchup')).toHaveAttribute('aria-pressed', 'true');
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Sem maionese ·')).toBeVisible();
});
