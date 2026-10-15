# 03: Orçamento medido com seis hambúrgueres

**What to build:** medir de novo o orçamento com Whopper, Cheddar Duplo, Stacker Duplo Bacon, Rodeio Duplo, Big King e Rodeio no build: peso gzip da parte 3D, primeiro quadro e quadros por segundo, com `npm run test:orcamento` (um teste por vez). Limites aceitos no ticket 11 do Whopper (`tests/orcamento.spec.js`). O Big King entra na lista de produtos medidos; nenhum teste novo. Otimizar só o que passar dos limites; o que exige aparelho físico fica registrado. Fecha a funcionalidade: `npm run test:build` inteiro verde localmente (CI desligado) e PR de `feat/big-king` para a `main`, aberto só depois que o PR do Rodeio entrar.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Medições registradas em `## Comments` (gzip 3D, primeiro quadro, fps), com o Big King na primeira escolha e nas seguintes
- [ ] Tudo dentro dos limites aceitos, ou otimizado até ficar
- [ ] `npm run test:build` inteiro verde; se falhar "ao acaso", comparar com a `main` antes de chamar de instabilidade
- [ ] PR aberto para a `main` com as capturas da revisão, depois do merge do Rodeio
