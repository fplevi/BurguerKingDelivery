// Checkout ("Finalizar pedido", #checkout) and Seus endereços (#endereco): the indicador de etapas, the Resumo do pedido,
// the Identificação, the address list, the pages of a new address (#endereco/buscar, /confirmar, /dados) and the
// Pagamento, as HTML.
import { recipes, removedLine } from './ingredients.js';
import { money, marks, itemName, cartTotal, chosenCard, orderTotal, cartLocked, draftOf } from './state.js';
import { deliveryFee, deliveryTime, cardBrand, searchPlaces, pixValidity } from './checkout-fixtures.js';
import tile0 from '../Assets/maps/paulista-0.png';
import tile1 from '../Assets/maps/paulista-1.png';
import tile2 from '../Assets/maps/paulista-2.png';
import tile3 from '../Assets/maps/paulista-3.png';

/** The steps, in order; 'concluido' (all done) comes only after the payment is approved. */
export const steps = ['Identificação', 'Endereço', 'Pagamento'];
const check =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * Indicador de etapas (Figma 246-10579): an ordered list, the current step red with its number
 * (aria-current="step"), the earlier ones done with a check, the next ones outlined with their number.
 * `current` is the index of the current step; steps.length marks all of them done.
 */
export function progress(current) {
  return `<ol class="steps" aria-label="Etapas do pedido">${steps
    .map((name, i) => {
      const state = i < current ? 'done' : i === current ? 'current' : 'next';
      const mark = state === 'done' ? check : i + 1;
      return `<li class="step step-${state}"${state === 'current' ? ' aria-current="step"' : ''}><span class="step-mark" aria-hidden="true">${mark}</span><span class="step-name">${name}</span>${state === 'done' ? '<span class="sr-only">, concluída</span>' : ''}</li>`;
    })
    .join('')}</ol>`;
}

/** One Item of the Resumo do pedido: "N× Nome" and Total do item; a burger adds "Combo · Bebida" and, in red, what was removed. */
function summaryItem(item) {
  const r = recipes[item.product];
  const combo = r && item.combo ? `<p class="order-detail">Combo · ${item.drink}</p>` : '';
  const without = r && item.removed.length ? `<p class="order-detail order-without">${removedLine(r, item.removed)}</p>` : '';
  return `<li class="order-item"><p class="order-line"><span>${item.qty}× ${marks(itemName(item))}</span><span class="order-price">${money(item.price * item.qty)}</span></p>${combo}${without}</li>`;
}

/**
 * Resumo do pedido: the Itens, Total dos itens and Editar carrinho. With a served address (`delivered`), also the
 * Taxa de entrega and the Total do pedido (Total dos itens + Taxa de entrega). `action`: the payment action and its note,
 * above Editar carrinho; `edit`: false leaves Editar carrinho out (Pedido confirmado), 'disabled' disables it (processing).
 */
export function orderSummary(cart, delivered = false, { action = '', edit = true } = {}) {
  const items = cartTotal(cart),
    fee = delivered
      ? `<p class="order-line order-fee"><span>Taxa de entrega</span><span class="order-price">${money(deliveryFee)}</span></p><p class="order-grand"><span>Total do pedido</span><strong class="order-price">${money(items + deliveryFee)}</strong></p>`
      : '';
  const editCart = edit ? `<button class="secondary" data-to-cart${edit === 'disabled' ? ' disabled' : ''}>Editar carrinho</button>` : '';
  return `<aside class="order-summary" aria-labelledby="order-summary-title"><h2 id="order-summary-title">Resumo do pedido</h2><ul class="order-items" aria-label="Itens do pedido">${cart.map(summaryItem).join('')}</ul><p class="order-line order-total"><span>Total dos itens</span><span class="order-price">${money(items)}</span></p>${fee}${action}${editCart}</aside>`;
}

