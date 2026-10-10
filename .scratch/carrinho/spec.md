# Carrinho em tela própria pelas telas do Figma

Status: ready-for-agent

Contexto: `GLOSSARY.md` (Carrinho, Resumo do carrinho, Item, Total do item, Total dos itens, Combo, Bebida do combo, Personalização), `docs/adr/0001-visuais-gerados-por-codigo.md`, spec `.scratch/revisao-figma/spec.md` (card do hambúrguer, categorias por foto). Decisões tiradas da sessão de grilling de 2026-10-10.

Telas de referência (arquivo Figma `BElIaiOW5D1qFF8QStnoDo`):

| Tela | node-id |
| --- | --- |
| Carrinho / Web · fluxo (seção) | `187-5485` |
| Carrinho / Mobile · fluxo (seção) | `187-8185` |
| Web 01 · Carrinho | `187-5486` |
| Web 02 · Combo desmarcado | `187-5848` |
| Web 03 · Escolher bebida | `187-6208` |
| Web 04 · Lista de bebidas aberta | `187-6570` |
| Web 05 · Quantidade atualizada | `187-6968` |
| Web 06 · Item removido | `187-7330` |
| Web 07 · Carrinho vazio | `187-7609` |
| Web 08 · Bebida obrigatória | `187-7676` |
| Web · Visão completa | `189-16293` |

A tela "09 · Ver ingredientes" (`187-8042`) fica fora do escopo.

## Problem Statement

O carrinho atual é um modal mínimo (nome × quantidade, "Combo · bebida", "Sem: …", total e "Remover item"). O cliente não consegue ajustar o pedido depois de adicionar: não muda combo, bebida nem quantidade, e a personalização aparece como uma lista seca. O Figma tem uma tela de carrinho completa, em desktop e mobile.

## Solution

O Carrinho vira uma tela própria (rota `#carrinho`) em que cada Item pode ser ajustado com as mesmas regras do card de "Adicionar ao carrinho", com Resumo do carrinho, remoção com Desfazer e estado vazio. O checkout continua fora do escopo.

## User Stories

1. **Acessar o carrinho:** como cliente, quero abrir o carrinho em uma tela própria para revisar meu pedido com clareza. Abre como nova tela, sem modal.
2. **Revisar meus hambúrgueres:** como cliente, quero ver os ingredientes escolhidos para conferir a personalização de cada hambúrguer. Ingredientes em texto corrido; os retirados em destaque vermelho ("Sem picles e cebola").
3. **Transformar um hambúrguer em combo:** como cliente, quero marcar ou desmarcar "Transformar em combo" no carrinho. Cada hambúrguer mantém as mesmas opções do card.
4. **Escolher a bebida do combo:** como cliente, quero escolher a bebida de cada combo. O seletor fica desabilitado sem Combo, mantendo o espaço; a lista abre por cima, sem empurrar o resto.
5. **Ajustar a quantidade:** como cliente, quero mudar a quantidade de qualquer Item. Hambúrgueres têm quantidade e combo; os demais produtos, só quantidade.
6. **Conferir os valores:** como cliente, quero ver o Total do item atualizado conforme configuração e quantidade. Rótulo "Total do item"; só o total, sem separar hambúrguer e combo; o Resumo do carrinho acompanha.
7. **Remover um item:** como cliente, quero remover qualquer Item. Todos têm "Remover", e o Resumo do carrinho acompanha.
8. **Usar no desktop e no mobile:** no desktop, nome e "Remover" na mesma linha, Quantidade e Total do item lado a lado; no mobile, ingredientes em parágrafo com quebra de linha.

## Implementation Decisions

