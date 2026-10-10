# 01: Receita por produto

**What to build:** a lista de camadas deixa de estar fixa no Whopper e passa a ser a Receita de cada produto: ordem das camadas de baixo para cima, nomes, quais formam a Base, título, descrição e preço. Estado, cena, botões DOM, chips, bandeja, fallback SVG (`closedPositions`, `art.js`) e textos ("Personalize seu Whopper") leem a Receita do produto selecionado. Nenhuma mudança visível: o Whopper continua o único produto e idêntico ao de hoje. É o prefactor que abre espaço para o segundo hambúrguer. Spec: `.scratch/cheddar-duplo/spec.md`; leia antes `docs/agents/novo-hamburguer.md`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `GLOSSARY.md`: termo **Receita** e **Base** como "pães e carnes" (antes do código)
- [x] Uma Receita por produto; o Whopper é a única, com as 10 camadas atuais
- [x] Camada repetida na mesma Receita é permitida (id único por camada, modelo compartilhado)
- [x] Nada fora da Receita cita o Whopper (textos, espessuras do fallback SVG, estado)
- [x] `npm test` e `npm run test:build` verdes, sem alterar o comportamento testado do Whopper
- [x] Capturas do hero e de Alterar ingredientes idênticas às de antes (diferença ≤ 1/255 por pixel)

## Answer

- `src/ingredients.js` exporta `recipes` (por ora só `whopper`): id, nome, nome curto, descrição, preço e camadas de baixo para cima. Cada camada tem `id` (único na Receita), `name`, `model` (padrão: o id; duas camadas podem compartilhar um modelo), `locked` (Base) e, só para o fallback SVG, `y` e `thickness` (antes fixos em `closedPositions`).
- O estado ganhou `product` (padrão `whopper`); o reducer consulta a Base e o preço na Receita selecionada; o item do carrinho guarda o produto.
- `createBurgerScene(stage, { recipe, ... })` monta as camadas a partir da Receita; `layerModels` passou a ser indexado pelo modelo.
- `index.html` não traz mais título, preço, descrição nem "Personalize seu Whopper"; `render()` os preenche a partir da Receita. Textos do carrinho, do rodapé de Alterar ingredientes e do aviso de item adicionado também vêm dela.
- Ainda citam o Whopper, de propósito, só a grade antiga (`products` em `main.js`) e a nota "Apenas o Whopper está disponível" em `index.html`: o ticket 02 substitui ambos.
- Verificação: 16 capturas antes e depois (desktop e 390 × 844; 3D e SVG; montado, aberto, com queijo e tomate retirados, aplicado), com diferença máxima de 0/255 por pixel. Uma cena montada no navegador com Receita `pão, carne, cheddar, carne, cheddar, pão` deu uma área própria a cada carne e escondeu só o cheddar retirado. `npm test` e `npm run test:build`: 74 passaram, 4 ignorados (os mesmos de antes).
