# 02: Bandeja separada, cards maiores e chips com ícones Phosphor

**What to build:** a Bandeja vira só a área tracejada ("Ingredientes retirados", texto fixo "Arraste os ingredientes para cá.", 400px de altura no desktop) e é o único alvo de soltar. Cards de 104 × 88 com a Camada 3D isolada e o nome. Os chips saem da Bandeja, sob o título "Ingredientes", com o texto de ajuda "Clique/Toque para retirar ou recolocar." conforme o dispositivo de entrada. Estados do Figma: presente marrom-escuro com Check; retirado creme com Plus. Ícones Phosphor (Outline, Bold, 14px, SVG inline). No hover e no foco, o ícone mostra a ação: Check → Minus, Plus → Check; o retirado também ganha borda marrom. "Recolocar todos" de largura total, desabilitado com a Bandeja vazia. O destaque `.tray.over` passa para bege escuro com borda marrom. Componentes: Figma `290-11151`. Spec: `.scratch/ver-ingredientes/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Bandeja só com o título, o texto fixo e os cards; alvo de soltar restrito a ela
- [x] Cards de 104 × 88 com a Camada 3D isolada
- [x] Chips com as cores do Figma e ícones Phosphor Outline Bold (Check, Plus, Minus)
- [x] Ícone de ação no hover e no foco; borda no hover do retirado
- [x] Título "Ingredientes" e texto de ajuda por dispositivo de entrada
- [x] Recolocar todos desabilitado com a Bandeja vazia
- [x] Testes Playwright atualizados ("Personalize seu", texto da Bandeja, ✓/＋/−) e novos

## Answer

- `prototype/index.html`: o painel agora é Bandeja (`aside` "Ingredientes retirados", texto fixo, lista de cards) + título "Ingredientes" + texto de ajuda + chips + Recolocar todos. Os ícones Phosphor Bold (Check, Plus, Minus) entram no sprite SVG, com os mesmos paths dos SVGs do Figma (viewBox 256, `currentColor`).
- `prototype/src/main.js`: cada chip leva dois ícones, o estado atual (`.chip-now`) e a ação do clique (`.chip-next`), trocados pelo CSS no hover (`hover: hover`) e no `:focus-visible`. Texto de ajuda "Clique/Toque para retirar ou recolocar." por `matchMedia('(hover:hover)')`. Recolocar todos desabilitado com o rascunho vazio. A imagem da Camada na Bandeja passou a 88 × 44.
- `prototype/src/styles.css`: Bandeja de 400px, tracejado marrom, `.over` em bege mais escuro (#f0e2cf); cards de 104 × 88; chips de 44px (presente marrom com Check, retirado creme com Plus e borda marrom no hover); Recolocar todos de largura total.
- O alvo de soltar já era só `#tray`; com os chips fora dela, soltar sobre os chips não retira (teste novo).
- Testes: `support.js` ganhou `ingredientes` (grupo de chips) e `recolocarTodos`; `bandeja` passa a ser o `complementary` "Ingredientes retirados". Novo `tests/painel.spec.js`. `npm run test:build`: 387 passaram, 29 pulados.
- Abaixo de 1024px a Bandeja ainda tem 400px; os 213px e os cards de 94 × 88 são do 03.
