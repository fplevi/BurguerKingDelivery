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

**Status:** resolved

- [x] Estados vazio e com endereço
- [x] Fluxo do visitante sem Identificação e sem salvar
- [x] Cliente identificado abre Seus endereços
- [x] Retorno à categoria de origem; fora da região sem mudar o endereço
- [x] Endereço do visitante preservado após a Identificação, com opção de salvar
- [x] Checkout com o endereço marcado, sem pular a etapa
- [x] Não aparece no Carrinho, Ver ingredientes, Checkout, Minha conta e acompanhamento
- [x] Atualizar a spec do Checkout (regra das páginas de endereço)
- [x] Testes Playwright

## Answer

**Estado** (`prototype/src/state.js`): `addressPrevious` virou `unsaved`, o único endereço de Seus endereços que não é Endereço salvo — o de pedido anterior escolhido ou o Endereço de entrega do visitante (`{id: 'entrega', label: 'Novo endereço', place}`). `savedAddress` não exige mais cliente. Ações novas: `addressGuest` (visitante: "Entregar neste endereço" nos Dados de entrega, sem salvar) e `addressSaveUnsaved` (identificado: abre os Dados de entrega do endereço do visitante; `saveAddress` o troca pelo Endereço salvo, inclusive no `delivery`). `idConfirm` e `idRegister` mantêm o Endereço de entrega marcado. `draftOf` saiu de `addressEdit` para o estado.

**Cardápio:** `#deliver-to` no topo de `.info` (no celular, acima do título), com "Onde vamos entregar?"/"Informar endereço" ou "Entregar em <rua> · <bairro>"/"Alterar"; os dois levam a `#endereco`.

**Fluxo** (`main.js`): as páginas de endereço não exigem carrinho nem celular. Vindas do cardápio, a entrada no histórico ganha `addressBack: 'menu'`: sem indicador de etapas, "Voltar ao cardápio" no topo, e escolher (visitante ou identificado) volta à categoria de origem. Depois da Identificação no Checkout, Seus endereços não é tratado como Alterar do Pagamento (`identifiedJump`). No cartão do endereço do visitante, identificado, "Salvar" fica no lugar do menu ⋮.

**Spec do Checkout:** guarda de `#endereco/*` e a sessão atualizadas.

**Testes:** `tests/entregar-em.spec.js` (6 cenários × 2 projetos); `identificacao.spec.js` reescreveu o teste da regra antiga. Suíte completa: 413 passando; das 3 falhas, 2 eram desse teste antigo (reescrito, passando) e 1 do `cena-3d` com movimento reduzido, que passou ao rodar sozinho.
