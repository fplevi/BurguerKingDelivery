# Cheddar Duplo em 3D, com Receita por produto

Status: resolved

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, `docs/agents/novo-hamburguer.md`, spec do Whopper em `.scratch/hamburguer-3d/spec.md` (resolvida, exceto o ticket 12, `wontfix`).

## Problem Statement

Só o Whopper é um hambúrguer 3D. A página inteira está presa a ele: título, preço, descrição, "Personalize seu Whopper", as 10 camadas em `src/ingredients.js`, as espessuras do fallback SVG e a grade, em que só o primeiro card é selecionável. As fotos da grade, geradas por IA, ficaram diferentes dos produtos reais; o cliente não vê o hambúrguer oficial.

## Solution

O Cheddar Duplo vira o segundo hambúrguer 3D, modelado só com código e com o mesmo acabamento aprovado no Whopper. A lista de camadas deixa de ser fixa e passa a ser a **Receita** de cada produto. A grade usa as fotos oficiais (`prototype/Assets/burgers/official/`); Whopper e Cheddar Duplo são selecionáveis, e escolher um troca nome, preço, descrição, o hambúrguer 3D do hero e o de Alterar ingredientes. Os outros 6 cards ficam como "Em breve neste protótipo".

## Receita do Cheddar Duplo

Conferida na foto oficial `site_Cheddar_Duplo.png` (a descrição oficial do cardápio não foi encontrada; ajustar se citar outro ingrediente). De baixo para cima:

| Camada | Nome na interface | Removível |
| --- | --- | --- |
| pão inferior | Pão inferior | não (Base) |
| carne | Carne grelhada | não (Base) |
| cheddar | Cheddar inferior | sim |
| segunda carne | Carne grelhada | não (Base) |
| cheddar | Cheddar superior | sim |
| cebola crispy | Cebola crispy | sim |
| pão superior | Pão superior | não (Base) |

Sem salada nem molhos. Os dois cheddars são camadas separadas, com nomes diferentes porque o glossário pede um nome por Camada. Os ids no código são sugestão: `bottom`, `meat`, `cheddar1`, `meat2`, `cheddar2`, `crispyOnion`, `top`.

## User Stories

1. Como cliente, quero escolher o Cheddar Duplo na grade e ver o hero mudar para ele, com nome, preço, descrição e hambúrguer 3D.
2. Como cliente, quero que a grade mostre as fotos oficiais, para reconhecer os produtos do Burger King.
3. Como cliente, quero abrir o Cheddar Duplo em camadas e ver duas carnes, dois cheddars e a cebola crispy como peças próprias.
4. Como cliente, quero retirar só o cheddar de cima, só o de baixo ou só a cebola crispy.
5. Como cliente, quero que as duas carnes e os pães formem a Base e não possam ser retirados.
6. Como cliente, quero que o cheddar pareça cremoso, escorrendo pelas bordas das carnes, como na foto.
7. Como cliente, quero que a cebola crispy pareça um monte de farelos dourados e crocantes.
8. Como cliente, quero voltar ao Whopper e encontrá-lo exatamente como estava, sem perder a personalização do outro produto por engano.
9. Como cliente, quero combo, tamanhos P/M/G e carrinho funcionando no Cheddar Duplo como no Whopper.
10. Como cliente sem WebGL, quero ver as ilustrações SVG e continuar personalizando.
11. Como responsável pelo produto, quero revisar o Cheddar Duplo em capturas ao lado da foto oficial, em uma rodada só.
12. Como desenvolvedor, quero acrescentar um terceiro hambúrguer mudando só a Receita e, se houver camada nova, o modelo dela.

## Implementation Decisions

