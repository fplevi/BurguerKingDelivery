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

**Status:** ready-for-agent

- [ ] Forma de pagamento com a ação principal adaptada
- [ ] Cartão salvo aprovado (CVV válido) e recusado (CVV `000`)
- [ ] Novo cartão aprovado (Visa e Mastercard), recusado e inválido
- [ ] Salvar cartão inclui o cartão na lista da sessão
- [ ] Processamento com a tela desabilitada (`page.clock`)
- [ ] Falha mantém Itens, Personalizações e endereço e oferece outro cartão ou Pix
- [ ] Confirmação com id em sequência, carrinho encerrado, Acompanhar pedido, Voltar ao cardápio e Voltar do navegador
- [ ] Testes Playwright
