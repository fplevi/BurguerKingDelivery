# Burger King · Delivery

Site de delivery focado em hambúrgueres, em que o cliente escolhe um produto e o personaliza retirando ingredientes.

## Montagem do hambúrguer

**Camada**:
Um ingrediente do hambúrguer tratado como peça separável, com aparência própria, tanto montado quanto isolado.
_Avoid_: Layer, fatia, peça

**Receita**:
A lista ordenada, de baixo para cima, das Camadas de um produto; define quais formam a Base. Cada produto tem a sua.
_Avoid_: Composição, lista de ingredientes

**Base**:
As camadas que não podem ser retiradas: pães e carnes (o Whopper tem uma carne; o Cheddar Duplo, duas).
_Avoid_: Camadas travadas, fixas

**Ingrediente retirado**:
Camada que o cliente tirou do hambúrguer; aparece na bandeja até ser recolocada.
_Avoid_: Ingrediente removido, excluído

**Bandeja**:
Área ao lado do hambúrguer aberto onde ficam os ingredientes retirados.
_Avoid_: Lixeira, área de descarte, dragzone

**Personalização**:
O conjunto de ingredientes retirados que o cliente confirmou ao aplicar; acompanha o Item e vale para todas as unidades dele.
_Avoid_: Customização, configuração

## Pedido

**Item**:
Um produto adicionado ao carrinho com sua quantidade e, no caso do hambúrguer, sua Personalização e seu Combo; todas as unidades do Item são iguais. O cliente remove um Item; uma Camada, ele retira.
_Avoid_: Linha, produto do carrinho, retirar item

**Total do item**:
O valor de um Item: preço unitário, já com o Combo quando marcado, vezes a quantidade.
_Avoid_: Subtotal, preço do item

**Total dos itens**:
A soma dos Totais do item do carrinho, sem a entrega.
_Avoid_: Subtotal

**Taxa de entrega**:
O valor cobrado pela entrega no endereço escolhido; só é conhecido depois da escolha de um endereço atendido.
_Avoid_: Frete

**Total do pedido**:
O Total dos itens mais a Taxa de entrega; é o valor pago.
_Avoid_: Valor final, total geral

**Combo**:
Opção do hambúrguer que acrescenta uma Bebida do combo por um valor fixo; não tem tamanhos.
_Avoid_: Combo P/M/G, refeição

**Bebida do combo**:
A bebida que o cliente escolhe para o Combo, entre as bebidas do cardápio; só existe com o Combo marcado.
_Avoid_: Refrigerante do combo

**Pedido**:
O que o cliente compra, criado em "Confirmar e pagar" a partir dos Itens do carrinho, com endereço e forma de pagamento; antes disso, só existe o carrinho.
_Avoid_: Compra, ordem

**Pedido confirmado**:
Um Pedido cujo pagamento foi aprovado; só então ganha identificador para o cliente e encerra o carrinho de que veio. Só Pedidos confirmados aparecem para o cliente depois, inclusive os cancelados.
_Avoid_: Pedido pago, pedido finalizado

**Situação do pedido**:
A etapa em que um Pedido confirmado está: Pedido realizado, Pagamento confirmado, Pedido em preparação, Aguardando retirada, Pedido retirado, Pedido a caminho, Pedido chegou e Pedido entregue, nessa ordem; ou Cancelado, que encerra a sequência. Retirada é a do entregador na loja.
_Avoid_: Status, Saiu para entrega, Em rota

## Cliente

**Código de confirmação**:
Os seis dígitos enviados ao celular do cliente, por WhatsApp ou SMS, para provar que o celular é dele.
_Avoid_: Token, OTP, PIN, senha

**Cliente cadastrado**:
Cliente cujo celular confirmado já tem dados guardados (nome, endereços, cartões), recuperados só depois da confirmação.
_Avoid_: Cliente logado, usuário

**Novo cliente**:
Cliente cujo celular confirmado ainda não tem dados; informa o nome (e, se quiser, o e-mail) antes de seguir.
_Avoid_: Visitante, convidado

**Endereço de entrega**:
O endereço escolhido para o Pedido em montagem; é um só, visível no cardápio e no Checkout, e mudá-lo em um muda no outro.
_Avoid_: Localização, endereço atual, Entregar em

**Endereço salvo**:
Endereço que o cliente guardou e identificou como Casa, Trabalho ou Favoritos.
_Avoid_: Endereço cadastrado, endereço favorito

**Cartão salvo**:
Cartão que o cliente guardou para os próximos Pedidos, mostrado só pela bandeira e pelos quatro últimos dígitos; nunca guarda o código de segurança.
_Avoid_: Cartão cadastrado, cartão favorito

**Cartão padrão**:
O primeiro Cartão salvo, já marcado no Pagamento; ao removê-lo, o seguinte assume.
_Avoid_: Cartão principal, cartão preferido

**Endereço de pedido anterior**:
Endereço usado em um Pedido confirmado anterior, oferecido para reutilizar sem estar entre os Endereços salvos.
_Avoid_: Histórico, endereço recente

## Telas

**Ver ingredientes**:
A tela em tela cheia em que o cliente abre o hambúrguer em camadas, retira e recoloca ingredientes e aplica ou cancela a personalização.
_Avoid_: Alterar ingredientes, Remover ingredientes, Playground, editor, menu de ingredientes, Do seu jeito

**Carrinho**:
A tela própria, fora do cardápio, em que o cliente revisa e ajusta os Itens antes de continuar.
_Avoid_: Sacola, modal do carrinho, cesta

**Resumo do carrinho**:
O bloco do Carrinho com o Total dos itens e as ações para continuar ou voltar ao cardápio.
_Avoid_: Totalizador

**Checkout**:
A tela própria "Finalizar pedido", aberta pelo Continuar do Carrinho, em que o cliente passa pelas etapas Identificação, Endereço e Pagamento.
_Avoid_: Finalização, pagamento (para a tela inteira)

**Resumo do pedido**:
O bloco do Checkout com os Itens, o Total dos itens e, depois de escolhido o endereço, a Taxa de entrega e o Total do pedido.
_Avoid_: Resumo do carrinho (são blocos diferentes)

**Minha conta**:
A tela própria do cliente identificado, com Dados pessoais, Endereços salvos, cartões salvos e seus Pedidos confirmados; é um lugar, não um cadastro com senha.
_Avoid_: Perfil, área do cliente, Minha conta como sinônimo de Cliente cadastrado

**Dados pessoais**:
A seção de Minha conta com o nome, o e-mail e o celular confirmado do cliente.
_Avoid_: Meus dados, perfil
