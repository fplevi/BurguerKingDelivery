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
_Avoid_: Lixeira, área de descarte

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
Um Pedido cujo pagamento foi aprovado; só então ganha identificador para o cliente e encerra o carrinho de que veio.
_Avoid_: Pedido pago, pedido finalizado

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

**Endereço salvo**:
Endereço que o cliente guardou e identificou como Casa, Trabalho ou Favoritos.
_Avoid_: Endereço cadastrado, endereço favorito

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
