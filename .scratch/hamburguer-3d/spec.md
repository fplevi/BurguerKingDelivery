# Hambúrguer 3D procedural em Alterar ingredientes

Status: ready-for-agent

Contexto: `GLOSSARY.md`, `docs/adr/0001-visuais-gerados-por-codigo.md`, spec anterior em `.scratch/home-delivery/spec.md` e ticket validado `.scratch/home-delivery/issues/01-validar-playground.md`.

## Problem Statement

O cliente vê o Whopper como uma ilustração SVG provisória, chapada e sem volume. Ao abrir Alterar ingredientes e retirar camadas, nada parece comida de verdade: as camadas não têm textura, luz nem profundidade, e o ingrediente retirado simplesmente some, sem aparecer na bandeja. O produto não desperta apetite e a manipulação não transmite a sensação de mexer em um hambúrguer real. Não há fotos de ingredientes separados nem orçamento para imagens geradas por IA.

## Solution

O Whopper passa a ser modelado proceduralmente em 3D, apenas com código, com realismo de renderização de alta qualidade. Cada uma das 10 camadas da receita brasileira é um objeto 3D próprio, com textura, volume e luz coerentes, visto por uma câmera cerca de 15° acima. O hero mostra sempre o hambúrguer montado a partir das camadas, refletindo a personalização. Em Alterar ingredientes, o hambúrguer se abre em camadas reais; o cliente retira ingredientes por toque, teclado ou arrasto, e cada ingrediente retirado aparece na bandeja como imagem do mesmo objeto 3D. Uma leve inclinação acompanha o ponteiro ou o aparelho, dando a sensação de volume. A interação já validada é mantida.

## User Stories

1. Como cliente, quero ver o Whopper no hero com aparência de comida real, para sentir vontade de pedir.
2. Como cliente, quero que o pão superior tenha gergelim, brilho e tostado realistas, para reconhecer o Whopper.
3. Como cliente, quero que a carne mostre textura grelhada, bordas irregulares e marcas de chapa, para perceber que é carne grelhada no fogo.
4. Como cliente, quero ver o miolo do pão inferior quando o hambúrguer está aberto, para que as partes ocultas pareçam reais.
5. Como cliente, quero que o queijo pareça derretido sobre a carne, para reconhecer o ingrediente.
6. Como cliente, quero distinguir picles, ketchup, cebola, tomate, alface e maionese pela aparência, para saber o que estou retirando.
7. Como cliente, quero que ketchup e maionese sejam camadas separadas, para retirar só um dos molhos.
8. Como cliente, quero que as camadas sigam a ordem real do Whopper (pão inferior, carne, queijo, picles, ketchup, cebola, tomate, alface, maionese, pão superior), para que o hambúrguer pareça autêntico.
9. Como cliente, quero que todas as camadas compartilhem a mesma luz e perspectiva, para que o hambúrguer pareça uma única peça e não recortes empilhados.
10. Como cliente, quero que o hambúrguer do hero reflita a personalização aplicada, para ver exatamente o que vou receber.
11. Como cliente, quero que o hambúrguer incline levemente seguindo o ponteiro no desktop, para perceber o volume.
12. Como cliente no Android, quero que o hambúrguer incline com o movimento do celular, para perceber o volume.
13. Como cliente no iPhone, quero inclinar o hambúrguer arrastando na área vazia do palco, sem pedido de permissão de movimento.
14. Como cliente sensível a movimento, quero que a inclinação e as animações sejam desativadas quando ativo movimento reduzido.
15. Como cliente, quero tocar em "Remover ingredientes" e ver o hambúrguer se abrir em camadas 3D em tela cheia com o título "O seu hambúrguer do seu jeito".
16. Como cliente, quero tocar em um ingrediente aberto para retirá-lo.
17. Como cliente, quero arrastar um ingrediente até a bandeja para retirá-lo, vendo o próprio objeto 3D acompanhar meu dedo ou cursor.
18. Como cliente, quero ver cada ingrediente retirado na bandeja como imagem do mesmo ingrediente, para saber o que tirei.
19. Como cliente, quero tocar na imagem de um ingrediente retirado na bandeja para recolocá-lo.
20. Como cliente, quero continuar usando os chips para retirar e recolocar ingredientes.
21. Como cliente de teclado, quero alcançar cada ingrediente por Tab e retirá-lo com Enter ou Espaço.
22. Como cliente com leitor de tela, quero que cada ingrediente seja anunciado como botão "Retirar <ingrediente>".
23. Como cliente, quero que pão inferior, carne e pão superior (a Base) não possam ser retirados.
24. Como cliente, quero "Recolocar todos" para desfazer todas as retiradas do rascunho.
25. Como cliente, quero aplicar e ver as camadas presentes se compactarem, com o pão superior descendo até a base, antes de voltar ao hero.
26. Como cliente, quero que a altura final do hambúrguer diminua quando retiro ingredientes.
27. Como cliente, quero cancelar e ter a personalização anterior restaurada.
28. Como cliente, quero adicionar ao carrinho o Whopper personalizado com a lista de ingredientes retirados.
29. Como cliente no celular, quero que o hambúrguer apareça rápido e se mova com fluidez.
30. Como cliente com aparelho sem WebGL, quero ver as ilustrações SVG e continuar podendo personalizar.
31. Como cliente, quero que o site carregue pouco código, para não gastar dados nem esperar.
32. Como responsável pelo produto, quero revisar pães e carne antes das outras camadas, para corrigir a direção visual cedo.
33. Como responsável pelo produto, quero medições reais de peso, primeiro quadro e quadros por segundo, para saber se o orçamento foi cumprido.
34. Como desenvolvedor, quero testes automatizados que usem a página como o cliente usa, para validar o fluxo sem depender de detalhes do 3D.

