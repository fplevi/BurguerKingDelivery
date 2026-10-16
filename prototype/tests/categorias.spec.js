// Acompanhamentos, Bebidas and Sobremesas (ticket 04 of revisao-figma): photo-only pages, same hero and grid.
import { test, expect } from '@playwright/test';
import { card, escolher, openVerIngredientes, verIngredientes, chip, descricao, aviso, carrinho, itens, totalDoItem, totalDosItens } from './support.js';

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
  await expect(titulo(page)).toHaveAccessibleName('BK® Mix Nutella® com Brownie');
  await expect(total(page)).toHaveText('R$ 27,90');
  await escolher(page, 'Sundae de Chocolate');
  await expect(titulo(page)).toHaveAccessibleName('Sundae de Chocolate');
  await aumentar(page).click();
  await expect(total(page)).toHaveText('R$ 25,80');

  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Esferas do Dragão de Pepperoni');
  await expect(page.getByRole('heading', { name: 'Escolha seu acompanhamento' })).toBeVisible();
  await expect(total(page)).toHaveText('R$ 19,90');
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
  await expect(titulo(page)).toHaveAccessibleName('Esferas do Dragão de Pepperoni');
  await expect(categorias(page).getByRole('link', { name: 'Acompanhamentos' })).toHaveAttribute('aria-current', 'page');
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await page.goBack();
  await expect(titulo(page)).toHaveAccessibleName('Esferas do Dragão de Pepperoni');
  await page.goto('/#qualquer-coisa');
  await expect(titulo(page)).toHaveAccessibleName('Whopper®');
  await expect(categorias(page).getByRole('link', { name: 'Hambúrgueres' })).toHaveAttribute('aria-current', 'page');
});

test('voltar no navegador com Ver ingredientes aberto cancela e fecha antes de trocar de categoria', async ({ page }) => {
  await page.goto('/#bebidas');
  await categorias(page).getByRole('link', { name: 'Hambúrgueres' }).click();
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola').click();
  await page.goBack();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(titulo(page)).toHaveAccessibleName('Coca-Cola Original');
  await categorias(page).getByRole('link', { name: 'Hambúrgueres' }).click();
  await expect(descricao(page)).toContainText('cebola');
  await openVerIngredientes(page);
  await expect(chip(page, 'Retirar', 'Cebola')).toBeVisible();
});

test('acompanhamento, bebida e sobremesa chegam ao carrinho com nome e Total do item; Item idêntico soma', async ({ page }) => {
  const adicionar = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await categorias(page).getByRole('link', { name: 'Acompanhamentos' }).click();
  await escolher(page, 'Onion Rings');
  await aumentar(page).click();
  await adicionar.click();
  await expect(aviso(page)).toHaveText('Adicionado ao carrinho: Onion Rings');
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
  await expect(carrinho(page).getByText('5 unidades em 3 itens', { exact: true })).toBeVisible();
  await expect(itens(page).getByRole('heading')).toHaveText(['Onion Rings', 'Coca-Cola', 'BK® Mix Crocante']);
  // Onion Rings × 3, Coca-Cola × 1, BK® Mix Crocante × 1.
  await expect(totalDoItem(itens(page).nth(0))).toHaveText('R$ 47,70');
  await expect(totalDoItem(itens(page).nth(1))).toHaveText('R$ 9,90');
  await expect(totalDoItem(itens(page).nth(2))).toHaveText('R$ 23,90');
  await expect(totalDosItens(page)).toHaveText('R$ 81,50');
});

test('o erro do combo sem bebida no hambúrguer não impede adicionar uma bebida', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('Escolha a bebida do combo')).toBeVisible();
  await categorias(page).getByRole('link', { name: 'Bebidas' }).click();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText('Adicionado ao carrinho: Coca-Cola');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
});

test('cada página abre com o primeiro produto da grade selecionado', async ({ page }) => {
  await page.goto('/');
  for (const categoria of ['Hambúrgueres', 'Acompanhamentos', 'Bebidas', 'Sobremesas']) {
    await categorias(page).getByRole('link', { name: categoria }).click();
    await expect(grade(page).first()).toHaveAttribute('aria-pressed', 'true');
    await expect(grade(page).and(page.locator('[aria-pressed=true]'))).toHaveCount(1);
  }
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
      for (const img of [page.locator('#product-photo'), card(page, nome).locator('.catalog-photo img')]) {
        await expect(img).toBeVisible();
        await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
      }
      await expect(page.locator('#product-description')).toHaveText(/\S.+\.$/);
      await expect(total(page)).toHaveText(/^R\$\s\d+,\d\d$/);
    }
  }
  await expect(page.getByText(/Consultar preço/)).toHaveCount(0);
});

