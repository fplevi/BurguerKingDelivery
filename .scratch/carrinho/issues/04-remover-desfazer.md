# 04: Remover Item com Desfazer

**What to build:** "Remover" tira o Item na hora e mostra o aviso "<nome> removido do carrinho." com "Desfazer" (Figma 06, `187-7330`). O aviso some na próxima mudança do carrinho ou ao sair da tela. "Desfazer" devolve o Item na mesma posição e configuração. Remover o último Item mostra o estado vazio com o aviso. Resumo e contador acompanham. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 03

**Status:** resolved

- [x] Remover qualquer Item (hambúrguer e só foto)
- [x] Desfazer na mesma posição e configuração
- [x] Aviso some na próxima mudança ou ao sair
- [x] Último Item removido: estado vazio com aviso
- [x] Testes Playwright

## Answer

O reducer (`prototype/src/state.js`) ganhou `itemRemove` (por índice) e `itemUndo`, e o estado `lastRemoved` (`{ item, index }` do Item recém-removido, ou `null`). Qualquer outra ação `item*` (Quantidade, Combo, Bebida do combo, Desfazer) e a volta ao cardápio (`category` para uma categoria) o apagam; um novo Remover o substitui, então só o último removido volta. `itemUndo` reinsere o Item, como estava, no índice de onde saiu. Em `src/main.js`, cada "Remover" tem `data-key="i:remove"`; `removedNotice()` monta o aviso (`role="status"`, "<nome> removido do carrinho." com o ® elevado e o botão Desfazer) acima da lista, ou acima do estado vazio quando o carrinho fica sem Itens. Resumo, subtítulo e contador do cabeçalho vêm do carrinho, então acompanham sem código novo. Estilo do aviso em `src/styles.css` (faixa na cor do card, ocupando a largura toda, como no Figma 06).

Decisões fora da letra da spec: o foco vai para "Desfazer" depois de remover (o Item com foco some) e, depois de desfazer, para o "Remover" do Item devolvido; remover fecha a lista de bebidas aberta; abrir a lista de bebidas não conta como mudança (só escolher a bebida). Novos testes em `prototype/tests/remover.spec.js`. `npm test` e `npm run test:build`: 196 passaram, 12 pulados.