## Implementation Decisions

- **Ferramentas:** o protótipo deixa de ser um HTML sem instalação. Passa a usar npm e um bundler com tree-shaking (ex.: Vite), importando de Three.js apenas o necessário, para reduzir o peso entregue ao cliente. A prévia local passa pelo servidor de desenvolvimento do bundler; o README é atualizado.
- **Sem imagens externas:** todas as texturas (gergelim, miolo, marcas de grelha, nervuras da alface, sementes do tomate, brilho dos molhos) são geradas por código no carregamento. Nenhuma imagem de ingrediente é baixada (ADR 0001).
- **Módulo de cena do hambúrguer (profundo):** um único módulo encapsula renderizador, câmera, luz, sombras, modelos procedurais das camadas e animações. Interface pequena, aproximadamente:
  - montar em um elemento do palco;
  - definir o estado exibido: montado ou aberto e o conjunto de ingredientes retirados (com transição animada);
  - informar a área na tela de cada camada, para posicionar os botões DOM;
  - mover temporariamente uma camada durante o arrasto e soltá-la;
  - gerar a imagem de uma camada isolada, para a bandeja;
  - aplicar inclinação a partir de ponteiro, orientação do aparelho ou arrasto na área vazia;
  - liberar recursos.

  O restante da página não conhece Three.js.
- **Uma cena, um contexto WebGL por palco** (hero e Alterar ingredientes). Luz e câmera são iguais em ambos.
- **Camadas (de baixo para cima):** pão inferior, carne, queijo, picles, ketchup, cebola, tomate, alface, maionese, pão superior. Base: pão inferior, carne, pão superior (não removíveis). Picles, cebola e tomate são uma camada cada, com várias fatias.
- **Estado:** o reducer existente continua como fonte de verdade (abrir, alternar, retirar, recolocar todos, aplicar, cancelar, combo, tamanho, carrinho). A lista de ingredientes passa de 9 para 10 (molho vira ketchup e maionese) e segue a nova ordem. A cena apenas reflete o estado. Formato atual, vindo do protótipo:

  ```js
  // estado: { editing, removed: [ids aplicados], draft: [ids no rascunho], combo, size, cart }
  case 'open':   return {...s, editing:true, draft:[...s.removed]}
  case 'toggle': // ignora se não estiver editando ou se a camada é Base
  case 'apply':  return {...s, editing:false, removed:[...s.draft]}
  case 'cancel': return {...s, editing:false, draft:[]}
  ```

