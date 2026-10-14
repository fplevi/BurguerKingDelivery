# Stacker Duplo Bacon em 3D

Status: ready-for-agent

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, specs do Whopper (`.scratch/hamburguer-3d/spec.md`) e do Cheddar Duplo (`.scratch/cheddar-duplo/spec.md`), ambas resolvidas.

## Problem Statement

Só o Whopper e o Cheddar Duplo são hambúrgueres 3D. O Stacker Duplo Bacon aparece na grade como "Em breve neste protótipo": o cliente não consegue escolhê-lo, ver suas Camadas nem retirar o bacon ou o molho.

## Solution

O Stacker Duplo Bacon vira o terceiro hambúrguer 3D, só com código e o acabamento aprovado nos dois primeiros. Ganha uma Receita própria; escolher o card troca nome, preço, descrição, o hambúrguer 3D do hero e o de Ver ingredientes, com Entrada e Saída como os outros. Entram duas Camadas novas, Bacon e Molho Stacker; o resto reaproveita modelos existentes.

## Receita do Stacker Duplo Bacon

Conferida na foto oficial `site_Stacker_Duplo.png` e na descrição do site ("Dois hambúrgueres grelhados, cheddar fatiado e três fatias de bacon acompanhado do saboroso molho Stacker em um pão macio com gergelim"). De baixo para cima:

| Camada | Nome na interface | Removível | Modelo |
| --- | --- | --- | --- |
| pão inferior | Pão inferior | não (Base) | pão inferior existente |
| carne | Carne grelhada | não (Base) | carne existente |
| cheddar | Cheddar | sim | fatia do Whopper, na cor do cheddar |
| segunda carne | Carne grelhada | não (Base) | carne existente, girada |
| bacon | Bacon | sim | novo: três tiras |
| molho | Molho Stacker | sim | molho existente, nova configuração |
| pão superior | Pão superior | não (Base) | pão superior existente |

Ids sugeridos: `bottom`, `meat`, `cheddar`, `meat2`, `bacon`, `stackerSauce`, `top`; Receita `stackerDuploBacon`.

## User Stories

1. Como cliente, quero escolher o Stacker Duplo Bacon na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero ver o Stacker Duplo Bacon entrar no hero com as Camadas caindo, como os outros hambúrgueres, e o anterior sair.
3. Como cliente, quero que o hambúrguer montado se pareça com a foto oficial nas proporções: duas carnes, cheddar entre elas, bacon e molho sob o pão.
4. Como cliente, quero abrir o Stacker Duplo Bacon em Ver ingredientes e ver as 7 Camadas, cada uma como peça própria.
5. Como cliente, quero retirar só o Cheddar, só o Bacon ou só o Molho Stacker.
6. Como cliente, quero retirar mais de um desses ingredientes e vê-los na Bandeja.
7. Como cliente, quero recolocar um Ingrediente retirado ou todos de uma vez.
8. Como cliente, quero que as duas carnes e os pães formem a Base e não possam ser retirados.
9. Como cliente, quero que a descrição do hero acompanhe minha Personalização ao aplicar.
10. Como cliente, quero cancelar Ver ingredientes e manter a Personalização anterior.
11. Como cliente, quero que o cheddar seja uma fatia que amolece e escorre num ponto, como na foto.
12. Como cliente, quero que o bacon pareça três tiras onduladas e tostadas, com partes de gordura mais claras e pontas saindo da borda da carne.
13. Como cliente, quero que o Molho Stacker pareça um molho cremoso rosa-alaranjado sob o pão, pingando na borda.
14. Como cliente, quero adicionar o Stacker Duplo Bacon ao Carrinho, com Combo e Personalização, como os outros hambúrgueres.
15. Como cliente, quero ver no Carrinho quais ingredientes retirei ("Sem bacon e molho stacker").
16. Como cliente, quero voltar ao Whopper ou ao Cheddar Duplo e encontrá-los sem resto do Stacker Duplo Bacon.
17. Como cliente, quero que trocar de hambúrguer reinicie a personalização em andamento, sem perder o que já está no Carrinho.
18. Como cliente sem WebGL, quero ver as ilustrações SVG do Stacker Duplo Bacon e continuar personalizando.
19. Como cliente no celular, quero ver e personalizar o Stacker Duplo Bacon em 390 × 844 como os outros.
20. Como cliente, quero que os outros 5 cards continuem como "Em breve neste protótipo" e não troquem o hero.
21. Como responsável pelo produto, quero revisar o Stacker Duplo Bacon em capturas e quadros da Entrada e da Saída ao lado da foto oficial, em uma rodada só.
22. Como responsável pelo produto, quero que a página continue dentro do orçamento aceito com três hambúrgueres.

## Implementation Decisions

