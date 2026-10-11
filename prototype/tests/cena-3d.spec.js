import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, camada, chip, TITULO } from './support.js';

/** The hero visual: stage with the burger, "Ver ingredientes" and the note. */
const heroStage = (page) => page.locator('main #hero-stage');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('o hero desenha o Whopper em 3D, sem as ilustrações SVG', async ({ page }) => {
  await expect(heroStage(page).locator('canvas')).toBeVisible();
  await expect(heroStage(page).locator('svg').first()).toBeHidden();
});

/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });

test('o hero mostra o hambúrguer montado sem os ingredientes retirados, mais baixo', async ({ page }) => {
  await expect(heroCamada(page, 'Queijo')).toBeVisible();
  const antes = await heroCamada(page, 'Pão superior').boundingBox();

  await openVerIngredientes(page);
  for (const nome of ['Queijo', 'Tomate', 'Alface']) await camada(page, nome).click();
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  await expect(verIngredientes(page)).toBeHidden();

  for (const nome of ['Queijo', 'Tomate', 'Alface']) await expect(heroCamada(page, nome)).toBeHidden();
  await expect(heroCamada(page, 'Picles')).toBeVisible();
  const depois = await heroCamada(page, 'Pão superior').boundingBox();
  expect(depois.y).toBeGreaterThan(antes.y + 5);
});

test('cada ingrediente aberto em 3D tem sua própria área de toque', async ({ page, isMobile }) => {
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
  const removiveis = ['Queijo', 'Picles', 'Ketchup', 'Cebola', 'Tomate', 'Alface', 'Maionese'];
  for (const nome of removiveis) {
    // Playwright only taps if the button itself receives the event at its centre.
    if (isMobile) await camada(page, nome).tap();
    else await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
  }
  await expect(verIngredientes(page).getByText(`Whopper® · Sem ${new Intl.ListFormat('pt-BR').format(removiveis).toLowerCase()}`)).toBeVisible();
});

/** Vertical distance between the centres of Pão inferior and Pão superior in the dialog. */
async function alturaAberta(page) {
  const topo = await camada(page, 'Pão superior').boundingBox();
  const base = await camada(page, 'Pão inferior').boundingBox();
  if (!topo || !base) return Infinity; // dialog already closed
  return base.y + base.height / 2 - (topo.y + topo.height / 2);
}

test('aplicar compacta as camadas abertas, com o pão superior descendo até a base', async ({ page }) => {
  await openVerIngredientes(page);
  await chip(page, 'Retirar', 'Tomate').click();
  // Wait until the opening transition settles (two equal readings in a row).
  let aberta = 0;
  await expect
    .poll(async () => {
      const antes = aberta;
      aberta = await alturaAberta(page);
      return aberta > 200 && aberta === antes;
    })
    .toBe(true);

  // Read the distance every time the scene repositions the buttons, until the dialog closes:
  // the closing transition is too short (and frames too slow under software WebGL) to catch
  // by polling from the test process or once per animation frame.
  const menorAltura = page.evaluate(
    (titulo) =>
      new Promise((resolve) => {
        const dialog = [...document.querySelectorAll('[role=dialog]')].find((d) => d.textContent.includes(titulo));
        const centro = (rotulo) => {
          const r = dialog.querySelector(`[aria-label="${rotulo}"]`).getBoundingClientRect();
          return r.top + r.height / 2;
        };
        let menor = Infinity;
        const ler = () => {
          if (!dialog.checkVisibility()) {
            observer.disconnect();
            return resolve(menor);
          }
          menor = Math.min(menor, centro('Retirar Pão inferior') - centro('Retirar Pão superior'));
        };
        const observer = new MutationObserver(ler);
        observer.observe(dialog, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
        ler();
      }),
    TITULO,
  );
  await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
  expect(await menorAltura).toBeLessThan(aberta * 0.5);
  await expect(verIngredientes(page)).toBeHidden();
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  const doisQuadros = (page) =>
    page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  test('abrir e retirar não animam as camadas; aplicar fecha na hora', async ({ page }) => {
    await openVerIngredientes(page);
    await doisQuadros(page);
    const logo = await camada(page, 'Pão superior').boundingBox();
    await page.waitForTimeout(400);
    expect(await camada(page, 'Pão superior').boundingBox()).toEqual(logo);

    await chip(page, 'Retirar', 'Queijo').click();
    await doisQuadros(page);
    const semQueijo = await alturaAberta(page);
    await page.waitForTimeout(400);
    expect(await alturaAberta(page)).toBe(semQueijo);

    await verIngredientes(page).getByRole('button', { name: 'Aplicar alterações' }).click();
    await expect(verIngredientes(page)).toBeHidden({ timeout: 300 });
  });
});

test('cada ingrediente aberto tem área de toque de pelo menos 24 × 44 px', async ({ page }) => {
  await openVerIngredientes(page);
  const removiveis = ['Queijo', 'Picles', 'Ketchup', 'Cebola', 'Tomate', 'Alface', 'Maionese'];
  // WCAG 2.5.8 asks for 24 px; the Camadas are wide, so 44 px across is easy.
  await expect
    .poll(async () => {
      const menores = [];
      for (const nome of removiveis) {
        const box = await camada(page, nome).boundingBox();
        if (box.height < 24 || box.width < 44) menores.push(`${nome} ${Math.round(box.width)}×${Math.round(box.height)}`);
      }
      return menores;
    })
    .toEqual([]);
});
