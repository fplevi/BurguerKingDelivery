# Novo hambúrguer 3D

Referência para renderizar um hambúrguer além do Whopper (tickets em `.scratch/hamburguer-3d/`). O que a configuração não conta; o resto está no código e em `prototype/README.md`.

## Passos

1. **Receita como dado.** `prototype/src/ingredients.js` e `src/art.js` (fallback SVG) têm as camadas do Whopper escritas direto. Torne a lista configurável por produto antes de modelar qualquer camada nova.
2. **Camadas já prontas valem para qualquer produto:** pães, carne, queijo, picles, cebola, tomate, alface, ketchup e maionese. Cada uma é um item de `layerModels` (`height` + `build`) em `src/scene/layer-models.js`. Camada nova entra ali e em `texture-recipes.js`; a cena e `main.js` não mudam.
3. **Foto de referência** de cada produto em `prototype/Assets/catalog/`. Serve só para proporção e cor (ADR 0001: sem imagens de ingrediente).
4. **Revisão.** Gere as quatro capturas padrão (desktop e 390 × 844, montado e aberto) com a foto de referência ao lado, mais os quadros da Entrada e da Saída (`npm run quadros-entrada -- <id da Receita>`, com `npm run dev` rodando), e entregue tudo ao responsável pelo produto de uma vez. O Whopper precisou de duas rodadas, porque os pães saíram lisos e "de plástico".
5. **Fechar:** `npm run test:build` verde e capturas anexadas ao ticket.

## Decisões de realismo já tomadas

- Tom: pão dourado-marrom com tostado irregular e brilho fosco (`clearcoat` baixo); carne com marcas de chapa discretas. Mapeamento de tons **Neutral** (o ACES desbotava os pães).
- Cada camada fica dentro de um grupo próprio, e a cena só mexe nesse grupo. Zerar a rotação do modelo fez o queijo perder o losango (regressão do ticket 09, achada só na revisão do 05).
- A rodada extra de realismo (ticket 12) foi excluída: a qualidade atual basta para a proposta.
- Camada repetida (duas carnes, dois cheddars) gira o modelo com `turn` na receita, para não ficar idêntica; o que acompanha o contorno da carne (o cheddar de cima) gira junto (ticket 14).

## Entrada e Saída (ticket 15)

- Todo hambúrguer com Receita ganha a Entrada e a Saída sem código novo: o efeito lê as Camadas da Receita. Não crie animação por produto.
- A Entrada dura `fall + stagger × (Camadas − 1)` (`ENTRANCE` em `burger-scene.js`): ~900 ms com 10 Camadas, ~1,1 s com 14. Passou de ~1,2 s? Combine um teto com o responsável pelo produto antes de mexer no ritmo, que foi escolhido em protótipo (branch `prototype/entrada-saida`).
- Sombras: a de contato surge com o pão inferior; a projetada no chão, só com a última Camada. Camadas ainda no ar projetam sombra longe, para o lado, e pareciam defeito. Não "corrija" isso.
- As Camadas que caem ficam acima do palco, e seus botões invisíveis também: o palco do hero recorta o que sai dele (`overflow: clip` em `styles.css`). Sem isso, eles engoliam o clique no Carrinho do cabeçalho.
- Para ver a animação, use `npm run quadros-entrada`: prints em tempo real pulam o começo da queda, o `page.clock` do Playwright não controla `performance.now()` e o painel do navegador do app não desenha quadros com a janela em segundo plano.

## Desempenho (já medido no Whopper)

- Texturas: ruído por pixel levou 3 s; campos de ruído pequenos e periódicos, lidos com interpolação, levam ~170 ms. Mantenha semente fixa.
- O que funcionou: parte 3D em chunk próprio, cena de Alterar ingredientes criada depois do primeiro quadro, `compileAsync` dos shaders, texturas em dois Web Workers, `noise()` sem closures.
- Orçamento do ticket 11: 145 KB gzip de JS 3D (limite 250). Primeiro quadro 2,2–2,5 s com CPU 4x e fps variáveis são exceções aceitas; `tests/orcamento.spec.js` guarda os limites aceitos. Fps real e arrasto por toque só se confirmam em aparelho físico.
- Camada nova pesa: cada hambúrguer com mais camadas ou fatias custa primeiro quadro. Meça com `npm run test:orcamento` (uma execução por vez, contra o build).
- Receita de textura nova pesa em todos os hambúrgueres: todas são pintadas antes do primeiro quadro. Ponha-a no worker mais leve (`shares` em `textures.js`). No ticket 02 do Rodeio Duplo, 14 ms a mais no worker da carne bastaram para `tests/cena-3d.spec.js:104` falhar de vez em quando.

## Testes

- Use `npm run test:build`. Com `PW_EXECUTABLE`, ou `PW_CHANNEL=chromium` (CI), o WebGL é por software e a suíte leva 6–14 min.
- `playwright.config.js` fixa `workers: 2`: com mais workers a suíte falha ao acaso, inclusive em código sem defeito.
- Falha "ao acaso" na suíte completa? Antes de chamar de instabilidade, rode a da `main` (`npm run test:build`, ~10 min) e compare. No ticket 15, 4 a 8 testes do carrinho falhavam por rodada e passavam isolados; a `main` passava inteira, e era um defeito real (o clique engolido no Carrinho).
- O hero fica ~1 s em movimento depois de carregar (a Entrada): teste que mede ou clica no hambúrguer do hero logo depois do `goto` espera `fimDaEntrada(page)` (`tests/support.js`). As marcas `burger-scene:entrance-end` e `exit-end` dizem quando cada efeito termina.
- Efeito que não consegue desenhar (palco escondido) não pede quadros: com o `page.clock` dos testes do Pix, um laço de `requestAnimationFrame` vira milhares de quadros e estoura o tempo.
