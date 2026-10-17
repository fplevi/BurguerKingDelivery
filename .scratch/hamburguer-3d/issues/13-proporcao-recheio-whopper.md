# 13: Proporção do recheio do Whopper

**What to build:** com o hambúrguer fechado, os recheios do Whopper quase não aparecem: cebola, tomate e picles estão pequenos, o queijo é uma folha sem espessura e o ketchup e a maionese mal se veem. Ajustar tamanho, quantidade e espessura das camadas pela foto `prototype/Assets/burgers/official/site_Whopper.png`, julgando o resultado na vista montada com a câmera padrão.

**Blocked by:** 07.

**Status:** resolved

## Decisões (sessão de grilling, 2026-10-12)

- Nenhuma peça de recheio passa de r ≈ 0,96 (raio do pão = 1). Onde faltar cobertura perto da borda, entram mais peças; elas podem se sobrepor. Exceções: o queijo, que cai pela lateral da carne, e a alface, que vai até ~1,06.
- Tomate: 3–4 fatias de raio ~0,46–0,48 e espessura ~0,08.
- Cebola: 2–3 rodelas de anéis concêntricos, com o anel externo de raio ~0,40–0,45 e tubo ~0,035; algumas quebradas.
- Picles: 5 fatias de raio ~0,28 e espessura ~0,04, com 2–3 visíveis na borda.
- Queijo: espessura real (~0,03) com borda visível e os cantos caindo mais pela lateral da carne. A cor fica.
- Ketchup: ~9–10 gotas de raio 0,06–0,18, 4–5 delas entre r 0,85 e 0,96, com altura ~0,045.
- Maionese: camada central mais ~6–8 gotas até r 0,96, com altura ~0,035.
- Alface: 4 pedaços grandes de folha rasgada e amassada, sobrepostos em alturas diferentes. A altura da camada sobe para ~0,16.
- O hambúrguer fica ~10% mais alto. A câmera só muda se cortar no desktop ou em 390 × 844.
- O fallback SVG (`src/art.js`) segue a mesma direção. Se cebola e maionese continuarem ilegíveis nas miniaturas da bandeja, ajustar o enquadramento delas.

## Critérios

- [x] Camadas 3D ajustadas conforme as decisões
- [x] Fallback SVG ajustado
- [x] As quatro capturas padrão (desktop e 390 × 844, montado e aberto) ao lado da foto de referência
- [x] `npm run test:build` verde e `npm run test:orcamento` medido
- [x] Revisão do responsável pelo produto

## Answer

Tudo está em `prototype/src/scene/layer-models.js` e `prototype/src/art.js`. A cena, a câmera e `main.js` não mudaram.

- **Queijo**: agora é uma fatia de verdade (topo, fundo e borda arredondada, 0,03) e maior (0,9). Os cantos rolam sobre a borda da carne e descem pela lateral, contornando os caroços dela, uns mais que outros. Continua girado 45° (o losango do ticket 05).
- **Picles**: 7 fatias de raio ~0,28 e 0,04 de espessura, 6 na borda (uma de frente) e 1 no centro. Ficaram 7, e não 5, porque com 5 sobrava queijo à mostra na borda da frente.
- **Cebola**: pedaços de anel, e não anéis inteiros: arcos de comprimento irregular (0,7π a 1,65π), abertos em direções aleatórias, em 6 grupos aninhados de tamanhos diferentes (anel externo de 0,2 a 0,4). A seção é quase quadrada (superelipse), 0,05 de largura por 0,07 de altura, e as pontas são arredondadas (2ª rodada).
- **Tomate**: 3 fatias de raio ~0,47 e 0,08 de espessura, duas viradas para a frente (esquerda e direita) e uma atrás, um pouco sobrepostas (2ª rodada).
- **Ketchup**: 10 gotas (5 na borda e 5 mais para dentro), com 0,045 de altura. **Maionese**: uma camada central mais fina e 7 gotas na borda, com 0,035 de altura. Na pilha, cada molho ocupa só 0,015 e as gotas se encaixam na camada de cima. Sem isso, sobravam vãos visíveis entre as camadas do hambúrguer montado.
- **Alface**: 4 pedaços de folha rasgada (contorno com recortes), amassados com dobras. Cada pedaço apoia nos que vieram antes onde se sobrepõem, passa até ~1,05 da borda e cai um pouco ali. As nervuras saem do lado do centro.
- **Molhos (2ª rodada)**: contorno suave, com poucos lóbulos largos e sem recortes finos, e perfil de gota arredondado.
- Nenhum recheio passa de 0,96 (`FILLING_REACH`), salvo o queijo e a alface.
- **Altura**: a pilha montada passou de 1,30 para 1,43 (+10%). A câmera se enquadra sozinha pela soma das alturas, e coube no desktop e em 390 × 844 sem ajuste.
- **Fallback SVG**: queijo mais grosso, com três pontas caindo; ketchup e maionese em gotas (as da maionese menores); alface em 4 pedaços rasgados.
- **Testes**: `npm run test:build` com 394 testes verdes e 36 pulados. `npm run test:orcamento` verde (2ª rodada): primeiro quadro em 390 com CPU 4x de 1190 ms de mediana; troca de produto em ~230–250 ms; 71–75 fps.
- **Capturas** em `.scratch/hamburguer-3d/capturas/13/`: as quatro padrão, `comparacao-montado.png` (foto ao lado), `bandeja.png`, `svg-montado.png` e `svg-aberto.png`.
- **Ressalva**: nas miniaturas da bandeja, cebola e maionese continuam pálidas. A causa é a cor clara sobre o fundo creme, não o enquadramento, por isso o enquadramento não foi mexido.

## Comments

2026-10-12 (solicitante, revisão das capturas): pediu duas fatias de tomate viradas para o usuário, cebola menos cilíndrica (mais quadrada, em pedaços irregulares e não em anéis inteiros) e molhos com contorno mais suave. Atendido na 2ª rodada; `detalhe-aberto.png` mostra esse trecho de perto.
