# Revisão das interfaces implementadas contra o Figma

Estado: especificação consolidada com as decisões confirmadas pelo usuário. Implementação em etapa própria.

## Objetivo

Revisar as interfaces em código para aplicar os padrões visuais já acordados e preservar a biblioteca de ícones utilizada no Figma. Localizar divergências por tela, estado e dispositivo, com evidência suficiente para orientar as correções.

Referência: [arquivo BK no Figma](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK). Usar as telas ativas da Page 1; Parking Lot é arquivo de referências, não uma especificação de novas telas. As 271 telas identificadas na revisão anterior são um inventário de referência, não a obrigação de criar 271 rotas.

## Critérios já decididos

### Espaçamentos

- Paddings e gaps explícitos: `0, 4, 8, 12, 16, 24, 32, 40, 48…`; acima de 16, múltiplos de 8.
- Valores pares fora dessa escala, como 20, 28 e 36, também precisam ser revistos.
- Preservar dimensões fluidas e valores calculados pelo layout responsivo. A regra não exige arredondar larguras percentuais, posições de centralização, métricas tipográficas ou coordenadas internas de SVG.
- A seleção de um token deve preservar a intenção do layout e evitar cortes e sobreposições; não basta arredondar o CSS mecanicamente.

### Cantos

- Três raios ordinários: `8, 12 e 16 px`.
- Preservar elementos sem arredondamento, pílulas e círculos.
- Verificar todos os cantos de elementos com raios distintos, inclusive painéis com apenas os cantos superiores arredondados.

### Ícones

- Caixa de ícone em `16, 24, 32, 40… px`, mínimo de 16 px.
- Manter o desenho e suas proporções internas; o tamanho da caixa não é a área efetiva de todos os traços do SVG.
- Para cada ação ou informação, usar o mesmo símbolo, biblioteca e variante/peso da referência correspondente do Figma. Nome parecido ou significado equivalente não bastam para considerar o ícone correto.
- Evitar misturar ícones desenhados à mão, emojis, caracteres de fonte ou outra biblioteca para substituir símbolos existentes no Figma.
- Separar o tamanho visual do ícone da área clicável do controle. Não reduzir uma área de interação só para adequá-la à caixa do ícone.
- Logos, imagens de produtos, Camadas do hambúrguer e marcadores ilustrados de mapa não devem ser tratados como ícones genéricos.
- A biblioteca adicionada ao arquivo se chama **Icons**. Os componentes remotos consultados usam `Format=Outline, Weight=Bold`. A biblioteca Phosphor Icons aparece como disponível para adicionar, o que não comprova que seja a origem dos componentes usados; não instalar um pacote por suposição.
- Quando a origem de um pacote não puder ser comprovada, o SVG do componente exato do Figma é a referência geométrica. Registrar sua origem e centralizar seu uso na implementação.

Referências iniciais para o inventário de ícones:

| Símbolo | Componente remoto | Key |
| --- | --- | --- |
| MapPin | `307:11350` | `b641ad217951cf3e6789ff17d2bb434839f7b6b0` |
| CaretDown | `308:14818` | `5eff189a6333a488f64ec551e1744d1fc63a1803` |
| ShoppingCart | `308:14853` | `1bd675425055e190827e4d1140414ae300a6b604` |
| House | `300:11465` | `56cf73fbf287b7a72c34e976edcec3337db1ace7` |
| ArrowLeft | `307:11466` | `49f364e9f2711fb8115928da9648cfc346b9a0b3` |
| Receipt | `335:12129` | `6163cd232ba141ad743ed5c0d148d6f9c6cd3f71` |

### Tipografia

- Usar as fontes BK, preservando o papel tipográfico de cada elemento conforme a referência: Flame Sans, Flame Regular e Flame Bold.
- Revisar especialmente números de quantidade e indicadores de etapas, onde o levantamento do Figma encontrou Inter.
- O uso provisório de Inter em placeholders ocultos do Figma não estabelece uma fonte válida para a interface implementada.
- Textos da interface devem continuar como texto nativo em código; não reproduzir títulos, preços, links e mensagens como lettering vetorial.
- A regra de mínimo de 16 px é dos ícones; não foi definida uma nova escala de tamanhos de fonte nesta revisão.
- Os dois plugins existentes do Figma são ferramentas de conversão do arquivo de design, não dependências do site.

### Fundos e header

