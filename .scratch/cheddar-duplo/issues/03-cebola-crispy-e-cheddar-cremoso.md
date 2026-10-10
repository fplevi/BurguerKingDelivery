# 03: Cebola crispy e cheddar cremoso realistas

**What to build:** os dois acabamentos que ainda faltam ao Cheddar Duplo, gerados por código, sem imagem (ADR 0001), com a luz e o acabamento aprovados no Whopper. Cebola crispy: monte de farelos dourados, irregulares e crocantes, sob o pão superior. Cheddar: mais alaranjado, mais líquido, com fios longos escorrendo pelas bordas das carnes, como em `site_Cheddar_Duplo.png`; o queijo do Whopper não muda. Camada fina e fácil de tocar. Spec: `.scratch/cheddar-duplo/spec.md`.

**Blocked by:** 02.

**Status:** resolved

- [x] Modelo e textura da cebola crispy (`layer-models.js`, `texture-recipes.js`), reconhecível no hero e aberta
- [x] Cheddar do Cheddar Duplo cremoso, escorrendo pelas bordas das carnes; Whopper igual ao de antes
- [x] Área de toque própria de cada camada aberta (a camada fina continua tocável)
- [x] Capturas desktop e 390 × 844 (montado e aberto) em `.scratch/cheddar-duplo/capturas/03/`
- [x] `npm test` e `npm run test:build` verdes

## Answer

- Cheddar: modelo novo `cheddar` em `layer-models.js` (o `cheese` do Whopper não mudou). Uma malha só: folha brilhante sobre a carne que rola para fora da borda e desce como cortina; o comprimento da cortina por ângulo desenha 8 fios longos de ponta arredondada (até ~0,18; a carne tem 0,21). Amarelo-alaranjado, mais laranja onde escorre grosso, com leve brilho emissivo laranja no lugar do espalhamento interno, para não ficar pálido contra a página laranja. `cheddar1` e `cheddar2` usam o mesmo modelo, com fios em lugares diferentes (semente fixa derivada do id): `build(camada)` agora recebe a Camada da Receita (`burger-scene.js`, uma linha). O fallback SVG ganhou um cheddar com fios (`art.js`).
- Cebola crispy: monte de farelos com borda espessa (até 0,12 de altura): base polar com relevo e ~900 pedaços (flocos irregulares e fios curvos curtos), de dourado a marrom-escuro, numa malha e um material (textura × cor por vértice). Textura nova `fried-onion` em `texture-recipes.js` (256 px, cor e relevo, campos de ruído pequenos e traços, semente fixa), pintada no segundo worker.
- Áreas de toque: dois testes novos em `tests/cheddar-duplo.spec.js`. Tocar/clicar cada camada aberta retirável (os cheddars finos, com fios, e a cebola) retira a camada certa; as 7 áreas abertas não se sobrepõem e têm pelo menos 24 × 44 px. Passaram já com o modelo provisório e continuam passando com os fios (o cálculo das áreas não mudou).
- Verificação: `npm test` e `npm run test:build`: 104 passaram, 4 ignorados (os mesmos de antes). As 16 capturas do Whopper (desktop e 390 × 844; 3D e SVG; montado, aberto, retirados, aplicado) são idênticas às da integração (diferença máxima 0/255); o hero do Whopper depois de ir ao Cheddar Duplo e voltar difere no máximo 1/255, como no ticket 02.
- Capturas (Cheddar Duplo selecionado): `.scratch/cheddar-duplo/capturas/03/desktop-montado.png`, `desktop-aberto.png`, `390x844-montado.png`, `390x844-aberto.png`. Autorrevisão ao lado de `site_Cheddar_Duplo.png`: leem como a foto (faixa de cebola marrom sob o pão, cheddar laranja escorrendo sobre as duas carnes). Para a revisão do ticket 04: os fios são línguas lisas (na foto são mais gotejantes e brilhantes); a borda do cheddar sobressai um pouco da carne; o pão inferior e a lateral da carne seguem iguais aos do Whopper. O custo das camadas novas no primeiro quadro fica para o ticket 05.
