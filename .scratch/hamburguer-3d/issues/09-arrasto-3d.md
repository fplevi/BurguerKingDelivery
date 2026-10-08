# 09: Arrasto que move o ingrediente 3D

**What to build:** ao arrastar um ingrediente em Alterar ingredientes, o próprio objeto 3D acompanha o dedo ou o cursor até ser solto na bandeja, que reage ao passar por cima. Soltar fora da bandeja devolve o ingrediente ao lugar; toque sem arrasto continua retirando. O módulo de cena expõe mover e soltar uma camada; o gesto continua partindo dos botões DOM.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Objeto 3D segue o ponteiro durante o arrasto, sobre a cena
- [ ] Bandeja destaca ao passar por cima; soltar nela retira o ingrediente
- [ ] Soltar fora devolve o ingrediente ao encaixe com transição
- [ ] Toque simples e teclado continuam retirando
- [ ] Base não pode ser arrastada
- [ ] Teste Playwright de arrasto com mouse; anotar que toque real exige aparelho físico
