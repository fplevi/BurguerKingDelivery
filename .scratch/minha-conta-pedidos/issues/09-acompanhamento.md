# 09: Acompanhamento ao vivo

**What to build:** o acompanhamento de um Pedido em andamento (Figma `351-14130`…`351-15475` e mobile), como na spec (Acompanhamento): situação, linha do tempo, mapa OSM com os pins de `output/map-pins/v1/`, rota pela rua, moto a partir de "Pedido retirado", entregador, loja, Itens do pedido e WhatsApp. Etapas a cada ~10 s a partir da confirmação. "Acompanhar pedido" do Checkout passa a abrir esta página, no lugar do toast.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 08

**Status:** ready-for-agent

- [ ] Situação e previsão
- [ ] Linha do tempo contínua com concluídas, atual e futuras
- [ ] Mapa com loja, destino, rota e moto em movimento
- [ ] Entregador a partir de Pedido retirado
- [ ] WhatsApp da loja e do entregador com o número e a mensagem da demonstração
- [ ] Avanço pelo horário da confirmação, inclusive após recarregar
- [ ] Acompanhar pedido da confirmação do Checkout
- [ ] Testes Playwright com o tempo controlado
