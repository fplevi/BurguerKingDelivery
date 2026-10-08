import { ingredients, name } from './ingredients.js';
import { art } from './art.js';
import { initial, reducer, fees, money, price } from './state.js';
import { createBurgerScene } from './scene/burger-scene.js';
import whopperPhoto from '../Assets/catalog/whopper.png';
import whopperDuploPhoto from '../Assets/catalog/whopper-duplo.png';
import baconPhoto from '../Assets/catalog/bacon.png';
import cheeseburgerPhoto from '../Assets/catalog/cheeseburger.png';
// Prototype question: can layered ingredients support opening, removal, restoration and order customization?

let state = initial;
const $ = (id) => document.getElementById(id);
function dispatch(action) {
  state = reducer(state, action);
  render();
}

// Layer buttons: in 3D they are invisible hit areas placed over the scene; without WebGL
// they carry the SVG illustrations (fallback). Either way they hold labels, focus and gestures.
function buildBurger(el, interactive = false) {
  el.innerHTML = ingredients
    .map(
      (i, index) =>
        `<button class="layer" data-id="${i.id}" style="--y:${interactive ? 78 - index * (70 / (ingredients.length - 1)) + '%' : i.y + 'px'};--z:${i.z}" ${interactive && !i.locked ? '' : 'disabled'} aria-label="Retirar ${i.name}">${art(i.id)}</button>`,
    )
    .join('');
  if (interactive) el.querySelectorAll('.layer:not(:disabled)').forEach(bindLayer);
}
buildBurger($('hero-burger'));
buildBurger($('pg-burger'), true);

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
function mountScenes() {
  const hero = createBurgerScene($('hero-stage'), { fit: 'assembled', onAreas: (a) => placeButtons($('hero-burger'), a) });
  if (!hero) return;
  // Half the tilt in Alterar ingredientes, so the Camadas don't slide away from the cursor.
  const editor = createBurgerScene($('pg-stage'), {
    fit: 'open',
    tiltScale: 0.5,
    onAreas: (a) => placeButtons($('pg-burger'), a),
  });
  if (!editor) {
    hero.dispose();
    return;
  }
  scenes = { hero, editor };
  document.body.classList.add('burger-3d');
}
mountScenes();

const products = ['Whopper Clássico', 'Whopper Duplo', 'Bacon Supreme', 'Cheese Burger'];
const catalogPhotos = [whopperPhoto, whopperDuploPhoto, baconPhoto, cheeseburgerPhoto];
$('grid').innerHTML = products
  .map(
    (p, i) =>
      `<button class="card" aria-pressed="${i === 0}" data-product="${i}">${i === 0 ? '<span class="badge">★ Selecionado</span>' : ''}<img class="catalog-photo" src="${catalogPhotos[i]}" width="400" height="300" alt="" loading="lazy" decoding="async">${p}${i ? '<small>Em breve neste protótipo</small>' : ''}</button>`,
  )
  .join('');
$('grid')
  .querySelectorAll('button.card')
  .forEach(
    (b) =>
      (b.onclick = () =>
        b.dataset.product === '0' ? $('edit').focus() : toast('Vamos validar o Whopper primeiro. Os demais vêm depois.')),
  );

/** SVG fallback: top of each layer in the assembled hero burger (px). */
function closedPositions(removed) {
  let y = 242;
  const thickness = { meat: 36, cheese: 9, pickles: 8, onion: 8, tomato: 12, ketchup: 4, lettuce: 15, mayo: 4, top: 62 };
  const positions = { bottom: y };
  for (const ingredient of ingredients.slice(1)) {
    if (removed.includes(ingredient.id)) continue;
    y -= thickness[ingredient.id];
    positions[ingredient.id] = y;
  }
  return positions;
}

function render() {
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
  document.querySelectorAll('.size').forEach((b) => {
    b.disabled = !state.combo;
    b.setAttribute('aria-pressed', String(b.dataset.size === state.size));
  });
  $('fee').innerHTML = state.combo ? `Combo ${state.size}:<br>+ ${money(fees[state.size])}` : 'Só o sanduíche';
  $('total').textContent = money(price(state));
  $('custom-note').textContent = state.removed.length
    ? 'Sem ' + state.removed.map(name).join(', ').toLowerCase()
    : 'Preparado com todos os ingredientes';
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
  $('controls').innerHTML = ingredients
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
  $('state').textContent = `Whopper Clássico · ${state.draft.length ? 'Sem ' + state.draft.map(name).join(', ').toLowerCase() : 'Todos os ingredientes'} · Remover ingredientes mantém o preço neste protótipo.`;
  $('cart-count').textContent = state.cart.length;
  $('cart-items').innerHTML = state.cart.length
    ? state.cart
        .map(
          (item, i) =>
            `<div class="cart-row"><b>Whopper Clássico · ${money(item.price)}</b><small>${item.combo ? 'Combo ' + item.size : 'Só sanduíche'} · ${item.removed.length ? 'Sem ' + item.removed.map(name).join(', ').toLowerCase() : 'Todos os ingredientes'}</small><button data-delete="${i}">Remover item</button></div>`,
        )
        .join('')
    : 'Seu carrinho está vazio.';
  $('cart-items')
    .querySelectorAll('button')
    .forEach((b) => (b.onclick = () => dispatch({ type: 'delete', index: Number(b.dataset.delete) })));
  $('cart-total').textContent = 'Total: ' + money(state.cart.reduce((n, i) => n + i.price, 0));
}

// Bandeja: each removed ingredient as an image of its own Camada (rendered by the scene,
// cached per id) or, without WebGL, its SVG illustration. Tapping it puts it back.
const trayImages = {};
function trayArt(id) {
  if (!scenes) return art(id);
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
    document.querySelectorAll('#pg-burger .layer').forEach((b, i) => (b.style.top = ingredients[i].y + 'px'));
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
        b.disabled = Boolean(b.classList.contains('layer') && ingredients.find((i) => i.id === b.dataset.id)?.locked);
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
document.querySelectorAll('.size').forEach((b) => (b.onclick = () => dispatch({ type: 'size', value: b.dataset.size })));
$('add').onclick = () => {
  dispatch({ type: 'add' });
  toast('Whopper adicionado ao carrinho');
};
$('cart-open').onclick = () => {
  restoreFocus = document.activeElement;
  $('cart').classList.add('open');
  document.body.style.overflow = 'hidden';
  $('cart-close').focus();
};
function closeCart() {
  $('cart').classList.remove('open');
  document.body.style.overflow = '';
  restoreFocus?.focus();
}
$('cart-close').onclick = closeCart;
$('cart').onclick = (e) => {
  if (e.target === $('cart')) closeCart();
};
document.querySelectorAll('[data-accessory]').forEach(
  (a) =>
    (a.onclick = (e) => {
      e.preventDefault();
      toast('Categoria prevista para uma próxima etapa');
    }),
);

document.addEventListener('keydown', (e) => {
  const dialog = state.editing ? $('playground') : $('cart').classList.contains('open') ? $('cart') : null;
  if (!dialog) return;
  if (e.key === 'Escape') state.editing ? closeEditor('cancel') : closeCart();
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
render();