- **Acessibilidade:** os botões DOM existentes permanecem sobre a cena, invisíveis, posicionados pela área informada por camada. Toque, teclado, foco, rótulos e arrasto partem desses botões; a cena só desenha.
- **Bandeja:** cada ingrediente retirado aparece como imagem gerada pela própria cena (mesma luz e câmera); tocar a imagem recoloca. Os chips continuam.
- **Câmera e luz:** câmera ~15° acima; luz suave vinda do alto à esquerda; fundo transparente sobre o laranja do hero e o creme de Alterar ingredientes; sombras de contato calculadas na cena.
- **Inclinação:** até ±10°, sem rotação livre. Desktop: ponteiro. Android: orientação do aparelho. iOS: arrasto na área vazia do palco, sem pedido de permissão. Em Alterar ingredientes, arrastar um ingrediente continua significando retirá-lo. Desativada com movimento reduzido.
- **Orçamento (medido, não estimado):** ≤ 250 KB gzip de JavaScript para a parte 3D, Three.js incluído; primeiro quadro ≤ 1,5 s em celular intermediário; ~60 fps no desktop e ≥ 30 fps em celular intermediário.
- **Fallback:** sem WebGL, as ilustrações SVG atuais são exibidas, com a mesma interação.
- **Textos:** título de Alterar ingredientes "O seu hambúrguer do seu jeito"; botão do hero "Remover ingredientes".
- **Referência visual:** as fotos oficiais do produto inteiro na grade servem só como referência de proporção e cor.
- **Marco de revisão:** depois de pão inferior, carne e pão superior prontos e exibidos no hero e em Alterar ingredientes, parar para revisão humana antes das outras 7 camadas.

## Testing Decisions

- **Uma única costura de teste: a página no navegador real**, via Playwright, usando a interface como o cliente: papéis e rótulos acessíveis, nunca internals do Three.js.
- Bons testes verificam comportamento externo: abrir Alterar ingredientes; retirar por botão, teclado e arrasto até a bandeja; imagem do ingrediente aparece na bandeja; recolocar pela imagem e pelos chips; Base não retirável; recolocar todos; aplicar compacta e atualiza o texto do hero; cancelar preserva a personalização anterior; item personalizado chega ao carrinho com os ingredientes retirados.
- Verificações visuais por capturas de tela nos marcos (desktop e 390 × 844), revisadas por humano; comparação pixel a pixel não é critério de aprovação do realismo.
- Medição de orçamento como teste: peso gzip do bundle, tempo até o primeiro quadro e fps medidos na página, comparados aos limites.
- Fallback: com WebGL indisponível, as ilustrações SVG aparecem e o fluxo de retirada funciona.
- Movimento reduzido: com a preferência ativa, sem inclinação nem animações.
- Prior art: não há testes no repositório. As verificações manuais registradas no ticket `01-validar-playground` e no README do protótipo descrevem os fluxos a automatizar.
- Arrasto por toque e desempenho em celular ainda exigem validação em aparelho físico.

## Out of Scope

- Animação de entrada que monta o hambúrguer ao selecioná-lo na grade (ticket próprio depois).
- Outros produtos além do Whopper; a grade continua com fotos estáticas.
- Rotação livre do hambúrguer.
- Imagens geradas por IA ou fotografia real (ADR 0001).
- Efeito da retirada no preço (continua sem desconto).
- Renomear no código o termo antigo "playground" para Alterar ingredientes.
- Migração para React/TypeScript da home definitiva.

## Further Notes

- O realismo esperado é de renderização 3D de alta qualidade, não indistinguível de foto.
- A receita foi conferida em cardápios de delivery (99Food); o site oficial bloqueou acesso automatizado. Conferir no app oficial antes de dar o visual por final.
- O trabalho continua no branch `prototype/burger-playground`.
