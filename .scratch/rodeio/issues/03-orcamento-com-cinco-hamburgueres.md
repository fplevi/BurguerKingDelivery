# 03: Orçamento medido com cinco hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo e Rodeio no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/rodeio` para a `main`.

**Blocked by:** 02.

**Status:** claimed

- [x] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps)
- [x] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [x] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização. Peso 154,9 KB gzip (+0,3 KB). Rodeio na primeira escolha: 0,31–0,35 s com CPU 4x, o mais leve dos quatro escolhidos na grade.
- `tests/orcamento.spec.js` mede o Rodeio nos testes que já existiam; nenhum teste novo.
- `npm run test:build` verde (627 aprovados, 39 pulados) na quarta rodada. As três primeiras tiveram uma falha cada, em testes sem 3D que passam isolados; a `main` passou inteira, mas a mesma falha de `categorias.spec.js:169` já aparecia com o código que hoje está na `main` (ver Comments).

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

### Suíte (2026-10-15)

- Rodada 1 de `npm run test:build`: 626 aprovados, 1 falha, 39 pulados. A falha foi `categorias.spec.js:169` (mobile-390), a foto sem `object-view-box`, por diferença de pixels entre as duas capturas do card.
- Rodada 2: 626 aprovados, 1 falha. A falha foi `layout-conta.spec.js:31` (desktop): o campo "Celular com DDD" não apareceu em 30 s. Passou isolado (`layout-conta.spec.js` inteiro: 8 aprovados), assim como `categorias.spec.js` (21 aprovados).
- Como as falhas mudaram de lugar, rodei a suíte da `main`: **591 aprovados, 39 pulados, 10,8 min**.
- Rodada 3 da branch: 626 aprovados, 1 falha, de novo `categorias.spec.js:169` (desktop). O trace mostra as duas capturas diferentes de fato; os 19 s do teste são só o Playwright formatando o diff dos buffers.
- Por que não é defeito desta branch: as falhas são em páginas sem 3D (categorias, conta), que o diff da branch não toca (`src` muda só na Receita, no anel e na inclinação do pão do Rodeio). E a mesma falha de `categorias.spec.js:169`, com o mesmo sintoma, aconteceu no ticket 04 do Rodeio Duplo (`195b658`), cujo `src` e `tests` são idênticos aos da `main` de hoje. É instabilidade que já existe na `main`, menos frequente do que aqui; a branch tem 35 testes 3D a mais disputando os 2 workers.
- Rodada 4 da suíte inteira: **627 aprovados, 39 pulados, 12,6 min**.
- Fica para depois: tornar `categorias.spec.js:169` estável (capturas do card que variam sob carga).
