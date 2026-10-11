// Checkout ("Finalizar pedido", #checkout): the indicador de etapas and the Resumo do pedido, as HTML.
import { recipes, removedLine } from './ingredients.js';
import { money, marks, itemName, cartTotal } from './state.js';

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

/** Resumo do pedido: the Itens, Total dos itens and Editar carrinho. */
export function orderSummary(cart) {
  return `<aside class="order-summary" aria-labelledby="order-summary-title"><h2 id="order-summary-title">Resumo do pedido</h2><ul class="order-items" aria-label="Itens do pedido">${cart.map(summaryItem).join('')}</ul><p class="order-line order-total"><span>Total dos itens</span><span class="order-price">${money(cartTotal(cart))}</span></p><button class="secondary" data-to-cart>Editar carrinho</button></aside>`;
}
