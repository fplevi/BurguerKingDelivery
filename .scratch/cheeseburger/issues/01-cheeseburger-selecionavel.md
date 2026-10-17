# 01: Cheeseburger selecionável

**What to build:** o card "Cheeseburger", o último da grade sem Receita, passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 15,90), descrição ("Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup e mostarda.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita `cheeseburger`, de baixo para cima: Pão inferior, Carne grelhada (`squash: 0.78`), Queijo, Picles, Ketchup, Mostarda, Pão superior (sem achatar); Base = pães e a carne. Todos os modelos já existem e não mudam (`cheese` amarelo do Whopper, não o `cheddarSlice`; `mustard` do Cheeseburger Duplo). Proporções tiradas de `site_Cheeseburger.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: as ilustrações existentes. Com todos os cards com Receita, sai o caso do card sem Receita: o ramo de `buildGrid` e o campo `name` da lista `burgers` em `main.js`, o teste de `tests/layout.spec.js` e o do card Cheeseburger em `tests/cheeseburger-duplo.spec.js`. Spec: `.scratch/cheeseburger/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/cheeseburger`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero
- [ ] Ver ingredientes lista as 7 Camadas na ordem da Receita
- [ ] Queijo, Picles, Ketchup e Mostarda são retiráveis um por vez e juntos; pães e carne não
- [ ] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [ ] Item no Carrinho com Combo e "Sem …"; voltar aos outros sete sem resto do Cheeseburger
- [ ] Sem WebGL, as 7 Camadas em SVG e o fluxo de retirada funcionando
- [ ] Nenhum card de hambúrguer sem Receita, nem código ou teste para esse caso
