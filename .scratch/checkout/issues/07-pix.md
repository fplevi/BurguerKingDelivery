# 07: Pagamento com Pix

**What to build:**
- **"Gerar Pix"** cria o Pedido e abre "Só falta pagar o Pix" (Figma pixWaiting) com o QR Code em SVG fixo, "Valor a pagar", a contagem ao vivo de 10:00, "Copiar código Pix" (área de transferência e toast, Figma pixCopied), "Aguardando pagamento", "Escolher outra forma de pagamento" e a nota de demonstração.
- **Aprovação** automática 10 s depois de gerar (Figma pixApproved) segue para a confirmação com "Pago com Pix · R$ X" (Figma successPix). Exceção: o celular `(61) 90000-0000` nunca é aprovado.
- **Expiração** em 10:00 mostra "Seu Pix expirou" (Figma pixExpired), com "Gerar novo Pix" (nova validade, mesmo Pedido) e "Escolher outra forma de pagamento".
- **"Escolher outra forma de pagamento"** cancela o Pix e a aprovação agendada e volta ao Pagamento sem forma pré-selecionada.

Spec: `.scratch/checkout/spec.md` (Pix, Situações fixas).

**Blocked by:** 06

**Status:** resolved

- [x] Pix pendente com QR, valor, contagem e copiar
- [x] Copiar não aprova
- [x] Aprovação em 10 s até a confirmação (`page.clock`)
- [x] `(61) 90000-0000` expira em 10:00; Gerar novo Pix volta a Aguardando pagamento
- [x] Escolher outra forma de pagamento cancela a aprovação agendada
- [x] Testes Playwright

## Answer

**Situações fixas:** `prototype/src/checkout-fixtures.js` ganhou `pixApproval` (10 s), `pixValidity` (10:00), `pixApprovedTime` (1,5 s de "Pagamento aprovado!") e `pixCode` (o "copia e cola" fixo). O Pix aprovado ou não por celular continua em `customers[...].pixApproved` (ticket 02); o Novo cliente tem o Pix aprovado. README com as linhas do Pix na tabela.

**Estado (`prototype/src/state.js`):** o Pedido do Pix nasce de `createOrder(s, 'Pix', …)` com `status: 'pix'`, `pix: 'waiting' | 'expired' | 'approved'`, `expiresAt` (ms do relógio, passado na ação) e `approves`. Ações `pixGenerate`, `pixExpire`, `pixRenew` (mesmo Pedido, nova validade), `pixApprove`, `pixConfirm` (`confirmOrder`, sem os campos do Pix) e `pixCancel` (o Pedido fica `pending`, sem id, e o pagamento sem Forma de pagamento), num reducer próprio (`pixReducer`). **Para o ticket 08:** `pixPending(s)` (exportado) é verdadeiro com o Pix aguardando ou expirado, até "Escolher outra forma de pagamento" ou a aprovação. Enquanto o Pix existe, as ações `pay*` não mudam nada.

**Tela (`prototype/src/checkout.js`):** `pixStep(order, now)` (Figma pixWaiting e pixExpired, no lugar do endereço e da Forma de pagamento; o Resumo do pedido fica sem a ação de pagamento), o QR Code (`qrPath`, 25 × 25 módulos com os três quadrados de posição e o resto de uma sequência pseudoaleatória fixa; `role="img"`, "QR Code do Pix"), `pixClock()` (mm:ss) e `pixApprovedStep(order)` (Figma pixApproved). `prototype/src/main.js`: os temporizadores do Pix (`startPix`/`stopPix`: contagem a cada segundo só no texto, expiração, aprovação), "Copiar código Pix" (Clipboard API, com um campo escondido de reserva) e o foco (título do Pix ao gerar, gerar de novo e expirar; "Pagamento aprovado!" na aprovação; a opção Pix, desmarcada, ao escolher outra forma). Estilos no fim de `styles.css`.

**Decisões fora da letra da spec:**
- "Pagamento aprovado!" fica 1,5 s na tela, com o indicador todo concluído (como no Figma pixApproved) e a tela desabilitada como no processamento do cartão; depois, `#pedido/<id>`.
- A aprovação agendada continua valendo se o cliente sair do Checkout: o Pedido é confirmado, mas a navegação até `#pedido/<id>` só acontece com o Checkout na tela. O toast com "Ver pedido" fica para o ticket 08.
- O código Pix e o QR Code são os mesmos em "Gerar novo Pix" (a spec diz "novo código", mas também "texto fixo"); muda só a validade.
- "Voltar ao carrinho" e "Editar carrinho" continuam no Pix pendente (Figma pixWaiting os mostra); escondê-los e travar o carrinho é o ticket 08.
- Sem região viva na contagem (anunciaria a cada segundo); "Pagamento aprovado!" é `role="status"`.
- O Novo cliente ainda não chega ao Pagamento nesta branch (endereço novo é o ticket 04), então a aprovação do Novo cliente não tem teste; a regra está na fixture e no reducer.

**Testes:** `prototype/tests/pix.spec.js` (5 testes, em 1280 e 390, com `page.clock`), com `gerarPix`, `pixPendente` e `pixExpirado` no fim de `tests/support.js`: Pix pendente (textos, QR Code, foco, contagem 10:00 → 09:59 → 08:54); copiar com a área de transferência e o toast, sem aprovar em 30 s; (61) 99999-1234 aprovado aos 10 s, "Pagamento aprovado!" e "Pago com Pix · R$ 40,80" em #BK1024; (61) 90000-0000 expirando em 10:00, Gerar novo Pix com 10:00 de novo e nova expiração; Escolher outra forma de pagamento sem forma escolhida, sem aprovação depois e com um novo Pix aprovado. `npm test` passa (300). Capturas de revisão em `.scratch/checkout/capturas/07-{pix-pendente,pix-copiado,pix-expirado,pix-aprovado,pedido-pix}-{desktop,mobile-390}.png`.