/** Celular as it is typed: digits only, masked (DD) 9XXXX-XXXX as far as they go. */
export function maskPhone(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}${d.length > 7 ? '-' + d.slice(7) : ''}`;
}

/** Where the Código de confirmação went: "Enviamos um código pelo WhatsApp|por SMS para (DD) 9XXXX-XXXX." (also the resend toast). */
export const sentTo = (channel, phone) => `Enviamos um código ${channel === 'sms' ? 'por SMS' : 'pelo WhatsApp'} para ${maskPhone(phone)}.`;

/** A labelled field with its error line (aria-describedby), invalid while it has an error. */
function field(id, label, attrs, error = '') {
  return `<label class="field-label" for="${id}">${label}</label><input class="field" id="${id}" ${attrs} aria-invalid="${!!error}" aria-describedby="${id}-error"><p class="field-error" id="${id}-error"${error ? ' role="alert"' : ''}>${error}</p>`;
}

/**
 * Identificação (Figma phone, waCode/smsCode, codeError and newCustomer): the step's content for
 * `identification` (see state.js). Each step is a form; its buttons carry data-id-* for main.js.
 * Typed values (celular, code) come from the state; the Novo cliente's name and e-mail stay in the fields.
 */
export function identificationStep({ step, phone, channel, code, codeError, errors }) {
  if (step === 'code')
    return `<h2>Confirme seu celular</h2><p class="step-text">${sentTo(channel, phone)}</p><form class="id-form" data-id-form="code" novalidate>${field('id-code', 'Código de 6 dígitos', `inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${code}"`, codeError ? 'Código incorreto. Confira e tente novamente.' : '')}<button class="primary" type="submit"${code.length < 6 || codeError ? ' disabled' : ''}>Confirmar e continuar</button></form><div class="id-links"><button class="link" type="button" data-id-resend>Reenviar código</button><button class="link" type="button" data-id-channel>${channel === 'sms' ? 'Receber pelo WhatsApp' : 'Receber por SMS'}</button><button class="link" type="button" data-id-change>Alterar celular</button></div>`;
  if (step === 'register')
    return `<h2>Como podemos te chamar?</h2><p class="step-text">Complete seus dados para receber seu pedido.</p><form class="id-form" data-id-form="register" novalidate>${field('id-name', 'Nome completo', 'autocomplete="name" required', errors.name)}${field('id-email', 'E-mail (opcional)', 'type="email" autocomplete="email"', errors.email)}${field('id-phone-read', 'Celular', `type="tel" readonly value="${maskPhone(phone)}"`)}<button class="primary" type="submit">Continuar</button></form>`;
  const ready = phone.length === 11 ? '' : ' disabled';
  return `<h2>Qual é o seu celular?</h2><p class="step-text">Vamos enviar um código para confirmar que é você.</p><form class="id-form" data-id-form="phone" novalidate>${field('id-phone', 'Celular com DDD', `type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(00) 00000-0000" value="${maskPhone(phone)}"`)}<button class="primary" type="submit" data-id-send="whatsapp"${ready}>Receber código pelo WhatsApp</button><button class="link" type="submit" data-id-send="sms"${ready}>Receber por SMS</button></form><p class="step-note">Seus dados só serão recuperados após a confirmação.</p>`;
}

const icon = (path, size = 24) => `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${path}</svg>`;
const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
/** Icon of each kind of Endereço salvo (Figma: a house, a briefcase; a heart for Favoritos). */
const labelIcons = {
  Casa: icon(`<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5" ${stroke}/>`),
  Trabalho: icon(`<rect x="3.5" y="7.5" width="17" height="12" rx="1.5" ${stroke}/><path d="M9 7.5V5.5h6v2M3.5 12.5h17" ${stroke}/>`),
  Favoritos: icon(`<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z" ${stroke}/>`),
};
const searchIcon = icon(`<circle cx="10.5" cy="10.5" r="6" ${stroke} stroke-width="2"/><path d="m15 15 5 5" ${stroke} stroke-width="2"/>`);
const locateIcon = icon(`<circle cx="12" cy="12" r="7" ${stroke}/><circle cx="12" cy="12" r="2.6" fill="currentColor"/>`, 20);
const clockIcon = icon(`<circle cx="12" cy="12" r="8.5" ${stroke} stroke-dasharray="3 2"/><path d="M12 7.5V12l3 2" ${stroke}/>`, 20);

/** What the customer typed (the fields of an address, the name on a card, the Busca) as HTML text or a "…" attribute value. */
export const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The lines of an address after its street: "Bairro, Cidade" and "Complemento · Referência" (the empty ones left out), escaped. */
const addressLines = (a) => [[a.district, a.city].filter(Boolean).join(', '), [a.complement, a.reference].filter(Boolean).join(' · ')].filter(Boolean).map(esc);

/** One Endereço salvo of the list: a radio named by its whole text, marked with ✓ and a red border (Figma Endereço 01/16). */
const moreIcon = icon('<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>', 20);
/** The menu ⋮ of an Endereço salvo (data-address-more, Figma Endereço 06): a button opening the dialog of its options. */
const moreButton = (a) => `<button class="saved-more" type="button" id="address-more-${a.id}" data-address-more="${a.id}" aria-haspopup="dialog" aria-label="Opções do endereço ${a.label}">${moreIcon}</button>`;
const pinSmall = icon(`<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" ${stroke}/><circle cx="12" cy="10" r="2.3" ${stroke}/>`, 20);
/** The visitor's Endereço de entrega (unsaved, with its place), once identified: "Salvar" opens its Dados de entrega (data-address-save-unsaved). */
const saveButton = (a) => `<button class="link saved-save" type="button" data-address-save-unsaved aria-label="Salvar o endereço ${esc(a.street)}">Salvar</button>`;
function savedAddressCard(a, picked, canSave = false) {
  return `<div class="saved-address" data-address="${a.id}"><label><input class="saved-radio" type="radio" name="saved-address" value="${a.id}"${picked ? ' checked' : ''}>${a.lastOrder ? clockIcon : a.place ? pinSmall : (labelIcons[a.label] ?? labelIcons.Favoritos)}<span class="saved-text"><b class="saved-label">${a.label}</b> <span class="saved-street">${esc(a.street)}</span> ${addressLines(a)
    .map((l) => `<span class="saved-line">${l}</span>`)
    .join(' ')}</span><span class="saved-check" aria-hidden="true">${icon('<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', 20)}</span></label>${a.lastOrder ? '' : a.place ? (canSave ? saveButton(a) : '') : moreButton(a)}</div>`;
}

