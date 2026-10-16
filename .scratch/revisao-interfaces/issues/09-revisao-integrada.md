# 09: Fechar a revisão integrada e retirar padrões obsoletos

Status: resolved
Type: task
Blocked by: 02, 03, 04, 05, 06, 07, 08

**What to build:** todos os fluxos revisados podem ser navegados em sequência com padrões consistentes, evidências consolidadas e sem regressões entre as migrações.

- [x] Completar a matriz de telas/estados, inventário de ícones e registro de tipografia, com referências Figma, viewports e resultados verificáveis.
- [x] Auditar referências restantes a ícones/fontes/tokens antigos e eliminar mecanismos obsoletos somente quando não houver consumidores.
- [x] Conferir percursos cruzados entre Cardápio, Ver ingredientes, Endereço de entrega, Carrinho, Checkout e Minha conta/Pedidos, preservando estados e regras de negócio.
- [x] Executar verificações automatizadas adequadas e consolidar capturas representativas antes/depois; não depender apenas de presença no DOM nem exigir igualdade pixel a pixel de fontes.
- [x] Resolver divergências residuais dentro da spec e registrar explicitamente limitações ou problemas fora do escopo.

## Answer

Concluído em 16/10/2026 na branch `feat/big-king`. Integração inicial em `34c5d44`, seguida do ajuste final de Voltar. [Matriz](../matriz.md#ticket-09--integração), [auditoria](../auditoria-09.md), [medidas finais](../evidencias/integrada/medidas.json) e [revisão independente](../revisao-09.md).

- Consolidados inventário de ícones com origem/variante/caixas/consumidores e registro dos três arquivos de fontes BK. Corrigidas marcações pendentes da matriz e a contagem de receitas do ticket 03. Referências Figma previamente verificadas em 01–08 reutilizadas, sem nova exportação.
- Retirados três SVGs de reserva sem consumidores, seta própria oculta do Endereço e estilos sem uso dessa seta e do antigo Fechar. CSS base e aliases ainda consumidos permanecem. Auditoria distingue ícones de mapas, QR, logo, fotos e Camadas.
- Corrigido retorno residual de Pedido confirmado para seta vermelha de 24 px + Voltar, preservando handler e última categoria. Ação de recuperação Voltar ao pagamento do Pix travado preservada. Seletores de quatro verificações existentes atualizados; nenhuma regra de negócio alterada.
- Coletor percorre a mesma sessão por endereço visitante, Personalização, duas unidades com Combo/Coca-Cola, Carrinho, Identificação, endereço preservado, Pix, confirmação, acompanhamento, lista e recarga. Verifica R$ 87,80 nos Itens, complemento, ingrediente retirado, Carrinho encerrado, retorno à categoria e persistência. **108/108 combinações em 12 larguras, 45 capturas**, renovadas no build final; zero overflow horizontal, ícones na escala e fontes registradas. Captura final `390-confirmado` inspecionada com seta + Voltar.
- Build, sintaxe dos módulos/coletor/teste e diff check aprovados. Sem comando de typecheck neste projeto JavaScript. **Suíte completa de `34c5d44`: 671 aprovados, 39 ignorados, zero falhas (12,5 min)**. Após o pequeno incremento de Voltar: **30/30 testes de pagamento/acompanhamento aprovados no build final (52,1 s)** e nova coleta integrada 108/108. A suíte completa não foi repetida após esse incremento; resultados distinguem as versões.
- Logs preservados em `evidencias/integrada/suite-09-final.log`, `focados-09-final.log` e `coleta-09-final.log`. Tentativas iniciais de servidor sem acesso local e colisão da porta 4173 foram substituídas por portas exclusivas; não representam execução de testes válida.
- Revisão em dois agentes: Standards **0**; Spec **1 P3 e 1 P2 corrigidos, zero pendentes**. Ambos revisaram o incremento final. Limites e diferenças herdadas estão na auditoria; não existe captura anterior de cada estado, nem obrigação de implementar as 271 referências. Camadas, mapas ilustrados e regras de negócio preservados.

