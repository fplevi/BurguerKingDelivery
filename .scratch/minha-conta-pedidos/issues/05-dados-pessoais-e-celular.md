# 05: Dados pessoais e Alterar celular

**What to build:** Dados pessoais e a troca de celular (telas 08–11), como na spec. Salvar atualiza o nome no header. (61) 90000-0000 simula "Celular já vinculado".

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 04

**Status:** resolved

- [x] Editar nome e e-mail, com validação, salvar e cancelar
- [x] Alterar celular com código, reenviar e troca de canal
- [x] Celular antigo vale até a confirmação
- [x] Celular já vinculado
- [x] Testes Playwright

## Answer

**Dados pessoais** (`#conta/dados`, `profile` em `prototype/src/account.js`): celular só para leitura com "Alterar celular", Nome completo e E-mail (opcional), "Salvar alterações" (ação `profileSave`, mesmas validações do cadastro; toast "Dados atualizados." e o nome novo no header) e "Cancelar" (volta a Minha conta, descartando). Depois de erros, o que foi digitado continua nos campos (`rebuild` com `#profile-name, #profile-email`).

**Alterar celular** (`#conta/celular`, `state.phoneChange`, ações `phone*`): o título segue a etapa (Alterar celular, Confirmar novo celular, Este celular já tem um cadastro). O celular atual não é aceito como novo. O conflito só é revelado depois do código confirmado, para não expor a quem não comprovou o número que ele tem cadastro; (61) 90000-0000 simula isso. Confirmado, `customer.phone` muda, os Pedidos da sessão passam para o novo celular e `location.replace` leva a Dados pessoais (o Voltar não reabre o código). `customer.key` guarda o celular da Identificação, para as situações fixas de Mariana continuarem depois da troca.

**Testes:** `tests/dados-pessoais.spec.js` (5 cenários × 2 projetos); capturas `capturas/05-*.png`. Suíte completa: 450 passando.
