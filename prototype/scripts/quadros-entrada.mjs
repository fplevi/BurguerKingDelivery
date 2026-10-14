// Quadros da Entrada e da Saída (ticket 15), para a revisão visual de um hambúrguer.
//
//   npm run quadros-entrada -- [produto] [pasta]      // produto: id da Receita (padrão whopper)
//
// Precisa do servidor de desenvolvimento em http://localhost:5173 (npm run dev); mude com
// QUADROS_URL. Grava em [pasta] (padrão ../.scratch/hamburguer-3d/capturas/quadros-<produto>/)
// um PNG por momento da Entrada, um da Saída (trocando para outro hambúrguer) e a folha
// `entrada.png` com todos lado a lado.
//
// Por que um relógio manual: a animação anda por performance.now() e requestAnimationFrame,
// e um print leva mais que um quadro, então prints em tempo real pulam o começo da queda. O
// relógio falso do Playwright (page.clock) não controla performance.now() aqui, e o painel do
// navegador do app não desenha quadros com a janela em segundo plano. Este script congela o
// tempo da página e o avança em passos de 20 ms entre os prints.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const produto = process.argv[2] ?? 'whopper';
const pasta = resolve(process.argv[3] ?? `../.scratch/hamburguer-3d/capturas/quadros-${produto}`);
const url = process.env.QUADROS_URL ?? 'http://localhost:5173/';
const MOMENTOS = [0, 120, 200, 300, 450, 600, 800, 1000, 1400]; // ms desde o primeiro quadro da Entrada
const PASSO = 20;

mkdirSync(pasta, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript(() => {
  let agora = 0, fila = [];
  performance.now = () => agora;
  window.requestAnimationFrame = (cb) => (fila.push(cb), fila.length);
  window.avancar = (ms) => {
    agora += ms;
    const cbs = fila;
    fila = [];
    cbs.forEach((cb) => cb(agora));
  };
});
const marcas = (nome) => page.evaluate((n) => performance.getEntriesByName(n).length, nome);
/** Avança o relógio até a marca `nome` passar de `antes` (as esperas reais, como a compilação, seguem). */
async function ate(nome, antes) {
  for (let i = 0; (await marcas(nome)) <= antes; i++) {
    if (i > 2000) throw new Error(`a marca ${nome} não chegou`);
    await page.evaluate((ms) => avancar(ms), PASSO);
    await page.waitForTimeout(5);
  }
}
const palco = page.locator('#hero-stage');
const quadro = 'burger-scene:first-frame:assembled';

await page.goto(url);
await ate(quadro, 0);
if (produto !== 'whopper') {
  // A Entrada do Whopper termina; troca, e a Entrada capturada é a do produto.
  await ate('burger-scene:entrance-end:assembled', 0);
  const card = page.locator(`button.card[data-product="${produto}"]`);
  if (!(await card.count())) throw new Error(`não há card para a Receita "${produto}"`);
  await card.click();
  await ate(quadro, 1);
}

const arquivos = [];
let t = 0;
for (const ms of MOMENTOS) {
  for (; t < ms; t += PASSO) await page.evaluate((p) => avancar(p), PASSO);
  const arquivo = `${pasta}/entrada-${String(ms).padStart(4, '0')}ms.png`;
  await palco.screenshot({ path: arquivo });
  arquivos.push([ms, arquivo]);
}

// Saída: troca para outro hambúrguer e captura perto do fim dela (200 ms de 250: ela acelera).
const outro = page.locator(`button.card[data-product]:not([data-product="${produto}"])`).first();
await outro.click();
for (let ms = 0; ms < 200; ms += PASSO) await page.evaluate((p) => avancar(p), PASSO);
await palco.screenshot({ path: `${pasta}/saida-0200ms.png` });

// Folha com a Entrada, os momentos escritos em cada quadro.
await page.setContent('<body style="margin:0;background:#fff;display:flex;flex-wrap:wrap;gap:8px;width:1600px"></body>');
for (const [ms, arquivo] of arquivos) {
  const png = readFileSync(arquivo).toString('base64');
  await page.evaluate(
    ([ms, png]) =>
      document.body.insertAdjacentHTML(
        'beforeend',
        `<figure style="margin:0;position:relative"><img src="data:image/png;base64,${png}" style="height:220px;display:block"><figcaption style="position:absolute;top:4px;left:6px;font:12px sans-serif">${ms} ms</figcaption></figure>`,
      ),
    [ms, png],
  );
}
await page.screenshot({ path: `${pasta}/entrada.png`, fullPage: true });
await browser.close();
console.log(`Quadros em ${pasta}`);
