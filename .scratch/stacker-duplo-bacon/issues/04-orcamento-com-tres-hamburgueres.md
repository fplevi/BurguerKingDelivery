# 04: Orçamento medido com três hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo e Stacker Duplo Bacon no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). Otimizar só o que passar deles; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/stacker-duplo-bacon` para a `main`.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps)
- [ ] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [ ] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão
