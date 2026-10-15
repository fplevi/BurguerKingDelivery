// Ticket 04 visual evidence. Run against a local Vite server; no pixel snapshots.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { irAosEnderecos, paginaDeEndereco, menuDoEndereco, buscarEndereco, resultadosDaBusca } from '../tests/support.js';

const output = new URL('../../.scratch/revisao-interfaces/evidencias/endereco/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ baseURL: process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:5173', reducedMotion: 'reduce' });
const page = await context.newPage();
const results = [];
let width;
async function capture(state) {
  await expect(paginaDeEndereco(page)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const measure = await page.evaluate(() => {
    const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const rect = el => el && ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height });
    const menu = document.querySelector('#address-menu');
    const toast = document.querySelector('#toast');
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
      body: getComputedStyle(document.body).backgroundColor,
      header: getComputedStyle(document.querySelector('header')).backgroundColor,
      back: [...document.querySelectorAll('#address-page > button')].filter(visible).map(el => el.textContent.trim()),
      icons: [...document.querySelectorAll('#address-content svg.icon')].filter(visible).map(el => rect(el)),
      menu: menu && { ...rect(menu), modal: menu.matches(':modal'), anchor: rect(document.querySelector('#address-more-' + menu.dataset.for)) },
      confirmationModal: document.querySelector('#address-confirmation')?.matches(':modal') ?? false,
      toast: visible(toast) ? rect(toast) : null,
      action: rect(document.querySelector('#address-content > .address-flow .address-action')),
    };
  });
  expect(measure.overflow, `${width} ${state}: overflow`).toBe(0);
  expect(measure.back, `${width} ${state}: único retorno`).toEqual(['Voltar']);
  expect(measure.body).toBe('rgb(245, 235, 220)');
  expect(measure.header).toBe('rgb(250, 242, 229)');
  for (const icon of measure.icons) expect([16, 24]).toContain(icon.width);
  if (measure.menu) {
    expect(measure.menu.modal).toBe(width < 1024);
    if (width >= 1024) expect(Math.abs(measure.menu.y - measure.menu.anchor.y - measure.menu.anchor.height)).toBeLessThanOrEqual(8);
  }
  if (measure.toast && width < 1024 && measure.action) expect(measure.toast.y + measure.toast.height).toBeLessThan(measure.action.y);
  if ([320, 390, 768, 1280, 1920].includes(width)) await page.screenshot({ path: new URL(`${width}-${state}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
  results.push({ width, state, ...measure });
}
try {
  for (width of [320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921]) {
    await page.setViewportSize({ width, height: 844 });
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await irAosEnderecos(page);
    await capture('lista-checkout');
    await menuDoEndereco(page, 'Trabalho').click();
    await capture('menu');
    await page.keyboard.press('Escape');
    await menuDoEndereco(page, 'Trabalho').click();
    await page.getByRole('dialog', { name: 'Opções do endereço' }).getByRole('button', { name: 'Editar endereço' }).click();
    await capture('editar');
    await paginaDeEndereco(page).getByRole('textbox', { name: 'Número', exact: true }).fill('');
    await paginaDeEndereco(page).getByRole('button', { name: 'Salvar alterações' }).click();
    await capture('validacao');
    await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await menuDoEndereco(page, 'Trabalho').click();
    await page.getByRole('dialog', { name: 'Opções do endereço' }).getByRole('button', { name: 'Remover endereço' }).click();
    await capture('remover');
    await paginaDeEndereco(page).getByRole('button', { name: 'Remover endereço', exact: true }).click();
    await expect(page).toHaveURL(/#endereco$/);
    await capture('toast-removido');
    await paginaDeEndereco(page).getByRole('button', { name: 'Endereços de pedidos anteriores' }).click();
    await capture('anteriores');
    await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await buscarEndereco(page, 'xyz');
    await capture('sem-resultados');
    await paginaDeEndereco(page).getByRole('searchbox').fill('paulista');
    await capture('busca');
    await resultadosDaBusca(page).first().click();
    await capture('mapa');
    await paginaDeEndereco(page).getByRole('button', { name: 'Confirmar localização' }).click();
    await capture('dados');
    await paginaDeEndereco(page).getByRole('button', { name: 'Salvar endereço', exact: true }).click();
    await expect(page).toHaveURL(/#endereco$/);
    await capture('toast-salvo');
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Informar endereço de entrega' }).click();
    await capture('lista-visitante');
    await buscarEndereco(page, 'estrada do campo');
    await resultadosDaBusca(page).first().click();
    await capture('fora-regiao');
    await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await paginaDeEndereco(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await paginaDeEndereco(page).getByRole('button', { name: 'Usar localização atual' }).click();
    await expect(paginaDeEndereco(page).getByRole('heading', { name: 'Não conseguimos acessar sua localização' })).toBeVisible();
    await capture('localizacao-indisponivel');
  }
} finally {
  await writeFile(new URL('medidas.json', output), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(`${results.length} estados/larguras verificados.`);
