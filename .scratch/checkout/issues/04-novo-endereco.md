# 04: Buscar, confirmar no mapa e salvar um novo endereço

**What to build:**
- **Busca** (`#endereco/buscar`, Figma 02/13/14) com as situações fixas: "paulista", "augusta", "estrada do campo" (fora da região, Figma 12, com "Escolher outro endereço" e "Voltar ao cardápio") e sem resultados.
- **"Usar localização atual"** pela permissão real do navegador: negada → Figma 11, com "Tentar localização novamente"; concedida → Av. Paulista, 1578.
- **Confirmar localização** (`#endereco/confirmar`, Figma 03/15) com o mapa dos tiles estáticos de `prototype/Assets/maps/` (entram no Git com um `SOURCES.md`: OpenStreetMap, ODbL), o marcador fixo no centro e o arraste do mapa em "Ajustar localização no mapa".
- **Dados de entrega** (`#endereco/dados`, Figma 04) com as validações e "Como você quer salvar?". "Salvar endereço" volta à lista com o novo endereço marcado e o toast "Endereço salvo" (Figma 10).

Spec: `.scratch/checkout/spec.md` (Endereço, Situações fixas).

**Blocked by:** 03

**Status:** resolved

- [x] Busca com as quatro situações fixas
- [x] Fora da região impede seguir
- [x] Localização negada e concedida
- [x] Mapa estático com arraste e atribuição do OpenStreetMap
- [x] Dados de entrega com obrigatórios, "sem número" e "sem complemento"
- [x] Salvar endereço com o toast e o endereço marcado
- [x] Testes Playwright (geolocalização pelo contexto do Playwright)

## Answer

**Situações fixas:** `prototype/src/checkout-fixtures.js` ganhou `places` (cada local com `id`, `name`, `street` e `number` separados, para a Rua e o Número dos Dados de entrega, `district`, `city`, `poi` e `served`), `searchPlaces(query)` (sem acentos e sem caixa: "paulista" → MASP, Avenida Paulista, 1578 e Avenida Paulista, 1000; "augusta" → Rua Augusta, 1508; "estrada do campo" → Estrada do Campo, 120, fora da região; nada → sem resultados) e `locatedPlace` (Av. Paulista, 1578). A tabela do README tem as novas linhas.

**Estado:** em `addressReducer` (`prototype/src/state.js`): `addressPage` (`lista`, `buscar`, `confirmar` ou `dados`, vindo de `#endereco/<página>` pela ação `category`), `addressQuery`, `locateError`, `addressPlace` (o local com `pan`, o deslocamento do mapa em px) e `addressDraft`/`addressErrors` dos Dados de entrega, com as ações `addressQuery`, `addressChoose`, `addressLocated`, `addressLocateFailed`, `addressLocateReset`, `addressPan` e `addressSave`. Salvar acrescenta um Endereço salvo `novo-N` no formato do ticket 03 (`street` "Rua, Número" ou "Rua, s/n", cidade do local), marca-o (`addressPick`) e limpa o local e a busca.

**Tela:** `addressFlow(state)` em `prototype/src/checkout.js` escolhe a página: Seus endereços (ou Localização indisponível, Figma 11), Busca, Confirmar localização (ou Fora da região, Figma 12) e Dados de entrega. O mapa (`staticMap`) monta os 4 tiles 2 × 2 importados pelo Vite, com o marcador fixo no centro, "A entrega será aqui?", "Centralizar no endereço" e o link "© OpenStreetMap contributors". Em Confirmar localização ele é arrastável (ponteiro, ou setas com o foco nele; `role="application"`), sem passar das bordas dos tiles (o marcador fica a 64 px dentro deles), e o endereço textual não muda; nos Dados de entrega é só uma prévia com o mesmo deslocamento. `index.html` ganhou o botão "Voltar" acima de "Voltar ao checkout", escondido em Seus endereços.

**Navegação (`prototype/src/main.js`):** cada página do fluxo guarda no histórico `addressBack` (o da lista, ticket 03) e `depth` (quantas páginas de endereço vêm antes dela). "Voltar", "Ajustar localização no mapa" e "Escolher outro endereço" voltam uma entrada; "Voltar ao checkout" e "Salvar endereço" voltam por cima de todas (`history.go`), então o Voltar do navegador nunca reabre um formulário já salvo. Guardas: `#endereco/confirmar` sem local e `#endereco/dados` sem local atendido levam à Busca; `#endereco/<outra coisa>`, a Seus endereços; as do ticket 03 valem para todas as páginas. A Busca recebe o foco no campo (Figma 13); as outras, no título.

**Decisões fora da letra da spec:**
- O toast é "Endereço salvo e selecionado.", o texto do Figma 10 (a spec diz "Endereço salvo").
- "Ajustar localização no mapa" é o link dos Dados de entrega (Figma 04) que volta a Confirmar localização; o arraste fica no mapa de Confirmar localização, como diz a dica "Arraste o mapa para ajustar o local." (Figma 03/15).
- "Buscar pelo mapa" (Figma 02/13/14) e "Escolher no mapa" (Figma 11) abrem Confirmar localização na Av. Paulista, 1578, o único lugar que os tiles mostram. "Resultados fornecidos pelo Google" não aparece (não há busca real).
- Localização indisponível fica na própria `#endereco` (sem rota nova); "Usar endereço salvo" (Figma 11) volta à lista e só aparece com Endereços salvos; "Voltar" ali faz o mesmo.
- Fora da região é o conteúdo de `#endereco/confirmar` para um local não atendido, sem "Confirmar localização".
- O Complemento é opcional (sem * no Figma 04); "Endereço sem complemento", como "Endereço sem número", esvazia e desabilita o campo. Os erros, sem texto no Figma, são "Informe a rua.", "Informe o bairro." e "Informe o número ou marque Endereço sem número.", ao tocar em Salvar, com o foco no primeiro campo inválido. Os campos começam pela Rua, Bairro e Número do local; Casa vem marcada.
- O marcador fica no centro do mosaico (x 256), e não sobre o Cidade Matarazzo como no Figma, para que o mapa de 512 px de largura do desktop não mostre bordas; a área do mapa vai até 512 px de largura.
- O rodapé fixo das ações no celular fica para o ticket 09.

**Testes:** `prototype/tests/novo-endereco.spec.js` (12 testes, em 1280 e 390): Busca "paulista" até Confirmar localização com o mapa e a atribuição; Busca vazia com o foco, "augusta" e sem resultados; "estrada do campo" fora da região sem chegar aos Dados de entrega, com Escolher outro endereço e Voltar ao cardápio; localização negada (`clearPermissions`) e concedida (`grantPermissions` + `setGeolocation` em Brasília) com Tentar localização novamente; Usar endereço salvo e o Novo cliente sem ele; arraste do mapa pelo ponteiro e pelas setas e Centralizar no endereço; Dados de entrega com os obrigatórios; "sem número" e "sem complemento" salvos como Trabalho até a lista marcada, o toast e o Pagamento; o primeiro endereço do Novo cliente; Voltar e Ajustar localização no mapa; Voltar ao checkout de volta à entrada do Pagamento; guardas. Helpers em `tests/support.js` (`paginaDeEndereco`, `irAosEnderecos`, `buscarEndereco`, `resultadosDaBusca`). Capturas de revisão em `.scratch/checkout/capturas/04-{busca,busca-sem-resultados,confirmar,localizacao-ajustada,fora-da-regiao,localizacao-indisponivel,dados-de-entrega-erro,endereco-salvo}-{desktop,mobile-390}.png`.
