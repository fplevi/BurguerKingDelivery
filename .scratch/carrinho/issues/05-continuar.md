# 05: Validação do "Continuar"

**What to build:** "Continuar" no Resumo do carrinho verifica combos sem bebida: o primeiro ganha borda vermelha e "Escolha a bebida do combo" (Figma 08, `187-7676`), a tela rola até ele e o seletor recebe o foco; o erro some ao escolher a bebida ou desmarcar o combo. Sem pendências: toast avisando que o pagamento não faz parte do protótipo. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Erro, rolagem e foco no primeiro combo sem bebida
- [ ] Erro some ao corrigir
- [ ] Toast quando tudo está certo
- [ ] Testes Playwright
