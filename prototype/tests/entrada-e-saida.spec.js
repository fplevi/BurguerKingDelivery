import { test, expect } from '@playwright/test';
import { card } from './support.js';

// Entrada e Saída do hambúrguer no hero (ticket 15). Observed through the hero's Camada
// buttons, which the scene places over each Camada on every frame.

/**
 * Records, on every animation frame from the hero's first 3D frame, the vertical centre (px) of each
 * hero Camada button, and the horizontal centre of the top bun's:
 * window.posicoes = [{ t, camadas: { id: y }, xTopo }], only frames with buttons; and every
 * hero title shown, in window.titulos.
 */
async function gravarPosicoes(page) {
  await page.addInitScript(() => {
    window.posicoes = [];
    window.titulos = new Set();
    const amostrar = (t) => {
      requestAnimationFrame(amostrar);
      window.titulos.add(document.querySelector('h1')?.textContent);
      // Only frames the scene has drawn (before that, the buttons sit where the stylesheet puts them).
      if (!performance.getEntriesByName('burger-scene:first-frame:assembled').length) return;
      const camadas = {};
      let xTopo = null;
      for (const b of document.querySelectorAll('#hero-burger .layer')) {
        const r = b.getBoundingClientRect();
        if (r.height) camadas[b.dataset.id] = r.top + r.height / 2;
        if (b.dataset.id === 'top') xTopo = r.left + r.width / 2;
      }
      if (Object.keys(camadas).length) window.posicoes.push({ t, camadas, xTopo });
    };
    requestAnimationFrame(amostrar);
  });
}

/** Waits until the hero has kept still for half a second, and returns the samples so far. */
async function aposAssentar(page) {
  await page.waitForFunction(() => {
    const p = window.posicoes;
    if (p.length < 2) return false;
    const ultima = p.at(-1);
    const parada = (a) => Object.keys(ultima.camadas).every((id) => Math.abs(a.camadas[id] - ultima.camadas[id]) < 0.5);
    const meioSegundoAntes = p.findLast((a) => a.t <= ultima.t - 500);
    return !!meioSegundoAntes && p.filter((a) => a.t >= meioSegundoAntes.t).every(parada);
  });
  return page.evaluate(() => window.posicoes);
}

/** First time (ms) each Camada reached, and stayed within 1 px of, its final position. */
function chegada(posicoes, id) {
  const final = posicoes.at(-1).camadas[id];
  let desde = null;
  for (const { t, camadas } of posicoes) {
    if (Math.abs(camadas[id] - final) <= 1) desde ??= t;
    else desde = null;
  }
  return desde;
}

test('ao abrir a página, as Camadas caem e se empilham de baixo para cima', async ({ page }) => {
  await gravarPosicoes(page);
  await page.goto('/');
  const posicoes = await aposAssentar(page);

  const primeira = posicoes[0].camadas, final = posicoes.at(-1).camadas;
  // The top bun starts far above where it rests, out of its place in the stack.
  expect(final.top - primeira.top).toBeGreaterThan(100);
  // Bottom to top: the bottom bun lands before the meat, and the meat before the top bun.
  expect(chegada(posicoes, 'bottom')).toBeLessThan(chegada(posicoes, 'meat'));
  expect(chegada(posicoes, 'meat')).toBeLessThan(chegada(posicoes, 'top'));
  // And it all takes about a second, not more.
  expect(chegada(posicoes, 'top') - posicoes[0].t).toBeLessThan(1500);
});

test('uma tecla durante a Entrada mostra o hambúrguer montado na hora', async ({ page }) => {
  await gravarPosicoes(page);
  await page.goto('/');
  // As soon as the Entrada is drawn, before the top bun lands.
  await page.waitForFunction(() => window.posicoes.length > 0);
  await page.keyboard.press('Shift');
  const t = await page.evaluate(() => performance.now());
  const posicoes = await aposAssentar(page);

  // Everything rests within a couple of frames of the key, long before the ~1 s Entrada would end.
  expect(chegada(posicoes, 'top') - t).toBeLessThan(100);
});

