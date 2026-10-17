# Ver ingredientes pelo Figma

Status: resolved

Contexto: `GLOSSARY.md` (Ver ingredientes, Bandeja, Camada, Ingrediente retirado, Personalização), `docs/adr/0001-visuais-gerados-por-codigo.md`, `.scratch/revisao-figma/spec.md` (pontos de quebra). Decisões tiradas da sessão de grilling de 2026-10-11.

Branch `feat/ver-ingredientes`, criada a partir de `main` depois do merge do checkout (PR #8). As regras desta tela estão na linha 4 de `prototype/src/styles.css` (uma linha só, com todo o CSS base).

Telas de referência (arquivo Figma `BElIaiOW5D1qFF8QStnoDo`, seção `284-11568` "Ver ingredientes / Variações taste"):

| Tela | node-id |
| --- | --- |
| Desktop · Variação 01 / Dragzone lateral (1440 × 900) | `284-11569` |
| Celular · visão completa (390 de largura, rolagem) | `294-11399` |
| Celular · recorte de 844px (mesma tela, sem rolar) | `294-11262` |
| Componentes: chips (Retirar/Recolocar) e cards da Bandeja | `290-11151` |

## Problem Statement

A tela Ver ingredientes foi desenhada antes do Figma: fundo laranja em degradê, ✕ no canto, ações num rodapé, Bandeja e chips dentro da mesma caixa tracejada, título "Personalize seu Whopper", texto da Bandeja que muda conforme o estado e ícones dos chips feitos com caracteres de texto (✓, ＋, −).

## Solution

Seguir a Variação 01 no desktop e a "visão completa" no celular, mantendo o hambúrguer 3D aberto (a foto do Figma é "prévia ilustrativa"; ADR 0001) e todo o comportamento atual de retirar, recolocar, arrastar, aplicar e cancelar.

## User Stories

1. Como cliente, quero ver o hambúrguer aberto num palco bege, com a legenda "O seu <produto> do seu jeito.", e o painel de ingredientes ao lado.
2. Como cliente, quero Cancelar e Aplicar alterações sempre à mão: no cabeçalho, no desktop; numa barra fixa embaixo, no celular.
3. Como cliente, quero uma Bandeja claramente demarcada para soltar os ingredientes que arrasto, com cada ingrediente retirado mostrado grande, com imagem e nome.
4. Como cliente, quero chips que mostrem se o ingrediente está no hambúrguer e, ao passar o mouse, o que o clique vai fazer.
5. Como cliente, quero recolocar tudo de uma vez, e entender quando não há nada para recolocar.
6. Como cliente no celular ou tablet, quero a tela numa coluna só, com rolagem, sem perder as ações.
7. Como responsável pelo case, quero capturas de desktop e 390 × 844 para o Behance.

## Implementation Decisions

- **Variação adotada:** desktop = Variação 01 (`284-11569`); celular = uma página com rolagem (`294-11399`) e barra de ações fixa embaixo; `294-11262` é só o recorte dela.
- **Hambúrguer:** continua o 3D aberto atual (camadas separadas). Só o fundo do palco muda para o bege do Figma (`--hero` #eadbc8).
- **Fundo e painel:** sai o degradê laranja. Cabeçalho creme; palco bege à esquerda; painel creme de 440px à direita, de altura total (desktop).
- **Cabeçalho e ações:** título "Ver ingredientes" (Flame Bold). No desktop, Cancelar e Aplicar alterações à direita do título. O ✕ e o rodapé saem. No celular, o cabeçalho tem só o título; as ações ficam numa barra fixa embaixo. Esc continua cancelando.
- **Legenda:** "O seu <nome do produto> do seu jeito." abaixo do hambúrguer ("O seu Whopper® do seu jeito.", "O seu Cheddar Duplo do seu jeito."). É legenda decorativa; o nome da tela continua "Ver ingredientes".
- **Bandeja separada:** a área tracejada é só a Bandeja: título "Ingredientes retirados" e texto fixo "Arraste os ingredientes para cá." (não muda mais com o estado). Só ela aceita soltar ingredientes arrastados. Desktop: altura fixa de 400px. Celular: 213px, crescendo em linhas se passar de 3 ingredientes.
- **Card da Bandeja:** 104 × 88 (desktop) e 94 × 88 (celular), com a Camada 3D isolada em cima e o nome embaixo. Tocar recoloca, como hoje. Hover com borda marrom, como hoje.
- **Chips:** fora da Bandeja, sob o título "Ingredientes" (substitui "Personalize seu …"). Texto de ajuda: "Clique para retirar ou recolocar." com mouse e "Toque para retirar ou recolocar." no toque (`hover: hover`). O "remover ou adicionar" do Figma contraria o glossário. Um chip por Camada retirável, com os nomes da Receita (Cheddar Duplo: "Cheddar inferior", "Cheddar superior", "Cebola crispy").
- **Estados do chip:** presente = marrom-escuro com Check; retirado = creme com borda e Plus. Seguir o Figma; hoje o CSS inverte as cores pelo `aria-pressed`.
- **Ícones dos chips:** SVG inline de 14px, da biblioteca **Phosphor Icons** usada no Figma, formato **Outline** e peso **Bold**: Check, Plus e Minus. Nada de caracteres de texto. A revisão geral dos ícones do site é outro ticket, do responsável pelo case.
- **Hover e foco do chip:** o ícone mostra a ação que o clique vai fazer. Presente: Check → Minus (retirar). Retirado: Plus → Check (recolocar). Vale no hover (`hover: hover`) e no `:focus-visible`. O retirado também ganha borda marrom no hover.
- **Recolocar todos:** botão de largura total embaixo dos chips, sempre visível, desabilitado com a Bandeja vazia.
- **Animações:** ficam como estão (a Camada voando para a Bandeja, `.closing`). O destaque da Bandeja ao arrastar por cima (`.tray.over`) troca o amarelo #ffe094 por um bege um pouco mais escuro com borda tracejada marrom.
- **Ponto de quebra:** layout de celular abaixo de 1024px (antes 600px), coerente com `.scratch/revisao-figma/spec.md`.
- **Acessibilidade mantida:** o diálogo segue `role="dialog"` com `aria-modal`; os cards da Bandeja seguem com "Recolocar X"; os chips seguem com `aria-pressed` e "Retirar X"/"Recolocar X"; o status `aria-live` continua.

## Testing Decisions

- A mesma costura: a página no navegador real, via Playwright, por papéis e rótulos acessíveis (`npm run test:build`, `workers: 2`).
- Comportamentos novos: Cancelar e Aplicar no cabeçalho (desktop) e na barra fixa (390 de largura); sem botão ✕; Esc cancela; legenda com o nome do produto; texto fixo da Bandeja; soltar fora da Bandeja não retira; Recolocar todos desabilitado com a Bandeja vazia; texto de ajuda com mouse e no toque.
- Testes existentes que dependem do ✕, de "Personalize seu", do texto da Bandeja que muda ou dos caracteres ✓/＋/− mudam junto (ver `tests/support.js`).
- Capturas de revisão: desktop 1440 × 900 e 390 × 844, Whopper e Cheddar Duplo, com e sem ingredientes na Bandeja, revisadas por humano ao lado do Figma.

## Out of Scope

- Revisão geral dos ícones do site (ticket próprio do responsável pelo case).
- Foto do hambúrguer no lugar do 3D.
- Mudanças em Receita, preço ou Personalização.

## Further Notes

- Um ticket por vez, na ordem 01 → 02 → 03, terminando num PR para a `main`.
