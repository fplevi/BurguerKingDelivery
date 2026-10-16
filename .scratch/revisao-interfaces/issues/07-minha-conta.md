# 07: Minha conta com edição, autenticação e feedbacks consistentes

Status: resolved
Type: task
Blocked by: 01, 04, 06

**What to build:** Identificar-se e gerenciar Dados pessoais, celular, Endereços salvos e cartões na Minha conta segue os mesmos padrões dos fluxos já migrados.

- [x] Reutilizar o padrão do Código de confirmação do ticket 06, inclusive na confirmação do novo celular; manter Identifique-se sem fechar.
- [x] Revisar navegação, formulários, listas, confirmações e estados vazios quanto a fontes, tokens, ícones, body/header e Voltar.
- [x] Conferir a reutilização das ações de endereço padronizadas no ticket 04 e preservar seus destinos no contexto da conta.
- [x] Usar toasts nos sucessos já existentes de dados, celular e endereços, sem duplicação ou mudança das regras de persistência.
- [x] Preservar formas de pagamento e comportamento de Sair. Conferir web/mobile e larguras intermediárias.


## Answer

Implementado em 16/10/2026. Minha conta usa os tokens compartilhados, body #F5EBDC, header #FAF2E5, fontes BK e SVGs originais Icons Outline/Bold de 24 px. Títulos conferidos nas referências web/mobile; navegação, formulários, listas, confirmações e estados vazios revisados. O retorno do celular já vinculado usa seta vermelha e Voltar, mantendo o destino Dados pessoais.

Código de confirmação reutiliza o componente do ticket 06, incluindo novo celular, canais, erro e reenvio. Identifique-se continua sem Fechar. Ações de endereço reutilizam as páginas padronizadas do ticket 04 e voltam à conta. Toasts e persistência existentes, cartões e Sair preservados.

Validação: build Vite e sintaxe JS aprovados; 52 testes focados aprovados/2 ignorados; suíte completa no build com 671 aprovados/39 ignorados/zero falhas (15,7 min). Após o ajuste final de Voltar, 10 testes de Dados pessoais aprovados. Não há comando de typecheck neste projeto JavaScript. Coletor responsivo: 231 combinações em 11 larguras de 320 a 1921 px, 84 capturas; sem overflow ou espaçamento computado fora da escala nos estados conferidos.

[Revisão Standards/Spec](../revisao-07.md): zero achados pendentes. [Matriz e evidências](../matriz.md#ticket-07--minha-conta).

Commit principal: 97163cd. A suíte completa usou o build anterior ao ajuste textual final de Voltar; esse incremento foi validado pelos 10 focados e pelo coletor final. O commit 8813ba9 de orçamento do Big King pertence a outro trabalho e não foi incluído nesta revisão.
