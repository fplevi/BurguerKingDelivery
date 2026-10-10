(async () => {
  const expectedFile = 'BElIaiOW5D1qFF8QStnoDo';
  if (figma.fileKey && figma.fileKey !== expectedFile) {
    figma.closePlugin('Abra o arquivo Burger King de destino antes de executar.');
    return;
  }
  const fonts = await figma.listAvailableFontsAsync();
  const specs = [
    { suffix: 'Flame Bold', families: ['Flame Bold', 'Flame'], styles: ['Regular', 'Bold'] },
    { suffix: 'Flame Sans', families: ['Flame Sans', 'FlameSans'], styles: ['Regular'] },
    { suffix: 'Flame', families: ['Flame'], styles: ['Regular'] }
  ];
  const chosen = {};
  for (const spec of specs) {
    let match;
    for (const family of spec.families) {
      match = fonts.find(f => f.fontName.family === family &&
        f.fontName.style === (spec.suffix === 'Flame Bold' && family === 'Flame' ? 'Bold' : 'Regular'));
      if (match) break;
    }
    if (!match) {
      figma.closePlugin('Fonte não disponível: ' + spec.suffix + '. Abra este plugin no Figma Desktop com os TTF instalados. Nada foi alterado.');
      return;
    }
    chosen[spec.suffix] = match.fontName;
  }
  await Promise.all(Object.values(chosen).map(font => figma.loadFontAsync(font)));
  const nodes = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })
    .filter(n => n.name.startsWith('Texto editável / aplicar '));
  const targets = nodes.filter(n => {
    let parent = n.parent;
    while (parent) {
      if (parent.type === 'INSTANCE') return false;
      parent = parent.parent;
    }
    return true;
  });
  await Promise.all(targets.flatMap(n => n.getStyledTextSegments(['fontName'])
    .map(s => figma.loadFontAsync(s.fontName))));
  let changed = 0;
  for (const text of targets) {
    const family = text.name.slice('Texto editável / aplicar '.length);
    if (!chosen[family]) continue;
    const parent = text.parent;
    if (!parent || !('children' in parent)) continue;
    const lettering = parent.children.find(n => n.id !== text.id &&
      (n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'VECTOR'));
    if (!lettering) continue;
    const originalSize = text.fontSize;
    text.fontName = chosen[family];
    text.textAutoResize = 'WIDTH_AND_HEIGHT';
    text.lineHeight = { unit: 'PERCENT', value: 100 };
    text.letterSpacing = { unit: 'PIXELS', value: 0 };
    text.fontSize = originalSize;
    if (text.width > parent.width && text.width > 0) {
      text.fontSize = originalSize * parent.width / text.width;
    }
    text.x = 0;
    text.y = -(text.height - parent.height) / 2;
    const vector = lettering.type === 'VECTOR' ? lettering :
      lettering.findAllWithCriteria({ types: ['VECTOR'] })[0];
    if (vector && Array.isArray(vector.fills)) text.fills = vector.fills;
    if ('clipsContent' in parent) parent.clipsContent = false;
    text.visible = true;
    lettering.visible = false;
    lettering.name = 'Backup vetorial / ' + family;
    text.name = 'Texto / ' + family;
    if (parent.type === 'COMPONENT') {
      const property = parent.addComponentProperty('Texto', 'TEXT', text.characters);
      text.componentPropertyReferences = { characters: property };
      parent.description = 'Tipografia nativa ' + family + '. Conteúdo editável pela propriedade Texto. Backup vetorial oculto preservado.';
    }
    changed++;
  }
  figma.viewport.scrollAndZoomIntoView([await figma.getNodeByIdAsync('49:1104')]);
  figma.closePlugin(changed + ' camadas convertidas para texto nativo Flame. Os componentes atualizam suas instâncias; backups vetoriais foram preservados.');
})().catch(error => figma.closePlugin('Falha ao aplicar fontes: ' + String(error)));



