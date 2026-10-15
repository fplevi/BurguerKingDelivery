# Matriz de revisão das interfaces

Inventário consultado na Page 1 do [Figma BK](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK), em 15/10/2026. Referências arquivadas não definem novas rotas. `referencias-ativas.json` registra IDs e nomes de cada estado das famílias abaixo. A matriz separa inventário de aceite: pendente não significa inexistente no código.

| Família / entrada no código | Estados existentes a conferir | Referências ativas web / mobile | Ticket / resultado |
| --- | --- | --- | --- |
| Cardápio, `main.js`, quatro categorias | seleção, Combo, Bebida do combo desabilitada/vazia/selecionada, erro obrigatório, quantidade 1–99, adicionar, carrinho travado | `24:183`, `156:4442`, `168:4693`; categorias `40:509`, `40:701`, `40:893`, `49:1104`, `49:1313`, `49:1522`, `127:2594` | 01 header/compra; 02 fotos e nomes conferidos em 13 larguras |
| Ver ingredientes, `main.js` | abrir, Entrada/Saída, retirar/recolocar, Bandeja vazia/cheia, aplicar/cancelar, Base, fallback | `284:11569` / `294:11262`, `294:11399` | 03 pendente; Camadas fora do escopo |
| Endereço de entrega, `checkout.js` addressFlow | lista, busca/foco/sem resultados, mapa ajustado, localização indisponível, fora da região, dados/validação, anterior, menu, editar/remover, salvo/removido | `157:4248` / `157:3130`; contexto Checkout `223:7319` / `240:17948` | 04: 165 estados/larguras aprovados; 80 testes focados; suíte isolada 669 aprovados/39 ignorados |
| Carrinho, `main.js` | vazio, Item com/sem Combo, lista da Bebida, obrigatório, quantidade, Personalização, removido/Desfazer, travado | `187:5485` / `187:8185` | 05: 168 estados/larguras aprovados; revisão sem achados |
| Checkout, `checkout.js` | celular, WhatsApp/SMS, código incorreto/reenviado, Novo cliente; endereço; Pix pendente/copiado/expirado/aprovado; cartão salvo/novo/erro/processando; Pedido confirmado | `217:6185` / `239:8996`; código revisado `404:13797` | 06 pendente |
| Identifique-se / Minha conta, `account.js`, `main.js` | identificação e código; início, Dados pessoais/salvos, alterar celular/conflito/código/atualizado; Endereços salvos editar/adicionar/remover; cartões vazio/novo/salvo/remover; sair | `318:11085`, web `318:11096` / mobile `318:12560`; demais IDs no inventário | 07 pendente |
| Pedidos confirmados / acompanhamento, `orders.js`, `tracking.js` | lista/vazio, detalhe, Situação do pedido, entregue/cancelado, timeline, mapa, ajuda | `318:12272`, `318:12340` / `318:13385`, `318:13430`; `350:13171` | 08 pendente |

## Registro de verificação

- Viewports comuns: 390, 768, 1280 e 1920 px. Limites: 320, 360, 1023/1024/1025 e 1919/1920/1921 px.
- Ticket 01: comparar header `165:6770` / `168:4694`, compra `25:222`, ajustes `25:231`; evidências e medidas em `evidencias/` geradas por `prototype/scripts/revisao-cardapio.mjs`.
- Para repetir a coleta: em `prototype`, iniciar `npm run dev` (porta padrão 5173) e executar `node scripts/revisao-cardapio.mjs`; `BK_REVIEW_URL` permite usar outra URL local. O coletor aguarda fontes, imagens e o primeiro quadro 3D antes de capturar.
- Conferir fonte carregada, caixa do ícone e área clicável separadamente. Fontes: Flame Sans no corpo/controles, Flame Regular na quantidade, Flame Bold no total. São TTFs locais em `prototype/Assets/fonts`; nenhum texto convertido em imagem foi introduzido. Os fallbacks Arial/Georgia permanecem para falhas de carregamento.
- Biblioteca e SVGs: `prototype/Assets/icons/README.md`. Não há dependência de fonte externa nem pacote de ícones presumido.
- Tokens novos em `prototype/src/tokens.css`; migração inicial em `cardapio.css`. Estilos antigos permanecem disponíveis. Superfícies específicas do Cardápio preservadas. Toasts, retornos, autenticação e menus aguardam seus tickets.
- Os responsáveis pelos tickets 02–08 devem acrescentar viewport exato, estado, captura, divergência/correção e resultado. Ticket 09 fecha a integração; o inventário não aprova essas telas antecipadamente.
- Divergência reproduzida a **768 px**, com fontes e imagens resolvidas: fotos ampliadas dos cards sobrepõem nomes e sofrem recorte (por exemplo Whopper, Cheddar Duplo e Stacker Duplo Bacon). Evidência: [captura 768](evidencias/cardapio-768.png). Registrada para o ticket 02; o ticket 01 não altera a grade.

