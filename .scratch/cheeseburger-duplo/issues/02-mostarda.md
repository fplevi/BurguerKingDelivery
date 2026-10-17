# 02: Mostarda

**What to build:** a Camada Mostarda entra na Receita do Cheeseburger Duplo, entre o Ketchup e o Pão superior, retirável, com nome "Mostarda". Modelo novo `mustard` em `layer-models.js`: um fio fino e irregular em zigue-zague, amarelo-mostarda, mais fino que o ketchup, por cima dele e sem escorrer pela borda. Pode partir da geometria do `ketchup`, mas como modelo próprio: o `ketchup` aprovado não muda. De preferência, reaproveite o material do ketchup com outra cor, sem receita de textura nova; se precisar de uma, ela vai para o worker mais leve (`shares` em `textures.js`; no ticket 02 do Rodeio Duplo, 14 ms a mais no worker da carne bastaram para `tests/cena-3d.spec.js:104` falhar de vez em quando). A descrição passa a ser "Pão com gergelim, duas carnes grelhadas, queijo derretido, picles, ketchup e mostarda." Sem WebGL: SVG de um fio amarelo. Spec: `.scratch/cheeseburger-duplo/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Ver ingredientes lista as 9 Camadas na ordem da Receita, com a Mostarda entre o Ketchup e o Pão superior
- [x] A Mostarda é retirável sozinha e junto das outras; "Sem mostarda" aparece no Carrinho
- [x] A Mostarda parece um fio amarelo fino, não uma mancha nem um disco; não escorre pela borda
- [x] O ketchup do Whopper e dos outros hambúrgueres não mudou
- [x] Fallback SVG mostra a Mostarda
- [x] `tests/cheeseburger-duplo.spec.js` cobre a Mostarda; `tests/cena-3d.spec.js` estável na suíte completa

## Answer

- Receita `cheeseburgerDuplo` com a Camada `mustard` ("Mostarda", texto "mostarda") entre o Ketchup e o Pão superior; SVG do Pão superior subiu 3 px.
- Modelo `mustard` em `layer-models.js`: tubo achatado ao longo de uma curva em zigue-zague (cantos a ~0,9 do centro, aquém do alcance do ketchup), espessura irregular, pontas arredondadas, sem escorrer. Material: o dos molhos (`sauceMaterial`, extraído de `sauce()` sem mudar o resultado do ketchup, da maionese e dos outros) em amarelo-mostarda; nenhuma receita de textura nova.
- Fallback SVG: fio amarelo em zigue-zague (`art.js`).
- `tests/cheeseburger-duplo.spec.js` cobre as 9 Camadas, a Mostarda retirável sozinha e junto, "Sem queijo superior, picles e mostarda" no Carrinho e o SVG.
- Suíte completa: 715 passaram e 10 falharam por colisão com outra execução do Playwright na mesma pasta (ENOENT em `test-results/`, porta 4173); os 7 arquivos afetados mais `cena-3d.spec.js`, de novo contra o build: 196/196.
- Para o 03: no hambúrguer montado a Mostarda fica escondida sob o pão superior (o ketchup também quase não aparece). Quanto ela deve aparecer se decide ao lado da foto oficial.