test('a foto mostra só a área desenhada também sem object-view-box (fora do Chrome)', async ({ page }) => {
  await page.goto('/#bebidas');
  const foto = page.getByRole('main').getByRole('img', { name: 'Coca-Cola Original' });
  const cartao = card(page, 'Coca-Cola');
  await expect.poll(() => page.evaluate(() => [...document.images].every((i) => i.complete))).toBe(true);
  // Chrome's smoothing of the scaled-down photo is not repeatable bit for bit: two renderings alternate from one
  // capture to the next even with nothing changed. Nearest-neighbour scaling is, and still shows any change in the drawn area.
  await page.addStyleTag({ content: '.photo-crop img{image-rendering:pixelated}' });
  const antes = await cartao.screenshot({ animations: 'disabled' });
  // A browser without object-view-box (Firefox, Safari).
  await page.addStyleTag({ content: '*{object-view-box:none!important}' });
  // Coca-Cola: drawn area 188 × 357 of the 800 × 800 file.
  const { width, height } = await foto.boundingBox();
  expect(Math.abs(width / height - 188 / 357)).toBeLessThan(0.02);
  expect(await cartao.screenshot({ animations: 'disabled' })).toEqual(antes);
});

// The three layouts of ticket 03, with the photo in place of the 3D.
const caixa = async (locator) => {
  await expect(locator).toBeVisible();
  return locator.boundingBox();
};
const hero = (page, heading) => ({
  titulo: titulo(page),
  foto: page.getByRole('main').getByRole('img', { name: /./ }).first(),
  descricao: page.locator('#product-description'),
  quantidade: page.getByRole('group', { name: 'Quantidade' }),
  adicionar: page.getByRole('button', { name: 'Adicionar ao carrinho' }),
  grade: page.getByRole('heading', { name: heading }),
});
const semRolagemHorizontal = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

test.describe('celular e tablet (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the 390 × 844 project');

  test('390: Sobremesas em uma coluna (título, foto, descrição, card, grade em 2 colunas) e a aba ativa à vista', async ({ page }) => {
    await page.goto('/#sobremesas');
    const h = hero(page, 'Escolha sua sobremesa');
    let anterior = null;
    for (const item of [h.titulo, h.foto, h.descricao, h.quantidade, h.adicionar, h.grade]) {
      const box = await caixa(item);
      if (anterior) expect(box.y).toBeGreaterThanOrEqual(anterior.y + anterior.height - 1);
      anterior = box;
    }
    const [a, b, c] = await Promise.all([0, 1, 2].map((i) => caixa(grade(page).nth(i))));
    expect(b.y).toBe(a.y);
    expect(c.x).toBe(a.x);
    await expect(categorias(page).getByRole('link', { name: 'Sobremesas' })).toBeInViewport({ ratio: 0.95 });
    expect((await caixa(h.titulo)).width).toBeLessThanOrEqual(390);
    await semRolagemHorizontal(page);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('1280: Acompanhamentos com título e card à esquerda, foto à direita com a descrição abaixo, grade em 4 colunas', async ({ page }) => {
    await page.goto('/#acompanhamentos');
    const h = hero(page, 'Escolha seu acompanhamento');
    const [tit, adicionar, foto, desc, grd] = await Promise.all([h.titulo, h.adicionar, h.foto, h.descricao, h.grade].map(caixa));
    expect(adicionar.y).toBeGreaterThan(tit.y + tit.height);
    expect(foto.x).toBeGreaterThanOrEqual(adicionar.x + adicionar.width);
    expect(foto.y).toBeLessThan(adicionar.y);
    expect(desc.y).toBeGreaterThanOrEqual(foto.y + foto.height);
    expect(grd.y).toBeGreaterThan(Math.max(adicionar.y + adicionar.height, desc.y + desc.height));
    const linha = await Promise.all([0, 1, 2, 3, 4].map((i) => caixa(grade(page).nth(i))));
    for (const c of linha.slice(1, 4)) expect(c.y).toBe(linha[0].y);
    expect(linha[4].x).toBe(linha[0].x);
    await semRolagemHorizontal(page);
  });

  test.describe('≥ 1920px', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('1920: Bebidas sem rolagem da página, coluna lateral "Escolha sua bebida" em 2 colunas com rolagem própria', async ({ page }) => {
      await page.goto('/#bebidas');
      const h = hero(page, 'Escolha sua bebida');
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1080);
      const [foto, adicionar, grd] = await Promise.all([h.foto, h.adicionar, h.grade].map(caixa));
      expect(grd.x).toBeGreaterThan(foto.x + foto.width);
      expect(adicionar.x + adicionar.width).toBeLessThanOrEqual(foto.x);
      const [a, b, c] = await Promise.all([0, 1, 2].map((i) => caixa(grade(page).nth(i))));
      expect(b.y).toBe(a.y);
      expect(c.x).toBe(a.x);
      const coluna = page.locator('#catalog');
      expect(await coluna.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
      await page.mouse.move(grd.x + 100, grd.y + 300);
      await page.mouse.wheel(0, 600);
      await expect.poll(() => coluna.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      // Another category starts its column at the top.
      await categorias(page).getByRole('link', { name: 'Sobremesas' }).click();
      await expect(page.getByRole('heading', { name: 'Escolha sua sobremesa' })).toBeInViewport();
      expect(await coluna.evaluate((el) => el.scrollTop)).toBe(0);
    });
  });
});
