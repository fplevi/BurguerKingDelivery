# 04: Pães e carne realistas

**What to build:** pão inferior, carne e pão superior passam a ter realismo de renderização 3D de alta qualidade, modelados proceduralmente e com texturas geradas por código, sem imagens externas. Pão superior com gergelim distribuído, tostado e brilho; pão inferior com miolo visível quando aberto; carne com textura grelhada, bordas irregulares e marcas de chapa. As fotos oficiais do produto na grade servem apenas como referência de proporção e cor. Estes três definem a direção visual das demais camadas.

**Blocked by:** 03.

**Status:** resolved

- [x] Pão superior: gergelim, tostado, brilho, volume abaulado
- [x] Pão inferior: miolo visível de cima com o hambúrguer aberto
- [x] Carne: textura grelhada, bordas irregulares, marcas de chapa
- [x] Coerentes com a câmera, a luz e as sombras da cena, no hero e em Alterar ingredientes
- [x] Nenhuma imagem de ingrediente baixada
- [x] Capturas de tela desktop e 390 × 844 (montado e aberto) anexadas ao ticket para a revisão do ticket 05
- [x] Suíte Playwright verde

## Answer

- Modelos em `prototype/src/scene/layer-models.js`, no mesmo contrato do ticket 03 (`height` e `build()`); a cena e a página não mudaram de interface.
  - Pão superior: cúpula achatada (superelipse) com borda arredondada junto ao corte, irregularidades por ruído, cor por vértice (faixa clara junto ao corte, topo mais tostado, manchas), brilho de pincelado (`clearcoat`), grão fino de casca por relevo e 150 sementes de gergelim instanciadas e assentadas na superfície. Altura 0,46 (era 0,5), mais próxima da proporção da foto da grade.
  - Pão inferior: casca torneada com base mais escura e face de corte separada, com textura de miolo tostado na chapa, poros e borda mais escura. Visível de cima com o hambúrguer aberto.
  - Carne: disco com bordas irregulares e rasgadas, faces com caroços e leve abaulado, textura de carne moída com borda selada, marcas de chapa paralelas e quebradas, pontos de gordura mais brilhantes (mapas de cor, rugosidade e relevo coerentes entre si).
- Texturas em `prototype/src/scene/textures.js`, geradas no carregamento a partir de ruído com semente fixa (o hambúrguer é igual em todo carregamento). Campos de ruído pequenos e periódicos, lidos com interpolação, deixam a geração em cerca de 170 ms no desktop (a primeira versão, ruído por pixel, levava 3 s). Os canvases são gerados uma vez e cada palco envia sua própria cópia à GPU.
- Cena (`burger-scene.js`): reflexos de estúdio (`RoomEnvironment` com PMREM, intensidade baixa) para o brilho da casca e da gordura; mapeamento de tons Neutral (o ACES deixava os pães desbotados).
- Pendências do ticket 03 resolvidas:
  - A área de toque de cada camada agora vem da projeção de pontos da própria geometria, não da caixa envolvente. A área do pão superior acompanha a cúpula.
  - A sombra projetada no chão some à medida que o hambúrguer abre, e uma sombra de contato suave fica sempre sob o pão inferior. Aberto, não há mais a sombra larga e deslocada.
- Bundle de produção: 573 KB de JS, 147,5 KB gzip (era 140,7 KB; limite 250 KB).
- `npm test`: 48 verdes com Chromium e WebGL por software (SwiftShader) neste container. Foi necessário `--enable-unsafe-swiftshader`, como previsto no ticket 03; `PW_EXECUTABLE` no `playwright.config.js` habilita isso. Com renderização por software, a suíte passou de 1,5 para 6,5 minutos, porque os materiais PBR custam caro na CPU (cerca de 1 s por quadro). Em GPU real o custo é baixo, mas os quadros por segundo no celular precisam ser medidos no ticket 11.
- Capturas para a revisão do ticket 05 em `.scratch/hamburguer-3d/capturas/04/`: `desktop-montado.png`, `desktop-aberto.png`, `390x844-montado.png`, `390x844-aberto.png`.
- Pontos que merecem atenção na revisão: as marcas de chapa estão discretas de propósito (no Whopper real elas não dominam a carne); o gergelim cobre o topo e rareia perto da borda; as demais 7 camadas continuam formas simples e ficam mais artificiais ao lado dos pães e da carne até os tickets 06 e 07.
