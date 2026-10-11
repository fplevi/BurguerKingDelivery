import { recipes, layer, description, removedLine } from './ingredients.js';
import { art } from './art.js';
import { initial, reducer, money, marks, drinks, pick, itemTotal, itemName, cartUnits, cartTotal } from './state.js';
import { progress, orderSummary, identificationStep, sentTo } from './checkout.js';
import { categories, products } from './products.js';
import { createBurgerScene } from './scene/burger-scene.js';
import whopperPhoto from '../Assets/burgers/official/site_Whopper.png';
import cheddarDuploPhoto from '../Assets/burgers/official/site_Cheddar_Duplo.png';
import stackerDuploPhoto from '../Assets/burgers/official/site_Stacker_Duplo.png';
import rodeioDuploPhoto from '../Assets/burgers/official/site_Rodeio_Duplo.png';
import bigKingPhoto from '../Assets/burgers/official/site_Big_King.png';
import cheeseburgerDuploPhoto from '../Assets/burgers/official/site_Cheeseburger_Duplo.png';
import cheeseburgerPhoto from '../Assets/burgers/official/site_Cheeseburger.png';
import rodeioPhoto from '../Assets/burgers/official/site_Rodeio.png';
// Prototype question: can layered ingredients support opening, removal, restoration and order customization?

let state = initial;
const $ = (id) => document.getElementById(id);
/** Receita of the selected product, and the name of one of its Camadas. */
const recipe = () => recipes[state.product];
const name = (id, r = recipe()) => layer(r, id).name;
function dispatch(action) {
  state = reducer(state, action);
  render();
}

// Layer buttons: in 3D they are invisible hit areas placed over the scene; without WebGL
// they carry the SVG illustrations (fallback). Either way they hold labels, focus and gestures.
function buildBurger(el, interactive = false) {
  const { layers } = recipe();
  el.innerHTML = layers
    .map(
      (i, index) =>
        `<button class="layer" data-id="${i.id}" style="--y:${interactive ? 78 - index * (70 / (layers.length - 1)) + '%' : i.y + 'px'};--z:${i.z}" ${interactive && !i.locked ? '' : 'disabled'} aria-label="Retirar ${i.name}">${art(i.model)}</button>`,
    )
    .join('');
  if (interactive) el.querySelectorAll('.layer:not(:disabled)').forEach(bindLayer);
}

/** Moves each layer button over the area the scene reports for its Camada. */
function placeButtons(burger, areas) {
  burger.querySelectorAll('.layer').forEach((b) => {
    const area = areas[b.dataset.id];
    if (!area) return;
    Object.assign(b.style, {
      left: area.left + 'px',
      top: area.top + 'px',
      width: area.width + 'px',
      height: area.height + 'px',
    });
  });
}

// One scene per stage; null when WebGL is unavailable (SVG fallback).
let scenes = null;
// False once a stage could not get a WebGL context: from then on, SVG only.
let webgl = true;
function mountScenes() {
  let firstFrame = true;
  const hero = createBurgerScene($('hero-stage'), {
    recipe: recipe(),
    fit: 'assembled',
    onAreas: (a) => {
      placeButtons($('hero-burger'), a);
      // Budget (ticket 11): the Ver ingredientes scene is built only after the hero's
      // first frame, so it doesn't delay it; opening earlier builds it on the spot.
      if (firstFrame) (window.requestIdleCallback ?? setTimeout)(() => scenes?.editor);
      firstFrame = false;
    },
  });
  if (!hero) {
    webgl = false;
    return;
  }
  let editor = null;
  scenes = {
    hero,
    dispose() {
      hero.dispose();
      editor?.dispose();
    },
    get editor() {
      if (editor) return editor;
      // Half the tilt in Ver ingredientes, so the Camadas don't slide away from the cursor.
      editor = createBurgerScene($('pg-stage'), {
        recipe: recipe(),
        fit: 'open',
        tiltScale: 0.5,
        onAreas: (a) => placeButtons($('pg-burger'), a),
      });
      if (editor) return editor;
      // No second WebGL context: back to the SVG illustrations on both stages. The caller
      // gets an inert scene for this one call; the next render() takes the SVG path.
      hero.dispose();
      scenes = null;
      webgl = false;
      document.body.classList.remove('burger-3d');
      queueMicrotask(render);
      return new Proxy({}, { get: (_, key) => (key === 'show' ? () => Promise.resolve() : () => null) });
    },
  };
  document.body.classList.add('burger-3d');
}
// Product grid, with the official photos. Hambúrgueres: only products with a Receita can be
// chosen; the others look the same, but clicking them does nothing. Photo categories: all can.
const burgers = [
  { recipe: 'whopper', photo: whopperPhoto },
  { recipe: 'cheddarDuplo', photo: cheddarDuploPhoto },
  { name: 'Stacker Duplo Bacon', photo: stackerDuploPhoto },
  { name: 'Rodeio Duplo', photo: rodeioDuploPhoto },
  { name: 'Big King', photo: bigKingPhoto },
  { name: 'Cheeseburger Duplo', photo: cheeseburgerDuploPhoto },
  { name: 'Cheeseburger', photo: cheeseburgerPhoto },
  { name: 'Rodeio', photo: rodeioPhoto },
];
/** The photo's box in the 800 × 800 file, for .photo-crop: only it is drawn (the transparent margins are cut off, as in the Figma). */
const crop = ([x0, y0, x1, y1]) => `--x:${x0};--y:${y0};--w:${x1 - x0};--h:${y1 - y0}`;
const badge =
  '<span class="badge"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5z" fill="currentColor"/></svg>Selecionado</span>';
