# 03: Tracer bullet 3D: módulo de cena do hambúrguer com geometria simples

**What to build:** o hambúrguer passa a ser desenhado por uma cena Three.js, no hero e em Alterar ingredientes, com câmera ~15° acima, luz suave do alto à esquerda, fundo transparente e sombras de contato na cena. As 10 camadas ainda são formas coloridas simples. Toda a lógica 3D fica em um único módulo de cena com interface pequena (montar no palco, definir estado exibido montado/aberto + ingredientes retirados, informar a área de cada camada na tela, liberar recursos); o resto da página não conhece Three.js. Os botões DOM invisíveis são posicionados pela área informada pela cena. Abrir, compactar ao aplicar e o hero refletindo a personalização funcionam em 3D. Sem WebGL, as ilustrações SVG aparecem. ADR 0001; spec `.scratch/hamburguer-3d/spec.md`.

**Blocked by:** 02.

**Status:** resolved

- [x] Uma cena e um contexto WebGL por palco (hero e Alterar ingredientes), mesma câmera e luz
- [x] O reducer continua fonte de verdade; a cena apenas reflete o estado
- [x] Botões DOM sobre cada camada com rótulo "Retirar <ingrediente>", alcançáveis por toque e teclado
- [x] Abrir mostra as camadas separadas; aplicar compacta as presentes com o pão superior descendo até a base; altura final menor quando há ingredientes retirados
- [x] Hero exibe o hambúrguer montado sem os ingredientes retirados
- [x] Sem WebGL, fallback SVG com o mesmo fluxo (teste Playwright)
- [x] Movimento reduzido: transições sem animação
- [x] Toda a suíte Playwright continua verde

## Answer

- Módulo de cena em `prototype/src/scene/burger-scene.js`, único código que conhece Three.js (importações nomeadas, com tree-shaking). Interface: `createBurgerScene(palco, { fit: 'assembled' | 'open', onAreas })` devolve `null` sem WebGL (a página mantém o SVG); `show({ open, removed }, { animate })` devolve uma promessa resolvida quando a transição foi desenhada; `areas()` dá a área na tela de cada camada visível (px do palco), também entregue a `onAreas` a cada quadro; `dispose()`.
- Uma cena e um contexto WebGL por palco (hero `fit: 'assembled'`, Alterar ingredientes `fit: 'open'`), mesma câmera (15° acima, FOV 30°) e luz (hemisférica + direcional do alto à esquerda), fundo transparente, sombras por shadow map entre camadas e num chão `ShadowMaterial`. Desenho sob demanda: só há loop de quadros durante transições.
- Camadas em `prototype/src/scene/layer-models.js`: por id, `height` e `build()` (formas coloridas simples). Tickets 04/06/07 trocam só esse arquivo.
- O reducer continua fonte de verdade; `render()` chama `show` da cena. Os botões DOM "Retirar <ingrediente>" ficam sobre a cena, invisíveis, posicionados pela área de cada camada (sobreposição entre vizinhas dividida no meio). Aplicar espera a compactação ser desenhada (+150 ms, limite de 1,5 s) antes de fechar.
- Sem WebGL: ilustrações SVG e o fluxo antigo, sem mudança. Movimento reduzido: `show` não anima; aplicar fecha na hora. A inclinação CSS do hero só vale no fallback (a 3D é do ticket 10).
- `main.js` reformatado (era minificado).
- Playwright: `tests/cena-3d.spec.js` (canvas no hero sem SVG; hero sem os retirados e mais baixo; cada camada aberta tem área de toque própria; aplicar compacta com o pão superior descendo; movimento reduzido sem animação) e `tests/fallback-svg.spec.js` (WebGL desativado por `addInitScript`: SVG no hero e fluxo de retirada, arrasto e aplicar). Mutações conferidas: sem compactar no hero, sem compactar ao aplicar, ignorar movimento reduzido, esconder SVG sem cena. 24 testes × 2 projetos = 48 verdes em `npm test` e `npm run test:build`.
- O Chrome headless usa WebGL2 por hardware (ANGLE/D3D11) nesta máquina. Em CI pode cair em SwiftShader.
- Bundle de produção: 552 KB de JS, 140,7 KB gzip, com Three.js (limite: 250 KB). Medição formal no ticket 11.
- Capturas desktop e 390 × 844 (hero, aberto, com retiradas, compactando, aplicado; com e sem WebGL) conferidas: botões alinhados às camadas; fallback igual ao anterior.
- Pendências: a área do pão superior inclui um pouco acima da cúpula (caixa projetada). A sombra no chão do hambúrguer aberto é larga e deslocada. As duas ficam para o ticket 04. Hoje o Three.js é carregado também no fallback; carregar sob demanda fica para o ticket 11, se o orçamento pedir.
