# 09: Layouts do Checkout no celular

**What to build:** os layouts abaixo de 1024px pelo Figma mobile (`239-8996`):
- Uma coluna com rolagem vertical e o Resumo do pedido abaixo do conteúdo.
- Nas telas de seleção e preenchimento do pagamento, Total do pedido e a ação de pagamento ficam fixos no rodapé ("Checkout / ação fixa"); no fluxo de endereço, a ação principal fica fixa ("Entrega / ação fixa"). Nos dois casos, o fim do conteúdo não fica escondido atrás do rodapé.
- No cartão de endereço, complemento e referência ficam em linhas separadas, com o divisor antes da previsão.
- Preços em `#502314`, fontes do BK, botões secundários com contorno e indicador de etapas na variante Mobile.

Capturas de revisão em 390 e 1280 em `.scratch/checkout/capturas/`. Spec: `.scratch/checkout/spec.md` (Memória e layouts).

**Blocked by:** 05, 08

**Status:** resolved

- [x] Uma coluna e Resumo do pedido abaixo
- [x] Rodapé fixo no pagamento e no endereço, sem esconder conteúdo
- [x] Cartão de endereço com linhas separadas
- [x] Sem rolagem horizontal em 390
- [x] Testes de layout em 390 e 1280
- [x] Capturas para revisão humana

## Answer

**Rodapé do Pagamento (Figma newCard 240-11435/240-19443):** `paymentBar(state)` em `prototype/src/checkout.js` é uma região "Total do pedido e pagamento" com o Total do pedido e a mesma ação do Resumo do pedido ("Confirmar e pagar R$ X", desabilitado sem forma escolhida, ou "Gerar Pix"; o botão vem de `payButton`, compartilhado com `paymentAction`). `renderCheckout` a acrescenta depois do `.checkout-body` só na seleção e no preenchimento do pagamento (nem no processamento, nem no Pix pendente, nem em "Pagamento aprovado!"). Abaixo de 1024px ela fica fixa no rodapé e a ação do Resumo do pedido some (`display:none`), que mantém "Confira o endereço antes de confirmar." e "Editar carrinho", como no Figma; a partir de 1024px, o contrário. Assim só uma ação está na tela (e na árvore de acessibilidade) em cada largura. Depois de uma recusa, o foco volta à ação visível (`checkVisibility`).

**Rodapé do endereço:** abaixo de 1024px, `.address-action` (o invólucro da ação principal que já existia) fica fixo no rodapé: "Entregar neste endereço", "Confirmar localização", "Salvar endereço", "Salvar alterações" e "Usar endereço salvo".

**Sem esconder conteúdo:** `.checkout-page:has(.pay-bar)` e `:has(.address-action)` ganham o espaço do rodapé embaixo; os toasts sobem para cima do rodapé enquanto ele existe (`main:has(...) ~ .toast`).

**Já existiam (só ganharam testes):** a uma coluna com o Resumo do pedido abaixo (ticket 01), complemento e referência em linhas separadas com o divisor antes da previsão (ticket 03), preços na cor `--title` (`#502314`), as fontes Flame/Flame Sans, os contornos dos secundários e o indicador de etapas, que segue o componente Mobile do Figma (`246-10579`).

**Rolagem horizontal em 390 (relatada no ticket 08):** as telas do Checkout, do endereço e da confirmação não passam de 390 (testado). A área de 474 px vem do cardápio, fora do Checkout: a regra global `h1{white-space:nowrap}` (`prototype/src/styles.css`, linha 77) com o título do hero a 54px abaixo de 1024px faz "Esferas do Dragão de Pepperoni" (Acompanhamentos) medir 558 px; no projeto `isMobile` a página toda alarga para 474. Não foi corrigido aqui (fora do Checkout). Ao sair para o Carrinho ou o Checkout, a largura volta a 390.

**Decisões fora da letra da spec:**
- A ação de pagamento existe duas vezes no HTML (Resumo do pedido e rodapé), cada uma escondida numa faixa de largura, em vez de mover um só botão: o rodapé tem o próprio Total do pedido, e o Figma mobile não mostra a ação no Resumo. Os testes passaram a procurar a ação no Checkout (`confirmarEPagar` e `gerarPix` em `tests/support.js`, uma linha em `pix.spec.js` e outra em `pagamento.spec.js`), não só no Resumo.
- "Fora da região" (Figma Endereço 12) mostra "Voltar ao cardápio" como principal fixo no celular; aqui os dois botões continuam no conteúdo, como no desktop ("Escolher outro endereço" principal), porque trocar a hierarquia por largura não está na spec. "Remover endereço?" também fica sem rodapé fixo.
- O Figma mobile do fluxo de endereço tem um cabeçalho próprio (← "Endereço de entrega" ✕, sem o cabeçalho do site nem "Voltar ao checkout"); continua o cabeçalho do projeto com "Voltar" e "Voltar ao checkout", como diz a spec ("o mesmo do projeto").

**Testes:** `prototype/tests/layout-checkout.spec.js` (5 em 390, 2 em 1280): o rodapé do Pagamento com o Total do pedido e a ação acompanhando a Forma de pagamento, uma só ação, fixo ao rolar; uma coluna com o Resumo do pedido abaixo e "Editar carrinho" acima do rodapé no fim da página; a ação fixa em Seus endereços, Confirmar localização e Dados de entrega com o fim do conteúdo e o toast "Endereço salvo e selecionado." acima dela; o cartão de endereço; nenhum rodapé no Pix pendente e nenhuma rolagem horizontal até o Pedido confirmado; em 1280, o Resumo à direita com a ação e sem rodapé, e a ação do endereço logo depois do conteúdo. `npm test` (358 passados; o único que falhou, um teste 3D da bandeja em 390, passou ao rodar de novo) e `npm run test:build` (359 passados) passam. Capturas em `.scratch/checkout/capturas/09-{pagamento,pagamento-pix-fim,enderecos,confirmar,dados-de-entrega}-{mobile-390,desktop}.png` e `09-{pagamento-fim,dados-de-entrega-fim}-mobile-390.png` (no celular, a tela com o rodapé, no topo ou no fim da página; no desktop, a página inteira).
