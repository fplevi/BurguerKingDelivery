# 02: Revisão humana do Big King

**What to build:** o responsável pelo produto compara o Big King com a foto oficial no hero e em Ver ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. Entrega de uma vez: as quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado de `site_Big_King.png` e os quadros da Entrada e da Saída (`npm run quadros-entrada -- bigKing`, com `npm run dev` rodando). Pontos a confirmar na revisão: o pão do meio (espessura, miolo e tostado; não pode parecer "de plástico", como os pães da primeira rodada do Whopper) e quanto molho aparece escorrendo nas duas Camadas. Se algo mudar, não pode alterar o pão inferior, o `stackerSauce` nem os outros hambúrgueres aprovados.

**Blocked by:** 01.

**Status:** needs-info

- [x] Quatro capturas e quadros da Entrada e da Saída entregues juntos, com a foto oficial ao lado
- [ ] Ajustes pedidos aplicados e novas capturas anexadas
- [ ] Aprovação do responsável registrada em `## Comments`

## Comments

- 2026-10-15 (agente): entrega única para a revisão, em `.scratch/big-king/capturas/02/`. São as quatro capturas padrão (`desktop-montado`, `desktop-aberto`, `390x844-montado`, `390x844-aberto`, mais os dois `-hero` de página inteira) e a folha `revisao-lado-a-lado.png`, com as quatro vistas e `site_Big_King.png` à direita. Os quadros da Entrada e da Saída estão em `capturas/02/quadros/` (`entrada.png` e `saida-0200ms.png`). A Entrada acaba em ~1 s (o quadro de 1000 ms já é o montado), abaixo do teto de ~1,2 s. Nada mudou no código desde o ticket 01. Aguardando a decisão do responsável pelo produto. Pontos para esta revisão:
  - **Pão do meio:** disco liso e mais fino que o inferior (0,18 contra 0,28), com casca dourada na borda e miolo claro em cima. No montado aparece só a borda dourada; na foto a borda é mais clara e rosada, quase sem tostado. Não parece "de plástico" nas capturas, mas é o ponto a confirmar.
  - **Molho:** nas duas Camadas aparece pouco. O de baixo mostra só pontas rosadas na borda do pão do meio; na foto é uma faixa laranja grossa escorrendo por toda a frente. O de cima aparece como manchas rosadas entre a alface e o pão superior; na foto quase não aparece. Aumentar o escorrido exigiria mudar o `stackerSauce` (proibido) ou criar um modelo novo de molho só para o Big King.
  - **Proporções:** o montado sai mais largo e mais baixo que a foto, e a alface e a cebola passam menos da borda; as carnes e o pão superior são os modelos aprovados, sem escala por Camada.
  - **Cor do molho:** rosado-salmão, mais frio que o laranja da foto (é o do Stacker, que não pode mudar).
