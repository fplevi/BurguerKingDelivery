// The three layouts of the Figma (ticket 03 of revisao-figma): header, hero, grid.
import { test, expect } from '@playwright/test';
import { card, descricao } from './support.js';

const cabecalho = (page) => page.getByRole('banner');
const categorias = (page) => cabecalho(page).getByRole('navigation', { name: 'Categorias' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('cabeçalho do Figma: logo, as quatro categorias com Hambúrgueres ativo, o carrinho só com o contador e Identifique-se', async ({ page }) => {
  await expect(cabecalho(page).getByRole('link', { name: 'Burger King' }).getByRole('img')).toBeVisible();
  // "Entregar em" left the header for the top of each category (ticket 02 of minha-conta-pedidos).
  await expect(cabecalho(page).getByText('Entregar em')).toHaveCount(0);
  const links = categorias(page).getByRole('link');
  await expect(links).toHaveText(['Hambúrgueres', 'Acompanhamentos', 'Bebidas', 'Sobremesas']);
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
  for (const outra of ['Acompanhamentos', 'Bebidas', 'Sobremesas'])
    await expect(categorias(page).getByRole('link', { name: outra })).not.toHaveAttribute('aria-current');
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 0' })).toBeVisible();
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 0' })).toHaveText('0');
  await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
});

test('o preço do hambúrguer aparece só no Total do item, como no Figma', async ({ page }) => {
  await expect(page.getByRole('main').getByText('R$ 31,90', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 31,90');
});

/** Bounding box of a locator, in page px. */
const caixa = async (locator) => {
  await expect(locator).toBeVisible();
  return locator.boundingBox();
};
const hero = (page) => ({
  titulo: page.getByRole('heading', { level: 1 }),
  palco: page.locator('#hero-stage'),
  ver: page.getByRole('button', { name: /Ver ingredientes/ }),
  descricao: descricao(page),
  combo: page.getByRole('checkbox', { name: 'Transformar em combo' }),
  adicionar: page.getByRole('button', { name: 'Adicionar ao carrinho' }),
  grade: page.getByRole('heading', { name: 'Escolha seu hambúrguer' }),
});
const cards = (page) => page.locator('#catalog').getByRole('button');
const semRolagemHorizontal = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

/** The 3D canvas keeps the size the stylesheet gives its stage. */
async function canvasNoPalco(palco) {
  const [a, b] = [await caixa(palco), await caixa(palco.locator('canvas'))];
  for (const k of ['x', 'y', 'width', 'height']) expect(Math.abs(a[k] - b[k])).toBeLessThanOrEqual(1);
}

/** Ver ingredientes opens over the page, its 3D fills its stage, and closes. */
async function verIngredientesFunciona(page) {
  await hero(page).ver.click();
  const dialogo = page.getByRole('dialog', { name: 'Ver ingredientes', exact: true });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole('button', { name: 'Retirar Tomate', exact: true }).first()).toBeVisible();
  await canvasNoPalco(dialogo.locator('#pg-stage'));
  await dialogo.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(dialogo).toBeHidden();
}

test.describe('celular e tablet (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the 390 × 844 project');

  test('390: uma coluna na ordem do Figma, grade em 2 colunas e categorias em abas roláveis', async ({ page }) => {
    const h = hero(page);
    let anterior = null;
    for (const item of [h.titulo, h.palco, h.ver, h.descricao, h.combo, h.adicionar, h.grade]) {
      const box = await caixa(item);
      if (anterior) expect(box.y).toBeGreaterThanOrEqual(anterior.y + anterior.height - 1);
      anterior = box;
    }
    const [a, b, c] = [await caixa(cards(page).nth(0)), await caixa(cards(page).nth(1)), await caixa(cards(page).nth(2))];
    expect(b.y).toBe(a.y);
    expect(b.x).toBeGreaterThan(a.x + a.width - 1);
    expect(c.x).toBe(a.x);
    expect(c.y).toBeGreaterThan(a.y + a.height - 1);

    const nav = categorias(page);
    const logo = await caixa(cabecalho(page).getByRole('link', { name: 'Burger King' }));
    expect((await caixa(nav)).y).toBeGreaterThanOrEqual(logo.y + logo.height);
    expect(await nav.evaluate((n) => n.scrollWidth > n.clientWidth && getComputedStyle(n).overflowX)).toBe('auto');
    await expect(cabecalho(page).getByText('Carrinho', { exact: true })).toBeHidden();
    await semRolagemHorizontal(page);
    await canvasNoPalco(h.palco);
    await verIngredientesFunciona(page);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('1280: título e card à esquerda, 3D à direita com Ver ingredientes e descrição abaixo, grade em 4 colunas', async ({ page }) => {
    const h = hero(page);
    const [titulo, adicionar, palco, ver, desc] = await Promise.all([h.titulo, h.adicionar, h.palco, h.ver, h.descricao].map(caixa));
    expect(adicionar.y).toBeGreaterThan(titulo.y + titulo.height);
    expect(palco.x).toBeGreaterThanOrEqual(adicionar.x + adicionar.width);
    expect(palco.y).toBeLessThan(adicionar.y);
    expect(ver.y).toBeGreaterThanOrEqual(palco.y + palco.height);
    expect(desc.y).toBeGreaterThanOrEqual(ver.y + ver.height);
    for (const caixaAbaixo of [ver, desc]) expect(caixaAbaixo.x).toBeGreaterThan(adicionar.x + adicionar.width);

    const grade = await caixa(h.grade);
    expect(grade.y).toBeGreaterThan(Math.max(adicionar.y + adicionar.height, desc.y + desc.height));
    const linha = await Promise.all([0, 1, 2, 3, 4].map((i) => caixa(cards(page).nth(i))));
    for (const c of linha.slice(1, 4)) expect(c.y).toBe(linha[0].y);
    expect(linha[4].x).toBe(linha[0].x);
    expect(linha[4].y).toBeGreaterThan(linha[0].y + linha[0].height - 1);
    await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
    await semRolagemHorizontal(page);
    await canvasNoPalco(h.palco);
    await verIngredientesFunciona(page);
  });

  test.describe('≥ 1920px', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('1920: hero na altura da tela, página sem rolagem e coluna lateral em 2 colunas com rolagem própria', async ({ page }) => {
      const h = hero(page);
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1080);
      const [palco, adicionar, grade] = await Promise.all([h.palco, h.adicionar, h.grade].map(caixa));
      expect(grade.x).toBeGreaterThan(palco.x + palco.width);
      expect(grade.y).toBeLessThan(palco.y);
      expect(adicionar.x + adicionar.width).toBeLessThanOrEqual(palco.x);

      const coluna = page.locator('#catalog');
      const [a, b, c] = await Promise.all([0, 1, 2].map((i) => caixa(cards(page).nth(i))));
      expect(b.y).toBe(a.y);
      expect(c.x).toBe(a.x);
      expect(await coluna.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
      await page.mouse.move(grade.x + 100, grade.y + 300);
      await page.mouse.wheel(0, 600);
      await expect.poll(() => coluna.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await expect(card(page, 'Rodeio')).toBeInViewport();

      await canvasNoPalco(h.palco);
      await verIngredientesFunciona(page);
    });
  });

  for (const altura of [800, 720]) {
    test.describe(`≥ 1920px e janela de ${altura}px de altura`, () => {
      test.use({ viewport: { width: 1920, height: altura } });

      test(`1920 × ${altura}: a página não rola e o hero cabe na tela, no hambúrguer e numa categoria de foto`, async ({ page }) => {
        const h = hero(page);
        for (const hash of ['#hamburgueres', '#bebidas']) {
          await page.goto('/' + hash);
          expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(altura);
          const visiveis = hash === '#bebidas' ? [h.titulo, h.adicionar, page.getByRole('main').getByRole('img', { name: 'Coca-Cola Original' }), page.locator('#product-description')] : [h.titulo, h.adicionar, h.palco, h.ver, h.descricao];
          for (const item of visiveis) await expect(item).toBeInViewport({ ratio: 1 });
          if (hash === '#hamburgueres') await canvasNoPalco(h.palco);
        }
      });
    });
  }
});