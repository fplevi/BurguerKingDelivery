# 01: Migrar o protótipo para npm + Vite, com Playwright cobrindo os fluxos atuais

**What to build:** a mesma página, com o mesmo SVG e nenhuma mudança visível para o cliente, agora construída com npm e Vite (módulos separados, tree-shaking) e com os fluxos atuais cobertos por testes Playwright que usam a página como o cliente: papéis e rótulos acessíveis. É o prefactor que prepara a cena 3D. Spec: `.scratch/hamburguer-3d/spec.md`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] O protótipo roda pelo servidor de desenvolvimento do Vite e gera build de produção
- [x] Aparência e comportamento idênticos ao HTML atual (hero, grade, Alterar ingredientes, bandeja, chips, combo, carrinho)
- [x] Testes Playwright: abrir Alterar ingredientes; retirar por botão, teclado e arrasto até a bandeja; recolocar pelos chips; Recolocar todos; Base não retirável; aplicar atualiza o texto do hero; cancelar preserva a personalização anterior; item personalizado chega ao carrinho
- [x] Testes executam em desktop e em 390 × 844
- [x] README do protótipo atualizado (instalação, prévia, build, testes); servidor antigo removido se não for mais usado

## Answer

- `prototype/` agora é um projeto npm + Vite 8: `index.html` + módulos em `src/` (`ingredients.js`, `art.js`, `state.js`, `main.js`, `styles.css`). Código movido sem mudança de comportamento; as fotos da grade são importadas (com hash no build). `server.cjs` removido.
- Paridade visual conferida com capturas do HTML antigo e da versão Vite (desktop e 390 × 844: hero, Alterar ingredientes aberto, com retiradas, após aplicar, carrinho): pixels idênticos.
- Playwright em `prototype/tests/`: 15 testes × 2 projetos (`desktop` 1280 × 800 e `mobile-390` 390 × 844 com toque) = 30 verdes. Cobrem os fluxos do ticket e também Esc/✕, soltar fora da bandeja, combo/tamanho, remover item do carrinho e carregamento das fotos da grade. Elementos localizados por papéis e rótulos (`tests/support.js`). Mutações (quebrar aplicar e o drop na bandeja) derrubam os testes esperados.
- `npm test` roda contra o servidor de desenvolvimento; `npm run test:build`, contra o build de produção. Ambos verdes.
- Os testes usam o Google Chrome instalado (`PW_CHANNEL`, padrão `chrome`), porque o Smart App Control do Windows bloqueia o Chromium baixado pelo Playwright nesta máquina.
- README do protótipo atualizado (instalação, prévia, build, testes, estrutura).
