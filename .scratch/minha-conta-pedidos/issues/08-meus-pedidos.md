# 08: Meus pedidos

**What to build:** Meus pedidos (telas 18 e 21) com Em andamento e Histórico, os Pedidos confirmados da sessão e as situações fixas de Mariana (#BK-10482, #BK-10397, #BK-10276 cancelado após o pagamento), como na spec. O #BK-10482 só aparece sem Pedido da sessão em andamento.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 04

**Status:** resolved

- [x] Grupos e ordenação
- [x] Cards com situação, previsão, entrega, itens e total
- [x] Pedidos da sessão no topo
- [x] Situações fixas de Mariana
- [x] Nenhum pedido ainda
- [x] Testes Playwright

## Answer

**Tela** (`#conta/pedidos`, `orders` em `prototype/src/account.js`): "Em andamento" e "Histórico de pedidos", cada grupo uma lista com os mais recentes primeiro (`ordersOf`). Card: "Pedido #<id>", dia e hora, Situação do pedido; em andamento, "Chega entre…", "Entrega em <rótulo> · BK Bela Vista · 2,4 km" e "Acompanhar pedido"; no histórico, "Ver detalhes". Ambos levam a `#conta/pedidos/<id>` (ticket 09/10). Sem Pedidos, "Seu primeiro pedido começa aqui" com "Explorar o cardápio" e "Voltar à minha conta".

**Situação ao vivo:** `main.js` redesenha Minha conta, Meus pedidos e o acompanhamento a cada segundo enquanto houver um Pedido da sessão em andamento.

**Identificador:** os Pedidos da sessão passam a seguir o formato do Figma, a partir de #BK-10483 (`firstOrder`, `confirmOrder`); testes, README e a spec do Checkout atualizados.

**Situações fixas:** #BK-10276 passou a ser um Whopper em combo (R$ 52,80 com a entrega), como o card do Figma. "Cancelado" é o nome da situação, como no glossário. Os totais seguem os preços do protótipo, não os do Figma.

**Testes:** `tests/meus-pedidos.spec.js` (5 cenários × 2 projetos); captura `capturas/08-*.png`. Suíte completa: 482 passando.
