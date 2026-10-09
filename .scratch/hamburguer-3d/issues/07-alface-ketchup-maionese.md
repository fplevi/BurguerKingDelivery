# 07: Alface, ketchup e maionese realistas

**What to build:** alface, ketchup e maionese ganham o mesmo nível de realismo aprovado em 05. Alface ondulada com nervuras e bordas que transbordam; ketchup e maionese distinguíveis por cor e brilho, legíveis e fáceis de tocar mesmo sendo camadas finas.

**Blocked by:** 05.

**Status:** resolved

- [x] Alface ondulada, com nervuras e bordas irregulares
- [x] Ketchup e maionese com brilho de molho e cores distintas, reconhecíveis com o hambúrguer aberto
- [x] Área de toque das camadas finas grande o suficiente para retirar com o dedo em 390 × 844
- [x] Mesma luz, câmera e acabamento de pães e carne
- [x] Capturas desktop e 390 × 844; suíte Playwright verde

## Answer

- Alface: duas folhas sobrepostas, mais largas que o pão, com franjas onduladas irregulares (fase e profundidade variam ao redor da borda), nervuras claras que saem do centro e se ramificam, verde mais claro no centro e mais escuro na borda.
- Ketchup: quatro porções de molho com borda arredondada, vermelho vivo e brilho molhado. Maionese: espalhada mais fina e larga, creme, um pouco menos brilhante. Cor, forma e brilho diferentes deixam os dois distinguíveis com o hambúrguer aberto.
- Área de toque das camadas finas: com a mudança registrada no ticket 06, ketchup e maionese passam de 24 px de altura em 390 × 844 (antes, a maionese tinha cerca de 16 px). Para 44 px seria preciso mais espaço vertical entre as camadas abertas; não mudei o espaçamento.
- Fps no WebGL por software deste container, durante a abertura: desktop 19 (antes de 06/07: 32), 390 × 844 em densidade 3× 12,7 (antes: 27). A primeira versão, com `MeshPhysicalMaterial` (clearcoat e sheen) nas sete camadas, caía para 2,3 fps no desktop; com material padrão e uma malha por camada, ficou nos números acima sem perda visível. Os números reais em GPU e celular intermediário são do ticket 11.
- Testes: com WebGL por software os quadros ficaram lentos demais para os limites padrão no projeto 390 × 844 (arrasto com muitos passos de mouse). O `playwright.config.js` dá 90 s por teste e 15 s por verificação só quando `PW_EXECUTABLE` está definido; com GPU continuam 30 s e 5 s. O teste de compactação passou a observar cada reposicionamento dos botões, em vez de ler uma vez por quadro, porque com quadros lentos perdia o único quadro compactado.
- Capturas em `.scratch/hamburguer-3d/capturas/06-07/`: `desktop-montado.png`, `desktop-aberto.png`, `390x844-montado.png`, `390x844-aberto.png`.
