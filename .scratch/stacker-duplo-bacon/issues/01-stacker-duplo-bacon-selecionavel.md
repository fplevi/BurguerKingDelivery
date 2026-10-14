# 01: Stacker Duplo Bacon selecionável (tracer bullet)

**What to build:** o card "Stacker Duplo Bacon" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 37,90), descrição ("Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Cheddar, Carne grelhada (girada), Bacon, Molho Stacker, Pão superior; Base = pães e as duas carnes. O Cheddar usa a fatia do queijo do Whopper na cor do cheddar (atenção: o modelo `cheddar` existente é o cremoso do Cheddar Duplo, que não muda). O Molho Stacker é uma nova configuração do modelo de molho: rosa-alaranjado, cremoso, sem pontinhos verdes. O Bacon ainda é uma forma simples. Proporções (espessura das carnes, altura do pão superior, quanto bacon e molho aparecem) já tiradas de `site_Stacker_Duplo.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVGs simples de Bacon e Molho Stacker; o Cheddar reaproveita a ilustração do queijo. Spec: `.scratch/stacker-duplo-bacon/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/stacker-duplo-bacon`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 5 cards seguem "Em breve" e não trocam o hero
- [x] Ver ingredientes lista as 7 Camadas na ordem da Receita
- [x] Cheddar, Bacon e Molho Stacker são retiráveis um por vez e juntos; pães e carnes não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [x] Voltar ao Whopper ou ao Cheddar Duplo não deixa resto do Stacker Duplo Bacon
- [x] Fallback SVG com WebGL desativado mostra as 7 Camadas e permite personalizar
- [x] Novo arquivo de testes no molde de `tests/cheddar-duplo.spec.js`, verde; testes existentes sem mudança de comportamento
- [x] Captura montada no desktop ao lado da foto oficial confere as proporções

## Answer

- `src/ingredients.js`: Receita `stackerDuploBacon` (R$ 37,90 provisório): `bottom`, `meat`, `cheddar` (Cheddar, modelo `cheddarSlice`), `meat2` (Carne grelhada, modelo `meat`, `turn` 1,9), `bacon`, `stackerSauce` (Molho Stacker), `top`; Base: pães e as duas carnes. A descrição sai dos textos das Camadas: "Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker."
- `main.js`: o card da grade passa a apontar para a Receita. A cena, Ver ingredientes, a Bandeja, o Carrinho e a Entrada e Saída não mudaram.
- `layer-models.js`:
  - `cheddarSlice` é a fatia do queijo do Whopper (mesma geometria, gerada uma vez) na cor do cheddar. `cheese()` ganhou o parâmetro de cor; o queijo do Whopper e o `cheddar` do Cheddar Duplo não mudam.
  - `bacon` é uma forma simples: três tiras onduladas por cor de vértice, sem textura, com gordura clara e bordas tostadas, pontas para fora da carne. Fica sem receita de textura até o ticket 02.
  - `stackerSauce` é uma nova configuração de `sauce()`: rosa-alaranjado, uma poça larga sob o pão e gotas na borda, algumas passando dela, sem pontinhos verdes.
- `art.js`: SVGs de Bacon e Molho Stacker. O Molho Stacker é uma faixa contínua: as gotas do ketchup deixavam o centro do botão sem pintura, e o clique caía no hambúrguer de trás. O Cheddar usa a ilustração do queijo com outra cor (parâmetro, não troca de texto).
- Proporções: carnes e pães são os modelos de sempre e conferem com a foto, como no Cheddar Duplo. A altura do bacon e do molho foi ajustada até a faixa aparecer na frente, sob o pão.
- Testes: `tests/stacker-duplo-bacon.spec.js` (15 casos × 2 projetos). `tests/layout.spec.js` agora tem 5 hambúrgueres sem Receita, e o `prototype/README.md` foi atualizado.
- Verificação: `npm run test:build` com 555 passando e 39 ignorados. Capturas em `capturas/01/` (desktop e 390 × 844, montado e aberto) e `revisao-lado-a-lado.png` com a foto oficial.
- Em aberto, para o ticket 02 e a revisão do 03:
  - o pão superior da foto é mais alto e abaulado que o modelo compartilhado;
  - o bacon da foto é crespo e mais volumoso;
  - a câmera do hero fica um pouco mais alta que a da foto.
  - Os quadros da Entrada e da Saída (`npm run quadros-entrada -- stackerDuploBacon`, com `npm run dev`) ficam para a revisão do 03.
