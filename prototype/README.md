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
| `npm run test:orcamento` | Só as medições de orçamento (`tests/orcamento.spec.js`), uma por vez, contra o build: peso gzip da parte 3D, primeiro quadro e quadros por segundo |

Os testes sobem o próprio servidor na porta 4173 (mude com `PW_PORT`). O Chrome headless usa WebGL por hardware (ANGLE) nesta máquina; o teste de fallback desativa o WebGL de propósito. Para usar um Chromium já instalado (por exemplo, numa CI ou num container), aponte `PW_EXECUTABLE` para o binário: a configuração libera o WebGL por software (`--enable-unsafe-swiftshader`). Com renderização por software, a suíte leva bem mais tempo (cerca de 14 minutos), e os limites de tempo dos testes ficam maiores só nesse caso. Relatórios e traces de falhas ficam em `test-results/`, fora do Git.

## Estrutura

- `index.html`: marcação da página.
- `src/main.js`: renderização, eventos, arrasto, abrir/fechar Alterar ingredientes, carrinho. Não conhece Three.js.
- `src/scene/burger-scene.js`: módulo de cena do hambúrguer (Three.js/WebGL): um contexto por palco, câmera ~15° acima, luz do alto à esquerda, sombras de contato, transições abrir/compactar e a área na tela de cada camada, usada para posicionar os botões invisíveis.
- `src/scene/layer-models.js`: modelo 3D de cada camada: perfis torneados e folhas polares com ruído, cor por vértice, gergelim, fatias e anéis unidos numa malha por camada.
- `src/scene/noise.js`: ruído determinístico (semente fixa), usado pelos modelos e pelas texturas.
- `src/scene/texture-recipes.js`: receitas das texturas geradas por código (miolo, carne grelhada, grão da casca, tomate, picles, alface, sombra de contato), sem Three.js nem DOM. Nenhuma imagem de ingrediente é baixada.
- `src/scene/texture-worker.js` e `src/scene/textures.js`: as receitas são pintadas em dois Web Workers enquanto a página monta a geometria e compila os shaders; `textures.js` entrega as texturas e avisa quando estão prontas (sem workers, pinta na própria página).
- `src/state.js`: reducer (fonte de verdade), preços.
- `src/ingredients.js`: as 10 camadas do Whopper (receita brasileira), de baixo para cima, e quais formam a Base.
- `src/art.js`: ilustrações SVG de cada camada, usadas como fallback quando não há WebGL.
- `src/styles.css`: estilos.
- `tests/`: testes Playwright; `tests/support.js` localiza elementos por papéis e rótulos acessíveis.
- `Assets/catalog/`: quatro fotos estáticas da grade, importadas pelo Vite. Fontes em `Assets/catalog/SOURCES.md`.

## Sobre o protótipo

Pergunta: uma visão frontal em camadas permite abrir o hambúrguer, retirar e restaurar ingredientes e aplicar a personalização de forma compreensível?

Inclui um Whopper desenhado em 3D com Three.js, com as 10 camadas modeladas por código (ilustrações SVG quando não há WebGL), abertura em tela inteira, retirada por toque, teclado ou arrasto para a bandeja, reposição pela imagem do ingrediente na bandeja ou pelos chips, aplicar/cancelar, combo P/M/G e carrinho em memória. Os outros produtos são placeholders.

Hipóteses provisórias: pão e carne fixos; retirada sem desconto; aplicar confirma, cancelar descarta.

Cobertura automatizada (`tests/`): abrir Alterar ingredientes; retirar por camada, teclado, arrasto até a bandeja e chips; arrasto 3D (a camada acompanha o cursor, a bandeja reage, soltar fora devolve, a Base não arrasta); recolocar pelos chips; imagem do ingrediente retirado na bandeja, recolocar por ela (toque e teclado) e sincronia com os chips; Recolocar todos; Base não retirável; ordem das 10 camadas; retirar só o ketchup mantendo a maionese; aplicar atualiza o texto do hero; cancelar (botão, ✕, Esc) preserva a personalização anterior; combo e tamanho; item personalizado no carrinho; cena 3D no hero e em Alterar ingredientes, hero sem os ingredientes retirados e mais baixo, compactação ao aplicar, área de toque própria para cada camada aberta, movimento reduzido sem animações nem inclinação, inclinação 3D pelo ponteiro (desktop) e pelo arrasto na área vazia (toque, sem pedido de permissão), fallback SVG com WebGL desativado. Arrasto por toque, inclinação pela orientação do aparelho (Android) e desempenho ainda precisam de validação em aparelho físico.

O código é experimental e não deve ser promovido diretamente a produção.
