# 01: Layout de desktop, cabeçalho com as ações e cores

**What to build:** a tela Ver ingredientes no desktop segue a Variação 01 do Figma (`284-11569`). Sai o degradê laranja; entram cabeçalho creme, palco bege à esquerda e painel creme de 440px à direita. Cancelar e Aplicar alterações vão para o cabeçalho, à direita do título; o ✕ e o rodapé saem (Esc continua cancelando). A legenda "O seu <produto> do seu jeito." fica abaixo do hambúrguer 3D. Spec: `.scratch/ver-ingredientes/spec.md`.

**Blocked by:** nenhum (branch `feat/ver-ingredientes`).

**Status:** resolved

- [x] Cabeçalho com título e ações; sem ✕ e sem rodapé; Esc cancela
- [x] Palco bege com o 3D aberto e a legenda com o nome do produto
- [x] Painel lateral creme de 440px, de altura total
- [x] Testes Playwright atualizados (✕, rodapé) e novos (ações no cabeçalho, legenda)

## Answer

- `prototype/index.html`: cabeçalho com o título e `.pg-actions` (Cancelar, Aplicar alterações); sem ✕ e sem `.pg-footer`. O palco ganhou `.pg-hero` com a legenda `#pg-caption`; a Bandeja ficou dentro de `.pg-panel`. O status `aria-live` (`#state`) segue no diálogo, `sr-only`.
- `prototype/src/main.js`: a legenda "O seu <produto> do seu jeito." é preenchida no `render`; ao abrir, o foco vai para Cancelar (antes ia para o ✕). Esc continua cancelando.
- `prototype/src/styles.css`: sai o degradê laranja; cabeçalho creme de 104px (título Flame Bold 40px, botões de 160 e 252 × 48 em Flame Sans 16px), palco `--hero` e painel creme de 440px de altura total. Medido em 1440 × 900: cabeçalho 104, Cancelar em x 976, Aplicar em x 1148, painel 1000–1440.
- Testes: `ver-ingredientes.spec.js` sem o ✕ (Esc cancela; foco inicial em Cancelar) e com os novos testes das ações no cabeçalho (só desktop) e da legenda (Whopper® e Cheddar Duplo). `npm run test:build`: 372 passaram, 26 pulados.
- Fica para os próximos: o interior do painel (Bandeja separada, chips, Recolocar todos) é o 02; abaixo de 1024px as ações ainda ficam no cabeçalho, quebrando para a linha de baixo, até a barra fixa do 03.
