# 03: Layout de celular e tablet (abaixo de 1024px) e capturas

**What to build:** abaixo de 1024px, a tela Ver ingredientes vira uma coluna com rolagem (Figma `294-11399`): cabeçalho só com o título, palco bege com o 3D e a legenda, Bandeja de 213px que cresce em linhas, cards de 94 × 88, chips, Recolocar todos e uma barra fixa embaixo com Cancelar e Aplicar alterações (com `safe-area-inset-bottom`). O ponto de quebra atual (600px) sai. Depois, gerar as capturas para revisão e para o Behance. Spec: `.scratch/ver-ingredientes/spec.md`.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Uma coluna abaixo de 1024px, com rolagem
- [ ] Barra de ações fixa embaixo; cabeçalho só com o título
- [ ] Bandeja de 213px crescendo em linhas; cards de 94 × 88
- [ ] Testes Playwright em 390 de largura
- [ ] Capturas 1440 × 900 e 390 × 844 (Whopper e Cheddar Duplo, com e sem ingredientes na Bandeja) em `capturas/`, revisadas ao lado do Figma
