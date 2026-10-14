# 15: Entrada e Saída do hambúrguer no hero

**What to build:** o hambúrguer do hero aparece com uma **Entrada** (as Camadas presentes caem e se empilham de baixo para cima, cada uma com um pequeno quique) e, na troca de hambúrguer, o atual faz a **Saída** (desce e some) antes da Entrada do próximo. Termos no `GLOSSARY.md`.

**Blocked by:** —

**Status:** resolved

## Decisões (sessão de grilling, 2026-10-13)

- **Quando há Entrada:** no primeiro carregamento (começa no primeiro quadro desenhado, sem atrasar esse quadro), ao trocar de hambúrguer e ao voltar à categoria Hambúrgueres vinda de outra categoria.
- **Quando há Saída:** só na troca entre hambúrgueres. Ao ir para Acompanhamentos, Bebidas ou Sobremesas, a foto entra na hora, sem Saída.
- **Só no palco do hero.** Ver ingredientes fica como está.
- **Entrada:** caem só as Camadas presentes (ingrediente retirado não aparece). Ritmo **quique** (veredito do protótipo): cada Camada cai em 420 ms, com 55 ms de intervalo entre uma e a próxima; cai nos primeiros 70% com aceleração e dá um rebote pequeno (~3,5% da altura da queda) nos 30% finais. Fica em ~900 ms com 10 Camadas.
- **Sombra:** nada de sombra antes do pão (achado no protótipo). A sombra de contato surge com o pão inferior; a projetada no chão, com a última Camada, porque as Camadas ainda no ar a jogariam para o lado (refinado na implementação, aprovado em 2026-10-13).
- **Saída:** o hambúrguer inteiro desce um pouco, encolhe levemente e some em 250 ms.
- **Troca:** a Saída termina antes de a Entrada começar, no mesmo palco e com um contexto WebGL só. Vale o último clique: a animação em curso é abandonada, sem fila, e só o último hambúrguer escolhido faz a Entrada.
- **Interação:** qualquer ação do cliente (ponteiro ou tecla) encerra a Entrada na hora, com o hambúrguer montado. A inclinação só começa depois da Entrada.
- **Movimento reduzido e fallback SVG:** sem Entrada nem Saída; a troca é instantânea, como antes.
- **Orçamento:** os limites do `tests/orcamento.spec.js` não mudam. A medição da troca de produto passa a contar a partir do fim da Saída, não do clique, e segue medindo só a montagem da cena nova (decidido na revisão).
- **Durante a Saída:** o hero do hambúrguer que sai fica inerte (Ver ingredientes, Adicionar), para nada agir sobre ele (achado na revisão).
- Fora do escopo: animação ao adicionar ao carrinho (ideia separada).

## Protótipo

Branch `prototype/entrada-saida` (commit `f1fe8e6`, local): três ritmos (`?variante=rapida|suave|quique`) e a Saída, no próprio hero. Pergunta: qual ritmo da Entrada agrada? **Veredito: quique**, com a sombra surgindo junto com o pão.

## Critérios

- [x] Entrada com quique no primeiro carregamento, na troca de hambúrguer e na volta à categoria Hambúrgueres
- [x] Saída de 250 ms na troca, antes da Entrada do próximo; último clique vence
- [x] Sombra de contato surge com o pão inferior; a projetada, com a última Camada
- [x] Ação do cliente encerra a Entrada; inclinação só depois dela
- [x] Sem animação com movimento reduzido e no fallback SVG
- [x] Testes pela página, como o cliente usa; `npm run test:build` verde e `npm run test:orcamento` medido

## Answer

- **Cena** (`burger-scene.js`): `enter()`, `settle()` e `exit()` sobre um efeito por vez, aplicado por cima do layout de `show()` a cada quadro desenhado. A Entrada começa no primeiro quadro desenhado: num palco escondido, ela espera sem gastar quadros. O ritmo é o quique (`ENTRANCE`: 420 ms por Camada, 55 ms de intervalo, rebote de 3,5% da queda). A Saída (`EXIT`) leva 250 ms: o hambúrguer desce 0,6, encolhe 15% e some. Com o palco escondido, a Saída termina na hora. As sombras seguem o refinamento das Decisões. Marcas `burger-scene:entrance-end` e `exit-end` indicam o fim de cada efeito para os testes e o orçamento.
- **Página** (`main.js`): a Entrada parte de `render()`, numa cena nova ou quando o hero volta a aparecer. Na troca, `selectProduct` espera a Saída e vale o último clique. Enquanto isso, o hero fica inerte e o foco vai para Ver ingredientes depois da troca. Um `pointerdown` ou `keydown` encerra uma Entrada já começada.
- **Achado da suíte completa**: durante a Entrada, os botões invisíveis das Camadas que ainda caem ficam acima do palco, por cima do cabeçalho, e engoliam o clique no Carrinho. O teste falhava ao acaso, em 4 a 8 testes do carrinho e do checkout por rodada, enquanto a `main` passava inteira. Corrigido com `overflow: clip` no palco do hero em 3D (`styles.css`).
- **Testes**: `tests/entrada-e-saida.spec.js` tem 12 casos que observam os botões das Camadas a cada quadro. `inclinacao.spec.js` espera o fim da Entrada (`fimDaEntrada` em `support.js`). No `orcamento.spec.js`, a troca é medida a partir do fim da Saída. `npm run test:build`: 527 testes verdes e 39 pulados (a `main` tinha 506 verdes).
- **Orçamento** (`npm run test:orcamento`, todos verdes):
  - 151,6 KB gzip;
  - primeiro quadro em 390 com CPU 4x: mediana de 1173 ms;
  - troca, do fim da Saída ao primeiro quadro: 218 ms para o Cheddar Duplo e 223 ms para o Whopper;
  - 66–75 fps nas interações.
- **Capturas** em `capturas/15/`:
  - `entrada-quadros.png`: quadros da Entrada de 0 a 1000 ms, com a sombra surgindo com o pão;
  - `saida.png`;
  - `prototipo-variantes.png`: as três variações do protótipo.
