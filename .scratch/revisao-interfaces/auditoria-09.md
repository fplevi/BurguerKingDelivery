# Auditoria integrada — 16/10/2026

Base anterior: `fb2d0a7`. Escopo: ticket 09 e spec local. As consultas ao Figma e exports originais dos tickets 01–08 são a referência documental desta integração; não houve nova exportação nem redesenho.

## Ícones e mecanismos remanescentes

Inventário geométrico e procedência por componente: [README dos exports](../../prototype/Assets/icons/README.md). Biblioteca **Icons**, Format=Outline / Weight=Bold; nenhum pacote npm foi presumido.

| Consumidor | Símbolos / caixa em px | Origem / registro |
| --- | --- | --- |
| Header / compra | User 16; ShoppingCart 32/24; MapPin 24; CaretDown, Minus, Plus 16; Check 24; Sliders 32 | exports em `index.html`, `cardapio.css`; componentes/keys no README |
| Cards | Crown 16 | `main.js`, instância `I124:1293;124:1204;308:15117` |
| Ver ingredientes | Check, Plus, Minus 16 | máscaras em `ver-ingredientes.css`, `290:11151` |
| Carrinho | ArrowLeft 24; Check, CaretDown, Minus, Plus 16 | `carrinho.css`, referência `187:5486` |
| Endereço | Search, Navigation, Dots, Trash, MapPin, House, Briefcase, Star 24; History e opções do formulário 16; ArrowLeft 24 | `address-icons.js`, `address.css`, referências `157:4660`, `223:7527`, `157:3329`, `157:3230` |
| Checkout / Identifique-se | ArrowLeft 24; Check das etapas 16 | `checkout.css`, `218:6512`, `246:11091` |
| Minha conta / Pedidos | House, User, MapPin, CreditCard, Receipt, SignOut, CaretDown 24; ArrowLeft 24; WhatsappLogo 16 | `address-icons.js`, `account.js`, `tracking.css`; `318:11597`, `318:12920`, `318:12340` |

Removidos após busca de consumidores: `house.svg`, `arrow-left.svg`, `receipt.svg` (reservas substituídas pelos exports completos `address-*`); seta própria no HTML de Endereço, até então escondida pelo CSS; seletor que a ocultava; regra `.signin-head .secondary` do antigo Fechar. O HTML inicial agora também diz Voltar, sem depender de reescrever o rótulo antigo.

Preservados: SVG do marcador ilustrado de endereço, mapa/rota/tiles do acompanhamento, QR Code Pix e arte das Camadas/fallback. São ilustrações ou dados, não substitutos de símbolos da biblioteca. Nenhum `data:image` de ícone declarado manualmente nem fonte remota encontrado no código de interface; o Vite pode incorporar os exports locais como URLs `data:image` no build, como registrado nas medidas.

## Tipografia

| Recurso local / família CSS | Papel / consumidores | Referências |
| --- | --- | --- |
| `Assets/fonts/FlameSans-Regular.ttf` / Flame Sans 400 | corpo, controles, campos, mensagens, quantidade do Carrinho | compra `25:222`, Carrinho `187:5486`, famílias 04–08 na matriz |
| `Assets/fonts/Flame-Regular.ttf` / Flame 400 | quantidade da compra, nomes dos Itens e títulos regulares | `25:222`, `187:5486`, painel `284:11569` |
| `Assets/fonts/Flame-Bold.ttf` / Flame 700 | títulos, preços, indicadores de etapas e Situação do pedido | `246:11091`, `318:12340`; matriz por família |

As três declarações `@font-face` ficam em `styles.css`, com recursos locais. Flame Regular e Bold compartilham família CSS e se distinguem pelo peso. Os tokens `--font-body` e `--font-display` preservam essa resolução. Arial/Georgia continuam como fallbacks. Busca por Inter, importação de fonte externa e lettering vetorial nos módulos de interface: nenhum consumidor; logo e ilustrações estão excluídos desse critério. A coleta registra carregamento por estado; uma face sem texto consumidor pode permanecer unloaded. Não se exige igualdade pixel a pixel.

## CSS e tokens

`tokens.css` define espaçamentos, raios, superfícies e famílias. Arquivos por fluxo aplicam esses padrões sobre `styles.css`. Os aliases `--cream`, `--brown`, `--title`, `--red`, `--hero`, `--catalog`, `--card`, `--border` e demais cores ainda são referenciados por consumidores ativos; não foram apagados. Tampouco se removeu o CSS base inteiro: ele ainda fornece grid, posicionamento, responsividade, estados, campos, mapa e fallback. Regras antigas sobrescritas não comprovam ausência de consumidores em outros estados.

A regra de espaçamento cobre padding/gap explícitos, sem arredondar offsets de mapas, tipografia, proporções de fotos ou coordenadas do SVG. As medidas dos coletores 02–08 registram os estilos computados dos fluxos, além da inspeção visual. O coletor integrado complementa com sequência de navegação, fontes, ícones e overflow.

## Evidências antes/depois e limites

- Cards: antes [768](evidencias/cardapio-768.png), depois nas capturas de `evidencias/cards-depois/`; medidas de 52 combinações registradas na matriz. A evidência inicial mostrava sobreposição real de foto/nome.
- Famílias 03–08: capturas e medidas próprias estão vinculadas nas seções da matriz. Elas representam a entrega de cada migração; não são chamadas de capturas anteriores quando não existe imagem do estado anterior.
- Integração: `evidencias/integrada/`, produzida por `prototype/scripts/revisao-integrada.mjs`, em build de produção. Mesma sessão percorre endereço visitante → Cardápio → Ver ingredientes → Carrinho → Checkout/código → endereço preservado → Pix → confirmação → acompanhamento → Pedidos → recarga. Valores, quantidade, Combo, Personalização e complemento são conferidos pelos controles/conteúdo público.
- Não há captura anterior de cada estado das 271 referências; não foram inventadas nem criadas rotas para referências arquivadas. O inventário de referências é distinto da cobertura executada.
- Entregue/cancelado permanecem sem mapa conforme comportamento existente, diferença deliberada documentada no ticket 08. Camadas 3D, regras de negócio e dados de demonstração permanecem fora desta revisão.
- O projeto é JavaScript sem script de typecheck. Sintaxe, build e Playwright são as verificações disponíveis. O aviso de bundle acima de 500 kB é preexistente e não faz parte desta revisão visual.
