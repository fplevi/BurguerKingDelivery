# Checkout pelas telas do Figma, com situações fixas

Status: ready-for-agent

Contexto: `GLOSSARY.md` (Checkout, Resumo do pedido, Taxa de entrega, Total do pedido, Pedido, Pedido confirmado, Código de confirmação, Cliente cadastrado, Novo cliente, Endereço salvo, Endereço de pedido anterior, além dos termos do Carrinho), `docs/adr/0001-visuais-gerados-por-codigo.md`, spec `.scratch/carrinho/spec.md`. Histórias de usuário do design (US01–US16) em `.scratch/checkout/historias-figma.md`. Decisões tiradas da sessão de grilling de 2026-10-10.

Telas de referência (arquivo Figma `BElIaiOW5D1qFF8QStnoDo`):

| Tela | Desktop | Mobile |
| --- | --- | --- |
| Seção do fluxo | `217-6185` | `239-8996` |
| Progresso · componentes (Identificação, Endereço, Pagamento, Concluído × Desktop/Mobile) | `246-10579` | `246-10579` |
| phone · Qual é o seu celular? | `218-6192` | `240-8996` |
| phoneFilled | `218-6359` | `240-9263` |
| waCode · Confirme seu celular (WhatsApp) | `218-6512` | `240-9532` |
| smsCode | `218-6671` | `240-9813` |
| waResent / smsResent (toast código reenviado) | `224-8706` / `224-8805` | `240-14758` / `240-15047` |
| newPhone / newCode / newCodeSMS (Alterar celular) | `224-8904` / `224-8990` / `224-9083` | `240-15336` / `240-15605` / `240-15886` |
| codeError | `218-6830` | `240-10093` |
| newCustomer · cadastro | `218-6993` | `240-10381` |
| Endereço 01 · Seus endereços | `223-7319` | `240-17948` |
| Endereço 02 · Buscar endereço | `223-7351` | `240-17971` |
| Endereço 03 · Confirmar localização | `223-7384` | `240-17989` |
| Endereço 04 · Dados de entrega | `223-7427` | `240-18019` |
| Endereço 05 · Endereços de pedidos anteriores | `223-7496` | `240-18073` |
| Endereço 06 · Menu de gerenciamento (⋮) | `223-7527` | `240-18089` |
| Endereço 07 · Editar endereço | `223-7575` | `240-18122` |
| Endereço 08 · Remover endereço | `223-7644` | `240-18176` |
| Endereço 09 · Endereço removido (toast) | `223-7694` | `240-18206` |
| Endereço 10 · Endereço salvo (toast) | `223-7734` | `240-18231` |
| Endereço 11 · Localização indisponível | `223-7775` | `240-18257` |
| Endereço 12 · Fora da região de entrega | `223-7810` | `240-18275` |
| Endereço 13 · Busca em foco | `223-7842` | `240-18290` |
| Endereço 14 · Busca sem resultados | `223-7877` | `240-18308` |
| Endereço 15 · Localização ajustada | `223-7912` | `240-18326` |
| Endereço 16 · Trabalho selecionado | `223-7955` | `240-18356` |
| Endereço 17 · Endereço do histórico selecionado | `223-7993` | `240-18379` |
| pix · Pix selecionado | `218-7464` | `240-10650` |
| savedCard · cartão salvo | `218-7675` | `240-11012` |
| newCard · novo cartão (visão completa) | `218-7918` (`227-8995`) | `240-11435` (`240-19443`) |
| cardProcessing | `218-9489` | `240-13949` |
| cardError | `218-8176` | `240-11881` |
| pixWaiting · Só falta pagar o Pix | `218-8428` | `240-12322` |
| pixCopied (toast) | `218-8822` | `240-12864` |
| pixExpired · Seu Pix expirou | `218-9221` | `240-13415` |
| pixApproved | `218-9360` | `240-13692` |
| successPix / successCard · Pedido confirmado | `218-9618` / `218-9773` | `240-14206` / `240-14482` |

