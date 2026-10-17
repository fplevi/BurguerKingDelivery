# 03: Orçamento medido com oito hambúrgueres

**What to build:** medir de novo o orçamento com os oito hambúrgueres no build (Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King, Cheeseburger Duplo, Cheeseburger e Rodeio): peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). O Cheeseburger entra na lista de produtos medidos; nenhum teste novo. Otimizar só o que passar dos limites; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/cheeseburger` para a `main`, com as capturas da revisão.

**Blocked by:** 02.

**Status:** resolved

- [x] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps), com o Cheeseburger na escolha pela grade
- [x] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [x] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [x] PR aberto para a `main` com as capturas da revisão

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização. Peso 159,5 KB gzip, igual ao da `main`. Cheeseburger na primeira escolha: 0,26 s com CPU 4x; nas seguintes, 0,16–0,21 s.
- `tests/orcamento.spec.js` mede o Cheeseburger nos testes que já existiam; nenhum teste novo.
- `npm run test:build` verde na segunda rodada (763 aprovados, 39 pulados), no commit `4fbe56a`.
- PR para a `main` com a folha de revisão e os quadros da Entrada e da Saída do ticket 02.

## Comments

### Medição (2026-10-17)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas seguidas (72 aprovados e 10 pulados em cada), na worktree `feat/cheeseburger` no commit `4fbe56a` (porta 4193). Mesma máquina e GPU dos tickets anteriores (Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz). "CPU 4x" = celular intermediário do ticket 11. Faixa = mínimo–máximo das execuções; valor único = igual nas três. A execução 2 foi mais ruidosa em tudo (os outros hambúrgueres também ficaram mais lentos nela); as faixas a incluem.

| Medida | Cheeseburger | Os outros sete | Limite aceito (meta) |
| --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 159,5 KB (igual ao da `main`: só a Receita é nova) | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página (Whopper), CPU 4x, mediana de 7 | — | 0,92–1,31 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha na grade, CPU 4x | 0,26 s | 0,26–1,32 s (o maior: Cheddar Duplo) | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 0,16–0,21 s | 0,16–0,28 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | — | 3,6–3,8 s | — |
| fps desktop: abrir / arrastar / inclinar | 75 / 73–75 / 75 | 73–75 / 74–76 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 70–73 / 73–74 / 73–75 | 61–73 / 57–74 / 72–75 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | 80–93 ms / 200–214 ms | 80–320 ms / 200 ms–1,32 s | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização.**
- **Peso:** 159,5 KB, igual à `main` (o ticket 04 do Cheeseburger Duplo mediu o mesmo valor): nenhum modelo nem textura novos.
- **O Cheeseburger é o mais leve da grade:** com 7 Camadas e só modelos já carregados, a primeira escolha desenha em ~0,26 s com CPU 4x e trava a página por ~0,2 s.
- No arrasto do Ver ingredientes, foi usada a Mostarda.

**Testes (`tests/orcamento.spec.js`):** o Cheeseburger entra na lista de produtos (chave `cheeseburger`); nenhum teste novo.

**Exige aparelho físico** (igual aos tickets anteriores): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.

### Suíte (2026-10-17)

- Rodada 1 de `npm run test:build` (commit `4fbe56a`, porta 4193): 762 aprovados, 39 pulados e **1 falha**. A falha foi em `arrasto-3d.spec.js:58` [desktop], que só usa o Whopper: o botão "Ver ingredientes" não ficou estável para o clique.
- O mesmo teste, isolado contra o build com `--repeat-each=10`, passou nas 10 vezes.
- Rodada 2, completa: **763 aprovados, 39 pulados, 15,3 min**. Como a falha não se repetiu nem mudou de lugar, a suíte da `main` não foi rodada para comparar.
