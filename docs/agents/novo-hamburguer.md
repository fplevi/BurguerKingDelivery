# Novo hambúrguer 3D

Referência para renderizar um hambúrguer além do Whopper (tickets em `.scratch/hamburguer-3d/`). O que a configuração não conta; o resto está no código e em `prototype/README.md`.

## Passos

1. **Receita como dado.** `prototype/src/ingredients.js` e `src/art.js` (fallback SVG) têm as camadas do Whopper escritas direto. Torne a lista configurável por produto antes de modelar qualquer camada nova.
2. **Camadas já prontas valem para qualquer produto:** pães, carne, queijo, picles, cebola, tomate, alface, ketchup e maionese. Cada uma é um item de `layerModels` (`height` + `build`) em `src/scene/layer-models.js`. Camada nova entra ali e em `texture-recipes.js`; a cena e `main.js` não mudam.
3. **Foto de referência** de cada produto em `prototype/Assets/catalog/`. Serve só para proporção e cor (ADR 0001: sem imagens de ingrediente).
4. **Revisão.** Gere as quatro capturas padrão (desktop e 390 × 844, montado e aberto) com a foto de referência ao lado e entregue ao responsável pelo produto de uma vez. O Whopper precisou de duas rodadas, porque os pães saíram lisos e "de plástico".
5. **Fechar:** `npm run test:build` verde e capturas anexadas ao ticket.

## Decisões de realismo já tomadas

- Tom: pão dourado-marrom com tostado irregular e brilho fosco (`clearcoat` baixo); carne com marcas de chapa discretas. Mapeamento de tons **Neutral** (o ACES desbotava os pães).
- Cada camada fica dentro de um grupo próprio, e a cena só mexe nesse grupo. Zerar a rotação do modelo fez o queijo perder o losango (regressão do ticket 09, achada só na revisão do 05).
- A rodada extra de realismo (ticket 12) foi excluída: a qualidade atual basta para a proposta.

## Desempenho (já medido no Whopper)

- Texturas: ruído por pixel levou 3 s; campos de ruído pequenos e periódicos, lidos com interpolação, levam ~170 ms. Mantenha semente fixa.
- O que funcionou: parte 3D em chunk próprio, cena de Alterar ingredientes criada depois do primeiro quadro, `compileAsync` dos shaders, texturas em dois Web Workers, `noise()` sem closures.
- Orçamento do ticket 11: 145 KB gzip de JS 3D (limite 250). Primeiro quadro 2,2–2,5 s com CPU 4x e fps variáveis são exceções aceitas; `tests/orcamento.spec.js` guarda os limites aceitos. Fps real e arrasto por toque só se confirmam em aparelho físico.
- Camada nova pesa: cada hambúrguer com mais camadas ou fatias custa primeiro quadro. Meça com `npm run test:orcamento` (uma execução por vez, contra o build).

## Testes

- Use `npm run test:build`. Com `PW_EXECUTABLE`, ou `PW_CHANNEL=chromium` (CI), o WebGL é por software e a suíte leva 6–14 min.
- `playwright.config.js` fixa `workers: 2`: com mais workers a suíte falha ao acaso, inclusive em código sem defeito.
