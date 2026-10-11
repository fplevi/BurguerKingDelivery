# 02: Carrinho como tela própria em `#carrinho` (tracer bullet)

**What to build:** o modal do carrinho sai; o botão Carrinho leva à rota `#carrinho` na mesma página, com o cabeçalho igual e nenhuma categoria sublinhada. A tela tem "Voltar ao cardápio", "Seu carrinho", subtítulo ("N itens no carrinho" ou "U unidades em N itens"), a lista de Itens (versão simples por enquanto: foto, nome, Total do item) e o Resumo do carrinho ("Total dos itens", "Entrega calculada na próxima etapa.", "Continuar" sem ação ainda, "Adicionar mais itens"). Estado vazio do Figma 07 com "Explorar cardápio". Os três botões de volta e o Voltar do navegador levam à última categoria vista com seu estado. Depois de adicionar, o cliente continua no cardápio. Carrinho só em memória. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 01

**Status:** resolved

- [x] `#carrinho` abre a tela; sem diálogo modal
- [x] Subtítulo itens/unidades; contador do cabeçalho em unidades
- [x] Resumo do carrinho com Total dos itens
- [x] Estado vazio
- [x] Voltar (botões e navegador) mantém a categoria e seu estado
- [x] Testes Playwright atualizados (os que usavam o modal mudam)

## Answer

O modal `#cart` sai. O Carrinho é a seção `#cart-page` (região "Seu carrinho") dentro do `main`, mostrada no lugar do hero e da grade quando o hash é `#carrinho`; o estado ganhou `screen` (`'cardapio'` ou `'carrinho'`), e a ação `category` com `carrinho` troca só a tela, mantendo a última categoria e o card de cada uma. O botão Carrinho do cabeçalho leva a `#carrinho`; nenhuma categoria fica com `aria-current`. A tela tem "Voltar ao cardápio", o título "Seu carrinho" (h1), o subtítulo ("N itens no carrinho" ou "U unidades em N itens"), a lista "Itens" (foto, nome e Total do item) e o Resumo do carrinho (`aside`: Total dos itens, "Entrega calculada na próxima etapa.", Continuar sem ação e Adicionar mais itens). Vazio: "Seu carrinho está vazio", "Escolha seus favoritos para começar." e Explorar cardápio, sem subtítulo nem Resumo. Os três botões de volta usam `history.back()` quando o Carrinho foi aberto do cardápio (assim o Voltar do navegador não retorna ao Carrinho) e, aberto pelo endereço, vão ao hash da categoria atual (Hambúrgueres, por padrão). O conteúdo do Carrinho só é montado enquanto a tela está visível, para o cardápio não guardar uma cópia oculta dos Totais do item. A ação `delete` saiu do reducer (Remover volta no 04). Layout simples: Itens à esquerda e Resumo à direita a partir de 1024px, uma coluna abaixo (o layout mobile completo é o 06).

Decisões fora da letra da spec: singular "1 item no carrinho" e "U unidades em 1 item"; o teste "item pode ser removido do carrinho" saiu até o ticket 04; combo, bebida e "Sem …" deixaram de aparecer no Item até o ticket 03 (os testes conferem o Combo pelo Total do item). Novos testes em `prototype/tests/carrinho.spec.js` e helpers `carrinho`, `itens`, `totalDoItem` e `totalDosItens` em `tests/support.js`; os testes que usavam o modal mudaram. `npm test` e `npm run test:build`: 170 passaram, 12 pulados.