## Problem Statement

O "Continuar" do Carrinho termina num aviso de que o pagamento não faz parte do protótipo. O Figma já tem o checkout completo, em desktop e mobile: identificação pelo celular com Código de confirmação, escolha ou cadastro de endereço com mapa, pagamento por Pix ou cartão e a confirmação do pedido. Não há API real (SMS, WhatsApp, geocodificação, gateway, Pix), então cada situação do fluxo precisa ser provocada de um jeito fixo e conhecido, tanto à mão quanto nos testes.

## Solution

O Continuar do Carrinho abre o Checkout ("Finalizar pedido") numa tela própria, com o indicador de etapas Identificação → Endereço → Pagamento, o Resumo do pedido ao lado (desktop) ou abaixo (mobile), o fluxo de endereço em páginas próprias e a confirmação do Pedido. Uma tabela de situações fixas (celulares, código, cartões, buscas, localização e Pix) decide cada resultado. Tudo continua em memória.

## User Stories

As histórias US01–US16 de `.scratch/checkout/historias-figma.md` valem como critérios de aceite, com os ajustes desta spec (as decisões abaixo prevalecem em caso de conflito).

## Implementation Decisions

### Rotas e navegação

- **Rotas (hash, na mesma página, como `#carrinho`):** `#checkout` (Identificação e Pagamento, como estados da mesma página "Finalizar pedido"); `#endereco` (Seus endereços), `#endereco/buscar`, `#endereco/confirmar`, `#endereco/dados`, `#endereco/anteriores` (páginas próprias do fluxo de endereço, cada uma com "Voltar" para o passo anterior e "Voltar ao checkout"); `#pedido/BK1024` (confirmação).
- **Entrada:** o Continuar do Carrinho, depois da validação de combo sem bebida que já existe, abre `#checkout`. O toast "o pagamento não faz parte do protótipo" sai.
- **Guardas:** `#checkout` com o carrinho vazio (ou pelo endereço digitado) leva ao Carrinho. `#endereco/*` não exige carrinho nem celular confirmado: o visitante escolhe o Endereço de entrega pelo cardápio (ADR 0002, `.scratch/minha-conta-pedidos/spec.md`). `#pedido/<id>` sem um Pedido confirmado com esse id leva ao cardápio.
- **Voltar do navegador:** segue o histórico. Depois da confirmação, volta ao cardápio, sem recuperar o carrinho comprado nem abrir o Checkout.
- **Cabeçalho:** o mesmo do projeto, mas **sem o "Entregar em"** em todas as telas do Checkout, do endereço e da confirmação. No cardápio e no Carrinho, nada muda. Nenhuma categoria fica ativa no Checkout.
- **"Voltar ao carrinho"** (topo do Checkout) e **"Editar carrinho"** (Resumo do pedido) levam a `#carrinho`. Ao voltar com Continuar, o celular confirmado, o endereço e a forma de pagamento escolhidos continuam.
- **Whopper®:** o Figma ainda mostra "Whopper Clássico"; o protótipo segue "Whopper®".

### Indicador de etapas (US14)

- Sequência Identificação → Endereço → Pagamento, igual no desktop e no mobile (componente `246-10579`): linha atrás dos círculos; etapa atual em vermelho com número e nome; anteriores com marca de verificação; próximas com contorno e número; sem os textos "Etapa atual", "Pendente" ou "Concluído".
- Identificação é a atual no celular, no código e no cadastro; Endereço, em qualquer página `#endereco/*`; Pagamento, durante a seleção, o Pix pendente, o processamento e a falha do cartão. Todas concluídas só na confirmação (variante Concluído).
- Acessível como lista ordenada, com a etapa atual marcada por `aria-current="step"` e as concluídas anunciadas como concluídas.

### Identificação (US02–US04)