### Ticket 02 — cards

- Reprodução antes da correção: Hambúrgueres em **320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920 e 1921 px**. Fotos ampliadas escapavam da área da imagem, com sobreposição ao nome; não foi reproduzida remoção do texto do DOM. [Medidas anteriores](evidencias/cards-antes/medidas.json) e capturas na mesma pasta.
- Também havia overflow da página em Acompanhamentos a **320/360/390** e Sobremesas a **320/360**: o título do hero não quebrava. Os demais produtos dessas categorias já cabiam nos recortes declarados. O ajuste permite quebra sem diminuir a fonte.
- Correção: enquadramento da área desenhada dos oito hambúrgueres, com margem adicional; nenhuma foto de origem toca as bordas do arquivo. `photo-crop` mantém proporção e recorta somente as margens vazias. Imagem sem zoom, área estável separada do nome, card de altura livre e selo em uma linha própria. Fontes BK, tokens e Crown original de `24:183` aplicados.
- Grade: **uma coluna abaixo de 360**, **duas de 360 a 1023**, **quatro de 1024 a 1919**, **duas na lateral a partir de 1920**. A largura mínima evita cards estreitos demais; as fontes mantêm os tamanhos existentes.
- Aceite geométrico: **52/52 combinações** das quatro categorias em **320, 359, 360, 361, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920, 1921 px**. Imagens decodificadas, fontes carregadas, área desenhada contida, texto integral dentro do card, foto sem sobrepor nome e overflow horizontal zero. Inclui seleção e captura do nome mais longo selecionável de cada categoria. [Medidas finais](evidencias/cards-depois/medidas.json).
- Conferência visual: 320 Acompanhamentos, 360 Sobremesas, 390 Hambúrgueres, 1024 Hambúrgueres e 1920 Hambúrgueres, além das capturas selecionadas. A lateral de 1920 mantém rolagem própria; sua captura geral mostra apenas a região visível, e as capturas `*-selecionado.png` documentam cards trazidos à vista.
- Repetir: iniciar Vite em `prototype`, executar `node scripts/revisao-cards.mjs depois`. `BK_REVIEW_URL` permite outra porta (padrão 5173). Coletor de evidências, não teste de igualdade de pixels; as capturas devem ser inspecionadas junto das medidas.
- [Revisão Standards/Spec](revisao-02.md): sem achados nos dois eixos.

### Ticket 05 — Carrinho

- **168/168 combinações**: doze estados em **320, 358, 359, 360, 361, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920 e 1921 px**. Sem Combo, Combo sem bebida, erro obrigatório, lista aberta, quantidade 2, vazio/removido, Desfazer, quantidade 99, removido com barra fixa, acompanhamento, removido com total alto e carrinho travado por Pix. Personalização com cebola retirada acompanha os estados editáveis. [Medidas finais](evidencias/carrinho/medidas.json); 72 capturas em 320/390/768/1024/1280/1920 na mesma pasta.
- Referência ativa: web `187:5486`, fluxo mobile `187:8185`, removido mobile `187:9840`; critérios de toast da spec. Consulta de propriedades em `187:5486` confirmou Flame Regular nos nomes dos Itens/Resumo, Flame Bold no título/valores e Flame Sans nos controles/quantidades. ArrowLeft 24 px; Check, CaretDown, Minus e Plus 16 px, usando os exports originais já documentados.
- Body `#F5EBDC`, header `#FAF2E5`, cards com superfície própria, tokens de espaçamento e raios. Único Voltar com seta vermelha, preservando categoria, histórico, foco e rolagem. Quantidade, valores, Combo e Personalização mantêm suas regras.
- Remoção em toast marrom com mensagem completa e Desfazer; sem banner duplicado e sem sobreposição do feedback anterior de adicionar. Continua até a próxima mudança do carrinho ou saída da tela, conforme o ciclo existente. Aviso de Pix/processamento permanece informação permanente no conteúdo.
- Barra mobile medida com ResizeObserver: toast e reserva de rodapé acompanham altura real, inclusive safe area e total alto que faça a ação quebrar linha. Abaixo de 360 px, Total do item fica em linha própria para preservar reais e centavos completos.
- Coletor valida ausência de overflow horizontal, controles sem conteúdo excedente, superfícies, retorno e separação entre toast/barra. Usa o fallback SVG existente apenas para dispensar o hero 3D, que não pertence ao Carrinho; as imagens dos Itens são as fotos reais. Conferência visual de `320-removido-total-alto`, `320-travado`, `390-lista`, `1024-quantidade-99`, `1280-desfeito` e `1920-acompanhamento`. Capturas de página inteira documentam a continuação abaixo do viewport; os elementos fixos permanecem posicionados no viewport capturado.
- Repetir: iniciar servidor local (preferencialmente `npm run build` + `npm run preview`) e executar `BK_REVIEW_URL=<URL local> node scripts/revisao-carrinho.mjs` em `prototype`. Padrão sem variável: porta 5173. A coleta final usou um build separado para evitar os timeouts encontrados no servidor de desenvolvimento.
- [Revisão Standards/Spec](revisao-05.md): zero achados restantes nos dois eixos.
- Suíte completa no build estável: **669 aprovados, 39 ignorados e nenhuma falha** (17,1 min). Sintaxe JS e diff check aprovados. A coleta final cobre também a disposição abaixo de 360 px acrescentada depois do início dessa suíte.

