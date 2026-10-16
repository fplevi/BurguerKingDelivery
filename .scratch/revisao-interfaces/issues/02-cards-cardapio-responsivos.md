# 02: Cards do Cardápio sem cortes nas resoluções suportadas

Status: resolved
Type: task
Blocked by: 01

**What to build:** o cliente consegue ver o produto inteiro e ler as informações de todos os cards ao redimensionar a janela, em todas as categorias implementadas.

- [x] Reproduzir e registrar as larguras em que aparecem fotos cortadas ou nomes incompletos; diferenciar recorte do produto de enquadramento de margens vazias.
- [x] Corrigir ajuste das imagens, crescimento dos cards e transições de coluna sem esticar fotos, esconder informações, reduzir fonte para caber ou introduzir rolagem horizontal da página.
- [x] Aplicar os tokens, fontes, cantos e ícones aos cards e seus estados selecionado/não selecionado.
- [x] Conferir 320, 360, 390, 768, 1280 e 1920 px, além de 1023/1024/1025 e 1919/1920/1921 px; incluir nomes longos de todas as categorias quando existirem.
- [x] Verificar seleção, carregamento e conteúdo integralmente visível; a presença de texto no DOM ou uma imagem carregada não é aceite suficiente.

## Answer

Implementado em 15/10/2026. [Matriz e reprodução por largura](../matriz.md#ticket-02--cards), [medidas anteriores](../evidencias/cards-antes/medidas.json), [medidas finais](../evidencias/cards-depois/medidas.json) e [revisão em dois eixos](../revisao-02.md).

- Fotos de hambúrguer recortadas/sobrepostas ao nome reproduzidas nas 11 larguras originalmente exigidas. Nomes permaneciam no DOM; o defeito observado foi de enquadramento e sobreposição. Os recortes das demais categorias preservavam os produtos; o overflow em Acompanhamentos (320/360/390) e Sobremesas (320/360) vinha do título do hero sem quebra.
- Fotos inteiras, sem zoom nem distorção, reaproveitando `photo-crop` para enquadrar apenas a área desenhada dos arquivos. Os oito hambúrgueres têm caixas de enquadramento com margem adicional; nenhum produto toca a borda do arquivo de origem.
- Cards com altura livre, imagem e texto em áreas separadas, nomes sem clamp e sem fonte reduzida. Selo em linha própria, Crown original do Figma em 16 px, tokens de espaçamento/cantos e fontes BK. Selecionar não desloca o conteúdo.
- Grade de uma coluna abaixo de 360, duas até 1023, quatro até 1919 e duas na lateral a partir de 1920. Incluída a nova transição em 359/360/361.
- **52/52 verificações aprovadas**, quatro categorias em 13 larguras: 320, 359, 360, 361, 390, 768, 1023/1024/1025, 1280 e 1919/1920/1921. São 403 cards e 52 seleções do produto com nome mais longo de cada categoria. Fontes carregadas, imagens decodificadas, produto contido na área da foto, nomes integrais e overflow horizontal zero. Capturas gerais e dos nomes longos selecionados disponíveis na pasta de evidências; inspeção visual complementa as medidas.
- Build, sintaxe dos arquivos JS alterados e `git diff --check` aprovados. Não existe script de typecheck neste projeto JavaScript.
- Rodada focada final de `categorias.spec.js` e `layout.spec.js`: **32 aprovados, 8 ignorados**. Rodada focada anterior: 31 aprovados, 8 ignorados e uma falha na comparação binária de PNG em `categorias.spec.js:169`; repetição isolada aprovada, seguida da rodada final aprovada.
- Suíte completa `npm test`: **622 aprovados, 39 ignorados, 5 falhas**, em 20 minutos. Falhas desktop em `categorias.spec.js:147`, `pedido.spec.js:140` (seletores ajustados), `checkout.spec.js:41` (abertura de Ver ingredientes), `entregar-em.spec.js:35` e `:56` (artefatos de trace ausentes). Todos esses casos têm execução posterior aprovada nas rodadas focadas. A rodada completa original permanece vermelha; não foi executada uma segunda suíte completa. A repetição de Checkout aprovada não comprova a causa da falha original.
- Dois testes antigos precisaram distinguir a foto do novo ícone Crown: seletores ajustados em `categorias.spec.js` e `pedido.spec.js`. Repetições dos casos de Checkout, endereço e fotos que falharam na rodada ampla: **8 aprovadas**. Duas falhas de endereço na rodada ampla foram erros de arquivos de trace ausentes durante concorrência de runners no mesmo diretório de artefatos; repetições usaram diretório separado.
- Revisão Standards: 0 achados; Spec: 0 achados, incluindo o complemento de cobertura dos nomes longos. Commits de implementação/verificação: `8a12747`, `78b4598`, `5fa9954`.