- **Receita por produto:** `src/ingredients.js` passa a exportar uma Receita por produto (id, nome, descrição, preço, camadas de baixo para cima, quais formam a Base). O reducer, a cena, os botões DOM, o fallback SVG (`closedPositions` e `art.js`) e os textos leem a Receita do produto selecionado; nada fora dela cita o Whopper.
- **Camadas já existentes são reaproveitadas:** pão inferior, carne (as duas), queijo (cheddar) e pão superior usam os modelos de `layerModels`. Camada repetida na mesma Receita (carne, cheddar) é permitida: o id da camada é único, o modelo é compartilhado.
- **Camadas novas:** só a cebola crispy exige modelo e textura novos (`layer-models.js`, `texture-recipes.js`), gerados por código, sem imagem (ADR 0001): monte de farelos dourados, irregulares e crocantes.
- **Cheddar:** o modelo do queijo do Whopper com cor mais alaranjada, mais líquido e fios longos escorrendo pelas bordas das carnes. O Whopper mantém o queijo atual.
- **Seleção de produto:** a grade usa as fotos de `Assets/burgers/official/`; só Whopper (`site_Whopper.png`) e Cheddar Duplo (`site_Cheddar_Duplo.png`) são selecionáveis; os outros 6 mostram "Em breve neste protótipo". Os cards antigos (Whopper Duplo, Bacon Supreme, Cheese Burger) saem da grade; os arquivos de `Assets/catalog/` ficam no repositório.
- **Preço e texto provisórios:** Cheddar Duplo R$ 34,90 (Whopper R$ 31,90) e descrição "Pão com gergelim, duas carnes grelhadas, cheddar cremoso e cebola crispy." Combo e tamanhos P/M/G iguais aos do Whopper; retirar ingredientes continua sem desconto.
- **Estado por produto:** trocar de produto reinicia a personalização (retiradas, rascunho); o carrinho em memória continua.
- **Sem WebGL:** o fallback SVG reaproveita as ilustrações de carne e queijo e ganha um SVG simples da cebola crispy.
- **Câmera, luz, inclinação, arrasto, bandeja e orçamento:** iguais ao Whopper. Uma cena por palco, como hoje.
- **Glossário:** entram o termo **Receita** e a Base passa a ser "pães e carnes" (`GLOSSARY.md`), atualizados antes do código.
- **Sem rodada extra de realismo:** a qualidade do Whopper é o padrão; ajustes só na revisão do ticket 04.

## Testing Decisions

- A mesma costura de teste do Whopper: a página no navegador real, via Playwright, por papéis e rótulos acessíveis, nunca por internals do Three.js.
- Comportamentos novos a cobrir: selecionar o Cheddar Duplo troca o hero (nome, preço, descrição); Alterar ingredientes lista as 7 camadas na ordem; retirar cada cheddar e a cebola crispy, só um por vez; as duas carnes e os pães não são retiráveis; Recolocar todos; aplicar atualiza o texto do hero; cancelar preserva; item no carrinho com os ingredientes retirados; voltar ao Whopper mostra as 10 camadas sem resto do outro produto; cards "Em breve" não trocam o hero; fallback SVG com WebGL desativado.
- Prior art: `tests/alterar-ingredientes.spec.js`, `tests/bandeja.spec.js`, `tests/pedido.spec.js`, `tests/fallback-svg.spec.js`, `tests/cena-3d.spec.js`. O Whopper continua coberto pelos testes existentes, que não mudam de comportamento.
- Verificação visual por capturas nos marcos (desktop e 390 × 844, montado e aberto), revisada por humano ao lado da foto oficial; comparação pixel a pixel não aprova realismo.
- Orçamento: `npm run test:orcamento` medido de novo com os dois hambúrgueres (ticket 05). Fps real e toque em aparelho físico continuam fora do alcance.

## Out of Scope

- Os outros 6 hambúrgueres da grade (Big King, Cheeseburger, Cheeseburger Duplo, Rodeio, Rodeio Duplo, Stacker Duplo).
- Preço e descrição oficiais (valores provisórios até o cardápio ser consultado).
- Rodada extra de realismo (ticket 12 do Whopper, `wontfix`).
- Apagar as fotos antigas de `Assets/catalog/`.
- Efeito da retirada no preço; migração para React/TypeScript.

## Further Notes

- As fotos oficiais de `Assets/burgers/official/` ainda estão sem commit; o ticket 02 as inclui.
- Fonte das fotos oficiais: pasta baixada do site pelo responsável pelo produto; registrar a origem em `Assets/catalog/SOURCES.md` (ou arquivo equivalente na pasta nova) no ticket 02.
- O trabalho segue na branch `prototype/cheddar-duplo`, um ticket por vez, e termina em um PR para a `main`.