let gridCategory = null;
function buildGrid() {
  if (gridCategory === state.category) return;
  gridCategory = state.category;
  const category = categories[state.category];
  $('catalog-title').textContent = category?.heading ?? 'Escolha seu hambúrguer';
  $('catalog').scrollTop = 0;
  $('grid').dataset.category = state.category;
  $('grid').innerHTML = category
    ? category.products
        .map(
          (p) =>
            `<button class="card" aria-pressed="false" data-product="${p.id}">${badge}<span class="catalog-photo photo-crop" style="${crop(p.box)}"><img src="${p.photo}" alt="" loading="lazy" decoding="async"></span><span class="card-name"><span>${marks(p.name)}</span></span></button>`,
        )
        .join('')
    : burgers
        .map(
          (p) =>
            `<button class="card" aria-pressed="false" ${p.recipe ? `data-product="${p.recipe}"` : ''}>${badge}<img class="catalog-photo" src="${p.photo}" width="400" height="400" alt="" loading="lazy" decoding="async"><span class="card-name"><span>${marks(p.recipe ? recipes[p.recipe].name : p.name)}</span></span></button>`,
        )
        .join('');
  $('grid')
    .querySelectorAll('button.card[data-product]')
    .forEach(
      (b) =>
        (b.onclick = () => {
          if (category) {
            dispatch({ type: 'select', product: b.dataset.product });
            return $('add').focus();
          }
          selectProduct(b.dataset.product);
          $('edit').focus();
        }),
    );
}

/**
 * Shows another product: its Camadas as layer buttons and, in 3D, a new scene per stage
 * built from its Receita (the old ones are disposed). Its Personalização starts over.
 */
function selectProduct(product) {
  if (product === state.product) return;
  scenes?.dispose();
  scenes = null;
  for (const id of Object.keys(trayImages)) delete trayImages[id];
  state = reducer(state, { type: 'select', product });
  mountProduct();
  render();
}
function mountProduct() {
  buildBurger($('hero-burger'));
  buildBurger($('pg-burger'), true);
  if (webgl) mountScenes();
  else document.body.classList.remove('burger-3d');
}

/** SVG fallback: top of each layer in the assembled hero burger (px). */
function closedPositions(removed) {
  const [bottom, ...rest] = recipe().layers;
  let y = bottom.y;
  const positions = { [bottom.id]: y };
  for (const ingredient of rest) {
    if (removed.includes(ingredient.id)) continue;
    y -= ingredient.thickness;
    positions[ingredient.id] = y;
  }
  return positions;
}

/** Hero title in two lines: at the title's "\n", otherwise after the first word; one word stays on one line. */
function heroTitle(title) {
  const [first, ...rest] = title.includes('\n') ? title.split('\n') : title.split(' ');
  $('product-title').innerHTML = `<span>${marks(first)}</span>${rest.length ? '<br>' + marks(rest.join(' ')) : ''}`;
  fitTitle();
}
/** The title's lines don't wrap: a line wider than the column shrinks the title to fit it. */
function fitTitle() {
  const h1 = $('product-title');
  h1.style.fontSize = '';
  if (h1.scrollWidth > h1.clientWidth) h1.style.fontSize = (parseFloat(getComputedStyle(h1).fontSize) * h1.clientWidth) / h1.scrollWidth + 'px';
}
addEventListener('resize', fitTitle);

