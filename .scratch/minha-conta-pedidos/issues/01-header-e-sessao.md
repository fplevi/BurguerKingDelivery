# 01: Header novo e sessão guardada

**What to build:** o header novo e a sessão no `sessionStorage`, como na spec (Header, Sessão):
- Carrinho só com o ícone e o contador; "Entregar em" fora do header.
- Botão "Identifique-se" à direita do Carrinho; identificado, mostra o primeiro nome (com reticências) e leva a `#conta` (por enquanto, uma página só com o título "Minha conta").
- Cliente identificado, Carrinho, Endereço de entrega e Pedidos da sessão guardados no `sessionStorage` e restaurados ao recarregar.

Figma: `24-183` e os headers das telas 01 e 07 (desktop e mobile).

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** —

**Status:** ready-for-agent

- [ ] Carrinho sem texto, com nome acessível "Carrinho · N"
- [ ] "Entregar em" removido do header
- [ ] Identifique-se × primeiro nome, desktop e mobile
- [ ] Sessão restaurada ao recarregar
- [ ] Testes Playwright
