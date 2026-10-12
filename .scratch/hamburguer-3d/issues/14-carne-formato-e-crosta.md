# 14: Formato e crosta da carne; cheddar gosmento

**What to build:** a carne do Whopper e do Cheddar Duplo parece um "travesseiro": a quina é arredondada, o topo abaulado e a lateral não tem textura própria (recebe a borda da imagem de cima esticada), então não mostra crosta nem marcas de grelha. Deixar o perfil e a textura mais próximos das fotos `prototype/Assets/burgers/official/site_Whopper.png` e `site_Cheddar_Duplo.png`.

**Blocked by:** 13.

**Status:** needs-info

## Decisões (sessão de grilling, 2026-10-12)

- Um modelo só, que vale para o Whopper, para as duas carnes do Cheddar Duplo e para qualquer hambúrguer futuro.
- Perfil: quina de raio ~0,02 (era 0,07); topo e fundo planos, só com os caroços; lateral quase vertical (abaulada no máximo ~0,01), com relevo áspero de crosta. O contorno visto de cima fica como está.
- Espessura de 0,19 para ~0,16. O raio continua 1,05.
- Lateral com textura própria: crosta marrom-tostada média (~`#55301c`), caroços mais escuros (~`#2d190f`) só nos relevos e recuos mais claros (~`#784b2d`), sem preto. As marcas de grelha dobram a quina e descem um pouco.
- Cima e baixo: mantêm as 9 marcas, com tom mais escuro, mais relevo de farelo e pontos de brilho de gordura.
- Cheddar Duplo: a carne de cima gira em relação à de baixo, para não ficarem iguais (pedido durante o trabalho).
- Cheddar (pedido durante o trabalho, decidido em nova rodada): massa derretida em vez de disco. Cobre ~75–85% do topo; o contorno transborda e escorre só em alguns trechos e recua para dentro da borda no resto; 2–4 buracos irregulares (raio de ~0,1 a 0,2) mostram a carne; 3–5 escorridos por camada, com formas suaves; miolo fino (~0,03) e um cordão mais gordo nas bordas e em volta dos buracos. Cada cheddar tem seu próprio formato. O fallback SVG ganha contorno irregular e dois buracos.

## Critérios

- [x] Perfil, espessura e textura da carne conforme as decisões
- [x] Cheddar gosmento conforme as decisões, com os escorridos dentro da altura da carne
- [x] Capturas dos dois produtos (desktop e 390 × 844, montado e aberto) ao lado das fotos
- [x] `npm run test:build` verde e `npm run test:orcamento` medido
- [ ] Revisão do responsável pelo produto

## Answer

- **Carne** (`patty()` em `layer-models.js`): perfil novo com faces planas, quina de raio 0,02, lateral quase vertical com relevo de crosta e espessura 0,16. A textura virou um atlas (`meat` em `texture-recipes.js`, `MEAT_FACE_UV = 0.4`): as duas faces usam o disco do meio e a lateral usa o anel em volta. Na lateral há crosta marrom-tostada, caroços mais escuros, recuos mais claros, faixas tostadas junto às duas quinas e as marcas das faces descendo um pouco. As faces ficaram mais escuras, com mais relevo e com pontos de brilho. `revolve()` passou a dar ao `uv` o índice do perfil.
- **Carne girada**: uma Camada pode girar o seu modelo (`turn`, em radianos, na receita; aplicado em `burger-scene.js`). No Cheddar Duplo, `meat2` e `cheddar2` giram 1,9 rad juntos, porque o cheddar segue o contorno da carne dele.
- **Cheddar**: modelo refeito, sem os elementos do anterior (disco, lábio e cortina). Agora é um campo com sinal suave (contorno, escorridos e buracos combinados por união e diferença suaves). Uma grade polar é cortada nesse campo, os vértices da borda são encaixados na linha zero, e a folha é dobrada sobre a borda da carne, com a espessura ao longo da normal. O resultado:
  - miolo de 0,028 e cordão de mais 0,02 nas bordas e em volta dos buracos;
  - o contorno transborda só onde "derramou" e recua no resto;
  - 3–5 escorridos (pescoço e gota, com junções suaves) e 2–4 buracos com sorteio próprio;
  - cada cheddar com o seu formato.
- **Fallback SVG**: cheddar com contorno irregular, dois buracos e quatro escorridos.
- **Altura**: o Whopper perde 0,03 e o Cheddar Duplo ~0,10 (duas carnes mais finas e cheddars de 0,07 → 0,05).
- **Testes**: `npm run test:build` com 506 testes verdes e 38 pulados. `npm run test:orcamento` verde: 151 KB gzip; primeiro quadro em 390 com CPU 4x de 1298 ms de mediana; troca de produto em ~250 ms; 71–76 fps.
- **Capturas** em `.scratch/hamburguer-3d/capturas/14/`: as quatro padrão de cada produto, `whopper-comparacao.png` e `cheddar-comparacao.png` (foto ao lado), `detalhe-carne.png`, `textura-carne.png` (o atlas) e `svg-cheddar-montado.png`.
- **Ressalva**: na câmera padrão, as marcas descendo pela lateral da carne são sutis. Elas aparecem melhor no atlas e de perto.
