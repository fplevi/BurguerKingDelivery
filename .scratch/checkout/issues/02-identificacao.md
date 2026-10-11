# 02: Identificação pelo celular com Código de confirmação

**What to build:** a etapa Identificação do Checkout, como na spec:
- "Qual é o seu celular?", com máscara e envio pelo WhatsApp ou por SMS.
- "Confirme seu celular", com o destino do envio, "Reenviar código", troca de canal e o toast de código reenviado.
- "Alterar celular" e "Código incorreto. Confira e tente novamente.".
- O cadastro do Novo cliente: nome obrigatório, e-mail opcional e celular só para leitura.

As situações fixas de celular e código (`(61) 99999-1234` e `(61) 90000-0000` como Cliente cadastrado, qualquer outro celular como Novo cliente, `123456` como único código válido) ficam em `prototype/src/checkout-fixtures.js`. Depois da Identificação, o Checkout leva a `#endereco` (por enquanto, uma página só com o título e o indicador na etapa Endereço). Na sessão, um celular já confirmado não pede o código de novo.

Figma: phone, phoneFilled, waCode, smsCode, waResent, smsResent, newPhone, newCode, newCodeSMS, codeError e newCustomer (node-ids na spec). Spec: `.scratch/checkout/spec.md` (Identificação, Situações fixas).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Celular com DDD e botões desabilitados até 11 dígitos
- [ ] WhatsApp e SMS, reenviar e trocar de canal com o toast
- [ ] Código incorreto com erro e botão desabilitado até mudar
- [ ] Alterar celular
- [ ] Cliente cadastrado vai direto ao Endereço; Novo cliente passa pelo cadastro
- [ ] Celular confirmado lembrado na sessão
- [ ] Fixtures em `checkout-fixtures.js`
- [ ] Testes Playwright para cada linha de celular e código da tabela
