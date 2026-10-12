# 05: Endereços de pedidos anteriores, editar e remover

**What to build:**
- **Endereços de pedidos anteriores** (`#endereco/anteriores`, Figma 05): escolher um volta à lista com ele selecionado (Figma 17).
- **Menu ⋮** de cada Endereço salvo (Figma 06):
  - Editar (Figma 07): mesmo formulário dos Dados de entrega, preenchido; editar o endereço em uso já vale para o Checkout.
  - Remover (Figma 08): confirmação e depois o toast "Endereço removido" (Figma 09). Remover o endereço marcado deixa nenhum marcado e desabilita "Entregar neste endereço".

Spec: `.scratch/checkout/spec.md` (Endereço).

**Blocked by:** 04

**Status:** resolved

- [x] Endereços de pedidos anteriores selecionáveis
- [x] Menu ⋮ acessível pelo teclado
- [x] Editar, inclusive o endereço em uso
- [x] Remover com confirmação e toast, inclusive o endereço marcado
- [x] Testes Playwright

## Answer

**Situações fixas:** `prototype/src/checkout-fixtures.js` ganhou `previousAddresses` (Figma Endereço 05: Rua dos Pinheiros, 870, Alameda Santos, 960 e Rua Oscar Freire, 1200, no formato dos Endereços salvos sem `label` e com `lastOrder`, "5 de outubro"…), no perfil dos dois Clientes cadastrados (`customer.previous`); o Novo cliente não tem nenhum. Tabela do README atualizada.

**Estado (`addressReducer`, `prototype/src/state.js`):** `addressPrevious` (o Endereço de pedido anterior escolhido, com o rótulo "Pedido anterior"), `addressMenu` (o id do Endereço salvo com o menu ⋮ aberto; mudar de página fecha) e `addressTarget` (o Endereço salvo em edição ou remoção, limpo depois de salvar ou remover), com as ações `addressPrevious`, `addressMenu`, `addressManage`, `addressUpdate` (mesma validação dos Dados de entrega, `draftAddress` compartilhado com `addressSave`, mesmo id, então o Checkout que usa o endereço já mostra a alteração) e `addressRemove` (tira o endereço e anula `addressPick` e `delivery` quando eram ele). `savedAddress(s, id)` também encontra o Endereço de pedido anterior escolhido, para "Entregar neste endereço" e o cartão do Checkout.

**Telas (`prototype/src/checkout.js`):** `previousList` (`#endereco/anteriores`: "Pedidos anteriores", "Escolha um endereço que você já usou." e uma lista de botões), o botão ⋮ de cada Endereço salvo (`data-address-more`, "Opções do endereço Casa", `aria-haspopup="dialog"`, fora do rótulo do rádio), o diálogo `addressMenu` (Figma 06), `addressEdit` (`#endereco/editar`: `addressDetails` com o título "Editar endereço", os campos preenchidos, a rua separada de volta em Rua e Número, "s/n" como Endereço sem número, e "Salvar alterações") e `addressRemove` (`#endereco/remover`, Figma 08).

**Navegação (`prototype/src/main.js`):** o diálogo é um `<dialog>` aberto com `showModal()` depois de cada render (foco na primeira opção, o resto da página inerte); Esc (`cancel`) ou um clique no fundo fecham e devolvem o foco ao ⋮. Escolher um Endereço de pedido anterior, "Salvar alterações" e "Remover endereço" voltam no histórico até Seus endereços (`toList`, o mesmo caminho de "Salvar endereço"); "Voltar" e "Cancelar", uma entrada. Guardas: `#endereco/anteriores` do Novo cliente e `#endereco/editar` ou `/remover` sem um Endereço salvo escolhido no menu levam a `#endereco` (então o Avançar do navegador não reabre um formulário já salvo nem a remoção de um endereço removido).

**Decisões fora da letra da spec:**
- O Endereço de pedido anterior escolhido aparece no topo de Seus endereços como "Pedido anterior" (Figma 17), com o ícone de relógio e sem o menu ⋮: pelo GLOSSARY ele não é um Endereço salvo, então não há o que editar ou remover. Escolher outro substitui o anterior. Pelo mesmo motivo, os ⋮ dos cartões do Figma 05 não entram.
- Editar e Remover ganharam rotas próprias (`#endereco/editar` e `#endereco/remover`), como as outras páginas do fluxo, com "Voltar" (o Figma 07/08 mostra o botão).
- Em Editar endereço, o mapa é só a prévia dos tiles, sem "Ajustar localização no mapa": um Endereço salvo não guarda o ponto no mapa e os tiles só mostram a Av. Paulista.
- Editar não mostra toast (o Figma não tem); o endereço marcado continua o mesmo. O toast de remover é "Endereço removido.", o texto do Figma 09.
- Remover endereço mantém o indicador de etapas, como as outras páginas do fluxo (o Figma 08 não o mostra).
- Remover o endereço em uso também o tira do Checkout: `#checkout` volta a pedir um endereço.

**Testes:** `prototype/tests/gerenciar-enderecos.spec.js` (7 testes, em 1280 e 390): Endereços de pedidos anteriores até o Pagamento e o Voltar do navegador; a guarda do Novo cliente; o menu ⋮ pelo teclado (Enter, foco nas opções, Tab, Esc devolve o foco); Editar o endereço em uso (formulário preenchido, obrigatório, alteração no Checkout); Voltar sem salvar, "sem número" e Favoritos, Avançar sem reabrir; Remover o marcado (confirmação, Cancelar, toast, nenhum marcado, Entregar desabilitado até escolher outro, Avançar); remover o endereço em uso. Helpers em `tests/support.js` (`enderecosSalvos`, `menuDoEndereco`). Capturas em `.scratch/checkout/capturas/05-{pedidos-anteriores,pedido-anterior-selecionado,menu,editar,remover,endereco-removido}-{desktop,mobile-390}.png`.
