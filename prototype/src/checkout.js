// Checkout ("Finalizar pedido", #checkout) and Seus endereços (#endereco): the indicador de etapas, the Resumo do pedido,
// the Identificação, the address list, the pages of a new address (#endereco/buscar, /confirmar, /dados) and the
// Pagamento, as HTML.
import { recipes, removedLine } from './ingredients.js';
import { money, marks, itemName, cartTotal } from './state.js';
import { deliveryFee, deliveryTime, searchPlaces } from './checkout-fixtures.js';
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
 * Taxa de entrega and the Total do pedido (Total dos itens + Taxa de entrega).
 */
export function orderSummary(cart, delivered = false) {
  const items = cartTotal(cart),
    fee = delivered
      ? `<p class="order-line order-fee"><span>Taxa de entrega</span><span class="order-price">${money(deliveryFee)}</span></p><p class="order-grand"><span>Total do pedido</span><strong class="order-price">${money(items + deliveryFee)}</strong></p>`
      : '';
  return `<aside class="order-summary" aria-labelledby="order-summary-title"><h2 id="order-summary-title">Resumo do pedido</h2><ul class="order-items" aria-label="Itens do pedido">${cart.map(summaryItem).join('')}</ul><p class="order-line order-total"><span>Total dos itens</span><span class="order-price">${money(items)}</span></p>${fee}<button class="secondary" data-to-cart>Editar carrinho</button></aside>`;
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

/** The lines of an address after its street: "Bairro, Cidade" and "Complemento · Referência" (the empty ones left out). */
const addressLines = (a) => [[a.district, a.city].filter(Boolean).join(', '), [a.complement, a.reference].filter(Boolean).join(' · ')].filter(Boolean);

/** One Endereço salvo of the list: a radio named by its whole text, marked with ✓ and a red border (Figma Endereço 01/16). */
function savedAddressCard(a, picked) {
  return `<div class="saved-address" data-address="${a.id}"><label><input class="saved-radio" type="radio" name="saved-address" value="${a.id}"${picked ? ' checked' : ''}>${labelIcons[a.label] ?? labelIcons.Favoritos}<span class="saved-text"><b class="saved-label">${a.label}</b> <span class="saved-street">${a.street}</span> ${addressLines(a)
    .map((l) => `<span class="saved-line">${l}</span>`)
    .join(' ')}</span><span class="saved-check" aria-hidden="true">${icon('<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', 20)}</span></label></div>`;
}

/**
 * Seus endereços (#endereco, Figma Endereço 01 and 16): the search and "Usar localização atual" (wired in the address
 * search ticket: data-address-search, data-address-locate); for a client with addresses, the Endereços salvos (one
 * marked, `addressPick`) and "Entregar neste endereço" (data-address-deliver); for a Cliente cadastrado, "Endereços de
 * pedidos anteriores" (data-address-previous). A Novo cliente without addresses sees no empty sections.
 */
export function addressList({ customer, addressPick }) {
  const saved = customer.addresses;
  const list = saved.length
    ? `<h2 class="address-section" id="saved-title">Endereços salvos</h2><div class="saved-addresses" role="radiogroup" aria-labelledby="saved-title">${saved.map((a) => savedAddressCard(a, a.id === addressPick)).join('')}</div>`
    : '';
  const previous = customer.registered ? `<button class="link address-previous" type="button" data-address-previous>${clockIcon}Endereços de pedidos anteriores</button>` : '';
  const deliver = saved.length ? `<div class="address-action"><button class="primary" type="button" data-address-deliver${saved.some((a) => a.id === addressPick) ? '' : ' disabled'}>Entregar neste endereço</button></div>` : '';
  return `<div class="address-flow"><button class="address-search" type="button" data-address-search>${searchIcon}<span>Buscar endereço e número</span></button><button class="address-locate" type="button" data-address-locate>${locateIcon}<span><span class="locate-title">Usar localização atual</span> <small>Permita o acesso à sua localização.</small></span></button>${list}${previous}${deliver}</div>`;
}

/**
 * Endereço de entrega in the Checkout (Figma pix/savedCard, top card): the label, street and number, city, complement and
 * reference, a divider and the Entrega estimada, with Alterar (data-change-address, to #endereco).
 */
export function deliveryCard(a) {
  const extra = [a.complement, a.reference].filter(Boolean);
  return `<section class="checkout-step delivery-card" aria-labelledby="delivery-title"><div class="delivery-head"><h2 id="delivery-title">Endereço de entrega</h2><button class="secondary" type="button" data-change-address>Alterar</button></div><p class="delivery-label">${a.label}</p><p class="delivery-street">${a.street}</p><p class="delivery-city">${a.city}</p>${extra.length ? `<p class="delivery-extra">${extra.map((t) => `<span>${t}</span>`).join('')}</p>` : ''}<p class="delivery-time">Entrega estimada: ${deliveryTime}</p></section>`;
}

/** Forma de pagamento of the Pagamento: none yet (Pix and card come with the payment tickets, below the delivery card). */
export const paymentStep = () => '';

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
const quote = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The Busca's field (Figma Endereço 13): a search box named "Buscar endereço e número". */
const searchField = (query) =>
  `<form class="address-query" role="search" data-address-query>${searchIcon}<input class="address-input" id="address-query" type="search" autocomplete="off" aria-label="Buscar endereço e número" placeholder="Buscar endereço e número" value="${quote(query)}"></form>`;
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
  return `<div class="delivery-field delivery-${name}"><label class="field-label" for="${id}">${label}${required ? '<span aria-hidden="true"> *</span>' : ''}</label><input class="field" id="${id}" name="${name}" value="${quote(value)}"${required && !disabled ? ' required' : ''}${disabled ? ' disabled' : ''} aria-invalid="${!!error}" aria-describedby="${id}-error"><p class="field-error" id="${id}-error"${error ? ' role="alert"' : ''}>${error ?? ''}</p></div>`;
}
const box = (name, label, checked) => `<label class="check delivery-check"><input type="checkbox" name="${name}"${checked ? ' checked' : ''}> ${label}</label>`;

