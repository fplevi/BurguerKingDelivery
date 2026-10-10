// Budget (ticket 11): measured, not estimated. Runs only with `npm run test:orcamento`: against
// the production bundle, one test at a time (parallel workers spoil the numbers).
//
// "Celular intermediário" follows Lighthouse's mobile profile: 4x CPU slowdown and slow 4G
// (150 ms RTT, 1.6 Mbps down, 750 kbps up). The GPU is the test machine's own: real fps on a
// phone still needs a physical device.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { openAlterarIngredientes, alterarIngredientes, camada, bandeja } from './support.js';

const softwareGl = !!process.env.PW_EXECUTABLE;

// META is the target of ticket 11. LIMITE is what these tests enforce: the exceptions the product
// owner accepted on 2026-10-09 (first frame 2.2-2.5 s, fps varying 38-60 desktop and 28-57 on the
// 4x CPU), with a margin for this machine's noise. Red means a regression, not the known gap.
// Tighten LIMITE towards META once measured on a physical phone.
const META = { primeiroQuadroMs: 1500, fpsDesktop: 55, fpsCelular: 30 };
const LIMITE = { kbGzip: 250, primeiroQuadroMs: 3000, fpsDesktop: 35, fpsCelular: 25 };

/** Throttles the page like a mid-range phone; `network: false` keeps only the CPU slowdown. */
async function celularIntermediario(page, { network = true } = {}) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  if (network) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
  }
  return cdp;
}

/** Mean frames per second while `action` runs, read from the page's own animation frames. */
async function fpsDurante(page, action) {
  await page.evaluate(() => {
    window.__quadros = [];
    const contar = (t) => {
      if (!window.__quadros) return;
      window.__quadros.push(t);
      requestAnimationFrame(contar);
    };
    requestAnimationFrame(contar);
  });
  await action();
  const quadros = await page.evaluate(() => {
    const q = window.__quadros;
    window.__quadros = null;
    return q;
  });
  const intervalos = quadros.slice(1).map((t, i) => t - quadros[i]).sort((a, b) => a - b);
  const fps = ((quadros.length - 1) / (quadros.at(-1) - quadros[0])) * 1000;
  const p95 = intervalos[Math.floor(intervalos.length * 0.95)];
  return { fps: Math.round(fps), p95: Math.round(p95), quadros: quadros.length };
}

const registrar = (nome, valor) => {
  test.info().annotations.push({ type: nome, description: JSON.stringify(valor) });
  console.log(`[orçamento] ${test.info().project.name} ${nome}: ${JSON.stringify(valor)}`);
};

// The 3D part: the burger-3d chunk (Three.js + src/scene, see vite.config.js) and the texture worker.
test('a parte 3D, Three.js incluído, pesa no máximo 250 KB gzip', async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'o build é o mesmo nos dois projetos');
  const pasta = new URL('../dist/assets/', import.meta.url);
  const arquivos = readdirSync(pasta).filter((f) => /^(burger-3d|texture-worker)-.*\.js$/.test(f));
  expect(arquivos, 'chunk burger-3d e worker de texturas no build').toHaveLength(2);
  const kb = arquivos.reduce((total, f) => total + gzipSync(readFileSync(new URL(f, pasta)), { level: 9 }).length, 0) / 1024;
  registrar('peso-3d-kb-gzip', Math.round(kb * 10) / 10);
  expect(kb).toBeLessThanOrEqual(LIMITE.kbGzip);
});

/** Milliseconds from navigation to the hero's first 3D frame. */
async function primeiroQuadro(page) {
  await page.goto('/');
  await page.waitForFunction(() => performance.getEntriesByName('burger-scene:first-frame:assembled').length);
  return page.evaluate(() => Math.round(performance.getEntriesByName('burger-scene:first-frame:assembled')[0].startTime));
}

