# 02: Onion rings realistas

**What to build:** a Camada Onion rings com o acabamento aprovado nos outros hambúrgueres, gerada por código, sem imagem (ADR 0001): uma Camada só com dois anéis grandes lado a lado, quase se tocando no centro; empanado grosso, irregular, dourado-alaranjado, com a textura da farinha empanada à mostra e sem cebola aparecendo. Cada anel passa um pouco da borda da carne, e o furo do meio deixa ver o barbecue, como em `site_Rodeio_Duplo.png`. Modelo novo em `layerModels` e receita de textura; a cena e `main.js` não mudam. A Cebola e a Cebola crispy não mudam. Ajuste fino do Molho barbecue (cor, brilho, escorrido na borda), se a captura pedir. Camada fácil de tocar em Ver ingredientes. Os onion rings são a primeira Camada de anel empanado: olhe o primeiro quadro antes de fechar. Spec: `.scratch/rodeio-duplo/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Dois anéis grossos, empanado irregular dourado-alaranjado com textura de farinha, furo central mostrando o barbecue, passando um pouco da borda da carne
- [x] Onion rings isolados em Ver ingredientes reconhecíveis (não discos, não cebola crispy) e fáceis de tocar/arrastar
- [x] Molho barbecue marrom-escuro, brilhante, sobre a carne e escorrendo na borda
- [x] Textura com semente fixa, por campos de ruído (sem ruído por pixel)
- [x] Primeiro quadro conferido com `npm run test:orcamento` (uma execução, contra o build) sem passar do limite aceito
- [x] Capturas montado e aberto (desktop) ao lado da foto oficial

## Answer

- `layer-models.js`, `onionRings`: cada anel é uma seção varrida (superelipse, mais larga que alta), com espessura que varia ao longo do anel, um pouco fora do redondo, e a superfície empurrada por grumos e migalhas (ruído com semente sobre a posição do vértice, sem emenda); as frestas ficam mais escuras por cor de vértice (um laranja mais escuro, não marrom), um leve brilho próprio laranja mantém dourado o lado na sombra do pão, e a parte de baixo, apoiada no molho, fica achatada. Os dois anéis têm sementes próprias e giram em direções diferentes. Altura 0,29 (antes 0,26), mais grossos como na foto, alcance ~1,12 contra 1,05 da carne (até ~1,17 onde o anel incha); furo de ~0,25 de raio, onde aparece o barbecue. Um mesh, uma chamada de desenho.
- `texture-recipes.js`, receita `breading` (256 px, cor e relevo, ~14 ms): campos de ruído periódicos (tostado e migalha; o grão é o campo de migalha duas vezes mais fino, para seguir repetindo) e flocos soltos desenhados também do outro lado das bordas, para repetir sem emenda.
- **Worker de texturas:** no primeiro worker (o da carne, o mais lento), a receita atrasava `texturesReady`, e `tests/cena-3d.spec.js:104` (Whopper, movimento reduzido, que abre Ver ingredientes logo depois de carregar) passou a falhar 4 em 34 rodadas; antes, 0 em 33. A receita foi para o segundo worker (agora ~81 e ~85 ms) e ficou mais barata: 40 em 40. Toda receita nova pesa em todos os hambúrgueres, porque as texturas são pintadas antes do primeiro quadro: equilibre os dois workers.
- Molho barbecue: a poça central chega quase à borda (alcance 0,92, mais baixa: 0,55 da altura das gotas, antes 0,7), formando uma camada contínua com as gotas escorrendo na borda, e o marrom ficou um pouco mais quente (`#45200b`).
- Cebola e Cebola crispy não mudaram. Comportamento (tocar, arrastar, áreas de toque) segue coberto por `tests/rodeio-duplo.spec.js`; nenhum teste novo, como na spec.
- Orçamento (`npm run test:orcamento`, contra o build): primeiro quadro do Whopper mediana 1188 ms; com o Rodeio Duplo acrescentado só para medir (o ticket 04 o fixa no teste), a primeira troca levou 393 ms e a mediana 200 ms, abaixo do limite de 3000 ms; fps ao abrir, arrastar e inclinar 73–75.
- Capturas em `capturas/02/` (desktop e 390 × 844, hero, montado e aberto) e `revisao-lado-a-lado.png` com a foto oficial.
- Revisão de código (padrões e spec): o JSDoc do bacon tinha ficado órfão em `texture-recipes.js` e o README não listava a receita nova; corrigidos, com os números soltos dos anéis em constantes.
- Fica para a revisão do 03: maionese mais grossa e pão superior mais alto e claro, como na foto; no montado o lado dos anéis ainda sai um pouco menos laranja que na foto, e o barbecue mais escuro e mais grosso que a camada fina da foto.
