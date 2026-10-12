// Minha conta (Figma Conta 07-22): the navigation (a side list on desktop, a list that opens below 1024px) and the
// content of each section. Rebuilt by main.js on every change; its links are plain hashes (#conta/<page>).
import { maskPhone, esc, field, sentTo, maskCard, maskExpiry } from './checkout.js';
import { money } from './state.js';
import { currentOrder, situationName, forecast, hour, day, units } from './orders.js';

const icon = (path) => `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${path}</svg>`;
const line = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
/** Icons Outline Bold of the Figma: house, person, pin, card, receipt, exit. */
const icons = {
  inicio: icon(`<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" ${line}/>`),
  dados: icon(`<circle cx="12" cy="8" r="4" ${line}/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" ${line}/>`),
  enderecos: icon(`<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" ${line}/><circle cx="12" cy="10" r="2.3" ${line}/>`),
  pagamentos: icon(`<rect x="3" y="6" width="18" height="13" rx="2" ${line}/><path d="M3 10.5h18M7 15h4" ${line}/>`),
  pedidos: icon(`<rect x="4" y="4" width="16" height="16" rx="2" ${line}/><path d="M8 9h8M8 13h8M8 17h5" ${line}/>`),
  sair: icon(`<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" ${line}/>`),
};
const chevron = icon(`<path d="m6 9 6 6 6-6" ${line}/>`);

/** The sections of Minha conta, in the navigation's order; Sair is apart, below a divider. */
export const accountPages = {
  inicio: { hash: 'conta', label: 'Minha conta', title: 'Minha conta' },
  dados: { hash: 'conta/dados', label: 'Dados pessoais', title: 'Dados pessoais' },
  enderecos: { hash: 'conta/enderecos', label: 'Endereços', title: 'Endereços' },
  pagamentos: { hash: 'conta/pagamentos', label: 'Formas de pagamento', title: 'Formas de pagamento' },
  pedidos: { hash: 'conta/pedidos', label: 'Meus pedidos', title: 'Meus pedidos' },
  sair: { hash: 'conta/sair', label: 'Sair', title: 'Sair da conta?' },
  // Alterar celular belongs to Dados pessoais in the navigation; its title follows the step.
  celular: { hash: 'conta/celular', label: 'Dados pessoais', title: 'Alterar celular', nav: 'dados' },
  cartao: { hash: 'conta/cartao', label: 'Formas de pagamento', title: 'Adicionar cartão', nav: 'pagamentos' },
  'remover-cartao': { hash: 'conta/remover-cartao', label: 'Formas de pagamento', title: 'Remover cartão?', nav: 'pagamentos' },
  'remover-endereco': { hash: 'conta/remover-endereco', label: 'Endereços', title: 'Remover endereço?', nav: 'enderecos' },
};

/** One link of the navigation; the current section has aria-current and the red bar. */
const navLink = (key, current) => {
  const p = accountPages[key];
  return `<li><a href="#${p.hash}"${key === current ? ' aria-current="page"' : ''}>${icons[key]}<span>${p.label}</span></a></li>`;
};
/**
 * The navigation: below 1024px a button with the current section opens the list (`open`); on desktop the list is
 * always shown and the button hidden.
 */
function accountNav(current, open) {
  const p = accountPages[current] ?? accountPages.pedidos;
  const links = ['inicio', 'dados', 'enderecos', 'pagamentos', 'pedidos'].map((k) => navLink(k, current)).join('');
  return `<nav class="account-nav${open ? ' open' : ''}" aria-label="Minha conta"><button class="account-menu" type="button" aria-expanded="${open}" aria-controls="account-links" data-account-menu>${icons[current] ?? icons.pedidos}<span>${p.label}</span>${chevron}</button><div class="account-links" id="account-links"><ul>${links}</ul><ul class="account-exit">${navLink('sair', current)}</ul></div></nav>`;
}

