# 03: Cebola crispy e cheddar cremoso realistas

**What to build:** os dois acabamentos que ainda faltam ao Cheddar Duplo, gerados por código, sem imagem (ADR 0001), com a luz e o acabamento aprovados no Whopper. Cebola crispy: monte de farelos dourados, irregulares e crocantes, sob o pão superior. Cheddar: mais alaranjado, mais líquido, com fios longos escorrendo pelas bordas das carnes, como em `site_Cheddar_Duplo.png`; o queijo do Whopper não muda. Camada fina e fácil de tocar. Spec: `.scratch/cheddar-duplo/spec.md`.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Modelo e textura da cebola crispy (`layer-models.js`, `texture-recipes.js`), reconhecível no hero e aberta
- [ ] Cheddar do Cheddar Duplo cremoso, escorrendo pelas bordas das carnes; Whopper igual ao de antes
- [ ] Área de toque própria de cada camada aberta (a camada fina continua tocável)
- [ ] Capturas desktop e 390 × 844 (montado e aberto) em `.scratch/cheddar-duplo/capturas/03/`
- [ ] `npm test` e `npm run test:build` verdes
