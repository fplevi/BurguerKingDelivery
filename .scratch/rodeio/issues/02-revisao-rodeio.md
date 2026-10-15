# 02: Revisão humana do Rodeio

**What to build:** o responsável pelo produto compara o Rodeio com a foto oficial no hero e em Ver ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. Entrega de uma vez: as quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado de `site_Rodeio.png` e os quadros da Entrada e da Saída (`npm run quadros-entrada -- rodeio`, com `npm run dev` rodando). Pontos a confirmar na revisão: o tamanho do anel único e o volume da Maionese, que na foto parece grossa; se mudar, não pode alterar o Whopper nem o Rodeio Duplo aprovados.

**Blocked by:** 01.

**Status:** resolved

- [x] Quatro capturas e quadros da Entrada e da Saída entregues juntos, com a foto oficial ao lado
- [x] Ajustes pedidos aplicados e novas capturas anexadas (nenhum ajuste pedido)
- [x] Aprovação do responsável registrada em `## Comments`

## Answer

Aprovado sem ajustes na primeira rodada. As capturas finais são as de `capturas/02/`. O anel (tamanho, parede, posição perto da borda com o pão tombado) e a Maionese ficaram como estão, então o Whopper e o Rodeio Duplo aprovados não mudaram.

## Comments

- 2026-10-15 (agente): entrega única para a revisão, em `.scratch/rodeio/capturas/02/`. São as quatro capturas padrão (`desktop-montado`, `desktop-aberto`, `390x844-montado`, `390x844-aberto`, mais os dois `-hero` de página inteira) e a folha `revisao-lado-a-lado.png`, com as quatro vistas e `site_Rodeio.png` à direita. Os quadros da Entrada e da Saída estão em `capturas/02/quadros/` (`entrada.png` e `saida-0200ms.png`). A Entrada acaba em ~800 ms. Aguardando a decisão do responsável pelo produto. Pontos para esta revisão: o tamanho do anel (0,53 de raio, quase o de cada anel do Rodeio Duplo) e a parede mais fina; a Maionese quase não aparece no montado, e na foto é uma faixa branca grossa sob o pão de cima; o anel fica perto da borda com o pão tombado (pedido no 01), e a foto tem o anel no centro sob o pão reto.
- 2026-10-15 (responsável pelo produto): "Tudo certo. Aprovado sem ajustes."