/**
 * Seus endereços (#endereco, Figma Endereço 01 and 16): the search and "Usar localização atual" (wired in the address
 * search ticket: data-address-search, data-address-locate); for a client with addresses, the Endereços salvos (one
 * marked, `addressPick`) and "Entregar neste endereço" (data-address-deliver); for a Cliente cadastrado, "Endereços de
 * pedidos anteriores" (data-address-previous; the one chosen there is listed first, Figma Endereço 17). A Novo cliente
 * without addresses sees no empty sections.
 */
/**
 * Opções do endereço (Figma Endereço 06): a modal dialog (main.js shows it) with "Editar endereço" (data-address-edit)
 * and "Remover endereço" (data-address-remove) for the Endereço salvo `a`.
 */
const addressMenu = (a) =>
  `<dialog class="address-menu" id="address-menu" aria-label="Opções do endereço ${a.label}" data-for="${a.id}"><button type="button" data-address-edit="${a.id}">Editar endereço</button><button type="button" class="address-menu-remove" data-address-remove="${a.id}">Remover endereço</button></dialog>`;

export function addressList({ customer, addressPick, unsaved, addressMenu: open }) {
  const saved = [unsaved, ...(customer?.addresses ?? [])].filter(Boolean);
  // A visitor has only the Endereço de entrega chosen (ADR 0002); there is no Endereço salvo before the Identificação.
  const title = customer ? 'Endereços salvos' : 'Endereço de entrega';
  const list = saved.length
    ? `<h2 class="address-section" id="saved-title">${title}</h2><div class="saved-addresses" role="radiogroup" aria-labelledby="saved-title">${saved.map((a) => savedAddressCard(a, a.id === addressPick, !!customer)).join('')}</div>`
    : '';
  const previous = customer?.registered ? `<button class="link address-previous" type="button" data-address-previous>${clockIcon}Endereços de pedidos anteriores</button>` : '';
  const deliver = saved.length ? `<div class="address-action"><button class="primary" type="button" data-address-deliver${saved.some((a) => a.id === addressPick) ? '' : ' disabled'}>Entregar neste endereço</button></div>` : '';
  return `<div class="address-flow"><button class="address-search" type="button" data-address-search>${searchIcon}<span>Buscar endereço e número</span></button><button class="address-locate" type="button" data-address-locate>${locateIcon}<span><span class="locate-title">Usar localização atual</span> <small>Permita o acesso à sua localização.</small></span></button>${list}${previous}${deliver}</div>${open && customer ? addressMenu(customer.addresses.find((a) => a.id === open)) : ''}`;
}

/**
 * Endereço de entrega in the Checkout (Figma pix/savedCard, top card): the label, street and number, city, complement and
 * reference, a divider and the Entrega estimada, with Alterar (data-change-address, to #endereco).
 */
export function deliveryCard(a) {
  return `<section class="checkout-step delivery-card" aria-labelledby="delivery-title"><div class="delivery-head"><h2 id="delivery-title">Endereço de entrega</h2><button class="secondary" type="button" data-change-address>Alterar</button></div><p class="delivery-label">${a.label}</p>${deliveryLines(a)}<p class="delivery-time">Entrega estimada: ${deliveryTime}</p></section>`;
}
/** The address of a delivery (the Checkout's card, the Pedido confirmado): street and number, city, and complement and reference, escaped. */
function deliveryLines(a) {
  const extra = [a.complement, a.reference].filter(Boolean);
  return `<p class="delivery-street">${esc(a.street)}</p><p class="delivery-city">${esc(a.city)}</p>${extra.length ? `<p class="delivery-extra">${extra.map((t) => `<span>${esc(t)}</span>`).join('')}</p>` : ''}`;
}

