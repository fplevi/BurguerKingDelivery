# 06: Pagamento com cartão e confirmação do Pedido

**What to build:**
- **"Forma de pagamento":** Pix e Cartão de crédito, seleção única e destacada. Pix por enquanto só seleciona; o Pix entra no ticket 07.
- **Cartão salvo:** "Seus cartões" com bandeira e número mascarado, código de segurança.
- **Novo cartão:** número com a bandeira pelo prefixo, nome impresso, validade, CVV e "Salvar cartão para os próximos pedidos", desmarcado.
- **"Confirmar e pagar R$ X"** cria o Pedido, mostra o processamento (~1,5 s, Figma cardProcessing) e o resultado conforme as situações fixas de cartão (aprovado, recusado com Figma cardError, número inválido).
- **Aprovação** leva a `#pedido/BK1024` (Figma successCard):
  - O indicador fica todo concluído.
  - A tela mostra "Pedido confirmado!", o identificador em sequência na sessão, a previsão, o endereço, "Pago com cartão Visa •••• 4242 · R$ X" e o Resumo do pedido sem "Editar carrinho".
  - "Acompanhar pedido" (principal) mostra o toast de que ainda não faz parte do protótipo; "Voltar ao cardápio" (contorno) leva à última categoria vista.
  - O carrinho fica vazio, e o Voltar do navegador leva ao cardápio.
  - Um novo checkout na mesma sessão reaproveita o celular, os endereços e os cartões.

Spec: `.scratch/checkout/spec.md` (Pagamento, Confirmação, Situações fixas).

**Blocked by:** 03

**Status:** resolved

- [x] Forma de pagamento com a ação principal adaptada
- [x] Cartão salvo aprovado (CVV válido) e recusado (CVV `000`)
- [x] Novo cartão aprovado (Visa e Mastercard), recusado e inválido
- [x] Salvar cartão inclui o cartão na lista da sessão
- [x] Processamento com a tela desabilitada (`page.clock`)
- [x] Falha mantém Itens, Personalizações e endereço e oferece outro cartão ou Pix
- [x] Confirmação com id em sequência, carrinho encerrado, Acompanhar pedido, Voltar ao cardápio e Voltar do navegador
- [x] Testes Playwright

## Answer

**Situações fixas:** `prototype/src/checkout-fixtures.js` ganhou `savedCards` (Visa •••• 4242 de Mariana Silva, 08/29, nos dois Clientes cadastrados), `declinedCvv` (`000`), `cardNumbers` (os três números da tabela, aprovado ou recusado), `cardBrand()` (4 Visa, 5 Mastercard), `processingTime` (1500 ms) e `firstOrder` (1024). A tabela do README tem as linhas do cartão.

**Estado (`prototype/src/state.js`):**
- `customer.cards`: os Cartões salvos da sessão (cópia dos da fixture; `[]` do Novo cliente).
- `payment`: a Forma de pagamento (`''`, `'pix'` ou `'card'`), o cartão escolhido (`''` = o primeiro salvo, ou `'new'`), o código de segurança, os campos do Novo cartão (número e validade só com dígitos), `save`, `errors` por campo e `failed` (a última tentativa foi recusada, até a próxima mudança). Ações `payMethod`, `payCard`, `payInput`, `payConfirm` (com `today`, para a validade) e `payResult`, num reducer próprio (`payReducer`). Durante o processamento, só `payResult` muda o pagamento.
- **Pedido**, para o Pix reaproveitar: `createOrder(s, paidWith, extra)` cria `order` a partir do carrinho e do endereço em uso (`items`, `address`, `fee`, `total`, `paidWith`, `status: 'processing'`); `confirmOrder(s)` o transforma em Pedido confirmado, com o próximo id (`BK` + `nextOrder`, a partir de 1024), em `orders`, e encerra o carrinho (vazio) e o pagamento (de volta ao início). Uma recusa deixa o Pedido em `status: 'pending'`, sem id. O ticket 07 pode criar o Pedido com `createOrder(s, 'Pix', …)` em "Gerar Pix" e confirmá-lo com `confirmOrder` na aprovação; a tela de confirmação já mostra "Pago com ${paidWith} · R$ X".
- `screen: 'pedido'` com `shownOrder` (o id de `#pedido/<id>`).

**Tela (`prototype/src/checkout.js`):** `paymentStep(state)` (Forma de pagamento, Seus cartões, código de segurança, "Adicionar novo cartão", Novo cartão e a falha do Figma cardError), `paymentAction(state)` (a ação e a nota, passadas a `orderSummary(cart, delivered, { action, edit })`), `processingStep(order)` (Figma cardProcessing) e `orderPage(order)` (Figma successCard). As opções de rádio têm o nome só pelo título ("Pix", "Visa •••• 4242") e a descrição pelo texto. `prototype/src/main.js` liga os campos (máscaras com o cursor depois do mesmo dígito, Enter confirma), o processamento (o cabeçalho fica `inert`, "Voltar ao carrinho" e "Editar carrinho" desabilitados, o foco vai ao cartão do processamento) e a tela `#order-page` (`index.html`).

