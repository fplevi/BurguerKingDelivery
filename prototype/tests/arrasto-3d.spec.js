import { test, expect } from '@playwright/test';
import { openVerIngredientes, verIngredientes, bandeja, camada, chip, retirado } from './support.js';

// Mouse only: touch drag still needs a physical device (Playwright can't synthesise it faithfully).
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await openVerIngredientes(page);
  await expect(verIngredientes(page).locator('canvas')).toBeVisible();
});

const centre = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

/** Waits until the opening transition has settled and returns the layer's box. */
async function settledBox(locator) {
  let last = null;
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      const same = last && Math.abs(box.y - last.y) < 0.5 && Math.abs(box.x - last.x) < 0.5;
      last = box;
      return same;
    })
    .toBe(true);
  return last;
}

/** Background colour of the bandeja (it lights up while something is dragged over it). */
const fundoDaBandeja = (page) => bandeja(page).evaluate((el) => getComputedStyle(el).backgroundColor);

test('a camada 3D acompanha o cursor durante o arrasto e a bandeja reage', async ({ page }) => {
  const inicio = centre(await settledBox(camada(page, 'Tomate')));
  const fundo = await fundoDaBandeja(page);
  await page.mouse.move(inicio.x, inicio.y);
  await page.mouse.down();

  // Halfway: the Camada's hit area (projected from the 3D object) is under the pointer.
  const alvo = centre(await bandeja(page).boundingBox());
  const meio = { x: (inicio.x + alvo.x) / 2, y: (inicio.y + alvo.y) / 2 };
  await page.mouse.move(meio.x, meio.y, { steps: 8 });
  await expect
    .poll(async () => {
      const agora = centre(await camada(page, 'Tomate').boundingBox());
      return Math.hypot(agora.x - meio.x, agora.y - meio.y);
    })
    .toBeLessThan(40);
  expect(await fundoDaBandeja(page)).toBe(fundo);

  await page.mouse.move(alvo.x, alvo.y, { steps: 8 });
  await expect.poll(() => fundoDaBandeja(page)).not.toBe(fundo);
  await page.mouse.up();

  await expect(chip(page, 'Recolocar', 'Tomate')).toBeVisible();
  await expect(retirado(page, 'Tomate')).toBeVisible();
  await expect(camada(page, 'Tomate')).toBeHidden();
  await expect.poll(() => fundoDaBandeja(page)).toBe(fundo);
});

test('depois de soltar na bandeja, o hambúrguer volta para o palco com o cursor parado sobre a bandeja', async ({ page }) => {
  // Bug (ticket 04 review): the canvas, grown over the viewport during the drag, kept the
  // viewport's size after the drop while nothing redrew the stage (pointer resting on the
  // Bandeja), so the burger was drawn huge over the Bandeja and under the footer.
  const palco = verIngredientes(page).locator('.stage');
  const canvas = verIngredientes(page).locator('canvas');
  const inicio = centre(await settledBox(camada(page, 'Tomate')));
  await page.mouse.move(inicio.x, inicio.y);
  await page.mouse.down();
  const alvo = centre(await bandeja(page).boundingBox());
  await page.mouse.move(alvo.x, alvo.y, { steps: 12 });
  await page.mouse.up();
  await expect(retirado(page, 'Tomate')).toBeVisible();

  await settledBox(camada(page, 'Alface'));
  const esperado = await palco.boundingBox();
  await expect
    .poll(async () => {
      const box = await canvas.boundingBox();
      return Math.max(...['x', 'y', 'width', 'height'].map((k) => Math.abs(box[k] - esperado[k])));
    })
    .toBeLessThan(1);
});

test('soltar fora da bandeja devolve a camada ao seu lugar', async ({ page }) => {
  const antes = await settledBox(camada(page, 'Alface'));
  const inicio = centre(antes);
  await page.mouse.move(inicio.x, inicio.y);
  await page.mouse.down();
  await page.mouse.move(inicio.x - 60, inicio.y + 120, { steps: 10 });
  // The centre follows the pointer; the top barely moves, the held Camada leaning towards the camera grows its box upwards.
  await expect.poll(async () => centre(await camada(page, 'Alface').boundingBox()).y).toBeGreaterThan(inicio.y + 60);
  await page.mouse.up();

  await expect
    .poll(async () => {
      const box = await camada(page, 'Alface').boundingBox();
      return Math.max(Math.abs(box.x - antes.x), Math.abs(box.y - antes.y));
    })
    .toBeLessThan(2);
  await expect(chip(page, 'Retirar', 'Alface')).toBeVisible();
});

test('a Base não pode ser arrastada', async ({ page }) => {
  const antes = await settledBox(camada(page, 'Pão superior'));
  const inicio = centre(antes);
  const alvo = centre(await bandeja(page).boundingBox());
  await page.mouse.move(inicio.x, inicio.y);
  await page.mouse.down();
  await page.mouse.move(alvo.x, alvo.y, { steps: 10 });
  await page.waitForTimeout(200);
  // It stays in place; the pointer crossing the stage only tilts the burger (under a pixel).
  const depois = await camada(page, 'Pão superior').boundingBox();
  expect(Math.max(Math.abs(depois.x - antes.x), Math.abs(depois.y - antes.y))).toBeLessThan(2);
  await page.mouse.up();
  await expect(verIngredientes(page).getByText('Whopper® · Todos os ingredientes')).toBeVisible();
});
