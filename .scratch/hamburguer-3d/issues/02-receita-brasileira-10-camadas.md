# 02: Receita brasileira: 10 camadas e novo título

**What to build:** ainda em SVG, o Whopper passa a seguir a receita brasileira: "Molho" vira duas camadas removíveis, Ketchup e Maionese, e as camadas seguem a ordem real, de baixo para cima: pão inferior, carne, queijo, picles, ketchup, cebola, tomate, alface, maionese, pão superior. O título de Alterar ingredientes passa a ser "O seu hambúrguer do seu jeito"; o botão do hero continua "Remover ingredientes".

**Blocked by:** 01.

**Status:** resolved

- [x] 10 camadas na ordem acima; Base = pão inferior, carne, pão superior
- [x] Ketchup e Maionese retiráveis e recolocáveis independentemente, com chips próprios
- [x] Textos do hero, do estado e do carrinho usam os novos nomes
- [x] Título "O seu hambúrguer do seu jeito"
- [x] Testes Playwright atualizados, incluindo retirar só o ketchup mantendo a maionese

## Answer

- `src/ingredients.js` (agora formatado) tem as 10 camadas na ordem da receita brasileira: pão inferior, carne, queijo, picles, ketchup, cebola, tomate, alface, maionese, pão superior. Base inalterada (`bottom`, `meat`, `top`). Ids novos: `ketchup` e `mayo` (o `sauce` deixou de existir).
- `src/art.js`: ketchup e maionese reutilizam o mesmo traço de molho em SVG, com cores próprias (vermelho e creme). `main.js`: espessuras do hero para `ketchup` e `mayo` (4 px cada).
- Título de Alterar ingredientes: "O seu hambúrguer do seu jeito"; botão do hero continua "Remover ingredientes". Descrição do hero lista os ingredientes na nova ordem; nota do hero, estado e carrinho usam os nomes novos via `name()`.
- Playwright: helper `alterarIngredientes` localiza o diálogo pelo novo título (constante `TITULO` em `tests/support.js`); testes de Molho trocados por Ketchup/Maionese; novos testes: ordem das 10 camadas abertas (de baixo para cima) e dos chips, e retirar só o ketchup mantendo a maionese (e o inverso). Mutação (trocar ketchup e cebola) derruba o teste de ordem. 17 testes × 2 projetos = 34 verdes em `npm test` e `npm run test:build`.
- Capturas desktop e 390 × 844 conferidas: título cabe em duas linhas no celular; molhos distinguíveis.
