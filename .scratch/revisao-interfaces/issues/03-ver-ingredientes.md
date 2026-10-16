# 03: Ver ingredientes consistente em web e mobile

Status: resolved
Type: task
Blocked by: 01

**What to build:** o cliente consegue personalizar o Item com controles, textos e disposição coerentes com o Figma em desktop, tablet e celular.

- [x] Revisar header, Bandeja, seleção dos ingredientes, ações e estados do fluxo quanto a tokens, fontes, ícones e responsividade.
- [x] Aplicar o padrão de Voltar somente onde esse retorno já existe na referência; preservar as ações próprias de aplicar/cancelar.
- [x] Preservar Personalização, ingredientes não removíveis, acessibilidade dos controles e funcionamento da cena 3D.
- [x] Conferir as referências web/mobile e larguras intermediárias, incluindo barras fixas e ausência de cortes ou sobreposições dos controles.

## Answer

Implementado em `763d830`. Header, painel, Bandeja e chips usam os tokens compartilhados; Bandeja com raio 16 e ícones originais Icons em caixas de 16 px. Tipografia BK e superfícies creme/bege conferidas com as referências web/mobile. Cancelar/Aplicar preservados; referência não possui Voltar. Camadas, Personalização e renderizador 3D mantidos.

- [Matriz e evidências](../matriz.md#ticket-03--ver-ingredientes): 36 combinações de estados/larguras, de 320 a 1921 px, mais 12 combinações das demais receitas com nomes longos. Sem overflow ou controles sobrepostos à barra fixa.
- Build aprovado; testes focados finais: 55 aprovados, 11 ignorados por dispositivo.
- Suíte completa final no snapshot exato `763d830`, com porta e resultados isolados: **627 aprovados, 39 ignorados, zero falhas** (14,6 min).
- Primeira suíte no diretório compartilhado: 621 aprovados, 39 ignorados e 6 falhas (cinco de artefatos ausentes e uma de comparação de screenshots). Histórico preservado na matriz; nenhum desses erros se repetiu no snapshot isolado. Alterações simultâneas de outra tarefa foram preservadas.
- [Revisão Standards/Spec](../revisao-03.md): zero achados nos dois eixos.
