# 11: Orçamento medido e otimização

**What to build:** com todas as camadas, bandeja, arrasto e inclinação prontos, medir o custo real e otimizar o que estourar o orçamento. As medições viram testes: peso gzip do JavaScript da parte 3D, tempo até o primeiro quadro e quadros por segundo medidos na página.

**Blocked by:** 06, 07, 08, 10.

**Status:** resolved

- [x] JavaScript da parte 3D, Three.js incluído, ≤ 250 KB gzip (teste sobre o build)
- [x] Primeiro quadro ≤ 1,5 s com throttling de celular intermediário (exceção aceita: mediana 2,2–2,5 s, ver Answer)
- [x] ~60 fps no desktop e ≥ 30 fps com throttling de celular intermediário, durante abrir, arrastar e inclinar (exceção aceita: variação da máquina, ver Answer)
- [x] Otimizações aplicadas onde necessário, sem perda visível de realismo aprovada em 05
- [x] Relatório em `## Comments` com os números e o que ainda exige aparelho físico (arrasto por toque, fps real)

## Answer

- Peso: 145 KB gzip para a parte 3D (chunk `burger-3d` + worker de texturas), dentro dos 250 KB; verificado por teste.
- **Exceção aceita pelo responsável pelo produto (2026-10-09):** o primeiro quadro fica em 2,2–2,5 s (mediana, CPU 4x, código já baixado), acima de 1,5 s, e os fps variam entre execuções nesta máquina (desktop 38–60, CPU 4x 28–57). As variações são consideradas normais do ambiente de teste. Os testes de `npm run test:orcamento` continuam com os limites originais e, por isso, podem falhar nesses dois casos; a confirmação fica para o aparelho físico.
- Otimizações, números antes/depois e o que ainda exige aparelho físico: ver Comments abaixo.

## Comments

### Medição e otimização (2026-10-09)

Medições em `npm run test:orcamento` (`tests/orcamento.spec.js`), contra o build, um teste por vez. "Celular intermediário" = CPU 4x mais lenta (perfil Lighthouse); a GPU é a da máquina de teste (Windows, Chrome com ANGLE/D3D11).

**Decisão do responsável pelo produto:** o limite de 1,5 s do primeiro quadro é verificado na CPU do celular (4x), com o código já baixado. Só o download com 4G lento (RTT 150 ms, 1,6 Mbps) leva mais de 1 s, então esse cenário é apenas informativo.

| Medida | Antes | Depois | Limite |
| --- | --- | --- | --- |
| JS da parte 3D (chunk `burger-3d` + worker de texturas), gzip | ~147 KB (sem chunk próprio) | 145 KB | ≤ 250 KB ✅ |
| Primeiro quadro, CPU 4x, mediana de 7 cargas | 2,9–3,4 s | 2,2–2,5 s | ≤ 1,5 s ❌ |
| Primeiro quadro, CPU 4x + 4G lento (informativo) | — | ~7,4 s | — |
| fps desktop: abrir / arrastar / inclinar | 51 / 60 / 60 | 38–60 / 47–60 / 56–60 | ~60 ⚠️ instável |
| fps CPU 4x: abrir / arrastar / inclinar | 44 / 58 / 52 | 44–56 / 28–57 / 35–57 | ≥ 30 ⚠️ instável |

**Otimizações aplicadas** (capturas antes/depois do hero e do hambúrguer aberto idênticas: diferença máxima de 1/255 por pixel, sem perda de realismo):

1. Parte 3D (Three.js + `src/scene`) em chunk próprio (`vite.config.js`), medido no teste e em cache separado do código da página.
2. A cena de Alterar ingredientes é criada depois do primeiro quadro do hero, em tempo ocioso (antes custava ~0,7 s antes do hero aparecer). Abrir antes disso cria a cena na hora.
3. Shaders compilados com `compileAsync` (compilação paralela, `KHR_parallel_shader_compile`), em vez de travar a página no primeiro render; a cena oculta faz um render de aquecimento, o que eliminou o quadro de 50–66 ms ao abrir.
4. Texturas pintadas em dois Web Workers (`texture-worker.js`, `texture-recipes.js`) em paralelo com geometria e compilação; sem workers, a página pinta sozinha.
5. `noise()` sem closures: 3,4× mais rápida, com resultado bit a bit idêntico.

**O que falta para 1,5 s** (perfil de CPU de uma carga aquecida, CPU 4x): geometria procedural com ruído por vértice (~0,65 s no hero), ambiente PMREM (~0,4 s no hero, renderiza 6 faces de cubo e compila shaders próprios) e trabalho nativo de WebGL/primeiro render (~0,5 s). Caminhos possíveis, todos estruturais: geometria gerada em worker; um único contexto WebGL compartilhado pelos dois palcos (contraria o ticket 03: um contexto por palco); ambiente mais barato (risco ao brilho aprovado em 05).

**Ruído da máquina:** notebook corporativo com outros processos; a mesma medida varia de 1,6 a 3,9 s entre cargas, e os fps oscilam entre execuções (desktop abrindo a 60 fps numa rodada, 38 na outra). Por isso o primeiro quadro usa a mediana de 7 cargas. A suíte funcional completa também falha de forma intermitente com o paralelismo padrão, inclusive no código anterior a este ticket (5–7 falhas por execução); com `--workers=2` passa inteira (74 testes, em dev e no build).

**Testes ajustados:** "o hambúrguer não inclina" agora espera o primeiro quadro antes de ler a posição (a cena desenha após compilar shaders e texturas); "a Base não pode ser arrastada" aceita deslocamento menor que 2 px, porque o ponteiro passando pelo palco inclina o hambúrguer (falhava desde o ticket 10).

**Exige aparelho físico:** primeiro quadro e fps reais (a GPU de um celular, e a compilação de shaders em GLES nativo, diferem do ANGLE/D3D11 usado aqui; o throttling só desacelera a CPU), arrasto por toque e inclinação pela orientação do aparelho (Android).
