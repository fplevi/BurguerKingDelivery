# Playground de ingredientes — protótipo

Abra `burger-playground.html` diretamente no navegador. Não requer instalação ou conexão.

Para a prévia local, execute `node prototype/server.cjs` na raiz e abra http://127.0.0.1:4180. A grade usa quatro fotos estáticas locais, com carregamento sob demanda, em vez de reproduzir as camadas do hero. Fontes em `Assets/catalog/SOURCES.md`.

Pergunta: uma visão frontal em camadas permite abrir o hambúrguer, retirar e restaurar ingredientes e aplicar a personalização de forma compreensível?

Inclui um Whopper ilustrado em SVG, abertura em tela inteira, retirada por toque ou arrasto para a bandeja, reposição por botão, aplicar/cancelar, combo P/M/G e carrinho em memória. Os outros produtos são placeholders.

Hipóteses provisórias: pão e carne fixos; retirada sem desconto; aplicar confirma, cancelar descarta. A aparência fotográfica e a produção do catálogo ficam para depois da validação.

Verificação realizada: retirada pelo ingrediente e pelos controles, reposição, cancelamento preservando a configuração anterior e envio do item personalizado ao carrinho. Layout inspecionado a 390 × 844. Arrasto implementado, ainda precisa de validação em um aparelho de toque real. Não houve medição de desempenho em hardware móvel.

Fonte do experimento: branch `prototype/burger-playground`. O código é experimental e não deve ser promovido diretamente a produção.
