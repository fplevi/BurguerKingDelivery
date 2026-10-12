# 07: Formas de pagamento

**What to build:** a seção Formas de pagamento (telas 15–17): Cartões salvos com o Cartão padrão, adicionar com as validações do Novo cartão (sem cobrança), remover com confirmação e estado vazio com a nota do Pix.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 04

**Status:** resolved

- [x] Lista com Cartão padrão no primeiro
- [x] Adicionar cartão sem cobrança
- [x] Remover com confirmação; o seguinte vira padrão
- [x] Estado vazio
- [x] Cartões refletidos no Pagamento do Checkout
- [x] Testes Playwright

## Answer

**Lista** (`#conta/pagamentos`, `payments` em `prototype/src/account.js`): um card por Cartão salvo ("Visa · final 4242", nome e validade, "Cartão padrão" no primeiro) com "Remover cartão" (`.danger`), "Adicionar cartão" e a nota do Pix. Sem cartões, "Nenhum cartão salvo".

**Adicionar cartão** (`#conta/cartao`, `state.wallet`, ações `wallet*`): número e validade com máscara, nome e código de segurança, validados por `cardErrors` (os mesmos do Novo cartão). Guarda só bandeira, final, nome e validade; o código não fica salvo. Um cartão igual (bandeira, final e validade) recebe "Esse cartão já está salvo.". Salvo, volta à entrada da lista (`history.back()` quando veio dela). Sem cobrança.

**Remover cartão** (`#conta/remover-cartao`, `cardTarget`): "Remover Visa final 4242?", "Remover cartão" ou "Manter cartão". O primeiro que sobra vira o Cartão padrão; se era o escolhido no Pagamento, a escolha volta ao padrão. Os ids de cartão novos (`nextCard`) nunca repetem um em uso, também no "Salvar cartão" do Checkout.

**Testes:** `tests/formas-de-pagamento.spec.js` (5 cenários × 2 projetos); capturas `capturas/07-*.png`. Suíte completa: 472 passando.
