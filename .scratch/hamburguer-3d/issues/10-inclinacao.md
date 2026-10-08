# 10: Inclinação do hambúrguer

**What to build:** o hambúrguer inclina até ±10°, sem rotação livre, para revelar o volume. Desktop: segue o ponteiro. Android: segue a orientação do aparelho. iOS: segue o arrasto na área vazia do palco, sem pedido de permissão de movimento. Em Alterar ingredientes, arrastar um ingrediente continua significando retirá-lo. Desativada com movimento reduzido.

**Blocked by:** 09.

**Status:** ready-for-agent

- [ ] Inclinação limitada a ±10°, com retorno suave ao centro
- [ ] Ponteiro no desktop; orientação do aparelho no Android; arrasto na área vazia no iOS
- [ ] Nenhum pedido de permissão de movimento
- [ ] Sem conflito com o arrasto de ingredientes
- [ ] Movimento reduzido: sem inclinação (teste Playwright)
- [ ] Botões DOM continuam alinhados às camadas durante a inclinação
