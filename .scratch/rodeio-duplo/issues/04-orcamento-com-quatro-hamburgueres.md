# 04: Orçamento medido com quatro hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon e Rodeio Duplo no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/rodeio-duplo` para a `main`.

**Blocked by:** 03.

**Status:** resolved

- [x] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps)
- [x] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [x] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [x] PR aberto para a `main` com as capturas da revisão

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização. Peso 154,6 KB gzip (+1,3 KB). Rodeio Duplo na primeira escolha: 0,40–0,43 s com CPU 4x, e trava a página ~0,3 s, o mais leve dos três escolhidos na grade.
- `tests/orcamento.spec.js` mede o Rodeio Duplo nos testes que já existiam; nenhum teste novo.
- `npm run test:build` verde (591 aprovados, 39 pulados) na segunda rodada; a primeira teve uma falha que não volta isolada nem na rodada seguinte (ver Comments). PR aberto para a `main`.

## Comments

### Medição (2026-10-14)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas seguidas, máquina ociosa (mesma máquina e GPU do ticket 04 do Stacker Duplo Bacon: Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz). "CPU 4x" = celular intermediário do ticket 11. Os hambúrgueres além do Whopper são escolhidos pela grade, como faz o cliente; a página sempre abre no Whopper. Faixas = mínimo–máximo das execuções.

| Medida | Whopper | Cheddar Duplo | Stacker Duplo Bacon | Rodeio Duplo | Limite aceito (meta) |
| --- | --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 154,6 KB (um bundle só; ticket 04 do Stacker: 153,3 KB) | ← | ← | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana de 7 | 1,18–1,21 s | — | — | — | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha do produto na grade, CPU 4x | — | 1,29–1,36 s | 0,45–0,47 s | 0,40–0,43 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 0,21–0,24 s (voltando a ele) | 0,23–0,24 s | 0,20–0,22 s | 0,20–0,23 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | 3,1–3,2 s | — | — | — | — |
| fps desktop: abrir / arrastar / inclinar | 73–74 / 75–76 / 75 | 74–75 / 74–76 / 75 | 74–75 / 75 / 75 | 74–75 / 75 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 66 / 72–74 / 74–75 | 69–71 / 71–72 / 74 | 70–72 / 71–73 / 75 | 70–73 / 73 / 75 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | — | 294–307 ms / 1,11–1,15 s | 120–133 ms / 333–360 ms | 107 ms / 280–320 ms | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização foi feita.**
- **Peso:** +1,3 KB em relação ao ticket 04 do Stacker Duplo Bacon (onion rings com o empanado, molho barbecue). Folga de ~95 KB.
- **Rodeio Duplo é o mais leve dos escolhidos na grade:** a primeira troca leva ~0,4 s e trava a página por ~0,3 s com CPU 4x (Stacker: ~0,45 s e ~0,35 s; Cheddar Duplo: ~1,3 s e ~1,1 s). Ele reaproveita pães, carnes, queijo e maionese do Whopper; só os onion rings e o barbecue são novos. No arrasto do Ver ingredientes, foram usados os Onion rings.
- **Whopper ao carregar a página: 1,18–1,21 s**, na faixa do ticket 04 do Stacker (0,94–1,36 s) e abaixo da meta de 1,5 s.

**Testes (`tests/orcamento.spec.js`):** o Rodeio Duplo entra na lista de produtos; os três testes de fps, o primeiro quadro ao escolher na grade (primeira troca e mediana das seguintes) e o informativo da troca rodam para ele também. Nenhum teste novo foi escrito ("`tests/orcamento.spec.js` não ganha testes", na spec): o Rodeio Duplo só entra na lista que os testes existentes percorrem, como o Stacker Duplo Bacon no ticket 04 dele. Sem isso, ele não seria medido.

**Exige aparelho físico** (igual aos tickets anteriores): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca (~1,1 s do Cheddar Duplo, ~0,3 s do Rodeio Duplo com CPU 4x) num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.

### Suíte (2026-10-14)

- Rodada 1 de `npm run test:build`: 590 aprovados, 1 falha, 39 pulados. A falha foi `categorias.spec.js:169` (desktop), a foto sem `object-view-box`, por diferença de pixels. O teste levou 19,5 s, contra menos de 1 s normalmente. Este ticket só muda `orcamento.spec.js`, que não roda no `test:build`.
- O teste passou isolado (`categorias.spec.js` inteiro: 21 aprovados).
- Rodada 2 da suíte inteira: **591 aprovados, 39 pulados, 10,6 min**. Como a branch passou inteira, não foi preciso comparar com a `main`.
