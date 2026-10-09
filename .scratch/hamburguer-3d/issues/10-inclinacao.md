# 10: Inclinação do hambúrguer

**What to build:** o hambúrguer inclina até ±10°, sem rotação livre, para revelar o volume. Desktop: segue o ponteiro. Android: segue a orientação do aparelho. iOS: segue o arrasto na área vazia do palco, sem pedido de permissão de movimento. Em Alterar ingredientes, arrastar um ingrediente continua significando retirá-lo. Desativada com movimento reduzido.

**Blocked by:** 09.

**Status:** resolved

- [x] Inclinação limitada a ±10°, com retorno suave ao centro
- [x] Ponteiro no desktop; orientação do aparelho no Android; arrasto na área vazia no iOS
- [x] Nenhum pedido de permissão de movimento
- [x] Sem conflito com o arrasto de ingredientes
- [x] Movimento reduzido: sem inclinação (teste Playwright)
- [x] Botões DOM continuam alinhados às camadas durante a inclinação

## Answer

- Cena: `tilt(x, y)`, com x e y entre -1 e 1 (direita e para baixo na tela); `(0, 0)` volta ao centro. O hambúrguer gira em torno do próprio meio: no máximo 10° de arfagem (mostra mais ou menos do topo), 10° de giro no eixo vertical e 8° de rolagem, para o giro aparecer em formas redondas. A transição é suave (constante de 0,12 s) e o desenho só fica em loop enquanto a inclinação se move. Ignorada com movimento reduzido e durante o arrasto de uma camada, que primeiro endireita o hambúrguer.
- Botões DOM: as áreas são recalculadas a cada quadro a partir da geometria inclinada, então continuam sobre as camadas.
- Fontes (`main.js`):
  - Desktop: posição do mouse no palco; ao sair, volta ao centro.
  - Toque (iOS e Android): arrastar na área vazia do palco. O palco usa `touch-action: pan-y`, então o gesto horizontal inclina e o vertical continua rolando a página. Os botões das camadas mantêm o arrasto de retirar.
  - Android: `deviceorientation`, relativo à forma como o aparelho está sendo segurado (a referência acompanha devagar). O site nunca chama `requestPermission`; no iOS o evento não chega sem esse pedido, e o arrasto na área vazia cobre o caso.
- Em Alterar ingredientes a inclinação é a metade (`tiltScale: 0.5`), para as camadas não fugirem do cursor na hora de tocar.
- O passo da suavização não é mais limitado a 0,1 s: com quadros lentos (WebGL por software) a inclinação demorava dez vezes mais para assentar.
- `tests/inclinacao.spec.js`: desktop inclina para os dois lados e volta ao centro; toque na área vazia inclina, volta ao soltar e não pede permissão de movimento (eventos de toque via CDP, no projeto 390 × 844); com o hambúrguer inclinado em Alterar ingredientes, tocar nas camadas continua retirando; movimento reduzido não inclina. O limite de ±10° está no código (constante `TILT`), não em teste.
- Precisa de aparelho físico: orientação no Android e a sensação do arrasto de inclinação no iPhone.
