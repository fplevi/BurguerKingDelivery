# 01: Card do hambúrguer como no Figma (tracer bullet)

**What to build:** o card de compra do hambúrguer segue o Figma (`80-1630`, `80-1169`). Saem os tamanhos P/M/G; o Combo soma R$ 12,00 fixos. Entra o seletor Bebida do combo (7 bebidas, placeholder "Selecione uma bebida", desabilitado sem Combo, nunca preenchido por padrão) e a Quantidade (− 1 +), que multiplica o Total do item. Combo marcado sem bebida: o botão continua ativo e, ao clicar, o seletor ganha borda vermelha com "Escolha a bebida do combo" e recebe o foco. Estado padrão (ao carregar, ao trocar de hambúrguer e depois de adicionar): Combo desmarcado, bebida vazia, Quantidade 1, sem Personalização. Item idêntico soma no carrinho. O botão "Remover ingredientes" passa a se chamar "Ver ingredientes" (título e rótulos da tela também). Carrinho mostra nome × quantidade, "Combo · <bebida>", "Sem: …" e total. Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** nenhum.

**Status:** ready-for-agent

- [ ] P/M/G removidos; Combo + R$ 12,00 (Whopper 31,90 / 43,90)
- [ ] Bebida do combo: 7 opções, desabilitada sem Combo, vazia por padrão
- [ ] Erro "Escolha a bebida do combo" com foco ao adicionar combo sem bebida
- [ ] Quantidade multiplica o total; todas as unidades com a mesma Personalização
- [ ] Volta ao padrão depois de adicionar, mantendo o hambúrguer selecionado
- [ ] Item idêntico soma quantidade no carrinho
- [ ] "Ver ingredientes" em botão, tela e testes
- [ ] Testes Playwright; `npm test` e `npm run test:build` verdes
