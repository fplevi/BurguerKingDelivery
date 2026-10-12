// Minha conta, navegação e Sair (ticket 04 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';

const cabecalho = (page) => page.getByRole('banner');
const conta = (page) => page.locator('#account-page');
const navegacao = (page) => conta(page).getByRole('navigation', { name: 'Minha conta' });
const identificacao = (page) => page.getByRole('region', { name: 'Identificação' });

/** Identifique-se from the menu with `numero` (a Novo cliente also registers as Ana Souza), then Minha conta. */
async function entrar(page, numero = '61999991234') {
  await page.goto('/#conta');
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill(numero);
  await identificacao(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await identificacao(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  if (numero !== '61999991234') {
    await identificacao(page).getByRole('textbox', { name: 'Nome completo' }).fill('Ana Souza');
    await identificacao(page).getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page).toHaveURL(/#conta$/);
}

test('Minha conta: Olá com o celular, Editar meus dados, o Pedido em andamento e Ver todos os pedidos', async ({ page }) => {
  await entrar(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Minha conta' })).toBeVisible();
  const ola = conta(page).getByRole('region', { name: 'Olá, Mariana' });
  await expect(ola).toContainText('Seu cadastro está vinculado ao celular (61) 99999-1234.');
  const pedido = conta(page).getByRole('region', { name: 'Pedido em andamento' });
  await expect(pedido).toContainText('#BK-10482 · ');
  await expect(pedido).toContainText(/Pedido retirado · Previsão: \d+h\d\d–\d+h\d\d/);
  await expect(pedido).toContainText('2 itens · R$ 77,70');
  await expect(pedido.getByRole('link', { name: 'Acompanhar pedido' })).toHaveAttribute('href', '#conta/pedidos/BK-10482');
  await conta(page).getByRole('link', { name: 'Ver todos os pedidos' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Meus pedidos' })).toBeFocused();
  await page.goBack();
  await ola.getByRole('link', { name: 'Editar meus dados' }).click();
  await expect(page).toHaveURL(/#conta\/dados$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dados pessoais' })).toBeVisible();
});

test('sem Pedido em andamento (Novo cliente), Minha conta não mostra um pedido', async ({ page }) => {
  await entrar(page, '11987654321');
  await expect(conta(page).getByRole('region', { name: 'Olá, Ana' })).toBeVisible();
  await expect(conta(page).getByRole('region', { name: 'Pedido em andamento' })).toHaveCount(0);
});

test('um Pedido da sessão em andamento toma o lugar do #BK-10482', async ({ page }) => {
  await entrar(page);
  await page.evaluate(() => {
    const s = JSON.parse(sessionStorage.getItem('bk-sessao'));
    const address = s.customer.addresses[0];
    s.orders = [{ id: 'BK1024', phone: s.customer.phone, confirmedAt: Date.now() - 25_000, address, fee: 890, total: 4080, paidWith: 'Pix', items: [{ product: 'whopper', qty: 1, combo: false, drink: '', removed: [], price: 3190 }] }];
    sessionStorage.setItem('bk-sessao', JSON.stringify(s));
  });
  await page.reload();
  const pedido = conta(page).getByRole('region', { name: 'Pedido em andamento' });
  await expect(pedido).toContainText('#BK1024 · Hoje, às ');
  await expect(pedido).toContainText('Pedido em preparação · Previsão:');
  await expect(pedido).toContainText('1 item · R$ 40,80');
});

test('navegação: a seção atual destacada, Sair separado; páginas inexistentes voltam a Minha conta', async ({ page }) => {
  await entrar(page);
  // Below 1024px the list opens first.
  if (await navegacao(page).getByRole('button').isVisible()) await navegacao(page).getByRole('button').click();
  const links = navegacao(page).getByRole('link');
  await expect(links).toHaveText(['Minha conta', 'Dados pessoais', 'Endereços', 'Formas de pagamento', 'Meus pedidos', 'Sair']);
  await expect(navegacao(page).getByRole('link', { name: 'Minha conta' })).toHaveAttribute('aria-current', 'page');
  await navegacao(page).getByRole('link', { name: 'Formas de pagamento' }).click();
  await expect(page).toHaveURL(/#conta\/pagamentos$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Formas de pagamento' })).toBeFocused();
  await expect(navegacao(page).locator('a[aria-current=page]')).toHaveText('Formas de pagamento');

  await page.goto('/#conta/qualquer-coisa');
  await expect(page).toHaveURL(/#conta$/);
  await page.goto('/#conta/pedidos/BK-99999');
  await expect(page).toHaveURL(/#conta$/);
});

test.describe('celular (< 1024px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'only in the mobile project');

  test('a lista mostra a seção atual e abre pelo botão; escolher um destino a recolhe', async ({ page }) => {
    await entrar(page);
    const menu = navegacao(page).getByRole('button', { name: 'Minha conta' });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(navegacao(page).getByRole('link', { name: 'Dados pessoais' })).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeFocused();
    await navegacao(page).getByRole('link', { name: 'Meus pedidos' }).click();
    const atual = navegacao(page).getByRole('button', { name: 'Meus pedidos' });
    await expect(atual).toHaveAttribute('aria-expanded', 'false');
    await expect(navegacao(page).getByRole('link', { name: 'Dados pessoais' })).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'only in the desktop project');

  test('a navegação é uma lista lateral, à esquerda das seções', async ({ page }) => {
    await entrar(page);
    await expect(navegacao(page).getByRole('button')).toBeHidden();
    const nav = await navegacao(page).boundingBox();
    const ola = await conta(page).getByRole('region', { name: 'Olá, Mariana' }).boundingBox();
    expect(ola.x).toBeGreaterThan(nav.x + nav.width);
  });
});

test('Sair pede confirmação: Continuar conectado mantém a sessão; Sair da conta esquece o cliente e o endereço, e mantém o Carrinho', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await cabecalho(page).getByRole('button', { name: 'Identifique-se' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
  await identificacao(page).getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
  await identificacao(page).getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
  await identificacao(page).getByRole('button', { name: 'Confirmar e continuar' }).click();
  // Casa as the Endereço de entrega, from the menu.
  await page.getByRole('button', { name: 'Informar endereço de entrega' }).click();
  await page.getByRole('button', { name: 'Entregar neste endereço' }).click();
  await expect(page.getByText('Entregar em Av. Paulista, 1578 · Bela Vista')).toBeVisible();

  await page.goto('/#conta/sair');
  await expect(page.getByRole('heading', { level: 1, name: 'Sair da conta?' })).toBeVisible();
  const confirmacao = conta(page).getByRole('region', { name: 'Quer sair da sua conta?' });
  await expect(confirmacao).toContainText('Seus dados e pedidos ficam salvos.');
  await confirmacao.getByRole('button', { name: 'Continuar conectado' }).click();
  await expect(page).toHaveURL(/#conta$/);
  await expect(cabecalho(page).getByRole('button', { name: 'Minha conta · Mariana' })).toBeVisible();

  if (await navegacao(page).getByRole('button').isVisible()) await navegacao(page).getByRole('button').click();
  await navegacao(page).getByRole('link', { name: 'Sair' }).click();
  await confirmacao.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page.locator('section.hero')).toBeVisible();
  await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
  await expect(cabecalho(page).getByRole('button', { name: 'Carrinho · 1' })).toBeVisible();
  await expect(page.getByText('Onde vamos entregar?')).toBeVisible();
  // Back: the private page asks for the Identificação again; nothing of Mariana's shows.
  await page.goBack();
  await expect(page).toHaveURL(/#identificar$/);
  await expect(page.getByText('Mariana')).toHaveCount(0);
  await page.reload();
  await expect(cabecalho(page).getByRole('button', { name: 'Identifique-se' })).toBeVisible();
});
