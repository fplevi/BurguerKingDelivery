import { test, expect } from '@playwright/test';
import { openAlterarIngredientes, camada, chip } from './support.js';

const heroStage = (page) => page.locator('main #hero-stage');
/** Camada of the assembled hero burger (a disabled button labelled "Retirar X"). */
const heroCamada = (page, name) => page.getByRole('main').getByRole('button', { name: `Retirar ${name}`, exact: true });

/** Box of a Camada once it stops moving (two equal readings in a row). */
async function settled(locator) {
  let last = null;
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      const same = last && Math.abs(box.x - last.x) < 0.3 && Math.abs(box.y - last.y) < 0.3 && Math.abs(box.height - last.height) < 0.3;
      last = box;
      return same;
    })
    .toBe(true);
  return last;
}
const differs = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.height - b.height));

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(heroStage(page).locator('canvas')).toBeVisible();
});

test('no desktop, o hambúrguer inclina seguindo o ponteiro e volta ao centro', async ({ page, isMobile }) => {
  test.skip(isMobile, 'ponteiro de mouse');
  const topo = heroCamada(page, 'Pão superior');
  const centro = await settled(topo);
  const palco = await heroStage(page).boundingBox();

  await page.mouse.move(palco.x + palco.width - 4, palco.y + palco.height - 4, { steps: 4 });
  const direita = await settled(topo);
  expect(differs(direita, centro)).toBeGreaterThan(4);

  await page.mouse.move(palco.x + 4, palco.y + 4, { steps: 4 });
  const esquerda = await settled(topo);
  expect(differs(esquerda, direita)).toBeGreaterThan(4);

  // Leaving the stage eases it back to the centre.
  await page.mouse.move(palco.x + palco.width / 2, palco.y - 60, { steps: 4 });
  expect(differs(await settled(topo), centro)).toBeLessThan(1);
});

test('no toque, arrastar na área vazia do palco inclina, sem pedir permissão de movimento', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'toque');
  test.setTimeout(60_000); // each synthetic touch waits for a frame; slow with software WebGL
  const pedidos = await page.evaluate(() => {
    window.__pedidos = 0;
    for (const E of [window.DeviceOrientationEvent, window.DeviceMotionEvent]) {
      if (E) E.requestPermission = () => (window.__pedidos++, Promise.resolve('denied'));
    }
  });
  const topo = heroCamada(page, 'Pão superior');
  const centro = await settled(topo);
  const palco = await heroStage(page).boundingBox();
  const cdp = await page.context().newCDPSession(page);
  const toque = (type, x) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: palco.y + 12 }] });

  // Near the top edge of the stage, outside the burger: empty area.
  await toque('touchStart', palco.x + 20);
  for (let x = 50; x <= 140; x += 30) await toque('touchMove', palco.x + x);
  // Poll for the effect itself: frames are slow here, so "two equal readings" can come early.
  // A roll around the burger's middle moves the top bun's box only a few px (still 0 untilted).
  await expect.poll(async () => differs(await topo.boundingBox(), centro)).toBeGreaterThan(2);
  await toque('touchEnd');
  await expect.poll(async () => differs(await topo.boundingBox(), centro)).toBeLessThan(1);
  expect(await page.evaluate(() => window.__pedidos)).toBe(0);
  expect(pedidos).toBeUndefined();
});

test('em Alterar ingredientes os botões seguem as camadas inclinadas e o toque continua retirando', async ({ page, isMobile }) => {
  test.skip(isMobile, 'ponteiro de mouse');
  await openAlterarIngredientes(page);
  const palco = await page.locator('#pg-stage').boundingBox();
  await page.mouse.move(palco.x + palco.width - 4, palco.y + 4, { steps: 4 });
  await settled(camada(page, 'Pão superior'));
  for (const nome of ['Queijo', 'Alface']) {
    await camada(page, nome).click();
    await expect(chip(page, 'Recolocar', nome)).toBeVisible();
  }
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('o hambúrguer não inclina', async ({ page, isMobile }) => {
    test.skip(isMobile, 'ponteiro de mouse');
    const topo = heroCamada(page, 'Pão superior');
    await expect(topo).toBeVisible(); // placed by the scene's first frame
    const antes = await topo.boundingBox();
    const palco = await heroStage(page).boundingBox();
    await page.mouse.move(palco.x + palco.width - 4, palco.y + palco.height - 4, { steps: 4 });
    await page.waitForTimeout(500);
    expect(await topo.boundingBox()).toEqual(antes);
  });
});
