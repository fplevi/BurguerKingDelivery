# 10: Pedido entregue e cancelado

**What to build:** a página de um Pedido encerrado (tela 20, sem o mapa e sem o entregador): entregue, com a linha do tempo concluída, e cancelado, com a linha até "Cancelado" e a nota da devolução sem prazo. Aberta por "Ver detalhes" e pelo fim do acompanhamento.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 09

**Status:** resolved

- [x] Entregue
- [x] Cancelado
- [x] Sem mapa e sem entregador
- [x] Testes Playwright

## Answer

**Tela** (`trackingView` em `prototype/src/tracking.js`, aberta por "Ver detalhes" ou pelo fim do acompanhamento): sem mapa, sem entregador e sem rastreamento. Topo com "Pedido entregue" e "Entregue em 8 de outubro, às 13h02" (ou "hoje"/"ontem"), ou "Pedido cancelado", "Cancelado em …" e "O valor será devolvido na mesma forma de pagamento." (sem prazo); a loja com o WhatsApp; a linha do tempo só com o que aconteceu (entregue: todas concluídas, a última "Entregue"; cancelado: até "Cancelado"); o Resumo do pedido e a forma de pagamento.

**Fim do acompanhamento:** o redesenho de cada segundo agora roda mais uma vez no instante em que o Pedido termina, para a tela passar a "Pedido entregue" sozinha.

**Testes:** `tests/pedido-encerrado.spec.js` (3 cenários × 2 projetos); capturas `capturas/10-*.png`. Suíte completa: 498 passando.
