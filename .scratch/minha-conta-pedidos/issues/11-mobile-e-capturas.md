# 11: Layout mobile e capturas

**What to build:** a revisão de todas as telas desta funcionalidade abaixo de 1024px e no mobile (390px), conforme o Figma, e as capturas de desktop e mobile em `.scratch/minha-conta-pedidos/capturas/` para a revisão.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 02, 05, 06, 07, 10

**Status:** resolved

- [x] Sem rolagem horizontal
- [x] Conteúdo e ações não encobertos
- [x] Capturas de cada tela

## Answer

**Revisão:** Identifique-se e todas as páginas da conta (Minha conta, Dados pessoais, Alterar celular, Endereços, Formas de pagamento, Adicionar cartão, Meus pedidos, acompanhamento em andamento, entregue e cancelado, Sair) a 390 e 768 px: nenhuma com rolagem horizontal, ações à vista e navegação em lista expansível.

**Ajuste:** abaixo de 1024px, como no Figma, o header de Minha conta e de Identifique-se não tem as abas de categorias (`body[data-screen]`); o cardápio continua com elas.

**Capturas:** `capturas/` tem as dos tickets 03-10 (desktop e 390) e as `11-390-*` e `11-768-*` de cada página.

**Testes:** `tests/layout-conta.spec.js` (todas as páginas sem rolagem horizontal e sem abas; acompanhamento em uma coluna, a 390 e 768). Suíte completa: 506 passando.