function render() {
  buildGrid();
  const inCart = state.screen === 'carrinho',
    inCheckout = state.screen === 'checkout',
    inAddress = state.screen === 'endereco',
    inMenu = state.screen === 'cardapio';
  document
    .querySelectorAll('nav a')
    .forEach((a) => (inMenu && a.hash === '#' + state.category ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.querySelector('main').dataset.screen = state.screen;
  for (const el of document.querySelectorAll('main > .hero, main > .catalog')) el.hidden = !inMenu;
  $('cart-page').hidden = !inCart;
  $('checkout-page').hidden = !inCheckout;
  $('address-page').hidden = !inAddress;
  // "Entregar em" leaves the header in the Checkout and the address pages.
  document.querySelector('header .location').hidden = inCheckout || inAddress;
  const photo = pick(state) && products[pick(state).product];
  for (const id of ['hero-stage', 'edit', 'combo-options']) $(id).hidden = !!photo;
  $('product-frame').hidden = !photo;
  const product = recipe();
  if (photo) {
    heroTitle(photo.title);
    $('product-photo').src = photo.photo;
    $('product-frame').style.cssText = crop(photo.box);
    $('product-frame').setAttribute('aria-label', photo.title.replace('\n', ' '));
    $('product-description').textContent = photo.text;
  } else {
    heroTitle(product.name);
    $('product-description').textContent = description(product, state.removed);
  }
  $('controls-title').innerHTML = `Personalize seu ${marks(product.name)}`;
  document.querySelectorAll('#grid .card').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.product === (pick(state)?.product ?? state.product))));
  if (scenes) {
    scenes.hero.show({ open: false, removed: state.removed }, { animate: false });
    if (state.editing && !closing) scenes.editor.show({ open: true, removed: state.draft });
  } else {
    const positions = closedPositions(state.removed);
    document.querySelectorAll('#hero-burger .layer').forEach((b) => {
      if (positions[b.dataset.id] !== undefined) b.style.top = positions[b.dataset.id] + 'px';
    });
  }
  document
    .querySelectorAll('#hero-burger .layer')
    .forEach((b) => b.classList.toggle('removed', state.removed.includes(b.dataset.id)));
  $('combo').checked = state.combo;
  $('drink').disabled = !state.combo;
  $('drink').value = state.drink;
  $('drink').setAttribute('aria-invalid', String(!!state.drinkError));
  $('drink-error').textContent = state.drinkError ? 'Escolha a bebida do combo' : '';
  const qty = pick(state)?.qty ?? state.qty;
  $('qty').textContent = qty;
  $('qty-minus').disabled = qty <= 1;
  $('qty-plus').disabled = qty >= 99;
  $('total').textContent = money(itemTotal(state));
  $('playground').classList.toggle('open', state.editing);
  document.querySelectorAll('#pg-burger .layer').forEach((b) => {
    const removed = state.draft.includes(b.dataset.id);
    b.classList.toggle('removed', removed);
    b.tabIndex = removed ? -1 : 0;
    b.setAttribute('aria-hidden', String(removed));
    b.setAttribute('aria-label', 'Retirar ' + name(b.dataset.id));
  });
  renderTray();
  $('tray-message').textContent = state.draft.length
    ? 'Toque em um ingrediente retirado para recolocá-lo.'
    : 'Arraste os ingredientes para cá ou use os chips abaixo.';
  $('controls').innerHTML = product.layers
    .filter((i) => !i.locked)
    .map((i) => {
      const removed = state.draft.includes(i.id);
      return `<button class="ingredient-chip" data-toggle="${i.id}" aria-label="${removed ? 'Recolocar' : 'Retirar'} ${i.name}" aria-pressed="${!removed}"><span class="chip-icon" aria-hidden="true">${removed ? '＋' : '✓'}</span> ${i.name}</button>`;
    })
    .join('');
  $('controls')
    .querySelectorAll('button')
    .forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.toggle;
          dispatch({ type: 'toggle', id });
          $('controls').querySelector(`[data-toggle="${id}"]`).focus();
        }),
    );
  // Read by screen readers only (aria-live); the dialog shows no status line.
  $('state').textContent = `${product.name} · ${removedLine(product, state.draft)} · Retirar ingredientes mantém o preço neste protótipo.`;
  const units = cartUnits(state.cart);
  $('cart-count').textContent = units;
  $('cart-open').setAttribute('aria-label', `Carrinho · ${units}`);
  // Built only while shown, so the menu never holds a hidden copy of the Itens.
  if (inCart) renderCart();
  else {
    $('cart-content').replaceChildren();
    $('cart-status').textContent = '';
  }
  if (inCheckout) renderCheckout();
  else $('checkout-content').replaceChildren();
  $('address-content').innerHTML = inAddress ? progress(1) : '';
}

/**
 * Checkout: the indicador de etapas, the current step (Identificação) and the Resumo do pedido. Rebuilt on every
 * change, so the focused field keeps its focus and caret, and the Novo cliente's name and e-mail their text.
 */
function renderCheckout() {
  const root = $('checkout-content'),
    active = root.contains(document.activeElement) ? document.activeElement : null,
    kept = [...root.querySelectorAll('#id-name, #id-email')].map((i) => [i.id, i.value]);
  let caret = null;
  try {
    caret = active && active.selectionStart != null ? [active.selectionStart, active.selectionEnd] : null;
  } catch {}
  root.innerHTML = `${progress(0)}<div class="checkout-body"><section class="checkout-step" aria-label="Identificação">${identificationStep(state.identification)}</section>${orderSummary(state.cart)}</div>`;
  for (const [id, value] of kept) if ($(id)) $(id).value = value;
  const again = active?.id && $(active.id);
  if (!again) return;
  again.focus({ preventScroll: true });
  try {
    if (caret) again.setSelectionRange(...caret);
  } catch {}
}
// Identificação: the celular is masked as it is typed, the caret staying after the same digit; the code keeps digits only.
$('checkout-content').addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'id-phone') {
    const before = t.value.slice(0, t.selectionStart).replace(/\D/g, '').length;
    dispatch({ type: 'idPhone', value: t.value });
    const field = $('id-phone'),
      masked = field.value;
    let at = 0;
    for (let n = 0; at < masked.length && n < before; at++) if (/\d/.test(masked[at])) n++;
    field.setSelectionRange(at, at);
  } else if (t.id === 'id-code') dispatch({ type: 'idCode', value: t.value });
});
// Identified (Cliente cadastrado, or Novo cliente after the form): the Checkout's place in history becomes #endereco.
const identified = () => state.customer && location.replace('#endereco');
$('checkout-content').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target.dataset.idForm;
  if (form === 'phone') {
    dispatch({ type: 'idSend', channel: e.submitter?.dataset.idSend ?? 'whatsapp' });
    $('id-code')?.focus();
  } else if (form === 'code') {
    dispatch({ type: 'idConfirm' });
    // Código incorreto: back to the code, whose button is now disabled.
    if (state.identification.codeError) $('id-code').focus();
    identified();
  } else if (form === 'register') {
    dispatch({ type: 'idRegister', name: $('id-name').value, email: $('id-email').value });
    $('checkout-content').querySelector('[aria-invalid=true]')?.focus();
    identified();
  }
});
// Reenviar código and switching the channel only tell where the code went (toast); Alterar celular goes back to the celular, filled.
$('checkout-content').addEventListener('click', (e) => {
  const id = () => state.identification;
  if (e.target.closest('[data-id-resend]')) toast(sentTo(id().channel, id().phone));
  else if (e.target.closest('[data-id-channel]')) {
    dispatch({ type: 'idChannel' });
    $('checkout-content').querySelector('[data-id-channel]').focus();
    toast(sentTo(id().channel, id().phone));
  } else if (e.target.closest('[data-id-change]')) {
    dispatch({ type: 'idChange' });
    $('id-phone').focus();
  }
});

