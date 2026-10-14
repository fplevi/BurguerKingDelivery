# 02: Bacon realista

**What to build:** a Camada Bacon com o acabamento aprovado nos outros hambúrgueres, gerada por código, sem imagem (ADR 0001): uma Camada só com três tiras onduladas e tostadas, partes escuras e gordura mais clara, pontas saindo da borda da carne dos dois lados, como em `site_Stacker_Duplo.png`. Modelo novo em `layerModels` e receita de textura; a cena e `main.js` não mudam. Ajuste fino do Molho Stacker (cor, brilho, pingos na borda), se a captura pedir. Camada fácil de tocar em Ver ingredientes. O bacon é a primeira Camada de tiras finas e torcidas: olhe o primeiro quadro antes de fechar. Spec: `.scratch/stacker-duplo-bacon/spec.md`.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Bacon com três tiras onduladas, tostado irregular e gordura clara, pontas para fora da carne
- [ ] Bacon isolado em Ver ingredientes reconhecível e fácil de tocar/arrastar
- [ ] Molho Stacker rosa-alaranjado, cremoso, sob o pão e pingando na borda
- [ ] Textura com semente fixa, por campos de ruído (sem ruído por pixel)
- [ ] Primeiro quadro conferido com `npm run test:orcamento` (uma execução, contra o build) sem passar do limite aceito
- [ ] Capturas montado e aberto (desktop) ao lado da foto oficial