- "Qual é o seu celular?": campo "Celular com DDD" com máscara `(DD) 9XXXX-XXXX`; "Receber código pelo WhatsApp" (principal) e "Receber por SMS"; nota "Seus dados só serão recuperados após a confirmação.". Os botões ficam desabilitados até haver 11 dígitos.
- "Confirme seu celular": "Enviamos um código pelo WhatsApp|SMS para (DD) 9XXXX-XXXX.", campo "Código de 6 dígitos", "Confirmar e continuar", "Reenviar código", "Receber por SMS" (ou "Receber pelo WhatsApp", conforme o canal atual) e "Alterar celular".
- Reenviar e trocar de canal só atualizam o texto do destino e mostram o toast de código reenviado (Figma waResent/smsResent), no padrão de toast do projeto. A etapa fica na confirmação até o código ser validado.
- Código incorreto: "Código incorreto. Confira e tente novamente.", borda vermelha e "Confirmar e continuar" desabilitado até o código mudar (Figma codeError). Sem limite de tentativas, sem validade e sem intervalo de reenvio.
- "Alterar celular" volta ao campo de celular, preenchido, e um novo envio exige um novo código.
- Os dados do cliente só são recuperados depois da confirmação.
- **Cliente cadastrado:** segue direto para `#endereco`.
- **Novo cliente:** cadastro (Figma newCustomer) com nome completo obrigatório, e-mail opcional (validado só se preenchido) e o celular confirmado só para leitura. Depois segue para `#endereco`.
- Dentro da sessão, um celular já confirmado não pede o código de novo; o Checkout abre no passo seguinte. "Alterar celular" é o único jeito de trocar.

### Endereço (US05, US06)

- **Cliente cadastrado:** `#endereco` abre com Endereços salvos (Casa marcada, Figma 01), "Usar localização atual", a busca, "Endereços de pedidos anteriores" e "Entregar neste endereço".
- **Novo cliente:** só a busca e "Usar localização atual", sem as seções vazias. "Entregar neste endereço" fica escondido até existir um endereço.
- **Selecionar:** um Endereço salvo por vez (marca ✓ e borda vermelha). "Entregar neste endereço" volta a `#checkout` no Pagamento.
- **Busca** (`#endereco/buscar`, Figma 02/13/14): resultados conforme a tabela de situações fixas. Escolher um resultado leva a `#endereco/confirmar` (Figma 03): mapa com o marcador e "Confirmar localização".
- **Mapa:** os 4 tiles estáticos de `prototype/Assets/maps/paulista-*.png` (OpenStreetMap, com atribuição "© OpenStreetMap contributors") e o marcador fixo no centro. "Ajustar localização no mapa" permite arrastar o mapa sob o marcador (Figma 15), sem mudar o endereço textual.
- **Dados de entrega** (`#endereco/dados`, Figma 04): Rua*, Bairro*, Número* (ou "Endereço sem número"), Complemento (ou "Endereço sem complemento"), Ponto de referência e "Como você quer salvar?" (Casa, Trabalho ou Favoritos). "Salvar endereço" guarda o endereço como Endereço salvo em memória e volta para a lista com o novo endereço marcado e o toast "Endereço salvo" (Figma 10). O cliente ainda confirma em "Entregar neste endereço".
- **Endereços de pedidos anteriores** (`#endereco/anteriores`, Figma 05): escolher um volta à lista com ele selecionado (Figma 17).
- **Menu ⋮** (Figma 06): Editar (Figma 07, mesmo formulário de Dados de entrega) e Remover (Figma 08, confirmação; depois o toast "Endereço removido", Figma 09).
  - Remover o endereço marcado deixa nenhum marcado e desabilita "Entregar neste endereço" até o cliente escolher outro.
  - Editar o endereço em uso já vale para o Checkout.
