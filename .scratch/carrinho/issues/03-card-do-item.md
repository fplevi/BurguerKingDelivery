# 03: Card do Item editável no Carrinho

**What to build:** cada Item do Carrinho segue o Figma (01–05, `187-5486` a `187-6968`). Hambúrguer: foto, nome, "Remover" (ação no ticket 04), "Ingredientes:" com o texto da descrição do hero (mesma regra do cheddar), linha vermelha "Sem …" com cada Camada retirada em ordem da Receita de baixo para cima (ou "Todos os ingredientes"), "Transformar em combo", Bebida do combo (lista própria, padrão listbox, abre em sobreposição; desabilitada sem combo mantendo o espaço; desmarcar apaga a bebida), Quantidade (1–99, "−" desabilitado em 1) e Total do item (com combo assim que marcado, mesmo sem bebida). Produto só foto: foto, nome, "Remover", Quantidade e Total do item. Editar nunca funde Itens. Total dos itens acompanha. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Ingredientes e linha "Sem …" (Whopper; um cheddar; dois cheddars)
- [ ] Combo e Bebida do combo com as regras do card
- [ ] Lista de bebidas em sobreposição, acessível por teclado
- [ ] Quantidade com "−" desabilitado em 1
- [ ] Total do item e Total dos itens atualizados
- [ ] Itens editados até ficarem iguais continuam separados
- [ ] Testes Playwright