/** Carrinho screen: the Itens (each one editable, see itemCard) and the Resumo do carrinho, or the empty state. */
const itemsText = (n) => (n === 1 ? '1 item' : `${n} itens`);
function itemPhoto(item) {
  const photo = products[item.product];
  if (photo) return `<span class="cart-photo photo-crop" style="${crop(photo.box)}"><img src="${photo.photo}" alt=""></span>`;
  return `<img class="cart-photo" src="${burgers.find((b) => b.recipe === item.product).photo}" width="400" height="400" alt="">`;
}
/** Burger Item: "Ingredientes:" with the hero's description, and the removed line (red) or "Todos os ingredientes". */
function ingredientsOf(item) {
  const r = recipes[item.product];
  if (!r) return '';
  return `<div class="cart-ingredients"><p>Ingredientes:</p><p>${description(r, item.removed)}</p><p${item.removed.length ? ' class="cart-without"' : ''}>${removedLine(r, item.removed)}</p></div>`;
}
/** Quantidade (1-99; "−" disabled at 1) and Total do item of Item `i`. */
function qtyAndTotal(item, i) {
  return `<div class="cart-qty"><span class="item-label" id="item-${i}-qty">Quantidade</span><div class="qty" role="group" aria-labelledby="item-${i}-qty"><button data-key="${i}:minus" aria-label="Diminuir quantidade" ${item.qty <= 1 ? 'disabled' : ''}>−</button><span>${item.qty}</span><button data-key="${i}:plus" aria-label="Aumentar quantidade" ${item.qty >= 99 ? 'disabled' : ''}>+</button></div></div><div class="total">Total do item<strong>${money(item.price * item.qty)}</strong></div>`;
}
// Bebida do combo of the Carrinho: a select-only combobox (ARIA listbox pattern) whose list opens over
// the page. Which list is open, and its active option, is view state only: { index, active } or null.
let openDrink = null;
function drinkPicker(item, i) {
  const open = openDrink?.index === i;
  const options = drinks
    .map(
      (d, k) =>
        `<li role="option" id="item-${i}-drink-${k}" data-key="${i}:option:${k}" aria-selected="${d === item.drink}"${open && openDrink.active === k ? ' class="active"' : ''}>${d}</li>`,
    )
    .join('');
  // Continuar with the combo but no drink: red border and "Escolha a bebida do combo", as on the burger card.
  const error = item.drinkError ? ` aria-invalid="true" aria-describedby="item-${i}-drink-error"` : '';
  return `<div class="cart-drink"><span class="item-label" id="item-${i}-drink">Bebida do combo</span><div class="picker"><button class="field picker-button" role="combobox" data-key="${i}:drink" aria-labelledby="item-${i}-drink" aria-haspopup="listbox" aria-controls="item-${i}-drinks" aria-expanded="${open}"${open ? ` aria-activedescendant="item-${i}-drink-${openDrink.active}"` : ''}${error}${item.combo ? '' : ' disabled'}>${item.drink || 'Selecione uma bebida'}</button><ul class="picker-list" role="listbox" id="item-${i}-drinks" aria-labelledby="item-${i}-drink"${open ? '' : ' hidden'}>${options}</ul></div>${item.drinkError ? `<p class="field-error" id="item-${i}-drink-error">Escolha a bebida do combo</p>` : ''}</div>`;
}
/** Card of Item `i`: photo, name and Remover; a burger also has Ingredientes, combo and Bebida do combo; then Quantidade and Total do item. */
function itemCard(item, i) {
  const burger = recipes[item.product];
  const combo = burger
    ? `<label class="check cart-combo"><input type="checkbox" data-key="${i}:combo"${item.combo ? ' checked' : ''}> Transformar em combo</label>${drinkPicker(item, i)}`
    : '';
  return `<li class="cart-item${burger ? ' cart-burger' : ''}">${itemPhoto(item)}<div class="cart-head"><h2>${marks(itemName(item))}</h2><button class="secondary cart-remove" data-key="${i}:remove">Remover</button></div>${ingredientsOf(item)}<div class="cart-controls">${combo}${qtyAndTotal(item, i)}</div></li>`;
}
/** Opens the drink list of Item `i` with `active` highlighted (the chosen drink, or the first), or closes it (null). */
function showDrinks(i, active) {
  openDrink = i === null ? null : { index: i, active: active ?? Math.max(0, drinks.indexOf(state.cart[i].drink)) };
  render();
  if (openDrink) $(`item-${i}-drink-${openDrink.active}`)?.scrollIntoView({ block: 'nearest' });
}
function chooseDrink(i, k) {
  openDrink = null;
  dispatch({ type: 'itemDrink', index: i, value: drinks[k] });
  $('cart-content').querySelector(`[data-key="${i}:drink"]`)?.focus();
}
/** Says `text` in the Carrinho's live region (#cart-status, never rebuilt); the same text again is still announced. */
function announce(text) {
  const el = $('cart-status');
  el.textContent = el.textContent === text ? text + ' ' : text;
}
/** Aviso of the Item just removed, with Desfazer (Figma 06); gone at the next change in the cart or on leaving the Carrinho. */
function removedNotice() {
  const last = state.lastRemoved;
  return last ? `<div class="cart-notice" role="group" aria-label="Item removido"><p>${marks(itemName(last.item))} removido do carrinho.</p><button class="secondary" data-key="undo">Desfazer</button></div>` : '';
}
function renderCart() {
  const units = cartUnits(state.cart);
  const count = state.cart.length;
  $('cart-subtitle').hidden = !count;
  if (!count) {
    $('cart-content').innerHTML =
      removedNotice() + '<div class="cart-empty"><h2>Seu carrinho está vazio</h2><p>Escolha seus favoritos para começar.</p><button class="primary" data-back>Explorar cardápio</button></div>';
    return;
  }
  $('cart-subtitle').textContent = units === count ? `${itemsText(count)} no carrinho` : `${units} unidades em ${itemsText(count)}`;
  // Rebuilt on every change: the control that had the focus gets it back (or, now disabled, its neighbour in the group).
  const focused = $('cart-content').contains(document.activeElement) ? document.activeElement.dataset.key : null;
  const total = money(cartTotal(state.cart));
  // Phones (< 1024px): a bar fixed at the bottom repeats Total dos itens and Continuar; hidden on desktop.
  $('cart-content').innerHTML = `${removedNotice()}<ul class="cart-items" aria-label="Itens">${state.cart.map(itemCard).join('')}</ul><aside class="cart-summary" aria-labelledby="summary-title"><h2 id="summary-title">Resumo do carrinho</h2><p class="summary-total">Total dos itens<strong>${total}</strong></p><p class="summary-note">Entrega calculada na próxima etapa.</p><button class="primary" data-continue>Continuar</button><button class="secondary" data-back>Adicionar mais itens</button></aside><div class="cart-bar" role="region" aria-label="Total dos itens e Continuar"><p><span class="sr-only">Total dos itens</span><strong>${total}</strong></p><button class="primary" data-continue>Continuar</button></div>`;
  const again = focused && $('cart-content').querySelector(`[data-key="${focused}"]`);
  if (again) (again.disabled ? again.parentElement.querySelector('[data-key]:not(:disabled)') : again)?.focus();
}

