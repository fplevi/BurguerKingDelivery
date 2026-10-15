# 01: Rodeio selecionável

**What to build:** o card "Rodeio" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 29,90), descrição ("Pão com gergelim, carne grelhada, queijo derretido, molho barbecue, onion ring crocante e maionese.") e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita, de baixo para cima: Pão inferior, Carne grelhada, Queijo, Molho barbecue, Onion ring, Maionese, Pão superior; Base = pães e a carne. Queijo, Molho barbecue e Maionese reaproveitam os modelos existentes sem mudança. O Onion ring é uma variante de um anel do modelo de onion rings do Rodeio Duplo: centralizado, raio menor (cerca de metade da largura da carne), mesma textura de empanado, sem receita de textura nova; o Rodeio Duplo continua com dois anéis, sem mudança. Proporções (espessura da carne, altura do pão superior, quanto queijo, barbecue, onion ring e maionese aparecem) já tiradas de `site_Rodeio.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: SVG simples de um anel para o Onion ring; o resto reaproveita as ilustrações existentes. Spec: `.scratch/rodeio/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/rodeio`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; os outros 3 cards seguem "Em breve" e não trocam o hero
- [ ] Ver ingredientes lista as 7 Camadas na ordem da Receita
- [ ] Queijo, Molho barbecue, Onion ring e Maionese são retiráveis um por vez e juntos; pães e carne não
- [ ] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [ ] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [ ] Voltar aos outros quatro hambúrgueres não deixa resto do Rodeio; o Rodeio Duplo segue com dois anéis
- [ ] Fallback SVG com WebGL desativado mostra as 7 Camadas e permite personalizar
- [ ] `tests/rodeio.spec.js` no molde de `tests/rodeio-duplo.spec.js`, verde; `tests/layout.spec.js` deixa de esperar "Em breve" só no Rodeio; demais testes sem mudança de comportamento
- [ ] Captura montada no desktop ao lado da foto oficial confere as proporções
