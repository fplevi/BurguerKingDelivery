# Proposta de divisão em tickets

Divisão aprovada e publicada em nove arquivos na pasta issues. Base: [spec consolidada](spec.md). Cada ticket incluirá implementação, conferência visual e regressões relevantes do seu fluxo.

## 01 — Padrões compartilhados demonstrados no Cardápio

**Blocked by:** nenhum.

**Entrega:** header e controles de compra do Cardápio usando fontes, tokens e ícones coerentes com o Figma, com uma base reutilizável para a migração dos demais fluxos.

- Inventariar as famílias de telas/estados existentes e mapear suas referências ativas do Figma; registrar a matriz de revisão que os demais tickets completarão.
- Confirmar os símbolos compartilhados com os componentes da biblioteca Icons e suas variantes; documentar origem e centralizar os SVGs exatos quando não houver pacote de origem comprovado.
- Introduzir os padrões de espaçamento, cantos, superfícies e tipografia de forma compatível com os fluxos ainda não migrados. Não eliminar os caminhos antigos enquanto houver consumidores.
- Demonstrar no header e nos controles de compra do Cardápio ícones na escala com mínimo de 16 px, fontes BK efetivamente carregadas e interação preservada em web e mobile.
- Não remodelar as Camadas do hambúrguer, mudar regras do pedido ou redesenhar superfícies específicas do Cardápio.

## 02 — Cards do Cardápio sem cortes nas resoluções suportadas

**Blocked by:** 01.

**Entrega:** o cliente consegue ver o produto inteiro e ler as informações de todos os cards ao redimensionar a janela, em todas as categorias implementadas.

- Reproduzir e registrar as larguras em que aparecem fotos cortadas ou nomes incompletos; diferenciar recorte do produto de enquadramento de margens vazias.
- Corrigir ajuste das imagens, crescimento dos cards e transições de coluna sem esticar fotos, esconder informações, reduzir fonte para caber ou introduzir rolagem horizontal da página.
- Aplicar os tokens, fontes, cantos e ícones aos cards e seus estados selecionado/não selecionado.
- Conferir 320, 360, 390, 768, 1280 e 1920 px, além de 1023/1024/1025 e 1919/1920/1921 px; incluir nomes longos de todas as categorias quando existirem.
- Verificar seleção, carregamento e conteúdo integralmente visível; a presença de texto no DOM ou uma imagem carregada não é aceite suficiente.

## 03 — Ver ingredientes consistente em web e mobile

**Blocked by:** 01.

**Entrega:** o cliente consegue personalizar o Item com controles, textos e disposição coerentes com o Figma em desktop, tablet e celular.

- Revisar header, Bandeja, seleção dos ingredientes, ações e estados do fluxo quanto a tokens, fontes, ícones e responsividade.
- Aplicar o padrão de Voltar somente onde esse retorno já existe na referência; preservar as ações próprias de aplicar/cancelar.
- Preservar Personalização, ingredientes não removíveis, acessibilidade dos controles e funcionamento da cena 3D.
- Conferir as referências web/mobile e larguras intermediárias, incluindo barras fixas e ausência de cortes ou sobreposições dos controles.

## 04 — Endereço de entrega com navegação, menus e feedbacks padronizados

**Blocked by:** 01.

**Entrega:** buscar, escolher, editar e remover endereços funciona com a apresentação revisada, tanto fora quanto dentro do Checkout.

- Revisar estados de busca, mapa, formulário, lista/histórico, erro e confirmação já implementados, em web/mobile.
- Aplicar body/header, tokens, fontes e ícones, com apenas um Voltar onde existente e destino correto para cada contexto.
- No web, ancorar o menu ao endereço sem esconder header/lista ou escurecer a página como modal; preservar os painéis móveis de ação e confirmação.
- Usar toast nos sucessos existentes, sem duplicação em banners/textos soltos e sem encobrir barras fixas.
- Preservar a escolha de Endereço de entrega sem Identificação e a regra de não gerar mensagem nova para endereço atendido.

## 05 — Carrinho consistente, incluindo item removido e Desfazer

**Blocked by:** 01.

**Entrega:** revisar Itens, escolher Bebida do combo, alterar quantidades e remover/desfazer mantém o padrão visual em todos os estados já existentes.