// Novo endereço (#endereco/buscar, #endereco/confirmar, #endereco/dados; Figma Endereço 02-04 and 10-15).
const pinIcon = icon(`<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" ${stroke}/><circle cx="12" cy="10" r="2.3" ${stroke}/>`);
const saveIcons = {
  Casa: icon(`<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5" ${stroke}/>`, 18),
  Trabalho: icon(`<rect x="3.5" y="7.5" width="17" height="12" rx="1.5" ${stroke}/><path d="M9 7.5V5.5h6v2M3.5 12.5h17" ${stroke}/>`, 18),
  Favoritos: icon(`<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" ${stroke}/>`, 18),
};

/** The map's tiles (Assets/maps, OpenStreetMap, 2 × 2 of 256 px) and the point of the Av. Paulista, 1578 in them. */
const tiles = [tile0, tile1, tile2, tile3];
export const mapSize = 512,
  mapCenter = { x: 256, y: 225 };
/**
 * The static map: the tiles moved by `pan` under the marker fixed in the centre, and the OpenStreetMap attribution.
 * `adjust`: the map of Confirmar localização, dragged (or moved with the arrow keys) to adjust the place, with its hint
 * and "Centralizar no endereço"; otherwise a still preview.
 */
function staticMap(pan, adjust) {
  const img = tiles.map((src) => `<img src="${src}" alt="" width="256" height="256" draggable="false">`).join('');
  const attrs = adjust
    ? ' id="address-map" role="application" tabindex="0" aria-label="Mapa: arraste para ajustar o local da entrega" aria-describedby="map-hint" data-map'
    : ' aria-hidden="true"';
  const hint = adjust
    ? `<p class="map-hint" id="map-hint"><b>A entrega será aqui?</b> <span>Arraste o mapa para ajustar o local.</span></p><button class="map-center" type="button" data-map-center aria-label="Centralizar no endereço">${locateIcon}</button>`
    : '';
  return `<div class="map${adjust ? ' map-adjust' : ''}"><div class="map-view"${attrs}><div class="map-tiles" style="--pan-x:${pan.x}px;--pan-y:${pan.y}px">${img}</div><span class="map-pin" aria-hidden="true"><svg viewBox="0 0 32 40" width="32" height="40"><path d="M16 39s13-13.3 13-23A13 13 0 0 0 3 16c0 9.7 13 23 13 23z" fill="#d90000"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg></span></div>${hint}<p class="map-credit"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p></div>`;
}

/** "Av. Paulista, 1578": Rua and Número of a place. */
const streetLine = (p) => `${p.street}, ${p.number}`;

/** The Busca's field (Figma Endereço 13): a search box named "Buscar endereço e número". */
const searchField = (query) =>
  `<form class="address-query" role="search" data-address-query>${searchIcon}<input class="address-input" id="address-query" type="search" autocomplete="off" aria-label="Buscar endereço e número" placeholder="Buscar endereço e número" value="${esc(query)}"></form>`;
const mapSearch = (label) => `<p class="address-note">Não achou seu endereço?</p><button class="secondary address-wide" type="button" data-map-search>${label}</button>`;

/** One result of the Busca: its name, then the street (a named place only), the district and the city. */
const placeResult = (p) =>
  `<li><button type="button" data-place="${p.id}">${pinIcon}<span class="place-text"><b>${p.name}</b> <span>${p.poi ? `${streetLine(p)} · ${p.district}` : `${p.district} · ${p.city}`}</span>${p.poi ? ` <span>${p.city}</span>` : ''}</span></button></li>`;

/** Busca (#endereco/buscar, Figma Endereço 02/13/14): the results of the situações fixas, or the empty and no-result texts. */
function addressSearch({ addressQuery }) {
  const found = searchPlaces(addressQuery);
  const body = !addressQuery.trim()
    ? '<h2 class="address-title">Digite uma rua, número ou lugar</h2><p class="address-text">Busque pelo endereço completo para encontrar o local da entrega.</p>'
    : found.length
      ? `<ul class="address-results" aria-label="Resultados da busca">${found.map(placeResult).join('')}</ul>`
      : '<h2 class="address-title">Não encontramos esse endereço</h2><p class="address-text">Confira o nome da rua ou encontre o ponto diretamente no mapa.</p>';
  return `<div class="address-flow">${searchField(addressQuery)}<div class="address-found">${body}</div>${mapSearch('Buscar pelo mapa')}</div>`;
}

/**
 * Confirmar localização (#endereco/confirmar, Figma Endereço 03/15): the place, the map to adjust it and "Confirmar
 * localização". A place outside the region (Figma Endereço 12) shows "Ainda não entregamos nessa região" instead.
 */
