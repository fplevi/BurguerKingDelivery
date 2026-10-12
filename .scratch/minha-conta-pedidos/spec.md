# Minha conta, Endereço de entrega no cardápio e acompanhamento de pedidos

Status: ready-for-agent

Contexto: `GLOSSARY.md` (Endereço de entrega, Situação do pedido, Minha conta, Dados pessoais, Cartão salvo, Cartão padrão, além dos termos de Pedido e Cliente), `docs/adr/0002-endereco-de-entrega-sem-identificacao.md`, spec `.scratch/checkout/spec.md`. Decisões tiradas da sessão de grilling de 2026-10-12; esta spec substitui o rascunho anterior, que não tinha sido validado.

Telas de referência (arquivo Figma `BElIaiOW5D1qFF8QStnoDo`):

| Tela | Desktop | Mobile |
| --- | --- | --- |
| Cardápio com "Entregar em" e header novo | `24-183` | — |
| Seção Minha conta | `318-11085` | `318-11085` |
| 01 · Identifique-se | `318-11096` | `318-12560` |
| 02 · Celular preenchido | `318-11163` | `318-12608` |
| 03 · Código pelo WhatsApp | `318-11228` | `318-12656` |
| 04 · Código por SMS | `318-11303` | `318-12712` |
| 05 · Código incorreto | `318-11376` | `318-12768` |
| 06 · Código reenviado | `318-11451` | `318-12826` |
| 07 · Minha conta | `318-11523` | `318-12881` |
| 08 · Dados pessoais | `318-11597` | `318-12920` |
| 09 · Alterar celular | `318-11675` | `318-12975` |
| 10 · Confirmar novo celular | `318-11756` | `318-13035` |
| 11 · Celular já vinculado | `318-11837` | `318-13099` |
| 12 · Endereços | `318-11887` | `318-13128` |
| 13 · Adicionar ou editar endereço | `318-11952` | `318-13168` |
| 14 · Remover endereço | `318-12030` | `318-13227` |
| 15 · Formas de pagamento | `318-12080` | `318-13256` |
| 16 · Adicionar cartão | `318-12135` | `318-13288` |
| 17 · Remover cartão | `318-12222` | `318-13356` |
| 18 · Meus pedidos | `318-12272` | `318-13385` |
| 19 · Acompanhar pedido | `318-12340` | `318-13430` |
| 20 · Pedido entregue | `318-12402` | `318-13471` |
| 21 · Nenhum pedido ainda | `318-12460` | `318-13512` |
| 22 · Sair | `318-12510` | `318-13541` |
| Componentes da conta (cards de endereço, cartão e pedido) | `318-11091` | `318-11091` |
| Acompanhamento · Pedido realizado | `351-14130` | `351-16013` |
| Acompanhamento · Pagamento confirmado | `351-14399` | `351-16251` |
| Acompanhamento · Pedido em preparação | `351-14668` | `351-16489` |
| Acompanhamento · Aguardando retirada | `351-14937` | `351-16727` |
| Acompanhamento · Pedido retirado | `351-15206` | `351-16965` |
| Acompanhamento · Pedido chegou | `351-15475` | `351-17203` |
| Acompanhamento · Pedido entregue | `351-15744` | `351-17441` |
| Pins do mapa (loja, entrega, entregador) | `372-13339` | `372-13339` |

Não há tela para "Pedido a caminho": segue a de "Pedido retirado", com a moto mais perto do destino. Os pins aprovados estão em `output/map-pins/v1/` (loja, entrega e entregador, em PNG e WebP).

## Header

- O botão do Carrinho perde o texto "Carrinho": fica o ícone com o contador. O nome acessível continua "Carrinho · N".
- O "Entregar em" sai do header.
- À direita do Carrinho, o botão "Identifique-se" (ícone de pessoa). Com o cliente identificado, mostra o primeiro nome (cortado com reticências se não couber) e abre Minha conta.
- O botão "Identifique-se" abre a Identificação (telas 01–06). Ao confirmar o celular, o cliente volta para a página de onde saiu, já com o nome no header. O Novo cliente informa o nome (obrigatório) e o e-mail (opcional) antes de voltar, como no Checkout.
- A identificação é uma só: quem se identifica pelo header pula a Identificação do Checkout, e vice-versa.

## Endereço de entrega no cardápio