- **Fora da região** (Figma 12): "Ainda não entregamos nessa região", o local selecionado com "Fora da área de entrega", "Escolher outro endereço" e "Voltar ao cardápio". Não é possível concluir o pedido nesse endereço.
- **Localização indisponível** (Figma 11): "Não conseguimos acessar sua localização", com "Tentar localização novamente".
- **No Checkout:** cartão "Endereço de entrega" com o rótulo (Casa…), a rua e o número, a cidade, o complemento e a referência, divisor e "Entrega estimada: 30–45 min", além de "Alterar" (leva a `#endereco`). Alterar o endereço mantém a forma de pagamento escolhida.

### Resumo do pedido (US07)

- Itens com "N× Nome" e o Total do item. Hambúrgueres mostram "Combo · Bebida" e, em vermelho, a linha "Sem …" igual à do Carrinho. Depois vêm Total dos itens, Taxa de entrega e Total do pedido (= Total dos itens + Taxa de entrega).
- Antes de haver endereço, só o Total dos itens (Figma phone). Com endereço atendido, também a Taxa de entrega e o Total do pedido.
- No Pagamento: "Confirmar e pagar R$ X" (cartão) ou "Gerar Pix" (Pix), conforme a forma escolhida, com a nota "Confira o endereço antes de confirmar." e "Editar carrinho".
- Sem campo de cupom.

### Pagamento (US08, US11, US12)

- "Forma de pagamento": Pix ("Pague com QR Code ou código Pix.") e Cartão de crédito ("Pagamento à vista. Use um cartão salvo ou adicione outro."), seleção única (radio) com a opção destacada. Os campos e a ação principal se adaptam à opção.
- **Cartão salvo:** "Seus cartões" com bandeira e número mascarado ("Visa •••• 4242", "Mariana Silva · validade 08/29"). Selecionar pede o código de segurança.
- **Novo cartão:** número (bandeira pelo prefixo: 4 → Visa, 5 → Mastercard), nome impresso, validade (MM/AA, mês e ano futuros) e código de segurança (3 dígitos), com "Salvar cartão para os próximos pedidos", desmarcado inicialmente. Aprovado e marcado, o cartão entra em "Seus cartões" na sessão.
- **"Confirmar e pagar R$ X":** cria o Pedido e mostra o processamento (Figma cardProcessing) por cerca de 1,5 s, com a tela inteira desabilitada. Depois vem o resultado.
- **Falha** (Figma cardError): mensagem clara de pagamento recusado, com revisar os dados, adicionar outro cartão ou selecionar Pix. Itens, Personalizações e endereço ficam como estavam, e nada aparece como confirmado.

### Pix (US09, US10)

- **"Gerar Pix"** cria o Pedido e abre "Só falta pagar o Pix" (Figma pixWaiting) com "Escaneie o QR Code com o app do seu banco.", "Valor a pagar: R$ X", o QR Code, a contagem "Este código expira em 10:00" ao vivo, "Copiar código Pix", "Aguardando pagamento", "Assim que o pagamento for aprovado, confirmamos seu pedido.", "Escolher outra forma de pagamento" e a nota "QR e valores demonstrativos para este protótipo.".
- **QR Code:** SVG fixo gerado por código; o "copia e cola" é um texto fixo.
- **Copiar:** usa a área de transferência e mostra o toast de código copiado (Figma pixCopied). Copiar não aprova nada.
- **Aprovação:** automática, 10 s depois de gerar o Pix, exceto para o celular "Pix não aprovado" da tabela. Passa por "Pagamento aprovado" (Figma pixApproved) e segue para a confirmação.
- **Expiração:** em 10:00 sem aprovação, "Seu Pix expirou" (Figma pixExpired) com "Gerar novo Pix" (novo código, nova validade de 10:00, de volta a Aguardando pagamento, com o mesmo Pedido) e "Escolher outra forma de pagamento".
- **"Escolher outra forma de pagamento"** cancela o Pix, cancela a aprovação agendada e volta ao Pagamento com o mesmo endereço, nenhuma forma pré-selecionada e "Editar carrinho" de volta. O Pedido continua o mesmo.

