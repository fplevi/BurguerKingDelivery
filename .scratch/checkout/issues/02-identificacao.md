# 02: Identificação pelo celular com Código de confirmação

**What to build:** a etapa Identificação do Checkout, como na spec:
- "Qual é o seu celular?", com máscara e envio pelo WhatsApp ou por SMS.
- "Confirme seu celular", com o destino do envio, "Reenviar código", troca de canal e o toast de código reenviado.
- "Alterar celular" e "Código incorreto. Confira e tente novamente.".
- O cadastro do Novo cliente: nome obrigatório, e-mail opcional e celular só para leitura.

As situações fixas de celular e código (`(61) 99999-1234` e `(61) 90000-0000` como Cliente cadastrado, qualquer outro celular como Novo cliente, `123456` como único código válido) ficam em `prototype/src/checkout-fixtures.js`. Depois da Identificação, o Checkout leva a `#endereco` (por enquanto, uma página só com o título e o indicador na etapa Endereço). Na sessão, um celular já confirmado não pede o código de novo.

Figma: phone, phoneFilled, waCode, smsCode, waResent, smsResent, newPhone, newCode, newCodeSMS, codeError e newCustomer (node-ids na spec). Spec: `.scratch/checkout/spec.md` (Identificação, Situações fixas).

**Blocked by:** 01

**Status:** resolved

- [x] Celular com DDD e botões desabilitados até 11 dígitos
- [x] WhatsApp e SMS, reenviar e trocar de canal com o toast
- [x] Código incorreto com erro e botão desabilitado até mudar
- [x] Alterar celular
- [x] Cliente cadastrado vai direto ao Endereço; Novo cliente passa pelo cadastro
- [x] Celular confirmado lembrado na sessão
- [x] Fixtures em `checkout-fixtures.js`
- [x] Testes Playwright para cada linha de celular e código da tabela

## Answer

**Estado:** `prototype/src/state.js` ganhou `identification` (passo `phone`, `code`, `register` ou `done`, celular, canal, código, `codeError` e os erros do cadastro) e `customer` (o cliente identificado na sessão, `null` até a confirmação), com as ações `idPhone`, `idSend`, `idChannel`, `idCode`, `idConfirm`, `idChange` e `idRegister` num reducer próprio (`idReducer`). Os dados do cliente só entram em `customer` depois do Código de confirmação válido.

**Situações fixas:** `prototype/src/checkout-fixtures.js` tem o código válido (`123456`) e os Clientes cadastrados por celular ((61) 99999-1234 e (61) 90000-0000, Mariana Silva, com o Pix aprovado ou não, para o ticket do Pix). Qualquer outro celular é Novo cliente. A tabela também está no README.

**Tela:** o HTML dos três passos fica em `identificationStep()` (`prototype/src/checkout.js`), com `maskPhone()` e `sentTo()` (a frase do destino, também usada no toast). Cada passo é um formulário, então Enter envia. O Checkout é reconstruído a cada mudança, mantendo o foco e o cursor do campo em uso e o texto do nome e do e-mail.
- O celular é mascarado enquanto se digita, com o cursor depois do mesmo dígito; o código aceita só dígitos, até 6.
- Ao pedir o código, o foco vai ao campo do código; com Código incorreto, volta a ele; Alterar celular leva ao campo do celular, preenchido, e um novo envio limpa o código.
- Reenviar e trocar de canal mostram o toast do projeto com "Enviamos um código pelo WhatsApp|por SMS para (DD) 9XXXX-XXXX." (Figma waResent/smsResent).

**Endereço:** `#endereco` é uma tela nova (`#address-page`), por enquanto só com "Endereço de entrega" (título do Figma Endereço 01, que recebe o foco) e o indicador na etapa Endereço, sem o "Entregar em" no cabeçalho.

**Decisões fora da letra da spec:**
- Concluir a Identificação troca `#checkout` por `#endereco` no histórico (`location.replace`): o Voltar do navegador vai ao Carrinho, e não a um `#checkout` que pularia de novo para o Endereço.
- Com um cliente identificado, `#checkout` vai direto a `#endereco` (o "passo seguinte" enquanto não há Pagamento); o ticket 03 deve mudar isso para abrir o Pagamento quando houver endereço.
- `#endereco` sem celular confirmado volta a `#checkout`; com o carrinho vazio (ou combo sem bebida), ao Carrinho, como `#checkout`.
- "Confirmar e continuar" também fica desabilitado até haver 6 dígitos, como os envios até 11.
- O "Receber por SMS" da tela smsResent do Figma foi lido como a troca de canal: no SMS, o botão é "Receber pelo WhatsApp", como diz a spec.
- O cadastro mostra o celular confirmado num campo "Celular" só para leitura, abaixo do e-mail (o Figma newCustomer não o mostra). Os erros do cadastro, sem texto no Figma, são "Informe seu nome completo." e "Informe um e-mail válido.", mostrados ao tocar em Continuar, com o foco no primeiro campo inválido.
- O "Voltar ao checkout" do Figma Endereço 01 fica para o ticket 03.

**Testes:** `prototype/tests/identificacao.spec.js` (11 testes, em 1280 e 390): máscara e 11 dígitos; (61) 99999-1234 pelo WhatsApp e (61) 90000-0000 por SMS até `#endereco`; reenviar e trocar de canal com o toast; Código incorreto até mudar, sem limite de tentativas; só dígitos no código; Alterar celular; Novo cliente com nome obrigatório, e-mail inválido e válido e celular só para leitura; celular lembrado na sessão; guardas de `#endereco`. Capturas de revisão em `.scratch/checkout/capturas/02-{celular,codigo-incorreto,cadastro,endereco}-{desktop,mobile-390}.png`.
