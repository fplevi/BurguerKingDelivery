# 04: Acompanhamentos, Bebidas e Sobremesas

**What to build:** as três categorias usam um modelo de página só de foto (Figma `40-509`, `49-1104`, `127-2594`, card `84-1283`): título, foto, descrição, card com Quantidade, Total do item e Adicionar ao carrinho, grade "Escolha seu acompanhamento / sua bebida / sua sobremesa" com "Selecionado". A navegação troca o conteúdo na mesma página por hash; cada categoria lembra o produto selecionado e a Personalização do hambúrguer continua ao voltar. Produtos iniciais: Batata Frita, Coca-Cola, BK Mix de Brownie. Fotos em `Assets/{sides,drinks,desserts}/official` (BK Mix Crocante = `site_BK_Mix_Ovomaltine.png`); nomes e ordem do Figma. Preços ilustrativos: os do Figma e, para os demais, pesquisados na internet; nunca "Consultar preço". Funciona nos três layouts do ticket 03. Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** 03.

**Status:** claimed

- [ ] Modelo de página por foto, nos três layouts
- [ ] Navegação por hash e memória da seleção por categoria
- [ ] Todos os produtos com foto, nome, descrição e preço
- [ ] Adicionar ao carrinho com quantidade; Item idêntico soma
- [ ] Fotos das sobremesas commitadas
- [ ] Testes Playwright