// Bandeja: each removed ingredient as an image of its own Camada (rendered by the scene,
// cached per id) or, without WebGL, its SVG illustration. Tapping it puts it back.
const trayImages = {};
function trayArt(id) {
  if (!scenes) return art(layer(recipe(), id).model);
  trayImages[id] ??= scenes.editor.snapshot(id);
  return trayImages[id] ? `<img src="${trayImages[id]}" alt="" width="60" height="36">` : '';
}
function renderTray() {
  const list = $('tray-items');
  const shown = [...list.querySelectorAll('[data-restore]')].map((b) => b.dataset.restore);
  if (shown.join() === state.draft.join()) return;
  list.innerHTML = state.draft
    .map(
      (id) =>
        `<li><button class="tray-item" data-restore="${id}" aria-label="Recolocar ${name(id)}">${trayArt(id)}<span aria-hidden="true">${name(id)}</span></button></li>`,
    )
    .join('');
  list.querySelectorAll('button').forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.restore;
        const next = b.parentElement.nextElementSibling ?? b.parentElement.previousElementSibling;
        dispatch({ type: 'toggle', id });
        // Stay in the Bandeja if anything is left there; otherwise land on the ingredient's chip.
        const target = next && $('tray-items').querySelector(`[data-restore="${next.firstChild.dataset.restore}"]`);
        (target ?? $('controls').querySelector(`[data-toggle="${id}"]`)).focus();
      }),
  );
}