**Navegação:** a aprovação abre `#pedido/BK1024` numa nova entrada, com o foco em "Pedido confirmado!". O Voltar do navegador a partir dela, para o Carrinho, o Checkout ou o endereço, abre a última categoria vista (no lugar daquela entrada); o botão Carrinho do cabeçalho continua abrindo o Carrinho (vazio). `#pedido/<id>` sem esse Pedido confirmado na sessão leva ao cardápio.

**Decisões fora da letra da spec:**
- Nenhuma Forma de pagamento começa escolhida (como a spec pede na volta do Pix); até a escolha, "Confirmar e pagar R$ X" fica desabilitado.
- "Gerar Pix" aparece com o Pix, mas desabilitado até o ticket 07.
- O cartão salvo vem marcado (Figma savedCard). "Adicionar novo cartão" (Figma cardError) troca para o Novo cartão, com o foco no número; marcar um cartão salvo volta a ele. O Novo cliente vê o Novo cartão direto.
- Erros dos campos, sem texto no Figma: "Informe o código de segurança de 3 dígitos.", "Informe o nome impresso no cartão.", "Informe uma validade futura (MM/AA)." e o "Número de cartão inválido" da spec (também para um número incompleto). Todos aparecem ao tocar em "Confirmar e pagar", com o foco no primeiro inválido. A bandeira aparece abaixo do número ("Bandeira: Visa").
- O código de segurança é um campo de texto com os dígitos mascarados por CSS (`-webkit-text-security`), não `type=password`.
- A falha some na próxima mudança do pagamento. Uma nova tentativa recria o Pedido a partir do carrinho e do endereço do momento, ainda sem id.
- O processamento mantém o título "Finalizar pedido" e "Voltar ao carrinho" (desabilitado); o Figma cardProcessing não mostra o título.
- O cartão salvo ganha id `card-N`. Um cartão igual salvo de novo aparece duas vezes, sem deduplicação.
- O rodapé fixo de Total do pedido e da ação no celular fica para o ticket 09: abaixo de 1024px, a ação está no Resumo do pedido, abaixo do conteúdo.

**Testes:** `prototype/tests/pagamento.spec.js` (9 testes, em 1280 e 390), com `irAoPagamento`, `continuarDoCarrinho`, `formaDePagamento`, `seusCartoes`, `confirmarEPagar` e `pedidoConfirmado` no fim de `tests/support.js`. Cobrem a Forma de pagamento e a ação do Resumo do pedido; o cartão salvo sem código, aprovado com o processamento e a tela desabilitada (`page.clock`), e a confirmação #BK1024; a recusa com CVV `000`, que mantém os Itens, "Sem cebola" e o endereço, oferece outro cartão e o Pix e permite tentar de novo; o Novo cartão Visa com máscaras e bandeira; os campos obrigatórios, a validade vencida e o número inválido sem processamento; 4000 0000 0000 0002 recusado; o Mastercard salvo e o novo checkout da sessão até #BK1025; Acompanhar pedido, o Voltar e o Avançar do navegador; e Voltar ao cardápio até a última categoria vista, além de `#pedido/<id>` desconhecido. `npm test` e `npm run test:build` passam (290). Um teste 3D de `categorias.spec.js` falhou uma vez por concorrência e passou ao rodar de novo. Capturas de revisão em `.scratch/checkout/capturas/06-{cartao-salvo,cartao-recusado,novo-cartao,processando,pedido-confirmado}-{desktop,mobile-390}.png`.

## Comments

**Revisão de código (fix/checkout-review):** durante o processamento (1,5 s) só o cabeçalho ficava inerte; o Voltar do navegador saía do Checkout, o carrinho podia mudar e o resultado forçava `#pedido/<id>`. Agora o processamento trava o carrinho e o endereço (ver o comentário do ticket 08), e o resultado com o cliente fora do Checkout o deixa onde está: aprovado, o mesmo toast do Pix com "Ver pedido" (`confirmed(id)` em `main.js`, comum ao cartão e ao Pix); recusado, o toast "Não conseguimos aprovar o pagamento." com "Voltar ao pagamento" (`#checkout`, com a falha). O texto digitado (rua, bairro, complemento, referência, nome do cartão) passa por um só `esc()` em `checkout.js` em todo HTML (lista, Remover endereço, cartão do endereço, Pedido confirmado, Seus cartões). Testes em `tests/carrinho-travado.spec.js`, `tests/novo-endereco.spec.js` e `tests/pagamento.spec.js`.
