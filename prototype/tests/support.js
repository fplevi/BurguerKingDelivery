// Test helpers: locate things the way the customer does (roles and accessible names).
import { expect } from '@playwright/test';

/** Visible title of the full-screen Ver ingredientes dialog. */
export const TITULO = 'Ver ingredientes';

/** The full-screen "Ver ingredientes" dialog, named by its title. */
export const verIngredientes = (page) => page.getByRole('dialog', { name: TITULO, exact: true });

/** Bandeja: the aside holding removed ingredients, chips and "Recolocar todos". */
export const bandeja = (page) => verIngredientes(page).getByRole('complementary');

/** Chip in the bandeja for an ingredient; its label is "Retirar X" or "Recolocar X". */
export const chip = (page, action, name) =>
  bandeja(page)
    .getByRole('group', { name: /^Personalize seu / })
    .getByRole('button', { name: `${action} ${name}`, exact: true });

/** List of Ingredientes retirados in the bandeja, each an image button "Recolocar X". */
export const retirados = (page) => bandeja(page).getByRole('list', { name: 'Ingredientes retirados' });

/** Image of a removed ingredient in the bandeja. */
export const retirado = (page, name) =>
  retirados(page).getByRole('button', { name: `Recolocar ${name}`, exact: true });

/**
 * Camada of the opened burger. Layers and chips share the label "Retirar X";
 * the layer comes first in the dialog (stage before bandeja).
 */
export const camada = (page, name) =>
  verIngredientes(page).getByRole('button', { name: `Retirar ${name}`, exact: true }).first();

export async function openVerIngredientes(page) {
  await page.getByRole('button', { name: /Ver ingredientes/ }).click();
  await expect(verIngredientes(page)).toBeVisible();
}

