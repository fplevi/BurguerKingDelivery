# 05: Carrinho consistente, incluindo item removido e Desfazer

Status: resolved
Type: task
Blocked by: 01

**What to build:** revisar Itens, escolher Bebida do combo, alterar quantidades e remover/desfazer mantém o padrão visual em todos os estados já existentes.

- [x] Revisar cards, seletores, quantidades, Resumo do carrinho, erro, estado vazio, header e total fixo mobile com os tokens/fontes/ícones corretos.
- [x] Preservar valores, Combo, Personalização e regras de quantidade.
- [x] Padronizar Voltar e a separação de body/header.
- [x] Converter feedbacks transitórios para toast, mantendo Desfazer funcional, mensagem completa e posicionamento acima da barra fixa.
- [x] Conferir web/mobile e larguras intermediárias com evidência dos estados relevantes.

## Answer

Implementado em `prototype/src/carrinho.css`, com markup/medição da barra em `main.js` e retorno em `index.html`. Cards, seletores, quantidades, resumo, vazio, erro e carrinho travado usam os padrões compartilhados, mantendo os valores e regras existentes. Voltar é único e preserva histórico, foco e categoria.

Consulta somente de leitura ao Figma (`187:5486`) confirmou fontes e símbolos: Flame Regular em nomes dos Itens/Resumo, Flame Bold em título/valores, Flame Sans em controles/quantidades; ArrowLeft 24 px e Check/CaretDown/Minus/Plus 16 px. SVGs originais reutilizados; nenhuma dependência nova.

Item removido usa toast marrom com mensagem integral e Desfazer, mantendo o encerramento na próxima alteração ou saída. O aviso permanente de pagamento continua no conteúdo. A altura real da barra fixa controla o posicionamento do toast e a reserva do rodapé, inclusive totais altos e safe area. Em 320 px, o Total do item fica abaixo da quantidade para não partir centavos.

[Matriz e evidências](../matriz.md#ticket-05--carrinho): **168 combinações aprovadas**, doze estados em catorze larguras, com 72 capturas. Inclui Personalização, acompanhamento, quantidade 99, vazio, lista, erro, Desfazer, total alto e carrinho travado. [Revisão](../revisao-05.md): Standards 0; Spec 0 achados restantes.

Suíte completa no build estável: **669 aprovados, 39 ignorados, zero falhas** (17,1 min). Build, sintaxe JS, diff check e coleta geométrica aprovados. Checagem final de remoção/layout no build atualizado: **16 aprovados, 6 ignorados, zero falhas**. Não há script de typecheck no projeto JavaScript.

Histórico de validação: tentativa inicial na porta ocupada não iniciou; execuções sem acesso à rede local foram repetidas fora do sandbox. Primeira execução focada no servidor de desenvolvimento: 72 aprovados, 6 ignorados e 4 falhas, com recarregamentos HMR durante os testes e colisão de artefatos ao iniciar a suíte ampla. Os logs dos servidores mostraram reloads causados pelos HTMLs dos rastros. A suíte final usa o build estável e diretório próprio de resultados. As capturas finais usam build separado; apenas o hero 3D fora do Carrinho é dispensado pelo fallback SVG já existente.
