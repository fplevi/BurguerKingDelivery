// Ticket 05: public cart flow, geometry and screenshots at responsive boundaries.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { openVerIngredientes, verIngredientes, chip, irAoPagamento, gerarPix } from '../tests/support.js';
const output = new URL('../../.scratch/revisao-interfaces/evidencias/carrinho/', import.meta.url);
await mkdir(output, { recursive: true });
// Cart assets are product photos; keep the unrelated 3D hero out of this collection.
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ baseURL: process.env.BK_REVIEW_URL ?? 'http://127.0.0.1:5173', reducedMotion: 'reduce' });
await page.addInitScript(() => {
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    return /webgl/i.test(type) ? null : getContext.call(this, type, ...args);
  };
});
const results = [];
let width;
const cart = page.locator('#cart-page');
const item = cart.locator('.cart-item').first();
async function capture(state) {
  await expect(cart).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'carrinho');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const measure = await page.evaluate(() => {
    const rect = el => { const r = el?.getBoundingClientRect(); return r && { x:r.x, y:r.y, width:r.width, height:r.height }; };
    const visible = el => el && el.getClientRects().length;
    const notice = document.querySelector('.cart-removal-toast');
    const bar = document.querySelector('.cart-bar');
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      body: getComputedStyle(document.body).backgroundColor,
      header: getComputedStyle(document.querySelector('header')).backgroundColor,
      fonts: [...document.fonts].map(f => ({family:f.family,status:f.status})),
      back: document.querySelector('#cart-back').textContent,
      notice: visible(notice) ? rect(notice) : null,
      bar: visible(bar) ? rect(bar) : null,
      controls: [...document.querySelectorAll('.cart-controls > div')].map(el => ({...rect(el), scroll:el.scrollWidth, client:el.clientWidth})),
    };
  });
  expect(measure.overflow, `${width} ${state}`).toBe(0);
  expect(measure.body).toBe('rgb(245, 235, 220)');
  expect(measure.header).toBe('rgb(250, 242, 229)');
  expect(measure.back).toBe('Voltar');
  for (const control of measure.controls) expect(control.scroll).toBeLessThanOrEqual(control.client);
  if(measure.notice && measure.bar) expect(measure.notice.y + measure.notice.height).toBeLessThan(measure.bar.y);
  if ([320,390,768,1024,1280,1920].includes(width)) await page.screenshot({path:new URL(`${width}-${state}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  results.push({width,state,...measure});
}
try {
  for (width of [320,358,359,360,361,390,768,1023,1024,1025,1280,1919,1920,1921]) {
    await page.setViewportSize({width,height:844});
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await openVerIngredientes(page);
    await chip(page, 'Retirar', 'Cebola').click();
    await verIngredientes(page).getByRole('button', {name:'Aplicar alterações'}).click();
    await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
    await page.getByRole('button',{name:'Carrinho · 1',exact:true}).click();
    await capture('sem-combo');
    await item.getByRole('checkbox').check();
    await capture('combo');
    await cart.getByRole('button',{name:'Continuar',exact:true}).filter({visible:true}).first().click();
    await expect(item.getByText('Escolha a bebida do combo',{exact:true})).toBeVisible();
    await capture('erro');
    await item.getByRole('combobox').click();
    await capture('lista');
    await item.getByRole('option',{name:'Sprite',exact:true}).click();
    await item.getByRole('button',{name:'Aumentar quantidade'}).click();
    await capture('quantidade');
    await item.getByRole('button',{name:'Remover',exact:true}).click();
    await capture('vazio-removido');
    await cart.getByRole('button',{name:'Desfazer'}).click();
    await capture('desfeito');
    for (let n = 2; n < 99; n++) await item.getByRole('button',{name:'Aumentar quantidade'}).click();
    await capture('quantidade-99');
    // Two distinct Items leave the fixed mobile bar visible during removal.
    await cart.getByRole('button',{name:'Voltar',exact:true}).click();
    await page.getByRole('checkbox',{name:'Transformar em combo'}).check();
    await page.getByRole('combobox').selectOption('Coca-Cola');
    await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
    await page.getByRole('button',{name:/^Carrinho · /}).click();
    await item.getByRole('button',{name:'Remover',exact:true}).click();
    await capture('removido-com-barra');
    await cart.getByRole('button',{name:'Desfazer'}).click();
    await cart.getByRole('button',{name:'Voltar',exact:true}).click();
    await page.getByRole('banner').getByRole('link',{name:'Acompanhamentos'}).click();
    await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
    await page.getByRole('button',{name:/^Carrinho · /}).click();
    await capture('acompanhamento');
    await cart.locator('.cart-item').last().getByRole('button',{name:'Remover',exact:true}).click();
    await capture('removido-total-alto');
    await page.evaluate(() => sessionStorage.clear());
    await irAoPagamento(page, '61900000000');
    await gerarPix(page);
    await page.getByRole('button',{name:/^Carrinho · /}).click();
    await capture('travado');
  }
  await writeFile(new URL('medidas.json',output),JSON.stringify(results,null,2));
  console.log(`${results.length} combinações aprovadas`);
} finally { await browser.close(); }
