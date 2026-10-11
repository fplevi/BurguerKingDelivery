// Layouts do Carrinho no desktop e no mobile (ticket 06 of carrinho; Figma 189-16293 and 187-8185).
import { test, expect } from '@playwright/test';
import { carrinho, itens, totalDoItem, aviso, escolher } from './support.js';

const adicionar = (page) => page.getByRole('button', { name: 'Adicionar ao carrinho' });
const categoria = (page, nome) => page.getByRole('banner').getByRole('link', { name: nome }).click();
const resumo = (page) => carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' });
const barra = (page) => carrinho(page).getByRole('region', { name: 'Total dos itens e Continuar' });
const bebida = (item) => item.getByRole('combobox', { name: 'Bebida do combo' });
const quantidade = (item) => item.getByRole('group', { name: 'Quantidade' });
const semRolagemHorizontal = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
const caixa = async (locator) => {
  await expect(locator).toBeVisible();
  return locator.boundingBox();
};

/** The Carrinho of the Figma: Whopper® (combo), Cheddar Duplo, Batata Frita and BK® Mix de Brownie. */
async function carrinhoDoFigma(page) {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Coca-Cola Zero');
  await adicionar(page).click();
  await page.locator('#catalog').getByRole('button', { name: 'Cheddar Duplo' }).click();
  await adicionar(page).click();
  await categoria(page, 'Acompanhamentos');
  await escolher(page, 'Batata Frita');
  await adicionar(page).click();
  await categoria(page, 'Sobremesas');
  await escolher(page, 'BK® Mix de Brownie');
  await adicionar(page).click();
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await expect(itens(page)).toHaveCount(4);
}

test.describe('celular (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the 390 × 844 project');

  test('390: barra fixa no rodapé com Total dos itens e Continuar, que fica na tela ao rolar', async ({ page }) => {
    await carrinhoDoFigma(page);
    const b = barra(page);
    await expect(b.getByText('R$ 112,60', { exact: true })).toBeVisible();
    await expect(b).toContainText('Total dos itens');
    await expect(b.getByRole('button', { name: 'Continuar' })).toBeVisible();
    const embaixo = async () => {
      const box = await caixa(b);
      expect(box.x).toBe(0);
      expect(box.width).toBe(390);
      expect(Math.abs(box.y + box.height - 844)).toBeLessThanOrEqual(1);
    };
    await embaixo();
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await embaixo();
  });

  test('390: o Continuar da barra valida como o do Resumo, e o combo sem bebida fica acima da barra', async ({ page }) => {
    await carrinhoDoFigma(page);
    const cheddar = itens(page).nth(1);
    await cheddar.getByRole('checkbox', { name: 'Transformar em combo' }).check();
    await page.mouse.wheel(0, 2000);
    await barra(page).getByRole('button', { name: 'Continuar' }).click();
    await expect(bebida(cheddar)).toBeFocused();
    await expect(cheddar.getByText('Escolha a bebida do combo', { exact: true })).toBeVisible();
    const [b, seletor] = [await caixa(barra(page)), await caixa(bebida(cheddar))];
    expect(seletor.y).toBeGreaterThanOrEqual(0);
    expect(seletor.y + seletor.height).toBeLessThanOrEqual(b.y);

    await cheddar.getByRole('checkbox', { name: 'Transformar em combo' }).uncheck();
    await barra(page).getByRole('button', { name: 'Continuar' }).click();
    await expect(aviso(page)).toHaveText('Tudo certo! O pagamento não faz parte deste protótipo.');
  });

  test('390: no fim da página, o Resumo do carrinho termina acima da barra', async ({ page }) => {
    await carrinhoDoFigma(page);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const ultimo = resumo(page).getByRole('button', { name: 'Adicionar mais itens' });
    const [b, botao, lista] = [await caixa(barra(page)), await caixa(ultimo), await caixa(itens(page).last())];
    expect(botao.y + botao.height).toBeLessThanOrEqual(b.y);
    // The Resumo comes after the list, in the same column.
    const r = await caixa(resumo(page));
    expect(r.y).toBeGreaterThanOrEqual(lista.y + lista.height);
    expect(r.x).toBe(lista.x);
    await semRolagemHorizontal(page);
  });

  test('390: uma coluna; ingredientes em parágrafo com quebra; Bebida do combo na largura do card; Quantidade e Total do item lado a lado', async ({ page }) => {
    await carrinhoDoFigma(page);
    const whopper = itens(page).first();
    const ingredientes = whopper.getByText(/^Pão com gergelim/);
    // At least two lines of text: taller than twice the font size.
    const fonte = await ingredientes.evaluate((p) => parseFloat(getComputedStyle(p).fontSize));
    expect((await caixa(ingredientes)).height).toBeGreaterThan(fonte * 2);
    const [card, seletor, qtd, total] = [await caixa(whopper), await caixa(bebida(whopper)), await caixa(quantidade(whopper)), await caixa(totalDoItem(whopper))];
    expect(seletor.width).toBeGreaterThan(card.width - 60);
    expect(qtd.y).toBeGreaterThanOrEqual(seletor.y + seletor.height);
    expect(total.x).toBeGreaterThanOrEqual(qtd.x + qtd.width);
    expect(total.y).toBeLessThan(qtd.y + qtd.height);
    for (const i of [1, 2, 3]) expect((await caixa(itens(page).nth(i))).x).toBe(card.x);
    await semRolagemHorizontal(page);
  });
});

test.describe('desktop (≥ 1024px)', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('1280: sem barra fixa; o Continuar fica no Resumo do carrinho', async ({ page }) => {
    await carrinhoDoFigma(page);
    await expect(resumo(page).getByRole('button', { name: 'Continuar' })).toBeVisible();
    await expect(barra(page)).toBeHidden();
    await expect(carrinho(page).getByRole('button', { name: 'Continuar' })).toHaveCount(1);
  });

  test('1280: Itens à esquerda e Resumo do carrinho à direita; Bebida do combo, Quantidade e Total do item lado a lado', async ({ page }) => {
    await carrinhoDoFigma(page);
    const [lista, r] = [await caixa(carrinho(page).getByRole('list', { name: 'Itens' })), await caixa(resumo(page))];
    expect(r.x).toBeGreaterThanOrEqual(lista.x + lista.width);
    expect(Math.abs(r.y - lista.y)).toBeLessThanOrEqual(1);
    const whopper = itens(page).first();
    const [seletor, qtd, total] = [await caixa(bebida(whopper)), await caixa(quantidade(whopper)), await caixa(totalDoItem(whopper))];
    expect(qtd.x).toBeGreaterThanOrEqual(seletor.x + seletor.width);
    expect(total.x).toBeGreaterThanOrEqual(qtd.x + qtd.width);
    for (const b of [qtd, total]) expect(b.y).toBeLessThan(seletor.y + seletor.height);
    await semRolagemHorizontal(page);
  });
});
