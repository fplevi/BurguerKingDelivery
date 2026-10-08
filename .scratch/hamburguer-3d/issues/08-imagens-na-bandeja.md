# 08: Imagens dos ingredientes retirados na bandeja

**What to build:** cada ingrediente retirado aparece na bandeja como imagem do próprio ingrediente, gerada pela cena com a mesma luz e câmera; tocar a imagem recoloca o ingrediente. Os chips continuam funcionando. Funciona já com as formas simples e herda o realismo das camadas automaticamente.

**Blocked by:** 03.

**Status:** resolved

- [x] Ao retirar, a imagem do ingrediente aparece na bandeja
- [x] Imagem é um botão acessível "Recolocar <ingrediente>", por toque e teclado
- [x] Recolocar pela imagem ou pelo chip mantém ambos sincronizados
- [x] Recolocar todos esvazia a bandeja; cancelar descarta o rascunho
- [x] No fallback SVG, a bandeja mostra a ilustração SVG do ingrediente
- [x] Testes Playwright para retirar e recolocar pela bandeja

## Answer

- Cena: `snapshot(id, { width, height })` devolve um PNG (data URL) da camada sozinha, mesmo retirada, com a mesma luz e a mesma elevação de câmera, fundo transparente e enquadramento pela largura da camada. A imagem é desenhada num canto do canvas do próprio palco e copiada na mesma tarefa: não pisca e não cria outro contexto WebGL. Devolve `null` se o palco não tiver tamanho.
- Página: a bandeja ganhou a lista "Ingredientes retirados" (`<ul>` rotulada pelo título), na ordem de retirada. Cada item é um botão "Recolocar <ingrediente>" com a imagem e o nome. As imagens ficam em cache por id. Sem WebGL, o botão mostra a ilustração SVG do ingrediente.
- Recolocar pela imagem: o foco vai para o próximo item da bandeja; se ela esvaziar, vai para o chip do ingrediente. Chips e bandeja leem o mesmo estado, então ficam sempre sincronizados. Recolocar todos esvazia a bandeja; cancelar descarta o rascunho; ao reabrir, a personalização aplicada volta para a bandeja.
- Textos: a instrução do topo e a mensagem da bandeja passaram a citar o toque na bandeja para recolocar.
- Os chips agora ficam num grupo rotulado "Personalize seu Whopper". O helper `chip` dos testes procura dentro dele, porque o nome "Recolocar X" passou a existir duas vezes (chip e imagem).
- `tests/bandeja.spec.js`: imagem aparece ao retirar (e carrega de fato); recolocar pela imagem com toque e teclado, com foco; recolocar pelo chip tira a imagem; Recolocar todos e cancelar; personalização aplicada reaparece; fallback SVG. 60 testes verdes.
- Ressalva: as imagens são pequenas (60 × 36 px) para caberem sete itens sem empurrar os chips para baixo do rodapé no desktop. Com as camadas simples atuais, cebola e maionese ficam pouco legíveis; isso melhora com os tickets 06 e 07.