const overTray = (e) => {
  const r = $('tray').getBoundingClientRect();
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
};
let activeDrag = null;
function bindLayer(b) {
  b.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    activeDrag = { b, x: e.clientX, y: e.clientY, moved: false };
    b.setPointerCapture(e.pointerId);
    b.classList.add('dragging');
  });
  b.addEventListener('pointermove', (e) => {
    if (!activeDrag || activeDrag.b !== b) return;
    const dx = e.clientX - activeDrag.x,
      dy = e.clientY - activeDrag.y;
    if (Math.hypot(dx, dy) > 8) activeDrag.moved = true;
    // In 3D the Camada itself follows the pointer (only once it is clearly a drag, so a tap
    // stays a tap); without WebGL the SVG button moves.
    if (scenes) {
      if (activeDrag.moved) scenes.editor.drag(b.dataset.id, e.clientX, e.clientY);
    } else b.style.transform = `translate3d(${dx}px,${dy}px,80px) rotate(${dx / 25}deg)`;
    $('tray').classList.toggle('over', overTray(e));
  });
  b.addEventListener('pointerup', (e) => {
    if (!activeDrag) return;
    const drag = activeDrag;
    activeDrag = null;
    b.classList.remove('dragging');
    b.style.transform = '';
    // Back to its place, unless the drop below removes it (it then shrinks where it was let go).
    scenes?.editor.release();
    const drop = overTray(e);
    $('tray').classList.remove('over');
    if (drop) dispatch({ type: 'remove', id: b.dataset.id });
    else if (!drag.moved) dispatch({ type: 'toggle', id: b.dataset.id });
  });
  b.addEventListener('pointercancel', () => {
    activeDrag = null;
    scenes?.editor.release();
    b.classList.remove('dragging');
    b.style.transform = '';
    $('tray').classList.remove('over');
  });
  b.addEventListener('click', (e) => {
    if (e.detail === 0) dispatch({ type: 'toggle', id: b.dataset.id });
  });
}

let restoreFocus = null,
  closing = false;
function openEditor() {
  restoreFocus = document.activeElement;
  if (scenes) {
    // Start assembled, then render() opens it with the animated transition.
    scenes.editor.show({ open: false, removed: state.removed }, { animate: false });
    dispatch({ type: 'open' });
  } else {
    dispatch({ type: 'open' });
    document.querySelectorAll('#pg-burger .layer').forEach((b, i) => (b.style.top = recipe().layers[i].y + 'px'));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.querySelectorAll('#pg-burger .layer').forEach((b) => (b.style.top = ''))),
    );
  }
  document.body.style.overflow = 'hidden';
  document.querySelector('header').inert = true;
  document.querySelector('main').inert = true;
  $('close').focus();
}
function closeEditor(type) {
  if (closing) return;
  const finish = () => {
    closing = false;
    dispatch({ type });
    $('playground').classList.remove('closing');
    $('playground')
      .querySelectorAll('button')
      .forEach((b) => {
        b.disabled = Boolean(b.classList.contains('layer') && layer(recipe(), b.dataset.id)?.locked);
      });
    document.body.style.overflow = '';
    document.querySelector('header').inert = false;
    document.querySelector('main').inert = false;
    restoreFocus?.focus();
  };
  if (type !== 'apply' || matchMedia('(prefers-reduced-motion:reduce)').matches) {
    finish();
    return;
  }
  // Apply: compact the present Camadas, top bun coming down onto the base, then close.
  closing = true;
  $('playground').classList.add('closing');
  $('playground')
    .querySelectorAll('button')
    .forEach((b) => (b.disabled = true));
  $('state').textContent = 'Fechando seu hambúrguer…';
  if (scenes) {
    // Close once the compacted burger has been drawn, after a short pause to see it;
    // the timeout guards against frames that never come (e.g. a hidden tab).
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const compacted = scenes.editor.show({ open: false, removed: state.draft }).then(() => wait(150));
    Promise.race([compacted, wait(1500)]).then(finish);
    return;
  }
  const positions = closedPositions(state.draft),
    offset = $('pg-stage').clientHeight * 0.65 - 242;
  document.querySelectorAll('#pg-burger .layer').forEach((b) => {
    if (positions[b.dataset.id] !== undefined) b.style.top = positions[b.dataset.id] + offset + 'px';
  });
  setTimeout(finish, 700);
}

$('edit').onclick = openEditor;
$('close').onclick = $('cancel').onclick = () => closeEditor('cancel');
$('apply').onclick = () => closeEditor('apply');
$('reset').onclick = () => dispatch({ type: 'reset' });
$('combo').onchange = (e) => dispatch({ type: 'combo', value: e.target.checked });
$('drink').insertAdjacentHTML('beforeend', drinks.map((d) => `<option>${d}</option>`).join(''));
const qty = () => pick(state)?.qty ?? state.qty;
$('qty-minus').onclick = () => dispatch({ type: 'qty', value: qty() - 1 });
$('qty-plus').onclick = () => dispatch({ type: 'qty', value: qty() + 1 });
$('drink').onchange = (e) => dispatch({ type: 'drink', value: e.target.value });
$('add').onclick = () => {
  const added = pick(state) ? products[pick(state).product].name : recipe().name;
  dispatch({ type: 'add' });
  // The combo's drink error belongs to the burger card only.
  if (!pick(state) && state.drinkError) return $('drink').focus();
  toast(`Adicionado ao carrinho: ${added}`);
};
$('cart-open').onclick = () => (location.hash = 'carrinho');
// Voltar ao cardápio, Adicionar mais itens and Explorar cardápio: back to the last category seen, as it was.
// Opened from the menu, that is the previous history entry (so Back doesn't return to the Carrinho);
// opened by the address, there is none and the category's hash is pushed instead.
let fromMenu = false,
  fromCart = false,
  started = false;
