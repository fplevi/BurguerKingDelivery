import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, ingredientes, recolocarTodos, camada, chip, descricao, retirado, dragTo, card, escolher, aviso, carrinho, itens, totalDoItem } from './support.js';

const heroTitle = (page) => page.getByRole('heading', { level: 1 });
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });
const CHEESEBURGER_DUPLO = 'Cheeseburger Duplo';
const DESCRICAO = 'Pão com gergelim, duas carnes grelhadas, queijo derretido, picles, ketchup e mostarda.';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('escolher o Cheeseburger Duplo na grade troca nome, preço, descrição e o hambúrguer 3D do hero', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await expect(heroTitle(page)).toHaveAccessibleName(CHEESEBURGER_DUPLO);
  await expect(page.locator('main').getByText('R$ 24,90', { exact: true }).first()).toBeVisible();
  await expect(descricao(page)).toHaveText(DESCRICAO);
  await expect(card(page, 'Whopper®')).toHaveAttribute('aria-pressed', 'false');
  await expect(card(page, 'Cheeseburger')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 24,90');
  const hero = page.locator('main #hero-stage');
  await expect(hero.locator('canvas')).toHaveCount(1);
  await expect(hero.locator('canvas')).toBeVisible();
  await expect(heroCamada(page, 'Queijo inferior')).toBeVisible();
  await expect(heroCamada(page, 'Queijo superior')).toBeVisible();
  await expect(heroCamada(page, 'Picles')).toBeVisible();
  await expect(heroCamada(page, 'Queijo')).toHaveCount(0);
});

const receita = ['Pão inferior', 'Carne grelhada', 'Queijo inferior', 'Carne grelhada', 'Queijo superior', 'Picles', 'Ketchup', 'Mostarda', 'Pão superior'];
const removiveis = ['Queijo inferior', 'Queijo superior', 'Picles', 'Ketchup', 'Mostarda'];
/** Every Camada of the opened burger, bottom to top in the Receita. */
const camadas = (page) => verIngredientes(page).locator('.stage').getByRole('button', { name: /^Retirar / });
const aplicar = (page) => verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' });
const cancelar = (page) => verIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true });

test('Ver ingredientes abre as 9 camadas do Cheeseburger Duplo, de baixo para cima', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  await expect(camadas(page)).toHaveCount(9);
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
  test(`retira só ${nome.toLowerCase()} do Cheeseburger Duplo`, async ({ page, isMobile }) => {
    await escolher(page, CHEESEBURGER_DUPLO);
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
    await expect(verIngredientes(page).getByText(`${CHEESEBURGER_DUPLO} · Sem ${nome.toLowerCase()} ·`)).toBeVisible();
  });
}

test('retirar os dois queijos, picles, ketchup e mostarda juntos põe os cinco na bandeja', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  for (const nome of removiveis) await chip(page, 'Retirar', nome).click();
  for (const nome of removiveis) await expect(retirado(page, nome)).toBeVisible();
  await expect(verIngredientes(page).getByText(`${CHEESEBURGER_DUPLO} · Sem queijo inferior, queijo superior, picles, ketchup e mostarda`)).toBeVisible();
});

test('as carnes e os pães do Cheeseburger Duplo não podem ser retirados', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  for (const base of ['Pão inferior', 'Pão superior']) await expect(camada(page, base)).toBeDisabled();
  await expect(verIngredientes(page).locator('.stage').getByRole('button', { name: 'Retirar Carne grelhada', exact: true })).toHaveCount(2);
  for (const carne of await verIngredientes(page).locator('.stage').getByRole('button', { name: 'Retirar Carne grelhada', exact: true }).all())
    await expect(carne).toBeDisabled();
  await expect(ingredientes(page).getByRole('button', { name: /Carne|Pão/ })).toHaveCount(0);
  await camada(page, 'Pão superior').click({ force: true });
  await expect(verIngredientes(page).getByText(`${CHEESEBURGER_DUPLO} · Todos os ingredientes`)).toBeVisible();
});

test('Recolocar todos, aplicar e cancelar funcionam no Cheeseburger Duplo', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await chip(page, 'Retirar', 'Queijo superior').click();
  await recolocarTodos(page).click();
  await expect(verIngredientes(page).getByText(`${CHEESEBURGER_DUPLO} · Todos os ingredientes`)).toBeVisible();

  await chip(page, 'Retirar', 'Ketchup').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();
  const semKetchup = 'Pão com gergelim, duas carnes grelhadas, queijo derretido, picles e mostarda.';
  await expect(descricao(page)).toHaveText(semKetchup);

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Picles').click();
  await cancelar(page).click();
  await expect(descricao(page)).toHaveText(semKetchup);
});

