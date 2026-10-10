import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, camada, chip, descricao, retirado, dragTo, card, escolher, aviso, carrinho, itens, totalDoItem, totalDosItens } from './support.js';

const heroTitle = (page) => page.getByRole('heading', { level: 1 });
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('escolher o Cheddar Duplo na grade troca nome, preço e descrição do hero', async ({ page }) => {
  await expect(heroTitle(page)).toHaveAccessibleName('Whopper®');
  await escolher(page, 'Cheddar Duplo');
  await expect(heroTitle(page)).toHaveAccessibleName('Cheddar Duplo');
  await expect(page.locator('main').getByText('R$ 34,90', { exact: true }).first()).toBeVisible();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.');
  await expect(card(page, 'Whopper®')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 34,90');
});

test('o hero desenha o Cheddar Duplo em 3D, numa cena só', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  const hero = page.locator('main #hero-stage');
  await expect(hero.locator('canvas')).toHaveCount(1);
  await expect(hero.locator('canvas')).toBeVisible();
  await expect(hero.locator('svg').first()).toBeHidden();
  await expect(heroCamada(page, 'Cebola crispy')).toBeVisible();
  await expect(heroCamada(page, 'Cheddar superior')).toBeVisible();
  await expect(heroCamada(page, 'Queijo')).toHaveCount(0);
});

const receita = ['Pão inferior', 'Carne grelhada', 'Cheddar inferior', 'Carne grelhada', 'Cheddar superior', 'Cebola crispy', 'Pão superior'];
const removiveis = ['Cheddar inferior', 'Cheddar superior', 'Cebola crispy'];
/** Every Camada of the opened burger, bottom to top in the Receita (the two meats share a name). */
const camadas = (page) => verIngredientes(page).locator('.stage').getByRole('button', { name: /^Retirar / });

test('Ver ingredientes abre as 7 camadas do Cheddar Duplo, de baixo para cima', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await expect(camadas(page)).toHaveCount(7);
  await expect
    .poll(async () => {
      const centres = [];
      for (let i = 0; i < receita.length; i++) {
        const button = camadas(page).nth(i);
        if ((await button.getAttribute('aria-label')) !== `Retirar ${receita[i]}`) return false;
        const box = await button.boundingBox();
        centres.push(box.y + box.height / 2);
      }
      return centres.every((y, i) => i === 0 || y < centres[i - 1]);
    })
    .toBe(true);
  await expect(bandeja(page).getByRole('button', { name: /^Retirar / })).toHaveText(removiveis.map((n) => new RegExp(`${n}$`)));
});

for (const nome of removiveis) {
  test(`retira só ${nome.toLowerCase()} do Cheddar Duplo`, async ({ page }) => {
    await escolher(page, 'Cheddar Duplo');
    await openVerIngredientes(page);
    await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
    for (const outro of removiveis.filter((n) => n !== nome)) {
      await expect(chip(page, 'Retirar', outro)).toHaveAttribute('aria-pressed', 'true');
      await expect(camada(page, outro)).toBeVisible();
    }
    await expect(verIngredientes(page).getByText(`Cheddar Duplo · Sem ${nome.toLowerCase()} ·`)).toBeVisible();
  });
}

test('as duas carnes e os pães do Cheddar Duplo não podem ser retirados', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  const carnes = verIngredientes(page).getByRole('button', { name: 'Retirar Carne grelhada', exact: true });
  await expect(carnes).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(carnes.nth(i)).toBeDisabled();
  for (const base of ['Pão inferior', 'Pão superior']) await expect(camada(page, base)).toBeDisabled();
  await expect(bandeja(page).getByRole('button', { name: /Carne|Pão/ })).toHaveCount(0);
  await carnes.nth(1).click({ force: true });
  await expect(verIngredientes(page).getByText('Cheddar Duplo · Todos os ingredientes')).toBeVisible();
});

test('Recolocar todos, aplicar e cancelar funcionam no Cheddar Duplo', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar superior').click();
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await bandeja(page).getByRole('button', { name: 'Recolocar todos' }).click();
  await expect(verIngredientes(page).getByText('Cheddar Duplo · Todos os ingredientes')).toBeVisible();

  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar inferior').click();
  await verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');
});

test('cheddar cremoso só sai da descrição com os dois cheddars retirados', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar inferior').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.');

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar superior').click();
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim e duas carnes grelhadas.');
});

test('Cheddar Duplo personalizado chega ao carrinho, com combo e bebida', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Fanta Laranja');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 46,90');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar inferior').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText('Adicionado ao carrinho: Cheddar Duplo');
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('1 item no carrinho', { exact: true })).toBeVisible();
  await expect(itens(page)).toHaveCount(1);
  await expect(itens(page).getByRole('heading')).toHaveText('Cheddar Duplo');
  // Combo and Personalização show on the Item from carrinho 03; the combo is already in the Total do item.
  await expect(totalDoItem(itens(page))).toHaveText('R$ 46,90');
  await expect(totalDosItens(page)).toHaveText('R$ 46,90');
});

