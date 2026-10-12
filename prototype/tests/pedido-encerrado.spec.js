// Pedido entregue e cancelado: Ver detalhes, sem mapa nem entregador (ticket 10 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';
import { congelarRelogio } from './support.js';

const conta = (page) => page.locator('#account-page');
const regiao = (page, nome) => conta(page).getByRole('region', { name: nome, exact: true });
const etapas = (page) => regiao(page, 'Situação do pedido').getByRole('listitem');
const whatsapp = 'https://wa.me/5561999077204?text=Ol%C3%A1%2C%20vi%20seu%20projeto%20do%20Burger%20King%20e%20gostei%20bastante.%20Podemos%20conversar%3F';

/** Mariana identified, on Meus pedidos. */
async function entrar(page) {
  await page.clock.install();
  await page.goto('/#conta/pedidos');
  const id = page.getByRole('region', { name: 'Identificação' });
  await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
  await expect(page).toHaveURL(/#conta\/pedidos$/);
}
/** Sem mapa, sem entregador, sem rastreamento: only the loja's WhatsApp. */
async function semRastreamento(page) {
  await expect(regiao(page, 'Acompanhe sua entrega')).toHaveCount(0);
  await expect(conta(page).getByRole('img', { name: /^Mapa/ })).toHaveCount(0);
  await expect(conta(page).getByText('seu entregador')).toHaveCount(0);
  await expect(conta(page).getByRole('link', { name: 'WhatsApp do entregador' })).toHaveCount(0);
  await expect(regiao(page, 'Loja').getByRole('link', { name: 'WhatsApp da loja' })).toHaveAttribute('href', whatsapp);
}

test('Pedido entregue: quando foi entregue, a linha do tempo concluída, a loja e os Itens', async ({ page }) => {
  await entrar(page);
  await conta(page).getByRole('link', { name: 'Ver detalhes do pedido #BK-10397' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Pedido #BK-10397' })).toBeVisible();
  const topo = regiao(page, 'Pedido entregue');
  await expect(topo).toContainText('Entregue em 8 de outubro, às 13h02');
  await expect(topo).not.toContainText('Chega entre');
  await semRastreamento(page);
  await expect(etapas(page)).toHaveCount(8);
  await expect(etapas(page).last()).toHaveText('Pedido entregue13h02 · Entregue');
  await expect(etapas(page).filter({ hasText: 'Próxima etapa' })).toHaveCount(0);
  const resumo = conta(page).getByRole('complementary', { name: 'Resumo do pedido' });
  await expect(resumo).toContainText('2× Whopper®');
  await expect(resumo).toContainText('Taxa de entrega');
  await expect(resumo).toContainText('R$ 126,50');
  await expect(conta(page).getByText('Pago com Pix')).toBeVisible();
});

test('Pedido cancelado: quando, a devolução sem prazo, e só as etapas que aconteceram até Cancelado', async ({ page }) => {
  await entrar(page);
  await conta(page).getByRole('link', { name: 'Ver detalhes do pedido #BK-10276' }).click();
  const topo = regiao(page, 'Pedido cancelado');
  await expect(topo).toContainText('Cancelado em 3 de outubro, às 20h20');
  await expect(topo).toContainText('O valor será devolvido na mesma forma de pagamento.');
  await expect(topo).not.toContainText(/dias|prazo|estorno/);
  await semRastreamento(page);
  await expect(etapas(page)).toHaveText(['Pedido realizado20h06 · Concluído', 'Pagamento confirmado20h07 · Concluído', 'Pedido em preparação20h12 · Concluído', 'Cancelado20h20 · Cancelado']);
  await expect(conta(page).getByText('Pago com cartão Visa •••• 4242')).toBeVisible();
});

test('um Pedido da sessão, ao ser entregue, deixa o rastreamento e mostra quando foi entregue', async ({ page }) => {
  await entrar(page);
  await congelarRelogio(page);
  await page.evaluate(() => {
    const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
    const item = { product: 'whopper', qty: 1, combo: false, drink: '', removed: [], price: 3190 };
    s.orders = [{ id: 'BK-10483', phone: s.customer.phone, confirmedAt: Date.now() - 68_000, address: s.customer.addresses[0], fee: 890, total: 4080, paidWith: 'Pix', items: [item] }];
    sessionStorage.setItem('bk-sessao', JSON.stringify(s));
  });
  await page.reload();
  await page.evaluate(() => (location.hash = 'conta/pedidos/BK-10483'));
  await expect(regiao(page, 'Pedido chegou')).toBeVisible();
  await expect(regiao(page, 'Acompanhe sua entrega').getByRole('status')).toHaveText('Chegou ao seu endereço');
  await page.clock.runFor(3_000);
  await expect(regiao(page, 'Pedido entregue')).toContainText(/Entregue hoje, às \d+h\d\d/);
  await semRastreamento(page);
});
