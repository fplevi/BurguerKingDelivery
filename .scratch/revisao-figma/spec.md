# Revisão da interface pelas telas do Figma

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, spec do Cheddar Duplo em `.scratch/cheddar-duplo/spec.md` (resolvida). Decisões tiradas da sessão de grilling de 2026-10-10.

Telas de referência (arquivo Figma `BElIaiOW5D1qFF8QStnoDo`):

| Tela | node-id |
| --- | --- |
| Hambúrgueres ≥ 1920px | `156-4442` |
| Hambúrgueres desktop < 1920px | `24-183` |
| Hambúrgueres celular e tablet | `168-4693` |
| Comportamento do card do hambúrguer | `80-1630` |
| Card com combo desmarcado | `80-1169` |
| Acompanhamentos | `40-509` |
| Bebidas | `49-1104` |
| Sobremesas | `127-2594` |
| Card das outras categorias | `84-1283` |

## Problem Statement

O protótipo foi desenhado antes das telas finais do Figma. O card de compra ainda tem tamanhos P/M/G e não tem Bebida do combo nem Quantidade; o botão se chama "Remover ingredientes"; a página tem um único layout em vez dos três do Figma; e Acompanhamentos, Bebidas e Sobremesas são links mortos.

## Solution

Alinhar o protótipo às telas do Figma, mantendo o 3D no hero (as fotos do Figma no hero são só marcação). O foco continua em Whopper e Cheddar Duplo; os outros produtos são só foto. É um case para o Behance, não um site publicado.

## User Stories

1. Como cliente, quero transformar o hambúrguer em Combo e escolher a Bebida do combo entre as bebidas do cardápio.
2. Como cliente, quero ser avisado se esquecer a Bebida do combo, em vez de adicionar um combo incompleto.
3. Como cliente, quero escolher a Quantidade e receber todas as unidades com a mesma Personalização.
4. Como cliente, quero que o card e o hambúrguer voltem ao padrão depois de adicionar, para montar o próximo Item do zero.
5. Como cliente, quero que a descrição do hambúrguer deixe de citar o que eu retirei.
6. Como cliente, quero ver Acompanhamentos, Bebidas e Sobremesas com foto, preço e quantidade, e adicioná-los ao carrinho.
7. Como cliente, quero ir e voltar entre as categorias sem perder o que selecionei nem a Personalização ainda não adicionada.
8. Como cliente em tela grande (≥ 1920px), quero o hero e a grade lado a lado, sem rolar a página.
9. Como cliente no celular ou tablet, quero tudo numa coluna, na ordem do Figma.
10. Como responsável pelo case, quero capturas dos três layouts para o Behance.

## Implementation Decisions

