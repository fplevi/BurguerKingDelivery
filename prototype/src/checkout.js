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
