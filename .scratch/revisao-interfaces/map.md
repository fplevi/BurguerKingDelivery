# Revisão das interfaces — mapa

## Notes

- Type: task.
- Solicitação: criar uma spec para revisar as interfaces em código, incluindo tokens visuais, tipografia e fidelidade dos ícones à biblioteca do Figma.
- Aplicam-se as skills grill-with-docs, grilling e domain-modeling.
- Tickets publicados após aprovação explícita da divisão. Ticket 01 implementado e revisado em 15/10/2026.

## Decisions-so-far

- [Ticket 01 concluído](issues/01-padroes-compartilhados-cardapio.md): tokens, fontes BK e SVGs exatos demonstrados no header e na compra; [matriz e evidências](matriz.md) para os demais fluxos. Build aprovado; suíte ampla com 626 aprovados, 39 ignorados e uma falha de inclinação 3D, não reproduzida em três repetições isoladas. Revisão Standards/Spec sem achados.

- [Spec consolidada](spec.md): escala de espaçamentos, três raios, tamanhos de ícones e fontes BK vêm das decisões explícitas já tomadas com o usuário.
- Nomenclatura de negócio preservada conforme GLOSSARY.md. Não surgiu termo de domínio novo nem decisão que justifique um ADR adicional.
- Fatos apurados: biblioteca adicionada ao Figma chamada Icons; variantes consultadas Outline/Bold. Spec registra keys dos componentes e divergências iniciais no código. Não há comprovação para atribuir esses componentes a um pacote Phosphor.
- Usuário confirmou incluir tudo o que foi discutido no chat: fundos/header, navegação, card do Código de confirmação, toasts, menus, fontes, tokens e ícones.
- Usuário confirmou comparar nos tamanhos do Figma e entre eles. Acrescentou o problema de fotos cortadas e textos desaparecendo nos cards do Cardápio; a spec exige conteúdo completo e revisão das transições de coluna.
- Apuração da grade concluída: recorte/zoom e colunas sem largura mínima são hipóteses para o corte; desaparecimento dos nomes ainda precisa ser reproduzido. Spec registra limites 1024/1920 e critérios para fotos e nomes integralmente visíveis.

## Fog

- Apuração inicial de ícones, implementação e meios de validação concluída; inventário exaustivo ficará como entrega da revisão.
- Não há decisão de escopo pendente nesta entrevista. A reprodução dos problemas e o inventário exaustivo são trabalho da futura execução, não impedimento à conclusão da spec.
- Tickets 02–09 ainda não implementados. Cards com fotos sobre nomes e recorte reproduzidos a 768 px; evidência na matriz para o ticket 02. A falha de inclinação da suíte ampla está registrada no Answer do ticket 01, sem conclusão sobre sua causa.

## Tickets publicados

Divisão em nove tickets aprovada pelo usuário. Ticket 01 em Status: resolved; executar apenas os tickets cujos bloqueadores estiverem resolvidos. A tabela registra os estados iniciais.

| Ticket | Entrega | Blocked by | Status inicial |
| --- | --- | --- | --- |
| [01](issues/01-padroes-compartilhados-cardapio.md) | Padrões compartilhados demonstrados no Cardápio | None (can start immediately) | ready-for-agent |
| [02](issues/02-cards-cardapio-responsivos.md) | Cards do Cardápio sem cortes nas resoluções suportadas | 01 | ready-for-agent |
| [03](issues/03-ver-ingredientes.md) | Ver ingredientes consistente em web e mobile | 01 | ready-for-agent |
| [04](issues/04-endereco-de-entrega.md) | Endereço de entrega com navegação, menus e feedbacks padronizados | 01 | ready-for-agent |
| [05](issues/05-carrinho.md) | Carrinho consistente, incluindo item removido e Desfazer | 01 | ready-for-agent |
| [06](issues/06-checkout-codigo-confirmacao.md) | Checkout e Código de confirmação no padrão revisado | 01, 04 | ready-for-agent |
| [07](issues/07-minha-conta.md) | Minha conta com edição, autenticação e feedbacks consistentes | 01, 04, 06 | ready-for-agent |
| [08](issues/08-pedidos-acompanhamento.md) | Pedidos confirmados e acompanhamento com apresentação consistente | 01 | ready-for-agent |
| [09](issues/09-revisao-integrada.md) | Fechar a revisão integrada e retirar padrões obsoletos | 02, 03, 04, 05, 06, 07, 08 | ready-for-agent |

Com 01 resolvido, 02, 03, 04, 05 e 08 ficam disponíveis. 06 aguarda 04; 07 aguarda 04 e 06; 09 integra 02–08. Os estados efetivos devem ser consultados nos arquivos dos tickets.