// Decision on ticket 11: the 1.5 s limit is checked on the phone's CPU (4x) with the code
// already downloaded; the slow 4G download alone takes over 1 s, so it is only reported.
test('o primeiro quadro do hambúrguer não passa do limite aceito na CPU de um celular intermediário', async ({ page }, info) => {
  test.skip(softwareGl, 'WebGL por software não representa um celular');
  test.skip(info.project.name !== 'mobile-390', 'perfil de celular');
  test.setTimeout(180_000);
  await celularIntermediario(page, { network: false });
  // Median of 7 loads after a warm-up one: a single load on a busy machine varies by seconds.
  await primeiroQuadro(page);
  const medidas = [];
  for (let i = 0; i < 7; i++) medidas.push(await primeiroQuadro(page));
  const mediana = [...medidas].sort((a, b) => a - b)[3];
  registrar('primeiro-quadro-ms', { mediana, medidas });
  expect(mediana, `meta ${META.primeiroQuadroMs} ms (exceção aceita)`).toBeLessThanOrEqual(LIMITE.primeiroQuadroMs);
});

test('primeiro quadro com 4G lento (informativo, sem limite)', async ({ browser }, info) => {
  test.skip(softwareGl, 'WebGL por software não representa um celular');
  test.skip(info.project.name !== 'mobile-390', 'perfil de celular');
  // A fresh context: nothing cached from other tests.
  const context = await browser.newContext(info.project.use);
  const page = await context.newPage();
  await celularIntermediario(page);
  registrar('primeiro-quadro-4g-lento-ms', await primeiroQuadro(page));
  await context.close();
});

test.describe('quadros por segundo', () => {
  test.skip(softwareGl, 'WebGL por software não representa o aparelho');

  const limite = (info) => (info.project.name === 'desktop' ? LIMITE.fpsDesktop : LIMITE.fpsCelular);
  const meta = (info) => (info.project.name === 'desktop' ? META.fpsDesktop : META.fpsCelular);

  test.beforeEach(async ({ page }, info) => {
    await page.goto('/');
    // Both scenes built and their shaders compiled, as when the customer starts interacting.
    await page.waitForFunction(() =>
      ['assembled', 'open'].every((fit) => performance.getEntriesByName(`burger-scene:ready:${fit}`).length),
    );
    if (info.project.name === 'mobile-390') await celularIntermediario(page, { network: false });
  });

  test('ao abrir Alterar ingredientes', async ({ page }, info) => {
    const medida = await fpsDurante(page, async () => {
      await openAlterarIngredientes(page);
      await page.waitForTimeout(900); // the opening transition lasts 650 ms
    });
    registrar('fps-abrir', medida);
    expect(medida.fps, `meta ${meta(info)} fps (exceção aceita)`).toBeGreaterThanOrEqual(limite(info));
  });

  test('ao arrastar um ingrediente até a bandeja', async ({ page }, info) => {
    await openAlterarIngredientes(page);
    await page.waitForTimeout(900);
    const medida = await fpsDurante(page, async () => {
      await camada(page, 'Tomate').hover();
      await page.mouse.down();
      const alvo = await bandeja(page).boundingBox();
      await page.mouse.move(alvo.x + alvo.width / 2, alvo.y + alvo.height / 2, { steps: 40 });
      await page.mouse.up();
    });
    registrar('fps-arrastar', medida);
    await expect(alterarIngredientes(page)).toBeVisible();
    expect(medida.fps, `meta ${meta(info)} fps (exceção aceita)`).toBeGreaterThanOrEqual(limite(info));
  });

  test('ao inclinar o hambúrguer', async ({ page }, info) => {
    const palco = await page.locator('#hero-stage').boundingBox();
    const medida = await fpsDurante(page, async () => {
      await page.mouse.move(palco.x + 5, palco.y + 5);
      await page.mouse.move(palco.x + palco.width - 5, palco.y + palco.height - 5, { steps: 40 });
      await page.waitForTimeout(400); // the tilt eases in
    });
    registrar('fps-inclinar', medida);
    expect(medida.fps, `meta ${meta(info)} fps (exceção aceita)`).toBeGreaterThanOrEqual(limite(info));
  });
});
