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

**Status:** ready-for-agent

- [ ] Sem saídas de edição no Checkout com Pix pendente
- [ ] Carrinho só leitura com "Voltar ao pagamento"
- [ ] Adicionar ao carrinho bloqueado com o toast
- [ ] Destravar só por "Escolher outra forma de pagamento"
- [ ] Aprovação fora do Checkout com "Ver pedido"
- [ ] Testes Playwright