/** Minha conta (Figma 07): the greeting with the celular and, with a Pedido in progress, its card; then "Ver todos os pedidos". */
function home(state, now) {
  const c = state.customer,
    first = c.name.split(/\s+/)[0];
  const o = currentOrder(state, now);
  const [from, to] = o ? forecast(o) : [];
  const order = o
    ? `<section class="account-card" aria-labelledby="current-order-title"><h2 id="current-order-title">Pedido em andamento</h2><p class="account-meta">#${o.id} · ${day(o.confirmedAt, now)}, às ${hour(o.confirmedAt)}</p><p>${situationName(o, now)} · Previsão: ${hour(from)}–${hour(to)}</p><p>${units(o)} ${units(o) === 1 ? 'item' : 'itens'} · ${money(o.total)}</p><a class="primary account-action" href="#conta/pedidos/${o.id}">Acompanhar pedido</a></section>`
    : '';
  return `<section class="account-card" aria-labelledby="hello-title"><h2 id="hello-title">Olá, ${esc(first)}</h2><p>Seu cadastro está vinculado ao celular ${maskPhone(c.phone)}.</p><p>Atualize seus dados e acompanhe seus pedidos em um só lugar.</p><a class="primary account-action" href="#conta/dados">Editar meus dados</a></section>${order}<a class="secondary account-action" href="#conta/pedidos">Ver todos os pedidos</a>`;
}

/**
 * Dados pessoais (Figma 08): the celular (read only) with Alterar celular, Nome completo and E-mail (opcional), with
 * "Salvar alterações" and "Cancelar". The fields start from the cadastro; main.js keeps what was typed after errors.
 */
function profile({ customer: c, profileErrors: e }) {
  return `<section class="account-card" aria-label="Dados pessoais"><form class="id-form account-form" data-profile-form novalidate><p class="account-meta">Seu celular identifica este cadastro.</p>${field('profile-phone', 'Celular', `type="tel" readonly value="${maskPhone(c.phone)}"`)}<a class="secondary account-action" href="#conta/celular">Alterar celular</a>${field('profile-name', 'Nome completo', `autocomplete="name" required value="${esc(c.name)}"`, e.name)}${field('profile-email', 'E-mail (opcional)', `type="email" autocomplete="email" value="${esc(c.email)}"`, e.email)}<p class="account-meta">O e-mail é opcional. A confirmação de acesso continua pelo celular.</p><div class="account-buttons account-buttons-column"><button class="primary account-action" type="submit">Salvar alterações</button><a class="secondary account-action" href="#conta">Cancelar</a></div></form></section>`;
}

/** Titles and the line above the card of each step of Alterar celular (Figma 09-11). */
const phoneTitles = { phone: 'Alterar celular', code: 'Confirmar novo celular', conflict: 'Este celular já tem um cadastro' };
const phoneLeads = { phone: 'Confirme um novo celular para manter seus dados e pedidos vinculados a você.', code: 'Após confirmar, o novo celular passa a identificar o seu cadastro.' };
/** Alterar celular: the new celular, its code (Reenviar, the other channel, Alterar celular), or "Celular já vinculado". */
function phoneChange({ phoneChange: p }) {
  if (p.step === 'conflict')
    return `<section class="account-card" aria-labelledby="conflict-title"><h2 id="conflict-title">Não foi possível vincular este número.</h2><p>Este celular já está vinculado a outro cadastro. Seus dados e pedidos permanecem no celular atual.</p><div class="account-buttons account-buttons-column"><button class="primary account-action" type="button" data-phone-other>Informar outro celular</button><a class="secondary account-action" href="#conta/dados">Voltar aos meus dados</a></div></section>`;
  const card =
    p.step === 'code'
      ? `<h2>Confirme seu celular</h2><p class="step-text">${sentTo(p.channel, p.phone).replace(/\.$/, '')}. Confirme para atualizar seu celular.</p><form class="id-form" data-phone-form="code" novalidate>${field('new-code', 'Código de 6 dígitos', `inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${p.code}"`, p.codeError ? 'Código incorreto. Confira e tente novamente.' : '')}<button class="primary" type="submit"${p.code.length < 6 || p.codeError ? ' disabled' : ''}>Confirmar e continuar</button></form><div class="id-links"><button class="link" type="button" data-phone-resend>Reenviar código</button><button class="link" type="button" data-phone-channel>${p.channel === 'sms' ? 'Receber pelo WhatsApp' : 'Receber por SMS'}</button><button class="link" type="button" data-phone-back>Alterar celular</button></div>`
      : `<h2>Qual é o seu celular?</h2><p class="step-text">Vamos enviar um código para confirmar que é você.</p><form class="id-form" data-phone-form="phone" novalidate>${field('new-phone', 'Celular com DDD', `type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(00) 00000-0000" value="${maskPhone(p.phone)}"`, p.error)}<button class="primary" type="submit" data-phone-send="whatsapp"${p.phone.length === 11 ? '' : ' disabled'}>Receber código pelo WhatsApp</button><button class="link" type="submit" data-phone-send="sms"${p.phone.length === 11 ? '' : ' disabled'}>Receber por SMS</button></form><p class="step-note">Seus dados só serão recuperados após a confirmação.</p>`;
  return `<p class="account-lead">${phoneLeads[p.step]}</p><section class="account-card checkout-step" aria-label="Alterar celular">${card}</section><a class="secondary account-action" href="#conta/dados">Cancelar</a>`;
}