### Pedido e carrinho travado

- O **Pedido** nasce em "Confirmar e pagar" ou "Gerar Pix" e só vira **Pedido confirmado** com a aprovação. Só então ganha identificador e encerra o carrinho.
- **Pix pendente trava o carrinho:**
  - No Checkout somem "Voltar ao carrinho" e "Editar carrinho".
  - A navegação do cabeçalho continua livre, mas a tela do Carrinho mostra os Itens só para leitura, com o aviso "Há um Pix aguardando pagamento." e "Voltar ao pagamento".
  - "Adicionar ao carrinho" no cardápio não adiciona e mostra o toast "Conclua o pagamento ou escolha outra forma de pagamento para alterar o carrinho."
  - Só "Escolher outra forma de pagamento" destrava.
- Se o Pix for aprovado com o cliente fora do Checkout, aparece o toast de pagamento aprovado com o link "Ver pedido" (para `#pedido/<id>`).
- Editar o carrinho, possível só sem Pix pendente, descarta o Pedido ainda não confirmado.

### Confirmação (US13, US15)

- `#pedido/BK1024`: o primeiro Pedido confirmado da sessão é #BK1024 e os seguintes seguem em sequência; recarregar volta a 1024.
- A tela tem o indicador todo concluído, "Pedido confirmado!", "Seu pedido já está com a gente.", "Pedido #BK1024", "Previsão de entrega: 30–45 min", o endereço, "Pago com Pix · R$ X" ou "Pago com cartão Visa •••• 4242 · R$ X" (sempre mascarado) e o Resumo do pedido, sem "Editar carrinho".
- "Acompanhar pedido" é a ação principal. Por enquanto, mostra o toast "O acompanhamento do pedido ainda não faz parte do protótipo.".
- "Voltar ao cardápio" é a ação secundária, com contorno, e leva à última categoria vista.
- O carrinho comprado é encerrado: fica vazio e o contador mostra 0.

### Situações fixas

Ficam numa tabela de fixtures em `prototype/src/checkout-fixtures.js`, também documentada no README:

| Entrada | Resultado |
| --- | --- |
| Celular (61) 99999-1234 | Cliente cadastrado Mariana Silva: Endereços salvos Casa (Av. Paulista, 1578 · Bela Vista, São Paulo — SP · Apto. 21 · Portaria principal) e Trabalho (Rua Augusta, 1508 · Consolação, São Paulo — SP · 8º andar · Recepção); Endereços de pedidos anteriores; cartão salvo Visa •••• 4242 (Mariana Silva, 08/29). Pix aprovado 10 s depois de gerado |
| Celular (61) 90000-0000 | O mesmo perfil, mas o Pix nunca é aprovado e expira em 10:00 |
| Qualquer outro celular com 11 dígitos | Novo cliente, sem endereços nem cartões. Pix aprovado em 10 s |
| Código de confirmação `123456` | Válido, para qualquer celular e canal |
| Qualquer outro código de 6 dígitos | Código incorreto |
| Cartão salvo com CVV `000` | Recusado |
| Cartão salvo com outro CVV de 3 dígitos | Aprovado |
| Novo cartão `4242 4242 4242 4242` (Visa) ou `5555 5555 5555 4444` (Mastercard) | Aprovado |
| Novo cartão `4000 0000 0000 0002` | Recusado |
| Qualquer outro número de cartão | "Número de cartão inválido" no campo, sem chegar ao processamento |
| Busca contendo "paulista" | Av. Paulista, 1578 e vizinhos, atendidos |
| Busca contendo "augusta" | Rua Augusta, 1508, atendido |
| Busca contendo "estrada do campo" | Estrada do Campo, 120, fora da região de entrega |
| Busca sem correspondência | Busca sem resultados |
| "Usar localização atual" com a permissão negada | Localização indisponível |
| "Usar localização atual" com a permissão concedida | Av. Paulista, 1578, sejam quais forem as coordenadas |
| Qualquer endereço atendido | Taxa de entrega R$ 8,90 e entrega estimada em 30–45 min |

