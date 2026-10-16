# 01: Padrões compartilhados demonstrados no Cardápio

Status: resolved
Type: task
Blocked by: None (can start immediately)

**What to build:** header e controles de compra do Cardápio usando fontes, tokens e ícones coerentes com o Figma, com uma base reutilizável para a migração dos demais fluxos.

- [x] Inventariar as famílias de telas/estados existentes e mapear suas referências ativas do Figma; registrar a matriz de revisão que os demais tickets completarão.
- [x] Confirmar os símbolos compartilhados com os componentes da biblioteca Icons e suas variantes; documentar origem e centralizar os SVGs exatos quando não houver pacote de origem comprovado.
- [x] Introduzir os padrões de espaçamento, cantos, superfícies e tipografia de forma compatível com os fluxos ainda não migrados. Não eliminar os caminhos antigos enquanto houver consumidores.
- [x] Demonstrar no header e nos controles de compra do Cardápio ícones na escala com mínimo de 16 px, fontes BK efetivamente carregadas e interação preservada em web e mobile.
- [x] Não remodelar as Camadas do hambúrguer, mudar regras do pedido ou redesenhar superfícies específicas do Cardápio.

## Answer

Concluído em 15/10/2026. [Matriz de revisão](../matriz.md), [inventário de referências ativas](../referencias-ativas.json) e [revisão em dois eixos](../revisao-01.md).

- Tokens compartilhados em `prototype/src/tokens.css`; adoção inicial em `cardapio.css`, sem retirar os estilos legados. Header e compra usam a escala acordada e preservam as superfícies do Cardápio.
- SVGs originais centralizados em `prototype/Assets/icons`, com componentes, keys, variante e usos no README. Nenhum pacote de origem presumida. Ícones em 16, 24 e 32 px, separados da área clicável.
- Fontes locais Flame Sans, Flame Regular e Flame Bold carregadas nas 11 larguras: 320, 360, 390, 768, 1023/1024/1025, 1280, 1919/1920/1921. Flame Regular na quantidade e Flame Bold no total. Nenhum overflow horizontal medido. [Medidas](../evidencias/medidas.json) e capturas 390/768/1280/1920 na pasta de evidências.
- Controles nativos e lógica preservados. Grade, Camadas e regras do pedido sem alteração. Problema dos cards reproduzido a 768 px e registrado para o ticket 02.
- `npm run build` aprovado; verificações de sintaxe JS e `git diff --check` aprovadas. Não existe script de typecheck neste projeto JavaScript.
- Testes focados: primeira rodada com 41 aprovados, 8 ignorados e uma regressão de rolagem em 1920 × 720; corrigida escolhendo espaçamento 24 px para Ver ingredientes. Reexecução de `layout.spec.js`: 11 aprovados, 5 ignorados.
- Suíte completa `npm test`: **626 aprovados, 39 ignorados, 1 falha**, em `entrada-e-saida.spec.js:105` (inclinação durante a Entrada desktop; deslocamento 3,4453125 px para limite menor que 1). Repetição isolada com um worker, três execuções: **3 aprovadas**. Isso não transforma a execução completa em verde nem comprova a causa da falha. Nenhuma alteração no renderizador foi feita neste ticket.
- Revisão Standards: 0 achados; Spec: 0 achados, incluindo conferência dos ajustes finais. Commits de implementação: `b281bb9`, `050860f`.
