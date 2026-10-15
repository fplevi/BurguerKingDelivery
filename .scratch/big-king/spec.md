# Big King em 3D

Status: ready-for-agent

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`), do Cheddar Duplo, do Stacker Duplo Bacon, do Rodeio Duplo e do Rodeio (`.scratch/rodeio/spec.md`).

## Problem Statement

Só o Whopper, o Cheddar Duplo, o Stacker Duplo Bacon, o Rodeio Duplo e o Rodeio são hambúrgueres 3D. O Big King aparece na grade como "Em breve neste protótipo": o cliente não consegue escolhê-lo, ver suas Camadas nem retirar o queijo, os molhos, o picles, a cebola ou a alface.

## Solution

O Big King vira o sexto hambúrguer 3D, só com código e o acabamento já aprovado. Ganha uma Receita própria; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Um modelo de Camada novo, o pão do meio, variante do pão inferior com a mesma textura; o resto reaproveita modelos existentes.

## Receita do Big King

Lida na foto oficial `site_Big_King.png` e confirmada pelo responsável pelo produto. De baixo para cima:

| Camada | Nome na interface | Texto na descrição | Removível | Modelo |
| --- | --- | --- | --- | --- |
| pão inferior | Pão inferior | Pão com gergelim | não (Base) | pão inferior existente |
| carne | Carne grelhada | duas carnes grelhadas | não (Base) | carne existente |
| queijo | Queijo | queijo | sim | `cheddarSlice`, sem mudança |
| pão do meio | Pão do meio | pão do meio | não (Base) | **`middleBun`, novo** |
| molho | Molho Big King inferior | molho Big King | sim | `bigKingSauce`, novo (revisão, ticket 02) |
| carne | Carne grelhada | — | não (Base) | carne existente, girada (`turn`) |
| picles | Picles | picles | sim | picles existente |
| cebola | Cebola | cebola | sim | cebola existente |
| alface | Alface | alface | sim | alface existente |
| molho | Molho Big King superior | molho Big King | sim | `bigKingSauceTop`, novo (revisão, ticket 02) |
| pão superior | Pão superior | — | não (Base) | pão superior existente |

Ids sugeridos: `bottom`, `meat`, `cheese`, `middleBun`, `sauce1`, `meat2`, `pickles`, `onion`, `lettuce`, `sauce2`, `top`; Receita `bigKing`.

Pela foto: o queijo laranja fica sobre a carne de baixo e escorre em ponta para fora; o pão do meio é um disco liso, mais fino que o inferior, com o molho espalhado e escorrendo na borda; a cebola aparece em rodelas brancas e a alface passa da borda do pão; o molho de cima aparece sob o pão superior.

## User Stories

1. Como cliente, quero escolher o Big King na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Big King entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: duas carnes separadas pelo pão do meio, queijo sobre a de baixo, molho sobre o pão do meio, picles, cebola, alface e molho sob o pão de cima.
4. Como cliente, quero abrir o Big King em Ver ingredientes e ver as 11 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Queijo, só um dos molhos, só o Picles, só a Cebola ou só a Alface.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que as carnes, o pão do meio e os outros pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero que o pão do meio pareça pão, com o mesmo tostado dos outros, e não um disco de plástico.
12. Como cliente, quero adicionar o Big King ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
13. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem molho Big King inferior e picles").
14. Como cliente, quero voltar aos outros cinco hambúrgueres e encontrá-los sem resto do Big King.
15. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
16. Como cliente sem WebGL, quero ver as ilustrações SVG do Big King e continuar personalizando.
17. Como cliente no celular, quero ver e personalizar o Big King em 390 × 844 como os outros.
18. Como cliente, quero que os outros 2 cards continuem como "Em breve neste protótipo" e não troquem o hero.
19. Como responsável pelo produto, quero revisar o Big King em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
20. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com seis hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** o Big King entra como mais uma Receita, com nome "Big King", preço provisório R$ 31,90 e as 11 Camadas da tabela. Base: os três pães e as duas carnes. O glossário não muda.
- **Descrição:** sai dos textos das Camadas, como nos outros (texto repetido é dito uma vez): "Pão com gergelim, duas carnes grelhadas, queijo, pão do meio, molho Big King, picles, cebola e alface."
- **Pão do meio (modelo novo):** `middleBun` em `layer-models.js`, variante do pão inferior: achatado dos dois lados, mais fino, miolo claro em cima e embaixo e borda dourada. Mesma textura do pão inferior, **sem receita de textura nova**, para não pesar nenhum worker (lição do ticket 02 do Rodeio Duplo). O pão inferior aprovado não pode mudar.
- **Dois molhos:** as duas Camadas usam o `stackerSauce` sem mudança (creme laranja-rosado com escorrido); a de cima gira com `turn` para não ficar idêntica. Cada uma é retirada sozinha, com nomes "Molho Big King inferior" e "Molho Big King superior", como o "Cheddar inferior/superior" do Cheddar Duplo. O Stacker Duplo Bacon aprovado não muda. Na revisão (ticket 02), os dois passam a usar um molho próprio, laranja (`bigKingSauce` sobre o pão do meio, um corpo liso com a borda arredondada escorrendo em gotas pela lateral; `bigKingSauceTop` sob o pão de cima, menor), e o `stackerSauce` segue sem mudança.
- **Queijo:** `cheddarSlice` sem mudança, com o nome "Queijo" na interface.
- **Carnes:** a de cima gira com `turn`, como nos outros duplos.
- **Picles, Cebola, Alface:** reaproveitam os modelos do Whopper sem mudança; na revisão (ticket 02), a Cebola e a Alface se alargam com `spread` na Receita, sem mudar o modelo.
- **Proporções pela foto desde o início:** espessura das carnes, do pão do meio e do pão superior, e quanto queijo, molho, picles, cebola e alface aparecem saem de `site_Big_King.png` já no ticket que torna o produto selecionável.
- **Grade:** Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King e Rodeio selecionáveis; Cheeseburger Duplo e Cheeseburger seguem "Em breve neste protótipo".
- **Entrada e Saída:** sem código novo; com 11 Camadas, a Entrada fica em ~1 s, abaixo do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** SVG simples do pão do meio; o resto reaproveita as ilustrações existentes.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem ticket de realismo; ajustes só na revisão.
- **Branch:** `feat/big-king`, criada a partir de `feat/rodeio` (o Rodeio ainda não está na `main`), um ticket por vez. O PR para a `main` só abre depois que o do Rodeio entrar.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo `prototype/tests/big-king.spec.js`, no molde de `prototype/tests/rodeio.spec.js`, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 11 Camadas na ordem; retirar Queijo, cada molho, Picles, Cebola e Alface, um por vez; pães (inclusive o do meio) e carnes não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- `prototype/tests/layout.spec.js` deixa de esperar "Em breve" no card Big King; os outros 2 continuam.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Os testes existentes não mudam de comportamento; em especial, o Stacker Duplo Bacon e o pão inferior continuam iguais.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- bigKing`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os seis hambúrgueres; `tests/orcamento.spec.js` não ganha testes.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- Os outros hambúrgueres da grade (Cheeseburger Duplo, Cheeseburger).
- Preço oficial (R$ 31,90 é provisório) e descrição oficial.
- Mudanças no pão inferior, no `stackerSauce`, no `cheddarSlice` e nos modelos do Whopper aprovados.
- Rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Big_King.png`), assim como o card da grade com o nome "Big King".
- Camada nova pesa no primeiro quadro: o Big King tem 11 Camadas, uma a mais que o Whopper, o maior até agora.
