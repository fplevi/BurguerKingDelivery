# Cheeseburger em 3D

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`) e dos outros hambúrgueres, em especial o do Cheeseburger Duplo (`.scratch/cheeseburger-duplo/spec.md`), todas resolvidas.

## Problem Statement

Sete hambúrgueres são 3D: Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King, Cheeseburger Duplo e Rodeio. O Cheeseburger é o último card da grade sem Receita: parece igual aos outros, mas clicar nele não faz nada. O cliente não consegue escolhê-lo, ver suas Camadas nem retirar o queijo, o picles, o ketchup ou a mostarda.

## Solution

O Cheeseburger vira o oitavo hambúrguer 3D, só com código e o acabamento já aprovado. Ganha uma Receita própria, a do Cheeseburger Duplo com uma carne e um queijo; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Nenhum modelo de Camada novo. Com ele, todo card de hambúrguer tem Receita, e o caso do card sem Receita sai do código e dos testes.

## Receita do Cheeseburger

Conferida na foto oficial `site_Cheeseburger.png` e confirmada pelo responsável pelo produto. De baixo para cima:

| Camada | Nome na interface | Removível | Modelo |
| --- | --- | --- | --- |
| pão inferior | Pão inferior | não (Base) | pão inferior existente |
| carne | Carne grelhada | não (Base) | carne existente, `squash: 0.78` (como no Duplo) |
| queijo | Queijo | sim | queijo do Whopper, sem mudança |
| picles | Picles | sim | picles do Whopper, sem mudança |
| ketchup | Ketchup | sim | ketchup do Whopper, sem mudança |
| mostarda | Mostarda | sim | `mustard` do Cheeseburger Duplo, sem mudança |
| pão superior | Pão superior | não (Base) | pão superior existente, sem achatar |

Ids: `bottom`, `meat`, `cheese`, `pickles`, `ketchup`, `mustard`, `top`; Receita `cheeseburger`.

Pela foto: uma carne fina, o queijo derretendo pela borda em ponta, duas rodelas grandes de picles, ketchup e mostarda aparecendo pouco entre os picles e o pão, e um pão superior em cúpula cheia, maior em relação ao recheio que o do Duplo.

## User Stories

1. Como cliente, quero escolher o Cheeseburger na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Cheeseburger entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: uma carne fina, o queijo sobre ela, picles, ketchup e um fio de mostarda sob um pão alto.
4. Como cliente, quero abrir o Cheeseburger em Ver ingredientes e ver as 7 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Queijo, só o Picles, só o Ketchup ou só a Mostarda.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que a carne e os pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero adicionar o Cheeseburger ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
12. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem picles e mostarda").
13. Como cliente, quero voltar aos outros sete hambúrgueres e encontrá-los sem resto do Cheeseburger.
14. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
15. Como cliente sem WebGL, quero ver as ilustrações SVG do Cheeseburger e continuar personalizando.
16. Como cliente no celular, quero ver e personalizar o Cheeseburger em 390 × 844 como os outros.
17. Como cliente, quero que todo card de hambúrguer da grade seja selecionável.
18. Como responsável pelo produto, quero revisar o Cheeseburger em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
19. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com oito hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** o Cheeseburger entra como mais uma Receita, com nome "Cheeseburger", preço provisório R$ 15,90 e as 7 Camadas da tabela. Base: pães e a carne. O glossário não muda.
- **Descrição:** "Pão com gergelim, carne grelhada, queijo derretido, picles, ketchup e mostarda."
- **Modelos:** todos os do Cheeseburger Duplo sem mudança, inclusive o `cheese` amarelo (queijo prato, não o `cheddarSlice`) e o `mustard`. Nenhuma receita de textura nova.
- **Proporções pela foto desde o início:** a carne começa com o `squash: 0.78` do Duplo e o pão superior sem achatar; o ajuste fino fica para a revisão.
- **Grade:** os oito hambúrgueres selecionáveis. O caso do card sem Receita deixa de existir: a lista `burgers` de `main.js` passa a ter só cards com Receita, e o ramo de `buildGrid` para card sem Receita sai. Hambúrguer novo entra já com Receita.
- **Entrada e Saída:** sem código novo; com 7 Camadas, a Entrada fica abaixo de ~850 ms, longe do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** as ilustrações existentes, inclusive a da Mostarda.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem ticket de realismo; ajustes só na revisão.
- **Branch:** `feat/cheeseburger`, numa worktree própria a partir da `main`, um ticket por vez, terminando em um PR para a `main`.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo `tests/cheeseburger.spec.js`, no molde de `tests/cheeseburger-duplo.spec.js`, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 7 Camadas na ordem; retirar Queijo, Picles, Ketchup e Mostarda, um por vez e juntos; pães e carne não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros sete hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- Sai o teste do card sem Receita (`tests/layout.spec.js`) e o do card Cheeseburger sem Receita em `tests/cheeseburger-duplo.spec.js`, que perdem o objeto.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Os testes existentes dos outros hambúrgueres não mudam de comportamento.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- cheeseburger`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os oito hambúrgueres; `tests/orcamento.spec.js` só ganha o Cheeseburger na lista de produtos medidos.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- Preço oficial (R$ 15,90 é provisório) e descrição oficial.
- Mudanças nos modelos de queijo, picles, ketchup e mostarda e nos outros hambúrgueres aprovados.
- Hambúrgueres fora da grade atual; rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Cheeseburger.png`), assim como o card da grade (`main.js`, lista `burgers`).
