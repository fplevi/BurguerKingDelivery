# 03: Revisão humana do Cheeseburger Duplo

**What to build:** o responsável pelo produto compara o Cheeseburger Duplo com a foto oficial no hero e em Ver ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. Entrega de uma vez: as quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado de `site_Cheeseburger_Duplo.png` e os quadros da Entrada e da Saída (`npm run quadros-entrada -- cheeseburgerDuplo`, com `npm run dev` rodando). Pontos a confirmar na revisão: a Mostarda (fio fino, cor, quanto aparece), as carnes finas da foto contra a carne aprovada, e se os dois queijos amarelos do Whopper batem com a cor da foto. Se algo mudar, não pode alterar o queijo, o picles, o ketchup nem os outros hambúrgueres aprovados.

**Blocked by:** 02.

**Status:** resolved

- [x] Quatro capturas e quadros da Entrada e da Saída entregues juntos, com a foto oficial ao lado
- [x] Ajustes pedidos aplicados e novas capturas anexadas (nenhum ajuste pedido)
- [x] Aprovação do responsável registrada em `## Comments`

## Answer

Aprovado sem ajustes na primeira rodada, incluindo o `squash` das carnes (0,78) e do pão superior (0,82) vindo do ticket 01. As capturas finais são as de `capturas/03/`. Nada mudou no código, então o queijo, o picles, o ketchup e os outros hambúrgueres aprovados ficaram iguais.

## Comments

- 2026-10-17 (agente): entrega única para a revisão, em `.scratch/cheeseburger-duplo/capturas/03/`. São as quatro capturas padrão (`desktop-montado`, `desktop-aberto`, `390x844-montado`, `390x844-aberto`, mais os dois `-hero` de página inteira) e a folha `revisao-lado-a-lado.png`, com as quatro vistas e `site_Cheeseburger_Duplo.png` à direita. Os quadros da Entrada e da Saída estão em `capturas/03/quadros/` (`entrada.png` e `saida-0200ms.png`); a Entrada acaba em ~800 ms. Aguardando a decisão do responsável pelo produto. Pontos para esta revisão: (1) a Mostarda fica escondida sob o pão superior no montado; só aparece em Ver ingredientes, como um fio amarelo em zigue-zague; na foto ela também quase não aparece; (2) as carnes estão achatadas com `squash: 0.78` (e o pão superior com `0.82`), opção nova da cena vinda do ticket 01, que precisa do aval; na foto as carnes ainda são um pouco mais finas e mais escuras; (3) os dois queijos são o amarelo do Whopper; na foto o queijo é um pouco mais alaranjado e derrete em ponta mais longa pela borda; (4) os picles aparecem menos que na foto, onde são duas rodelas grandes saindo da borda; (5) o pão inferior parece um pouco mais alto que o da foto.
- 2026-10-17 (responsável pelo produto): "Tudo certo. Aprovado sem ajustes, incluindo o squash das carnes e do pão superior."
