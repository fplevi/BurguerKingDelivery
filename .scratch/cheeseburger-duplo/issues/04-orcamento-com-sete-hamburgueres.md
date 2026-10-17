# 04: Orçamento medido com sete hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King, Rodeio e Cheeseburger Duplo no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). O Cheeseburger Duplo entra na lista de produtos medidos; nenhum teste novo. Otimizar só o que passar dos limites; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/cheeseburger-duplo` para a `main`, com as capturas da revisão.

**Blocked by:** 03.

**Status:** resolved

- [x] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps), com o Cheeseburger Duplo na primeira escolha e nas seguintes
- [x] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [x] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [x] PR aberto para a `main` com as capturas da revisão

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização. Peso 159,5 KB gzip (+3,9 KB sobre a `main`). Cheeseburger Duplo na primeira escolha: 0,25 s com CPU 4x; nas seguintes, 0,19 s.
- `tests/orcamento.spec.js` mede o Cheeseburger Duplo nos testes que já existiam; nenhum teste novo.
- `npm run test:build` verde de primeira (719 aprovados, 39 pulados) num worktree isolado no commit `abdf1bf`.
- PR para a `main`: https://github.com/fplevi/BurguerKingNewSite/pull/20, com a folha de revisão e os quadros da Entrada e da Saída do ticket 03.

## Comments

### Medição (2026-10-17)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas seguidas (63 aprovados, 9 pulados em cada), num worktree só desta medição no commit `abdf1bf` (porta 4193, `dist/` e `test-results/` próprios): a pasta principal tinha alterações em andamento da barra do carrinho, que não entram nesta branch. Mesma máquina e GPU dos tickets anteriores (Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz), CPU em ~30% no início. "CPU 4x" = celular intermediário do ticket 11. Faixas = mínimo–máximo das execuções; valor único = igual nas três (arredondado).

| Medida | Whopper | Cheddar Duplo | Stacker Duplo Bacon | Rodeio Duplo | Rodeio | Big King | Cheeseburger Duplo | Limite aceito (meta) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 159,5 KB (um bundle só; `main` de hoje: 155,6 KB) | ← | ← | ← | ← | ← | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana de 7 | 1,21–1,23 s | — | — | — | — | — | — | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha do produto na grade, CPU 4x | — | 1,28–1,29 s | 0,47–0,49 s | 0,40–0,44 s | 0,31–0,34 s | 0,31–0,32 s | 0,25 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 0,21–0,26 s (voltando a ele) | 0,21–0,26 s | 0,20–0,23 s | 0,21–0,23 s | 0,19–0,20 s | 0,21–0,23 s | 0,19 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | 3,7–3,8 s | — | — | — | — | — | — | — |
| fps desktop: abrir / arrastar / inclinar | 73–74 / 75–76 / 75 | 74–75 / 75–76 / 75 | 74 / 75–76 / 75 | 74 / 74–75 / 75 | 75 / 75–76 / 75 | 73–74 / 75 / 75 | 75 / 75–76 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 66–67 / 73 / 75 | 69–71 / 72–73 / 75 | 72–73 / 71–73 / 75 | 71–72 / 70–73 / 75 | 72 / 71–74 / 75 | 69 / 72–73 / 75 | 72 / 70–73 / 75 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | — | 293–333 ms / 1,13–1,21 s | 120 ms / 347–414 ms | 107 ms / 280–307 ms | 107 ms / 253 ms | 93–107 ms / 267 ms | 80 ms / 200–214 ms | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização foi feita.**
- **Peso:** +3,9 KB em relação à `main` de hoje (155,6 KB, medido no mesmo worktree em `origin/main`): o modelo da Mostarda, o `squash` da cena e a Receita. Folga de ~90 KB.
- **Cheeseburger Duplo é o mais leve dos escolhidos na grade:** a primeira troca leva 0,25 s e trava a página por ~0,2 s com CPU 4x; as seguintes, 0,19 s. Tem 9 Camadas, e só a Mostarda é modelo novo; nenhuma receita de textura nova. No arrasto do Ver ingredientes, foi usada a Mostarda.
- **Whopper ao carregar a página: 1,21–1,23 s**, na faixa do ticket 03 do Rodeio (1,20–1,22 s) e da execução com a máquina livre do Big King (1,22 s), abaixo da meta de 1,5 s. Os seis hambúrgueres anteriores ficaram nas faixas dos tickets anteriores.

**Testes (`tests/orcamento.spec.js`):** o Cheeseburger Duplo entra na lista de produtos (chave `cheeseburger-duplo`), como o Big King no ticket 03 dele; nenhum teste novo.

**Exige aparelho físico** (igual aos tickets anteriores): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca (~1,2 s do Cheddar Duplo, ~0,2 s do Cheeseburger Duplo com CPU 4x) num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.

### Suíte (2026-10-17)

- Rodada 1 de `npm run test:build`, no mesmo worktree da medição (commit `abdf1bf`, porta 4193): **719 aprovados, 39 pulados, 13,4 min**. Não foi preciso comparar com a `main`.
- O worktree isola a suíte das alterações em andamento da barra do carrinho na pasta principal (`src/main.js`, CSS e `tests/barra-do-carrinho.spec.js`, não commitados), que ficaram fora desta branch.
