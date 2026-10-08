# 03: Tracer bullet 3D: módulo de cena do hambúrguer com geometria simples

**What to build:** o hambúrguer passa a ser desenhado por uma cena Three.js, no hero e em Alterar ingredientes, com câmera ~15° acima, luz suave do alto à esquerda, fundo transparente e sombras de contato na cena. As 10 camadas ainda são formas coloridas simples. Toda a lógica 3D fica em um único módulo de cena com interface pequena (montar no palco, definir estado exibido montado/aberto + ingredientes retirados, informar a área de cada camada na tela, liberar recursos); o resto da página não conhece Three.js. Os botões DOM invisíveis são posicionados pela área informada pela cena. Abrir, compactar ao aplicar e o hero refletindo a personalização funcionam em 3D. Sem WebGL, as ilustrações SVG aparecem. ADR 0001; spec `.scratch/hamburguer-3d/spec.md`.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Uma cena e um contexto WebGL por palco (hero e Alterar ingredientes), mesma câmera e luz
- [ ] O reducer continua fonte de verdade; a cena apenas reflete o estado
- [ ] Botões DOM sobre cada camada com rótulo "Retirar <ingrediente>", alcançáveis por toque e teclado
- [ ] Abrir mostra as camadas separadas; aplicar compacta as presentes com o pão superior descendo até a base; altura final menor quando há ingredientes retirados
- [ ] Hero exibe o hambúrguer montado sem os ingredientes retirados
- [ ] Sem WebGL, fallback SVG com o mesmo fluxo (teste Playwright)
- [ ] Movimento reduzido: transições sem animação
- [ ] Toda a suíte Playwright continua verde
