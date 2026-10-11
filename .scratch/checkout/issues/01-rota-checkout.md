# 01: Checkout em `#checkout` com indicador de etapas e Resumo do pedido (tracer bullet)

**What to build:** o Continuar do Carrinho, depois da validação de combo sem bebida, abre o Checkout em `#checkout`; o toast "o pagamento não faz parte do protótipo" sai. A tela "Finalizar pedido" tem "Voltar ao carrinho", o título, o indicador de etapas (componente Figma `246-10579`, Identificação atual) e o Resumo do pedido com os Itens ("N× Nome", Total do item, "Combo · Bebida" e "Sem …" em vermelho), o Total dos itens e "Editar carrinho". A etapa ainda é um espaço vazio. O cabeçalho fica sem o "Entregar em" e sem categoria ativa. Guardas: `#checkout` com o carrinho vazio, ou pelo endereço digitado, leva ao Carrinho. Layout simples de duas colunas a partir de 1024px e uma coluna abaixo. Spec: `.scratch/checkout/spec.md` (Rotas e navegação, Indicador de etapas, Resumo do pedido).

**Blocked by:** —

**Status:** resolved

- [x] Continuar abre `#checkout`; o toast antigo sai e os testes dele mudam
- [x] Indicador de etapas com as quatro variantes (Identificação, Endereço, Pagamento, Concluído), acessível com `aria-current="step"`
- [x] Resumo do pedido com Itens e Total dos itens
- [x] "Voltar ao carrinho" e "Editar carrinho" levam a `#carrinho`
- [x] "Entregar em" escondido só no Checkout
- [x] Guarda do carrinho vazio
- [x] Testes Playwright

## Answer

**Rota e estado:** o estado ganhou a tela `checkout` (`screen`, em `prototype/src/state.js`). A ação `category` com `checkout` troca só a tela, mantendo a última categoria, e apaga o aviso de Item removido, como ao sair do Carrinho.

**Continuar:** sem combo pendente, o Continuar do Carrinho leva a `#checkout`. O toast antigo saiu, e os testes que o conferiam (`tests/continuar.spec.js` e `tests/layout-carrinho.spec.js`) agora conferem a abertura do Checkout.

**Tela:** `#checkout-page` em `index.html` tem "Voltar ao carrinho", o h1 "Finalizar pedido" (que recebe o foco ao entrar, com a página no topo) e o conteúdo montado só enquanto a tela está visível. O conteúdo é:
- o indicador de etapas;
- a seção da etapa, ainda vazia;
- o Resumo do pedido.

O HTML do indicador e do Resumo fica num módulo novo, `prototype/src/checkout.js`:
- **`progress(current)`:** lista ordenada "Etapas do pedido", com a atual marcada por `aria-current="step"` e as concluídas com ✓ e o texto ", concluída" só para leitores de tela. Com `current = 3`, gera a variante Concluído. A linha fica atrás dos círculos: escura até a etapa atual, clara depois.
- **`orderSummary(cart)`:** "N× Nome" e o Total do item. "Combo · Bebida" aparece só com Combo, e "Sem …" (vermelho, a mesma `removedLine` do Carrinho) só com algo retirado. Depois vêm Total dos itens e "Editar carrinho".

`marks` (o ® elevado) passou de `main.js` para `state.js`, para ser compartilhado.

**Navegação:**
- "Voltar ao carrinho" e "Editar carrinho" usam `history.back()` quando o Checkout veio do Carrinho; senão, vão para `#carrinho`.
- Voltar do Checkout ao Carrinho não altera o caminho de volta do Carrinho ao cardápio.
- O "Entregar em" fica escondido só no Checkout, e nenhuma categoria fica ativa.

**Guarda:** `#checkout` com o carrinho vazio (o que inclui recarregar ou digitar o endereço, já que o carrinho vive em memória) ou com um combo sem bebida troca o endereço por `#carrinho` (`history.replaceState`) e mostra o Carrinho.

**Layout:** a partir de 1024px, a etapa fica à esquerda e o Resumo do pedido (356px) à direita. Abaixo, uma coluna, com "Voltar ao carrinho" na largura toda.

**Decisões fora da letra da spec:**
- O combo sem bebida também barra `#checkout`.
- As variantes Endereço, Pagamento e Concluído do indicador existem em `progress()`, mas só são testadas pela página nos tickets que as alcançam (02, 03 e 06).

**Testes:** novos em `prototype/tests/checkout.spec.js`, com os helpers `checkout`, `resumoDoPedido` e `etapas` em `tests/support.js`. Captura de revisão em `.scratch/checkout/capturas/01-checkout-*.png`.
