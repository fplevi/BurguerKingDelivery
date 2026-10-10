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
O conjunto de ingredientes retirados que o cliente confirmou ao aplicar; acompanha o item no carrinho.
_Avoid_: Customização, configuração

## Telas

**Alterar ingredientes**:
A tela em tela cheia em que o cliente abre o hambúrguer em camadas, retira e recoloca ingredientes e aplica ou cancela a personalização.
_Avoid_: Playground, editor, menu de ingredientes, Do seu jeito
