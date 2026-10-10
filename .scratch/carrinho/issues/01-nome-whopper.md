# 01: Nome "Whopper®" em todo o protótipo

**What to build:** "Whopper Clássico" passa a ser "Whopper®" no código (hero, grade, toast, carrinho), nos testes, no README e nas specs abertas. Specs resolvidas ficam como histórico; Cheddar Duplo segue sem ®; o Figma não muda. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** nenhum.

**Status:** resolved

- [x] Nome trocado na Receita (`prototype/src/ingredients.js`) e onde mais aparecer
- [x] Testes e README atualizados
- [x] `npm test` e `npm run test:build` verdes

## Answer

A Receita do Whopper (`prototype/src/ingredients.js`) passa a se chamar "Whopper®", e o `shortName` sai das duas Receitas: o toast ("Adicionado ao carrinho: Whopper®") e o título dos chips em Ver ingredientes ("Personalize seu Whopper®") usam o próprio nome. Em `src/main.js`, o ® é elevado (`marks`) também no card da grade de hambúrgueres (com o mesmo `<span>` interno dos cards de foto, para o nome acessível continuar "Whopper®") e no título dos chips. Um título de uma palavra fica numa linha só no hero (antes, a quebra era depois da primeira palavra). Testes atualizados; o README e a spec aberta não citavam "Whopper Clássico". `npm test` e `npm run test:build`: 154 passaram, 12 pulados.
