# 02: Endereço de entrega no cardápio, sem Identificação

**What to build:** a linha "Entregar em" no topo de cada categoria e o fluxo de endereço do visitante, como na spec (Endereço de entrega no cardápio) e no ADR 0002:
- "Onde vamos entregar?" com "Informar endereço"; com endereço, o endereço e "Alterar".
- Visitante: busca/localização, mapa e dados de entrega sem "Como você quer salvar?", terminando em "Entregar neste endereço". As páginas de endereço deixam de exigir a Identificação.
- Identificado: "Alterar" abre Seus endereços.
- Volta para a categoria de origem; fora da região mantém o endereço anterior.
- Depois da Identificação, o endereço do visitante continua marcado, no topo de Seus endereços, com a opção de salvá-lo.
- O Checkout passa pela etapa Endereço com o Endereço de entrega já marcado.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Estados vazio e com endereço
- [ ] Fluxo do visitante sem Identificação e sem salvar
- [ ] Cliente identificado abre Seus endereços
- [ ] Retorno à categoria de origem; fora da região sem mudar o endereço
- [ ] Endereço do visitante preservado após a Identificação, com opção de salvar
- [ ] Checkout com o endereço marcado, sem pular a etapa
- [ ] Não aparece no Carrinho, Ver ingredientes, Checkout, Minha conta e acompanhamento
- [ ] Atualizar a spec do Checkout (regra das páginas de endereço)
- [ ] Testes Playwright