- Aplicar o body `#F5EBDC` e o header `#FAF2E5` nas famílias de Carrinho, Checkout, Minha conta, endereços e acompanhamento de pedidos, conforme as referências ativas.
- Headers transparentes que acabam herdando o fundo do body precisam recuperar sua superfície própria.
- Cardápio e Ver ingredientes mantêm as superfícies específicas de suas referências; não substituir todos os fundos do produto pela cor do body das páginas internas.

### Voltar e Identifique-se

- Cada tela que já possui retorno deve apresentar apenas um botão com seta vermelha e o rótulo `Voltar`, no formato revisado no Figma.
- Revisar duplicatas como Voltar junto de Voltar ao checkout/cardápio/carrinho. Preservar o destino de retorno apropriado ao contexto e o estado do fluxo.
- Não criar um botão de retorno novo em todas as telas indiscriminadamente.
- Páginas de Identifique-se não devem exibir botão de fechar. A remoção não deve eliminar a possibilidade de navegar para fora da página pelos mecanismos existentes.

### Código de confirmação

- Usar o layout de referência `404:13797`: mensagem de envio, link `Alterar celular` abaixo dela, rótulo e campo do código; no final, ações em coluna na ordem `Confirmar e continuar`, `Receber por SMS` e `Reenviar código`.
- Aplicar aos fluxos de Checkout e Minha conta, em web e mobile, incluindo SMS, WhatsApp, código incorreto, reenvio e confirmação de novo celular.
- Preservar destinos, conteúdo de cada estado, validações e disponibilidade das ações. Não habilitar uma ação desabilitada apenas para igualar a aparência.

### Toasts

- Feedbacks transitórios de sucesso devem seguir o toast de fundo marrom e mensagem branca usado nas referências `321:11472`, `320:11332` e `320:11385`.
- Incluir dados salvos, endereço salvo/removido, celular atualizado, código reenviado e item removido, bem como os estados equivalentes já implementados.
- Remover a duplicação dessas mensagens em texto solto ou banner dentro do conteúdo. Toasts não substituem erros de validação do campo, estados vazios ou informação permanente.
- Centralizar o toast na parte inferior do viewport; no mobile, posicioná-lo acima de barras fixas, com espaço para mensagens em mais de uma linha.
- Preservar a ação `Desfazer` e seu comportamento no Carrinho. Manter o ciclo de exibição/encerramento existente sem criar feedback novo em ações que não o possuem.

### Gerenciamento de endereço

- No web, o menu de editar/remover fica ancorado ao endereço correspondente, com header e lista visíveis e fundo normal da página, conforme `223:7527` e a correção de `157:4660`.
- Não reproduzir como modal uma página de gerenciamento cujo conteúdo fica oculto sob fundo escurecido.
- Preservar os painéis de ações e de confirmação de remoção próprios do mobile, onde esse comportamento foi mantido na revisão do Figma.

### Responsividade dos cards do Cardápio

- Verificar todas as categorias implementadas, inclusive nomes longos, card selecionado e larguras imediatamente antes/depois das mudanças de coluna ou breakpoint.
- A foto do produto deve caber inteira na área destinada à imagem, mantendo proporção, sem esticar nem recortar por redução de largura. Conferir também se o arquivo de origem já possui corte; uma mudança de CSS não recupera conteúdo ausente do asset.
- Recortar margens vazias do asset para enquadramento é diferente de cortar o produto. Recortes existentes de fundo/área vazia podem permanecer se preservarem o produto completo e a composição da referência.
- Nome, preço e demais informações que já pertencem ao card precisam continuar legíveis e visíveis. Permitir quebra de linha e crescimento do conteúdo; não ocultar texto, aplicar clamp/reticências ou reduzir a fonte para mascarar falta de espaço.
- Não usar uma altura fixa do card que corte o conteúdo quando o nome ocupar mais linhas. A área de imagem pode ter proporção estável, desde que o produto inteiro caiba nela.
- Ajustar a quantidade de colunas quando a largura disponível deixar de comportar os cards; não manter mais colunas à custa do desaparecimento da foto ou do texto.
- A correção deve preservar seleção, interação e carregamento das imagens, sem introduzir rolagem horizontal da página ou sobreposição entre cards.
- Conferir com as fontes BK efetivamente carregadas e com imagens resolvidas. Distinguir atraso de carregamento de corte causado pelo layout.

## Cobertura

Inventariar as telas e estados já implementados de Cardápio, Ver ingredientes, Endereço de entrega, Carrinho, Checkout, Minha conta e acompanhamento dos Pedidos confirmados. Mapear cada família de telas à referência ativa do Figma.

