import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, alterarIngredientes, bandeja, camada, chip, heroNote, retirado, dragTo, card, escolher } from './support.js';

const heroTitle = (page) => page.getByRole('heading', { level: 1 });
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('escolher o Cheddar Duplo na grade troca nome, preço e descrição do hero', async ({ page }) => {
  await expect(heroTitle(page)).toHaveAccessibleName('Whopper Clássico');
  await escolher(page, 'Cheddar Duplo');
  await expect(heroTitle(page)).toHaveAccessibleName('Cheddar Duplo');
  await expect(page.locator('main').getByText('R$ 34,90', { exact: true })).toBeVisible();
  await expect(page.getByText('Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy.')).toBeVisible();
  await expect(card(page, 'Whopper Clássico')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 46,90');
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
const camadas = (page) => alterarIngredientes(page).locator('.stage').getByRole('button', { name: /^Retirar / });

test('Alterar ingredientes abre as 7 camadas do Cheddar Duplo, de baixo para cima', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
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
    await openAlterarIngredientes(page);
    await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
    for (const outro of removiveis.filter((n) => n !== nome)) {
      await expect(chip(page, 'Retirar', outro)).toHaveAttribute('aria-pressed', 'true');
      await expect(camada(page, outro)).toBeVisible();
    }
    await expect(alterarIngredientes(page).getByText(`Cheddar Duplo · Sem ${nome.toLowerCase()} ·`)).toBeVisible();
  });
}

test('as duas carnes e os pães do Cheddar Duplo não podem ser retirados', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  const carnes = alterarIngredientes(page).getByRole('button', { name: 'Retirar Carne grelhada', exact: true });
  await expect(carnes).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(carnes.nth(i)).toBeDisabled();
  for (const base of ['Pão inferior', 'Pão superior']) await expect(camada(page, base)).toBeDisabled();
  await expect(bandeja(page).getByRole('button', { name: /Carne|Pão/ })).toHaveCount(0);
  await carnes.nth(1).click({ force: true });
  await expect(alterarIngredientes(page).getByText('Cheddar Duplo · Todos os ingredientes')).toBeVisible();
});

test('Recolocar todos, aplicar e cancelar funcionam no Cheddar Duplo', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar superior').click();
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await bandeja(page).getByRole('button', { name: 'Recolocar todos' }).click();
  await expect(alterarIngredientes(page).getByText('Cheddar Duplo · Todos os ingredientes')).toBeVisible();

  await chip(page, 'Retirar', 'Cebola crispy').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(alterarIngredientes(page)).toBeHidden();
  await expect(heroNote(page)).toHaveText('Sem cebola crispy');

  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar inferior').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(heroNote(page)).toHaveText('Sem cebola crispy');
});

const carrinho = (page) => page.getByRole('dialog', { name: 'Seu carrinho' });

test('Cheddar Duplo personalizado chega ao carrinho, com combo e tamanho', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await page.getByRole('button', { name: 'G', exact: true }).click();
  await expect(page.getByText('Total do item').locator('strong')).toHaveText('R$ 49,90');
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Cheddar inferior').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(alterarIngredientes(page)).toBeHidden();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByRole('status')).toHaveText('Cheddar Duplo adicionado ao carrinho');
  await page.getByRole('button', { name: 'Carrinho · 1' }).click();
  await expect(carrinho(page).getByText('Cheddar Duplo · R$ 49,90')).toBeVisible();
  await expect(carrinho(page).getByText('Combo G · Sem cheddar inferior')).toBeVisible();
});

test('a bandeja mostra a imagem da camada do Cheddar Duplo retirada', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  await camada(page, 'Cebola crispy').click();
  const imagem = retirado(page, 'Cebola crispy').locator('img');
  await expect(imagem).toHaveCount(1);
  await expect.poll(() => imagem.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await retirado(page, 'Cebola crispy').click();
  await expect(chip(page, 'Retirar', 'Cebola crispy')).toHaveAttribute('aria-pressed', 'true');
});