test('retirar só um dos queijos mantém o queijo na descrição; retirar os dois o tira', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Queijo inferior').click();
  await aplicar(page).click();
  await expect(descricao(page)).toHaveText(DESCRICAO);

  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Queijo superior').click();
  await aplicar(page).click();
  await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, picles, ketchup e mostarda.');
});

test('Cheeseburger Duplo personalizado chega ao carrinho, com combo e "Sem queijo superior, picles e mostarda"', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await page.getByRole('checkbox', { name: 'Transformar em combo' }).check();
  await page.getByRole('combobox', { name: 'Bebida do combo' }).click();
  await page.getByRole('option', { name: 'Sprite', exact: true }).click();
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 36,90');
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Mostarda').click();
  await chip(page, 'Retirar', 'Picles').click();
  await chip(page, 'Retirar', 'Queijo superior').click();
  await aplicar(page).click();
  await expect(verIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(aviso(page)).toHaveText(`Adicionado ao carrinho: ${CHEESEBURGER_DUPLO}`);
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('1 item no carrinho', { exact: true })).toBeVisible();
  const item = itens(page).first();
  await expect(item.getByRole('heading')).toHaveText(CHEESEBURGER_DUPLO);
  await expect(item.getByText('Pão com gergelim, duas carnes grelhadas, queijo derretido e ketchup.', { exact: true })).toBeVisible();
  // Bottom to top, as in the Receita, whatever the order they were removed in.
  await expect(item.getByText('Sem queijo superior, picles e mostarda', { exact: true })).toBeVisible();
  await expect(totalDoItem(item)).toHaveText('R$ 36,90');
});

for (const [nome, preco, quantas, inicio] of [
  ['Whopper®', 'R$ 31,90', 10, /^Pão com gergelim, carne grelhada, queijo derretido, /],
  ['Cheddar Duplo', 'R$ 34,90', 7, 'Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.'],
  ['Stacker Duplo Bacon', 'R$ 37,90', 7, 'Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker.'],
  ['Rodeio Duplo', 'R$ 36,90', 8, 'Pão com gergelim, duas carnes grelhadas, queijo derretido, molho barbecue, onion rings crocantes e maionese.'],
  ['Big King', 'R$ 31,90', 11, /^Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, /],
  ['Rodeio', 'R$ 29,90', 7, 'Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese.'],
]) {
  test(`voltar ao ${nome} não deixa resto do Cheeseburger Duplo e mantém o carrinho`, async ({ page }) => {
    await escolher(page, CHEESEBURGER_DUPLO);
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Queijo superior').click();
    await aplicar(page).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    // A Personalização in progress when switching is dropped too.
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Picles').click();
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
    await expect(verIngredientes(page).getByRole('button', { name: /Queijo (inferior|superior)$/ })).toHaveCount(0);
    await expect(verIngredientes(page).getByText(`${nome} · Todos os ingredientes`)).toBeVisible();
  });
}

test('a bandeja mostra a imagem do queijo superior retirado', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  await camada(page, 'Queijo superior').click();
  const imagem = retirado(page, 'Queijo superior').locator('img');
  await expect(imagem).toHaveCount(1);
  await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await retirado(page, 'Queijo superior').click();
  await expect(chip(page, 'Retirar', 'Queijo superior')).toHaveAttribute('aria-pressed', 'true');
});

test('arrastar o picles aberto até a bandeja o retira', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
  await dragTo(page, camada(page, 'Picles'), bandeja(page));
  await expect(retirado(page, 'Picles')).toBeVisible();
  await expect(chip(page, 'Recolocar', 'Picles')).toBeVisible();
  await expect(chip(page, 'Retirar', 'Ketchup')).toHaveAttribute('aria-pressed', 'true');
});

test('as áreas de toque das camadas abertas do Cheeseburger Duplo não se sobrepõem e têm pelo menos 24 × 44 px', async ({ page }) => {
  await escolher(page, CHEESEBURGER_DUPLO);
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

  test('o Cheeseburger Duplo usa as ilustrações SVG das 9 camadas e o fluxo de retirada continua funcionando', async ({ page }) => {
    await escolher(page, CHEESEBURGER_DUPLO);
    await expect(page.locator('main #hero-stage canvas')).toHaveCount(0);
    for (const nome of removiveis) await expect(heroCamada(page, nome).locator('svg')).toBeVisible();

    await openVerIngredientes(page);
    await expect(camadas(page)).toHaveCount(9);
    for (let i = 0; i < receita.length; i++) await expect(camadas(page).nth(i).locator('svg')).toBeVisible();
    await camada(page, 'Picles').click();
    await dragTo(page, camada(page, 'Queijo inferior'), bandeja(page));
    await expect(retirado(page, 'Queijo inferior').locator('svg')).toBeVisible();
    await aplicar(page).click();
    await expect(verIngredientes(page)).toBeHidden();
    await expect(descricao(page)).toHaveText('Pão com gergelim, duas carnes grelhadas, queijo derretido, ketchup e mostarda.');
  });
});
