# 03: Orçamento medido com cinco hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo e Rodeio no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/rodeio` para a `main`.

**Blocked by:** 02.

**Status:** claimed

- [ ] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps)
- [ ] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [ ] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão

## Comments

### Medição (2026-10-15)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas seguidas (45 aprovados, 7 pulados em cada), máquina ociosa (mesma máquina e GPU do ticket 04 do Rodeio Duplo: Windows + Chrome, ANGLE/D3D11, monitor de 75 Hz). "CPU 4x" = celular intermediário do ticket 11. Os hambúrgueres além do Whopper são escolhidos pela grade, como faz o cliente; a página sempre abre no Whopper. Faixas = mínimo–máximo das execuções.

| Medida | Whopper | Cheddar Duplo | Stacker Duplo Bacon | Rodeio Duplo | Rodeio | Limite aceito (meta) |
| --- | --- | --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 154,9 KB (um bundle só; ticket 04 do Rodeio Duplo: 154,6 KB) | ← | ← | ← | ← | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana de 7 | 1,20–1,22 s | — | — | — | — | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro na **primeira** escolha do produto na grade, CPU 4x | — | 1,29–1,36 s | 0,47–0,55 s | 0,41–0,44 s | 0,31–0,35 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro nas escolhas seguintes, CPU 4x, mediana de 7 | 0,21–0,27 s (voltando a ele) | 0,22–0,24 s | 0,21–0,23 s | 0,21–0,23 s | 0,20–0,21 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | 3,1 s | — | — | — | — | — |
| fps desktop: abrir / arrastar / inclinar | 73–74 / 75–76 / 75 | 74 / 75 / 75 | 74–75 / 75–76 / 75 | 74 / 75–76 / 75 | 74–75 / 75 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 65–66 / 71–74 / 72–75 | 70–71 / 73 / 73–75 | 70–72 / 71–72 / 75 | 67–73 / 72–73 / 74–75 | 71–72 / 71–73 / 73–75 | ≥ 25 (30) ✅ |
| Troca (primeira) para o produto: maior quadro, desktop / CPU 4x (informativo) | — | 294–320 ms / 1,13–1,31 s | 120–133 ms / 334–414 ms | 107–120 ms / 307–360 ms | 107–133 ms / 267–320 ms | — |

Leitura:

- **Tudo dentro dos limites aceitos; nenhuma otimização foi feita.**
- **Peso:** +0,3 KB em relação ao ticket 04 do Rodeio Duplo (a variante de um anel do onion ring e a Receita). Folga de ~95 KB.
- **Rodeio é o mais leve dos escolhidos na grade:** a primeira troca leva ~0,3 s e trava a página por ~0,3 s com CPU 4x. Ele só reaproveita modelos e texturas; nenhuma receita de textura nova. No arrasto do Ver ingredientes, foi usado o Onion ring.
- **Whopper ao carregar a página: 1,20–1,22 s**, na faixa do ticket 04 do Rodeio Duplo (1,18–1,21 s) e abaixo da meta de 1,5 s. Os quatro hambúrgueres anteriores ficaram nas faixas do ticket 04 do Rodeio Duplo.

**Testes (`tests/orcamento.spec.js`):** o Rodeio entra na lista de produtos, como o Rodeio Duplo no ticket 04 dele; nenhum teste novo ("`tests/orcamento.spec.js` não ganha testes", na spec). A chave do Rodeio Duplo nas medições registradas passou de `rodeio` para `rodeio-duplo`, e `rodeio` agora é o Rodeio.

**Exige aparelho físico** (igual aos tickets anteriores): primeiro quadro e fps numa GPU de celular (GLES, não ANGLE/D3D11); a trava da primeira troca (~1,2 s do Cheddar Duplo, ~0,3 s do Rodeio com CPU 4x) num celular de verdade; arrasto por toque e inclinação pela orientação do aparelho.
