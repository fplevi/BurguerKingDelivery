// Acompanhamento de um Pedido confirmado (#conta/pedidos/<id>, Figma Pedidos 351-14130…351-15744): the Situação, the map
// with the loja, the destination and the entregador, the linha do tempo, the contacts by WhatsApp and the Items.
import tile0 from '../Assets/maps/paulista-0.png';
import tile1 from '../Assets/maps/paulista-1.png';
import tile2 from '../Assets/maps/paulista-2.png';
import tile3 from '../Assets/maps/paulista-3.png';
import storePin from '../Assets/map-pins/loja-128.webp';
import destinationPin from '../Assets/map-pins/entrega-128.webp';
import riderPin from '../Assets/map-pins/entregador-128.webp';
import { esc, orderSummary } from './checkout.js';
import { situation, situationName, steps, delivered, stepTime, forecast, hour, day, store, routeKm } from './orders.js';

/** WhatsApp of the demo: both contacts open the author's number with this message; neither is a production setting. */
export const whatsapp = `https://wa.me/5561999077204?text=${encodeURIComponent('Olá, vi seu projeto do Burger King e gostei bastante. Podemos conversar?')}`;
/** The entregador of the demo, from Pedido retirado on. */
export const rider = { name: 'Carlos', vehicle: 'Honda CG · placa ABC •••4' };

/**
 * The route over the OpenStreetMap tiles (512 × 512 px, the same as the address pages): from the loja along Rua Carlos
 * Comenale, then up Rua Itapeva to the destination. Its length on the map stands for the 2,4 km of the demo.
 */
