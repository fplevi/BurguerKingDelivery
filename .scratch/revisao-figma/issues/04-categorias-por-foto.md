# 04: Acompanhamentos, Bebidas e Sobremesas

**What to build:** as três categorias usam um modelo de página só de foto (Figma `40-509`, `49-1104`, `127-2594`, card `84-1283`): título, foto, descrição, card com Quantidade, Total do item e Adicionar ao carrinho, grade "Escolha seu acompanhamento / sua bebida / sua sobremesa" com "Selecionado". A navegação troca o conteúdo na mesma página por hash; cada categoria lembra o produto selecionado e a Personalização do hambúrguer continua ao voltar. Produtos iniciais: Batata Frita, Coca-Cola, BK Mix de Brownie. Fotos em `Assets/{sides,drinks,desserts}/official` (BK Mix Crocante = `site_BK_Mix_Ovomaltine.png`); nomes e ordem do Figma. Preços ilustrativos: os do Figma e, para os demais, pesquisados na internet; nunca "Consultar preço". Funciona nos três layouts do ticket 03. Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** 03.

**Status:** resolved

- [x] Modelo de página por foto, nos três layouts
- [x] Navegação por hash e memória da seleção por categoria
- [x] Todos os produtos com foto, nome, descrição e preço
- [x] Adicionar ao carrinho com quantidade; Item idêntico soma
- [x] Fotos das sobremesas commitadas
- [x] Testes Playwright

## Answer

As três categorias saem de `prototype/src/products.js`, no espírito de `ingredients.js`: título da grade, produto inicial e os produtos na ordem do Figma (8 acompanhamentos, 7 bebidas, 8 sobremesas), cada um com nome (grade e carrinho), título do hero (quebra de linha como no Figma: "Coca-Cola / Original", "BK® Mix / de Brownie"), descrição, preço, foto e a área desenhada da foto. Nada fora dele cita esses produtos.

- **Página:** o mesmo hero e o mesmo card do hambúrguer; nas categorias de foto, o palco 3D, Ver ingredientes e o bloco do Combo (`#combo-options`) ficam `hidden`, e a foto (`#product-photo`, com `alt` = título) aparece no lugar do 3D, com a descrição abaixo. O card fica como o `84-1283`: Quantidade, Total do item, Adicionar ao carrinho. As margens transparentes das fotos são cortadas com `object-view-box` (área calculada pelo canal alfa de cada arquivo; arquivos preservados), como o recorte do Figma; fora do Chrome/Edge a foto aparece com as margens. O título não quebra dentro da linha: se uma linha passa da coluna, o título encolhe para caber (`fitTitle`).
- **Navegação:** `#hamburgueres` (ou qualquer outro hash), `#acompanhamentos`, `#bebidas`, `#sobremesas`; o link ativo tem `aria-current="page"`, e no celular a aba ativa rola para a vista. Voltar do navegador troca a categoria. Ao trocar, a coluna lateral de 1920 volta ao topo.
- **Estado:** o reducer ganhou `category` e `picks` (produto e Quantidade de cada categoria de foto). `select`, `qty` e `add` agem na categoria aberta; o hambúrguer (Receita, Personalização aplicada, Combo, bebida, Quantidade) não é tocado ao trocar de categoria, e as cenas 3D continuam montadas (o palco escondido mede 0 e volta a desenhar ao reaparecer). Escolher outro produto ou adicionar volta a Quantidade a 1, mantendo o produto.
- **Carrinho:** Items de foto têm o mesmo formato (sem Personalização nem Combo), então a regra do ticket 01 vale: nome × quantidade e total, e um Item idêntico soma. O toast diz "Adicionado ao carrinho: <nome>" (neutro: Batata Frita, Coca-Cola…).
- **Fotos e fontes:** `Assets/desserts/official/SOURCES.md` novo (as 8 da grade e as 3 fora dela); `Assets/sides/official/SOURCES.md` não fala mais em "Consultar preço".

