# 03: Identifique-se pelo header e páginas privadas

**What to build:** a Identificação aberta pelo header (telas 01–06), reutilizando a etapa do Checkout: celular, WhatsApp ou SMS, reenviar, troca de canal, código incorreto e cadastro do Novo cliente. "Fechar" e a confirmação voltam à página de origem. Páginas privadas (`#conta…` e o acompanhamento) sem Identificação passam por ela e seguem para a página pedida. A identificação é compartilhada com o Checkout.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 01

**Status:** resolved

- [x] Telas 01–06 pelo header
- [x] Volta à origem ao fechar e ao confirmar
- [x] Novo cliente informa nome e e-mail
- [x] Páginas privadas protegidas
- [x] Identificação compartilhada com o Checkout nos dois sentidos
- [x] Testes Playwright

## Answer

**Página** `#identificar` (`#signin-page` em `prototype/index.html`): "Identifique-se" com "Fechar", o texto do Figma e a Identificação num card (`identificationStep`, a mesma do Checkout). Os handlers de celular, código, reenvio, canal, Alterar celular e cadastro saíram do Checkout para `bindIdentification(root, done)` em `main.js`, ligado ao Checkout (`done`: `#endereco`) e a Identifique-se (`done`: voltar).

**Voltar:** a entrada de `#identificar` guarda `history.state.signin`: `'back'` quando aberta pelo header (identificado ou Fechar, `history.back()` à página de origem), a página privada pedida (identificado, abre ela; Fechar, a categoria) ou `null` (URL digitada: a categoria). O botão do header leva o visitante a `#identificar` e o identificado a `#conta`.

**Páginas privadas:** `#conta` e `#conta/*` sem cliente vão a `#identificar` e, confirmado o celular, abrem. Identificado, `#identificar` leva a `#conta`.

**Testes:** `tests/identifique-se.spec.js` (6 cenários × 2 projetos). Captura em `capturas/03-identifique-se-*.png`. Suíte completa: 427 passando e 1 falha de foco em `pedido.spec.js`, que passou ao rodar sozinho.