## Índice de estados do Figma

### Ticket 04 — Endereço de entrega

- **165/165 combinações** de quinze estados em **320, 360, 390, 768, 1023, 1024, 1025, 1280, 1919, 1920 e 1921 px**: lista no Checkout, menu, edição, validação, confirmação de remoção, removido, pedidos anteriores, busca sem resultado, resultados, mapa, dados, salvo, lista sem Identificação, fora da região e localização indisponível. [Medidas finais](evidencias/endereco/medidas.json); 75 capturas nos tamanhos 320/390/768/1280/1920 na mesma pasta.
- Referências: páginas de Endereço `157:4248`/`157:3130`, contexto Checkout `223:7319`/`240:17948`, menu web revisado `157:4660`/`223:7527` e confirmação mobile `157:3774`. [Referência web](evidencias/endereco-web-referencia.png) e [referência mobile](evidencias/endereco-mobile-referencia.png). Consultas de instâncias confirmaram símbolos e caixas. Origem dos SVGs e keys em `prototype/Assets/icons/README.md`.
- Correções: body `#F5EBDC`, header `#FAF2E5`, tokens de espaçamento/raios, Flame Sans/Regular/Bold locais e ícones originais em 16/24 px. Um único Voltar, contextual; busca retorna à lista sem percorrer visitas antigas. O retorno tem seta vermelha e texto nativo.
- Menu web não modal, posicionado no endereço e atualizado com rolagem/redimensionamento; abre acima quando falta espaço abaixo. Lista e header permanecem visíveis e utilizáveis. Fechamento externo preserva o primeiro clique na lista; Escape devolve foco ao botão de opções. Mobile mantém painel de ações e confirmação inferior, com foco modal e cancelamento por Escape.
- Toast compartilhado com fundo marrom/mensagem branca, largura limitada para quebrar linhas e tokens; endereço salvo/removido sem duplicação. No mobile, fica acima da ação fixa, incluindo safe area. Sem mensagem nova na escolha de endereço atendido; sem feedback novo ao editar.
- Medidas finais: overflow horizontal zero, retorno único, ícones na escala, superfícies corretas, menus modais somente abaixo de 1024 e toast separado da barra. Conferência visual de `320-editar`, `390-menu`, `390-remover`, `390-toast-salvo`, `1280-menu` e `1920-lista-visitante`; capturas de página inteira também mostram a continuação abaixo do viewport nos formulários/listas.
- Repetir: iniciar Vite em `prototype`, executar `node scripts/revisao-endereco.mjs`; `BK_REVIEW_URL` permite outra porta (padrão 5173). O coletor usa o fluxo público, aguarda fontes, mede geometria e produz capturas; não exige igualdade de pixels.
- Build, sintaxe JS e diff check aprovados; 80/80 testes focados. Suíte completa isolada de `37bc826`: **669 aprovados, 39 ignorados, zero falhas**. As tentativas no checkout compartilhado foram interrompidas por interferência de artefatos/alterações concorrentes; detalhes no Answer. [Revisão Standards/Spec](revisao-04.md): zero achados restantes nos dois eixos. [Ticket 04](issues/04-endereco-de-entrega.md).

### Endereço / mobile · referência iFood (`157:3130`)

