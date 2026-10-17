# Barra do carrinho no cardápio

Status: resolved

## Objetivo

Disponibilizar uma Barra do carrinho fixa na área inferior do cardápio, em todas as categorias: Hambúrgueres, Acompanhamentos, Bebidas e Sobremesas.

## Decisões acordadas

- A barra não tem título visível.
- Exibe a quantidade de unidades, o Total dos itens e o botão “Finalizar pedido”.
- A quantidade soma as unidades de todos os Itens, em vez de contar Itens distintos. Usar “1 item” e “0 itens”/“2 itens” conforme a quantidade.
- O Total dos itens exclui a Taxa de entrega e usa a formatação monetária existente.
- Com carrinho vazio, mostra “0 itens” e “R$ 0,00”, com botão desabilitado.
- Ao adicionar pelo menos uma unidade ao carrinho, habilita o botão; remover a última unidade volta ao estado vazio.
- Produtos apenas selecionados ou configurados no cardápio não entram no resumo antes de serem adicionados ao carrinho.
- “Finalizar pedido” abre a tela Carrinho para revisão. O Checkout continua sendo acessado pelo “Continuar” do Carrinho.
- Não exige Identificação ou Endereço de entrega para habilitar o botão. Mantém as regras existentes para Combo e pagamento pendente.
- No desktop, fundo em toda a largura e resumo e botão agrupados à direita, alinhados às margens existentes.
- No mobile/tablet, resumo acima do botão; botão ocupa a largura disponível com as margens do layout.
- A barra é exclusiva do cardápio; as demais telas mantêm suas ações atuais. Ver ingredientes mantém seu isolamento de foco e interação.

## Layout e integração

O Figma é referência visual. Preservar os breakpoints existentes: mobile/tablet abaixo de 1024 px, desktop de 1024 a 1919 px e desktop amplo a partir de 1920 px. Não introduzir breakpoints derivados das larguras dos frames.

- Reservar espaço para a barra, inclusive no catálogo com rolagem própria em 1920+, mantendo o último produto acessível.
- Posicionar notificações temporárias acima da barra para não encobrir o resumo ou a ação.
- Reutilizar o estado e os cálculos existentes do carrinho para atualizar unidades e Total dos itens em todas as categorias.
- Preservar a navegação e o retorno de foco existentes ao abrir e sair do Carrinho.
- Usar as fontes locais e os tokens existentes. Nunito foi uma substituição provisória no Figma; não integra o requisito da implementação.
- O estado desabilitado deve ser semântico e impedir ativação por mouse e teclado.

## Referências visuais

- [Desktop abaixo de 1920](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=24-183).
- [Desktop a partir de 1920](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=156-4442).
- [Mobile/tablet](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=168-4892).

## Validação prevista

- Verificar vazio, inclusão de Itens, quantidades maiores que um e remoção da última unidade.
- Verificar atualização e permanência do resumo ao trocar entre as quatro categorias.
- Verificar navegação ao Carrinho, retorno de foco e ausência da barra nas demais telas.
- Conferir os três layouts, limites dos breakpoints, rolagem até o último produto, posição das notificações e isolamento de Ver ingredientes.
- Executar build e testes de comportamento/layout relacionados ao cardápio e Carrinho.

## Confirmação

Escopo, nome e consolidação final aprovados pelo solicitante em 17/10/2026. Implementação autorizada.

## Resultado

Implementado em `prototype/index.html`, `prototype/src/main.js` e `prototype/src/cardapio.css`, reutilizando os cálculos e a navegação do carrinho. A altura real da barra reserva espaço no conteúdo e nas notificações, incluindo a área segura do dispositivo. Em desktop amplo, o hero se adapta à altura disponível e mantém rolagem própria como recurso para conteúdos mais altos.

Validação: build de produção concluído. Testes de categorias, Carrinho e navegação aprovados; após os ajustes, a execução final de `barra-do-carrinho.spec.js` e `layout.spec.js` passou com 17 testes e 5 exclusões esperadas por projeto. Cobertura inclui os limites 1023/1024 e 1919/1920 px, telas de 390 e 1280 px, janelas de 720 e 800 px de altura, estado vazio, soma de unidades, troca de categoria, remoção da última unidade, retorno de foco e isolamento de Ver ingredientes. Capturas dos três layouts conferidas visualmente.
