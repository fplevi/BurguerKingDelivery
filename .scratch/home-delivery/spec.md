# Conceito inicial: home de delivery Burger King

## Brief confirmado

- Site de delivery com foco nos hambúrgueres; outros produtos podem ter páginas próprias.
- A home funciona como seleção de personagens de videogame: clicar na grade escolhe o hambúrguer apresentado no hero.
- A grade contém todos os hambúrgueres com imagem e nome. Preços e botões de compra ficam exclusivamente no hero.
- Hero com fundo laranja intenso da marca, imagem grande do produto selecionado, nome, descrição e preço.
- Cada hambúrguer tem uma animação própria de entrada, montando o sanduíche ingrediente por ingrediente e simulando profundidade.
- Junto à compra, checkbox “Transformar em combo” e seleção exclusiva de tamanho P, M ou G.
- Imagens apetitosas e experiência leve no desktop e mobile.
- Etapa atual: esboço visual e prompt para o ChatGPT.

## Atualização: referência selecionada e playground

- A segunda imagem enviada foi escolhida como referência próxima da direção desejada: hero laranja, produto em grande escala, compra à esquerda e grade abaixo.
- Ordem confirmada do menu: Hambúrgueres, Batatas, Bebidas, Sobremesas.
- “Remover ingredientes” expande o hero para ocupar a área visível inteira e abre um playground do produto selecionado.
- No playground, o sanduíche abre em camadas identificáveis. O usuário pode remover ingredientes e recolocá-los.
- O resultado deve simular um ambiente tridimensional, priorizando tecnologia e assets leves.
- Proposta de interação: retirar uma camada para uma bandeja lateral/inferior e devolvê-la ao seu encaixe; oferecer também controles por toque e teclado.
- Proposta de confirmação: “Aplicar alterações” salva a personalização e remonta o produto; “Cancelar” restaura a configuração anterior. Essa política precisa de confirmação.
- A personalização confirmada deve acompanhar o item no carrinho, incluindo identificação dos ingredientes removidos.
- Perspectiva limitada confirmada: visão frontal, inclinação e ingredientes separados e arrastáveis, sem rotação livre.
- Ainda decidir: ingredientes removíveis, efeitos da remoção no preço e comportamento ao trocar de produto.

## Plano recomendado para a primeira etapa

1. Validar o efeito com um hambúrguer e suas camadas em um protótipo isolado.
2. Produzir assets transparentes separados, na mesma perspectiva e escala, incluindo partes ocultas que ficam visíveis ao abrir o sanduíche.
3. Testar montagem, abertura, retirada, reposição e fechamento no desktop e no mobile.
4. Avaliar qualidade visual e desempenho antes de produzir todos os produtos.
5. Construir a home responsiva com seleção, combo, personalização e carrinho local.

Recomendação preliminar: React/TypeScript para estado e interface; CSS com perspectiva e Motion para animações e gestos sobre imagens 2D. Se rotação livre for requisito, reconsiderar assets multivista ou geometria 3D simplificada. Uma fotografia única não fornece os lados e o verso dos ingredientes.

Referências técnicas:
- CSS transforms: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transforms
- Motion drag: https://motion.dev/docs/react-drag
- Three.js billboards: https://threejs.org/manual/pages/billboards.html

Conclusões de desempenho ainda dependem de protótipo medido; não há garantia de leveza apenas pela escolha da biblioteca.

## Fluxo

1. Um produto aparece selecionado ao abrir a home.
2. Selecionar outro card atualiza o destaque da grade e as informações do hero.
3. Ingredientes entram em sequência e se acomodam no sanduíche.
4. Marcar combo habilita P, M e G; apenas um tamanho fica ativo.
5. O total acompanha a configuração; adicionar ao carrinho inclui o produto selecionado com essa configuração.

Ainda definir: manter ou reiniciar combo ao trocar de produto, catálogo real, preços e composição dos combos.

## Direção visual

