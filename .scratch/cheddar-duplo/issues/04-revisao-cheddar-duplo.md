# 04: Revisão humana do Cheddar Duplo

**What to build:** o responsável pelo produto compara o Cheddar Duplo com a foto oficial no hero e em Alterar ingredientes, no desktop e no celular, e aprova ou lista ajustes. Uma rodada só: os ajustes são aplicados neste ticket, sem rodada nova de realismo. As capturas vêm ao lado de `site_Cheddar_Duplo.png`.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Capturas das quatro vistas (desktop e 390 × 844, montado e aberto) ao lado da foto oficial
- [ ] Decisão registrada em `## Comments`: aprovado, ou lista de ajustes
- [ ] Se houver ajustes, aplicados aqui; suíte verde

## Comments

- 2026-10-10 (agente): capturas do ticket 03 lado a lado com `site_Cheddar_Duplo.png` em `.scratch/cheddar-duplo/capturas/04/revisao-lado-a-lado.png` (originais em `capturas/03/`). Aguardando a decisão do responsável pelo produto. Pontos que o agente do ticket 03 apontou: escorridos do cheddar lisos (na foto, mais irregulares e brilhantes); borda do cheddar um pouco além da carne; pão inferior e lateral das carnes iguais aos do Whopper, um pouco pálidos de perto; o texto "Pão e carne formam a base" da bandeja é o mesmo nos dois produtos; em 390 × 844 aberto o rodapé cobre os chips da bandeja (já acontecia no Whopper).
- 2026-10-10 (responsável pelo produto): a cebola crispy parece um queijo empanado; deixar mais "esfarelada". Ajuste aplicado neste ticket.
- 2026-10-10 (responsável pelo produto): o cheddar está muito circular; deformar mais o formato, mantendo o cheddar passando da carne.
- 2026-10-10 (agente): os dois ajustes foram aplicados e aguardam nova aprovação. Cebola crispy: sem o disco-base liso; agora é um monte solto de ~3.800 farelos facetados e fios curtos, em camadas, mais escuros no fundo, com contorno irregular, vãos entre as peças e pedaços caindo sobre o cheddar (57,6 mil vértices, antes 74 mil; triângulos de 25 mil para 82 mil). O fallback SVG da cebola também virou farelos soltos. Cheddar: contorno disforme (bojos e recuos de tamanhos diferentes), avançando sobre a carne mais em uns pontos que em outros; os escorridos continuam, e cada cheddar tem seu formato. Whopper idêntico (16 capturas, diferença máxima 1/255). Capturas novas e folha lado a lado em `capturas/04/`.
- 2026-10-10 (responsável pelo produto): o rodapé cobrindo os chips no celular tem que ser corrigido. Corrigido em `2404e93`: no celular o rodapé é uma barra opaca de uma linha (a nota de preço some), o palco sobe para o espaço vazio acima do hambúrguer aberto e a bandeja ficou mais compacta; todos os chips dos dois produtos aparecem acima do rodapé em 390 × 844. O palco mantém 450 px, porque com menos as camadas finas do Whopper aberto ficam com área de toque abaixo de 24 px. Capturas 390 × 844 e folha lado a lado refeitas.
- 2026-10-10 (responsável pelo produto): o cheddar está muito fino; precisa de uma espessura mais volumosa. A cebola crispy pode ter algumas falhas, para não ficar tão "preenchida" (parece falso).
- 2026-10-10 (agente): os dois ajustes foram aplicados e aguardam nova aprovação. Cheddar: virou um corpo grosso, com borda arredondada (lábio de ~2 mm) que rola sobre a carne; os escorridos ficaram mais largos e grossos, com ponta arredondada que se dobra para dentro; contorno irregular, avanço sobre a carne e formato por Camada mantidos (altura da camada 0,035 -> 0,07). Cebola crispy: ~1.700 pedaços (antes 3.800) em montinhos, com vãos onde o cheddar aparece por baixo, e sem o disco escuro de fundo; triângulos de 82 mil para 37 mil. O fallback SVG acompanha (cheddar mais grosso, vãos entre os farelos). Whopper idêntico (16 capturas, diferença 0). Capturas e folha lado a lado refeitas em `capturas/04/`.
