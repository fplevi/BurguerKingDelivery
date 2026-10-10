// Receita of each product: its Camadas from bottom to top, which form the Base (locked),
// and the texts and price the page shows for it. Nothing outside this file names a product.
//
// Camada: id (unique within the Receita), name, model (3D model in layerModels and SVG
// illustration; defaults to the id, so a repeated ingredient shares one), locked (Base).
// SVG fallback only: y, closed top in the hero (px); thickness, how much it raises the
// Camada above it when assembled (px).
const recipe = ({ layers, ...product }) => ({
  ...product,
  layers: layers.map((layer, index) => ({ model: layer.id, locked: false, z: index + 1, ...layer })),
});

export const recipes = {
  whopper: recipe({
    id: 'whopper',
    name: 'Whopper Clássico',
    shortName: 'Whopper',
    description: 'Pão com gergelim, carne grelhada, queijo, picles, ketchup, cebola, tomate, alface e maionese. Seu favorito, do seu jeito.',
    price: 3190,
    // Brazilian recipe.
    layers: [
      { id: 'bottom', name: 'Pão inferior', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', y: 205, thickness: 36, locked: true },
      { id: 'cheese', name: 'Queijo', y: 179, thickness: 9 },
      { id: 'pickles', name: 'Picles', y: 160, thickness: 8 },
      { id: 'ketchup', name: 'Ketchup', y: 148, thickness: 4 },
      { id: 'onion', name: 'Cebola', y: 136, thickness: 8 },
      { id: 'tomato', name: 'Tomate', y: 114, thickness: 12 },
      { id: 'lettuce', name: 'Alface', y: 86, thickness: 15 },
      { id: 'mayo', name: 'Maionese', y: 62, thickness: 4 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 62, locked: true },
    ],
  }),
};

/** Camada `id` of a Receita. */
export const layer = (recipe, id) => recipe.layers.find((l) => l.id === id);