/**
 * Dados de entrega (#endereco/dados, Figma Endereço 04): the map preview with "Ajustar localização no mapa", Rua*,
 * Bairro*, Número* (or "Endereço sem número"), Complemento (or "Endereço sem complemento"), Ponto de referência,
 * "Como você quer salvar?" and "Salvar endereço". It starts from the place; after errors, from what was sent.
 */
function addressDetails({ addressPlace: p, addressDraft, addressErrors: e }) {
  const d = addressDraft ?? { street: p.street, district: p.district, number: p.number, noNumber: false, complement: '', noComplement: false, reference: '', label: 'Casa' };
  const labels = ['Casa', 'Trabalho', 'Favoritos']
    .map((l) => `<label class="save-as"><input type="radio" name="label" value="${l}"${d.label === l ? ' checked' : ''}>${saveIcons[l]}<span>${l}</span></label>`)
    .join('');
  return `<div class="address-flow"><h2 class="address-title">Complete o endereço</h2>${staticMap(p.pan, false)}<button class="link address-adjust" type="button" data-address-adjust>${pinIcon}Ajustar localização no mapa</button><form class="delivery-form" data-address-form novalidate><div class="delivery-pair">${deliveryField('street', 'Rua', d.street, { required: true, error: e.street })}${deliveryField('district', 'Bairro', d.district, { required: true, error: e.district })}</div>${deliveryField('number', 'Número', d.noNumber ? '' : d.number, { required: true, disabled: d.noNumber, error: e.number })}${box('noNumber', 'Endereço sem número', d.noNumber)}${deliveryField('complement', 'Complemento', d.noComplement ? '' : d.complement, { disabled: d.noComplement })}${box('noComplement', 'Endereço sem complemento', d.noComplement)}${deliveryField('reference', 'Ponto de referência', d.reference)}<fieldset class="save-options"><legend>Como você quer salvar?</legend><div class="save-row">${labels}</div></fieldset><p class="address-note">* Campos obrigatórios. O complemento e a referência ajudam o entregador a encontrar você.</p><div class="address-action"><button class="primary" type="submit">Salvar endereço</button></div></form></div>`;
}

/** Localização indisponível (Figma Endereço 11): Seus endereços after "Usar localização atual" failed. */
function locateFailed({ customer }) {
  return `<div class="address-flow"><h2 class="address-title">Não conseguimos acessar sua localização</h2><p class="address-text">Permita o acesso à localização no navegador ou busque o endereço pelo nome da rua.</p><button class="address-search" type="button" data-address-search>${searchIcon}<span>Buscar endereço e número</span></button><button class="secondary address-wide" type="button" data-map-search>Escolher no mapa</button><button class="link address-retry" type="button" data-address-locate>${locateIcon}Tentar localização novamente</button>${customer.addresses.length ? '<div class="address-action"><button class="primary" type="button" data-locate-reset>Usar endereço salvo</button></div>' : ''}</div>`;
}

/** The content of the address page for `addressPage` (see state.js). */
export function addressFlow(state) {
  if (state.addressPage === 'buscar') return addressSearch(state);
  // Right after "Salvar endereço" (no place any more), the list, while history goes back to it.
  if (state.addressPage === 'confirmar' && state.addressPlace) return addressConfirm(state);
  if (state.addressPage === 'dados' && state.addressPlace) return addressDetails(state);
  return state.locateError ? locateFailed(state) : addressList(state);
}