- Cabeçalho compacto: marca, endereço, categorias secundárias e carrinho.
- Hero como palco laranja vivo; informações e compra à esquerda, sanduíche grande à direita no desktop.
- Grade em área clara contrastante, quatro colunas no desktop e duas no mobile como proposta inicial.
- Card ativo com contorno marcante e indicador “Selecionado”.
- Fotografia gastronômica realista, recortes por ingrediente, sobreposição, perspectiva e sombras.
- Mobile reorganiza produto e controles para manter seleção e compra acessíveis.
- Nomes e preços do esboço são ilustrativos.

## Movimento e desempenho

Three.js trabalha com renderização 3D. A intenção será interpretada como profundidade visual com camadas 2D, sem depender de modelos pesados; avaliar CSS e bibliotecas de animação antes de adicionar renderização adicional.

- Entradas variadas: queda com acomodação, deslizamento por camadas ou pequena rotação.
- Terminar cada sequência com o hambúrguer montado e estável.
- Trocas rápidas cancelam a entrada anterior e apresentam a seleção mais recente.
- Priorizar transformações e opacidade, assets otimizados e carregamento sob demanda.
- Respeitar movimento reduzido e oferecer seleção por toque e teclado.
- Validar peso e fluidez em dispositivos móveis.

## Prompt para o ChatGPT

Use a imagem anexada como referência de fotografia gastronômica e identidade da marca. Redesenhe a composição para mostrar um mockup de alta fidelidade da home de delivery Burger King, em português do Brasil. A lógica visual é a de uma tela de seleção de personagens de videogame aplicada a hambúrgueres.

Mostre uma única página desktop de frente, como uma captura de tela real, em composição vertical larga, sem moldura de dispositivo. Inclua cabeçalho, hero e grade na mesma imagem.

HERO: PALCO DO PRODUTO SELECIONADO
Crie um hero com fundo laranja intenso e saturado inspirado na marca. À esquerda, apresente “Whopper Clássico”, uma descrição curta, preço do sanduíche “R$ 31,90” e controles de compra. À direita, mostre esse mesmo hambúrguer em grande escala, irresistível, com pão tostado, carne grelhada, queijo derretido e vegetais frescos. Use títulos arredondados expressivos e textos com contraste forte.

Represente um instante quase final da animação de montagem: base e carne já alinhadas, queijo, tomate, alface e pão superior ligeiramente separados em camadas acima, prestes a se acomodar. Preserve silhueta reconhecível e proporções apetitosas. Sombras suaves, sobreposição e perspectiva nos ingredientes sugerem profundidade e movimento; a página continua frontal. Esse instante representa uma entrada ingrediente por ingrediente disparada pela seleção na grade. Cada produto terá sua própria coreografia no site futuro.

COMPRA E COMBO NO HERO
Inclua checkbox marcado “Transformar em combo”, controle segmentado P / M / G com M selecionado e texto “Combo M: + R$ 12,00”. Exiba o total “R$ 43,90” como valor principal e botão vermelho “Adicionar ao carrinho”. O preço do sanduíche é secundário. Organize tudo em um bloco compacto, legível e próximo. Os controles afetam somente o produto selecionado.

GRADE COMO SELETOR
Abaixo do hero, em uma área clara contrastante, coloque “Escolha seu hambúrguer” e oito produtos em quatro colunas e duas linhas. Cada card contém somente foto e nome do hambúrguer. O card “Whopper Clássico” tem contorno marcante, fundo diferenciado e indicador “Selecionado”, conectando visualmente a escolha ao hero. Os outros cards parecem opções clicáveis. Use fotografias variadas, apetitosas e bem alinhadas. Reserve preços e ações de compra ao hero.

CABEÇALHO E ESTILO
Cabeçalho compacto com marca Burger King, endereço de entrega, links discretos para Batatas, Bebidas e Sobremesas e carrinho. Combine energia de seleção de videogame com uma interface elegante de delivery. O produto selecionado é o protagonista. Use profundidade implementável com recortes fotográficos e animações leves. Nomes e valores são ilustrativos. Entregue somente a imagem do mockup, sem código ou anotações técnicas.

## Próximas decisões

- Escolher a direção visual e gerar sua versão mobile.
- Definir catálogo, preços, imagens e composição dos combos.
- Definir persistência da escolha de combo entre produtos.
- Detalhar entradas e limites de desempenho.