/** "Bela Vista, São Paulo — SP · Apto. 21": the district and the city, then the complement and the reference. */
const addressMeta = (a) => [[a.district, a.city].filter(Boolean).join(', '), a.complement, a.reference].filter(Boolean).map(esc).join(' · ');
/**
 * Endereços (Figma 12): a card per Endereço salvo with "Editar endereço" and "Remover endereço" (red, no border), then
 * "Adicionar endereço"; without any, the empty state. Adding and editing use the address pages (busca, mapa, dados).
 */
function addresses({ customer: c }) {
  const card = (a) =>
    `<section class="account-card" aria-labelledby="address-${a.id}"><h2 id="address-${a.id}">${esc(a.label)}</h2><p>${esc(a.street)}</p><p class="account-meta">${addressMeta(a)}</p><div class="account-buttons account-buttons-column"><button class="secondary account-action" type="button" data-account-edit="${a.id}" aria-label="Editar endereço ${esc(a.label)}">Editar endereço</button><button class="danger" type="button" data-account-remove="${a.id}" aria-label="Remover endereço ${esc(a.label)}">Remover endereço</button></div></section>`;
  const list = c.addresses.length
    ? c.addresses.map(card).join('')
    : `<section class="account-card" aria-labelledby="no-address"><h2 id="no-address">Nenhum endereço salvo</h2><p>Salve um endereço para escolhê-lo mais rápido nos próximos pedidos.</p></section>`;
  return `${list}<button class="primary account-action" type="button" data-account-add>Adicionar endereço</button>`;
}
/** Remover endereço (Figma 14): the label and street, "Remover endereço" (red) or "Manter endereço". */
const removeAddress = (a) =>
  `<section class="account-card" aria-labelledby="remove-title"><h2 id="remove-title">${esc(a.label)} · ${esc(a.street)}</h2><p>O endereço sai da sua lista. Os pedidos anteriores continuam no histórico.</p><div class="account-buttons account-buttons-column"><button class="danger" type="button" data-account-removed>Remover endereço</button><button class="secondary account-action" type="button" data-account-keep>Manter endereço</button></div></section>`;

/** "Visa final 4242". */
const cardName = (c) => `${c.brand} final ${c.last4}`;
/**
 * Formas de pagamento (Figma 15): a card per Cartão salvo (the first one, "Cartão padrão") with "Remover cartão", then
 * "Adicionar cartão" and the note on Pix; without any, the empty state.
 */
