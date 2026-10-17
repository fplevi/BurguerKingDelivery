import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, recolocarTodos, camada, chip, descricao, retirado, dragTo, card, escolher, aviso, carrinho, itens, totalDoItem } from './support.js';

const heroTitle = (page) => page.getByRole('heading', { level: 1 });
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });
const BIG_KING = 'Big King';
const DESCRICAO = 'Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, molho Big King, picles, cebola e alface.';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('escolher o Big King na grade troca nome, preço, descrição e o hambúrguer 3D do hero', async ({ page }) => {
  await escolher(page, BIG_KING);
  await expect(heroTitle(page)).toHaveAccessibleName(BIG_KING);
  await expect(page.locator('main').getByText('R$ 31,90', { exact: true }).first()).toBeVisible();
  await expect(descricao(page)).toHaveText(DESCRICAO);
  await expect(card(page, 'Whopper®')).toHaveAttribute('aria-pressed', 'false');
  await expect(card(page, 'Rodeio')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 31,90');
  const hero = page.locator('main #hero-stage');
  await expect(hero.locator('canvas')).toHaveCount(1);
  await expect(hero.locator('canvas')).toBeVisible();
  await expect(heroCamada(page, 'Pão do meio')).toBeVisible();
  await expect(heroCamada(page, 'Molho Big King inferior')).toBeVisible();
  await expect(heroCamada(page, 'Molho Big King superior')).toBeVisible();
  await expect(heroCamada(page, 'Tomate')).toHaveCount(0);
});

const receita = [
  'Pão inferior', 'Carne grelhada', 'Queijo', 'Pão do meio', 'Molho Big King inferior', 'Carne grelhada',
  'Picles', 'Cebola', 'Alface', 'Molho Big King superior', 'Pão superior',
];
const removiveis = ['Queijo', 'Molho Big King inferior', 'Picles', 'Cebola', 'Alface', 'Molho Big King superior'];
/** Every Camada of the opened burger, bottom to top in the Receita. */
const camadas = (page) => verIngredientes(page).locator('.stage').getByRole('button', { name: /^Retirar / });
const aplicar = (page) => verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' });
const cancelar = (page) => verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true });

test('Ver ingredientes abre as 11 camadas do Big King, de baixo para cima', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  await expect(camadas(page)).toHaveCount(11);
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
  await expect(ingredientes(page).getByRole('button')).toHaveText(removiveis.map((n) => new RegExp(`${n}$`)));
});

for (const nome of removiveis) {
  test(`retira só ${nome.toLowerCase()} do Big King`, async ({ page, isMobile }) => {
    await escolher(page, BIG_KING);
    await openVerIngredientes(page);
    await expect(verIngredientes(page).locator('canvas')).toBeVisible();
    // Each opened Camada has its own touch area: Playwright only taps if the button itself receives the event.
    if (isMobile) await camada(page, nome).tap();
    else await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
    for (const outro of removiveis.filter((n) => n !== nome)) {
      await expect(chip(page, 'Retirar', outro)).toHaveAttribute('aria-pressed', 'true');
      await expect(camada(page, outro)).toBeVisible();
    }
    await expect(verIngredientes(page).getByText(`${BIG_KING} · Sem ${nome.toLowerCase()} ·`)).toBeVisible();
  });
}

test('retirar os seis ingredientes juntos põe todos na bandeja', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  for (const nome of removiveis) await chip(page, 'Retirar', nome).click();
  for (const nome of removiveis) await expect(retirado(page, nome)).toBeVisible();
  await expect(
    verIngredientes(page).getByText(`${BIG_KING} · Sem queijo, molho big king inferior, picles, cebola, alface e molho big king superior`),
  ).toBeVisible();
});

test('as carnes e os três pães do Big King não podem ser retirados', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  for (const base of ['Pão inferior', 'Pão do meio', 'Pão superior']) await expect(camada(page, base)).toBeDisabled();
  const carnes = verIngredientes(page).locator('.stage').getByRole('button', { name: 'Retirar Carne grelhada', exact: true });
  await expect(carnes).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(carnes.nth(i)).toBeDisabled();
  await expect(ingredientes(page).getByRole('button', { name: /Carne|Pão/ })).toHaveCount(0);
  await camada(page, 'Pão do meio').click({ force: true });
  await expect(verIngredientes(page).getByText(`${BIG_KING} · Todos os ingredientes`)).toBeVisible();
});

test('Recolocar todos, aplicar e cancelar funcionam no Big King', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Alface').click();
  await chip(page, 'Retirar', 'Queijo').click();
  await recolocarTodos(page).click();
  await expect(verIngredientes(page).getByText(`${BIG_KING} · Todos os ingredientes`)).toBeVisible();

  // "molho Big King" is said once, where the lowest sauce left is, and leaves the description only
  // with both sauces removed.
  await chip(page, 'Retirar', 'Molho Big King inferior').click();
  await chip(page, 'Retirar', 'Picles').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();
  const semPicles = 'Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, cebola, alface e molho Big King.';
  await expect(descricao(page)).toHaveText(semPicles);

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Molho Big King superior').click();
  await aplicar(page).click();
  const semMolhos = 'Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, cebola e alface.';
  await expect(descricao(page)).toHaveText(semMolhos);

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Cebola').click();
  await cancelar(page).click();
  await expect(descricao(page)).toHaveText(semMolhos);
});