- [mobile / 01 · Seus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3131)
- [mobile / 02 · Buscar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3230)
- [mobile / 03 · Confirmar localização](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3284)
- [mobile / 04 · Dados de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3329)
- [mobile / 05 · Endereços de pedidos anteriores](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3449)
- [mobile / 06 · Gerenciar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3544)
- [mobile / 07 · Editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3654)
- [mobile / 08 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3774)
- [mobile / 09 · Endereço removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3879)
- [mobile / 10 · Endereço salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-3954)
- [mobile / 11 · Localização indisponível](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4056)
- [mobile / 12 · Fora da região de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4090)
- [mobile / 13 · Busca em foco](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4143)
- [mobile / 14 · Busca sem resultados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4173)
- [mobile / 15 · Localização ajustada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4203)
- [mobile / 16 · Trabalho selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=159-4556)
- [mobile / 17 · Endereço do histórico selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=159-4639)

### Endereço / Web · páginas (`157:4248`)

- [BK / Endereço / web / 01 · Seus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4249)
- [BK / Endereço / web / 02 · Buscar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4346)
- [BK / Endereço / web / 03 · Confirmar localização](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4400)
- [BK / Endereço / web / 04 · Dados de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4445)
- [BK / Endereço / web / 05 · Endereços de pedidos anteriores](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4565)
- [Endereço / Menu de gerenciamento](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4660)
- [BK / Endereço / web / 07 · Editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4770)
- [BK / Endereço / web / 08 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4890)
- [Endereço / lista com toast · removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-4995)
- [Endereço / lista com toast · salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5070)
- [BK / Endereço / web / 11 · Localização indisponível](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5172)
- [BK / Endereço / web / 12 · Fora da região de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5206)
- [BK / Endereço / web / 13 · Busca em foco](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5259)
- [BK / Endereço / web / 14 · Busca sem resultados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5289)
- [BK / Endereço / web / 15 · Localização ajustada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=157-5319)
- [BK / Endereço / web / 16 · Trabalho selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=159-4990)
- [BK / Endereço / web / 17 · Endereço do histórico selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=159-5073)
- [Endereço / lista após salvo · toast encerrado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=212-6015)
- [Endereço / lista após removido · toast encerrado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=212-6154)

### Carrinho / Web · fluxo (`187:5485`)

- [BK / Carrinho / web / 01 · Carrinho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-5486)
- [BK / Carrinho / web / 02 · Combo desmarcado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-5848)
- [BK / Carrinho / web / 03 · Escolher bebida](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-6208)
- [BK / Carrinho / web / 04 · Lista de bebidas aberta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-6570)
- [BK / Carrinho / web / 05 · Quantidade atualizada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-6968)
- [BK / Carrinho / web / 06 · Item removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-7330)
- [BK / Carrinho / web / 07 · Carrinho vazio](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-7609)
- [BK / Carrinho / web / 08 · Bebida obrigatória](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-7676)
- [BK / Carrinho / web / 09 · Ver ingredientes](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-8042)
- [BK / Carrinho / web / Quantidade 2 / Cheddar Duplo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-10789)
- [BK / Carrinho / web / Quantidade 2 / Batata Frita](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-11159)
- [BK / Carrinho / web / Quantidade 2 / BK® Mix de Brownie](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-11529)
- [BK / Carrinho / web / Remover / Cheddar Duplo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-11899)
- [BK / Carrinho / web / Remover / Batata Frita](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-12262)
- [BK / Carrinho / web / Remover / BK® Mix de Brownie](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-12626)
- [BK / Carrinho / web / Bebida do combo / Coca-Cola](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-12991)
- [BK / Carrinho / web / Bebida do combo / Sprite](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-13349)
- [BK / Carrinho / web / Bebida do combo / Fanta Laranja](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-13707)
- [BK / Carrinho / web / Bebida do combo / Natural One Laranja](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-14065)
- [BK / Carrinho / web / Bebida do combo / Natural One Uva](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-14423)
- [BK / Carrinho / web / Bebida do combo / Água de Copo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-14781)
- [BK / Carrinho / web / Cheddar Duplo / combo marcado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-15139)
- [BK / Carrinho / web / Cheddar Duplo / bebida selecionada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-15524)
- [BK / Carrinho / web / Visão completa](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-16293)

### Carrinho / Mobile · fluxo (`187:8185`)

