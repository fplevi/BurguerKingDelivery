# 03: Revisão humana do Rodeio Duplo

**What to build:** o responsável pelo produto compara o Rodeio Duplo com a foto oficial no hero e em Ver ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. Entrega de uma vez: as quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado de `site_Rodeio_Duplo.png` e os quadros da Entrada e da Saída (`npm run quadros-entrada -- rodeioDuplo`, com `npm run dev` rodando). Ponto a confirmar na revisão: o volume da Maionese, que na foto parece mais grossa que no Whopper; se mudar, não pode alterar o Whopper aprovado.

**Blocked by:** 02.

**Status:** resolved

- [x] Quatro capturas e quadros da Entrada e da Saída entregues juntos, com a foto oficial ao lado
- [x] Ajustes pedidos aplicados e novas capturas anexadas (nenhum ajuste pedido)
- [x] Aprovação do responsável registrada em `## Comments`

## Answer

Aprovado sem ajustes na primeira rodada. As capturas finais são as de `capturas/03/`. A Maionese ficou como está, então o Whopper aprovado não mudou.

## Comments

- 2026-10-14 (agente): entrega única para a revisão, em `.scratch/rodeio-duplo/capturas/03/`. São as quatro capturas padrão (`desktop-montado`, `desktop-aberto`, `390x844-montado`, `390x844-aberto`, mais os dois `-hero` de página inteira) e a folha `revisao-lado-a-lado.png`, com as quatro vistas e `site_Rodeio_Duplo.png` à direita. Os quadros da Entrada e da Saída estão em `capturas/03/quadros/` (`entrada.png` e `saida-0200ms.png`). A Entrada acaba em ~800 ms. Aguardando a decisão do responsável pelo produto. Pontos para esta revisão: a Maionese quase não aparece no montado, e na foto é uma camada branca grossa sob o pão de cima; o pão superior da foto é mais alto e mais claro; no montado, os onion rings saem um pouco menos laranja que na foto, e o barbecue sai mais escuro e mais grosso que a camada fina da foto.
- 2026-10-14 (responsável pelo produto): "Tudo certo. Aprovado sem ajustes."