// One click handler for the whole screen: Continuar, the ways back to the menu (Voltar ao cardápio,
// Adicionar mais itens, Explorar cardápio) and the controls of each Item (data-key "index:control").
$('cart-page').addEventListener('click', (e) => {
  if (e.target.closest('[data-continue]')) return continueOrder();
  if (e.target.closest('[data-back]')) return fromMenu ? history.back() : (location.hash = state.category);
  const key = e.target.closest('[data-key]')?.dataset.key;
  if (!key) return;
  const [index, control] = key.split(':'),
    i = Number(index),
    item = state.cart[i];
  if (control === 'minus' || control === 'plus') {
    dispatch({ type: 'itemQty', index: i, value: item.qty + (control === 'plus' ? 1 : -1) });
    announce(`${itemName(item)}: quantidade ${state.cart[i].qty}`);
  }
  if (control === 'drink') showDrinks(openDrink?.index === i ? null : i);
  if (control === 'option') chooseDrink(i, Number(key.split(':')[2]));
  if (control === 'remove') {
    openDrink = null;
    dispatch({ type: 'itemRemove', index: i });
    announce(`${itemName(item)} removido do carrinho.`);
    $('cart-content').querySelector('[data-key="undo"]').focus();
  }
  if (key === 'undo') {
    const { index: back, item: restored } = state.lastRemoved;
    dispatch({ type: 'itemUndo' });
    announce(`${itemName(restored)} devolvido ao carrinho.`);
    $('cart-content').querySelector(`[data-key="${back}:remove"]`).focus();
  }
});
$('cart-page').addEventListener('change', (e) => {
  const [index, control] = e.target.dataset.key?.split(':') ?? [];
  if (control !== 'combo') return;
  if (openDrink?.index === Number(index)) openDrink = null;
  dispatch({ type: 'itemCombo', index: Number(index), value: e.target.checked });
});
// Keyboard of the Bebida do combo (select-only combobox): closed, ↓ ↑ Enter Space open it; open, ↓ ↑ Home End move the
// active option, Enter or Space choose it, Esc closes without changing and Tab closes and moves on.
$('cart-page').addEventListener('keydown', (e) => {
  const [index, control] = e.target.dataset.key?.split(':') ?? [];
  if (control !== 'drink') return;
  const i = Number(index),
    last = drinks.length - 1;
  if (openDrink?.index !== i) {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) return;
    e.preventDefault();
    return showDrinks(i);
  }
  const moves = { ArrowDown: Math.min(last, openDrink.active + 1), ArrowUp: Math.max(0, openDrink.active - 1), Home: 0, End: last };
  if (e.key in moves) showDrinks(i, moves[e.key]);
  else if (e.key === 'Enter' || e.key === ' ') chooseDrink(i, openDrink.active);
  else if (e.key === 'Escape') showDrinks(null);
  else if (e.key === 'Tab') return showDrinks(null);
  else return;
  e.preventDefault();
});
// Space activates a button on keyup: the keydown above already handled it.
$('cart-page').addEventListener('keyup', (e) => {
  if (e.key === ' ' && e.target.dataset.key?.endsWith(':drink')) e.preventDefault();
});
// Choosing an option with the mouse keeps the focus on the combobox; pressing anywhere else closes the list.
$('cart-page').addEventListener('mousedown', (e) => {
  if (e.target.closest('[role=listbox]')) e.preventDefault();
});
document.addEventListener('pointerdown', (e) => {
  if (openDrink && !e.target.closest('.picker')) showDrinks(null);
});
// Continuar: the first combo without a drink is scrolled to and its Bebida do combo focused; none, the Checkout.
function continueOrder() {
  dispatch({ type: 'continue' });
  const i = state.cart.findIndex((c) => c.drinkError);
  if (i < 0) return (location.hash = 'checkout');
  const picker = $('cart-content').querySelector(`[data-key="${i}:drink"]`);
  picker.closest('.cart-item').scrollIntoView({ block: 'center' });
  picker.focus({ preventScroll: true });
}
// Categories: the hash picks the page content (#acompanhamentos, #bebidas, #sobremesas; anything else, Hambúrgueres).
// #carrinho shows the Carrinho instead, keeping the last category seen as it was.
// Entering the Carrinho: the page goes to the top and the focus to its title. Back to the menu: its scroll and the
// control the customer left from come back (that control gone or hidden, the header's Carrinho button).
let menuScroll = 0,
  menuFocus = null;
