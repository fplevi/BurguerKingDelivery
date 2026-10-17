# Rodeio Duplo em 3D

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`), do Cheddar Duplo (`.scratch/cheddar-duplo/spec.md`) e do Stacker Duplo Bacon (`.scratch/stacker-duplo-bacon/spec.md`), todas resolvidas.

## Problem Statement

Só o Whopper, o Cheddar Duplo e o Stacker Duplo Bacon são hambúrgueres 3D. O Rodeio Duplo aparece na grade como "Em breve neste protótipo": o cliente não consegue escolhê-lo, ver suas Camadas nem retirar o queijo, o barbecue, os onion rings ou a maionese.

## Solution

O Rodeio Duplo vira o quarto hambúrguer 3D, só com código e o acabamento aprovado nos três primeiros. Ganha uma Receita própria; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Entra uma Camada nova, Onion rings, e uma nova configuração do modelo de molho, Molho barbecue; o resto reaproveita modelos existentes.

## Receita do Rodeio Duplo

A descrição oficial não foi encontrada; a Receita foi conferida só na foto oficial `site_Rodeio_Duplo.png` e confirmada pelo responsável pelo produto. De baixo para cima:

| Camada | Nome na interface | Removível | Modelo |
| --- | --- | --- | --- |
| pão inferior | Pão inferior | não (Base) | pão inferior existente |
| carne | Carne grelhada | não (Base) | carne existente |
| queijo | Queijo | sim | queijo do Whopper, sem mudança |
| segunda carne | Carne grelhada | não (Base) | carne existente, girada |
| barbecue | Molho barbecue | sim | molho existente, nova configuração |
| onion rings | Onion rings | sim | novo: dois anéis empanados |
| maionese | Maionese | sim | maionese do Whopper, sem mudança |
| pão superior | Pão superior | não (Base) | pão superior existente |

Ids sugeridos: `bottom`, `meat`, `cheese`, `meat2`, `bbqSauce`, `onionRings`, `mayo`, `top`; Receita `rodeioDuplo`.

## User Stories

1. Como cliente, quero escolher o Rodeio Duplo na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Rodeio Duplo entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: duas carnes, queijo entre elas, barbecue sobre a carne de cima, dois onion rings e maionese sob o pão.
4. Como cliente, quero abrir o Rodeio Duplo em Ver ingredientes e ver as 8 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Queijo, só o Molho barbecue, só os Onion rings ou só a Maionese.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que as duas carnes e os pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero que os onion rings pareçam dois anéis grossos, empanados e crocantes, com a textura da farinha à mostra, e não discos nem cebola crispy.
12. Como cliente, quero que o molho barbecue pareça um molho marrom-escuro e brilhante sobre a carne, escorrendo na borda.
13. Como cliente, quero adicionar o Rodeio Duplo ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
14. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem onion rings e maionese").
15. Como cliente, quero voltar aos outros três hambúrgueres e encontrá-los sem resto do Rodeio Duplo.
16. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
17. Como cliente sem WebGL, quero ver as ilustrações SVG do Rodeio Duplo e continuar personalizando.
18. Como cliente no celular, quero ver e personalizar o Rodeio Duplo em 390 × 844 como os outros.
19. Como cliente, quero que os outros 4 cards continuem como "Em breve neste protótipo" e não troquem o hero.
20. Como responsável pelo produto, quero revisar o Rodeio Duplo em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
21. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com quatro hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** o Rodeio Duplo entra como mais uma Receita, com nome "Rodeio Duplo", preço provisório R$ 36,90 e as 8 Camadas da tabela. Base: pães e as duas carnes. O glossário não muda.
- **Descrição:** montada pelos textos das Camadas, no padrão dos outros: "Pão com gergelim, duas carnes grelhadas, queijo derretido, molho barbecue, onion rings crocantes e maionese." Na interface, a Camada é "Carne grelhada", nunca "hambúrguer" (que é o produto).
- **Queijo e Maionese:** reaproveitam os modelos do Whopper sem mudança. Na foto o molho branco aparece mais grosso que no Whopper; o volume só muda se a revisão (ticket 03) pedir, e sem alterar o Whopper aprovado.
- **Onion rings (modelo novo):** uma Camada só, com dois anéis grandes lado a lado sobre o barbecue, quase se tocando no centro; empanado grosso, irregular, dourado-alaranjado, com a textura da farinha empanada à mostra, sem cebola aparecendo. Cada anel passa um pouco da borda da carne, e o furo do meio deixa ver o barbecue. Distinta da Cebola (crua, do Whopper) e da Cebola crispy (pedacinhos fritos, do Cheddar Duplo), que não mudam. Gerada por código, sem imagem (ADR 0001); entra em `layerModels` e nas receitas de textura, sem mudar a cena. No ticket 01 é uma forma simples (dois toros dourados); o realismo vem no ticket 02.
- **Molho barbecue:** nova configuração do modelo de molho existente (o mesmo de ketchup, maionese e Molho Stacker): marrom-escuro, brilhante, espalhado sobre a carne de cima e escorrendo na borda.
- **Segunda carne:** girada com `turn`, como nos outros duplos, para não ficar idêntica à primeira.
- **Proporções pela foto desde o início:** espessura das carnes, altura do pão superior e quanto o barbecue, os onion rings e a maionese aparecem saem de `site_Rodeio_Duplo.png` já no ticket que torna o produto selecionável.
- **Grade:** Whopper, Cheddar Duplo, Stacker Duplo Bacon e Rodeio Duplo selecionáveis; os outros 4 seguem "Em breve neste protótipo".
- **Entrada e Saída:** sem código novo; com 8 Camadas a Entrada fica em ~800 ms, abaixo do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** SVGs simples para Molho barbecue e Onion rings; Queijo e Maionese reaproveitam as ilustrações do Whopper.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem rodada extra de realismo; ajustes só na revisão.
- **Branch:** `feat/rodeio-duplo`, um ticket por vez, terminando em um PR para a `main`.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo `tests/rodeio-duplo.spec.js`, no molde de `tests/cheddar-duplo.spec.js` e do arquivo do Stacker Duplo Bacon, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 8 Camadas na ordem; retirar Queijo, Molho barbecue, Onion rings e Maionese, um por vez; pães e carnes não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- `tests/layout.spec.js` deixa de esperar "Em breve" no card Rodeio Duplo; os outros 4 continuam.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Prior art: `tests/cheddar-duplo.spec.js`, `tests/ver-ingredientes.spec.js`, `tests/bandeja.spec.js`, `tests/pedido.spec.js`, `tests/fallback-svg.spec.js`, `tests/entrada-e-saida.spec.js`. Os testes existentes não mudam de comportamento.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- rodeioDuplo`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os quatro hambúrgueres; `tests/orcamento.spec.js` não ganha testes.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- O Rodeio simples (mesmo hambúrguer com uma carne): esforço separado, logo depois deste.
- Os outros hambúrgueres da grade (Big King, Cheeseburger Duplo, Cheeseburger).
- Preço oficial (R$ 36,90 é provisório) e descrição oficial.
- Mudanças no queijo e na maionese do Whopper, na Cebola ou na Cebola crispy.
- Rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Rodeio_Duplo.png`), assim como o card da grade com o nome "Rodeio Duplo".
- Os onion rings são a primeira Camada de anel empanado; vale olhar o primeiro quadro já no ticket do modelo, antes da medição formal.