Incluir estados de seleção, erro, carregamento, listas vazias, confirmações e mensagens transitórias quando já existirem no código. Comparar web e mobile e conferir o comportamento entre os tamanhos de referência.

Não alterar regras de negócio definidas no glossário e nas especificações dos fluxos. Respeitar a escolha de Endereço de entrega sem Identificação, conforme ADR 0002. Esta revisão não propõe remodelar as Camadas 3D nem substituir o renderizador definido na ADR 0001.

## Política de validação acordada

- Incluir todos os padrões revisados nesta conversa, não apenas tokens e ícones.
- Comparar código e Figma nos tamanhos de referência e conferir o comportamento nas larguras intermediárias.
- Usar inicialmente 390, 768, 1280 e 1920 px, já presentes na cobertura do projeto, e acrescentar os limites relevantes encontrados no código: imediatamente abaixo, no limite e imediatamente acima de cada transição da grade.
- Na grade atual, conferir explicitamente 1023/1024/1025 e 1919/1920/1921 px. Incluir 320 e 360 px como casos estreitos para detectar a redução excessiva dos cards.
- Registrar a largura exata de cada falha observada. Uma captura correta em 390 ou 1280 px não aprova, por si só, o intervalo entre elas.
- Não exigir igualdade pixel a pixel entre renderizadores de fonte. Exigir a fonte correta carregada, conteúdo completo, hierarquia e geometria compatíveis com o Figma.

## Levantamento inicial do código

- `prototype/package.json`: a dependência de execução declarada é Three.js; nenhuma biblioteca de ícones está declarada.
- `prototype/src/account.js:8`, `prototype/src/checkout.js:15`, `prototype/src/main.js:147` e `prototype/src/tracking.js:80`: SVGs próprios e caixas de 14, 17, 18 ou 20 px. Conferir símbolo e geometria, além do tamanho.
- `prototype/index.html:9`: caixas de 25/28 px, caracteres nos controles de quantidade, rótulos antigos de Voltar e botão fechar em Identifique-se.
- `prototype/src/styles.css`: exemplos de padding/gap fora da escala e raios como 10 px. Linhas são localizadores do levantamento, não limites da revisão.
- Fontes BK já são declaradas. A presença de Arial/Georgia como fallback não comprova erro: conferir a fonte efetivamente carregada no navegador.
- Playwright já cobre 1280×800 e 390×844; há casos adicionais em 768 e 1920 px. Os testes existentes não foram executados nesta etapa de especificação.
- Grade do Cardápio (`prototype/src/styles.css:96–106`): quatro colunas entre 1024 e 1919 px sem largura mínima útil; duas abaixo de 1024; composição lateral diferente a partir de 1920. Fotos de hambúrguer combinam `overflow:hidden`, `object-fit:cover`, altura fixa e zoom de 1,35; abaixo de 1024 o zoom sobe para 1,6 com altura de 113 px. São hipóteses fundamentadas para o corte, ainda sem reprodução no navegador nesta etapa.
- Outras categorias têm recortes de imagem específicos (`prototype/src/styles.css:113–118`, `prototype/src/main.js:160,166`); conferir a área desenhada do produto antes de remover esses recortes.
- Não foi encontrada regra que comprove o desaparecimento dos nomes. A reprodução precisa distinguir nome existente no DOM de texto integralmente visível. Os testes atuais de fotos carregadas e nomes presentes não comprovam ausência de corte.

## Evidências e aceite propostos

- Matriz de telas/estados implementados com referência Figma, viewport, resultado e divergências identificadas.
- Inventário de símbolos com nome no Figma, biblioteca, variante/peso, tamanho e ponto correspondente em código.
- Registro de fontes externas e textos vetorizados usados na interface, distinguindo-os de logos e ilustrações.
- Evidência visual dos problemas e da conferência após correção, sem tratar dimensões fluidas ou detalhes internos do SVG como violações da escala.
- Verificações automatizadas onde sustentarem uma regra real; não exigir igualdade pixel a pixel de renderização de fontes entre ferramentas.
- Critérios de regressão para os cards: foto sem recorte pelo container, texto completo e visível e ausência de overflow nas larguras críticas, incluindo um produto com nome longo de cada categoria quando existir.
- Escopo e política de validação foram confirmados pelo usuário nesta entrevista. A conclusão da spec não inicia automaticamente as correções em código.
