# 02: Mostarda

**What to build:** a Camada Mostarda entra na Receita do Cheeseburger Duplo, entre o Ketchup e o Pão superior, retirável, com nome "Mostarda". Modelo novo `mustard` em `layer-models.js`: um fio fino e irregular em zigue-zague, amarelo-mostarda, mais fino que o ketchup, por cima dele e sem escorrer pela borda. Pode partir da geometria do `ketchup`, mas como modelo próprio: o `ketchup` aprovado não muda. De preferência, reaproveite o material do ketchup com outra cor, sem receita de textura nova; se precisar de uma, ela vai para o worker mais leve (`shares` em `textures.js`; no ticket 02 do Rodeio Duplo, 14 ms a mais no worker da carne bastaram para `tests/cena-3d.spec.js:104` falhar de vez em quando). A descrição passa a ser "Pão com gergelim, duas carnes grelhadas, queijo derretido, picles, ketchup e mostarda." Sem WebGL: SVG de um fio amarelo. Spec: `.scratch/cheeseburger-duplo/spec.md`.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Ver ingredientes lista as 9 Camadas na ordem da Receita, com a Mostarda entre o Ketchup e o Pão superior
- [ ] A Mostarda é retirável sozinha e junto das outras; "Sem mostarda" aparece no Carrinho
- [ ] A Mostarda parece um fio amarelo fino, não uma mancha nem um disco; não escorre pela borda
- [ ] O ketchup do Whopper e dos outros hambúrgueres não mudou
- [ ] Fallback SVG mostra a Mostarda
- [ ] `tests/cheeseburger-duplo.spec.js` cobre a Mostarda; `tests/cena-3d.spec.js` estável na suíte completa
