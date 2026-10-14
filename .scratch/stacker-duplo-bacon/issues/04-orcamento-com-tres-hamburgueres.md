# 04: Orçamento medido com três hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo e Stacker Duplo Bacon no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/stacker-duplo-bacon` para a `main`.

**Blocked by:** 03.

**Status:** claimed

- [ ] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps)
- [ ] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [ ] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão

## Comments

### Medição (2026-10-14)

`npm run test:orcamento` contra o build, 1 worker, 4 execuções completas seguidas (a quarta depois dos ajustes da revisão de código), máquina ociosa (mesma máquina e GPU do ticket 05 do Cheddar Duplo: Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz). "CPU 4x" = celular intermediário do ticket 11. O Cheddar Duplo e o Stacker Duplo Bacon são escolhidos pela grade, como faz o cliente; a página sempre abre no Whopper. Faixas = mínimo–máximo das execuções.

| Medida | Ticket 05 (Whopper e Cheddar Duplo) | Whopper | Cheddar Duplo | Stacker Duplo Bacon | Limite aceito (meta) |
| --- | --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 149 KB | 153,3 KB (um bundle só; `main`: 151,6 KB) | ← | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana | 0,75–0,96 s | 0,94–1,36 s (`main`: 1,30–1,31 s) | — | — | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha do produto na grade, CPU 4x | — | — | 1,29–1,49 s | 0,51–0,54 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 1,14–1,17 s | 0,22–0,31 s (voltando a ele) | 0,21–0,29 s | 0,20–0,27 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | 2,8–3,0 s | 3,0–3,3 s | — | — | — |
| fps desktop: abrir / arrastar / inclinar | 75 / 75 / 75 | 73–74 / 75–76 (ruído; teto 75) / 75 | 74–75 / 74–75 / 75 | 74 / 75 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 69–72 / 71–72 / 74–75 | 62–68 / 71–73 / 71–75 | 68–71 / 71–73 / 71–75 | 70–72 / 73–74 / 74–75 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | 240–254 ms / 920–1000 ms | — | 294–334 ms / 1,09–1,29 s | 120–133 ms / 334–400 ms | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização foi feita.**
- **Peso:** +1,7 KB em relação à `main` (bacon, molho Stacker e o cheddar fatiado em laranja). Folga de ~97 KB.
- **Stacker Duplo Bacon é mais leve que o Cheddar Duplo:** a primeira troca leva ~0,5 s e trava a página por ~0,35 s com CPU 4x, contra ~1,5 s e ~1,2 s do Cheddar Duplo. Ele reaproveita a carne, os pães e a fatia de queijo do Whopper, cuja geometria já foi gerada; só o bacon e o molho são novos. No arrasto do Ver ingredientes, foi usado o Bacon.
- **Primeira troca versus as seguintes:** desde `2d10d81`, a geometria de cada Camada é gerada uma vez por página. A mediana das trocas (ticket 05) descartava justamente a primeira, que é a que o cliente vê. O teste agora registra e limita a primeira troca à parte. Por isso o Cheddar Duplo "caiu" de 1,15 s para 0,25 s na mediana: o custo foi para a primeira troca (1,47 s), perto da meta de 1,5 s.
- **Whopper ao carregar a página: 0,94–1,36 s (1,16–1,36 s em 3 das 4 execuções), contra 0,75–0,96 s no ticket 05.** A `main` dá o mesmo (1,30–1,31 s, medido numa cópia da `main` nesta máquina, hoje), então esta branch não é a causa. Fica abaixo da meta de 1,5 s. Suspeitos, sem investigar: a Entrada (ticket 15) e a carne com crosta (ticket 14), que entraram depois do ticket 05.

**Testes (`tests/orcamento.spec.js`):** os três testes de fps, o primeiro quadro ao escolher na grade e o informativo da troca rodam para o Stacker Duplo Bacon também. O primeiro quadro ao escolher na grade agora registra e limita a primeira troca, além da mediana das seguintes.

**Exige aparelho físico** (igual ao ticket 05): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca (~1,2 s do Cheddar Duplo, ~0,35 s do Stacker Duplo Bacon com CPU 4x) num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.

### Pendências (2026-10-14)

- Medido antes da aprovação do ticket 03, que segue `claimed`: se a revisão mudar o bacon ou o molho, as linhas do Stacker Duplo Bacon precisam ser medidas de novo.
- `npm run test:build` inteiro verde: 557 aprovados, 39 pulados (10,7 min, 2 workers).
- PR para a `main` aguarda a aprovação do ticket 03 e as capturas finais da revisão.