- [BK / Carrinho / mobile / 01 · Carrinho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-8186)
- [BK / Carrinho / mobile / 02 · Combo desmarcado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-8510)
- [BK / Carrinho / mobile / 03 · Escolher bebida](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-8832)
- [BK / Carrinho / mobile / 04 · Lista de bebidas aberta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-9156)
- [BK / Carrinho / mobile / 05 · Quantidade atualizada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-9516)
- [BK / Carrinho / mobile / 06 · Item removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-9840)
- [BK / Carrinho / mobile / 07 · Carrinho vazio](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-10081)
- [BK / Carrinho / mobile / 08 · Bebida obrigatória](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-10110)
- [BK / Carrinho / mobile / 09 · Ver ingredientes](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=187-10438)
- [BK / Carrinho / mobile / Quantidade 2 / Cheddar Duplo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-16655)
- [BK / Carrinho / mobile / Quantidade 2 / Batata Frita](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-17004)
- [BK / Carrinho / mobile / Quantidade 2 / BK® Mix de Brownie](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-17353)
- [BK / Carrinho / mobile / Remover / Cheddar Duplo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-17702)
- [BK / Carrinho / mobile / Remover / Batata Frita](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-18044)
- [BK / Carrinho / mobile / Remover / BK® Mix de Brownie](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-18387)
- [BK / Carrinho / mobile / Bebida do combo / Coca-Cola](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-18731)
- [BK / Carrinho / mobile / Bebida do combo / Sprite](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-19068)
- [BK / Carrinho / mobile / Bebida do combo / Fanta Laranja](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-19405)
- [BK / Carrinho / mobile / Bebida do combo / Natural One Laranja](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-19742)
- [BK / Carrinho / mobile / Bebida do combo / Natural One Uva](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-20079)
- [BK / Carrinho / mobile / Bebida do combo / Água de Copo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-20416)
- [BK / Carrinho / mobile / Cheddar Duplo / combo marcado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-20753)
- [BK / Carrinho / mobile / Cheddar Duplo / bebida selecionada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-21117)
- [BK / Carrinho / mobile / Visão completa](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=189-22075)

### Checkout / Web · fluxo (`217:6185`)

- [Checkout / phone](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6192)
- [Checkout / phoneFilled](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6359)
- [Checkout / waCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6512)
- [Checkout / smsCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6671)
- [Checkout / codeError](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6830)
- [Checkout / newCustomer](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-6993)
- [Checkout / pix](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-7464)
- [Checkout / savedCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-7675)
- [Checkout / newCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-7918)
- [Checkout / cardError](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-8176)
- [Checkout / pixWaiting](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-8428)
- [Checkout / pixCopied](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-8822)
- [Checkout / pixExpired](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-9221)
- [Checkout / pixApproved](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-9360)
- [Checkout / cardProcessing](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-9489)
- [Checkout / successPix](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-9618)
- [Checkout / successCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-9773)
- [Checkout / endereço / BK / Endereço / web / 01 · Seus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7319)
- [Checkout / endereço / BK / Endereço / web / 02 · Buscar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7351)
- [Checkout / endereço / BK / Endereço / web / 03 · Confirmar localização](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7384)
- [Checkout / endereço / BK / Endereço / web / 04 · Dados de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7427)
- [Checkout / endereço / BK / Endereço / web / 05 · Endereços de pedidos anteriores](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7496)
- [Checkout / endereço / Endereço / Menu de gerenciamento](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7527)
- [Checkout / endereço / BK / Endereço / web / 07 · Editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7575)
- [Checkout / endereço / BK / Endereço / web / 08 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7644)
- [Checkout / endereço / Endereço / lista com toast · removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7694)
- [Checkout / endereço / Endereço / lista com toast · salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7734)
- [Checkout / endereço / BK / Endereço / web / 11 · Localização indisponível](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7775)
- [Checkout / endereço / BK / Endereço / web / 12 · Fora da região de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7810)
- [Checkout / endereço / BK / Endereço / web / 13 · Busca em foco](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7842)
- [Checkout / endereço / BK / Endereço / web / 14 · Busca sem resultados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7877)
- [Checkout / endereço / BK / Endereço / web / 15 · Localização ajustada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7912)
- [Checkout / endereço / BK / Endereço / web / 16 · Trabalho selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7955)
- [Checkout / endereço / BK / Endereço / web / 17 · Endereço do histórico selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-7993)
- [Checkout / endereço / Endereço / lista após salvo · toast encerrado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-8031)
- [Checkout / endereço / Endereço / lista após removido · toast encerrado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=223-8072)
- [Checkout / waResent](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=224-8706)
- [Checkout / smsResent](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=224-8805)
- [Checkout / newPhone](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=224-8904)
- [Checkout / newCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=224-8990)
- [Checkout / newCodeSMS](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=224-9083)
- [Checkout / novo cartão / visão completa](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=227-8995)

### Checkout / Mobile · fluxo (`239:8996`)

