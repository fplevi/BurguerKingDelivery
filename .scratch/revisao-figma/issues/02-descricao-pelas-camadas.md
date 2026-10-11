# 02: Descrição montada pelas Camadas

**What to build:** cada Camada retirável ganha um trecho de descrição com adjetivo, na Receita. A descrição do hero lista as Camadas presentes e acompanha a Personalização aplicada; a linha "Preparado com todos os ingredientes / sem X" sai. Whopper completo: "Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup, cebola, tomate fresco, alface crocante e maionese." Cheddar Duplo: "cheddar cremoso" só sai com os dois cheddars retirados. Tudo retirado: "Pão com gergelim e carne grelhada." Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Trecho por Camada na Receita; nada fora dela cita produto
- [x] Descrição do hero reflete a Personalização aplicada (não o rascunho)
- [x] Regra dos dois cheddars; caso com tudo retirado
- [x] Testes Playwright

## Answer

Cada Camada da Receita (`prototype/src/ingredients.js`) ganhou `text`, o seu trecho na descrição; a Receita perdeu o `description` fixo. `description(recipe, removed)` junta, de baixo para cima, os trechos das Camadas presentes com `Intl.ListFormat` e um ponto final; um trecho repetido sai uma vez só, então "cheddar cremoso" (os dois cheddars) só some com os dois retirados, e "duas carnes grelhadas" fica só na primeira carne. O hero (`src/main.js`) mostra a descrição da Personalização aplicada (`state.removed`), não do rascunho. A linha "Preparado com todos os ingredientes / Sem X" (`#custom-note`) saiu de `index.html` e do render; a regra `.custom-note` em `styles.css` ficou para o ticket 03, que reescreve o CSS. Testes: helper `descricao` em `tests/support.js` no lugar de `heroNote`; novos casos em `tests/ver-ingredientes.spec.js` (Whopper completo, aplicar, tudo retirado: "Pão com gergelim e carne grelhada.") e `tests/cheddar-duplo.spec.js` (regra dos dois cheddars); os demais que citavam "Sem …"/"Preparado com…" no hero passaram a conferir a descrição.
