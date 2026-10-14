# 02: Bacon realista

**What to build:** a Camada Bacon com o acabamento aprovado nos outros hambúrgueres, gerada por código, sem imagem (ADR 0001): uma Camada só com três tiras onduladas e tostadas, partes escuras e gordura mais clara, pontas saindo da borda da carne dos dois lados, como em `site_Stacker_Duplo.png`. Modelo novo em `layerModels` e receita de textura; a cena e `main.js` não mudam. Ajuste fino do Molho Stacker (cor, brilho, pingos na borda), se a captura pedir. Camada fácil de tocar em Ver ingredientes. O bacon é a primeira Camada de tiras finas e torcidas: olhe o primeiro quadro antes de fechar. Spec: `.scratch/stacker-duplo-bacon/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Bacon com três tiras onduladas, tostado irregular e gordura clara, pontas para fora da carne
- [x] Bacon isolado em Ver ingredientes reconhecível e fácil de tocar/arrastar
- [x] Molho Stacker rosa-alaranjado, cremoso, sob o pão e pingando na borda
- [x] Textura com semente fixa, por campos de ruído (sem ruído por pixel)
- [x] Primeiro quadro conferido com `npm run test:orcamento` (uma execução, contra o build) sem passar do limite aceito
- [x] Capturas montado e aberto (desktop) ao lado da foto oficial

## Answer

- `layer-models.js`, `bacon`: três tiras com espessura (face de cima, de baixo e bordas), franzidas em dobras irregulares e mais agudas no alto, torcidas para lá e para cá e um pouco côncavas. Ficam um pouco afastadas, e a da frente aparece sob o molho. As pontas saem da carne dos dois lados e curvam um pouco para baixo, sobre a borda dela. A cor por vértice escurece as cristas e as pontas. A cena e `main.js` não mudaram.
- `texture-recipes.js`, receita `bacon` (256 px, cor, relevo e aspereza), ao longo da tira:
  - gordura clara numa borda e num veio que vai e volta;
  - carne vermelho-amarronzada com fibras;
  - partes mais fritas e bordas tostadas;
  - a gordura mais alta e brilhante, o tostado fosco.
  - Usa só campos de ruído com semente fixa (121–125), sem ruído por pixel, e roda no segundo Web Worker.
- Molho Stacker:
  - cor um pouco mais laranja (`#ef9468`);
  - nova opção `drip` de `sauce()`: o molho cai 0,07 depois da borda da carne, sobre o bacon, e a faixa sob o pão fica mais grossa, como na foto;
  - ketchup e maionese não mudam.
- Teste novo, em `tests/stacker-duplo-bacon.spec.js`: arrastar o bacon aberto até a Bandeja o retira, nos dois projetos. Ele já passava no modelo simples e guarda a área de toque e de arrasto do modelo novo. O teste das áreas de toque (pelo menos 24 × 44 px, sem sobreposição) segue verde.
- Primeiro quadro: `npm run test:orcamento` (contra o build) passou nas duas execuções, uma antes e outra depois do ajuste do molho. Com CPU 4x, a mediana do Whopper foi 911 ms e depois 1316 ms (limite 3 s); esse quadro já espera todas as texturas, inclusive a do bacon. A segunda execução veio logo depois da suíte completa, e a troca para o Cheddar Duplo, que este ticket não toca, também subiu (192 para 266 ms). Por isso a diferença parece variação da máquina.
- Medição avulsa da troca para o Stacker (CPU 4x, mediana de 7, a medição formal fica para o ticket 04):
  - primeira troca, que modela o bacon: 505 ms (antes, 379 ms);
  - trocas seguintes: 263 ms (antes, 243 ms).
- Capturas em `capturas/02/` (desktop e 390 × 844, hero, montado e aberto). `revisao-lado-a-lado.png` mostra o montado e o aberto ao lado da foto oficial.
- Fica para a revisão do 03:
  - o bacon da foto é mais crespo e volumoso, e a tira da frente fica mais visível;
  - as ondas do modelo podem passar um pouco da altura da Camada (0,12), entrando no molho, sem defeito visível nas capturas;
  - o pão superior da foto é mais alto.
