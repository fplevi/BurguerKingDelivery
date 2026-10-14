# 01: Rodeio Duplo selecionável (tracer bullet)

**What to build:** o card "Rodeio Duplo" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 36,90), descrição ("Pão com gergelim, duas carnes grelhadas, queijo derretido, molho barbecue, onion rings crocantes e maionese.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Queijo, Carne grelhada (girada), Molho barbecue, Onion rings, Maionese, Pão superior; Base = pães e as duas carnes. Queijo e Maionese reaproveitam os modelos do Whopper sem mudança. O Molho barbecue é uma nova configuração do modelo de molho: marrom-escuro, brilhante, sobre a carne de cima e escorrendo na borda. Os Onion rings ainda são uma forma simples (dois toros dourados lado a lado). Proporções (espessura das carnes, altura do pão superior, quanto barbecue, onion rings e maionese aparecem) já tiradas de `site_Rodeio_Duplo.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVGs simples de Molho barbecue e Onion rings; Queijo e Maionese reaproveitam as ilustrações do Whopper. Spec: `.scratch/rodeio-duplo/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/rodeio-duplo`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 4 cards seguem "Em breve" e não trocam o hero
- [x] Ver ingredientes lista as 8 Camadas na ordem da Receita
- [x] Queijo, Molho barbecue, Onion rings e Maionese são retiráveis um por vez e juntos; pães e carnes não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [x] Voltar ao Whopper, ao Cheddar Duplo ou ao Stacker Duplo Bacon não deixa resto do Rodeio Duplo
- [x] Fallback SVG com WebGL desativado mostra as 8 Camadas e permite personalizar
- [x] `tests/rodeio-duplo.spec.js` no molde de `tests/cheddar-duplo.spec.js`, verde; `tests/layout.spec.js` deixa de esperar "Em breve" só no Rodeio Duplo; demais testes sem mudança de comportamento
- [x] Captura montada no desktop ao lado da foto oficial confere as proporções (carnes, queijo, barbecue e onion rings; maionese e pão superior ficam para a revisão, ver Answer)

## Answer

- `src/ingredients.js`: Receita `rodeioDuplo` (R$ 36,90 provisório): `bottom`, `meat`, `cheese` (Queijo do Whopper), `meat2` (Carne grelhada, modelo `meat`, `turn` 1,9), `bbqSauce` (Molho barbecue), `onionRings` (Onion rings), `mayo` (Maionese do Whopper), `top`; Base: pães e as duas carnes. A descrição sai dos textos das Camadas: "Pão com gergelim, duas carnes grelhadas, queijo derretido, molho barbecue, onion rings crocantes e maionese."
- `main.js`: o card da grade aponta para a Receita. A cena, Ver ingredientes, a Bandeja, o Carrinho e a Entrada e Saída não mudaram.
- `layer-models.js`:
  - `onionRings` é a forma simples: dois toros dourados lado a lado, quase se tocando no centro, passando um pouco da borda da carne (alcance ~1,12 contra 1,05 da carne). Ficam um pouco mais altos que uma carne (0,26 contra 0,18), como na foto, para a faixa aparecer sob a aba do pão. Sem receita de textura até o ticket 02 (`texture-recipes.js` entra lá).
  - `bbqSauce` é uma nova configuração de `sauce()`: marrom-escuro, brilhante, uma poça larga sobre a carne de cima e gotas até a borda, caindo um pouco (`drip`).
  - **Correção fora do escopo, mas necessária:** `layerModels.cheese.build` era a própria `cheese()`, que desde o Stacker (76e2e63) recebe a cor como parâmetro; a cena chama `build(camada)`, então a Camada virava a cor e o Three.js pintava o queijo de branco. Isso valia também para o Whopper na `main`. Agora é `build: () => cheese()`, e o queijo volta ao amarelo aprovado.
- `art.js`: SVGs de Molho barbecue (faixa contínua, como o Molho Stacker, para o clique não cair no hambúrguer de trás) e Onion rings (dois anéis com o barbecue pintado no furo, pelo mesmo motivo).
- Testes: `tests/rodeio-duplo.spec.js` (17 casos × 2 projetos); `tests/layout.spec.js` agora tem 4 hambúrgueres sem Receita; `prototype/README.md` atualizado.
- Capturas em `capturas/01/` (desktop e 390 × 844, hero, montado e aberto) e `revisao-lado-a-lado.png` com a foto oficial.
- Em aberto, para o ticket 02 e a revisão do 03:
  - os onion rings ainda são lisos e alaranjados; a foto tem empanado grosso e irregular;
  - a maionese da foto é bem mais grossa e aparece como faixa branca sob o pão; aqui quase não aparece no montado. A spec manda reaproveitar a do Whopper sem mudança e só mexer no volume se a revisão pedir, então essa proporção fica para o 03;
  - o barbecue aparece como poças escuras na frente da carne de cima, sem uma faixa contínua escorrendo como na foto;
  - o pão superior da foto é mais alto e mais claro;
  - os quadros da Entrada e da Saída (`npm run quadros-entrada -- rodeioDuplo`, com `npm run dev`) ficam para a revisão do 03.