/** Press on `source`, move the pointer in steps and release over the centre of `target`. */
export async function dragTo(page, source, target) {
  await source.hover();
  await page.mouse.down();
  const box = await target.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** Hero description: the Camadas of the applied Personalização, "Pão com gergelim, …". */
export const descricao = (page) => page.locator('main').getByText(/^Pão com /);

/** Card of the product grid, by the product's name (the selected one also holds the badge). */
export const card = (page, nome) =>
  page.locator('#catalog').getByRole('button', { name: new RegExp(`^(Selecionado\\s*)?${nome}$`) });

/** Chooses a product in the grid, as the customer does. */
export async function escolher(page, nome) {
  await card(page, nome).click();
  await expect(card(page, nome)).toHaveAttribute('aria-pressed', 'true');
}

/** The Carrinho screen (#carrinho), a region named by its title. */
export const carrinho = (page) => page.getByRole('region', { name: 'Seu carrinho' });
/** The Itens of the Carrinho, in order. */
export const itens = (page) => carrinho(page).getByRole('list', { name: 'Itens' }).getByRole('listitem');
/** Total do item of one Item of the Carrinho. */
export const totalDoItem = (item) => item.getByText('Total do item').locator('strong');
/** Total dos itens in the Resumo do carrinho. */
export const totalDosItens = (page) =>
  carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByText('Total dos itens').locator('strong');

// The toast (role="status") hides itself after 2.8 s; with software WebGL (CI) the page can be busy
// redrawing the 3D for longer than that, so the check reads its last message, shown or not yet hidden.
export const aviso = (page) => page.locator('#toast');

/** The Checkout screen (#checkout), a region named by its title "Finalizar pedido". */
export const checkout = (page) => page.getByRole('region', { name: 'Finalizar pedido' });
/** Resumo do pedido of the Checkout. */
export const resumoDoPedido = (page) => checkout(page).getByRole('complementary', { name: 'Resumo do pedido' });
/** Indicador de etapas of the Checkout, its steps in order. */
export const etapas = (page) => checkout(page).getByRole('list', { name: 'Etapas do pedido' }).getByRole('listitem');

// Pagamento and the Pedido confirmado (ticket 06 of checkout).
/**
 * A Whopper® in the cart, Carrinho → Continuar, the celular `numero` of a Cliente cadastrado confirmed and Casa chosen
 * with "Entregar neste endereço": the Checkout's Pagamento (Total do pedido R$ 40,80). `antes(page)` runs on the menu
 * before the Whopper® is added (a Personalização, say).
 */
export async function irAoPagamento(page, numero = '61999991234', antes = async () => {}) {
  await page.goto('/');
  await antes(page);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  await page.getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(formaDePagamento(page)).toBeVisible();
}
/** Header Carrinho → Continuar (no combo pending): the Checkout. */
export async function continuarDoCarrinho(page) {
  await page.getByRole('button', { name: /^Carrinho · / }).click();
  await carrinho(page).getByRole('complementary', { name: 'Resumo do carrinho' }).getByRole('button', { name: 'Continuar' }).click();
  await expect(checkout(page)).toBeVisible();
}
/** The Forma de pagamento radios (Pix, Cartão de crédito). */
export const formaDePagamento = (page) => checkout(page).getByRole('radiogroup', { name: 'Forma de pagamento' });
/** Seus cartões: a radio per saved card, named "Visa •••• 4242". */
export const seusCartoes = (page) => checkout(page).getByRole('radiogroup', { name: 'Seus cartões' });
/** The card payment action of the Resumo do pedido, "Confirmar e pagar R$ X". */
export const confirmarEPagar = (page) => resumoDoPedido(page).getByRole('button', { name: /^Confirmar e pagar / });
/** The Pedido confirmado screen (#pedido/<id>), a region named by its title. */
export const pedidoConfirmado = (page) => page.getByRole('region', { name: 'Pedido confirmado!' });

// Fluxo de endereço (#endereco and #endereco/*, tickets 03-05 of checkout).
/** The address pages: the region titled "Endereço de entrega" (an h1; the Checkout's card has the same name, as an h2). */
export const paginaDeEndereco = (page) =>
  page.getByRole('region', { name: 'Endereço de entrega' }).filter({ has: page.getByRole('heading', { level: 1, name: 'Endereço de entrega' }) });

/** A Whopper® in the cart, Carrinho → Continuar, celular `numero` confirmed (a Novo cliente also registers): Seus endereços. */
export async function irAosEnderecos(page, numero = '61999991234') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await continuarDoCarrinho(page);
  await checkout(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await checkout(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await checkout(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await checkout(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234' && numero !== '61900000000') {
    await checkout(page).getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await checkout(page).getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(paginaDeEndereco(page)).toBeVisible();
}

/** From Seus endereços: opens the Busca (#endereco/buscar) and types `texto` in "Buscar endereço e número". */
export async function buscarEndereco(page, texto) {
  await paginaDeEndereco(page).getByRole('button', { name: /^Buscar endereço e número/ }).click();
  await expect(page).toHaveURL(/#endereco\/buscar$/);
  await paginaDeEndereco(page).getByRole('searchbox', { name: 'Buscar endereço e número' }).fill(texto);
}

/** Results of the Busca, each a button named by its place. */
export const resultadosDaBusca = (page) => paginaDeEndereco(page).getByRole('list', { name: 'Resultados da busca' }).getByRole('button');

// Pagamento com Pix (ticket 07 of checkout).
/** The Pix Forma de pagamento chosen and "Gerar Pix" in the Resumo do pedido: the Pix pendente. */
export async function gerarPix(page) {
  await formaDePagamento(page).getByRole('radio', { name: 'Pix' }).check();
  await resumoDoPedido(page).getByRole('button', { name: 'Gerar Pix' }).click();
  await expect(pixPendente(page)).toBeVisible();
}
/** "Só falta pagar o Pix" (Figma pixWaiting), a region named by its title. */
export const pixPendente = (page) => checkout(page).getByRole('region', { name: 'Só falta pagar o Pix' });
/** "Seu Pix expirou" (Figma pixExpired), a region named by its title. */
export const pixExpirado = (page) => checkout(page).getByRole('region', { name: 'Seu Pix expirou' });
