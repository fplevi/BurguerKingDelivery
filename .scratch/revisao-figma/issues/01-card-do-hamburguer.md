# 01: Card do hambúrguer como no Figma (tracer bullet)

**What to build:** o card de compra do hambúrguer segue o Figma (`80-1630`, `80-1169`). Saem os tamanhos P/M/G; o Combo soma R$ 12,00 fixos. Entra o seletor Bebida do combo (7 bebidas, placeholder "Selecione uma bebida", desabilitado sem Combo, nunca preenchido por padrão) e a Quantidade (− 1 +), que multiplica o Total do item. Combo marcado sem bebida: o botão continua ativo e, ao clicar, o seletor ganha borda vermelha com "Escolha a bebida do combo" e recebe o foco. Estado padrão (ao carregar, ao trocar de hambúrguer e depois de adicionar): Combo desmarcado, bebida vazia, Quantidade 1, sem Personalização. Item idêntico soma no carrinho. O botão "Remover ingredientes" passa a se chamar "Ver ingredientes" (título e rótulos da tela também). Carrinho mostra nome × quantidade, "Combo · <bebida>", "Sem: …" e total. Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** nenhum.

**Status:** resolved

- [x] P/M/G removidos; Combo + R$ 12,00 (Whopper 31,90 / 43,90)
- [x] Bebida do combo: 7 opções, desabilitada sem Combo, vazia por padrão
- [x] Erro "Escolha a bebida do combo" com foco ao adicionar combo sem bebida
- [x] Quantidade multiplica o total; todas as unidades com a mesma Personalização
- [x] Volta ao padrão depois de adicionar, mantendo o hambúrguer selecionado
- [x] Item idêntico soma quantidade no carrinho
- [x] "Ver ingredientes" em botão, tela e testes
- [x] Testes Playwright; `npm test` e `npm run test:build` verdes

## Answer

Card do hambúrguer refeito (`prototype/index.html`, `src/state.js`, `src/main.js`, `src/styles.css`). P/M/G saíram; o Combo começa desmarcado e soma R$ 12,00 (`comboFee`). Bebida do combo é um `<select>` com placeholder "Selecione uma bebida" e as 7 bebidas, desabilitado e esvaziado sem Combo. Combo sem bebida: o reducer recusa o `add` (`drinkError`), o seletor fica com borda vermelha, `aria-invalid` e a descrição "Escolha a bebida do combo", e recebe o foco; o erro some ao escolher a bebida ou desmarcar o Combo. Quantidade (− 1 +, de 1 a 99) multiplica o Total do item. Adicionar ou trocar de hambúrguer volta ao padrão (`fresh` no reducer), mantendo o hambúrguer selecionado; Item idêntico (produto, Personalização, Combo, bebida) soma na quantidade. O contador do carrinho conta unidades; cada linha mostra nome × quantidade, "Combo · <bebida>", "Sem: …" e o total do Item. "Ver ingredientes" substitui "Remover/Alterar ingredientes" no botão, no título do diálogo, nos testes (`tests/ver-ingredientes.spec.js`, helpers `verIngredientes`/`openVerIngredientes`) e no README. Testes novos em `tests/pedido.spec.js`. Os cards "Em breve" ficaram para o ticket 03.