### Memória e layouts

- **Sessão:** guardada no `sessionStorage` da aba (ticket 01 de minha-conta-pedidos); recarregar mantém carrinho, cliente, Endereço de entrega e Pedidos, e uma aba nova começa vazia. Na mesma sessão, um novo checkout reaproveita o celular confirmado e os endereços e cartões salvos.
- **≥ 1024px:** conteúdo da etapa à esquerda e Resumo do pedido à direita (Figma desktop). O fluxo de endereço ocupa a coluna esquerda, sem Resumo.
- **< 1024px** (US16): uma coluna com rolagem vertical e o Resumo do pedido abaixo do conteúdo.
  - Nas telas de seleção e preenchimento do pagamento, Total do pedido e a ação de pagamento ficam fixos no rodapé (Figma "Checkout / ação fixa"), sem esconder o fim do conteúdo.
  - No fluxo de endereço, a ação principal fica fixa no rodapé (Figma "Entrega / ação fixa").
  - No cartão de endereço, complemento e referência ficam em linhas separadas, e o divisor fica depois do endereço, antes da previsão.
  - Preços em `#502314`, fontes do BK e contornos nos botões secundários.

## Testing Decisions

- A mesma costura: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, em 390 e 1280 de largura.
- Tempo: `page.clock` para os 10 s da aprovação do Pix, os 10:00 da validade e os ~1,5 s do processamento do cartão. Localização: `context.grantPermissions(['geolocation'])` e `setGeolocation`, ou a permissão negada. Área de transferência: permissão `clipboard-read`/`clipboard-write` para conferir o código copiado.
- Cada linha da tabela de situações fixas tem pelo menos um teste.
- Comportamentos: entrada pelo Continuar e guardas das rotas; indicador de etapas em cada etapa; celular, código, reenvio, troca de canal, alterar celular e código incorreto; Cliente cadastrado × Novo cliente; endereço (selecionar, buscar, confirmar, ajustar o mapa, salvar, anteriores, editar e remover, inclusive o endereço em uso; fora da região; localização negada e concedida); Resumo do pedido e Totais; Pix (pendente, copiar, aprovação em 10 s, expiração, novo Pix, outra forma de pagamento); carrinho travado com Pix pendente (Carrinho só leitura, Adicionar ao carrinho bloqueado, aprovação fora do Checkout); cartão salvo e novo (aprovado, recusado, inválido, salvar cartão); confirmação (id em sequência, carrinho encerrado, Acompanhar pedido, Voltar ao cardápio e Voltar do navegador); layouts com o rodapé fixo e sem rolagem horizontal.
- O teste do toast "o pagamento não faz parte do protótipo" (`tests/continuar.spec.js` e `tests/layout-carrinho.spec.js`) muda para conferir a abertura do Checkout.
- Capturas de revisão em 390 e 1280, revisadas por humano ao lado do Figma, em `.scratch/checkout/capturas/`.

## Out of Scope

- A tela Acompanhar pedido e os estados de acompanhamento.
- Integrações reais (SMS, WhatsApp, geocodificação, mapas dinâmicos, gateway, Pix) e a validade de produção do Pix.
- Validade e limite de tentativas do Código de confirmação, intervalo de reenvio e falhas técnicas das integrações.
- Cupom, parcelamento e troco.
- Persistir dados entre recarregamentos.
- Atualizar as telas do Figma para "Whopper®".

## Further Notes

- O trabalho segue na branch `feat/checkout`, a partir da `main`.
- A pasta `prototype/Assets/maps/` (tiles do OpenStreetMap) ainda não está no Git. Ela entra no ticket do endereço, com a fonte e a licença (ODbL) num `SOURCES.md`.
