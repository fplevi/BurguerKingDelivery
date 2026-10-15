# Revisão do ticket 05

Base: `6804141c1e2fc4958de3c223724ed07e3a14b3bb`. Escopo: Carrinho, coletor de evidências e nomes acessíveis de navegação nos testes. Alterações locais anteriores no renderizador 3D, receitas e documentação de hambúrgueres foram excluídas do diff revisado e do commit.

## Standards

Revisão independente com a skill code-review: nenhuma violação documentada ou smell relevante. Nomenclatura de GLOSSARY.md preservada; estilos concentrados na folha do Carrinho; SVGs originais reaproveitados sem nova biblioteca. **0 achados.**

## Spec

A primeira revisão apontou risco de sobreposição do toast quando um total alto faz a barra mobile crescer. Corrigido com ResizeObserver: o posicionamento do toast e a reserva no fim da página usam a altura real da barra, inclusive após mudança de largura. Quantidade 99 incluída na coleta.

A revisão final não encontrou novos problemas. A classe específica de remoção preserva o aviso permanente do carrinho travado; Desfazer mantém a posição, configuração e ciclo de encerramento existentes. **0 achados restantes.**

A inspeção visual também corrigiu a sobreposição de um toast anterior de Adicionado ao carrinho e a quebra dos centavos em 320 px. Abaixo de 360 px, o Total do item ocupa uma linha própria, sem reduzir a fonte.

Validação: 168 combinações de estado/largura aprovadas na coleta final; suíte completa no build com 669 aprovados, 39 ignorados e nenhuma falha. Build e sintaxe JS aprovados. Não há script de typecheck no projeto. A última regra CSS abaixo de 360 px foi conferida na coleta final, incluindo 358/359/360/361 px.
