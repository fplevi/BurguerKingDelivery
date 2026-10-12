# 03: Layout de celular e tablet (abaixo de 1024px) e capturas

**What to build:** abaixo de 1024px, a tela Ver ingredientes vira uma coluna com rolagem (Figma `294-11399`): cabeçalho só com o título, palco bege com o 3D e a legenda, Bandeja de 213px que cresce em linhas, cards de 94 × 88, chips, Recolocar todos e uma barra fixa embaixo com Cancelar e Aplicar alterações (com `safe-area-inset-bottom`). O ponto de quebra atual (600px) sai. Depois, gerar as capturas para revisão e para o Behance. Spec: `.scratch/ver-ingredientes/spec.md`.

**Blocked by:** 02.

**Status:** claimed

- [x] Uma coluna abaixo de 1024px, com rolagem
- [x] Barra de ações fixa embaixo; cabeçalho só com o título
- [x] Bandeja de 213px crescendo em linhas; cards de 94 × 88
- [x] Testes Playwright em 390 de largura
- [ ] Capturas 1440 × 900 e 390 × 844 (Whopper e Cheddar Duplo, com e sem ingredientes na Bandeja) em `capturas/`, revisadas ao lado do Figma

## Answer

- `prototype/src/styles.css`: os pontos de quebra de 850px e 600px de Ver ingredientes viram um só, `max-width:1023px` (Figma `294-11399`): uma coluna com rolagem; cabeçalho de 76px só com o título (28px); `.pg-actions` vira barra fixa embaixo (88px, `safe-area-inset-bottom`, Cancelar 112px, Aplicar ocupa o resto) e o painel termina acima dela; Bandeja com `min-height` de 213px que cresce uma linha a cada 3 ingredientes; cards de 94 × 88; chips de 110px. Os textos do painel seguem as caixas do Figma (títulos 1.25, textos 19px), o que também ajusta o desktop.
- **Diferença do Figma:** o palco no celular continua com 450px (o bloco bege fica com 512px, contra 428px no Figma), porque com menos as 10 Camadas abertas do Whopper ficam com áreas de toque abaixo de 24px. Em 390 × 844 sem rolar, os cards da Bandeja ficam cortados pela barra (no Figma `294-11262` aparecem inteiros).
- Testes: novo `tests/layout-ver-ingredientes.spec.js` (390: barra fixa ao rolar, cabeçalho só com o título, uma coluna terminando acima da barra, Bandeja 213 → 309 com o 4º ingrediente, cards 94 × 88; 768: uma coluna com a barra; 1024: lado a lado). `npm run test:build`: 393 passaram, 35 pulados.
- Capturas em `capturas/`: `{whopper,cheddar-duplo}-{bandeja-vazia,com-retirados}-{desktop,390,390-completo}.png`, com as referências do Figma `figma-desktop.png`, `figma-390.png` e `figma-390-completo.png`.
- Pendente: revisão humana das capturas ao lado do Figma.
