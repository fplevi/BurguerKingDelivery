# 03: Três layouts, cabeçalho e grade do Figma

**What to build:** a página de Hambúrgueres segue os três layouts do Figma: < 1024px (`168-4693`), 1024–1919px (`24-183`) e ≥ 1920px (`156-4442`, hero na altura da tela, sem rolagem da página, coluna lateral em 2 colunas com rolagem própria). Cabeçalho com logo, "Entregar em" com seta (só visual), navegação Hambúrgueres / Acompanhamentos / Bebidas / Sobremesas com o ativo sublinhado, carrinho com contador. Grade com selo "Selecionado"; os 6 hambúrgueres sem Receita ficam iguais aos outros, mas clicar não faz nada; "Em breve" sai da grade e do rodapé. 3D continua no hero. Spec: `.scratch/revisao-figma/spec.md`.

**Blocked by:** 01.

**Status:** resolved

- [x] Layout < 1024px na ordem do Figma, grade em 2 colunas, abas roláveis
- [x] Layout 1024–1919px, grade em 4 colunas
- [x] Layout ≥ 1920px, página sem rolagem, coluna lateral com rolagem própria
- [x] Cabeçalho e navegação do Figma
- [x] Selo "Selecionado"; 6 hambúrgueres inertes, sem "Em breve"
- [x] Testes em 390, 1280 e 1920 de largura

## Answer

Página nos três layouts do Figma (`prototype/index.html`, `src/styles.css`, bloco final; `src/main.js`). Cores, tamanhos e espaçamentos vêm do Figma (fundo do hero `#eadbc8`, grade `#f5ebdc`, card `#fbf3e8`, vermelho `#d90000`, marrom `#3f1208`/`#502314`; título 90px em Flame Bold, "Escolha seu hambúrguer" 46px); os tokens novos ficam em `:root`. Os ícones (localização, seta, carrinho, ajustes, coroa) são SVG em linha; o logo é `Assets/Burger_King_2020.svg.webp`.

- **Cabeçalho:** logo, "Entregar em / Av. Paulista, 1578 - Bela Vista" com seta (só visual, um `div`), navegação com Hambúrgueres sublinhado (`aria-current="page"`), carrinho com ícone, contador vermelho e "Carrinho" (nome acessível "Carrinho · N"). Acompanhamentos, Bebidas e Sobremesas ainda mostram o aviso de categoria prevista; o ticket 04 dá as páginas.
- **< 1024px:** uma coluna (título, 3D, Ver ingredientes, descrição, card, grade em 2 colunas); categorias em abas roláveis abaixo do cabeçalho; carrinho só com ícone e contador.
- **1024–1919px:** título e card à esquerda (424px), 3D à direita com Ver ingredientes e descrição abaixo; grade em 4 colunas abaixo do hero.
- **≥ 1920px:** `main` em grade (hero | coluna de 622px) com a altura da tela menos o cabeçalho; a página não rola e a coluna "Escolha seu hambúrguer" (2 colunas) rola sozinha. A nota do protótipo foi para o fim da grade, então rola com a coluna.
- **Hero:** o preço separado saiu (o preço fica só no Total do item); a descrição (texto do ticket 02) foi para baixo de Ver ingredientes. O palco do 3D continua dimensionado pela folha de estilos (520 × 448 no desktop, 100% × 251 no celular).
- **Grade:** selo "Selecionado" com coroa; os 6 hambúrgueres sem Receita têm a mesma aparência e clicar não faz nada (sem aviso); "Em breve" saiu da grade e do rodapé.

Testes: `tests/layout.spec.js` (cabeçalho; 6 hambúrgueres inertes; preço só no Total do item; 390, 1280 e 1920 de largura, cada um conferindo a ordem e as colunas, a falta de rolagem horizontal, o canvas do tamanho do palco e Ver ingredientes abrindo e fechando). O teste "Em breve" de `cheddar-duplo.spec.js` saiu; `card()` em `tests/support.js` e a grade em `pedido.spec.js` não esperam mais "Em breve"; a borda de erro da bebida passou ao vermelho do Figma. Capturas em `.scratch/revisao-figma/capturas/03/` (390 × 844, 1280 × 800, 1920 × 1080, e a página inteira em 390 e 1280).

Em aberto: no celular, a cena do hero reserva espaço acima do hambúrguer montado (o enquadramento `assembled` da cena), então sobra um vão entre o título e o pão; a caixa "Ver ingredientes" (diálogo) manteve o visual laranja, fora do escopo dos layouts.
