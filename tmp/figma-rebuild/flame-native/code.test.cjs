const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

async function run(type) {
  const vector = { id: 'vector', type: 'VECTOR', visible: true, name: 'Vector', fills: [{type: 'SOLID', color: {r: .31, g: .14, b: .08}}] };
  const parent = { type, width: 160, height: 20, parent: null, children: [vector] };
  if (type === 'FRAME') parent.clipsContent = true;
  Object.preventExtensions(parent);
  const text = { id: 'text', type: 'TEXT', name: 'Texto editável / aplicar Flame', parent, fontSize: 21, width: 139, height: 24, characters: 'Coca-Cola Zero', visible: false, getStyledTextSegments: () => [{fontName: {family: 'Inter', style: 'Regular'}}] };
  parent.children.push(text);
  const done = new Promise(resolve => {
    const figma = {
      fileKey: 'BElIaiOW5D1qFF8QStnoDo',
      listAvailableFontsAsync: async () => ['Flame', 'Flame Bold', 'Flame Sans'].map(family => ({fontName: {family, style: 'Regular'}})),
      loadFontAsync: async () => {},
      currentPage: {findAllWithCriteria: () => [text]},
      viewport: {scrollAndZoomIntoView: () => {}},
      getNodeByIdAsync: async () => ({}),
      closePlugin: resolve
    };
    vm.runInNewContext("'use strict';\n" + fs.readFileSync(__dirname + '/code.js', 'utf8'), {figma});
  });
  const message = await done;
  assert.ok(!message.startsWith('Falha'), message);
  assert.equal(text.visible, true);
  assert.equal(vector.visible, false);
  assert.equal(text.characters, 'Coca-Cola Zero');
  console.log(type + ': conversão concluída');
}
(async () => { await run('GROUP'); await run('FRAME'); })().catch(error => { console.error(error.message); process.exitCode = 1; });
