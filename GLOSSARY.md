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
_Avoid_: Total do pedido, subtotal

**Combo**:
Opção do hambúrguer que acrescenta uma Bebida do combo por um valor fixo; não tem tamanhos.
_Avoid_: Combo P/M/G, refeição

**Bebida do combo**:
A bebida que o cliente escolhe para o Combo, entre as bebidas do cardápio; só existe com o Combo marcado.
_Avoid_: Refrigerante do combo

## Telas

**Ver ingredientes**:
A tela em tela cheia em que o cliente abre o hambúrguer em camadas, retira e recoloca ingredientes e aplica ou cancela a personalização.
_Avoid_: Alterar ingredientes, Remover ingredientes, Playground, editor, menu de ingredientes, Do seu jeito

**Carrinho**:
A tela própria, fora do cardápio, em que o cliente revisa e ajusta os Itens antes de continuar.
_Avoid_: Sacola, modal do carrinho, cesta

**Resumo do carrinho**:
O bloco do Carrinho com o Total dos itens e as ações para continuar ou voltar ao cardápio.
_Avoid_: Resumo do pedido, totalizador