- **Receita nova, sem prefactor:** a Receita por produto já existe; o Stacker Duplo Bacon entra como mais uma Receita, com nome "Stacker Duplo Bacon", preço provisório R$ 37,90 e as 7 Camadas da tabela. Base: pães e as duas carnes. O glossário não muda.
- **Descrição:** montada pelos textos das Camadas, no padrão dos outros dois: "Pão com gergelim, duas carnes grelhadas, cheddar fatiado, bacon crocante e molho Stacker." Na interface, a Camada é "Carne grelhada", nunca "hambúrguer" (que é o produto).
- **Cheddar:** reaproveita o modelo de fatia do queijo do Whopper (losango, escorrendo num ponto) com a cor laranja do cheddar. O queijo do Whopper e o cheddar cremoso do Cheddar Duplo não mudam.
- **Bacon (modelo novo):** uma Camada só, com três tiras onduladas e tostadas, partes escuras e gordura mais clara, pontas para fora da borda da carne dos dois lados, como na foto. Gerado por código, sem imagem (ADR 0001); entra em `layerModels` e nas receitas de textura, sem mudar a cena.
- **Molho Stacker:** nova configuração do modelo de molho existente (o mesmo de ketchup e maionese): rosa-alaranjado, cremoso, espalhado sob o pão superior e pingando na borda. Sem pontinhos verdes.
- **Segunda carne:** girada com `turn`, como no Cheddar Duplo, para não ficar idêntica à primeira.
- **Proporções pela foto desde o início:** espessura das carnes, altura do pão superior e quanto o bacon e o molho aparecem saem de `site_Stacker_Duplo.png` já no ticket que torna o produto selecionável (lição do ticket 13 do Whopper).
- **Grade:** Whopper, Cheddar Duplo e Stacker Duplo Bacon selecionáveis; os outros 5 seguem "Em breve neste protótipo".
- **Entrada e Saída:** sem código novo; com 7 Camadas a Entrada fica em ~750 ms, abaixo do teto de ~1,2 s.
- **Combo e Carrinho:** iguais aos dos outros hambúrgueres (Combo único, sem tamanhos); retirar ingredientes não muda o preço.
- **Sem WebGL:** SVGs simples para Bacon e Molho Stacker; o Cheddar reaproveita a ilustração do queijo.
- **Câmera, luz, inclinação, arrasto, Bandeja:** iguais aos dos outros. Sem rodada extra de realismo; ajustes só na revisão.
- **Branch:** `feat/stacker-duplo-bacon`, um ticket por vez, terminando em um PR para a `main`.

## Testing Decisions

- Um ponto de teste só, o mesmo dos outros hambúrgueres: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js. Nenhuma costura nova.
- Novo arquivo de testes do Stacker Duplo Bacon, no molde de `tests/cheddar-duplo.spec.js`, cobrindo: selecionar troca o hero (nome, preço, descrição); Ver ingredientes lista as 7 Camadas na ordem; retirar Cheddar, Bacon e Molho Stacker, um por vez; pães e carnes não retiráveis; Recolocar todos; aplicar atualiza a descrição; cancelar preserva; Item no Carrinho com os ingredientes retirados; voltar aos outros hambúrgueres sem resto deste; fallback SVG com WebGL desativado.
- Testes que clicam no hambúrguer do hero logo depois de trocar de produto esperam o fim da Entrada (`fimDaEntrada`).
- Prior art: `tests/cheddar-duplo.spec.js`, `tests/ver-ingredientes.spec.js`, `tests/bandeja.spec.js`, `tests/pedido.spec.js`, `tests/fallback-svg.spec.js`, `tests/entrada-e-saida.spec.js`. Os testes existentes não mudam de comportamento.
- Realismo não se testa automaticamente: capturas (desktop e 390 × 844, montado e aberto) e quadros da Entrada e da Saída (`npm run quadros-entrada -- stackerDuploBacon`), revisados por humano ao lado da foto oficial.
- Orçamento: `npm run test:orcamento` medido de novo com os três hambúrgueres; `tests/orcamento.spec.js` não ganha testes.
- Fechar com `npm run test:build` inteiro verde localmente (CI desligado).

## Out of Scope

- Os outros 5 hambúrgueres da grade (Rodeio Duplo, Big King, Cheeseburger Duplo, Cheeseburger, Rodeio).
- Preço oficial (R$ 37,90 é provisório).
- Pontinhos de picles no Molho Stacker.
- Mudanças no queijo do Whopper ou no cheddar do Cheddar Duplo.
- Rodada extra de realismo; efeito da retirada no preço.

## Further Notes

- A foto oficial já está no repositório (`prototype/Assets/burgers/official/site_Stacker_Duplo.png`), assim como o card da grade com o nome "Stacker Duplo Bacon".
- O bacon é a primeira Camada de tiras finas e torcidas; vale olhar o primeiro quadro já no ticket do modelo, antes da medição formal.
