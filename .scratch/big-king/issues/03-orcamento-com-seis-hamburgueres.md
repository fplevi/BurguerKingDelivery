# 03: Orçamento medido com seis hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King e Rodeio no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). O Big King entra na lista de produtos medidos; nenhum teste novo. Otimizar só o que passar dos limites; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/big-king` para a `main`, aberto só depois que o PR do Rodeio entrar.

**Blocked by:** 02.

**Status:** claimed

- [x] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps), com o Big King na primeira escolha e nas seguintes
- [x] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [x] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão, depois do merge do Rodeio

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização. Peso 155,6 KB gzip (+0,7 KB). Big King na primeira escolha: 0,34–0,42 s com CPU 4x; nas seguintes, 0,24–0,36 s.
- `tests/orcamento.spec.js` mede o Big King nos testes que já existiam; nenhum teste novo.
- `npm run test:build` verde (671 aprovados, 39 pulados) num worktree isolado no HEAD `97163cd`; a rodada na pasta de sempre caiu porque outra sessão rodava testes ali ao mesmo tempo (ver Comments).
- **Pendente: o PR para a `main`.** O ticket pede abri-lo só depois que o PR do Rodeio (`feat/rodeio`) entrar, e esse PR ainda não foi aberto (2026-10-15). Por isso o ticket fica `claimed`, não `resolved`.

## Comments

### Medição (2026-10-15)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas (54 aprovados, 8 pulados em cada). Mesma máquina e GPU dos tickets anteriores (Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz), mas **ocupada**: CPU em ~75% com outros processos (outra sessão de agente rodando Playwright e Vite na mesma pasta, ChatGPT). A terceira execução pegou a máquina mais livre e repete as faixas do ticket 03 do Rodeio. "CPU 4x" = celular intermediário do ticket 11. Faixas = mínimo–máximo das execuções.

| Medida | Whopper | Cheddar Duplo | Stacker Duplo Bacon | Rodeio Duplo | Rodeio | Big King | Limite aceito (meta) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 155,6 KB (um bundle só; ticket 03 do Rodeio: 154,9 KB) | ← | ← | ← | ← | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana de 7 | 1,22–2,06 s | — | — | — | — | — | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha do produto na grade, CPU 4x | — | 1,38–2,43 s | 0,49–0,78 s | 0,42–0,73 s | 0,32–0,62 s | 0,34–0,42 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 0,21–0,56 s (voltando a ele) | 0,22–0,65 s | 0,21–0,31 s | 0,20–0,38 s | 0,20–0,32 s | 0,24–0,36 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | 3,7–4,4 s | — | — | — | — | — | — |
| fps desktop: abrir / arrastar / inclinar | 72–73 / 74–75 / 75 | 74 / 75 / 75 | 73–74 / 74–76 / 75 | 73–74 / 75 / 67–75 | 74–75 / 72–75 / 75 | 67–73 / 75 / 67–75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 49–66 / 68–74 / 54–75 | 58–69 / 68–72 / 64–75 | 54–71 / 72–74 / 69–75 | 60–72 / 65–73 / 57–75 | 54–72 / 68–73 / 52–75 | 54–68 / 62–71 / 53–73 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | — | 307–627 ms / 1,31–2,00 s | 133–400 ms / 400–667 ms | 107–160 ms / 334–507 ms | 107–200 ms / 307–453 ms | 107–147 ms / 307–520 ms | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização foi feita.**
- **Peso:** +0,7 KB em relação ao ticket 03 do Rodeio (os dois modelos do molho Big King, o pão do meio, o `spread` e a Receita). Folga de ~94 KB.
- **Big King na primeira escolha: 0,34–0,42 s** com CPU 4x, entre os mais leves dos escolhidos na grade; a troca trava a página por ~0,3–0,5 s com CPU 4x. Nenhuma receita de textura nova. No arrasto do Ver ingredientes, foi usado o Molho Big King inferior (modelo novo do ticket 02).
- **Whopper ao carregar a página: 1,22 s na execução com a máquina livre**, igual ao ticket 03 do Rodeio (1,20–1,22 s). As outras duas (1,97 e 2,06 s) subiram com a carga da máquina, não com o Big King: no controle, rodando o mesmo teste alternado entre `feat/rodeio` e esta branch, sob a mesma carga, deu 1,96 e 1,53 s no Rodeio contra 1,65 e 1,88 s aqui. Pelo mesmo motivo a primeira escolha do Cheddar Duplo foi a 2,2–2,4 s nas duas branches; continua abaixo do limite de 3 s, e passou da meta de 1,5 s só com a máquina ocupada.

**Testes (`tests/orcamento.spec.js`):** o Big King entra na lista de produtos (chave `big-king`), como o Rodeio no ticket 03 dele; nenhum teste novo.

**Exige aparelho físico** (igual aos tickets anteriores): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca (~1,3 s do Cheddar Duplo, ~0,4 s do Big King com CPU 4x) num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.

### Suíte (2026-10-15)

- Rodada 1 de `npm run test:build`, na pasta `prototype/` de sempre: 660 aprovados, 11 falhas, 39 pulados. Nenhuma falha de asserção: dez foram `ENOENT` ao gravar traces em `test-results/` e uma foi `ERR_HTTP_RESPONSE_CODE_FAILURE` no `vite preview`. Causa: outra sessão de agente rodava Playwright (`minha-conta`, `layout-conta`, `dados-pessoais`) e `vite build` na mesma pasta ao mesmo tempo, apagando `test-results/` e refazendo `dist/` no meio da rodada.
- Rodada 2, num worktree só desta medição (HEAD `97163cd`, mais `tests/orcamento.spec.js` deste ticket; porta 4193, `test-results/` e `dist/` próprios): **671 aprovados, 39 pulados, 14,4 min**. Não foi preciso comparar com a `main`: as falhas da rodada 1 vieram de fora da suíte.
- Fica para depois: rodar a suíte num worktree próprio quando outra sessão usa a mesma pasta, porque `test-results/` e `dist/` não são isolados por porta.
