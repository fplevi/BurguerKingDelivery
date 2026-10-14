# 02: Onion rings realistas

**What to build:** a Camada Onion rings com o acabamento aprovado nos outros hambúrgueres, gerada por código, sem imagem (ADR 0001): uma Camada só com dois anéis grandes lado a lado, quase se tocando no centro; empanado grosso, irregular, dourado-alaranjado, com a textura da farinha empanada à mostra e sem cebola aparecendo. Cada anel passa um pouco da borda da carne, e o furo do meio deixa ver o barbecue, como em `site_Rodeio_Duplo.png`. Modelo novo em `layerModels` e receita de textura; a cena e `main.js` não mudam. A Cebola e a Cebola crispy não mudam. Ajuste fino do Molho barbecue (cor, brilho, escorrido na borda), se a captura pedir. Camada fácil de tocar em Ver ingredientes. Os onion rings são a primeira Camada de anel empanado: olhe o primeiro quadro antes de fechar. Spec: `.scratch/rodeio-duplo/spec.md`.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Dois anéis grossos, empanado irregular dourado-alaranjado com textura de farinha, furo central mostrando o barbecue, passando um pouco da borda da carne
- [ ] Onion rings isolados em Ver ingredientes reconhecíveis (não discos, não cebola crispy) e fáceis de tocar/arrastar
- [ ] Molho barbecue marrom-escuro, brilhante, sobre a carne e escorrendo na borda
- [ ] Textura com semente fixa, por campos de ruído (sem ruído por pixel)
- [ ] Primeiro quadro conferido com `npm run test:orcamento` (uma execução, contra o build) sem passar do limite aceito
- [ ] Capturas montado e aberto (desktop) ao lado da foto oficial
