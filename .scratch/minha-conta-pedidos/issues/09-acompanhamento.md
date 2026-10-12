# 09: Acompanhamento ao vivo

**What to build:** o acompanhamento de um Pedido em andamento (Figma `351-14130`…`351-15475` e mobile), como na spec (Acompanhamento): situação, linha do tempo, mapa OSM com os pins de `output/map-pins/v1/`, rota pela rua, moto a partir de "Pedido retirado", entregador, loja, Itens do pedido e WhatsApp. Etapas a cada ~10 s a partir da confirmação. "Acompanhar pedido" do Checkout passa a abrir esta página, no lugar do toast.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 08

**Status:** resolved

- [x] Situação e previsão
- [x] Linha do tempo contínua com concluídas, atual e futuras
- [x] Mapa com loja, destino, rota e moto em movimento
- [x] Entregador a partir de Pedido retirado
- [x] WhatsApp da loja e do entregador com o número e a mensagem da demonstração
- [x] Avanço pelo horário da confirmação, inclusive após recarregar
- [x] Acompanhar pedido da confirmação do Checkout
- [x] Testes Playwright com o tempo controlado

## Answer

**Tela** (`#conta/pedidos/<id>`, `prototype/src/tracking.js`): card da Situação ("Chega entre…", "Pedido #… · Hoje, hh:mm"); "Acompanhe sua entrega" com o mapa, "BK → <rótulo> · 2,4 km", o andamento (`role=status`: "Acompanhe o motoboy após a retirada", "Saindo da loja · 2,4 km restantes", "A caminho · X km restantes", "Chegou ao seu endereço") e o endereço; o entregador (antes da retirada, "Entregador ainda não atribuído") com a loja; a linha do tempo à direita (abaixo no mobile); o Resumo do pedido e a forma de pagamento.

**Mapa:** SVG sobre os mesmos tiles OSM do fluxo de endereço, recortado em volta da rota (Rua Carlos Comenale e Rua Itapeva), com a atribuição; pins aprovados copiados para `prototype/Assets/map-pins/` (coroa, pin laranja, moto). A moto aparece em Pedido retirado e anda até o destino entre Pedido retirado e Pedido chegou (`riderAt`).

**Linha do tempo:** pontos ligados por uma linha contínua; concluídas com horário e "Concluído", a atual em vermelho com "Em andamento" e `aria-current="step"`, as futuras com "Próxima etapa". Classes `tl-*` (as `step-*` já eram do indicador do Checkout).

**WhatsApp:** loja e entregador abrem `wa.me/5561999077204` com a mensagem da demonstração, em nova aba.

**Avanço:** a tela é redesenhada a cada segundo enquanto há Pedido da sessão em andamento, só quando o HTML muda (`accountHtml`). Isso revelou que o render do cardápio tirava o `aria-current` de todos os `nav a` da página: o seletor agora é só o do header.

**Checkout:** "Acompanhar pedido" na confirmação abre `#conta/pedidos/<id>`, no lugar do aviso.

**Testes:** `tests/acompanhamento.spec.js` (5 cenários × 2 projetos), `pagamento.spec.js` atualizado; capturas `capturas/09-*.png`. Suíte completa: 491 passando e 1 falha por tempo em `novo-endereco.spec.js`, que passou ao rodar sozinho.