test('voltar ao Whopper mostra as 10 camadas dele, sem resto do Cheddar Duplo, e mantém o carrinho', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  await chip(page, 'Retirar', 'Cebola crispy').click();
  await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(heroNote(page)).toHaveText('Sem cebola crispy');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

  await escolher(page, 'Whopper Clássico');
  await expect(heroTitle(page)).toHaveAccessibleName('Whopper Clássico');
  await expect(page.locator('main').getByText('R$ 31,90', { exact: true })).toBeVisible();
  await expect(heroNote(page)).toHaveText('Preparado com todos os ingredientes');
  await expect(page.locator('main #hero-stage canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();

  await openAlterarIngredientes(page);
  await expect(camadas(page)).toHaveCount(10);
  await expect(alterarIngredientes(page).locator('canvas')).toHaveCount(1);
  await expect(alterarIngredientes(page).getByText(/Cheddar|crispy/)).toHaveCount(0);
  await expect(alterarIngredientes(page).getByText('Whopper Clássico · Todos os ingredientes')).toBeVisible();
  await camada(page, 'Queijo').click();
  await expect(retirado(page, 'Queijo')).toBeVisible();
});

test('os cards "Em breve" não trocam o hero', async ({ page }) => {
  for (const nome of ['Stacker Duplo Bacon', 'Rodeio Duplo', 'Big King', 'Cheeseburger Duplo', 'Cheeseburger', 'Rodeio']) {
    const outro = card(page, nome);
    await expect(outro).toContainText('Em breve neste protótipo');
    // The official photo (decorative, alt="") must actually load.
    const foto = outro.locator('img');
    await foto.scrollIntoViewIfNeeded();
    await expect.poll(() => foto.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  }
  await card(page, 'Big King').click();
  await expect(page.getByRole('status')).toHaveText('Por enquanto, escolha o Whopper ou o Cheddar Duplo. Os demais vêm depois.');
  await expect(card(page, 'Big King')).toHaveAttribute('aria-pressed', 'false');
  await expect(card(page, 'Whopper Clássico')).toHaveAttribute('aria-pressed', 'true');
  await expect(heroTitle(page)).toHaveAccessibleName('Whopper Clássico');
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

    await openAlterarIngredientes(page);
    await expect(camada(page, 'Cebola crispy').locator('svg')).toBeVisible();
    await camada(page, 'Cheddar superior').click();
    await dragTo(page, camada(page, 'Cebola crispy'), bandeja(page));
    await expect(retirado(page, 'Cebola crispy').locator('svg')).toBeVisible();
    await alterarIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
    await expect(alterarIngredientes(page)).toBeHidden();
    await expect(heroNote(page)).toHaveText('Sem cheddar superior, cebola crispy');

    await escolher(page, 'Whopper Clássico');
    await expect(heroNote(page)).toHaveText('Preparado com todos os ingredientes');
    await expect(heroCamada(page, 'Queijo').locator('svg')).toBeVisible();
  });
});

test('cada camada aberta do Cheddar Duplo tem sua própria área de toque', async ({ page, isMobile }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  await expect(alterarIngredientes(page).locator('canvas')).toBeVisible();
  // Bottom to top: the thin cheddars sit between the meats, with drips over their edges.
  for (const nome of removiveis) {
    // Playwright only taps if the button itself receives the event at its centre.
    if (isMobile) await camada(page, nome).tap();
    else await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
  }
  await expect(alterarIngredientes(page).getByText('Cheddar Duplo · Sem cheddar inferior, cheddar superior, cebola crispy')).toBeVisible();
});

test('as áreas de toque das camadas abertas do Cheddar Duplo não se sobrepõem e têm pelo menos 24 × 44 px', async ({ page }) => {
  await escolher(page, 'Cheddar Duplo');
  await openAlterarIngredientes(page);
  await expect(alterarIngredientes(page).locator('canvas')).toBeVisible();
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
