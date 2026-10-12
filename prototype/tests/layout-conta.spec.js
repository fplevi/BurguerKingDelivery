// Minha conta e acompanhamento abaixo de 1024px (ticket 11 of minha-conta-pedidos).
import { test, expect } from '@playwright/test';

const paginas = ['conta', 'conta/dados', 'conta/celular', 'conta/enderecos', 'conta/pagamentos', 'conta/cartao', 'conta/pedidos', 'conta/pedidos/BK-10482', 'conta/pedidos/BK-10397', 'conta/pedidos/BK-10276', 'conta/sair'];

for (const largura of [390, 768])
  test.describe(`${largura} de largura`, () => {
    test.use({ viewport: { width: largura, height: 844 } });

    test('Identifique-se e todas as páginas da conta: sem abas de categorias no header, navegação em lista e sem rolagem horizontal', async ({ page }) => {
      const abas = page.getByRole('banner').getByRole('navigation', { name: 'Categorias' });
      await page.goto('/#identificar');
      await expect(abas).toBeHidden();
      const id = page.getByRole('region', { name: 'Identificação' });
      await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
      await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
      await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
      await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
      for (const pagina of paginas) {
        await page.evaluate((h) => (location.hash = h), pagina);
        await expect(page).toHaveURL(new RegExp(`#${pagina}$`));
        await expect(abas).toBeHidden();
        await expect(page.locator('#account-page').getByRole('navigation', { name: 'Minha conta' }).getByRole('button')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), pagina).toBeLessThanOrEqual(0);
      }
      // The menu keeps its tabs.
      await page.evaluate(() => (location.hash = 'bebidas'));
      await expect(abas).toBeVisible();
    });

    test('o acompanhamento fica em uma coluna: situação, mapa, entregador, linha do tempo e itens', async ({ page }) => {
      await page.goto('/#conta/pedidos/BK-10482');
      const id = page.getByRole('region', { name: 'Identificação' });
      await id.getByRole('textbox', { name: 'Celular com DDD' }).fill('61999991234');
      await id.getByRole('button', { name: 'Receber código pelo WhatsApp' }).click();
      await id.getByRole('textbox', { name: 'Código de 6 dígitos' }).fill('123456');
      await id.getByRole('button', { name: 'Confirmar e continuar' }).click();
      const conta = page.locator('#account-page');
      const caixas = [];
      for (const nome of ['Pedido retirado', 'Acompanhe sua entrega', 'Carlos · seu entregador', 'Situação do pedido']) caixas.push(await conta.getByRole('region', { name: nome, exact: true }).boundingBox());
      caixas.push(await conta.getByRole('complementary', { name: 'Resumo do pedido' }).boundingBox());
      for (let i = 1; i < caixas.length; i++) {
        expect(caixas[i].y).toBeGreaterThanOrEqual(caixas[i - 1].y + caixas[i - 1].height);
        expect(Math.abs(caixas[i].x - caixas[0].x)).toBeLessThanOrEqual(1);
      }
    });
  });
