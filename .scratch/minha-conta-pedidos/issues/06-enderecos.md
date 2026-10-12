# 06: Endereços em Minha conta

**What to build:** a seção Endereços (telas 12–14): cards, adicionar e editar pelo fluxo de endereço de hoje, remover com confirmação e estado vazio. Remover o Endereço de entrega atual o limpa.

Spec: `.scratch/minha-conta-pedidos/spec.md`.

**Blocked by:** 04, 02

**Status:** resolved

- [x] Lista de Endereços salvos
- [x] Adicionar e editar
- [x] Remover com confirmação e toast
- [x] Remover o Endereço de entrega atual o limpa
- [x] Estado vazio
- [x] Testes Playwright

## Answer

**Lista** (`#conta/enderecos`, `addresses` em `prototype/src/account.js`): um card por Endereço salvo (rótulo, rua, bairro e cidade, complemento e referência) com "Editar endereço" e "Remover endereço" (classe `.danger`: vermelho, sem fundo nem borda), e "Adicionar endereço". Sem endereços, "Nenhum endereço salvo".

**Adicionar e editar** usam as páginas de endereço de sempre: a entrada no histórico ganha `addressBack: 'conta'` (sem indicador de etapas, título "Endereços", "Voltar aos endereços"); salvar e voltar retornam a `#conta/enderecos` por cima das páginas de endereço. Adicionar começa direto na Busca.

**Remover** (`#conta/remover-endereco`, com `addressTarget`): "Casa · Av. Paulista, 1578", "Remover endereço" ou "Manter endereço" (Voltar). Remove com `addressRemove` (o mesmo do Checkout, que limpa o Endereço de entrega em uso) e `location.replace` para a lista; com o Carrinho travado, o endereço em uso fica e um toast explica.

**Divergência do Figma:** a tela 13 ("Dados do endereço", com Identificação, CEP e Cidade/UF) não foi seguida: a spec decidiu reaproveitar o fluxo de busca, mapa e Dados de entrega.

**Testes:** `tests/conta-enderecos.spec.js` (6 cenários × 2 projetos); capturas `capturas/06-*.png`. Suíte completa: 462 passando.
