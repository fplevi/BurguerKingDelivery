// Meus pedidos (ticket 08 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';
import { congelarRelogio } from './support.js';

const conta = (page) => page.locator('#account-page');
const titulo = (page) => page.getByRole('heading', { level: 1 });
const grupo = (page, nome) => conta(page).getByRole('list', { name: nome });
const pedido = (page, id) => conta(page).getByRole('region', { name: `Pedido #${id}` });

/** Identified with `numero` (a Novo cliente registers as Ana Souza), on Meus pedidos. */
async function entrar(page, numero = '61999991234') {
  await page.clock.install();
  await page.goto('/#conta/pedidos');
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234') {
    await id.getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await id.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page).toHaveURL(/#conta\/pedidos$/);
}
/** A Pedido of the session for the identified client, confirmed `ago` ms before now (then reload). */
async function pedidoDaSessao(page, ago, id = 'BK-10483') {
  await congelarRelogio(page);
  await page.evaluate(
    ([ago, id]) => {
      const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
      const item = { product: 'whopper', qty: 2, combo: false, drink: '', removed: [], price: 3190 };
      s.orders = [...s.orders, { id, phone: s.customer.phone, confirmedAt: Date.now() - ago, address: s.customer.addresses[1], fee: 890, total: 7270, paidWith: 'Pix', items: [item] }];
      sessionStorage.setItem('bk-sessao', JSON.stringify(s));
    },
    [ago, id],
  );
  await page.reload();
}

test('Em andamento e Histórico de pedidos, os mais recentes primeiro, com as situações fixas', async ({ page }) => {
  await entrar(page);
  await expect(titulo(page)).toHaveText('Meus pedidos');
  await expect(grupo(page, 'Em andamento').getByRole('heading')).toHaveText(['Pedido #BK-10482']);
  await expect(grupo(page, 'Histórico de pedidos').getByRole('heading')).toHaveText(['Pedido #BK-10397', 'Pedido #BK-10276']);

  const andamento = pedido(page, 'BK-10482');
  await expect(andamento).toContainText(/Hoje, \d+h\d\d/);
  await expect(andamento).toContainText('Pedido retirado');
  await expect(andamento).toContainText(/Chega entre \d+h\d\d e \d+h\d\d/);
  await expect(andamento).toContainText('Entrega em Casa · BK Bela Vista · 2,4 km');
  await expect(andamento).toContainText('Whopper® + 1 item · R$ 77,70');
  await expect(andamento.getByRole('link', { name: 'Acompanhar pedido #BK-10482' })).toHaveAttribute('href', '#conta/pedidos/BK-10482');

  await expect(pedido(page, 'BK-10397')).toContainText('8 de outubro, 12h24');
  await expect(pedido(page, 'BK-10397')).toContainText('Pedido entregue');
  await expect(pedido(page, 'BK-10397').getByRole('link', { name: 'Ver detalhes do pedido #BK-10397' })).toBeVisible();
  await expect(pedido(page, 'BK-10276')).toContainText('3 de outubro, 20h06');
  await expect(pedido(page, 'BK-10276')).toContainText('Cancelado');
  await expect(pedido(page, 'BK-10276')).toContainText('Whopper® · R$ 52,80');
  await pedido(page, 'BK-10276').getByRole('link', { name: 'Ver detalhes do pedido #BK-10276' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos\/BK-10276$/);
  await expect(titulo(page)).toHaveText('Pedido #BK-10276');
});

test('um Pedido da sessão em andamento entra no topo, no lugar do #BK-10482, e a situação avança sozinha', async ({ page }) => {
  await entrar(page);
  await pedidoDaSessao(page, 15_000);
  await expect(grupo(page, 'Em andamento').getByRole('heading')).toHaveText(['Pedido #BK-10483']);
  const novo = pedido(page, 'BK-10483');
  await expect(novo).toContainText('Pagamento confirmado');
  await expect(novo).toContainText('Entrega em Trabalho · BK Bela Vista · 2,4 km');
  await expect(novo).toContainText('2× Whopper® · R$ 72,70');
  await page.clock.runFor(6_000);
  await expect(novo).toContainText('Pedido em preparação');
});

test('um Pedido da sessão já entregue vai para o Histórico e o #BK-10482 volta a Em andamento', async ({ page }) => {
  await entrar(page);
  await pedidoDaSessao(page, 5 * 60_000);
  await expect(grupo(page, 'Em andamento').getByRole('heading')).toHaveText(['Pedido #BK-10482']);
  await expect(grupo(page, 'Histórico de pedidos').getByRole('heading')).toHaveText(['Pedido #BK-10483', 'Pedido #BK-10397', 'Pedido #BK-10276']);
  await expect(pedido(page, 'BK-10483')).toContainText('Pedido entregue');
});

test('sem Pedidos: "Seu primeiro pedido começa aqui", com Explorar o cardápio e Voltar à Minha conta', async ({ page }) => {
  await entrar(page, '11987654321');
  const vazio = conta(page).getByRole('region', { name: 'Seu primeiro pedido começa aqui' });
  await expect(vazio).toContainText('Quando fizer um pedido com este celular, ele aparecerá nesta área.');
  await vazio.getByRole('link', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#conta$/);
  await page.goBack();
  await vazio.getByRole('link', { name: 'Explorar o cardápio' }).click();
  await expect(page.locator('section.hero')).toBeVisible();
});

test('os Pedidos são do celular identificado: outro cliente na mesma aba não os vê', async ({ page }) => {
  await entrar(page);
  await pedidoDaSessao(page, 15_000);
  await page.goto('/#conta/sair');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await entrar(page, '11987654321');
  await expect(conta(page).getByRole('region', { name: 'Seu primeiro pedido começa aqui' })).toBeVisible();
  await page.goto('/#conta/pedidos/BK-10483');
  await expect(page).toHaveURL(/#conta$/);
});
