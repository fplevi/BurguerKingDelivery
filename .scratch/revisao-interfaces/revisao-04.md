# Revisão do ticket 04

Base fixa: `cc8d690f5d1a6f3bfe99051d05d126bd59ffb8ae`; implementação inicial `ae9371e`, seguida dos ajustes de navegação, posição do menu e preservação do primeiro clique. Spec: [ticket 04](issues/04-endereco-de-entrega.md) e [critérios compartilhados](spec.md).

## Standards

Zero achados finais. Nenhum desvio documentado nem smell relevante. A primeira revisão observou que fechar o menu no pointerdown reconstruía a lista e poderia consumir a primeira interação. Corrigido: atualização do estado efêmero e remoção apenas do dialog, com restauração de foco somente nos fechamentos por Escape/painel. O coletor confere seleção no primeiro clique com menu aberto no web. Reavaliação dos ajustes finais sem achados.

## Spec

Zero achados finais. Retorno único e contextual, busca sem ciclos de visitas antigas, menu ancorado no web, painéis móveis de ações e remoção, tokens, fontes BK, SVGs originais e toast acima da barra fixa. Escolha sem Identificação e ausência de mensagem nova para endereço atendido preservadas conforme ADR 0002. Sem mudança de regra de pedido ou de renderização 3D. Reavaliação dos ajustes finais sem achados.

Standards: 0 achados restantes; Spec: 0 achados restantes. Evidências e resultados de execução estão na [matriz](matriz.md) e no Answer do ticket.