- Revisar cards, seletores, quantidades, Resumo do carrinho, erro, estado vazio, header e total fixo mobile com os tokens/fontes/ícones corretos.
- Preservar valores, Combo, Personalização e regras de quantidade.
- Padronizar Voltar e a separação de body/header.
- Converter feedbacks transitórios para toast, mantendo Desfazer funcional, mensagem completa e posicionamento acima da barra fixa.
- Conferir web/mobile e larguras intermediárias com evidência dos estados relevantes.

## 06 — Checkout e Código de confirmação no padrão revisado

**Blocked by:** 01, 04.

**Entrega:** Identificação e Pagamento do Checkout usam a apresentação revisada, mantendo a etapa Endereço já padronizada pelo ticket 04.

- Revisar todas as etapas e estados implementados, Resumo do pedido, indicadores de progresso e ações fixas, usando tokens, fontes e ícones do Figma.
- Retirar fechar de Identifique-se e padronizar Voltar sem alterar os destinos de navegação.
- Implementar o padrão reutilizável do Código de confirmação: Alterar celular abaixo da mensagem e confirmar/SMS/reenviar empilhados, preservando erros, reenvios, canais e disponibilidade das ações.
- Usar os toasts previstos e preservar Pix, cartão, totais, erros de validação e regras do pedido.
- Demonstrar o percurso de Identificação até a conclusão, com conferência visual web/mobile e regressões relevantes.

## 07 — Minha conta com edição, autenticação e feedbacks consistentes

**Blocked by:** 01, 04, 06.

**Entrega:** Identificar-se e gerenciar Dados pessoais, celular, Endereços salvos e cartões na Minha conta segue os mesmos padrões dos fluxos já migrados.

- Reutilizar o padrão do Código de confirmação do ticket 06, inclusive na confirmação do novo celular; manter Identifique-se sem fechar.
- Revisar navegação, formulários, listas, confirmações e estados vazios quanto a fontes, tokens, ícones, body/header e Voltar.
- Conferir a reutilização das ações de endereço padronizadas no ticket 04 e preservar seus destinos no contexto da conta.
- Usar toasts nos sucessos já existentes de dados, celular e endereços, sem duplicação ou mudança das regras de persistência.
- Preservar formas de pagamento e comportamento de Sair. Conferir web/mobile e larguras intermediárias.

## 08 — Pedidos confirmados e acompanhamento com apresentação consistente

**Blocked by:** 01.

**Entrega:** consultar a lista de Pedidos confirmados e acompanhar sua Situação do pedido mantém legibilidade, navegação e identidade visual em todos os estados já implementados.

- Revisar lista, detalhes, acompanhamento, estados vazios, pedido entregue/cancelado, header e controles conforme o Figma.
- Aplicar fontes BK, tokens, cantos e ícones corretos e o padrão de Voltar onde existente.
- Preservar os marcadores ilustrados aprovados dos mapas; não substituí-los por ícones genéricos nem alterar regras ou dados do acompanhamento.
- Conferir mapas, cards e textos em web/mobile e larguras intermediárias sem recortes ou sobreposições indevidas.

## 09 — Fechar a revisão integrada e retirar padrões obsoletos

**Blocked by:** 02, 03, 04, 05, 06, 07, 08.

**Entrega:** todos os fluxos revisados podem ser navegados em sequência com padrões consistentes, evidências consolidadas e sem regressões entre as migrações.

- Completar a matriz de telas/estados, inventário de ícones e registro de tipografia, com referências Figma, viewports e resultados verificáveis.
- Auditar referências restantes a ícones/fontes/tokens antigos e eliminar mecanismos obsoletos somente quando não houver consumidores.
- Conferir percursos cruzados entre Cardápio, Ver ingredientes, Endereço de entrega, Carrinho, Checkout e Minha conta/Pedidos, preservando estados e regras de negócio.
- Executar verificações automatizadas adequadas e consolidar capturas representativas antes/depois; não depender apenas de presença no DOM nem exigir igualdade pixel a pixel de fontes.
- Resolver divergências residuais dentro da spec e registrar explicitamente limitações ou problemas fora do escopo.

## Dependências

01 prepara e demonstra a base compartilhada. 02, 03, 04, 05 e 08 podem avançar independentemente após 01. 06 depende da migração de Endereço de entrega em 04. 07 depende dos padrões de endereço e autenticação já migrados em 04 e 06. 09 integra todos os resultados.

Divisão aprovada pelo usuário; nove tickets publicados no tracker local com Status: ready-for-agent.
