# 05: Validação do "Continuar"

**What to build:** "Continuar" no Resumo do carrinho verifica combos sem bebida: o primeiro ganha borda vermelha e "Escolha a bebida do combo" (Figma 08, `187-7676`), a tela rola até ele e o seletor recebe o foco; o erro some ao escolher a bebida ou desmarcar o combo. Sem pendências: toast avisando que o pagamento não faz parte do protótipo. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 03

**Status:** resolved

- [x] Erro, rolagem e foco no primeiro combo sem bebida
- [x] Erro some ao corrigir
- [x] Toast quando tudo está certo
- [x] Testes Playwright

## Answer

"Continuar" no Resumo do carrinho despacha a ação `continue` (`prototype/src/state.js`, `continueCart`): o primeiro Item com Combo e sem bebida ganha `drinkError`; `itemDrink` e `itemCombo` o apagam (escolher a bebida ou desmarcar o Combo). Em `src/main.js`, a Bebida do combo desse Item recebe `aria-invalid="true"` (a mesma borda vermelha de `.field[aria-invalid=true]` do card do hambúrguer) e `aria-describedby` apontando para "Escolha a bebida do combo" (`.field-error`, o mesmo visual do card), abaixo do seletor; a tela rola até o card do Item (`scrollIntoView`, centralizado) e o seletor recebe o foco. Sem pendências, o toast diz "Tudo certo! O pagamento não faz parte deste protótipo." e nada muda no estado.

Decisões fora da letra da spec: só o primeiro combo sem bebida mostra o erro (os outros aparecem a cada novo Continuar, um de cada vez); o erro é do Item (fica com ele se outro Item mudar de posição) e mudar a Quantidade não o apaga; o texto do toast. Novos testes em `prototype/tests/continuar.spec.js`. `npm test` e `npm run test:build`: 194 passaram, 12 pulados.