- [Checkout mobile / phone](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-8996)
- [Checkout mobile / phoneFilled](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-9263)
- [Checkout mobile / waCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-9532)
- [Checkout mobile / smsCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-9813)
- [Checkout mobile / codeError](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-10093)
- [Checkout mobile / newCustomer](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-10381)
- [Checkout mobile / pix](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-10650)
- [Checkout mobile / savedCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-11012)
- [Checkout mobile / newCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-11435)
- [Checkout mobile / cardError](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-11881)
- [Checkout mobile / pixWaiting](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-12322)
- [Checkout mobile / pixCopied](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-12864)
- [Checkout mobile / pixExpired](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-13415)
- [Checkout mobile / pixApproved](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-13692)
- [Checkout mobile / cardProcessing](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-13949)
- [Checkout mobile / successPix](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-14206)
- [Checkout mobile / successCard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-14482)
- [Checkout mobile / waResent](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-14758)
- [Checkout mobile / smsResent](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-15047)
- [Checkout mobile / newPhone](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-15336)
- [Checkout mobile / newCode](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-15605)
- [Checkout mobile / newCodeSMS](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-15886)
- [Checkout mobile / mobile / 01 · Seus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-17948)
- [Checkout mobile / mobile / 02 · Buscar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-17971)
- [Checkout mobile / mobile / 03 · Confirmar localização](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-17989)
- [Checkout mobile / mobile / 04 · Dados de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18019)
- [Checkout mobile / mobile / 05 · Endereços de pedidos anteriores](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18073)
- [Checkout mobile / mobile / 06 · Gerenciar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18089)
- [Checkout mobile / mobile / 07 · Editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18122)
- [Checkout mobile / mobile / 08 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18176)
- [Checkout mobile / mobile / 09 · Endereço removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18206)
- [Checkout mobile / mobile / 10 · Endereço salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18231)
- [Checkout mobile / mobile / 11 · Localização indisponível](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18257)
- [Checkout mobile / mobile / 12 · Fora da região de entrega](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18275)
- [Checkout mobile / mobile / 13 · Busca em foco](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18290)
- [Checkout mobile / mobile / 14 · Busca sem resultados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18308)
- [Checkout mobile / mobile / 15 · Localização ajustada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18326)
- [Checkout mobile / mobile / 16 · Trabalho selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18356)
- [Checkout mobile / mobile / 17 · Endereço do histórico selecionado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-18379)
- [Checkout mobile / Cartão · visão completa](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=240-19443)

### Ver ingredientes / Variações taste · Dragzone, dock e bancada (`284:11568`)

- [Variação 01 / Dragzone lateral](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=284-11569)
- [Componentes / chips e bandeja](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=290-11151)
- [Ver ingredientes / Mobile · chips e bandeja dinâmica](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=294-11262)
- [Ver ingredientes / Mobile · visão completa](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=294-11399)

### Minha conta / celular, perfil e pedidos · Web + Mobile (`318:11085`)

