# 08: Pedidos confirmados e acompanhamento com apresentação consistente

Status: resolved
Type: task
Blocked by: 01

**What to build:** consultar a lista de Pedidos confirmados e acompanhar sua Situação do pedido mantém legibilidade, navegação e identidade visual em todos os estados já implementados.

- [x] Revisar lista, detalhes, acompanhamento, estados vazios, pedido entregue/cancelado, header e controles conforme o Figma.
- [x] Aplicar fontes BK, tokens, cantos e ícones corretos e o padrão de Voltar onde existente.
- [x] Preservar os marcadores ilustrados aprovados dos mapas; não substituí-los por ícones genéricos nem alterar regras ou dados do acompanhamento.
- [x] Conferir mapas, cards e textos em web/mobile e larguras intermediárias sem recortes ou sobreposições indevidas.

## Answer

Concluído em 16/10/2026. Implementação em `1a2eeae` e correção de alinhamento em `945cda2`, branch atual `feat/big-king`. [Matriz](../matriz.md#ticket-08--pedidos-confirmados-e-acompanhamento), [medidas](../evidencias/pedidos/medidas.json) e [revisão independente](../revisao-08.md).

- Fontes BK, tokens de espaçamento, raios e superfícies aplicados à lista, vazio, acompanhamento e encerramento. Header/navegação reutilizam a base compartilhada. WhatsApp substituído pelo SVG original do Figma, caixa 16 px e cor herdada; ícone centralizado e procedência documentada.
- Um Voltar por contexto: vazio retorna à Minha conta; detalhe retorna à lista. Símbolo vermelho e texto nativo. A navegação anterior de dados/situações e links de contato continua preservada.
- Grade em duas colunas a partir de 1160 px, empilhada abaixo para preservar área útil do mapa e contatos. Resumo admite quebra abaixo de 360 px. Nenhuma regra, dado, tile, rota ou marcador ilustrado alterado. Entregue/cancelado continuam sem mapa nem entregador, respeitando o comportamento existente exigido pela issue, apesar do mapa estático na referência de entregue.
- **208 combinações aprovadas em 16 larguras**, incluindo 320/359/360, 390, 768, 1023/1024/1025, 1158/1159/1160/1161, 1280 e 1919/1920/1921. Treze estados: lista, retirado fixo, entregue, cancelado, oito etapas da sessão e vazio. **91 capturas**, zero overflow horizontal, zero texto cortado nas medidas, espaçamentos na escala, controles de pelo menos 48 px e WhatsApp em 16 px.
- Inspeção visual de 320-retirado-fixo, 1280-retirado-fixo, 390-vazio, 390-entregue, 1160-etapa-5, 1024-cancelado e 1920-lista. Foco no título no vazio é o retorno acessível existente. Fontes de conteúdo e títulos carregadas; Flame Regular pode permanecer sem carregar nos estados que usam apenas Sans/Bold.
- Build, sintaxe dos módulos/script e diff check aprovados. Projeto JavaScript sem comando de typecheck. **26 testes focados aprovados**. Atualizado somente o rótulo esperado de retorno no teste existente; não foram adicionados testes acoplados à implementação visual. As primeiras tentativas de coleta/testes sem acesso à rede local foram interrompidas; a coleta e os focados finais rodaram com acesso ao preview local.
- Revisão pela skill code-review: Standards **0**, Spec **0** achados. Suíte completa em `1a2eeae`: **666 aprovados, 39 ignorados e 5 falhas** (12,9 min). Quatro falhas de `layout-conta.spec.js` revelaram o resumo recuado 25 px dentro de um segundo card; reproduzidas isoladamente (2/2 falharam), corrigidas em `945cda2` usando o parâmetro `action` existente de `orderSummary`. **34/34 testes finais de layout/pedidos aprovados**. Quinta falha: timeout de 30 s ao localizar o Stacker no cardápio; repetição isolada mobile com um worker: **3/3 aprovadas**, sem concluir causa. A execução ampla não foi repetida após a correção e não é declarada verde. Logs preservados nas evidências. Os dois revisores conferiram também `945cda2`: zero novos achados.


