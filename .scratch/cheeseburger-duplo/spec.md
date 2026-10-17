# Cheeseburger Duplo em 3D

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`), do Cheddar Duplo, do Stacker Duplo Bacon, do Rodeio Duplo, do Rodeio e do Big King (`.scratch/big-king/spec.md`), todas resolvidas.

## Problem Statement

Seis hambúrgueres são 3D: Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King e Rodeio. O Cheeseburger Duplo aparece na grade como "Em breve neste protótipo": o cliente não consegue escolhê-lo, ver suas Camadas nem retirar os queijos, o picles, o ketchup ou a mostarda.

## Solution

O Cheeseburger Duplo vira o sétimo hambúrguer 3D, só com código e o acabamento já aprovado. Ganha uma Receita própria; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Um único modelo de Camada novo, a Mostarda; o resto reaproveita modelos existentes sem mudança.

## Receita do Cheeseburger Duplo

Conferida na foto oficial `site_Cheeseburger_Duplo.png` e confirmada pelo responsável pelo produto. De baixo para cima:

| Camada | Nome na interface | Removível | Modelo |
| --- | --- | --- | --- |
| pão inferior | Pão inferior | não (Base) | pão inferior existente |
| carne | Carne grelhada | não (Base) | carne existente |
| queijo de baixo | Queijo inferior | sim | queijo do Whopper, sem mudança |
| carne de cima | Carne grelhada | não (Base) | carne existente, `turn: 1.9` |
| queijo de cima | Queijo superior | sim | queijo do Whopper, `turn: 1.9` (gira com a carne de baixo dele) |
| picles | Picles | sim | picles do Whopper, sem mudança |
| ketchup | Ketchup | sim | ketchup do Whopper, sem mudança |
| mostarda | Mostarda | sim | **novo:** `mustard` |
| pão superior | Pão superior | não (Base) | pão superior existente |

Ids sugeridos: `bottom`, `meat`, `cheese1`, `meat2`, `cheese2`, `pickles`, `ketchup`, `mustard`, `top`; Receita `cheeseburgerDuplo`.

Pela foto: as duas carnes são finas, cada queijo derrete pela borda em ponta, os picles são duas rodelas grandes, e o ketchup e a mostarda aparecem pouco, entre os picles e o pão.

## User Stories

1. Como cliente, quero escolher o Cheeseburger Duplo na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Cheeseburger Duplo entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: duas carnes finas, um queijo sobre cada, picles, ketchup e um fio de mostarda sob o pão.
4. Como cliente, quero abrir o Cheeseburger Duplo em Ver ingredientes e ver as 9 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Queijo inferior, só o Queijo superior, só o Picles, só o Ketchup ou só a Mostarda.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que as carnes e os pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero que a mostarda pareça um fio amarelo fino, e não uma mancha ou um disco.
12. Como cliente, quero adicionar o Cheeseburger Duplo ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
13. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem picles e mostarda").
14. Como cliente, quero voltar aos outros seis hambúrgueres e encontrá-los sem resto do Cheeseburger Duplo.
15. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
16. Como cliente sem WebGL, quero ver as ilustrações SVG do Cheeseburger Duplo e continuar personalizando.
17. Como cliente no celular, quero ver e personalizar o Cheeseburger Duplo em 390 × 844 como os outros.
18. Como cliente, quero que o card Cheeseburger continue "Em breve neste protótipo" e não troque o hero.
19. Como responsável pelo produto, quero revisar o Cheeseburger Duplo em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
20. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com sete hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** o Cheeseburger Duplo entra como mais uma Receita, com nome "Cheeseburger Duplo", preço provisório R$ 24,90 e as 9 Camadas da tabela. Base: pães e as duas carnes. O glossário não muda.
- **Descrição:** "Pão com gergelim, duas carnes grelhadas, queijo derretido, picles, ketchup e mostarda." Como no Cheddar Duplo, o texto das duas carnes fica na primeira, e o queijo aparece uma vez só.
- **Queijo:** o `cheese` do Whopper, amarelo, nas duas Camadas, sem mudança. Não é o `cheddarSlice`: o Cheeseburger usa queijo prato, não cheddar. O de cima gira com a carne de cima (`turn: 1.9`), para os dois não ficarem idênticos (ticket 14 do Whopper).
- **Mostarda (modelo novo `mustard`):** um fio fino e irregular em zigue-zague, amarelo-mostarda, mais fino que o ketchup, sobre ele e sem escorrer pela borda (assim não precisa das pontas arredondadas exigidas na revisão do Big King). Pode partir da geometria do `ketchup`, mas como modelo próprio: o `ketchup` aprovado não muda. Se precisar de receita de textura nova, ela vai para o worker mais leve (`shares` em `textures.js`; lição do ticket 02 do Rodeio Duplo); de preferência, reaproveite o material do ketchup só com outra cor, sem receita nova.
- **Picles, Ketchup:** os modelos do Whopper sem mudança.
- **Proporções pela foto desde o início:** espessura das carnes, altura do pão superior e quanto queijo, picles, ketchup e mostarda aparecem saem de `site_Cheeseburger_Duplo.png` já no ticket que torna o produto selecionável.
- **Grade:** os seis hambúrgueres atuais e o Cheeseburger Duplo selecionáveis; só o Cheeseburger segue "Em breve neste protótipo".
- **Entrada e Saída:** sem código novo; com 9 Camadas, a Entrada fica em ~850 ms, longe do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** SVG de um fio amarelo para a Mostarda; o resto reaproveita as ilustrações existentes.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem ticket de realismo; ajustes só na revisão.
- **Branch:** `feat/cheeseburger-duplo`, um ticket por vez, terminando em um PR para a `main`.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo `tests/cheeseburger-duplo.spec.js`, no molde de `tests/rodeio.spec.js`, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 9 Camadas na ordem; retirar Queijo inferior, Queijo superior, Picles, Ketchup e Mostarda, um por vez; pães e carnes não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- `tests/layout.spec.js` deixa de esperar "Em breve" no card Cheeseburger Duplo; o Cheeseburger continua.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Os testes existentes não mudam de comportamento; em especial, o ketchup do Whopper continua igual.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- cheeseburgerDuplo`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os sete hambúrgueres; `tests/orcamento.spec.js` só ganha o Cheeseburger Duplo na lista de produtos medidos.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- O Cheeseburger simples (próximo da lista; reaproveitará esta Receita com uma carne e um queijo).
- Preço oficial (R$ 24,90 é provisório) e descrição oficial.
- Mudanças no queijo, no picles e no ketchup do Whopper e nos outros hambúrgueres aprovados.
- Rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Cheeseburger_Duplo.png`), assim como o card da grade com o nome "Cheeseburger Duplo" (`main.js`, lista `burgers`).