- **Rota:** o Carrinho é o hash `#carrinho` na mesma página, como as categorias. O cabeçalho continua igual; nenhuma categoria fica sublinhada; Voltar do navegador leva à categoria anterior. O modal atual sai.
- **Persistência:** o carrinho continua só em memória; recarregar esvazia.
- **Depois de adicionar:** o cliente fica no cardápio com o toast atual; não é levado ao Carrinho.
- **Cabeçalho da tela:** botão "Voltar ao cardápio", título "Seu carrinho" e subtítulo "N itens no carrinho" (quando unidades = Itens) ou "U unidades em N itens". O contador do cabeçalho conta unidades.
- **Voltar:** "Voltar ao cardápio", "Adicionar mais itens" e "Explorar cardápio" (estado vazio) levam à última categoria vista, com o estado que ela tinha.
- **Card do Item (hambúrguer):** foto, nome, "Remover"; "Ingredientes:" com o mesmo texto da descrição do hero (mesma fonte, mesma regra: "cheddar cremoso" só sai quando os dois cheddars forem retirados); abaixo, em vermelho, "Sem …" com cada Camada retirada pelo nome em minúsculas, unida por vírgula e "e", na ordem da Receita de baixo para cima ("Sem picles e cebola"; "Sem cheddar inferior"; "Sem cheddar inferior e cheddar superior"); sem nada retirado, linha neutra "Todos os ingredientes". Depois de um divisor: "Transformar em combo", Bebida do combo, Quantidade e Total do item.
- **Card do Item (só foto):** foto, nome, "Remover", Quantidade e Total do item.
- **Combo no carrinho:** mesmas regras do card. Desmarcar apaga a bebida e desabilita o seletor (espaço mantido). O Total do item soma R$ 12,00 assim que o Combo é marcado, mesmo sem bebida.
- **Bebida do combo:** lista própria e acessível (padrão listbox), placeholder "Selecione uma bebida", as 7 bebidas; abre em sobreposição nos dois layouts.
- **Itens que ficam iguais:** editar combo ou bebida no carrinho nunca funde Itens; a soma de Item idêntico continua valendo só ao adicionar pelo cardápio.
- **Quantidade:** de 1 a 99; "−" desabilitado em 1 (para tirar o Item, só "Remover").
- **Total do item:** preço unitário (com Combo) × quantidade; um valor só.
- **Resumo do carrinho:** "Resumo do carrinho", "Total dos itens" com o valor, "Entrega calculada na próxima etapa.", botões "Continuar" e "Adicionar mais itens".
- **Continuar:** valida os combos sem bebida: o primeiro ganha borda vermelha e "Escolha a bebida do combo" (Figma 08), a tela rola até ele e o seletor recebe o foco. Tudo certo: toast avisando que o pagamento não faz parte do protótipo.
- **Remover:** o Item sai na hora; aviso "<nome> removido do carrinho." com "Desfazer" (Figma 06), visível até a próxima mudança no carrinho ou até sair da tela. "Desfazer" devolve o Item na mesma posição e configuração. Remover o último Item mostra o estado vazio com o aviso.
- **Estado vazio:** "Seu carrinho está vazio", "Escolha seus favoritos para começar.", botão "Explorar cardápio" (Figma 07).
- **Whopper®:** "Whopper Clássico" passa a ser "Whopper®" em todo o protótipo (hero, grade, toast, carrinho, aviso), nos testes e nos documentos vivos; specs resolvidas ficam como histórico. Cheddar Duplo segue sem ®. As telas do Figma não mudam nesta frente.
- **Layouts:**
  - ≥ 1024px: lista de Itens à esquerda e Resumo do carrinho à direita; nome e "Remover" na mesma linha; Bebida do combo, Quantidade e Total do item lado a lado.
  - < 1024px: uma coluna; "Remover" abaixo do nome; ingredientes em parágrafo com quebra; barra fixa no rodapé com Total dos itens e "Continuar"; Resumo do carrinho no fim da lista.

## Testing Decisions

- A mesma costura: a página no navegador real, via Playwright, por papéis e rótulos acessíveis.
- Comportamentos novos: abrir e voltar do Carrinho (incluindo Voltar do navegador e a categoria lembrada); subtítulo itens/unidades; texto dos ingredientes e linha "Sem …" (Whopper e os dois casos de cheddar); marcar/desmarcar combo atualiza Total do item e Total dos itens; bebida desabilitada sem combo; lista de bebidas não empurra o layout; quantidade com "−" desabilitado em 1; Itens editados não se fundem; Remover e Desfazer na mesma posição; estado vazio; Continuar com combo sem bebida (erro e foco) e sem pendências (toast); layout em 390 e 1280 de largura.
- Testes que citam o modal do carrinho, "Remover item" ou "Whopper Clássico" mudam junto.
- Capturas de revisão em 390 e 1280, revisadas por humano ao lado do Figma.

## Out of Scope

- Checkout, entrega e pagamento.
- Reabrir Ver ingredientes a partir do Carrinho (Figma 09).
- Persistir o carrinho entre recarregamentos.
- Atualizar as telas do Figma para "Whopper®".

## Further Notes

- O trabalho segue na branch `feat/carrinho`, criada sobre `feat/revisao-figma` (PR fplevi/BurguerKingNewSite#5 ainda aberto). Depois do merge do #5, rebase na `main`; o PR do carrinho só sai depois disso.