- Cada categoria do cardápio (Hambúrgueres, Acompanhamentos, Bebidas, Sobremesas) tem, no topo à esquerda, a linha "Entregar em" (Figma `24-183`): ícone de pin, "Entregar em", o endereço e o botão "Alterar".
- Não aparece no Carrinho, em Ver ingredientes, no Checkout (que tem o card "Endereço de entrega"), em Minha conta nem no acompanhamento.
- Sem Endereço de entrega: "Onde vamos entregar?" e o botão "Informar endereço" no lugar de "Alterar".
- O Endereço de entrega é um só (ADR 0002): o escolhido no cardápio é o mesmo marcado no Checkout, e mudá-lo em um muda no outro.
- **Visitante** (sem Identificação): "Informar endereço" ou "Alterar" abre o fluxo de endereço sem pedir o celular — buscar ou "Usar localização atual", confirmar no mapa e os dados de entrega (rua, bairro, número, complemento, referência). Sem a seção "Como você quer salvar?". O botão final é "Entregar neste endereço", que volta para a categoria de origem com o endereço na linha "Entregar em". Um endereço atendido não gera mensagem.
- **Cliente identificado:** "Alterar" abre Seus endereços, como no Checkout. Escolher um endereço volta para a categoria de origem.
- **Fora da região:** a tela "Ainda não entregamos nessa região" de hoje. O Endereço de entrega anterior, se houver, não muda. "Voltar ao cardápio" volta à categoria de origem.
- **Visitante que se identifica depois:** o endereço escolhido continua sendo o Endereço de entrega, mesmo que o Cliente cadastrado tenha Endereços salvos. Ele não vira Endereço salvo sozinho: em Seus endereços, aparece no topo, marcado, com a opção de salvá-lo (Casa, Trabalho ou Favoritos).
- **Checkout:** não pula etapas. Com Endereço de entrega já escolhido, a etapa Endereço abre com ele marcado e o cliente confirma em "Entregar neste endereço".

## Sessão

- O cliente identificado, o Carrinho, o Endereço de entrega e os Pedidos da sessão ficam no `sessionStorage`: sobrevivem ao recarregar e acabam ao fechar a aba. Não é persistência real.
- **Sair** (tela 22) pede confirmação ("Sair" ou "Continuar conectado"). Confirmado, limpa o cliente e o Endereço de entrega, mantém o Carrinho, volta o header para "Identifique-se" e leva ao cardápio. O Voltar do navegador não reabre páginas privadas.
- **Páginas privadas** (Minha conta e tudo dentro dela, acompanhamento): sem Identificação, passam pela Identificação e, confirmada, seguem para a página pedida.

## Minha conta

- Título da página no topo; navegação lateral no desktop (lista sem aparência de botão, a seção atual em vermelho com indicador à esquerda) e lista expansível no mobile (a seção atual fechada; escolher um destino recolhe a lista). Itens: Minha conta, Dados pessoais, Endereços, Formas de pagamento, Meus pedidos e, separado por um divisor, Sair.
- **Minha conta** (tela 07): "Olá, <primeiro nome>", o celular vinculado e "Editar meus dados" (leva a Dados pessoais). Com Pedido em andamento, o card "Pedido em andamento" do mais recente: identificador, horário, Situação do pedido, previsão, quantidade de itens e Total do pedido, com "Acompanhar pedido". Depois, "Ver todos os pedidos". Sem Pedido em andamento, não há card.
- **Dados pessoais** (telas 08–11): nome (obrigatório) e e-mail (opcional, validado se preenchido), "Salvar alterações" e "Cancelar"; o celular só para leitura, com "Alterar celular". Salvar atualiza o header e mostra um toast.
- **Alterar celular:** o novo celular recebe um Código de confirmação (WhatsApp ou SMS, com reenviar e troca de canal). O antigo vale até a confirmação. Celular já ligado a outro cadastro mostra "Celular já vinculado", com "Informar outro celular" e "Voltar aos meus dados", sem juntar cadastros. Confirmado, o cadastro continua o mesmo, com o novo celular.
- **Endereços** (telas 12–14): os Endereços salvos em cards (rótulo, endereço, complemento, referência), com "Editar endereço" e "Remover endereço" (vermelho, sem fundo nem borda), e "Adicionar endereço". Adicionar e editar usam o fluxo de endereço de hoje (busca, mapa, dados, "Como você quer salvar?"). Remover pede confirmação ("Remover endereço" ou "Manter endereço"). Remover o Endereço de entrega atual o limpa. Sem endereços, o estado vazio oferece "Adicionar endereço".
- **Formas de pagamento** (telas 15–17): os Cartões salvos ("Visa · final 4242", nome e validade, "Cartão padrão" no primeiro) com "Remover cartão", "Adicionar cartão" e a nota sobre o Pix no Checkout. Adicionar usa os campos e as validações do Novo cartão e só guarda o cartão, sem cobrança. Remover pede confirmação ("Remover cartão" ou "Manter cartão"); removido o Cartão padrão, o seguinte assume. Sem cartões, o estado vazio oferece "Adicionar cartão".
- Alterações no cadastro não mudam Pedidos já feitos.

## Meus pedidos

