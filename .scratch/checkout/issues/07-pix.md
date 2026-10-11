# 07: Pagamento com Pix

**What to build:**
- **"Gerar Pix"** cria o Pedido e abre "Só falta pagar o Pix" (Figma pixWaiting) com o QR Code em SVG fixo, "Valor a pagar", a contagem ao vivo de 10:00, "Copiar código Pix" (área de transferência e toast, Figma pixCopied), "Aguardando pagamento", "Escolher outra forma de pagamento" e a nota de demonstração.
- **Aprovação** automática 10 s depois de gerar (Figma pixApproved) segue para a confirmação com "Pago com Pix · R$ X" (Figma successPix). Exceção: o celular `(61) 90000-0000` nunca é aprovado.
- **Expiração** em 10:00 mostra "Seu Pix expirou" (Figma pixExpired), com "Gerar novo Pix" (nova validade, mesmo Pedido) e "Escolher outra forma de pagamento".
- **"Escolher outra forma de pagamento"** cancela o Pix e a aprovação agendada e volta ao Pagamento sem forma pré-selecionada.

Spec: `.scratch/checkout/spec.md` (Pix, Situações fixas).

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Pix pendente com QR, valor, contagem e copiar
- [ ] Copiar não aprova
- [ ] Aprovação em 10 s até a confirmação (`page.clock`)
- [ ] `(61) 90000-0000` expira em 10:00; Gerar novo Pix volta a Aguardando pagamento
- [ ] Escolher outra forma de pagamento cancela a aprovação agendada
- [ ] Testes Playwright
