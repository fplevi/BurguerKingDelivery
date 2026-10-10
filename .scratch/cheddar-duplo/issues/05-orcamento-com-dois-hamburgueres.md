# 05: Orçamento medido com dois hambúrgueres

**What to build:** medir de novo o orçamento com o Whopper e o Cheddar Duplo no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado.

**Blocked by:** 04.

**Status:** resolved

- [x] Peso da parte 3D ≤ 250 KB gzip
- [x] Primeiro quadro e fps dentro dos limites aceitos, com o Cheddar Duplo selecionado
- [x] Relatório em `## Comments` com os números e o que ainda exige aparelho físico

## Answer

- Tudo dentro dos limites aceitos; nenhuma otimização foi feita. Peso 149 KB gzip (ticket 11: 145). Primeiro quadro do Cheddar Duplo, ao escolhê-lo na grade, 1,14–1,17 s (mediana, CPU 4x; limite 3 s). Fps do Cheddar Duplo iguais aos do Whopper.
- Custo novo: trocar de produto reconstrói as duas cenas e trava a página por até ~1 s com CPU 4x (240 ms no desktop). Fica registrado como informativo, sem limite.
- `tests/orcamento.spec.js` agora cobre os dois hambúrgueres. `test:orcamento` rodava com 2 workers sem querer (o `workers: 2` do `playwright.config.js` sobrescrevia o `workers: 1`). Corrigido.
- Fps real, toque e o primeiro quadro numa GPU de celular continuam dependendo de aparelho físico.

## Comments

### Medição (2026-10-10)

`npm run test:orcamento` contra o build, 1 worker, 3 execuções completas seguidas, sem outros testes na máquina. "CPU 4x" = celular intermediário do ticket 11 (só a CPU desacelerada; a GPU é a da máquina, Windows + Chrome com ANGLE/D3D11). O Cheddar Duplo é escolhido pela grade, como faz o cliente. A página sempre abre no Whopper, então o "primeiro quadro do Cheddar Duplo" vai do clique no card até o primeiro quadro da cena nova no hero.

Faixas = mínimo–máximo das 3 execuções (mediana de 7 medidas por execução no primeiro quadro).

| Medida | Ticket 11 (Whopper) | Whopper agora | Cheddar Duplo | Limite aceito (meta) |
| --- | --- | --- | --- | --- |
| JS da parte 3D (`burger-3d` + worker), gzip | 145 KB | 149 KB (o mesmo bundle serve os dois) | 149 KB | ≤ 250 KB ✅ |
| Primeiro quadro ao carregar a página, CPU 4x, mediana | 2,2–2,5 s | 0,75–0,96 s | — (a página abre no Whopper) | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro ao escolher o produto na grade, CPU 4x, mediana | — | 0,47–0,48 s (voltando ao Whopper) | 1,14–1,17 s | ≤ 3 s (1,5 s) ✅ |
| Primeiro quadro com 4G lento (informativo) | ~7,4 s | 2,8–3,0 s | — | — |
| fps desktop: abrir / arrastar / inclinar | 38–60 / 47–60 / 56–60 | 75 / 75 / 75 | 75 / 75 / 75 | ≥ 35 (55) ✅ |
| fps CPU 4x: abrir / arrastar / inclinar | 44–56 / 28–57 / 35–57 | 65–67 / 70–72 / 72–75 | 69–72 / 71–72 / 74–75 | ≥ 25 (30) ✅ |
| Troca para o Cheddar Duplo: maior quadro, desktop / CPU 4x (informativo) | — | — | 240–254 ms / 920–1000 ms | — |

Leitura:

- **Peso:** +4 KB em relação ao ticket 11, vindos da Receita por produto, da cebola crispy e do cheddar cremoso. Folga de 100 KB.
- **Primeiro quadro do Cheddar Duplo:** a cena dele custa ~0,7 s a mais que a do Whopper na mesma troca (1,15 s contra 0,47 s). Isso vem das camadas novas: cebola crispy ~36,8k triângulos e cada cheddar ~18,7k, com ruído por vértice. Se a página abrisse no Cheddar Duplo, a estimativa seria 1,45–1,65 s (primeiro quadro do Whopper ao carregar + 0,7 s). Fica no limite da meta de 1,5 s e bem abaixo do limite aceito. Hoje esse caso não existe, porque nenhum link abre direto no Cheddar Duplo.
- **Fps:** o monitor da máquina é de 75 Hz, então 75 é o teto. Com o Cheddar Duplo, abrir, arrastar a cebola crispy e inclinar ficam iguais ao Whopper. Os quadros mais longos (53–67 ms com CPU 4x, ao abrir e começar a arrastar) aparecem nos dois produtos.
- **Trocar de produto:** descarta as duas cenas e monta as novas na thread principal. Com CPU 4x a página fica parada por até ~1 s (um quadro de 920–1000 ms). Não há limite para isso no ticket 11, e o cliente vê o card selecionado e o texto trocados antes do 3D. Se incomodar no aparelho, os caminhos são os já listados no ticket 11: geometria gerada em worker, ou guardar a cena do produto anterior em vez de descartá-la, o que custa memória de GPU.
- **Máquina diferente do ticket 11:** o Whopper abre em 0,75–0,96 s, contra 2,2–2,5 s naquela medição, sem mudança no código da cena. Naquela data a máquina estava ocupada. Hoje ela estava ociosa, e os números variaram pouco entre execuções: uma única medida isolada de 2,2 s numa troca, contra 1,1–1,3 s nas outras. Não dá para comparar os dois tickets para dizer que a página ficou mais rápida.

**Testes (`tests/orcamento.spec.js`):**

- Os três testes de fps rodam para os dois produtos. No Cheddar Duplo, o arrasto usa a cebola crispy, porque ele não tem tomate.
- Teste novo: primeiro quadro do Cheddar Duplo ao escolhê-lo na grade, com o mesmo limite do primeiro quadro. Mediana de 7 trocas depois de uma de aquecimento; a volta ao Whopper também é registrada.
- Teste informativo novo: quadros durante a troca. `fpsDurante` agora também registra o quadro mais longo (`max`).
- `card` e `escolher` foram de `tests/cheddar-duplo.spec.js` para `tests/support.js`.

**Correção em `playwright.config.js`:** o `workers: 2` vinha depois do `workers: 1` do orçamento e o sobrescrevia, então `test:orcamento` rodava desktop e celular em paralelo. Agora é `workers: orcamento ? 1 : 2`. Todos os números acima são com 1 worker.

**Suítes:** `npm test` e `npm run test:build` verdes, com 106 testes aprovados e 4 pulados (2 workers).

**Exige aparelho físico:**

- Primeiro quadro e fps reais: a GPU de celular e a compilação de shaders em GLES diferem do ANGLE/D3D11 desta máquina, e o throttling só desacelera a CPU. Isso vale em especial para a cebola crispy e os cheddars, que somam ~74k triângulos.
- A trava de ~1 s ao trocar de produto num celular de verdade.
- Arrasto por toque e inclinação pela orientação do aparelho (Android), nos dois hambúrgueres.