function payments({ customer: c }) {
  const card = (k, i) =>
    `<section class="account-card" aria-labelledby="card-${k.id}"><h2 id="card-${k.id}">${k.brand} · final ${k.last4}</h2><p>${esc(k.holder)} · Validade ${k.expiry}</p>${i === 0 ? '<p class="account-meta">Cartão padrão</p>' : ''}<button class="danger" type="button" data-card-remove="${k.id}" aria-label="Remover cartão ${cardName(k)}">Remover cartão</button></section>`;
  const list = c.cards.length
    ? c.cards.map(card).join('')
    : `<section class="account-card" aria-labelledby="no-card"><h2 id="no-card">Nenhum cartão salvo</h2><p>Salve um cartão para pagar mais rápido nos próximos pedidos.</p></section>`;
  return `<p class="account-lead">Gerencie os cartões salvos para usar nos próximos pedidos.</p>${list}<a class="primary account-action" href="#conta/cartao">Adicionar cartão</a><p class="account-meta">Pix também está disponível no checkout. Você não precisa cadastrar uma chave.</p>`;
}
/** Adicionar cartão (Figma 16): the Novo cartão's fields; the código de segurança is checked, not kept. */
function addCard({ wallet: w }) {
  const e = w.errors,
    num = 'inputmode="numeric" autocomplete="off"';
  return `<section class="account-card" aria-label="Adicionar cartão"><form class="id-form account-form" data-card-form novalidate>${field('wallet-number', 'Número do cartão', `${num} value="${maskCard(w.number)}"`, e.number)}${field('wallet-name', 'Nome impresso no cartão', `autocomplete="cc-name" value="${esc(w.name)}"`, e.name)}${field('wallet-expiry', 'Validade', `${num} placeholder="MM/AA" value="${maskExpiry(w.expiry)}"`, e.expiry)}${field('wallet-cvv', 'Código de segurança', `${num} maxlength="3" value="${w.cvv}"`, e.newCvv)}<p class="account-meta">O código de segurança não fica salvo. Ele será solicitado no pagamento.</p><div class="account-buttons account-buttons-column"><button class="primary account-action" type="submit">Salvar cartão</button><a class="secondary account-action" href="#conta/pagamentos">Cancelar</a></div></form></section>`;
}
/** Remover cartão (Figma 17): "Remover Visa final 4242?", "Remover cartão" (red) or "Manter cartão". */
const removeCard = (k) =>
  `<section class="account-card" aria-labelledby="remove-card-title"><h2 id="remove-card-title">Remover ${cardName(k)}?</h2><p>Você poderá adicionar o cartão novamente quando quiser.</p><div class="account-buttons account-buttons-column"><button class="danger" type="button" data-card-removed>Remover cartão</button><button class="secondary account-action" type="button" data-account-keep>Manter cartão</button></div></section>`;

/** Sair (Figma 22): the confirmation; Sair da conta ends the session, Continuar conectado goes back. */
const signOut = () =>
  `<section class="account-card" aria-labelledby="signout-title"><h2 id="signout-title">Quer sair da sua conta?</h2><p>Seus dados e pedidos ficam salvos. Para entrar de novo, basta confirmar seu celular.</p><div class="account-buttons"><button class="primary account-action" type="button" data-signout>Sair da conta</button><button class="secondary account-action" type="button" data-stay>Continuar conectado</button></div></section>`;

/** The whole page for `accountPage` (a key of accountPages, or 'pedido' with `accountOrder`), at `now`. */
export function accountView(state, now, menuOpen) {
  const page = state.accountPage;
  const title = page === 'pedido' ? `Pedido #${esc(state.accountOrder)}` : page === 'celular' ? phoneTitles[state.phoneChange?.step ?? 'phone'] : accountPages[page].title;
  const body =
    {
      inicio: () => home(state, now),
      dados: () => profile(state),
      enderecos: () => addresses(state),
      pagamentos: () => payments(state),
      cartao: () => addCard(state),
      'remover-cartao': () => {
        const k = state.customer.cards.find((x) => x.id === state.cardTarget);
        return k ? removeCard(k) : '';
      },
      // Right after removing it (no address any more), until Endereços opens.
      'remover-endereco': () => {
        const a = state.customer.addresses.find((x) => x.id === state.addressTarget);
        return a ? removeAddress(a) : '';
      },
      // Right after the change is confirmed (no phoneChange), until Dados pessoais opens.
      celular: () => (state.phoneChange ? phoneChange(state) : ''),
      sair: signOut,
    }[page]?.() ?? '';
  return { title, html: `${accountNav(page === 'pedido' ? 'pedidos' : (accountPages[page].nav ?? page), menuOpen)}<div class="account-body">${body}</div>` };
}