function addressConfirm({ addressPlace: p }) {
  if (!p.served)
    return `<div class="address-flow"><h2 class="address-title">Ainda não entregamos nessa região</h2><p class="address-text">Tente outro endereço para continuar seu pedido.</p><div class="address-place">${pinIcon}<p><b>Local selecionado</b> <span class="place-street">${streetLine(p)}</span> <span>${p.city}</span> <span>Fora da área de entrega</span></p></div><div class="address-buttons"><button class="primary" type="button" data-address-other>Escolher outro endereço</button><button class="secondary" type="button" data-to-menu>Voltar ao cardápio</button></div></div>`;
  return `<div class="address-flow"><h2 class="address-title">Confirme o local da entrega</h2><button class="address-search" type="button" data-address-search>${searchIcon}<span>${streetLine(p)}</span></button>${staticMap(p.pan, true)}<p class="address-chosen"><b>${streetLine(p)}</b> <span>${p.district}, ${p.city}</span></p><div class="address-action"><button class="primary" type="button" data-address-confirm>Confirmar localização</button></div></div>`;
}

/** A field of the Dados de entrega (a required one shows * outside its name), with its error line. */
function deliveryField(name, label, value, { required = false, disabled = false, error = '' } = {}) {
  const id = `delivery-${name}`;
  return `<div class="delivery-field delivery-${name}"><label class="field-label" for="${id}">${label}${required ? '<span aria-hidden="true"> *</span>' : ''}</label><input class="field" id="${id}" name="${name}" value="${esc(value)}"${required && !disabled ? ' required' : ''}${disabled ? ' disabled' : ''} aria-invalid="${!!error}" aria-describedby="${id}-error"><p class="field-error" id="${id}-error"${error ? ' role="alert"' : ''}>${error ?? ''}</p></div>`;
}
const box = (name, label, checked) => `<label class="check delivery-check"><input type="checkbox" name="${name}"${checked ? ' checked' : ''}> ${label}</label>`;

/**
 * Dados de entrega (#endereco/dados, Figma Endereço 04): the map preview with "Ajustar localização no mapa", Rua*,
 * Bairro*, Número* (or "Endereço sem número"), Complemento (or "Endereço sem complemento"), Ponto de referência,
 * "Como você quer salvar?" and "Salvar endereço". It starts from the place; after errors, from what was sent.
 */
function addressDetails({ customer, addressPlace: p, addressDraft, addressErrors: e }, edit = null) {
  // A visitor (ADR 0002) chooses the Endereço de entrega without saving it: no "Como você quer salvar?".
  const guest = !customer;
  const d = addressDraft ?? edit?.draft ?? { street: p.street, district: p.district, number: p.number, noNumber: false, complement: '', noComplement: false, reference: '', label: 'Casa' };
  const labels = ['Casa', 'Trabalho', 'Favoritos']
    .map((l) => `<label class="save-as"><input type="radio" name="label" value="${l}"${d.label === l ? ' checked' : ''}>${saveIcons[l]}<span>${l}</span></label>`)
    .join('');
  const adjust = edit ? '' : `<button class="link address-adjust" type="button" data-address-adjust>${pinIcon}Ajustar localização no mapa</button>`;
  return `<div class="address-flow"><h2 class="address-title">${edit ? 'Editar endereço' : 'Complete o endereço'}</h2>${staticMap(edit ? { x: 0, y: 0 } : p.pan, false)}${adjust}<form class="delivery-form" data-address-form novalidate><div class="delivery-pair">${deliveryField('street', 'Rua', d.street, { required: true, error: e.street })}${deliveryField('district', 'Bairro', d.district, { required: true, error: e.district })}</div>${deliveryField('number', 'Número', d.noNumber ? '' : d.number, { required: true, disabled: d.noNumber, error: e.number })}${box('noNumber', 'Endereço sem número', d.noNumber)}${deliveryField('complement', 'Complemento', d.noComplement ? '' : d.complement, { disabled: d.noComplement })}${box('noComplement', 'Endereço sem complemento', d.noComplement)}${deliveryField('reference', 'Ponto de referência', d.reference)}${guest ? '' : `<fieldset class="save-options"><legend>Como você quer salvar?</legend><div class="save-row">${labels}</div></fieldset>`}<p class="address-note">* Campos obrigatórios. O complemento e a referência ajudam o entregador a encontrar você.</p><div class="address-action"><button class="primary" type="submit">${edit ? 'Salvar alterações' : guest ? 'Entregar neste endereço' : 'Salvar endereço'}</button></div></form></div>`;
}

/**
 * Editar endereço (#endereco/editar, Figma Endereço 07): the Dados de entrega of the Endereço salvo `a` (its street
 * split back into Rua and Número, "s/n" being Endereço sem número), with "Salvar alterações". The map is a still preview
 * of the tiles, without "Ajustar localização no mapa" (the place of a saved address isn't kept).
 */
function addressEdit(state, a) {
  return addressDetails(state, { draft: draftOf(a) });
}

/** Remover endereço (#endereco/remover, Figma Endereço 08): the confirmation (data-address-removed) or Cancelar (data-address-cancel). */
const addressRemove = (a) =>
  `<div class="address-flow"><h2 class="address-title">Remover endereço?</h2><p class="address-note">${esc(a.street)}</p><p class="address-text">Você poderá cadastrar esse endereço novamente.</p><div class="address-buttons"><button class="primary" type="button" data-address-removed>Remover endereço</button></div><button class="link address-cancel" type="button" data-address-cancel>Cancelar</button></div>`;