test('Big King personalizado chega ao carrinho, com combo e "Sem molho big king inferior e picles"', async ({ page }) => {
  await escolher(page, BIG_KING);
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).click();
  await page.getByRole('option', { name: 'Sprite', exact: true }).click();
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 43,90');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await chip(page, 'Retirar', 'Molho Big King inferior').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(`Adicionado ao carrinho: ${BIG_KING}`);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('1 item no carrinho', { exact: true })).toBeVisible();
  const item = itens(page).first();
  await expect(item.getByRole('heading')).toHaveText(BIG_KING);
  await expect(
    item.getByText('Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, cebola, alface e molho Big King.', { exact: true }),
  ).toBeVisible();
  // Bottom to top, as in the Receita, whatever the order they were removed in.
  await expect(item.getByText('Sem molho big king inferior e picles', { exact: true })).toBeVisible();
  await expect(totalDoItem(item)).toHaveText('R$ 43,90');
});

for (const [nome, preco, quantas, inicio] of [
  ['Whopper®', 'R$ 31,90', 10, /^Pão com gergelim, carne grelhada, queijo derretido, /],
  ['Cheddar Duplo', 'R$ 34,90', 7, 'Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.'],
  ['Stacker Duplo Bacon', 'R$ 37,90', 7, 'Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker.'],
  ['Rodeio Duplo', 'R$ 36,90', 8, 'Pão com gergelim, duas carnes grelhadas, queijo derretido, molho barbecue, onion rings crocantes e maionese.'],
  ['Rodeio', 'R$ 29,90', 7, 'Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese.'],
]) {
  test(`voltar ao ${nome} não deixa resto do Big King e mantém o carrinho`, async ({ page }) => {
    await escolher(page, BIG_KING);
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Alface').click();
    await aplicar(page).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    // A Personalização in progress when switching is dropped too.
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Queijo').click();
    await aplicar(page).click();

    await escolher(page, nome);
    await expect(heroTitle(page)).toHaveAccessibleName(nome);
    await expect(page.locator('main').getByText(preco, { exact: true }).first()).toBeVisible();
    await expect(descricao(page)).toHaveText(inicio);
    await expect(page.locator('main #hero-stage canvas')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

    await openVerIngredientes(page);
    await expect(camadas(page)).toHaveCount(quantas);
    await expect(verIngredientes(page).locator('canvas')).toHaveCount(1);
    await expect(verIngredientes(page).getByRole('button', { name: /Pão do meio$|Molho Big King/ })).toHaveCount(0);
    await expect(verIngredientes(page).getByText(`${nome} · Todos os ingredientes`)).toBeVisible();
  });
}

test('a bandeja mostra a imagem do molho Big King retirado', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  await camada(page, 'Molho Big King inferior').click();
  const imagem = retirado(page, 'Molho Big King inferior').locator('img');
  await expect(imagem).toHaveCount(1);
  await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await retirado(page, 'Molho Big King inferior').click();
  await expect(chip(page, 'Retirar', 'Molho Big King inferior')).toHaveAttribute('aria-pressed', 'true');
});

test('arrastar a alface aberta até a bandeja a retira', async ({ page }) => {
  await escolher(page, BIG_KING);
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
  await dragTo(page, camada(page, 'Alface'), bandeja(page));
  await expect(retirado(page, 'Alface')).toBeVisible();
  await expect(chip(page, 'Recolocar', 'Alface')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Molho Big King superior')).toHaveAttribute('aria-pressed', 'true');
});

test('as áreas de toque das camadas abertas do Big King não se sobrepõem e têm pelo menos 24 × 44 px', async ({ page }) => {
  await escolher(page, BIG_KING);
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

  test('o Big King usa as ilustrações SVG das 11 camadas e o fluxo de retirada continua funcionando', async ({ page }) => {
    await escolher(page, BIG_KING);
    await expect(page.locator('main #hero-stage canvas')).toHaveCount(0);
    for (const nome of [...removiveis, 'Pão do meio']) await expect(heroCamada(page, nome).locator('svg')).toBeVisible();

    await openVerIngredientes(page);
    await expect(camadas(page)).toHaveCount(11);
    for (let i = 0; i < receita.length; i++) await expect(camadas(page).nth(i).locator('svg')).toBeVisible();
    await camada(page, 'Picles').click();
    await dragTo(page, camada(page, 'Cebola'), bandeja(page));
    await expect(retirado(page, 'Cebola').locator('svg')).toBeVisible();
    await aplicar(page).click();
    await expect(verIngredientes(page)).toBeHidden();
    await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, molho Big King e alface.');
  });
});
