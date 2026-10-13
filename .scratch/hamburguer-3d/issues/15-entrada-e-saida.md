# 15: Entrada e Saída do hambúrguer no hero

**What to build:** o hambúrguer do hero aparece com uma **Entrada** (as Camadas presentes caem e se empilham de baixo para cima, cada uma com um pequeno quique) e, na troca de hambúrguer, o atual faz a **Saída** (desce e some) antes da Entrada do próximo. Termos no `GLOSSARY.md`.

**Blocked by:** —

**Status:** ready-for-agent

## Decisões (sessão de grilling, 2026-10-13)

- **Quando há Entrada:** no primeiro carregamento (começa no primeiro quadro desenhado, sem atrasar esse quadro), ao trocar de hambúrguer e ao voltar à categoria Hambúrgueres vinda de outra categoria.
- **Quando há Saída:** só na troca entre hambúrgueres. Ao ir para Acompanhamentos, Bebidas ou Sobremesas, a foto entra na hora, sem Saída.
- **Só no palco do hero.** Ver ingredientes fica como está.
- **Entrada:** caem só as Camadas presentes (ingrediente retirado não aparece). Ritmo **quique** (veredito do protótipo): cada Camada cai em 420 ms, com 55 ms de intervalo entre uma e a próxima; cai nos primeiros 70% com aceleração e dá um rebote pequeno (~3,5% da altura da queda) nos 30% finais. Fica em ~900 ms com 10 Camadas.
- **Sombra:** a sombra de contato e a do chão surgem junto com o pão inferior, não antes (achado no protótipo).
- **Saída:** o hambúrguer inteiro desce um pouco, encolhe levemente e some em 250 ms.
- **Troca:** a Saída termina antes de a Entrada começar, no mesmo palco e com um contexto WebGL só. Vale o último clique: a animação em curso é abandonada, sem fila, e só o último hambúrguer escolhido faz a Entrada.
- **Interação:** qualquer ação do cliente (ponteiro ou tecla) encerra a Entrada na hora, com o hambúrguer montado. A inclinação só começa depois da Entrada.
- **Movimento reduzido e fallback SVG:** sem Entrada nem Saída; a troca é instantânea, como antes.
- **Orçamento:** os limites do `tests/orcamento.spec.js` não mudam.
- Fora do escopo: animação ao adicionar ao carrinho (ideia separada).

## Protótipo

Branch `prototype/entrada-saida` (commit `f1fe8e6`, local): três ritmos (`?variante=rapida|suave|quique`) e a Saída, no próprio hero. Pergunta: qual ritmo da Entrada agrada? **Veredito: quique**, com a sombra surgindo junto com o pão.

## Critérios

- [ ] Entrada com quique no primeiro carregamento, na troca de hambúrguer e na volta à categoria Hambúrgueres
- [ ] Saída de 250 ms na troca, antes da Entrada do próximo; último clique vence
- [ ] Sombra surge com o pão inferior
- [ ] Ação do cliente encerra a Entrada; inclinação só depois dela
- [ ] Sem animação com movimento reduzido e no fallback SVG
- [ ] Testes pela página, como o cliente usa; `npm run test:build` verde e `npm run test:orcamento` medido
