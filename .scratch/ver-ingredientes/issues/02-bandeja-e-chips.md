# 02: Bandeja separada, cards maiores e chips com ícones Phosphor

**What to build:** a Bandeja vira só a área tracejada ("Ingredientes retirados", texto fixo "Arraste os ingredientes para cá.", 400px de altura no desktop) e é o único alvo de soltar. Cards de 104 × 88 com a Camada 3D isolada e o nome. Os chips saem da Bandeja, sob o título "Ingredientes", com o texto de ajuda "Clique/Toque para retirar ou recolocar." conforme o dispositivo de entrada. Estados do Figma: presente marrom-escuro com Check; retirado creme com Plus. Ícones Phosphor (Outline, Bold, 14px, SVG inline). No hover e no foco, o ícone mostra a ação: Check → Minus, Plus → Check; o retirado também ganha borda marrom. "Recolocar todos" de largura total, desabilitado com a Bandeja vazia. O destaque `.tray.over` passa para bege escuro com borda marrom. Componentes: Figma `290-11151`. Spec: `.scratch/ver-ingredientes/spec.md`.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Bandeja só com o título, o texto fixo e os cards; alvo de soltar restrito a ela
- [ ] Cards de 104 × 88 com a Camada 3D isolada
- [ ] Chips com as cores do Figma e ícones Phosphor Outline Bold (Check, Plus, Minus)
- [ ] Ícone de ação no hover e no foco; borda no hover do retirado
- [ ] Título "Ingredientes" e texto de ajuda por dispositivo de entrada
- [ ] Recolocar todos desabilitado com a Bandeja vazia
- [ ] Testes Playwright atualizados ("Personalize seu", texto da Bandeja, ✓/＋/−) e novos
