# Playground de ingredientes — protótipo

Protótipo da tela Alterar ingredientes, construído com npm + Vite e testado com Playwright.

## Instalação

Requer Node.js 20.19+ ou 22.12+ (exigência do Vite 8) e Google Chrome instalado. Na pasta `prototype/`:

```sh
npm install
```

Os testes usam o Google Chrome instalado (canal `chrome`), porque o Smart App Control do Windows bloqueia o Chromium baixado por `npx playwright install`. Em outra máquina ou na CI, use `npx playwright install chromium` e `PW_CHANNEL=chromium`.

## Prévia, build e testes

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento do Vite em http://localhost:5173 |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de `dist/` |
| `npm test` | Suíte Playwright contra o servidor de desenvolvimento, em desktop (1280 × 800) e 390 × 844 |
| `npm run test:build` | Mesma suíte contra o build de produção (`vite build` + `vite preview`) |

Os testes sobem o próprio servidor na porta 4173 (mude com `PW_PORT`). Relatórios e traces de falhas ficam em `test-results/`, fora do Git.

## Estrutura

- `index.html`: marcação da página.
- `src/main.js`: renderização, eventos, arrasto, abrir/fechar Alterar ingredientes, carrinho.
- `src/state.js`: reducer (fonte de verdade), preços.
- `src/ingredients.js`: as 10 camadas do Whopper (receita brasileira), de baixo para cima, e quais formam a Base.
- `src/art.js`: ilustrações SVG provisórias de cada camada.
- `src/styles.css`: estilos.
- `tests/`: testes Playwright; `tests/support.js` localiza elementos por papéis e rótulos acessíveis.
- `Assets/catalog/`: quatro fotos estáticas da grade, importadas pelo Vite. Fontes em `Assets/catalog/SOURCES.md`.

## Sobre o protótipo

Pergunta: uma visão frontal em camadas permite abrir o hambúrguer, retirar e restaurar ingredientes e aplicar a personalização de forma compreensível?

Inclui um Whopper ilustrado em SVG, abertura em tela inteira, retirada por toque, teclado ou arrasto para a bandeja, reposição pelos chips, aplicar/cancelar, combo P/M/G e carrinho em memória. Os outros produtos são placeholders.

Hipóteses provisórias: pão e carne fixos; retirada sem desconto; aplicar confirma, cancelar descarta.

Cobertura automatizada (`tests/`): abrir Alterar ingredientes; retirar por camada, teclado, arrasto até a bandeja e chips; recolocar pelos chips; Recolocar todos; Base não retirável; ordem das 10 camadas; retirar só o ketchup mantendo a maionese; aplicar atualiza o texto do hero; cancelar (botão, ✕, Esc) preserva a personalização anterior; combo e tamanho; item personalizado no carrinho. Arrasto por toque e desempenho ainda precisam de validação em aparelho físico.

O código é experimental e não deve ser promovido diretamente a produção.
