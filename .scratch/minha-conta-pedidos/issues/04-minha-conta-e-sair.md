# 04: Minha conta, navegação e Sair

**What to build:** a página Minha conta (tela 07) com a navegação lateral (desktop) e a lista expansível (mobile), e Sair (tela 22), como na spec (Minha conta, Sessão). O card "Pedido em andamento" mostra o mais recente, quando houver; os demais destinos podem abrir páginas só com o título até os próximos tickets.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 03

**Status:** resolved

- [x] Navegação com a seção atual destacada e acessível
- [x] Lista expansível no mobile
- [x] "Olá", celular e Editar meus dados
- [x] Card do Pedido em andamento só quando houver
- [x] Sair com confirmação: limpa cliente e Endereço de entrega, mantém o Carrinho
- [x] Voltar do navegador não reabre páginas privadas
- [x] Testes Playwright

## Answer

**Rotas:** `#conta` e `#conta/<seção>` (`dados`, `enderecos`, `pagamentos`, `pedidos`, `sair`) e `#conta/pedidos/<id>` (acompanhamento, ticket 09); `state.accountPage` e `state.accountOrder`. Seção inexistente, ou Pedido que não é do cliente, volta a `#conta`.

**Telas** (`prototype/src/account.js`): navegação lateral no desktop e, abaixo de 1024px, um botão com a seção atual que abre a lista (fecha ao trocar de seção); Minha conta (Olá, celular, Editar meus dados, o Pedido em andamento mais recente e Ver todos os pedidos); Sair da conta? com "Sair da conta" e "Continuar conectado". As demais seções têm só o título até os próximos tickets.

**Pedidos** (`prototype/src/orders.js`): as 8 etapas da Situação do pedido, uma a cada 10 s desde `confirmedAt`; o Pedido confirmado agora guarda o celular do cliente e o horário (`payResult` e `pixConfirm` levam `now`). Situações fixas de Mariana: #BK-10482 (em andamento, 21 min antes do carregamento da página, para ser sempre "Hoje"), #BK-10397 e #BK-10276. `ordersOf` só devolve os Pedidos do celular identificado.

**Sair** (`signOut`): esquece cliente, Identificação, Endereço de entrega, endereço não salvo e o Pedido não confirmado; mantém o Carrinho; vai ao cardápio com `location.replace`, e o Voltar cai na Identificação.

**Estilo:** as regras globais de `nav` (abas do header) não valem na navegação da conta; botões de Identifique-se e Minha conta em Flame Sans regular, como no Checkout.

**Divergência do Figma:** o total do #BK-10482 é R$ 77,70 (Whopper em combo + Balde de Batata + entrega), não R$ 78,80; os preços do protótipo não fecham aquele valor.

**Testes:** `tests/minha-conta.spec.js`; capturas `capturas/04-*.png`. Suíte completa: 440 passando.