/** Localização indisponível (Figma Endereço 11): Seus endereços after "Usar localização atual" failed. */
function locateFailed({ customer }) {
  return `<div class="address-flow"><h2 class="address-title">Não conseguimos acessar sua localização</h2><p class="address-text">Permita o acesso à localização no navegador ou busque o endereço pelo nome da rua.</p><button class="address-search" type="button" data-address-search>${searchIcon}<span>Buscar endereço e número</span></button><button class="secondary address-wide" type="button" data-map-search>Escolher no mapa</button><button class="link address-retry" type="button" data-address-locate>${locateIcon}Tentar localização novamente</button>${customer?.addresses.length ? '<div class="address-action"><button class="primary" type="button" data-locate-reset>Usar endereço salvo</button></div>' : ''}</div>`;
}

/** Endereços de pedidos anteriores (#endereco/anteriores, Figma Endereço 05): one button per address (data-previous). */
function previousList({ customer }) {
  const card = (a) =>
    `<li><button type="button" data-previous="${a.id}">${clockIcon}<span class="saved-text"><b class="saved-label">${a.street}</b> <span class="saved-street">${[a.district, a.city].join(', ')}</span> <span class="saved-line">Último pedido em ${a.lastOrder}</span> <span class="saved-line">${[a.complement, a.reference].filter(Boolean).join(' · ')}</span></span></button></li>`;
  return `<div class="address-flow"><h2 class="address-title">Pedidos anteriores</h2><p class="address-text">Escolha um endereço que você já usou.</p><ul class="previous-addresses" aria-label="Endereços de pedidos anteriores">${customer.previous.map(card).join('')}</ul></div>`;
}

/**
 * Notice of the Carrinho travado (the Carrinho and Seus endereços), with "Voltar ao pagamento" (data-to-payment): the card
 * being processed, or the Pix pendente; `hint`, a line below its text.
 */
export function lockNotice(order, hint = '') {
  const [name, text] = order.status === 'processing' ? ['Pagamento em processamento', 'Seu pagamento está sendo processado.'] : ['Pix aguardando pagamento', 'Há um Pix aguardando pagamento.'];
  return `<div class="cart-notice cart-pix" role="group" aria-label="${name}"><div><p>${text}</p>${hint ? `<p>${hint}</p>` : ''}</div><button class="primary" type="button" data-to-payment>Voltar ao pagamento</button></div>`;
}

/** The content of the address page for `addressPage` (see state.js). With the Carrinho travado, only its notice. */
export function addressFlow(state) {
  if (cartLocked(state)) return `<div class="address-flow">${lockNotice(state.order, state.order.status === 'pix' ? 'Para alterar o endereço, escolha outra forma de pagamento.' : '')}</div>`;
  if (state.addressPage === 'buscar') return addressSearch(state);
  if (state.addressPage === 'anteriores') return previousList(state);
  const target = state.customer?.addresses.find((a) => a.id === state.addressTarget);
  if (state.addressPage === 'editar' && target) return addressEdit(state, target);
  if (state.addressPage === 'remover' && target) return addressRemove(target);
  // Right after "Salvar endereço" (no place any more), the list, while history goes back to it.
  if (state.addressPage === 'confirmar' && state.addressPlace) return addressConfirm(state);
  if (state.addressPage === 'dados' && state.addressPlace) return addressDetails(state);
  return state.locateError ? locateFailed(state) : addressList(state);
}

// Pagamento (Figma savedCard, newCard, cardProcessing and cardError) and the Pedido confirmado (Figma successCard).

/** Novo cartão number in groups of 4, and Validade MM/AA, as far as the digits go. */
export const maskCard = (d) => d.replace(/(\d{4})(?=\d)/g, '$1 ');
export const maskExpiry = (d) => (d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);

