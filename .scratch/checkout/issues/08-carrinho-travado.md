# 08: Carrinho travado enquanto o Pix está pendente

**What to build:** com um Pix aguardando pagamento:
- No Checkout somem "Voltar ao carrinho" e "Editar carrinho".
- A navegação do cabeçalho continua livre, mas a tela do Carrinho mostra os Itens só para leitura, com o aviso "Há um Pix aguardando pagamento." e "Voltar ao pagamento".
- "Adicionar ao carrinho" no cardápio não adiciona e mostra o toast "Conclua o pagamento ou escolha outra forma de pagamento para alterar o carrinho.".
- Só "Escolher outra forma de pagamento" destrava.
- Se o Pix for aprovado com o cliente fora do Checkout, aparece o toast de pagamento aprovado com o link "Ver pedido".
- Editar o carrinho sem Pix pendente descarta o Pedido ainda não confirmado.

Spec: `.scratch/checkout/spec.md` (Pedido e carrinho travado).

**Blocked by:** 07

**Status:** resolved

- [x] Sem saídas de edição no Checkout com Pix pendente
- [x] Carrinho só leitura com "Voltar ao pagamento"
- [x] Adicionar ao carrinho bloqueado com o toast
- [x] Destravar só por "Escolher outra forma de pagamento"
- [x] Aprovação fora do Checkout com "Ver pedido"
- [x] Testes Playwright

## Answer

**Estado (`prototype/src/state.js`):** `cartLocked(s)` (exportado) é verdadeiro com um Pedido de Pix (`status: 'pix'`): aguardando, expirado e também durante "Pagamento aprovado!" (1,5 s), cuja confirmação encerra o carrinho. Travado, o reducer ignora `add`, `continue` e as ações `item*`. O reducer passou a envolver o antigo (`step`): uma mudança do carrinho com o Pedido `pending` (depois de uma recusa ou de "Escolher outra forma de pagamento") descarta o Pedido (`order: null`) e a falha do cartão.

**Tela (`prototype/src/main.js`):** no Checkout com o carrinho travado, `#checkout-back` fica `hidden` e o Resumo do pedido sai sem "Editar carrinho" (`edit: false`). `renderCart` travado usa `lockedCard` (foto, nome, Ingredientes, "Combo · Bebida", "Quantidade: N" e Total do item, sem controles), o aviso `role="group"` "Pix aguardando pagamento" com "Há um Pix aguardando pagamento." e "Voltar ao pagamento" (`#checkout`), e o Resumo do carrinho sem Continuar nem Adicionar mais itens. "Adicionar ao carrinho" travado mostra o toast do bloqueio. `toast(t, link)` aceita um link; a confirmação do Pix fora do Checkout mostra "Pagamento aprovado! Pedido #BK1024 confirmado." com "Ver pedido" (`#pedido/<id>`). Estilos no fim de `styles.css`.

**Decisões fora da letra da spec:**
- O texto do toast de aprovação ("Pagamento aprovado! Pedido #BK1024 confirmado.") não está na spec nem no Figma. Ele aparece na confirmação (1,5 s depois da aprovação, quando o Pedido ganha o id), e não na aprovação.
- O toast com link fica 8 s na tela (os outros, 2,8 s), para dar tempo de chegar ao link.
- O carrinho também fica travado durante "Pagamento aprovado!", porque a confirmação logo depois esvazia o carrinho.
- O Carrinho travado esconde "Continuar" e "Adicionar mais itens" e não tem a barra fixa do celular. "Voltar ao cardápio" continua. "Voltar ao pagamento" abre `#checkout` numa nova entrada do histórico.
- Fora do Checkout, a aprovação deixa o cliente onde está. Se ele estiver no Carrinho, a tela passa ao estado vazio.
- `#endereco` digitado com o Pix pendente não foi travado: a spec não fala dele, e o ticket 05 mexe nessas rotas.

**Testes:** `prototype/tests/carrinho-travado.spec.js` (6 testes, em 1280 e 390, com `page.clock`), com `avisoDoPix` no fim de `tests/support.js`. Cobrem o Checkout sem as saídas de edição com o Pix pendente e expirado, e a volta delas depois de "Escolher outra forma de pagamento"; o Carrinho só para leitura com o aviso e "Voltar ao pagamento"; "Adicionar ao carrinho" bloqueado em Hambúrgueres, em Acompanhamentos e com o Pix expirado, e destravado só por "Escolher outra forma de pagamento"; a aprovação no Carrinho e no cardápio, com o toast, "Ver pedido" até #BK1024 e o cardápio destravado; e o Pedido recusado descartado ao editar o carrinho (sem a falha, "Confirmar e pagar R$ 72,70"). `npm test` e `npm run test:build` passam. Capturas de revisão em `.scratch/checkout/capturas/08-{checkout-pix-pendente,carrinho-travado,adicionar-bloqueado,aprovado-fora}-{desktop,mobile-390}.png`. As duas capturas de toast em 390 são de página inteira: no projeto mobile, a área de layout (474 × 1026) é maior que a da captura, e o toast fixo ficava fora dela.
