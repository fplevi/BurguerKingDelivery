// Pedidos confirmados of the client and their Situação do pedido (GLOSSARY), for Minha conta, Meus pedidos and the
// acompanhamento. A Pedido of the session advances one step every `stepTime` ms from its confirmation (confirmedAt), so
// reloading or coming back resumes where it should be. The Cliente cadastrado of the demo also has fixed Pedidos.
import { savedAddresses, customers, deliveryFee } from './checkout-fixtures.js';
import { recipes } from './ingredients.js';
import { products } from './products.js';
import { comboFee } from './state.js';

/** The steps of a Pedido entregue by the entregador, in order (retirada: the entregador's, at the loja). */
export const steps = ['Pedido realizado', 'Pagamento confirmado', 'Pedido em preparação', 'Aguardando retirada', 'Pedido retirado', 'Pedido a caminho', 'Pedido chegou', 'Pedido entregue'];
export const delivered = steps.length - 1;
/** Demo pace: one step every ~10 s. */
export const stepTime = 10_000;
const minute = 60_000;

/**
 * The Situação of `order` at `now`: `times` (the ms each step was reached, null for those not reached yet), `current`
 * (the index of the last one reached), `cancelled` (Cancelado after `current`) and `done` (entregue or cancelado).
 */
export function situation(order, now) {
  if (order.times) {
    const current = order.times.length - 1;
    return { times: steps.map((s, i) => order.times[i] ?? null), current, cancelled: !!order.cancelledAt, done: !!order.cancelledAt || current === delivered };
  }
  const current = Math.max(0, Math.min(delivered, Math.floor((now - order.confirmedAt) / stepTime)));
  return { times: steps.map((s, i) => (i <= current ? order.confirmedAt + i * stepTime : null)), current, cancelled: false, done: current === delivered };
}
/** Name of the Situação: the step reached, or "Pedido cancelado". */
export const situationName = (order, now) => {
  const s = situation(order, now);
  return s.cancelled ? 'Pedido cancelado' : steps[s.current];
};
/** Previsão de entrega: between 30 and 45 min after the confirmation (the fixed ones keep their own). */
export const forecast = (order) => order.forecast ?? [order.confirmedAt + 30 * minute, order.confirmedAt + 45 * minute];

/** "19h12". */
export const hour = (ms) => {
  const d = new Date(ms);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};
/** "Hoje", "Ontem" or "8 de outubro". */
export const day = (ms, now) => {
  const d = new Date(ms),
    today = new Date(now);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Hoje';
  if (same(d, new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
};
/** Units in a Pedido. */
export const units = (order) => order.items.reduce((n, i) => n + i.qty, 0);

const item = (product, qty, combo = false, drink = '') => ({ product, qty, combo, drink, removed: [], price: (recipes[product]?.price ?? products[product].price) + (combo ? comboFee : 0) });
const fixed = (id, confirmedAt, address, items, paidWith, extra) => {
  const sum = items.reduce((n, i) => n + i.price * i.qty, 0);
  return { id, fixed: true, confirmedAt, address, items, fee: deliveryFee, total: sum + deliveryFee, paidWith, ...extra };
};
/** The demo's Pedido em andamento was confirmed 21 min before the page loaded (so it is always "Hoje" and stays put). */
const loaded = Math.floor((Date.now() - 21 * minute) / minute) * minute;
const at = (y, mo, d, h, m) => new Date(y, mo - 1, d, h, m).getTime();
/**
 * The fixed Pedidos of the demo's Cliente cadastrado: #BK-10482 em andamento (Pedido retirado, today), #BK-10397 entregue
 * and #BK-10276 cancelado pela loja during the preparação, after the payment.
 */
export function fixedOrders(now) {
  const t = loaded;
  const casa = savedAddresses[0];
  return [
    fixed('BK-10482', t, casa, [item('whopper', 1, true, 'Coca-Cola'), item('baldeBatata', 1)], 'cartão Visa •••• 4242', {
      times: [0, 1, 6, 17, 21].map((m) => t + m * minute),
      forecast: [t + 33 * minute, t + 53 * minute],
    }),
    fixed('BK-10397', at(2026, 10, 8, 12, 24), casa, [item('whopper', 2, true, 'Coca-Cola Zero'), item('esferasPepperoni', 1), item('batataFrita', 1)], 'Pix', {
      times: [0, 1, 5, 18, 22, 26, 37, 38].map((m) => at(2026, 10, 8, 12, 24) + m * minute),
    }),
    fixed('BK-10276', at(2026, 10, 3, 20, 6), casa, [item('cheddarDuplo', 1, true, 'Sprite')], 'cartão Visa •••• 4242', {
      times: [0, 1, 6].map((m) => at(2026, 10, 3, 20, 6) + m * minute),
      cancelledAt: at(2026, 10, 3, 20, 20),
    }),
  ];
}

/**
 * The client's Pedidos confirmados, newest first: those of the session confirmed with their celular, then (a Cliente
 * cadastrado of the demo) the fixed ones; #BK-10482 only while no Pedido of the session is in progress. None without a client.
 */
export function ordersOf(state, now) {
  const phone = state.customer?.phone;
  if (!phone) return [];
  const mine = state.orders.filter((o) => o.phone === phone).reverse();
  const live = mine.some((o) => !situation(o, now).done);
  const extra = customers[phone] ? fixedOrders(now).filter((o) => !(live && o.id === 'BK-10482')) : [];
  return [...mine, ...extra];
}
/** The most recent Pedido still in progress (neither entregue nor cancelado), or null. */
export const currentOrder = (state, now) => ordersOf(state, now).find((o) => !situation(o, now).done) ?? null;