- [Conta / componentes · textos provisórios](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11091)
- [Conta / web / 01 · Identifique-se](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11096)
- [Conta / web / 02 · Celular preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11163)
- [Conta / web / 03 · Código pelo WhatsApp](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11228)
- [Conta / web / 04 · Código por SMS](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11303)
- [Conta / web / 05 · Código incorreto](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11376)
- [Conta / web / 06 · Código reenviado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11451)
- [Conta / web / 07 · Minha conta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11523)
- [Conta / web / 08 · Meus dados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11597)
- [Conta / web / 09 · Alterar celular](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11675)
- [Conta / web / 10 · Confirmar novo celular](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11756)
- [Conta / web / 11 · Celular já vinculado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11837)
- [Conta / web / 12 · Meus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11887)
- [Conta / web / 13 · Adicionar ou editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-11952)
- [Conta / web / 14 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12030)
- [Conta / web / 15 · Formas de pagamento](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12080)
- [Conta / web / 16 · Adicionar cartão](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12135)
- [Conta / web / 17 · Remover cartão](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12222)
- [Conta / web / 18 · Meus pedidos](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12272)
- [Conta / web / 19 · Acompanhar pedido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12340)
- [Conta / web / 20 · Pedido entregue](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12402)
- [Conta / web / 21 · Nenhum pedido ainda](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12460)
- [Conta / web / 22 · Sair da conta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12510)
- [Conta / mobile / 01 · Identifique-se](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12560)
- [Conta / mobile / 02 · Celular preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12608)
- [Conta / mobile / 03 · Código pelo WhatsApp](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12656)
- [Conta / mobile / 04 · Código por SMS](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12712)
- [Conta / mobile / 05 · Código incorreto](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12768)
- [Conta / mobile / 06 · Código reenviado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12826)
- [Conta / mobile / 07 · Minha conta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12881)
- [Conta / mobile / 08 · Meus dados](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12920)
- [Conta / mobile / 09 · Alterar celular](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-12975)
- [Conta / mobile / 10 · Confirmar novo celular](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13035)
- [Conta / mobile / 11 · Celular já vinculado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13099)
- [Conta / mobile / 12 · Meus endereços](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13128)
- [Conta / mobile / 13 · Adicionar ou editar endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13168)
- [Conta / mobile / 14 · Remover endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13227)
- [Conta / mobile / 15 · Formas de pagamento](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13256)
- [Conta / mobile / 16 · Adicionar cartão](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13288)
- [Conta / mobile / 17 · Remover cartão](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13356)
- [Conta / mobile / 18 · Meus pedidos](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13385)
- [Conta / mobile / 19 · Acompanhar pedido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13430)
- [Conta / mobile / 20 · Pedido entregue](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13471)
- [Conta / mobile / 21 · Nenhum pedido ainda](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13512)
- [Conta / mobile / 22 · Sair da conta](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13541)
- [Conta / notas do fluxo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=318-13570)
- [Conta / web / 23 · Dados salvos](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11332)
- [Conta / web / 24 · Endereço removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11385)
- [Conta / web / 25 · Nenhum cartão salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11439)
- [Conta / web / 26 · Pedido cancelado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11488)
- [Conta / mobile / 23 · Dados salvos](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11544)
- [Conta / mobile / 24 · Endereço removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11580)
- [Conta / mobile / 25 · Nenhum cartão salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11617)
- [Conta / mobile / 26 · Pedido cancelado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=320-11649)
- [Conta / web / 27 · Novo celular preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=321-11394)
- [Conta / web / 28 · Celular atualizado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=321-11472)
- [Conta / mobile / 27 · Novo celular preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=321-11525)
- [Conta / mobile / 28 · Celular atualizado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=321-11586)
- [Conta / web / 29 · Editar Trabalho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11494)
- [Conta / web / 30 · Remover Trabalho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11570)
- [Conta / web / 31 · Trabalho removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11614)
- [Conta / web / 32 · Novo endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11667)
- [Conta / web / 33 · Novo endereço preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11743)
- [Conta / web / 34 · Endereço salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11819)
- [Conta / web / 35 · Cartão salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11880)
- [Conta / mobile / 29 · Editar Trabalho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11938)
- [Conta / mobile / 30 · Remover Trabalho](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-11997)
- [Conta / mobile / 31 · Trabalho removido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-12024)
- [Conta / mobile / 32 · Novo endereço](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-12060)
- [Conta / mobile / 33 · Novo endereço preenchido](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-12119)
- [Conta / mobile / 34 · Endereço salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-12178)
- [Conta / mobile / 35 · Cartão salvo](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=324-12222)
- [Conta / web / 36 · Remover Mastercard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-11823)
- [Conta / web / 37 · Editar Outro](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-11869)
- [Conta / web / 38 · Remover Outro](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-11945)
- [Conta / mobile / 36 · Remover Mastercard](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-11993)
- [Conta / mobile / 37 · Editar Outro](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-12022)
- [Conta / mobile / 38 · Remover Outro](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=325-12081)

### Pedidos / estados e componentes de acompanhamento (`350:13171`)

- [Pedidos / componentes de acompanhamento](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=350-13172)
- [Pedidos / web / Pedido realizado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-14130)
- [Pedidos / web / Pagamento confirmado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-14399)
- [Pedidos / web / Pedido em preparação](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-14668)
- [Pedidos / web / Aguardando retirada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-14937)
- [Pedidos / web / Pedido retirado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-15206)
- [Pedidos / web / Pedido chegou](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-15475)
- [Pedidos / web / Pedido entregue](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-15744)
- [Pedidos / mobile / Pedido realizado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-16013)
- [Pedidos / mobile / Pagamento confirmado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-16251)
- [Pedidos / mobile / Pedido em preparação](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-16489)
- [Pedidos / mobile / Aguardando retirada](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-16727)
- [Pedidos / mobile / Pedido retirado](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-16965)
- [Pedidos / mobile / Pedido chegou](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-17203)
- [Pedidos / mobile / Pedido entregue](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=351-17441)
- [Pins BK / masters em alta e componentes](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=372-13339)

### Ticket 03 — Ver ingredientes

