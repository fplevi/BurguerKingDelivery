# Camadas do hambúrguer desenhadas somente por código

Não temos fotografias de cada ingrediente separado, assets oficiais da marca nem orçamento para geração de imagens por IA. As camadas do hambúrguer — montadas no hero, abertas em Alterar ingredientes e isoladas na bandeja — serão modeladas proceduralmente em 3D com Three.js/WebGL, simulando ingredientes reais, sem imagens externas. Todas seguem a mesma câmera (~15° acima), a mesma luz suave vinda do alto à esquerda e fundo neutro; as sombras de contato são calculadas na própria cena 3D.

## Considerações

- Rejeitado: imagens geradas por IA (modelos do Figma Weave). Davam aparência fotográfica, mas custam créditos sem orçamento disponível.
- Rejeitado por indisponibilidade: fotografia real e assets oficiais. Revisar esta decisão se passarem a existir.
- Expectativa: realismo de renderização 3D de alta qualidade, não indistinguível de foto.
- As camadas seguem a receita brasileira do produto; a aparência não deve exagerar porções.
- Escolhido Three.js/WebGL em vez de SVG/CSS 2D: volume, luz e perspectiva reais justificam o peso da biblioteca e o custo de desempenho no celular.
- As fotos do produto inteiro na grade (cardápio público) servem apenas como referência visual de proporção e cor; não são usadas nas camadas.