/** A field of the card: label, input (described by its hint and its error), hint and error line. */
function payField(id, label, attrs, error = '', hint = '') {
  const described = [hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(' ');
  return `<div class="pay-field"><label class="field-label" for="${id}">${label}</label><input class="field" id="${id}" ${attrs} aria-invalid="${!!error}" aria-describedby="${described}">${hint ? `<p class="pay-hint" id="${id}-hint">${hint}</p>` : ''}<p class="field-error" id="${id}-error"${error ? ' role="alert"' : ''}>${error}</p></div>`;
}

/** One option of a radio group, named by its title only and described by its text (Forma de pagamento, Seus cartões). */
function payOption(name, value, title, text, checked, kind) {
  const id = `${name}-${value}`;
  return `<label class="pay-option pay-${kind}"><input type="radio" name="${name}" value="${value}" aria-labelledby="${id}-title" aria-describedby="${id}-text"${checked ? ' checked' : ''}><span class="pay-option-text"><b id="${id}-title">${title}</b><span id="${id}-text">${text}</span></span></label>`;
}

/** The card part of the Pagamento: Seus cartões with the código de segurança and "Adicionar novo cartão", or the Novo cartão. */
function cardFields(state) {
  const p = state.payment,
    cards = state.customer.cards,
    card = chosenCard(state),
    e = p.errors,
    digits = 'inputmode="numeric" autocomplete="off"';
  const list = cards.length
    ? `<h3 class="pay-cards-title" id="pay-cards-title">Seus cartões</h3><div class="pay-cards" role="radiogroup" aria-labelledby="pay-cards-title">${cards
        .map((c) => payOption('pay-card', c.id, `${c.brand} •••• ${c.last4}`, `${esc(c.holder)} · validade ${c.expiry}`, c === card, 'card'))
        .join('')}</div>`
    : '';
  if (card)
    return `${list}${payField('pay-cvv', 'Código de segurança', `${digits} value="${p.cvv}"`, e.cvv, 'Confirme o código de segurança do cartão.')}<button class="secondary pay-new" type="button" data-pay-new>Adicionar novo cartão</button>`;
  const brand = cardBrand(p.number);
  return `${list}<div class="pay-new-card">${payField('pay-number', 'Número do cartão', `${digits} autocomplete="cc-number" value="${maskCard(p.number)}"`, e.number, brand && `Bandeira: ${brand}`)}${payField('pay-name', 'Nome impresso no cartão', `autocomplete="cc-name" value="${esc(p.name)}"`, e.name)}<div class="pay-pair">${payField('pay-expiry', 'Validade', `${digits} autocomplete="cc-exp" placeholder="MM/AA" value="${maskExpiry(p.expiry)}"`, e.expiry)}${payField('pay-new-cvv', 'Código de segurança', `${digits} value="${p.newCvv}"`, e.newCvv)}</div><label class="check pay-save"><input type="checkbox" id="pay-save"${p.save ? ' checked' : ''}> Salvar cartão para os próximos pedidos</label></div>`;
}

/**
 * Forma de pagamento of the Pagamento (below the delivery card): Pix or Cartão de crédito (radios; main.js reads
 * their names and the data-pay-* buttons), the card's fields and, after a recusa, the failure (Figma cardError).
 * Pix only selects for now.
 */
export function paymentStep(state) {
  const { method, failed } = state.payment;
  const failure = failed
    ? '<div class="pay-failure" role="alert"><p class="pay-failure-title">Não conseguimos aprovar o pagamento.</p><p>Confira os dados ou escolha outra forma de pagamento.</p></div>'
    : '';
  return `<section class="checkout-step payment-step" aria-labelledby="payment-title"><h2 id="payment-title">Forma de pagamento</h2><div class="pay-methods" role="radiogroup" aria-labelledby="payment-title">${payOption('pay-method', 'pix', 'Pix', 'Pague com QR Code ou código Pix.', method === 'pix', 'method')}${payOption('pay-method', 'card', 'Cartão de crédito', 'Pagamento à vista. Use um cartão salvo ou adicione outro.', method === 'card', 'method')}</div>${method === 'card' ? cardFields(state) : ''}${failure}</section>`;
}

/** The Pagamento's action: "Confirmar e pagar R$ X" (card; disabled while no Forma de pagamento is chosen) or "Gerar Pix". */
const payButton = (state) =>
  state.payment.method === 'pix'
    ? '<button class="primary pay-action" type="button" data-pix-generate>Gerar Pix</button>'
    : `<button class="primary pay-action" type="button" data-pay-confirm${state.payment.method ? '' : ' disabled'}>Confirmar e pagar ${money(orderTotal(state.cart))}</button>`;

/** The Pagamento's action in the Resumo do pedido, with its note (the action is hidden below 1024px, see paymentBar). */
export const paymentAction = (state) => `${payButton(state)}<p class="pay-note">Confira o endereço antes de confirmar.</p>`;

/**
 * Below 1024px (Figma "Checkout / ação fixa"): Total do pedido and the Pagamento's action, fixed at the bottom of the
 * screen in place of the Resumo do pedido's action. Not shown from 1024px.
 */
export const paymentBar = (state) =>
  `<div class="pay-bar" role="region" aria-label="Total do pedido e pagamento"><p><span>Total do pedido</span> <strong>${money(orderTotal(state.cart))}</strong></p>${payButton(state)}</div>`;

/** Processing of the card (Figma cardProcessing), in place of the address and the Forma de pagamento. */
export const processingStep = (order) =>
  `<section class="checkout-step processing-step" aria-labelledby="processing-title" role="status" tabindex="-1"><h2 id="processing-title">Processando pagamento</h2><p>Aguarde a confirmação do seu cartão.</p><p class="processing-total">${money(order.total)}</p></section>`;

// Pix (Figma pixWaiting, pixExpired and pixApproved).

/**
 * The QR Code of the Pix: fixed, drawn by code (a demonstration, not a readable code). 25 × 25 modules: the three
 * finder squares and the rest from a fixed pseudo-random sequence, as one path.
 */
const qrPath = (() => {
  const n = 25,
    finder = (x, y) => [[0, 18], [18, 0], [0, 0]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7),
    on = [];
  let seed = 1024;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      if (!finder(x, y) && seed / 2147483648 < 0.5) on.push(`M${x} ${y}h1v1h-1z`);
    }
  for (const [fx, fy] of [[0, 0], [18, 0], [0, 18]]) on.push(`M${fx} ${fy}h7v7h-7zM${fx + 1} ${fy + 1}v5h5v-5zM${fx + 2} ${fy + 2}h3v3h-3z`);
  return on.join('');
})();
const qrCode = `<svg class="pix-qr" viewBox="-2 -2 29 29" role="img" aria-label="QR Code do Pix" shape-rendering="crispEdges"><path d="${qrPath}" fill="#000" fill-rule="evenodd"/></svg>`;

