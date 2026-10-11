# 03: Card do Item editável no Carrinho

**What to build:** cada Item do Carrinho segue o Figma (01–05, `187-5486` a `187-6968`). Hambúrguer: foto, nome, "Remover" (ação no ticket 04), "Ingredientes:" com o texto da descrição do hero (mesma regra do cheddar), linha vermelha "Sem …" com cada Camada retirada em ordem da Receita de baixo para cima (ou "Todos os ingredientes"), "Transformar em combo", Bebida do combo (lista própria, padrão listbox, abre em sobreposição; desabilitada sem combo mantendo o espaço; desmarcar apaga a bebida), Quantidade (1–99, "−" desabilitado em 1) e Total do item (com combo assim que marcado, mesmo sem bebida). Produto só foto: foto, nome, "Remover", Quantidade e Total do item. Editar nunca funde Itens. Total dos itens acompanha. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 02

**Status:** resolved

- [x] Ingredientes e linha "Sem …" (Whopper; um cheddar; dois cheddars)
- [x] Combo e Bebida do combo com as regras do card
- [x] Lista de bebidas em sobreposição, acessível por teclado
- [x] Quantidade com "−" desabilitado em 1
- [x] Total do item e Total dos itens atualizados
- [x] Itens editados até ficarem iguais continuam separados
- [x] Testes Playwright

## Answer

Cada Item do Carrinho (`renderCart`/`itemCard` em `prototype/src/main.js`) segue o card do Figma. Hambúrguer: foto, nome e "Remover" (botão ainda sem ação, até o 04) na mesma linha a partir de 1024px e abaixo do nome no mobile; "Ingredientes:" com `description` (a mesma função do hero) e a linha "Sem …" de `removedLine` (nova em `src/ingredients.js`: Camadas retiradas na ordem da Receita, em minúsculas, unidas por `Intl.ListFormat`), em vermelho, ou "Todos os ingredientes" em cor neutra; depois do divisor, "Transformar em combo", Bebida do combo, Quantidade e Total do item. Produto só foto: foto, nome, "Remover", Quantidade e Total do item. O reducer (`src/state.js`) ganhou `itemQty`, `itemCombo` e `itemDrink` por índice: o Combo recalcula o preço unitário (+ R$ 12,00 já sem bebida), desmarcar apaga a bebida, a Quantidade fica entre 1 e 99, e nada funde Itens. A Bebida do combo é um combobox só de seleção (botão `role="combobox"` + `role="listbox"`, `aria-activedescendant`): abre por clique, ↓ ↑ Enter ou Espaço; ↓ ↑ Home End movem, Enter/Espaço escolhem, Esc fecha sem mudar, Tab fecha, clicar fora fecha; a lista é absoluta (não empurra nada) e o botão desabilitado sem Combo ocupa o mesmo lugar. Como o Carrinho é remontado a cada mudança, o controle com foco o recupera (no "−" que desabilita em 1, o foco vai ao "+"). A lista aberta é estado de tela em `main.js` (`openDrink`), fora do reducer.

Decisões fora da letra da spec: o "Remover" aparece sem ação até o ticket 04; Total do item numa coluna de largura fixa (176px) no desktop, para a Bebida do combo não mudar de largura quando o valor muda; o texto dos Ingredientes é o da descrição do hero ("Pão com gergelim, carne grelhada, …"), não o resumido do Figma, como pede a spec. Novos testes em `prototype/tests/card-do-item.spec.js`. `npm test` e `npm run test:build`: 186 passaram, 12 pulados.
