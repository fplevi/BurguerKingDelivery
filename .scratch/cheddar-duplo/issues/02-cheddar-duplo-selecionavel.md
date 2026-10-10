# 02: Cheddar Duplo selecionável (tracer bullet)

**What to build:** a grade passa a usar as fotos oficiais de `prototype/Assets/burgers/official/`, com Whopper e Cheddar Duplo selecionáveis e os outros 6 cards como "Em breve neste protótipo" (os cards antigos saem da grade; `Assets/catalog/` fica no repositório). Escolher o Cheddar Duplo troca nome, preço (R$ 34,90), descrição e o hambúrguer 3D do hero, e "Remover ingredientes" abre a versão dele. Receita: pão inferior, carne, Cheddar inferior, carne, Cheddar superior, Cebola crispy, pão superior; Base = pães e as duas carnes. Usa os modelos existentes (carne, queijo, pães); a cebola crispy ainda é uma forma simples. Trocar de produto reinicia a personalização. Combo, P/M/G e carrinho funcionam como no Whopper. Fallback SVG com o fluxo funcionando (SVG simples da cebola crispy). Spec: `.scratch/cheddar-duplo/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Fotos oficiais commitadas e origem registrada (`SOURCES.md`)
- [x] Grade com as 8 fotos oficiais; só Whopper e Cheddar Duplo trocam o hero; "Em breve" nos demais
- [x] Hero troca nome, preço, descrição e 3D; Whopper volta idêntico e sem resto do outro produto
- [x] Alterar ingredientes lista as 7 camadas na ordem; retirar cada cheddar e a cebola crispy, um por vez
- [x] Carnes e pães não são retiráveis; Recolocar todos, aplicar, cancelar e carrinho com os ingredientes retirados
- [x] Fallback SVG com WebGL desativado
- [x] Testes Playwright dos comportamentos acima; `npm test` e `npm run test:build` verdes

## Answer

- Fotos oficiais e `Assets/burgers/official/SOURCES.md` já estavam commitadas (4836988); conferido. A grade usa as 8, com o enquadramento antigo (`object-fit: cover`); `Assets/catalog/` fica no repositório, fora da grade.
- `src/ingredients.js` ganhou a Receita `cheddarDuplo` (R$ 34,90, descrição provisória da spec): `bottom`, `meat`, `cheddar1` (Cheddar inferior, modelo `cheese`), `meat2` (Carne grelhada, modelo `meat`, Base), `cheddar2` (Cheddar superior), `crispyOnion`, `top`.
- Estado: ação `select` troca o produto e reinicia retiradas e rascunho; combo, tamanho e carrinho continuam.
- `main.js`: a grade lista Whopper e Cheddar Duplo (selecionáveis, com "★ Selecionado" no escolhido) e 6 cards "Em breve neste protótipo" (toast, sem trocar o hero). Escolher outro produto descarta as duas cenas (o `dispose()` agora também libera o contexto WebGL), limpa o cache de imagens da bandeja e recria botões de camada e cenas a partir da nova Receita: uma cena por palco. Sem WebGL, só os botões SVG são recriados. A nota do rodapé lista os produtos disponíveis a partir das Receitas.
- Cebola crispy provisória: em 3D, um monte baixo de farelos dourados (`layer-models.js`, sem textura nova); em SVG, um monte com farelos (`art.js`). O realismo fica para o ticket 03; o cheddar usa o queijo do Whopper.
- Testes: `tests/cheddar-duplo.spec.js` (13 casos × 2 projetos): troca do hero, 3D numa cena só, 7 camadas na ordem, retirar cada cheddar e a cebola crispy um por vez, Base com as duas carnes, Recolocar todos/aplicar/cancelar, carrinho com combo G, imagem na bandeja, volta ao Whopper com 10 camadas e sem resto (carrinho mantido), cards "Em breve" e fallback SVG. `tests/pedido.spec.js`: o teste da grade antiga virou o da grade com 8 fotos oficiais. `support.js`: o grupo de chips é achado por "Personalize seu …".
- Verificação: `npm test` e `npm run test:build`: 100 passaram, 4 ignorados (os mesmos de antes). As 16 capturas do Whopper (desktop e 390 × 844; 3D e SVG; montado, aberto, retirados, aplicado) são idênticas às do ticket 01 (diferença máxima 0/255); o hero do Whopper depois de ir ao Cheddar Duplo e voltar difere no máximo 1/255.
- Em aberto: o texto da bandeja "Pão e carne formam a base" ficou igual nos dois produtos (mudá-lo alteraria as capturas do Whopper); vale revisar no ticket 04.
