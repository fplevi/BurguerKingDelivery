# Checkout — histórias de usuário

Referência: [Checkout no Figma](https://www.figma.com/design/BElIaiOW5D1qFF8QStnoDo/BK?node-id=218-7464).

Versões: desktop e mobile. Atualizado com o indicador de etapas e a ação Acompanhar pedido nas confirmações por Pix e cartão.

## US01 — Iniciar o checkout

Como cliente, quero continuar a partir do carrinho em uma página própria, para concluir meu pedido.

Critérios de aceite:
- O checkout abre pela ação Continuar do carrinho.
- O celular é a primeira informação solicitada.
- Itens, quantidades, Personalizações e Combos são preservados.
- É possível voltar ao carrinho para revisar o pedido.

## US02 — Confirmar minha identidade pelo celular

Como cliente, quero confirmar meu celular com um código, para acessar meus dados com segurança.

Critérios de aceite:
- Solicitar celular com DDD.
- Oferecer envio pelo WhatsApp e alternativa por SMS.
- Permitir informar o código de seis dígitos e confirmar.
- Recuperar os dados existentes somente após a confirmação, sempre que o celular for informado.
- Permitir alterar o celular.
- Informar código incorreto e impedir o avanço até uma confirmação válida.

## US03 — Reenviar o código de confirmação

Como cliente, quero solicitar um novo código ou trocar o canal de envio, para continuar quando não receber a mensagem.

Critérios de aceite:
- Disponibilizar Reenviar código e alternativa por SMS.
- Informar o destino do envio.
- Apresentar feedback de reenvio no padrão de toast do projeto.
- Manter a etapa de confirmação até o código ser validado.

## US04 — Completar meu cadastro

Como novo cliente, quero informar meus dados básicos após confirmar o celular, para me identificar na entrega.

Critérios de aceite:
- Solicitar nome completo obrigatório.
- Oferecer e-mail opcional.
- Reutilizar o celular já confirmado.
- Encaminhar para a escolha do endereço.
- Clientes já cadastrados têm seus dados recuperados após a validação, sem repetir o cadastro.

## US05 — Escolher o endereço de entrega

Como cliente, quero escolher ou cadastrar um endereço, para receber o pedido no local correto.

Critérios de aceite:
- Reutilizar o fluxo de endereço em páginas próprias.
- Permitir selecionar endereços salvos ou consultar endereços de pedidos anteriores.
- Permitir busca por texto, localização atual e ajuste do marcador no mapa.
- Confirmar a posição e complementar os dados de entrega.
- Permitir identificar o endereço como Casa, Trabalho ou Favoritos.
- Permitir editar ou remover endereços pelo menu de três pontos.
- Retornar ao checkout com o endereço escolhido.

## US06 — Conferir a disponibilidade e as condições de entrega

Como cliente, quero saber se meu endereço é atendido, qual é a taxa e qual é a previsão de entrega, para decidir antes de pagar.

Critérios de aceite:
- Apresentar endereço, complemento e referência no checkout.
- Exibir taxa e estimativa de entrega antes da confirmação do pagamento.
- Permitir alterar o endereço e manter a forma de pagamento escolhida.
- Para uma região não atendida, informar a indisponibilidade e oferecer a escolha de outro endereço.
- Impedir a conclusão do pedido para um endereço não atendido.

## US07 — Revisar os valores do pedido

Como cliente, quero conferir os itens e o valor final, para entender o que estou comprando e quanto vou pagar.

Critérios de aceite:
- Exibir produto, quantidade e Total do item.
- Para hambúrgueres, exibir Combo, Bebida do combo e Personalização.
- Apresentar os ingredientes retirados em texto corrido e vermelho, como “Sem cebola e picles”.
- Calcular Total do item a partir do valor unitário com o Combo, quando selecionado, multiplicado pela quantidade.
- Exibir Total dos itens, taxa de entrega e Total do pedido.
- Calcular Total do pedido como Total dos itens mais a taxa de entrega.
- Oferecer Editar carrinho.
- Não apresentar campo de cupom.

## US08 — Escolher a forma de pagamento

Como cliente, quero escolher entre Pix e cartão de crédito, para pagar da maneira que prefiro.

Critérios de aceite:
- Oferecer Pix e cartão de crédito como opções de seleção única.
- Destacar a opção selecionada.
- Adaptar os campos e a ação principal à opção escolhida.
- Para cartão, informar pagamento à vista, sem parcelamento.
- Exibir o total antes da confirmação.

## US09 — Pagar com Pix

Como cliente, quero pagar por QR Code ou código Pix, para concluir meu pedido pelo aplicativo do banco.

Critérios de aceite:
- Gerar o Pix após a confirmação do pedido.
- Apresentar QR Code, ação Copiar código Pix, valor e prazo de validade.
- Exibir toast ao copiar o código.
- Apresentar o estado Aguardando pagamento.
- Confirmar o pagamento a partir da aprovação, e não apenas da cópia ou leitura do QR Code.
- Oferecer a troca da forma de pagamento enquanto aguarda.
- Representar aprovação e confirmação do pedido.

## US10 — Gerar um novo Pix após a expiração

Como cliente, quero gerar outro Pix quando o anterior expirar, para concluir o pagamento sem refazer o pedido.

Critérios de aceite:
- Informar que o código expirou.
- Oferecer Gerar novo Pix ou outra forma de pagamento.
- Preservar os dados do pedido e apresentar a validade do novo código.
- Retornar ao estado Aguardando pagamento.

## US11 — Pagar com cartão de crédito

Como cliente, quero usar um cartão salvo ou informar um novo cartão, para pagar meu pedido à vista.

Critérios de aceite:
- Listar cartões salvos com identificação da bandeira e número mascarado.
- Permitir selecionar um cartão salvo e informar o código de segurança.
- Permitir adicionar um novo cartão com número, nome impresso, validade e código de segurança.
- Oferecer Salvar cartão para os próximos pedidos, desmarcado inicialmente.
- Solicitar confirmação com o valor total.
- Exibir processamento antes do resultado.

## US12 — Corrigir uma falha de pagamento

Como cliente, quero entender quando o pagamento falhar e poder tentar novamente, para concluir o pedido.

Critérios de aceite:
- Informar a falha de maneira clara.
- Permitir revisar os dados, adicionar outro cartão ou selecionar Pix.
- Manter itens, Personalizações e endereço.
- Não apresentar o pedido como confirmado antes da aprovação.

## US13 — Receber a confirmação do pedido

Como cliente, quero ver a confirmação após a aprovação do pagamento, para saber que meu pedido foi recebido.

Critérios de aceite:
- Exibir Pedido confirmado, identificador do pedido e previsão de entrega.
- Mostrar endereço, resumo, taxa, total e forma de pagamento.
- Mascarar os dados do cartão quando utilizado.
- Oferecer Voltar ao cardápio.
- Encerrar o carrinho correspondente ao pedido confirmado.
- Não oferecer edição do carrinho comprado na tela de confirmação.
- Exibir Acompanhar pedido como ação principal em todas as confirmações, no desktop e no mobile.
- Manter Voltar ao cardápio como ação secundária, com contorno.

## US14 — Entender meu progresso no checkout

Como cliente, quero visualizar a etapa atual e as etapas que já completei, para entender o que falta para finalizar meu pedido.

Critérios de aceite:
- Usar a sequência Identificação → Endereço → Pagamento no desktop e no mobile.
- Ligar os círculos das etapas com uma linha posicionada atrás deles.
- Destacar a etapa atual em vermelho, com seu número e nome.
- Representar etapas anteriores concluídas com uma marca de verificação.
- Representar as próximas etapas com círculos de contorno e seus números.
- Não exibir os textos Etapa atual, Pendente ou Concluído abaixo dos nomes.
- Manter Identificação como etapa atual ao informar o celular, validar o código e completar o cadastro de um novo cliente.
- Mostrar Endereço como etapa atual enquanto o cliente seleciona, cadastra ou altera o endereço.
- Mostrar Identificação e Endereço concluídos ao chegar ao pagamento.
- Manter Pagamento como etapa atual enquanto aguarda Pix, processa cartão ou corrige falhas.
- Marcar todas as etapas como concluídas somente após a aprovação do pagamento.

## US15 — Acessar o acompanhamento do pedido confirmado

Como cliente, quero acessar o acompanhamento a partir da confirmação, para consultar o andamento do pedido que acabei de fazer.

Critérios de aceite:
- Oferecer o botão Acompanhar pedido nas confirmações de Pix e cartão, no desktop e no mobile.
- Posicionar o botão antes de Voltar ao cardápio e dar a ele o destaque de ação principal.
- Ao integrar a futura tela, abrir Acompanhar pedido como uma página, levando o identificador do pedido confirmado.
- Não iniciar um novo checkout nem recuperar um carrinho comprado ao acompanhar o pedido.
- Nesta entrega de design, deixar o botão pronto; a tela de acompanhamento e sua conexão no protótipo serão desenvolvidas depois.
- O detalhamento dos estados de acompanhamento será definido junto com a futura tela.

## US16 — Concluir o checkout no celular

Como cliente, quero concluir meu pedido em uma interface adaptada ao celular, para comprar sem dificuldade em uma tela pequena.

Critérios de aceite:
- Manter as mesmas regras de identificação, endereço, pagamento e confirmação do desktop.
- Organizar o conteúdo em uma coluna, com rolagem vertical.
- Nas telas de seleção e preenchimento de pagamento, manter Total do pedido e a ação de pagamento fixos no rodapé.
- Garantir que o conteúdo rolável não fique inacessível atrás do rodapé.
- Exibir complemento e referência em linhas separadas no cartão de endereço.
- Posicionar o divisor após todas as informações do endereço, antes da previsão de entrega, com espaçamento entre os blocos.
- Manter os preços em #502314, as fontes do BK e os contornos dos botões secundários.

## Referências de protótipo e limites

- O protótipo usa 10 minutos como validade de referência do Pix; o prazo de produção deve ser definido com a integração.
- Valores, identificador do pedido, dados pessoais, cartões e QR Code são demonstrativos.
- Não há pagamento real nem envio real de SMS ou WhatsApp no Figma.
- A tela Acompanhar pedido ainda não foi desenhada. Seus botões estão preparados visualmente, sem destino de navegação até a criação da página.
- Ainda precisam ser definidos na implementação: validade e limites de tentativas do código de confirmação, intervalo de reenvio e comportamento de falhas técnicas das integrações.

