# 01: Cheeseburger selecionável

**What to build:** o card "Cheeseburger", o último da grade sem Receita, passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 15,90), descrição ("Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup e mostarda.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita `cheeseburger`, de baixo para cima: Pão inferior, Carne grelhada (`squash: 0.78`), Queijo, Picles, Ketchup, Mostarda, Pão superior (sem achatar); Base = pães e a carne. Todos os modelos já existem e não mudam (`cheese` amarelo do Whopper, não o `cheddarSlice`; `mustard` do Cheeseburger Duplo). Proporções tiradas de `site_Cheeseburger.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: as ilustrações existentes. Com todos os cards com Receita, sai o caso do card sem Receita: o ramo de `buildGrid` e o campo `name` da lista `burgers` em `main.js`, o teste de `tests/layout.spec.js` e o do card Cheeseburger em `tests/cheeseburger-duplo.spec.js`. Spec: `.scratch/cheeseburger/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/cheeseburger`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero
- [x] Ver ingredientes lista as 7 Camadas na ordem da Receita
- [x] Queijo, Picles, Ketchup e Mostarda são retiráveis um por vez e juntos; pães e carne não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] Item no Carrinho com Combo e "Sem …"; voltar aos outros sete sem resto do Cheeseburger
- [x] Sem WebGL, as 7 Camadas em SVG e o fluxo de retirada funcionando
- [x] Nenhum card de hambúrguer sem Receita, nem código ou teste para esse caso

## Answer

Receita `cheeseburger` em `prototype/src/ingredients.js`, com as 7 Camadas, a carne com `squash: 0.78` e o pão superior sem achatar. No card da grade, `main.js` passou a usar a Receita, e saíram o ramo de card sem Receita e o filtro `[data-product]`. Novo `tests/cheeseburger.spec.js`, no molde do Cheeseburger Duplo. Saíram os testes do card sem Receita (`layout.spec.js` e `cheeseburger-duplo.spec.js`). `cheeseburger`, `layout` e `cheeseburger-duplo` passam no dev (95 passaram, 5 pulados).

Capturas de conferência em `capturas/01/`. Para a revisão (02): no hambúrguer montado, o picles e o ketchup aparecem pouco e a mostarda não aparece; na foto, as duas rodelas de picles aparecem bem sob o pão.
