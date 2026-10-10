# Playground de ingredientes — protótipo

Protótipo da tela Ver ingredientes, construído com npm + Vite e testado com Playwright.

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
- `src/main.js`: renderização, grade de produtos, eventos, arrasto, abrir/fechar Ver ingredientes, carrinho. Escolher outro produto descarta as cenas e os botões das camadas e os recria a partir da Receita dele (uma cena por palco). Não conhece Three.js.
- `src/scene/burger-scene.js`: módulo de cena do hambúrguer (Three.js/WebGL): um contexto por palco, câmera ~15° acima, luz do alto à esquerda, sombras de contato, transições abrir/compactar e a área na tela de cada camada, usada para posicionar os botões invisíveis.
- `src/scene/layer-models.js`: modelo 3D de cada camada: perfis torneados e folhas polares com ruído, cor por vértice, gergelim, fatias e anéis unidos numa malha por camada. A geometria de cada camada é gerada uma vez por página e compartilhada pelas cenas (cada cena tem seus materiais e texturas), então trocar de produto não modela tudo de novo. O cheddar do Cheddar Duplo (`cheddar`, um corpo grosso de borda arredondada, um pouco maior que a carne e com contorno levemente irregular, escorrendo pelas bordas como uma calda: cada escorrido sai da borda por curvas suaves, afina num pescoço e termina numa gota redonda, sem passar da altura da carne, tudo na mesma malha lisa; cada Camada com seu contorno e seus fios, por semente fixa no id) é separado do queijo do Whopper (`cheese`); a cebola crispy (`crispyOnion`) é só farelos e fios curtos soltos, em montinhos com vãos onde o cheddar aparece, sem corpo contínuo.
- `src/scene/noise.js`: ruído determinístico (semente fixa), usado pelos modelos e pelas texturas.
- `src/scene/texture-recipes.js`: receitas das texturas geradas por código (miolo, carne grelhada, grão da casca, tomate, picles, alface, cebola frita, sombra de contato), sem Three.js nem DOM. Nenhuma imagem de ingrediente é baixada.
- `src/scene/texture-worker.js` e `src/scene/textures.js`: as receitas são pintadas em dois Web Workers enquanto a página monta a geometria e compila os shaders; `textures.js` entrega as texturas e avisa quando estão prontas (sem workers, pinta na própria página).
- `src/state.js`: reducer (fonte de verdade, inclusive o produto selecionado e o card de compra), preços, Combo (+ R$ 12,00) e as bebidas do combo; um Item idêntico soma na quantidade do que já está no carrinho.
- `src/ingredients.js`: a Receita de cada produto (Whopper, com as 10 camadas da receita brasileira, e Cheddar Duplo, com 7: duas carnes, dois cheddars e cebola crispy): camadas de baixo para cima, quais formam a Base, modelo de cada camada (duas camadas podem compartilhar um), nome, o trecho de cada camada na descrição e preço. A descrição do hero junta os trechos das camadas presentes, de baixo para cima, conforme a Personalização aplicada (um trecho repetido, como o dos dois cheddars, sai uma vez só). Nada fora dela cita um produto.
- `src/art.js`: ilustrações SVG de cada camada, usadas como fallback quando não há WebGL.
- `src/styles.css`: estilos.
- `tests/`: testes Playwright; `tests/support.js` localiza elementos por papéis e rótulos acessíveis.
- `Assets/burgers/official/`: as oito fotos oficiais da grade, importadas pelo Vite. Fontes em `Assets/burgers/official/SOURCES.md`. `Assets/catalog/` (fotos antigas) fica no repositório, fora da grade.

## Sobre o protótipo

Pergunta: uma visão frontal em camadas permite abrir o hambúrguer, retirar e restaurar ingredientes e aplicar a personalização de forma compreensível?

Inclui o Whopper e o Cheddar Duplo desenhados em 3D com Three.js, com as camadas modeladas por código (ilustrações SVG quando não há WebGL), escolhidos na grade de fotos oficiais (trocar de produto ou adicionar ao carrinho volta o card ao padrão: sem Combo, sem bebida, Quantidade 1, sem Personalização; o carrinho continua), abertura em tela inteira, retirada por toque, teclado ou arrasto para a bandeja, reposição pela imagem do ingrediente na bandeja ou pelos chips, aplicar/cancelar, card de compra do Figma (Combo + R$ 12,00 com Bebida do combo obrigatória, Quantidade) e carrinho em memória (nome × quantidade, Combo · bebida, Sem: …, total). Os outros 6 produtos da grade são placeholders ("Em breve neste protótipo").

Hipóteses provisórias: pão e carne fixos; retirada sem desconto; aplicar confirma, cancelar descarta.

Cobertura automatizada (`tests/`): abrir Ver ingredientes; retirar por camada, teclado, arrasto até a bandeja e chips; arrasto 3D (a camada acompanha o cursor, a bandeja reage, soltar fora devolve, a Base não arrasta); recolocar pelos chips; imagem do ingrediente retirado na bandeja, recolocar por ela (toque e teclado) e sincronia com os chips; Recolocar todos; Base não retirável; ordem das 10 camadas; retirar só o ketchup mantendo a maionese; aplicar tira da descrição do hero o que foi retirado (com tudo retirado, só pão e carne); cancelar (botão, ✕, Esc) preserva a personalização anterior; Combo + R$ 12,00 sem tamanhos; Bebida do combo desabilitada sem Combo e vazia por padrão; erro e foco ao adicionar combo sem bebida; Quantidade multiplica o total; item personalizado no carrinho; volta ao padrão depois de adicionar e ao trocar de hambúrguer; Item idêntico soma no carrinho; cena 3D no hero e em Ver ingredientes, hero sem os ingredientes retirados e mais baixo, compactação ao aplicar, área de toque própria para cada camada aberta, movimento reduzido sem animações nem inclinação, inclinação 3D pelo ponteiro (desktop) e pelo arrasto na área vazia (toque, sem pedido de permissão), fallback SVG com WebGL desativado; grade com as 8 fotos oficiais; Cheddar Duplo (`tests/cheddar-duplo.spec.js`): troca do hero, 7 camadas na ordem, retirar cada cheddar e a cebola crispy, "cheddar cremoso" só sai da descrição com os dois cheddars retirados, área de toque própria de cada camada aberta (sem sobreposição, pelo menos 24 × 44 px), Base com as duas carnes, aplicar/cancelar, bandeja, carrinho, volta ao Whopper sem resto do outro produto, cards "Em breve" e fallback SVG. Arrasto por toque, inclinação pela orientação do aparelho (Android) e desempenho ainda precisam de validação em aparelho físico.

O código é experimental e não deve ser promovido diretamente a produção.
