# 01: Cheeseburger Duplo selecionável

**What to build:** o card "Cheeseburger Duplo" da grade deixa de ser "Em breve neste protótipo" e passa a ser selecionável. Escolhê-lo troca nome, preço provisório (R$ 24,90), descrição e o hambúrguer 3D do hero, com Entrada e Saída como os outros. Receita `cheeseburgerDuplo`, de baixo para cima, **ainda sem a Mostarda** (entra no 02): Pão inferior, Carne grelhada, Queijo inferior, Carne grelhada (`turn: 1.9`), Queijo superior (`turn: 1.9`), Picles, Ketchup, Pão superior; Base = pães e as duas carnes. Descrição provisória deste ticket: "Pão com gergelim, duas carnes grelhadas, queijo derretido, picles e ketchup." Queijo (o `cheese` amarelo do Whopper, não o `cheddarSlice`), Picles e Ketchup reaproveitam os modelos existentes sem mudança. Proporções (espessura das carnes, altura do pão superior, quanto queijo, picles e ketchup aparecem) já tiradas de `site_Cheeseburger_Duplo.png`. Combo, Carrinho e Personalização como nos outros. Sem WebGL: as ilustrações existentes. Spec: `.scratch/cheeseburger-duplo/spec.md`; leia antes `docs/agents/novo-hamburguer.md`. Branch `feat/cheeseburger-duplo`.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Selecionar o card troca nome, preço, descrição e o hambúrguer 3D do hero; o card Cheeseburger segue "Em breve" e não troca o hero
- [x] Ver ingredientes lista as 8 Camadas na ordem da Receita
- [x] Queijo inferior, Queijo superior, Picles e Ketchup são retiráveis um por vez e juntos; pães e carnes não
- [x] Recolocar todos, aplicar (atualiza a descrição) e cancelar (preserva) funcionam
- [x] O Item vai ao Carrinho com Combo e "Sem …" dos ingredientes retirados
- [x] Voltar aos outros seis hambúrgueres não deixa resto do Cheeseburger Duplo
- [x] Fallback SVG com WebGL desativado mostra as Camadas e permite personalizar
- [x] `tests/cheeseburger-duplo.spec.js` no molde de `tests/rodeio.spec.js`, verde; `tests/layout.spec.js` deixa de esperar "Em breve" só no Cheeseburger Duplo; demais testes sem mudança de comportamento
- [ ] Captura montada no desktop ao lado da foto oficial confere as proporções (parcial: carnes e pão superior conferem; picles, ketchup e pão inferior ficam para a revisão, ver Answer)

## Answer

- `src/ingredients.js`: Receita `cheeseburgerDuplo` (R$ 24,90 provisório): `bottom`, `meat`, `cheese1` (Queijo inferior, modelo `cheese`), `meat2` (`turn: 1.9`), `cheese2` (Queijo superior, `cheese`, `turn: 1.9`), `pickles`, `ketchup`, `top`; Base: pães e as duas carnes. Descrição: "Pão com gergelim, duas carnes grelhadas, queijo derretido, picles e ketchup." (o queijo sai uma vez só; some só se os dois forem retirados). O `y`/`thickness` do SVG seguem a foto (carnes finas, pilha baixa).
- `burger-scene.js`: opção genérica `squash` na Camada, ao lado de `turn` e `spread`: achata o modelo e o empilha mais baixo. Com os modelos sem mudança, as carnes e o pão superior saíam bem mais grossos que na foto; aqui as carnes usam `squash: 0.78` e o pão superior `0.82`. Os outros hambúrgueres não usam a opção e não mudam. Registrado em `docs/agents/novo-hamburguer.md`.
- `main.js`: o card aponta para a Receita. `art.js` sem mudança (queijo, picles e ketchup já existiam).
- Testes: `tests/cheeseburger-duplo.spec.js` no molde do Rodeio, incluindo a volta aos outros seis e o card Cheeseburger, que segue sem Receita; `tests/layout.spec.js` com 1 hambúrguer sem Receita; `prototype/README.md` atualizado.
- O `squash` é uma mudança na cena que a spec ("Receita nova, sem prefactor") não previa; precisa do aval do responsável pelo produto na revisão (03). Sem ele, as carnes ficam com a espessura do modelo compartilhado.
- O texto "Em breve neste protótipo" do ticket e da spec está desatualizado: a grade já não mostra "Em breve" (os cards sem Receita só não respondem ao clique), e os testes seguem esse comportamento.
- Capturas em `capturas/01/` (desktop e 390 × 844, hero, montado e aberto), `desktop-sem-webgl.png` e `revisao-lado-a-lado.png` com a foto oficial.
- Em aberto, para a revisão (03):
  - no SVG sem WebGL, o meio do ketchup do Whopper não é pintado, então tocar no centro dele em Ver ingredientes não o retira (só nas gotas ou pelo chip). É o comportamento do Whopper, que a spec manda não mudar;
  - os picles aparecem menos que na foto, onde são duas rodelas grandes saindo da borda; o modelo do Whopper ficou sem mudança, como pede a spec;
  - o pão inferior ainda parece um pouco mais alto que o da foto.

