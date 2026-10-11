# 03: Seus endereços e o endereço no Checkout

**What to build:** a página `#endereco` (Figma 01 e 16), no layout dos Endereços salvos:
- Cliente cadastrado: Casa e Trabalho, com Casa marcada, seleção única, "Entregar neste endereço" e os atalhos "Usar localização atual", busca e "Endereços de pedidos anteriores" (por enquanto, sem ação).
- Novo cliente: só a busca e "Usar localização atual", sem as seções vazias e sem "Entregar neste endereço".

"Entregar neste endereço" volta a `#checkout` na etapa Pagamento, ainda sem as formas de pagamento. Lá aparecem o cartão "Endereço de entrega" (rótulo, rua, cidade, complemento, referência, divisor e "Entrega estimada: 30–45 min", com "Alterar") e o Resumo do pedido com Taxa de entrega (R$ 8,90) e Total do pedido. "Voltar ao checkout" e Voltar do navegador funcionam. Spec: `.scratch/checkout/spec.md` (Endereço, Resumo do pedido).

**Blocked by:** 02

**Status:** resolved

- [x] Endereços salvos do Cliente cadastrado com Casa marcada
- [x] Novo cliente sem seções vazias
- [x] Entregar neste endereço leva ao Pagamento, com o indicador Identificação e Endereço concluídos
- [x] Cartão do endereço no Checkout e Alterar
- [x] Taxa de entrega e Total do pedido no Resumo do pedido
- [x] Testes Playwright

## Answer

**Situações fixas:** `prototype/src/checkout-fixtures.js` ganhou `savedAddresses` (Casa e Trabalho, cada um com `id`, `label`, `street`, `district`, `city`, `complement` e `reference`), `deliveryFee` (890 centavos) e `deliveryTime` ("30–45 min"). Os dois Clientes cadastrados têm Casa e Trabalho; o Novo cliente, nenhum. O ticket 04 pode acrescentar os endereços da busca no mesmo formato.

**Estado:** `customer.addresses` (cópia dos Endereços salvos, para os tickets 04 e 05 acrescentarem, editarem e removerem), `addressPick` (o id marcado em Seus endereços: o primeiro do Cliente cadastrado, `null` do Novo cliente) e `delivery` (o id escolhido com "Entregar neste endereço", `null` até lá), com as ações `addressPick` e `addressDeliver` num reducer próprio (`addressReducer`) e `savedAddress(s, id)`. Como `delivery` é um id, editar o endereço em uso já vale para o Checkout (ticket 05). Voltar a Seus endereços pelo Checkout marca de novo o endereço em uso.

**Seus endereços (`#endereco`):** `addressList()` em `prototype/src/checkout.js`, abaixo de "Voltar ao checkout", do título e do indicador na etapa Endereço:
- "Buscar endereço e número" e "Usar localização atual" são botões, ainda sem ação, com `data-address-search` e `data-address-locate` para o ticket 04.
- Os Endereços salvos são um `radiogroup` de cartões (rádio invisível sobre o cartão inteiro, ✓ e borda vermelha no marcado). Marcar mantém o foco no rádio.
- "Endereços de pedidos anteriores" (`data-address-previous`, sem ação, para o ticket 05) aparece só para o Cliente cadastrado.
- "Entregar neste endereço" aparece só quando há Endereços salvos e fica desabilitado sem nenhum marcado (o caso do ticket 05).

**Pagamento:** com um cliente identificado e um endereço escolhido, `#checkout` (e o Continuar do Carrinho) abre o Pagamento: indicador com Identificação e Endereço concluídos, `deliveryCard()` (rótulo, rua e número, cidade, complemento e referência, divisor, "Entrega estimada: 30–45 min" e "Alterar") e o Resumo do pedido com Taxa de entrega e Total do pedido (`orderSummary(cart, true)`). As formas de pagamento entram em `paymentStep(state)` (hoje vazio), abaixo do cartão, na coluna `.checkout-main`. Sem endereço, `#checkout` continua indo a Seus endereços.

**Navegação:**
- Na primeira chegada a Seus endereços, a entrada do histórico guarda (`history.state.addressBack`) o que vem antes dela: o Pagamento (`checkout`, vindo de Alterar), o Carrinho (`cart`) ou outra coisa. Assim o Voltar e o Avançar do navegador não confundem os botões.
- "Entregar neste endereço" e, com endereço escolhido, "Voltar ao checkout" voltam à entrada do Pagamento quando vieram dela (`history.back()`); senão, abrem `#checkout` numa nova entrada. Voltar do navegador no Pagamento leva a Seus endereços.

**Decisões fora da letra da spec:**
- Sem endereço escolhido, o Checkout não tem nada além da Identificação já concluída, então "Voltar ao checkout" volta ao Carrinho (a entrada anterior quando veio dele).
- No cartão do Checkout, a cidade aparece sem o bairro ("São Paulo — SP"), como no Figma pix/savedCard; na lista, "Bairro, Cidade".
- O menu ⋮ dos cartões fica para o ticket 05, e o rodapé fixo de "Entregar neste endereço" no celular, para o ticket 09 (abaixo de 1024px, o botão só ocupa a largura toda). No celular, complemento e referência já ficam em linhas separadas.
- O ícone de Favoritos (coração) já existe para o ticket 04.

**Testes:** `prototype/tests/endereco.spec.js` (8 testes, em 1280 e 390): Endereços salvos do Cliente cadastrado com Casa marcada e os atalhos; Novo cliente sem seções vazias; Entregar neste endereço até o Pagamento (indicador, cartão, Taxa de entrega R$ 8,90, Total do pedido) e Voltar do navegador; Alterar e a troca do endereço, com o histórico; Voltar ao checkout e Voltar/Avançar do navegador sem trocar o endereço; Voltar ao checkout sem endereço; Continuar do Carrinho direto ao Pagamento; Novo cliente em `#checkout` sem endereço. Capturas de revisão em `.scratch/checkout/capturas/03-{enderecos-salvos,trabalho-selecionado,novo-cliente,pagamento}-{desktop,mobile-390}.png`.
