import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, recolocarTodos, camada, chip, descricao, retirado, dragTo, card, escolher, aviso, carrinho, itens, totalDoItem } from './support.js';

const heroTitle = (page) => page.getByRole('heading', { level: 1 });
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });
const STACKER = 'Stacker Duplo Bacon';
const DESCRICAO = 'Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker.';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('escolher o Stacker Duplo Bacon na grade troca nome, preço, descrição e o hambúrguer 3D do hero', async ({ page }) => {
  await escolher(page, STACKER);
  await expect(heroTitle(page)).toHaveAccessibleName(STACKER);
  await expect(page.locator('main').getByText('R$ 37,90', { exact: true }).first()).toBeVisible();
  await expect(descricao(page)).toHaveText(DESCRICAO);
  await expect(card(page, 'Whopper®')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 37,90');
  const hero = page.locator('main #hero-stage');
  await expect(hero.locator('canvas')).toHaveCount(1);
  await expect(hero.locator('canvas')).toBeVisible();
  await expect(heroCamada(page, 'Bacon')).toBeVisible();
  await expect(heroCamada(page, 'Molho Stacker')).toBeVisible();
  await expect(heroCamada(page, 'Cebola crispy')).toHaveCount(0);
});

const receita = ['Pão inferior', 'Carne grelhada', 'Cheddar', 'Carne grelhada', 'Bacon', 'Molho Stacker', 'Pão superior'];
const removiveis = ['Cheddar', 'Bacon', 'Molho Stacker'];
/** Every Camada of the opened burger, bottom to top in the Receita (the two meats share a name). */
const camadas = (page) => verIngredientes(page).locator('.stage').getByRole('button', { name: /^Retirar / });
const aplicar = (page) => verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' });
const cancelar = (page) => verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true });

test('Ver ingredientes abre as 7 camadas do Stacker Duplo Bacon, de baixo para cima', async ({ page }) => {
  await escolher(page, STACKER);
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
  await expect(ingredientes(page).getByRole('button')).toHaveText(removiveis.map((n) => new RegExp(`${n}$`)));
});

for (const nome of removiveis) {
  test(`retira só ${nome.toLowerCase()} do Stacker Duplo Bacon`, async ({ page, isMobile }) => {
    await escolher(page, STACKER);
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
    await expect(verIngredientes(page).getByText(`${STACKER} · Sem ${nome.toLowerCase()} ·`)).toBeVisible();
  });
}

test('retirar cheddar, bacon e molho juntos põe os três na bandeja', async ({ page }) => {
  await escolher(page, STACKER);
  await openVerIngredientes(page);
  for (const nome of removiveis) await chip(page, 'Retirar', nome).click();
  for (const nome of removiveis) await expect(retirado(page, nome)).toBeVisible();
  await expect(verIngredientes(page).getByText(`${STACKER} · Sem cheddar, bacon e molho stacker`)).toBeVisible();
});

test('as duas carnes e os pães do Stacker Duplo Bacon não podem ser retirados', async ({ page }) => {
  await escolher(page, STACKER);
  await openVerIngredientes(page);
  const carnes = verIngredientes(page).getByRole('button', { name: 'Retirar Carne grelhada', exact: true });
  await expect(carnes).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(carnes.nth(i)).toBeDisabled();
  for (const base of ['Pão inferior', 'Pão superior']) await expect(camada(page, base)).toBeDisabled();
  await expect(ingredientes(page).getByRole('button', { name: /Carne|Pão/ })).toHaveCount(0);
  await carnes.nth(1).click({ force: true });
  await expect(verIngredientes(page).getByText(`${STACKER} · Todos os ingredientes`)).toBeVisible();
});

test('Recolocar todos, aplicar e cancelar funcionam no Stacker Duplo Bacon', async ({ page }) => {
  await escolher(page, STACKER);
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Bacon').click();
  await chip(page, 'Retirar', 'Cheddar').click();
  await recolocarTodos(page).click();
  await expect(verIngredientes(page).getByText(`${STACKER} · Todos os ingredientes`)).toBeVisible();

  await chip(page, 'Retirar', 'Molho Stacker').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, cheddar fatiado e bacon crocante.');

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Bacon').click();
  await cancelar(page).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, cheddar fatiado e bacon crocante.');
});

test('Stacker Duplo Bacon personalizado chega ao carrinho, com combo e "Sem bacon e molho stacker"', async ({ page }) => {
  await escolher(page, STACKER);
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).selectOption('Sprite');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 49,90');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Molho Stacker').click();
  await chip(page, 'Retirar', 'Bacon').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(`Adicionado ao carrinho: ${STACKER}`);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('1 item no carrinho', { exact: true })).toBeVisible();
  const item = itens(page).first();
  await expect(item.getByRole('heading')).toHaveText(STACKER);
  await expect(item.getByText('Pão com gergelim, duas carnes grelhadas e cheddar fatiado.', { exact: true })).toBeVisible();
  // Bottom to top, as in the Receita, whatever the order they were removed in.
  await expect(item.getByText('Sem bacon e molho stacker', { exact: true })).toBeVisible();
  await expect(totalDoItem(item)).toHaveText('R$ 49,90');
});

for (const [nome, preco, quantas, inicio] of [
  ['Whopper®', 'R$ 31,90', 10, /^Pão com gergelim, carne grelhada, queijo derretido, /],
  ['Cheddar Duplo', 'R$ 34,90', 7, 'Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.'],
]) {
  test(`voltar ao ${nome} não deixa resto do Stacker Duplo Bacon e mantém o carrinho`, async ({ page }) => {
    await escolher(page, STACKER);
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Bacon').click();
    await aplicar(page).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    // A Personalização in progress when switching is dropped too.
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Cheddar').click();
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
    await expect(verIngredientes(page).getByText(/Bacon|Stacker/)).toHaveCount(0);
    await expect(verIngredientes(page).getByText(`${nome} · Todos os ingredientes`)).toBeVisible();
  });
}

test('a bandeja mostra a imagem do bacon retirado', async ({ page }) => {
  await escolher(page, STACKER);
  await openVerIngredientes(page);
  await camada(page, 'Bacon').click();
  const imagem = retirado(page, 'Bacon').locator('img');
  await expect(imagem).toHaveCount(1);
  await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await retirado(page, 'Bacon').click();
  await expect(chip(page, 'Retirar', 'Bacon')).toHaveAttribute('aria-pressed', 'true');
});

test('as áreas de toque das camadas abertas do Stacker Duplo Bacon não se sobrepõem e têm pelo menos 24 × 44 px', async ({ page }) => {
  await escolher(page, STACKER);
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

  test('o Stacker Duplo Bacon usa as ilustrações SVG das 7 camadas e o fluxo de retirada continua funcionando', async ({ page }) => {
    await escolher(page, STACKER);
    await expect(page.locator('main #hero-stage canvas')).toHaveCount(0);
    for (const nome of removiveis) await expect(heroCamada(page, nome).locator('svg')).toBeVisible();

    await openVerIngredientes(page);
    await expect(camadas(page)).toHaveCount(7);
    for (let i = 0; i < receita.length; i++) await expect(camadas(page).nth(i).locator('svg')).toBeVisible();
    await camada(page, 'Molho Stacker').click();
    await dragTo(page, camada(page, 'Bacon'), bandeja(page));
    await expect(retirado(page, 'Bacon').locator('svg')).toBeVisible();
    await aplicar(page).click();
    await expect(verIngredientes(page)).toBeHidden();
    await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas e cheddar fatiado.');
  });
});