- Tela 18: "Em andamento" e "Histórico de pedidos", os mais recentes primeiro. Cada card: "Pedido #BK-…", data e horário, Situação do pedido, previsão (em andamento), "Entrega em <rótulo> · BK Bela Vista · <distância>", resumo dos itens e Total do pedido. Em andamento: "Acompanhar pedido"; histórico: "Ver detalhes".
- Só Pedidos confirmados aparecem, inclusive os cancelados.
- Tela 21 (Novo cliente ou ninguém com Pedidos): "Nenhum pedido ainda", com "Explorar o cardápio" e "Voltar à minha conta".

## Acompanhamento

- "Acompanhar pedido" na confirmação do Checkout (Pix e cartão) abre o acompanhamento do Pedido confirmado, no lugar do toast de hoje. Minha conta e Meus pedidos abrem o mesmo acompanhamento. Não cria Pedido nem restaura o Carrinho.
- **Situação:** card do topo com a Situação do pedido, "Chega entre …" e "Pedido #… · <data>, <hora>".
- **Linha do tempo** ("Situação do pedido"): as 8 etapas em pontos ligados por uma linha contínua. Concluídas com o horário e "Concluído"; a atual em vermelho, com o horário e "Em andamento"; as futuras em cinza com "Próxima etapa".
- **Mapa** ("Acompanhe sua entrega"): base OSM do fluxo de endereço, com a atribuição; coroa na loja, pin laranja no destino e, a partir de "Pedido retirado", a moto. A rota em vermelho segue as ruas. Abaixo: "BK → <rótulo> · <distância>", a distância restante e "Localização atualizada agora", e o endereço de entrega.
- **Entregador:** a partir de "Pedido retirado", "Carlos · seu entregador", "Honda CG · placa ABC •••4" e "WhatsApp do entregador".
- **Loja:** sempre "Burger King · Bela Vista", "Loja responsável pelo seu pedido" e "WhatsApp da loja".
- **Itens do pedido:** os Itens com quantidade, Personalização, Combo e Bebida do combo, o Total dos itens, a Taxa de entrega, o Total do pedido, o endereço e a forma de pagamento mascarada.
- **Avanço:** as etapas avançam a cada ~10 s, contadas a partir da confirmação do Pedido, de modo que recarregar ou sair e voltar retoma no ponto certo. Os horários de cada etapa são os momentos em que foram alcançadas. A moto percorre a rota de "Pedido retirado" a "Pedido chegou". Não há aviso de demonstração.
- **Entregue ou histórico** ("Ver detalhes", tela 20 sem o mapa e sem o entregador): "Pedido entregue" e "Entregue em <data>, às <hora>", a linha do tempo concluída, o card da loja com "WhatsApp da loja" e os Itens do pedido.
- **Cancelado:** "Pedido cancelado", a data, a linha do tempo só com as etapas que aconteceram, terminando em "Cancelado", e "O valor será devolvido na mesma forma de pagamento.", sem prazo. Card da loja e Itens do pedido como no entregue.
- **WhatsApp:** os dois botões abrem `https://wa.me/5561999077204` com a mensagem "Olá, vi seu projeto do Burger King e gostei bastante. Podemos conversar?", em nova aba. Número e mensagem são da demonstração.

## Situações fixas

| Situação | Resultado |
| --- | --- |
| Cliente cadastrado Mariana Silva ((61) 99999-1234) | Os dados de hoje em `checkout-fixtures.js`, mais o histórico abaixo |
| #BK-10482 | Em andamento ("Pedido retirado"), Whopper + acompanhamento, R$ 78,80; aparece só quando não há Pedido da sessão em andamento |
| #BK-10397 | Entregue em 8 de outubro, 12h24 → 13h02, R$ 121,50 |
| #BK-10276 | Confirmado em 3 de outubro, 20h06, e cancelado pela loja em "Pedido em preparação" |
| Novo cliente | Sem Pedidos; sem Endereços salvos; sem Cartões salvos |
| Alterar celular para (61) 90000-0000 | "Celular já vinculado" |
| Loja | Burger King · Bela Vista, para qualquer endereço atendido |
| Rota | Fixa, pela rua, da loja ao destino, com 2,4 km |

## Testes

Playwright, no padrão dos testes do Checkout: header (visitante, identificado, Sair), "Entregar em" (vazio, visitante, identificado, fora da região, persistência ao recarregar, Checkout com o endereço marcado), Identificação pelo header e páginas privadas, cada seção de Minha conta, Meus pedidos (com e sem Pedidos), o avanço do acompanhamento (com o tempo controlado), entregue e cancelado, os links do WhatsApp e os layouts desktop e mobile sem rolagem horizontal.

## Fora do escopo

Persistência real, serviços de código, pagamento, roteamento e posição do entregador; retirada pelo próprio cliente; chat interno.
