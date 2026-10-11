# 03: Seus endereços e o endereço no Checkout

**What to build:** a página `#endereco` (Figma 01 e 16), no layout dos Endereços salvos:
- Cliente cadastrado: Casa e Trabalho, com Casa marcada, seleção única, "Entregar neste endereço" e os atalhos "Usar localização atual", busca e "Endereços de pedidos anteriores" (por enquanto, sem ação).
- Novo cliente: só a busca e "Usar localização atual", sem as seções vazias e sem "Entregar neste endereço".

"Entregar neste endereço" volta a `#checkout` na etapa Pagamento, ainda sem as formas de pagamento. Lá aparecem o cartão "Endereço de entrega" (rótulo, rua, cidade, complemento, referência, divisor e "Entrega estimada: 30–45 min", com "Alterar") e o Resumo do pedido com Taxa de entrega (R$ 8,90) e Total do pedido. "Voltar ao checkout" e Voltar do navegador funcionam. Spec: `.scratch/checkout/spec.md` (Endereço, Resumo do pedido).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Endereços salvos do Cliente cadastrado com Casa marcada
- [ ] Novo cliente sem seções vazias
- [ ] Entregar neste endereço leva ao Pagamento, com o indicador Identificação e Endereço concluídos
- [ ] Cartão do endereço no Checkout e Alterar
- [ ] Taxa de entrega e Total do pedido no Resumo do pedido
- [ ] Testes Playwright
