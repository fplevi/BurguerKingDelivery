# 01: Pão do meio e Big King selecionável

**What to build:** o card "Big King" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 31,90), descrição ("Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, molho Big King, picles, cebola e alface.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Queijo, Pão do meio, Molho Big King inferior, Carne grelhada (girada), Picles, Cebola, Alface, Molho Big King superior (girado), Pão superior; Base = os três pães e as duas carnes. Modelo novo `middleBun`: variante do pão inferior, achatada dos dois lados e mais fina, com a mesma textura, sem receita de textura nova; o pão inferior aprovado não muda. Os dois molhos usam o `stackerSauce` sem mudança; o Queijo é o `cheddarSlice` sem mudança; Picles, Cebola e Alface são os do Whopper. Proporções (espessura das carnes, do pão do meio e do pão superior, quanto queijo, molho, picles, cebola e alface aparecem) já tiradas de `site_Big_King.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVG simples do pão do meio; o resto reaproveita as ilustrações existentes. Spec: `.scratch/big-king/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/big-king`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 2 cards seguem "Em breve" e não trocam o hero
- [ ] Ver ingredientes lista as 11 Camadas na ordem da Receita
- [ ] Queijo, Molho Big King inferior, Picles, Cebola, Alface e Molho Big King superior são retiráveis um por vez e juntos; pães (inclusive o do meio) e carnes não
- [ ] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [ ] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [ ] Voltar aos outros cinco hambúrgueres não deixa resto do Big King; Stacker Duplo Bacon e pão inferior sem mudança
- [ ] Fallback SVG com WebGL desativado mostra as 11 Camadas e permite personalizar
- [ ] Nenhuma receita de textura nova em `texture-recipes.js`
- [ ] `prototype/tests/big-king.spec.js` no molde de `prototype/tests/rodeio.spec.js`, verde; `prototype/tests/layout.spec.js` deixa de esperar "Em breve" só no Big King; demais testes sem mudança de comportamento
- [ ] Captura montada no desktop ao lado da foto oficial confere as proporções
