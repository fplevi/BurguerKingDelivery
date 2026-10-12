// Minha conta (Figma Conta 07-22): the navigation (a side list on desktop, a list that opens below 1024px) and the
// content of each section. Rebuilt by main.js on every change; its links are plain hashes (#conta/<page>).
import { maskPhone, esc } from './checkout.js';
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

/** Sair (Figma 22): the confirmation; Sair da conta ends the session, Continuar conectado goes back. */
const signOut = () =>
  `<section class="account-card" aria-labelledby="signout-title"><h2 id="signout-title">Quer sair da sua conta?</h2><p>Seus dados e pedidos ficam salvos. Para entrar de novo, basta confirmar seu celular.</p><div class="account-buttons"><button class="primary account-action" type="button" data-signout>Sair da conta</button><button class="secondary account-action" type="button" data-stay>Continuar conectado</button></div></section>`;

/** The whole page for `accountPage` (a key of accountPages, or 'pedido' with `accountOrder`), at `now`. */
export function accountView(state, now, menuOpen) {
  const page = state.accountPage;
  const title = page === 'pedido' ? `Pedido #${esc(state.accountOrder)}` : accountPages[page].title;
  const body = page === 'inicio' ? home(state, now) : page === 'sair' ? signOut() : '';
  return { title, html: `${accountNav(page === 'pedido' ? 'pedidos' : page, menuOpen)}<div class="account-body">${body}</div>` };
}