test('ao voltar de Bebidas para Hambúrgueres, o hambúrguer faz a Entrada de novo', async ({ page }) => {
  await gravarPosicoes(page);
  await page.goto('/');
  await aposAssentar(page);
  const categorias = page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
  await categorias.getByRole('link', { name: 'Bebidas' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Coca-Cola Original');
  await page.evaluate(() => (window.posicoes = []));
  await categorias.getByRole('link', { name: 'Hambúrgueres' }).click();
  const posicoes = await aposAssentar(page);

  // (The buttons keep their old place until the scene draws again: look for the highest point.)
  const maisAlto = Math.min(...posicoes.map((a) => a.camadas.top));
  expect(posicoes.at(-1).camadas.top - maisAlto).toBeGreaterThan(100);
});

test('no desktop, o hambúrguer só inclina com o ponteiro depois da Entrada', async ({ page, isMobile }) => {
  test.skip(isMobile, 'inclinação pelo ponteiro só no desktop');
  await gravarPosicoes(page);
  await page.goto('/');
  await page.waitForFunction(() => window.posicoes.length > 0);
  // The pointer sweeps over the right edge of the stage while the Camadas fall.
  const palco = await page.locator('main #hero-stage').boundingBox();
  for (let i = 0; i < 8; i++) await page.mouse.move(palco.x + palco.width - 5, palco.y + palco.height * (0.2 + i * 0.1));
  const posicoes = await aposAssentar(page);

  const xs = posicoes.filter((a) => a.t < chegada(posicoes, 'top')).map((a) => a.xTopo);
  expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(1);
  // Afterwards, it leans with the pointer as before.
  await page.mouse.move(palco.x + palco.width - 4, palco.y + palco.height / 2);
  await expect.poll(() => page.evaluate(() => window.posicoes.at(-1).xTopo)).not.toBeCloseTo(xs[0], 0);
});

/** Time (ms) of the first sample showing the Camada `id`, after `desde`. */
const primeiraCom = (posicoes, id, desde = 0) => posicoes.find((a) => a.t >= desde && id in a.camadas)?.t;

test('ao trocar de hambúrguer, o atual faz a Saída antes de o novo fazer a Entrada', async ({ page }) => {
  await gravarPosicoes(page);
  await page.goto('/');
  await aposAssentar(page);
  await card(page, 'Cheddar Duplo').click();
  const clique = await page.evaluate(() => performance.now());
  await page.waitForFunction(() => window.posicoes.some((a) => 'crispyOnion' in a.camadas));
  const posicoes = await aposAssentar(page);

  // The Whopper stays on the stage for the Saída (~250 ms), then the Cheddar Duplo comes in.
  const cheddar = primeiraCom(posicoes, 'crispyOnion', clique);
  expect(cheddar - clique).toBeGreaterThan(200);
  const durante = posicoes.filter((a) => a.t > clique && a.t < cheddar);
  expect(durante.every((a) => 'lettuce' in a.camadas)).toBe(true);
  // ... with its own Entrada.
  const depois = posicoes.filter((a) => a.t >= cheddar);
  expect(depois.at(-1).camadas.top - Math.min(...depois.map((a) => a.camadas.top))).toBeGreaterThan(100);
});

test('dois cliques rápidos: vale o último, sem passar pelo outro hambúrguer', async ({ page }) => {
  await gravarPosicoes(page);
  await page.goto('/');
  await aposAssentar(page);
  await page.evaluate(() => (window.posicoes = []));
  await card(page, 'Cheddar Duplo').click();
  await card(page, 'Whopper®').click();
  const titulos = () => page.evaluate(() => [...window.titulos]);
  await page.waitForTimeout(600); // past the Saída
  const posicoes = await aposAssentar(page);

  expect(posicoes.some((a) => 'crispyOnion' in a.camadas)).toBe(false);
  expect((await titulos()).some((t) => /Cheddar/.test(t))).toBe(false);
  await expect(card(page, 'Whopper®')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Whopper®');
  // The Whopper comes back with an Entrada.
  expect(posicoes.at(-1).camadas.top - Math.min(...posicoes.map((a) => a.camadas.top))).toBeGreaterThan(100);
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('não há Entrada nem Saída: o hambúrguer aparece montado e a troca é na hora', async ({ page }) => {
    await gravarPosicoes(page);
    await page.goto('/');
    const posicoes = await aposAssentar(page);
    expect(posicoes.every((a) => Math.abs(a.camadas.top - posicoes.at(-1).camadas.top) < 1)).toBe(true);

    await card(page, 'Cheddar Duplo').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Cheddar Duplo', { timeout: 100 });
  });
});
