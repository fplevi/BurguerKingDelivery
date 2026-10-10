# 02: Carrinho como tela própria em `#carrinho` (tracer bullet)

**What to build:** o modal do carrinho sai; o botão Carrinho leva à rota `#carrinho` na mesma página, com o cabeçalho igual e nenhuma categoria sublinhada. A tela tem "Voltar ao cardápio", "Seu carrinho", subtítulo ("N itens no carrinho" ou "U unidades em N itens"), a lista de Itens (versão simples por enquanto: foto, nome, Total do item) e o Resumo do carrinho ("Total dos itens", "Entrega calculada na próxima etapa.", "Continuar" sem ação ainda, "Adicionar mais itens"). Estado vazio do Figma 07 com "Explorar cardápio". Os três botões de volta e o Voltar do navegador levam à última categoria vista com seu estado. Depois de adicionar, o cliente continua no cardápio. Carrinho só em memória. Spec: `.scratch/carrinho/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `#carrinho` abre a tela; sem diálogo modal
- [ ] Subtítulo itens/unidades; contador do cabeçalho em unidades
- [ ] Resumo do carrinho com Total dos itens
- [ ] Estado vazio
- [ ] Voltar (botões e navegador) mantém a categoria e seu estado
- [ ] Testes Playwright atualizados (os que usavam o modal mudam)
