# Rodeio em 3D

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`), do Cheddar Duplo, do Stacker Duplo Bacon e do Rodeio Duplo (`.scratch/rodeio-duplo/spec.md`), todas resolvidas.

## Problem Statement

Só o Whopper, o Cheddar Duplo, o Stacker Duplo Bacon e o Rodeio Duplo são hambúrgueres 3D. O Rodeio aparece na grade como "Em breve neste protótipo": o cliente não consegue escolhê-lo, ver suas Camadas nem retirar o queijo, o barbecue, o onion ring ou a maionese.

## Solution

O Rodeio vira o quinto hambúrguer 3D, só com código e o acabamento já aprovado. Ganha uma Receita própria; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Nenhum modelo de Camada novo: o Onion ring é uma variante com um anel só do modelo de onion rings do Rodeio Duplo, com a mesma textura; o resto reaproveita modelos existentes.

## Receita do Rodeio

Conferida na foto oficial `site_Rodeio.png` e confirmada pelo responsável pelo produto. De baixo para cima:

| Camada | Nome na interface | Removível | Modelo |
| --- | --- | --- | --- |
| pão inferior | Pão inferior | não (Base) | pão inferior existente |
| carne | Carne grelhada | não (Base) | carne existente |
| queijo | Queijo | sim | queijo do Whopper, sem mudança |
| barbecue | Molho barbecue | sim | molho barbecue do Rodeio Duplo |
| onion ring | Onion ring | sim | variante de um anel dos onion rings do Rodeio Duplo |
| maionese | Maionese | sim | maionese do Whopper, sem mudança |
| pão superior | Pão superior | não (Base) | pão superior existente |

Ids sugeridos: `bottom`, `meat`, `cheese`, `bbqSauce`, `onionRing`, `mayo`, `top`; Receita `rodeio`.

Diferenças em relação ao Rodeio Duplo, tiradas da foto: o queijo fica sobre a única carne, sob o barbecue (no Duplo, fica entre as carnes); há um anel só, menor (cerca de metade da largura da carne) e centralizado; a maionese aparece grossa.

## User Stories

1. Como cliente, quero escolher o Rodeio na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Rodeio entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: uma carne, queijo sobre ela, barbecue, um onion ring no centro e maionese sob o pão.
4. Como cliente, quero abrir o Rodeio em Ver ingredientes e ver as 7 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Queijo, só o Molho barbecue, só o Onion ring ou só a Maionese.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que a carne e os pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero que o onion ring pareça um anel grosso, empanado e crocante, igual aos do Rodeio Duplo, e não um disco.
12. Como cliente, quero adicionar o Rodeio ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
13. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem onion ring e maionese").
14. Como cliente, quero voltar aos outros quatro hambúrgueres e encontrá-los sem resto do Rodeio.
15. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
16. Como cliente sem WebGL, quero ver as ilustrações SVG do Rodeio e continuar personalizando.
17. Como cliente no celular, quero ver e personalizar o Rodeio em 390 × 844 como os outros.
18. Como cliente, quero que os outros 3 cards continuem como "Em breve neste protótipo" e não troquem o hero.
19. Como responsável pelo produto, quero revisar o Rodeio em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
20. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com cinco hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** o Rodeio entra como mais uma Receita, com nome "Rodeio", preço provisório R$ 29,90 e as 7 Camadas da tabela. Base: pães e a carne. O glossário não muda.
- **Descrição:** "Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese." Na interface, a Camada é "Onion ring", no singular, porque há um anel só; no Carrinho, "Sem onion ring".
- **Onion ring (variante, não modelo novo):** o modelo de onion rings do Rodeio Duplo passa a aceitar um anel só, centralizado e de raio menor (cerca de metade da largura da carne, pela foto), com a mesma textura de empanado. Sem receita de textura nova, para não pesar nenhum worker (lição do ticket 02 do Rodeio Duplo). O modelo do Rodeio Duplo, aprovado, não pode mudar.
- **Queijo, Molho barbecue e Maionese:** reaproveitam os modelos existentes sem mudança. A maionese da foto parece grossa; como no Rodeio Duplo, o volume só muda se a revisão (ticket 02) pedir, e sem alterar o Whopper nem o Rodeio Duplo aprovados.
- **Proporções pela foto desde o início:** espessura da carne, altura do pão superior e quanto queijo, barbecue, onion ring e maionese aparecem saem de `site_Rodeio.png` já no ticket que torna o produto selecionável.
- **Grade:** Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo e Rodeio selecionáveis; Big King, Cheeseburger Duplo e Cheeseburger seguem "Em breve neste protótipo".
- **Entrada e Saída:** sem código novo; com 7 Camadas, a Entrada fica abaixo de ~800 ms, longe do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** SVG simples de um anel para o Onion ring; Queijo, Molho barbecue e Maionese reaproveitam as ilustrações existentes.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem ticket de realismo: o empanado já foi aprovado no Rodeio Duplo; ajustes só na revisão.
- **Branch:** `feat/rodeio`, um ticket por vez, terminando em um PR para a `main`.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo `tests/rodeio.spec.js`, no molde de `tests/rodeio-duplo.spec.js`, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 7 Camadas na ordem; retirar Queijo, Molho barbecue, Onion ring e Maionese, um por vez; pães e carne não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- `tests/layout.spec.js` deixa de esperar "Em breve" no card Rodeio; os outros 3 continuam.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Os testes existentes não mudam de comportamento; em especial, o Rodeio Duplo continua com dois anéis.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- rodeio`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os cinco hambúrgueres; `tests/orcamento.spec.js` não ganha testes.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- Os outros hambúrgueres da grade (Big King, Cheeseburger Duplo, Cheeseburger).
- Preço oficial (R$ 29,90 é provisório) e descrição oficial.
- Mudanças no Rodeio Duplo, no queijo e na maionese do Whopper.
- Rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Rodeio.png`), assim como o card da grade com o nome "Rodeio".
