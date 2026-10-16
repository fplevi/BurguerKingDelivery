# 02: Revisão humana do Big King

**What to build:** o responsável pelo produto compara o Big King com a foto oficial no hero e em Ver ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. Entrega de uma vez: as quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado de `site_Big_King.png` e os quadros da Entrada e da Saída (`npm run quadros-entrada -- bigKing`, com `npm run dev` rodando). Pontos a confirmar na revisão: o pão do meio (espessura, miolo e tostado; não pode parecer "de plástico", como os pães da primeira rodada do Whopper) e quanto molho aparece escorrendo nas duas Camadas. Se algo mudar, não pode alterar o pão inferior, o `stackerSauce` nem os outros hambúrgueres aprovados.

**Blocked by:** 01.

**Status:** resolved

- [x] Quatro capturas e quadros da Entrada e da Saída entregues juntos, com a foto oficial ao lado
- [x] Ajustes pedidos aplicados e novas capturas anexadas
- [x] Aprovação do responsável registrada em `## Comments`

## Answer

Aprovado depois de uma rodada de ajustes; as capturas finais são as de `capturas/02/ajustes/`. O molho Big King ganhou modelos próprios: `bigKingSauce`, uma peça lisa e arredondada sobre o pão do meio, escorrendo em gotas pela lateral, e `bigKingSauceTop`, discreto sob o pão de cima, os dois em laranja cremoso. A Alface e a Cebola passaram a ser alargadas pela Receita (`spread`). O pão do meio, o pão inferior, o `stackerSauce` e os outros hambúrgueres não mudaram.

## Comments

- 2026-10-15 (agente): entrega única para a revisão, em `.scratch/big-king/capturas/02/`. São as quatro capturas padrão (`desktop-montado`, `desktop-aberto`, `390x844-montado`, `390x844-aberto`, mais os dois `-hero` de página inteira) e a folha `revisao-lado-a-lado.png`, com as quatro vistas e `site_Big_King.png` à direita. Os quadros da Entrada e da Saída estão em `capturas/02/quadros/` (`entrada.png` e `saida-0200ms.png`). A Entrada acaba em ~1 s (o quadro de 1000 ms já é o montado), abaixo do teto de ~1,2 s. Nada mudou no código desde o ticket 01. Aguardando a decisão do responsável pelo produto. Pontos para esta revisão:
  - **Pão do meio:** disco liso e mais fino que o inferior (0,18 contra 0,28), com casca dourada na borda e miolo claro em cima. No montado aparece só a borda dourada; na foto a borda é mais clara e rosada, quase sem tostado. Não parece "de plástico" nas capturas, mas é o ponto a confirmar.
  - **Molho:** nas duas Camadas aparece pouco. O de baixo mostra só pontas rosadas na borda do pão do meio; na foto é uma faixa laranja grossa escorrendo por toda a frente. O de cima aparece como manchas rosadas entre a alface e o pão superior; na foto quase não aparece. Aumentar o escorrido exigiria mudar o `stackerSauce` (proibido) ou criar um modelo novo de molho só para o Big King.
  - **Proporções:** o montado sai mais largo e mais baixo que a foto, e a alface e a cebola passam menos da borda; as carnes e o pão superior são os modelos aprovados, sem escala por Camada.
  - **Cor do molho:** rosado-salmão, mais frio que o laranja da foto (é o do Stacker, que não pode mudar).
- 2026-10-15 (responsável pelo produto): "Corrigir todos, menos o do pão. Arrumar a cor do molho também." Depois, sobre a primeira tentativa (molho dobrado para baixo na borda): "Esse visual da maionese expremida como se houvesse uma parede segurando a maionese não ficou nada legal, acredito que a gente deve deixar o molho sempre com aspecto meio arredondado suave em todas as pontas."
- 2026-10-15 (agente): ajustes aplicados; novas capturas em `capturas/02/ajustes/` (as mesmas vistas, `revisao-lado-a-lado.png` com a foto oficial e `quadros/`). O pão do meio não mudou.
  - **Molho Big King inferior:** modelo próprio, `bigKingSauce`. É uma peça única e lisa, levemente abaulada, com a borda num cordão grosso e arredondado logo além do pão do meio. Em 11 pontos o cordão cede e escorre pela lateral em gotas de ponta redonda, sem dobras nem cortes retos.
  - **Molho Big King superior:** modelo próprio, `bigKingSauceTop`. Poça menor, com gotas antes da borda; quase não aparece sob o pão de cima.
  - **Cor:** laranja cremoso e brilhante (`#f4a648`, pouco áspero), diferente do queijo. O `stackerSauce` e o Stacker Duplo Bacon não mudaram. O SVG sem WebGL usa a mesma cor.
  - **Alface e Cebola:** os modelos do Whopper, alargados só no Big King pela Receita (`spread` 1,14 e 1,08); passam mais da borda.
  - A Entrada continua em ~1 s.
  - Suíte `npm run test:build` numa cópia isolada (HEAD + estas mudanças): 668 passaram, 1 falhou por tempo esgotado (`categorias.spec.js:169`, 23 s). Outra sessão rodava a suíte ao mesmo tempo nesta máquina; o teste passou 3 de 3 depois e também passa sem as mudanças.
  - Aguardando a aprovação do responsável pelo produto.
- 2026-10-15 (responsável pelo produto): "Approved. Record the approval on ticket 02."
