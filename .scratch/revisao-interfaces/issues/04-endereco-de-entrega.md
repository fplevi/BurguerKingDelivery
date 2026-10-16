# 04: Endereço de entrega com navegação, menus e feedbacks padronizados

Status: resolved
Type: task
Blocked by: 01

**What to build:** buscar, escolher, editar e remover endereços funciona com a apresentação revisada, tanto fora quanto dentro do Checkout.

- [x] Revisar estados de busca, mapa, formulário, lista/histórico, erro e confirmação já implementados, em web/mobile.
- [x] Aplicar body/header, tokens, fontes e ícones, com apenas um Voltar onde existente e destino correto para cada contexto.
- [x] No web, ancorar o menu ao endereço sem esconder header/lista ou escurecer a página como modal; preservar os painéis móveis de ação e confirmação.
- [x] Usar toast nos sucessos existentes, sem duplicação em banners/textos soltos e sem encobrir barras fixas.
- [x] Preservar a escolha de Endereço de entrega sem Identificação e a regra de não gerar mensagem nova para endereço atendido.


## Answer

Implementação registrada nos commits `ae9371e` e `37bc826`. [Matriz e evidências](../matriz.md#ticket-04--endereço-de-entrega), [revisão Standards/Spec](../revisao-04.md).

- Body/header, fontes BK, tokens de espaçamento/cantos e SVGs originais centralizados. Instâncias de Figma consultadas e origem/keys registradas no README de ícones.
- Um único Voltar com seta vermelha, mantendo retorno contextual e evitando ciclos de visitas antigas pela busca. Menu web ancorado, sem modal nem fundo escuro; atualização por rolagem/redimensionamento e abertura acima quando necessário. Primeiro clique fora do menu preservado.
- Painéis móveis de ações e confirmação de remoção mantidos, com foco modal e cancelamento. Sucessos existentes usam o toast compartilhado, sem duplicação e acima da barra fixa no mobile. Escolha sem Identificação e ausência de mensagem para endereço atendido preservadas.
- **165/165 combinações** de quinze estados em onze larguras de 320 a 1921 px: sem overflow horizontal; fontes carregadas, ícones de 16/24 px, superfícies, retorno, ancoragem, modalidade e posição do toast conferidos. 75 capturas e medidas em `evidencias/endereco/`.
- Build, sintaxe JS e `git diff --check` aprovados. Projeto JavaScript sem script de typecheck. Cobertura funcional final: **80/80 testes aprovados**, web/mobile.
- A rodada funcional inicial detectou a navegação cíclica e seletores que precisavam distinguir a confirmação da lista ao fundo; corrigidos. Outra rodada com artefatos concorrentes teve conflitos de traces, timeout e expectativa antiga do destino de retorno. Expectativa ajustada ao contexto de origem; rodada final isolada aprovada.
- A primeira execução ampla foi interrompida após detectar que a pasta temporária do runner focado provocava recargas do Vite; não tratada como prova de regressão nem como aprovação. Uma segunda execução no checkout compartilhado também foi interrompida ao detectar alterações concorrentes em `art.js`, `ingredients.js`, `burger-scene.js` e `layer-models.js`, coincidentes com falhas do Stacker. Nenhuma dessas rodadas aprova ou reprova o commit desta entrega. A execução final usa uma cópia isolada do commit `37bc826`, com as dependências locais já instaladas.
- Revisão paralela: **Standards 0, Spec 0 achados restantes**, incluindo reavaliação do fechamento/posição do menu e do toast compartilhado. A observação inicial de perda do primeiro clique foi corrigida e verificada no coletor.

**Suíte completa isolada do commit `37bc826`: 669 aprovados, 39 ignorados, zero falhas (16,3 minutos).** Inclui os casos do Stacker que falharam no checkout compartilhado. Não valida as alterações 3D concorrentes posteriores a esse commit. Concluído em 15/10/2026.
