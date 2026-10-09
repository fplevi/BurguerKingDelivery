# 06: Queijo, picles, cebola e tomate realistas

**What to build:** queijo, picles, cebola e tomate ganham o mesmo nível de realismo aprovado em 05. Queijo derretido caindo sobre as bordas da carne; picles, cebola e tomate como uma camada cada, com várias fatias reconhecíveis (sementes e polpa do tomate, anéis de cebola, ranhuras do picles).

**Blocked by:** 05.

**Status:** resolved

- [x] Queijo derretido, acomodado sobre a carne quando montado
- [x] Picles, cebola e tomate com várias fatias por camada, distinguíveis entre si
- [x] Mesma luz, câmera e acabamento de pães e carne
- [x] Cada camada continua retirável e recolocável; área de toque coerente com o objeto
- [x] Capturas desktop e 390 × 844; suíte Playwright verde

## Answer

- Modelos em `prototype/src/scene/layer-models.js`, texturas desenhadas por código em `textures.js` (nenhuma imagem baixada):
  - Queijo: fatia girada 45°, com cantos arredondados, plana no meio e escorrendo sobre a borda da carne, com leves ondulações de derretido. Amarelo mais vivo que o laranja da página, acetinado. A altura declarada da carne subiu 0,02 para incluir os caroços e o abaulado, senão a carne atravessava o queijo.
  - Picles: quatro fatias de corte ondulado, casca verde-escura, polpa translúcida amarelo-esverdeada, anel de sementes e faces com ranhuras.
  - Cebola: anéis soltos em quatro grupos, alguns quebrados, brancos com a borda interna levemente esverdeada.
  - Tomate: três fatias com casca, parede vermelha, quatro lóculos de gel brilhante com sementes, centro claro e septos; relevo e rugosidade seguem o desenho.
- Cada camada continua sendo uma peça só para a cena e a página: as fatias e os anéis são unidos numa única malha por camada (uma chamada de desenho em vez de uma por peça).
- Correção do ticket 09: a cena zerava a rotação própria dos modelos; agora cada camada fica num grupo próprio (registrado também no ticket 05).
- Áreas de toque: cada botão vai até a metade da distância para as camadas vizinhas, não só até a caixa do objeto. Novo teste: no hambúrguer aberto, cada ingrediente removível tem pelo menos 24 × 44 px (WCAG 2.5.8) em desktop e 390 × 844.
- Fps no WebGL por software deste container, durante a abertura: desktop 19 (antes de 06/07: 32), 390 × 844 em densidade 3× 12,7 (antes: 27). A primeira versão, com `MeshPhysicalMaterial` (clearcoat e sheen) nas sete camadas, caía para 2,3 fps no desktop; com material padrão e uma malha por camada, ficou nos números acima sem perda visível. Os números reais em GPU e celular intermediário são do ticket 11.
- Testes: com WebGL por software os quadros ficaram lentos demais para os limites padrão no projeto 390 × 844 (arrasto com muitos passos de mouse). O `playwright.config.js` dá 90 s por teste e 15 s por verificação só quando `PW_EXECUTABLE` está definido; com GPU continuam 30 s e 5 s. O teste de compactação passou a observar cada reposicionamento dos botões, em vez de ler uma vez por quadro, porque com quadros lentos perdia o único quadro compactado.
- Capturas em `.scratch/hamburguer-3d/capturas/06-07/`: `desktop-montado.png`, `desktop-aberto.png`, `390x844-montado.png`, `390x844-aberto.png`.
