# 06: Layouts do Carrinho no desktop e no mobile

**What to build:** ≥ 1024px: lista à esquerda e Resumo do carrinho à direita; nome e "Remover" na mesma linha; Bebida do combo, Quantidade e Total do item lado a lado (Figma `189-16293`). < 1024px: uma coluna, "Remover" abaixo do nome, ingredientes em parágrafo com quebra, barra fixa no rodapé com Total dos itens e "Continuar", Resumo do carrinho no fim da lista (Figma `187-8185`). Capturas em 390 e 1280 para revisão humana ao lado do Figma. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 04, 05

**Status:** resolved

- [x] Layout desktop conforme Figma
- [x] Layout mobile com barra fixa
- [x] Sem rolagem horizontal em 390
- [x] Testes de layout em 390 e 1280; capturas em `.scratch/carrinho/capturas/`

## Answer

O layout de duas colunas (≥ 1024px) e o de uma coluna (< 1024px) já vinham dos tickets 02 e 03; este ticket acrescentou a barra fixa do mobile e os testes de layout. Em `prototype/src/main.js`, `renderCart` monta depois do Resumo do carrinho a barra `.cart-bar` (`role="region"`, "Total dos itens e Continuar"): o Total dos itens (rótulo só para leitor de tela, como no Figma, que mostra só o valor) e um segundo Continuar. Os dois Continuar têm `data-continue` e o mesmo comportamento do ticket 05 (antes, `id="cart-continue"`). Em `src/styles.css`, a barra só aparece abaixo de 1024px, fixa no rodapé com a largura da tela (100px de altura, como o frame "Carrinho / total fixo no mobile" do Figma), e a tela ganha espaço embaixo para o Resumo terminar acima dela. Comparando com o Figma lado a lado: no mobile, "Remover" volta a ser o botão com borda abaixo do nome (era só texto); os botões da tela do Carrinho (Voltar ao cardápio, Remover, Desfazer, Continuar, Adicionar mais itens, Explorar cardápio) passam a usar Flame Sans regular, como no Figma.

Capturas em `.scratch/carrinho/capturas/`: `carrinho-390.png` e `carrinho-1280.png` (a janela, com a barra no mobile), `carrinho-390-completo.png` e `carrinho-1280-completo.png` (a página inteira, sem a barra, como a "Visão completa" do Figma), ao lado das referências `figma-390.png` (mobile 01, `187-8186`), `figma-390-completo.png` (`189-22075`) e `figma-1280-completo.png` (`189-16293`). O carrinho das capturas é o do Figma: Whopper® com combo e Coca-Cola Zero, Cheddar Duplo, Batata Frita e BK® Mix de Brownie.

Decisões fora da letra da spec: a barra fica visível o tempo todo no mobile, inclusive quando o Resumo do carrinho já está na tela (dois Continuar visíveis no fim da página); o cabeçalho mobile continua com as abas de categorias, que o Figma do carrinho não mostra (a spec manda manter o cabeçalho igual); a fonte dos botões do Carrinho. O helper `continuar` de `tests/continuar.spec.js` passou a procurar o Continuar dentro do Resumo do carrinho, porque no mobile há dois. Novos testes em `prototype/tests/layout-carrinho.spec.js`. `npm test` e `npm run test:build`: 210 passaram, 18 pulados.