test('a bandeja mostra a imagem da camada do Cheddar Duplo retirada', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await camada(page, 'Cebola crispy').click();
  const imagem = retirado(page, 'Cebola crispy').locator('img');
  await expect(imagem).toHaveCount(1);
  await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await retirado(page, 'Cebola crispy').click();
  await expect(chip(page, 'Retirar', 'Cebola crispy')).toHaveAttribute('aria-pressed', 'true');
});

test('voltar ao Whopper mostra as 10 camadas dele, sem resto do Cheddar Duplo, e mantém o carrinho', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

  await escolher(page, 'Whopper®');
  await expect(heroTitle(page)).toHaveAccessibleName('Whopper®');
  await expect(page.locator('main').getByText('R$ 31,90', { exact: true }).first()).toBeVisible();
  await expect(descricao(page)).toHaveText(/^Pão com gergelim, carne grelhada, queijo derretido, /);
  await expect(page.locator('main #hero-stage canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

  await openVerIngredientes(page);
  await expect(camadas(page)).toHaveCount(10);
  await expect(verIngredientes(page).locator('canvas')).toHaveCount(1);
  await expect(verIngredientes(page).getByText(/Cheddar|crispy/)).toHaveCount(0);
  await expect(verIngredientes(page).getByText('Whopper® · Todos os ingredientes')).toBeVisible();
  await camada(page, 'Queijo').click();
  await expect(retirado(page, 'Queijo')).toBeVisible();
});

// Code review of the Cheddar Duplo: every scene used to model each Camada again, on the main
// thread (the page stalled ~1 s on a phone's CPU when switching). Each model is now generated
// once per page; the scene marks each generation (`layer-models:built:<key>`).
test('trocar de produto e voltar não gera de novo o modelo de nenhuma camada', async ({ page }) => {
  const prontas = (n) =>
    page.waitForFunction((n) => ['assembled', 'open'].every((fit) => performance.getEntriesByName(`burger-scene:ready:${fit}`).length >= n), n);
  await prontas(1);
  let cenas = 1;
  for (const nome of ['Cheddar Duplo', 'Whopper®', 'Cheddar Duplo', 'Whopper®']) {
    await escolher(page, nome);
    await prontas(++cenas);
  }
  const geradas = await page.evaluate(() =>
    performance.getEntriesByType('mark').map((m) => m.name).filter((n) => n.startsWith('layer-models:built:')),
  );
  // Whopper: 9 models (two sauces, two buns...); Cheddar Duplo adds its two cheddars and the crispy onion.
  expect(geradas.length).toBeGreaterThanOrEqual(12);
  expect(geradas.filter((n, i) => geradas.indexOf(n) !== i)).toEqual([]);
});

test.describe('sem WebGL', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl/i.test(type) ? null : getContext.call(this, type, ...rest);
      };
    });
    await page.goto('/');
  });

  test('o Cheddar Duplo usa as ilustrações SVG e o fluxo de retirada continua funcionando', async ({ page }) => {
    await escolher(page, 'Cheddar Duplo');
    await expect(page.locator('main #hero-stage canvas')).toHaveCount(0);
    await expect(heroCamada(page, 'Cebola crispy').locator('svg')).toBeVisible();

    await openVerIngredientes(page);
    await expect(camada(page, 'Cebola crispy').locator('svg')).toBeVisible();
    await camada(page, 'Cheddar superior').click();
    await dragTo(page, camada(page, 'Cebola crispy'), bandeja(page));
    await expect(retirado(page, 'Cebola crispy').locator('svg')).toBeVisible();
    await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
    await expect(verIngredientes(page)).toBeHidden();
    await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar cremoso.');

    await escolher(page, 'Whopper®');
    await expect(descricao(page)).toHaveText(/^Pão com gergelim, carne grelhada, queijo derretido, /);
    await expect(heroCamada(page, 'Queijo').locator('svg')).toBeVisible();
  });
});

test('cada camada aberta do Cheddar Duplo tem sua própria área de toque', async ({ page, isMobile }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
  // Bottom to top: the thin cheddars sit between the meats, with drips over their edges.
  for (const nome of removiveis) {
    // Playwright only taps if the button itself receives the event at its centre.
    if (isMobile) await camada(page, nome).tap();
    else await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
  }
  await expect(verIngredientes(page).getByText('Cheddar Duplo · Sem cheddar inferior, cheddar superior, cebola crispy')).toBeVisible();
});

test('as áreas de toque das camadas abertas do Cheddar Duplo não se sobrepõem e têm pelo menos 24 × 44 px', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
  await expect
    .poll(async () => {
      const problemas = [];
      let abaixo = null; // the buttons come bottom to top
      for (let i = 0; i < receita.length; i++) {
        const box = await camadas(page).nth(i).boundingBox();
        if (!box) return [`${receita[i]} sem área`];
        if (box.height < 24 || box.width < 44) problemas.push(`${receita[i]} ${Math.round(box.width)}×${Math.round(box.height)}`);
        if (abaixo && box.y + box.height > abaixo.y + 0.5) problemas.push(`${receita[i]} invade ${receita[i - 1]}`);
        abaixo = box;
      }
      return problemas;
    })
    .toEqual([]);
});
