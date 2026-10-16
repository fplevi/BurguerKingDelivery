# 01: Pão do meio e Big King selecionável

**What to build:** o card "Big King" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 31,90), descrição ("Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, molho Big King, picles, cebola e alface.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Queijo, Pão do meio, Molho Big King inferior, Carne grelhada (girada), Picles, Cebola, Alface, Molho Big King superior (girado), Pão superior; Base = os três pães e as duas carnes. Modelo novo `middleBun`: variante do pão inferior, achatada dos dois lados e mais fina, com a mesma textura, sem receita de textura nova; o pão inferior aprovado não muda. Os dois molhos usam o `stackerSauce` sem mudança; o Queijo é o `cheddarSlice` sem mudança; Picles, Cebola e Alface são os do Whopper. Proporções (espessura das carnes, do pão do meio e do pão superior, quanto queijo, molho, picles, cebola e alface aparecem) já tiradas de `site_Big_King.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVG simples do pão do meio; o resto reaproveita as ilustrações existentes. Spec: `.scratch/big-king/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/big-king`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 2 cards seguem "Em breve" e não trocam o hero
- [x] Ver ingredientes lista as 11 Camadas na ordem da Receita
- [x] Queijo, Molho Big King inferior, Picles, Cebola, Alface e Molho Big King superior são retiráveis um por vez e juntos; pães (inclusive o do meio) e carnes não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [x] Voltar aos outros cinco hambúrgueres não deixa resto do Big King; Stacker Duplo Bacon e pão inferior sem mudança
- [x] Fallback SVG com WebGL desativado mostra as 11 Camadas e permite personalizar
- [x] Nenhuma receita de textura nova em `texture-recipes.js`
- [x] `prototype/tests/big-king.spec.js` no molde de `prototype/tests/rodeio.spec.js`, verde; `prototype/tests/layout.spec.js` deixa de esperar "Em breve" só no Big King; demais testes sem mudança de comportamento
- [ ] Captura montada no desktop ao lado da foto oficial confere as proporções (capturas feitas; montado mais largo e baixo que a foto e molho inferior pouco visível: decisão na revisão, ticket 02)

## Answer

- Sexta Receita `bigKing` (R$ 31,90 provisório) com as 11 Camadas da spec; o card da grade passa a apontar para ela.
- `middleBun` em `layer-models.js`: variante do pão inferior cortada dos dois lados (0,18 de altura contra 0,28 do inferior), miolo em cima e embaixo, casca dourada na borda arredondada nos dois cortes; usa `crustBump()` e `crumb()` já existentes, sem receita de textura nova. O pão inferior não mudou. SVG próprio em `art.js` para o fallback.
- Queijo = `cheddarSlice`, molhos = `stackerSauce` (o de cima com `turn: 2.4`), carne de cima com `turn: 1.9`, Picles, Cebola e Alface do Whopper, todos sem mudança.
- "molho Big King" sai da descrição uma vez, onde está o molho mais baixo ainda presente: retirado só o inferior, ele vai para o fim ("…, cebola, alface e molho Big King."). É a regra que já vale para os dois cheddars do Cheddar Duplo.
- A linha "Sem …" do Carrinho põe os nomes em minúsculas, como nos outros produtos ("Sem molho big king inferior e picles"); a spec escreve "Big King" com maiúsculas, mas mudar isso alteraria o Stacker ("molho stacker").
- As proporções das carnes e do pão superior saem dos modelos aprovados (não há escala por Camada); a do pão do meio foi tirada da foto.
- Capturas em `capturas/01/` (desktop e 390 × 844: hero, montado e aberto) e `revisao-lado-a-lado.png` com a foto oficial. O molho inferior aparece menos que na foto, porque o `stackerSauce` não pode mudar; fica para a revisão (ticket 02).