- **Ver ingredientes:** novo nome do botão e da tela antes chamados "Remover ingredientes" / "Alterar ingredientes" (glossário já atualizado). Só muda o nome; o comportamento continua.
- **Combo sem tamanhos:** P/M/G saem; o Combo soma R$ 12,00 fixos (Whopper: R$ 31,90 sem combo, R$ 43,90 com).
- **Bebida do combo:** seletor com placeholder "Selecione uma bebida", desabilitado enquanto o Combo estiver desmarcado (Figma `80-1169`), nunca preenchido por padrão. Opções, todas pelo mesmo preço: Coca-Cola, Coca-Cola Zero, Sprite, Fanta Laranja, Natural One Laranja, Natural One Uva, Água de Copo.
- **Combo sem bebida:** "Adicionar ao carrinho" continua ativo; ao clicar, o seletor ganha borda vermelha com a mensagem "Escolha a bebida do combo" e recebe o foco.
- **Estado padrão do card do hambúrguer:** Combo desmarcado (o Figma mostra marcado; a decisão é não empurrar o combo), Bebida do combo vazia e desabilitada, Quantidade 1, sem Personalização (3D com todos os ingredientes). Vale ao carregar a página, ao trocar de hambúrguer e depois de adicionar ao carrinho; depois de adicionar, o hambúrguer selecionado continua o mesmo.
- **Quantidade e Personalização:** um Item tem uma quantidade e todas as unidades são iguais. Para outra versão, o cliente muda os ingredientes e adiciona de novo. Um Item idêntico (produto, Personalização, Combo, bebida) soma na quantidade do que já está no carrinho.
- **Descrição pelas Camadas:** cada Camada retirável tem um trecho com adjetivo; a descrição lista as Camadas presentes e acompanha a Personalização aplicada. Whopper completo: "Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup, cebola, tomate fresco, alface crocante e maionese." ("molho especial" do Figma vira ketchup e maionese; sai "Seu favorito, do seu jeito."). Cheddar Duplo: "cheddar cremoso" só sai quando os dois cheddars forem retirados. Tudo retirado: "Pão com gergelim e carne grelhada." A linha "Preparado com todos os ingredientes / sem X" deixa de existir.
- **Os outros 6 hambúrgueres:** sem "Em breve"; mesma aparência e hover dos demais, mas clicar não faz nada (o selo "Selecionado" fica onde está, sem mensagem). A nota "Em breve" sai do rodapé do protótipo.
- **Categorias só de foto:** Acompanhamentos, Bebidas e Sobremesas usam o mesmo modelo: título, foto estática, descrição, card com Quantidade, Total do item e Adicionar ao carrinho (Figma `84-1283`), grade "Escolha seu …" com selo "Selecionado". Todos os produtos são selecionáveis. Sem 3D e sem Ver ingredientes.
- **Navegação:** Hambúrgueres, Acompanhamentos (antes "Batatas"), Bebidas, Sobremesas, com o item ativo sublinhado; trocar de categoria troca o conteúdo na mesma página (hash, por exemplo `#bebidas`). Cada categoria lembra o produto selecionado (e o hambúrguer, a Personalização) enquanto a página estiver aberta.
- **Produto inicial de cada categoria:** Whopper, Batata Frita, Coca-Cola, BK Mix de Brownie.
- **Fotos:** `Assets/sides/official`, `Assets/drinks/official`, `Assets/desserts/official` (sobremesas corrigidas em 2026-10-10). O BK Mix Crocante usa `site_BK_Mix_Ovomaltine.png`. Nomes e ordem das grades seguem o Figma.
- **Preços:** todos ilustrativos; nunca "Consultar preço". Usar os do Figma (Batata Frita R$ 9,90, Coca-Cola R$ 9,90, BK Mix de Brownie R$ 23,90) e pesquisar na internet os que faltarem.
- **Pontos de quebra:**
  - < 1024px (celular e tablet): uma coluna: título → 3D → Ver ingredientes → descrição → card → grade em 2 colunas; navegação em abas roláveis abaixo do cabeçalho, carrinho só com ícone e contador.
  - 1024–1919px: hero com título e card à esquerda e 3D à direita, Ver ingredientes e descrição abaixo do 3D; grade em 4 colunas abaixo do hero.
  - ≥ 1920px: hero na altura da tela (página sem rolagem) e coluna lateral "Escolha seu …" em 2 colunas com rolagem própria.
- **Cabeçalho:** logo, "Entregar em" com seta (só visual), navegação, carrinho com contador. O fluxo de endereço é outra frente.
- **Carrinho:** o painel lateral atual, com o mínimo de esforço: nome × quantidade, "Combo · <bebida>", "Sem: …" e total do Item.

## Testing Decisions

- A mesma costura: a página no navegador real, via Playwright, por papéis e rótulos acessíveis.
- Comportamentos novos: Combo soma R$ 12,00; Bebida do combo desabilitada sem Combo e vazia por padrão; erro e foco ao adicionar combo sem bebida; Quantidade multiplica o total; Item idêntico soma no carrinho; volta ao padrão depois de adicionar; descrição sem o ingrediente retirado (incluindo os dois cheddars); hambúrgueres sem Receita não trocam o hero; troca de categoria e memória da seleção; adicionar acompanhamento, bebida e sobremesa; layout em 390, 1280 e 1920 de largura (coluna lateral com rolagem própria em 1920).
- Testes existentes que citam P/M/G, "Remover ingredientes", "Alterar ingredientes" ou "Em breve" mudam junto.
- Capturas de revisão nos três layouts, revisadas por humano ao lado do Figma.

## Out of Scope

- Fluxo de endereço (seletor "Entregar em").
- Tela de carrinho do Figma (ainda em desenho).
- 3D ou Receita para outros produtos além de Whopper e Cheddar Duplo.
- Publicação online.

## Further Notes

- O trabalho segue na branch `feat/revisao-figma`, um ticket por vez, e termina em um PR para a `main`.