- Referências consultadas no Figma: web `284:11569` (1440 × 900), mobile `294:11399` (390 × 1151), componentes de ingredientes `290:11151`. Header, ações, textos de ajuda, hierarquia e tipografia conferidos; Flame Bold 40/28 no título, Flame Regular 24/28 nos títulos do painel, Flame Sans 13/14/16/18 nos demais textos. Fontes locais carregadas nas 36 combinações.
- Ajustes: padding do header 28 → 32; panel e hero mobile 20 → 24/16; barra fixa 20 → 24; chips 14 → 16; cards da Bandeja gap/padding 6 → 8; raio da Bandeja 24 → 16. Pílulas e dimensões de referência dos cards (104/94 × 88) preservadas. A legenda permite quebra de linha. Superfícies específicas creme/bege preservadas.
- Ícones: Check exportado da instância `290:11156`, remoto `300:11418`, Outline/Bold da biblioteca Icons. Plus usa o export já centralizado, de mesmo componente que `305:11371`. Minus centralizado representa a ação de retirar no hover/foco existente. Máscaras de 16 × 16 preservam os paths e herdam a cor do estado, sem reduzir os controles de 44 px. Símbolos antigos sem consumidores removidos do HTML. Origem completa em `prototype/Assets/icons/README.md`.
- Navegação: referência possui Cancelar e Aplicar alterações; nenhum Voltar foi acrescentado. Aplicar/cancelar, foco/teclado, Camadas não removíveis, Personalização e cena 3D preservados. Nenhum modelo ou renderizador alterado.
- Matriz final contra o build: **36/36 combinações** em **320, 360, 390, 768, 1023, 1024, 1025, 1280, 1440, 1919, 1920 e 1921 px**, altura 900. Estados inicial, Picles/Cebola retirados e todos os ingredientes removíveis retirados. Celulares usam toque; demais larguras usam mouse. Zero overflow horizontal; Recolocar todos permanece acima da barra fixa após rolar; nenhuma ação tem texto cortado. [Medidas](evidencias/ingredientes-depois/medidas.json).
- Capturas de topo e painel em `evidencias/ingredientes-depois/`. Conferência visual: [320 com Bandeja cheia](evidencias/ingredientes-depois/320-todos-retirados-painel.png), [390 inicial](evidencias/ingredientes-depois/390-inicial.png), [1024](evidencias/ingredientes-depois/1024-inicial.png), [1440 com dois retirados](evidencias/ingredientes-depois/1440-retirados-painel.png). A cena mantém o palco mobile de 450 px para as áreas interativas das Camadas, conforme decisão anterior; não foi reduzida à foto estática da referência.
- Repetir coleta: iniciar Vite ou preview em `prototype`, executar `node scripts/revisao-ingredientes.mjs depois`; `BK_REVIEW_URL` define a URL local (padrão 5173). Evidência final coletada com preview do build. Coletor não é teste de igualdade de pixels.
- Verificação focada final: `npm run test:build -- tests/ver-ingredientes.spec.js tests/layout-ver-ingredientes.spec.js tests/painel.spec.js`: **55 aprovados, 11 ignorados por dispositivo**. Expectativas antigas de 20 px e consulta aos símbolos removidos foram atualizadas para os tokens e SVGs finais. Projeto não declara comando de typecheck; build Vite aprovado.
- Conferência complementar das outras quatro receitas (Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo e Rodeio), com todos os ingredientes removíveis retirados em 320, 390 e 1024 px: **12/12 combinações**, sem overflow ou sobreposição entre imagem e nome nos cards da Bandeja. Inclui Cheddar inferior/superior e Molho barbecue. [Medidas complementares](evidencias/ingredientes-depois/outras-receitas.json).
- Primeira suíte ampla no diretório compartilhado: **621 aprovados, 39 ignorados, 6 falhas**. Cinco falhas foram ENOENT ao gravar traces/ZIPs em `test-results/.playwright-artifacts-*`; também houve diferença binária entre screenshots no fallback de `object-view-box` em categorias. Durante a execução surgiram artefatos e mudanças de outra tarefa (Big King). A execução foi repetida em snapshot do commit `763d830`, com porta e diretório de resultados próprios, para validar a alteração sem misturar builds e artefatos. Os resultados finais seguem abaixo.
- Resultado final da suíte completa no snapshot exato `763d830`: **627 aprovados, 39 ignorados, zero falhas**, em 14,6 min. Build Vite e testes executados no snapshot com `PW_PORT=4178` e `--output` próprio, sem alterações de código após a revisão. A diferença de screenshot e os cinco erros de artefatos não se repetiram. [Revisão Standards/Spec](revisao-03.md): zero achados em ambos os eixos.