Preços (ilustrativos; o Figma só mostra Batata Frita R$ 9,90, Coca-Cola R$ 9,90 e BK® Mix de Brownie R$ 23,90, e os demais seguem a mesma escala):

| Produto | Preço | Base |
| --- | --- | --- |
| Esferas do Dragão de Pepperoni | R$ 19,90 | sem preço público (promoção Dragon Ball de set/2026); estimado |
| Batata Frita | R$ 9,90 | Figma |
| Balde de Batata | R$ 24,90 | 99Food, BK Rua do Ouvidor (RJ): R$ 24,99 |
| Onion Rings | R$ 15,90 | 99Food, BK Rua do Ouvidor e Paulo Faccini (SP): média R$ 15,99 |
| BK Chicken | R$ 10,90 | 99Food, BK Rua do Ouvidor: 10 BK Chicken + molho R$ 10,90 |
| Molhão Baconese, Cebola Crispy, Molhão Maionese Cítrica | R$ 4,90 | sem preço avulso encontrado; estimado |
| Coca-Cola, Coca-Cola Zero, Sprite, Fanta Laranja | R$ 9,90 | Figma (Coca-Cola); latas pelo mesmo preço (no 99Food, Sprite lata a R$ 16,99 em Curitiba) |
| Natural One Laranja e Uva | R$ 12,90 | 99Food, Curitiba e Campinas: R$ 18,90; na escala do Figma |
| Água de Copo | R$ 5,90 | estimado |
| BK® Mix Nutella® com Brownie, Leite em Pó com Nutella®, Cookies com Nutella® | R$ 27,90 | 99Food, BK Rod. Papa João Paulo II (BH): BK Mix Nutella R$ 20,90 contra Brownie R$ 16,90; mesma proporção sobre os R$ 23,90 do Figma |
| BK® Mix Biscoff® | R$ 25,90 | estimado entre o Brownie e os de Nutella |
| BK® Mix de Brownie | R$ 23,90 | Figma |
| BK® Mix Crocante | R$ 23,90 | 99Food (BH): BK Mix Ovomaltine R$ 16,90, igual ao Brownie |
| Sundae de Chocolate, Sundae de Doce de Leite | R$ 12,90 | sem preço atual encontrado; estimado |

Fontes: [99Food, BK Rua do Ouvidor](https://99app.com/99food/rio-de-janeiro/burger-king-rua-do-ouvidor/5764608144249196532/), [99Food, BK Paulo Faccini](https://99app.com/99food/sao-paulo/burger-king-paulo-faccini/5764608598181937297/), [99Food, BK Shop Curitiba](https://99app.com/99food/curitiba/burger-king-shop-curitiba/5764608540493481315/), [99Food, BK Pedro Jacomel](https://99app.com/99food/curitiba/burger-king-pedro-jacomel/5764608376219370820/), [99Food, BK Rod. Papa João Paulo II](https://99app.com/99food/belo-horizonte/burger-king-rod-papa-joao-paulo-ii-3614/5764613992224654893/), consultados por busca em 10/10/2026 (as páginas não abriram diretamente: HTTP 429). Os preços variam por loja; o cardápio oficial não publica preços.

Descrições: as do Figma para os três produtos iniciais; as demais foram escritas no mesmo tom (o Figma só mostra a do produto selecionado).

Testes: `prototype/tests/categorias.spec.js` (Bebidas pela navegação, ida e volta mantendo seleções e o Cheddar Duplo personalizado com Combo e Quantidade, hash ao carregar e voltar do navegador, carrinho com quantidade e soma, os 23 produtos com foto, descrição e preço, layouts em 390, 1280 e 1920). Capturas em `.scratch/revisao-figma/capturas/04/` (cada categoria em 390 × 844, 1280 × 800 e 1920 × 1080).

Em aberto: as descrições e a maior parte dos preços não vêm do Figma; em 1920, "Escolha seu acompanhamento" quebra em duas linhas na coluna de 622px (as outras duas cabem).
