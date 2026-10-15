# 01: Rodeio selecionável

**What to build:** o card "Rodeio" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 29,90), descrição ("Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Queijo, Molho barbecue, Onion ring, Maionese, Pão superior; Base = pães e a carne. Queijo, Molho barbecue e Maionese reaproveitam os modelos existentes sem mudança. O Onion ring é uma variante de um anel do modelo de onion rings do Rodeio Duplo: centralizado, raio menor (cerca de metade da largura da carne), mesma textura de empanado, sem receita de textura nova; o Rodeio Duplo continua com dois anéis, sem mudança. Proporções (espessura da carne, altura do pão superior, quanto queijo, barbecue, onion ring e maionese aparecem) já tiradas de `site_Rodeio.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVG simples de um anel para o Onion ring; o resto reaproveita as ilustrações existentes. Spec: `.scratch/rodeio/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/rodeio`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 3 cards seguem "Em breve" e não trocam o hero
- [x] Ver ingredientes lista as 7 Camadas na ordem da Receita
- [x] Queijo, Molho barbecue, Onion ring e Maionese são retiráveis um por vez e juntos; pães e carne não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [x] Voltar aos outros quatro hambúrgueres não deixa resto do Rodeio; o Rodeio Duplo segue com dois anéis
- [x] Fallback SVG com WebGL desativado mostra as 7 Camadas e permite personalizar
- [x] `tests/rodeio.spec.js` no molde de `tests/rodeio-duplo.spec.js`, verde; `tests/layout.spec.js` deixa de esperar "Em breve" só no Rodeio; demais testes sem mudança de comportamento
- [x] Captura montada no desktop ao lado da foto oficial confere as proporções

## Answer

- `src/ingredients.js`: Receita `rodeio` (R$ 29,90 provisório): `bottom`, `meat`, `cheese` (Queijo do Whopper), `bbqSauce` (Molho barbecue do Rodeio Duplo), `onionRing` (Onion ring), `mayo` (Maionese do Whopper), `top`; Base: pães e a carne. A descrição sai dos textos das Camadas: "Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese." O `y`/`thickness` do SVG seguem a foto (uma carne, maionese mais grossa).
- `main.js`: o card da grade aponta para a Receita. Cena, Ver ingredientes, Bandeja, Carrinho, Entrada e Saída não mudaram.
- `layer-models.js`: `breadedRing` ganhou `radius` e `width` com os valores do par como padrão, então os onion rings do Rodeio Duplo têm a mesma geometria. `onionRing` é um anel só, centralizado, com 0,53 até a borda de fora (~1,06 de largura, metade da carne de 2,1) e a mesma seção, os mesmos grumos e o mesmo empanado (`breading`, material extraído em `breadingMaterial()`). Sem receita de textura nova. A parede é mais fina (0,11 contra 0,155): com a do par, sozinho no meio, os grumos fechavam o furo e o anel parecia um disco.
- `art.js`: SVG de um anel só, centralizado.
- Testes: `tests/rodeio.spec.js` (18 casos × 2 projetos, no molde do Rodeio Duplo, incluindo a volta aos outros quatro); `tests/layout.spec.js` agora tem 3 hambúrgueres sem Receita; `prototype/README.md` atualizado.
- Capturas em `capturas/01/` (desktop e 390 × 844, hero, montado e aberto) e `revisao-lado-a-lado.png` com a foto oficial: uma carne, queijo sobre ela, barbecue, o anel no centro com cerca de metade da largura da carne.
- Em aberto, para a revisão (02) e o orçamento (03):
  - a maionese do Whopper quase não aparece no montado; na foto é uma faixa branca grossa sob o pão. A spec só muda o volume se a revisão pedir;
  - o anel tem quase o tamanho de cada anel do Rodeio Duplo (0,53 contra 0,555), porque cada um deles já tem cerca de metade da largura da carne; o tamanho e a parede mais fina ficam para a revisão confirmar;
  - em `tests/orcamento.spec.js`, a `chave` do Rodeio Duplo é `rodeio`: ao medir o Rodeio no 03, troque-a para `rodeioDuplo` e use `rodeio` para o novo.
