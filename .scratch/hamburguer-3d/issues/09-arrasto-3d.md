# 09: Arrasto que move o ingrediente 3D

**What to build:** ao arrastar um ingrediente em Alterar ingredientes, o próprio objeto 3D acompanha o dedo ou o cursor até ser solto na bandeja, que reage ao passar por cima. Soltar fora da bandeja devolve o ingrediente ao lugar; toque sem arrasto continua retirando. O módulo de cena expõe mover e soltar uma camada; o gesto continua partindo dos botões DOM.

**Blocked by:** 03.

**Status:** resolved

- [x] Objeto 3D segue o ponteiro durante o arrasto, sobre a cena
- [x] Bandeja destaca ao passar por cima; soltar nela retira o ingrediente
- [x] Soltar fora devolve o ingrediente ao encaixe com transição
- [x] Toque simples e teclado continuam retirando
- [x] Base não pode ser arrastada
- [x] Teste Playwright de arrasto com mouse; anotar que toque real exige aparelho físico

## Answer

- Cena: `drag(id, clientX, clientY)` e `release()`. O gesto continua partindo dos botões DOM; a página só chama a cena depois de 8 px de movimento, então toque simples continua retirando e teclado não muda.
- Para a camada chegar até a bandeja, que fica fora do palco, o canvas de Alterar ingredientes passa a cobrir a tela inteira durante o arrasto (`position: fixed`, sem receber ponteiro). A câmera usa `setViewOffset` para manter o hambúrguer exatamente no mesmo lugar, então nada pula. Quando a camada termina de voltar ou de encolher, o canvas volta ao tamanho do palco.
- A camada segura acompanha o ponteiro a partir do ponto em que foi pega, um pouco mais perto da câmera, inclinada de frente para quem olha (senão um disco fino aparece de perfil) e levemente para o lado em que é levada. A pose gira em torno do centro da camada, para o ponto pego ficar sob o dedo. Durante o arrasto, a área de toque dela não é dividida com as vizinhas.
- Soltar na bandeja: a camada encolhe onde foi solta e aparece na bandeja (ticket 08). Soltar fora: volta ao encaixe com a mesma transição de abrir. Com movimento reduzido, volta na hora.
- A bandeja continua destacando ao passar por cima. Os botões da Base estão desativados, então pão e carne não arrastam.
- No fallback SVG, o arrasto segue como antes (o botão com a ilustração se move).
- A `perspective` do palco só vale no fallback: no 3D ela fazia o palco virar o bloco de contenção do canvas fixo.
- `tests/arrasto-3d.spec.js` (mouse): a área da camada fica a menos de 40 px do cursor no meio do arrasto e a bandeja muda de cor ao passar por cima; soltar fora devolve a camada à posição original; a Base não se move. Arrasto por toque ainda precisa ser conferido em aparelho físico.
