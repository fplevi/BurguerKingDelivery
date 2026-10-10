# 01: Receita por produto

**What to build:** a lista de camadas deixa de estar fixa no Whopper e passa a ser a Receita de cada produto: ordem das camadas de baixo para cima, nomes, quais formam a Base, título, descrição e preço. Estado, cena, botões DOM, chips, bandeja, fallback SVG (`closedPositions`, `art.js`) e textos ("Personalize seu Whopper") leem a Receita do produto selecionado. Nenhuma mudança visível: o Whopper continua o único produto e idêntico ao de hoje. É o prefactor que abre espaço para o segundo hambúrguer. Spec: `.scratch/cheddar-duplo/spec.md`; leia antes `docs/agents/novo-hamburguer.md`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] `GLOSSARY.md`: termo **Receita** e **Base** como "pães e carnes" (antes do código)
- [ ] Uma Receita por produto; o Whopper é a única, com as 10 camadas atuais
- [ ] Camada repetida na mesma Receita é permitida (id único por camada, modelo compartilhado)
- [ ] Nada fora da Receita cita o Whopper (textos, espessuras do fallback SVG, estado)
- [ ] `npm test` e `npm run test:build` verdes, sem alterar o comportamento testado do Whopper
- [ ] Capturas do hero e de Alterar ingredientes idênticas às de antes (diferença ≤ 1/255 por pixel)