// #checkout with an empty cart, or with a combo still without a drink (typed or reloaded: the cart lives in memory), shows the Carrinho.
// Entering the Checkout: top of the page, focus on its title. From the Checkout back to the Carrinho, the Carrinho's way back to the menu stays as it was.
const fromHash = () => {
  // Back/Forward with Ver ingredientes open: cancel it first, as Esc does.
  if (state.editing) closeEditor('cancel');
  let hash = location.hash.slice(1);
  const go = (to) => {
    hash = to;
    history.replaceState(null, '', '#' + to);
  };
  if ((hash === 'checkout' || hash === 'endereco') && (!state.cart.length || state.cart.some((c) => c.combo && !c.drink))) go('carrinho');
  // Within the session, a confirmed celular skips the Identificação; the address pages need it.
  else if (hash === 'checkout' && state.customer) go('endereco');
  else if (hash === 'endereco' && !state.customer) go('checkout');
  const before = state.screen;
  if (before === 'cardapio') [menuScroll, menuFocus] = [scrollY, document.activeElement];
  else openDrink = null;
  dispatch({ type: 'category', category: hash });
  // Phones: the tabs scroll sideways; keep the active one in view.
  document.querySelector('nav a[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const now = state.screen;
  if (now === 'carrinho' && before !== 'checkout') fromMenu = before === 'cardapio' && started;
  if (now === 'checkout') fromCart = before === 'carrinho' && started;
  if (now === before) return;
  scrollTo(0, now === 'cardapio' ? menuScroll : 0);
  if (!started) return;
  const back = menuFocus?.isConnected && menuFocus.checkVisibility?.() && menuFocus !== document.body ? menuFocus : $('cart-open');
  (({ carrinho: $('cart-title'), checkout: $('checkout-title'), endereco: $('address-title') })[now] ?? back).focus({ preventScroll: true });
};
// Voltar ao carrinho and Editar carrinho: back to the Carrinho (the previous history entry when the Checkout came from it).
$('checkout-page').addEventListener('click', (e) => {
  if (e.target.closest('[data-to-cart]')) fromCart ? history.back() : (location.hash = 'carrinho');
});
addEventListener('hashchange', fromHash);

document.addEventListener('keydown', (e) => {
  if (!state.editing) return;
  const dialog = $('playground');
  if (e.key === 'Escape') closeEditor('cancel');
  if (e.key === 'Tab') {
    const focusable = [...dialog.querySelectorAll('button:not(:disabled),input')].filter(
      (b) => !b.classList.contains('removed'),
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

let timer;
function toast(t) {
  $('toast').textContent = t;
  $('toast').style.display = 'block';
  clearTimeout(timer);
  timer = setTimeout(() => ($('toast').style.display = 'none'), 2800);
}

// 3D tilt (ticket 10). Desktop: the pointer over the stage. Touch (iOS and Android): dragging
// on the empty area of the stage, horizontally (vertical swipes keep scrolling). Android also
// follows the device orientation; iOS only sends it after a permission prompt, which we never show.
// Dragging a Camada still means removing it. Nothing tilts with reduced motion.
const motionOk = () => scenes && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const activeScene = () => (state.editing ? scenes.editor : scenes.hero);
let touchTilt = null;
for (const [stageId, scene] of [['hero-stage', () => scenes.hero], ['pg-stage', () => scenes.editor]]) {
  const stage = $(stageId);
  stage.addEventListener('pointermove', (e) => {
    if (!motionOk() || activeDrag) return;
    if (e.pointerType === 'mouse') {
      const r = stage.getBoundingClientRect();
      scene().tilt(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    } else if (touchTilt?.id === e.pointerId) {
      scene().tilt((e.clientX - touchTilt.x) / 120, (e.clientY - touchTilt.y) / 120);
    }
  });
  stage.addEventListener('pointerleave', (e) => {
    if (motionOk() && e.pointerType === 'mouse') scene().tilt(0, 0);
  });
  stage.addEventListener('pointerdown', (e) => {
    if (!motionOk() || e.pointerType === 'mouse' || e.target.closest('.layer')) return;
    touchTilt = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  const endTouch = (e) => {
    if (touchTilt?.id !== e.pointerId) return;
    touchTilt = null;
    scene().tilt(0, 0);
  };
  stage.addEventListener('pointerup', endTouch);
  stage.addEventListener('pointercancel', endTouch);
}
let neutral = null;
addEventListener('deviceorientation', (e) => {
  if (!motionOk() || e.beta == null || e.gamma == null || touchTilt || activeDrag) return;
  // The way the phone is held right now is "straight"; drift slowly towards new holds.
  neutral ??= { beta: e.beta, gamma: e.gamma };
  neutral.beta += (e.beta - neutral.beta) * 0.01;
  neutral.gamma += (e.gamma - neutral.gamma) * 0.01;
  activeScene().tilt((e.gamma - neutral.gamma) / 20, (e.beta - neutral.beta) / 20);
});

// CSS tilt of the SVG fallback only.
$('hero-stage').onpointermove = (e) => {
  if (scenes || e.pointerType === 'touch' || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const r = $('hero-stage').getBoundingClientRect();
  $('hero-burger').style.setProperty('--tilt', ((e.clientX - r.left) / r.width - 0.5) * 12 + 'deg');
};
$('hero-stage').onpointerleave = () => $('hero-burger').style.setProperty('--tilt', '0deg');
mountProduct();
fromHash();
started = true;
