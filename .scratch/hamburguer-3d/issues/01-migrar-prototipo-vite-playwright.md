# 01: Migrar o protótipo para npm + Vite, com Playwright cobrindo os fluxos atuais

**What to build:** a mesma página, com o mesmo SVG e nenhuma mudança visível para o cliente, agora construída com npm e Vite (módulos separados, tree-shaking) e com os fluxos atuais cobertos por testes Playwright que usam a página como o cliente: papéis e rótulos acessíveis. É o prefactor que prepara a cena 3D. Spec: `.scratch/hamburguer-3d/spec.md`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] O protótipo roda pelo servidor de desenvolvimento do Vite e gera build de produção
- [ ] Aparência e comportamento idênticos ao HTML atual (hero, grade, Alterar ingredientes, bandeja, chips, combo, carrinho)
- [ ] Testes Playwright: abrir Alterar ingredientes; retirar por botão, teclado e arrasto até a bandeja; recolocar pelos chips; Recolocar todos; Base não retirável; aplicar atualiza o texto do hero; cancelar preserva a personalização anterior; item personalizado chega ao carrinho
- [ ] Testes executam em desktop e em 390 × 844
- [ ] README do protótipo atualizado (instalação, prévia, build, testes); servidor antigo removido se não for mais usado
