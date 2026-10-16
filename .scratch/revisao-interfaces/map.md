# Revisão das interfaces — mapa

## Notes

- Type: task.
- Solicitação: criar uma spec para revisar as interfaces em código, incluindo tokens visuais, tipografia e fidelidade dos ícones à biblioteca do Figma.
- Aplicam-se as skills grill-with-docs, grilling e domain-modeling.
- Tickets publicados após aprovação explícita da divisão. Ticket 01 implementado e revisado em 15/10/2026.

## Decisions-so-far

- [Ticket 08 concluído](issues/08-pedidos-acompanhamento.md): lista e acompanhamento com fontes/tokens/WhatsApp original e Voltar contextual, preservando regras e marcadores ilustrados. [Matriz](matriz.md#ticket-08--pedidos-confirmados-e-acompanhamento): 208 combinações em 16 larguras, 91 capturas; 26 focados iniciais e 34 finais aprovados. Suíte completa: 666 aprovados/39 ignorados/5 falhas; quatro de alinhamento corrigidas, timeout Stacker isolado 3/3 aprovado, sem declarar a ampla verde. [Revisão](revisao-08.md): Standards 0, Spec 0 incluindo correção final. Commits `1a2eeae`, `945cda2`.

- [Ticket 07 concluído](issues/07-minha-conta.md): Minha conta com fontes/tokens/ícones originais, Código de confirmação compartilhado, Voltar contextual e persistência/toasts preservados. [Matriz](matriz.md#ticket-07--minha-conta): 231 combinações, 84 capturas; focados 52 aprovados/2 ignorados, suíte completa 671 aprovados/39 ignorados/zero falhas; ajuste final validado em 10 testes. [Revisão](revisao-07.md): Standards 0, Spec 0 pendentes.

- [Ticket 06 concluído](issues/06-checkout-codigo-confirmacao.md): Checkout e Código de confirmação reutilizável, navegação preservada, fontes/tokens/ícones revisados e toasts acima da barra fixa. [Matriz/evidências](matriz.md#ticket-06--checkout-e-código-de-confirmação): 220 combinações, 100 capturas; focados 107 aprovados/7 ignorados. Suíte completa isolada `fc94916`: 670 aprovados/39 ignorados/1 falha na Entrada 3D; caso isolado 3/3 aprovado, sem concluir causa nem declarar a suíte verde. [Revisão](revisao-06.md): Standards 0, Spec 0 pendentes.


- [Ticket 05 concluído](issues/05-carrinho.md): tokens, fontes e ícones originais no Carrinho, Voltar único e toast com Desfazer acima da altura real da barra mobile. Valores, Combo, Personalização e quantidades preservados. [Matriz/evidências](matriz.md#ticket-05--carrinho): 168 combinações em 14 larguras e 72 capturas. Suíte completa no build: 669 aprovados/39 ignorados; checagem final: 16 aprovados/6 ignorados; zero falhas. [Revisão](revisao-05.md): Standards 0, Spec 0.

- [Ticket 04 concluído](issues/04-endereco-de-entrega.md): tokens, fontes/ícones originais, único Voltar contextual, menu web ancorado e painéis móveis de ações/remoção. Toast compartilhado com quebra de linha e reserva da barra fixa; ADR 0002 preservada. [Matriz/evidências](matriz.md#ticket-04--endereço-de-entrega): 165 combinações em onze larguras. Build e 80 testes focados aprovados; suíte completa isolada de `37bc826`: 669 aprovados, 39 ignorados, zero falhas. [Revisão](revisao-04.md): Standards 0, Spec 0.

- [Ticket 03 concluído](issues/03-ver-ingredientes.md): tokens, Bandeja e ícones originais de 16 px em Ver ingredientes; Cancelar/Aplicar e cena 3D preservados. [Matriz/evidências](matriz.md#ticket-03--ver-ingredientes): 36 combinações em 12 larguras e 12 verificações das demais receitas. Build e focados aprovados; suíte completa isolada do commit `763d830`: 627 aprovados, 39 ignorados, zero falhas. [Revisão](revisao-03.md): Standards 0, Spec 0.

- [Ticket 02 concluído](issues/02-cards-cardapio-responsivos.md): fotos inteiras e nomes livres de sobreposição, colunas com largura mínima, Crown original e tokens dos cards. [Matriz/evidências](matriz.md#ticket-02--cards): 52 combinações aprovadas em 13 larguras, 403 cards e 52 seleções. Build aprovado; focados finais 32 aprovados/8 ignorados, repetições de falhas 8 aprovadas. Suíte ampla original 622 aprovados/39 ignorados/5 falhas, com histórico preservado no Answer. [Revisão](revisao-02.md): Standards 0, Spec 0.

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
- Ticket 09 ainda não implementado; 02–08 concluídos. Falhas e repetições das suítes estão preservadas nos Answers, sem conclusão de causa para timeouts/inclinação não reproduzidos isoladamente.

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

Com 01 resolvido, 02, 03, 04, 05 e 08 ficam disponíveis. 06 está resolvido; 07 está resolvido; 09 integra 02–08. Os estados efetivos devem ser consultados nos arquivos dos tickets.
