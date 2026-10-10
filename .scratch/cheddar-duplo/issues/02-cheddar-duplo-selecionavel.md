# 02: Cheddar Duplo selecionável (tracer bullet)

**What to build:** a grade passa a usar as fotos oficiais de `prototype/Assets/burgers/official/`, com Whopper e Cheddar Duplo selecionáveis e os outros 6 cards como "Em breve neste protótipo" (os cards antigos saem da grade; `Assets/catalog/` fica no repositório). Escolher o Cheddar Duplo troca nome, preço (R$ 34,90), descrição e o hambúrguer 3D do hero, e "Remover ingredientes" abre a versão dele. Receita: pão inferior, carne, Cheddar inferior, carne, Cheddar superior, Cebola crispy, pão superior; Base = pães e as duas carnes. Usa os modelos existentes (carne, queijo, pães); a cebola crispy ainda é uma forma simples. Trocar de produto reinicia a personalização. Combo, P/M/G e carrinho funcionam como no Whopper. Fallback SVG com o fluxo funcionando (SVG simples da cebola crispy). Spec: `.scratch/cheddar-duplo/spec.md`.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Fotos oficiais commitadas e origem registrada (`SOURCES.md`)
- [ ] Grade com as 8 fotos oficiais; só Whopper e Cheddar Duplo trocam o hero; "Em breve" nos demais
- [ ] Hero troca nome, preço, descrição e 3D; Whopper volta idêntico e sem resto do outro produto
- [ ] Alterar ingredientes lista as 7 camadas na ordem; retirar cada cheddar e a cebola crispy, um por vez
- [ ] Carnes e pães não são retiráveis; Recolocar todos, aplicar, cancelar e carrinho com os ingredientes retirados
- [ ] Fallback SVG com WebGL desativado
- [ ] Testes Playwright dos comportamentos acima; `npm test` e `npm run test:build` verdes