/** What is left of the Pix's validity, as mm:ss (10:00 at most, 00:00 when expired). */
export const pixClock = (expiresAt, now) => {
  const s = Math.max(0, Math.min(pixValidity, Math.ceil((expiresAt - now) / 1000) * 1000)) / 1000;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * The Pix pendente in place of the address and the Forma de pagamento: "Só falta pagar o Pix" (Aguardando pagamento,
 * the QR Code, the live countdown in [data-pix-clock], data-pix-copy, data-pix-cancel) or "Seu Pix expirou"
 * (data-pix-renew, data-pix-cancel). `now`: the clock's ms.
 */
export function pixStep(order, now) {
  const cancel = '<button class="secondary" type="button" data-pix-cancel>Escolher outra forma de pagamento</button>',
    value = `<p class="pix-value">Valor a pagar: ${money(order.total)}</p>`;
  if (order.pix === 'expired')
    return `<section class="checkout-step pix-step" aria-labelledby="pix-title"><h2 id="pix-title" tabindex="-1">Seu Pix expirou</h2><p>Gere um novo código para concluir o pagamento.</p>${value}<div class="pix-actions"><button class="primary" type="button" data-pix-renew>Gerar novo Pix</button>${cancel}</div></section>`;
  return `<section class="checkout-step pix-step" aria-labelledby="pix-title"><h2 id="pix-title" tabindex="-1">Só falta pagar o Pix</h2><p>Escaneie o QR Code com o app do seu banco.</p>${value}<div class="pix-qr-box">${qrCode}</div><p class="pix-expiry">Este código expira em <span data-pix-clock>${pixClock(order.expiresAt, now)}</span></p><button class="primary" type="button" data-pix-copy>Copiar código Pix</button><p class="pix-waiting">Aguardando pagamento</p><p class="pix-text">Assim que o pagamento for aprovado, confirmamos seu pedido.</p>${cancel}<p class="pix-note">QR e valores demonstrativos para este protótipo.</p></section>`;
}

/** Pagamento aprovado (Figma pixApproved), on its way to the Pedido confirmado. */
export const pixApprovedStep = (order) =>
  `<section class="checkout-step processing-step" id="pix-approved" aria-labelledby="approved-title" role="status" tabindex="-1"><h2 id="approved-title">Pagamento aprovado!</h2><p>Estamos confirmando seu pedido.</p><p class="processing-total">${money(order.total)}</p></section>`;

/**
 * Pedido confirmado (#pedido/<id>, Figma successCard): every step done, the id, the estimate, the address, how it was
 * paid (always masked) and the Resumo do pedido without Editar carrinho; "Acompanhar pedido" (data-order-track) and
 * "Voltar ao cardápio" (data-order-menu).
 */
export function orderPage(order) {
  return `${progress(steps.length)}<div class="checkout-body"><div class="checkout-step order-confirmed"><h1 id="order-title" tabindex="-1">Pedido confirmado!</h1><p class="order-lead">Seu pedido já está com a gente.</p><p class="order-id">Pedido #${order.id}</p><p class="order-eta">Previsão de entrega: ${deliveryTime}</p>${deliveryLines(order.address)}<p class="order-paid">Pago com ${order.paidWith} · ${money(order.total)}</p><div class="order-actions"><button class="primary" type="button" data-order-track>Acompanhar pedido</button><button class="secondary" type="button" data-order-menu>Voltar ao cardápio</button></div></div>${orderSummary(order.items, true, { edit: false })}</div>`;
}