const route = [
  [95, 170],
  [205, 262],
  [234, 205],
];
const legs = route.slice(1).map(([x, y], i) => Math.hypot(x - route[i][0], y - route[i][1]));
const length = legs.reduce((a, b) => a + b, 0);
/** The point at `t` (0 at the loja, 1 at the destination) along the route. */
function along(t) {
  let left = Math.max(0, Math.min(1, t)) * length;
  for (let i = 0; i < legs.length; i++) {
    if (left <= legs[i] || i === legs.length - 1) {
      const k = legs[i] ? Math.min(1, left / legs[i]) : 0;
      return [route[i][0] + (route[i + 1][0] - route[i][0]) * k, route[i][1] + (route[i + 1][1] - route[i][1]) * k];
    }
    left -= legs[i];
  }
}
/** "2,4 km" × `share`, as the demo's remaining distance. */
const km = (share) => `${(2.4 * share).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

/**
 * Where the entregador is (0-1 along the route): from Pedido retirado (at the loja) to Pedido chegou (at the destination),
 * moving with the time between them; null before the retirada. A Pedido fixed in its step stays where that step puts it.
 */
export function riderAt(order, now) {
  const s = situation(order, now);
  if (s.current < 4) return null;
  if (s.current >= 6) return 1;
  if (order.times) return 0;
  const from = order.confirmedAt + 4 * stepTime;
  return Math.max(0, Math.min(1, (now - from) / (2 * stepTime)));
}

/** The map (an SVG over the tiles, cropped around the route): the route, the loja, the destination and the entregador. */
function trackMap(order, now) {
  const at = riderAt(order, now);
  const tiles = [tile0, tile1, tile2, tile3].map((src, i) => `<image href="${src}" x="${(i % 2) * 256}" y="${Math.floor(i / 2) * 256}" width="256" height="256"/>`).join('');
  const [sx, sy] = route[0],
    [dx, dy] = route.at(-1);
  const moto = at == null ? '' : (() => {
    const [mx, my] = along(at);
    return `<image class="map-rider" href="${riderPin}" x="${mx - 17}" y="${my - 12}" width="34" height="24"/>`;
  })();
  const path = route.map(([x, y]) => `${x},${y}`).join(' ');
  return `<div class="track-map"><svg viewBox="60 140 220 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa: a loja, o seu endereço e a rota${at == null ? '' : ' com o entregador'}">${tiles}<polyline points="${path}" fill="none" stroke="#d90000" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><image href="${storePin}" x="${sx - 16}" y="${sy - 10}" width="32" height="20"/><image href="${destinationPin}" x="${dx - 12}" y="${dy - 22}" width="24" height="22"/>${moto}</svg><p class="map-credit"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p></div>`;
}

/** The linha do tempo: reached steps with their hour, the current one highlighted, then the next ones (or Cancelado). */
function timeline(order, now) {
  const s = situation(order, now);
  const item = (name, time, kind) =>
    `<li class="tl-${kind}"${kind === 'current' ? ' aria-current="step"' : ''}><span class="tl-name">${name}</span><span class="tl-when">${time ? `${hour(time)} · ` : ''}${{ done: 'Concluído', current: s.done ? (s.current === delivered ? 'Entregue' : 'Concluído') : 'Em andamento', next: 'Próxima etapa', cancelled: 'Cancelado' }[kind]}</span></li>`;
  const reached = steps.slice(0, s.current + 1).map((n, i) => item(n, s.times[i], i === s.current && !s.cancelled ? 'current' : 'done'));
  const rest = s.cancelled ? [item('Cancelado', order.cancelledAt, 'cancelled')] : steps.slice(s.current + 1).map((n) => item(n, null, 'next'));
  return `<section class="account-card track-steps" aria-labelledby="steps-title"><h2 id="steps-title">Situação do pedido</h2><ol class="timeline">${[...reached, ...rest].join('')}</ol></section>`;
}

const waIcon = '<span class="track-whatsapp-icon" aria-hidden="true"></span>';
const waLink = (label, kind) => `<a class="${kind} account-action track-whatsapp" href="${whatsapp}" target="_blank" rel="noopener">${waIcon}<span>${label}</span></a>`;
/** The loja: always, with its WhatsApp. */
const storeCard = () => `<div class="track-store"><p class="track-store-name">${store.name}</p><p class="account-meta">Loja responsável pelo seu pedido</p>${waLink('WhatsApp da loja', 'secondary')}</div>`;

/** "hoje, às 13h02", "ontem, às 13h02" or "em 8 de outubro, às 13h02". */
const when = (ms, now) => {
  const d = day(ms, now);
  return `${d === 'Hoje' || d === 'Ontem' ? d.toLowerCase() : `em ${d}`}, às ${hour(ms)}`;
};
/** "Av. Paulista, 1578 · Apto. 21". */
const where = (a) => [a.street, a.complement].filter(Boolean).map(esc).join(' · ');

/**
 * The whole acompanhamento of `order` at `now`. A Pedido entregue or cancelado (Figma 20, without the map nor the
 * entregador) keeps only when it ended, the loja with its WhatsApp, the linha do tempo of what happened and the Items.
 */
export function trackingView(order, now) {
  const s = situation(order, now),
    [from, to] = forecast(order);
  // Entregue or cancelado: when it ended (and, cancelado, the payment's fate, without a deadline nobody gave).
  const end = s.cancelled ? order.cancelledAt : s.times[delivered];
  const head = s.done
    ? `<section class="account-card track-head" aria-labelledby="track-title"><h2 id="track-title">${s.cancelled ? 'Pedido cancelado' : 'Pedido entregue'}</h2><p>${s.cancelled ? 'Cancelado' : 'Entregue'} ${when(end, now)}</p>${s.cancelled ? '<p>O valor será devolvido na mesma forma de pagamento.</p>' : ''}<p class="account-meta">Pedido #${order.id} · ${day(order.confirmedAt, now)}, ${hour(order.confirmedAt)}</p></section>`
    : `<section class="account-card track-head" aria-labelledby="track-title"><h2 id="track-title">${situationName(order, now)}</h2><p class="track-eta">Chega entre ${hour(from)} e ${hour(to)}</p><p class="account-meta">Pedido #${order.id} · ${day(order.confirmedAt, now)}, ${hour(order.confirmedAt)}</p></section>`;
  const items = `<div class="track-items">${orderSummary(order.items, true, { edit: false, action: `<p class="account-meta">Pago com ${esc(order.paidWith)}</p><a class="secondary account-action account-back" href="#conta/pedidos"><span class="navigation-arrow" aria-hidden="true"></span>Voltar</a>` })}</div>`;
  if (s.done) return `<div class="track">${head}<div class="track-main"><section class="account-card" aria-label="Loja">${storeCard()}</section></div>${timeline(order, now)}${items}</div>`;
  const at = riderAt(order, now);
  const status = at == null ? 'Acompanhe o motoboy após a retirada' : at >= 1 ? 'Chegou ao seu endereço' : `${at === 0 ? 'Saindo da loja' : 'A caminho'} · ${km(1 - at)} restantes`;
  const delivery = `<section class="account-card" aria-labelledby="map-title"><h2 id="map-title">Acompanhe sua entrega</h2><p class="account-meta">${at == null ? 'Rota entre a loja e seu endereço' : 'Localização atualizada agora'}</p>${trackMap(order, now)}<p>BK → ${esc(order.address.label)} · ${routeKm}</p><p class="account-meta" role="status">${status}</p><p class="account-meta">${where(order.address)}</p></section>`;
  const contact =
    at == null
      ? `<section class="account-card" aria-labelledby="rider-title"><h2 id="rider-title">Entregador ainda não atribuído</h2><p class="account-meta">O contato aparece após a retirada</p>${storeCard()}</section>`
      : `<section class="account-card" aria-labelledby="rider-title"><h2 id="rider-title">${rider.name} · seu entregador</h2><p class="account-meta">${rider.vehicle}</p>${waLink('WhatsApp do entregador', 'primary')}${storeCard()}</section>`;
  return `<div class="track">${head}<div class="track-main">${delivery}${contact}</div>${timeline(order, now)}${items}</div>`;
}
