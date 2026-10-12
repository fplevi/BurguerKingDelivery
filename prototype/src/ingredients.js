// Receita of each product: its Camadas from bottom to top, which form the Base (locked),
// and the texts and price the page shows for it. Nothing outside this file names a product.
//
// Camada: id (unique within the Receita), name, model (3D model in layerModels and SVG
// illustration; defaults to the id, so a repeated ingredient shares one), locked (Base),
// text (its part of the description; a repeated text is said once, none says nothing),
// turn (radians about the vertical axis, so a repeated model doesn't look identical).
// SVG fallback only: y, closed top in the hero (px); thickness, how much it raises the
// Camada above it when assembled (px).
const recipe = ({ layers, ...product }) => ({
  ...product,
  layers: layers.map((layer, index) => ({ model: layer.id, locked: false, z: index + 1, ...layer })),
});

export const recipes = {
  whopper: recipe({
    id: 'whopper',
    name: 'Whopper®',
    price: 3190,
    // Brazilian recipe.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'carne grelhada', y: 205, thickness: 36, locked: true },
      { id: 'cheese', name: 'Queijo', text: 'queijo derretido', y: 179, thickness: 9 },
      { id: 'pickles', name: 'Picles', text: 'picles', y: 160, thickness: 8 },
      { id: 'ketchup', name: 'Ketchup', text: 'ketchup', y: 148, thickness: 4 },
      { id: 'onion', name: 'Cebola', text: 'cebola', y: 136, thickness: 8 },
      { id: 'tomato', name: 'Tomate', text: 'tomate fresco', y: 114, thickness: 12 },
      { id: 'lettuce', name: 'Alface', text: 'alface crocante', y: 86, thickness: 15 },
      { id: 'mayo', name: 'Maionese', text: 'maionese', y: 62, thickness: 4 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 62, locked: true },
    ],
  }),
  cheddarDuplo: recipe({
    id: 'cheddarDuplo',
    name: 'Cheddar Duplo',
    // Provisional texts and price (spec): the official menu description was not found.
    price: 3490,
    // As seen in the official photo; Base: buns and both meats.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'duas carnes grelhadas', y: 205, thickness: 36, locked: true },
      { id: 'cheddar1', name: 'Cheddar inferior', text: 'cheddar cremoso', model: 'cheddar', y: 179, thickness: 18 },
      { id: 'meat2', name: 'Carne grelhada', model: 'meat', turn: 1.9, y: 145, thickness: 45, locked: true },
      { id: 'cheddar2', name: 'Cheddar superior', text: 'cheddar cremoso', model: 'cheddar', turn: 1.9, y: 119, thickness: 18 }, // turned with its patty, whose outline it follows
      { id: 'crispyOnion', name: 'Cebola crispy', text: 'cebola crispy', y: 92, thickness: 20 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 49, locked: true },
    ],
  }),
};

/** Camada `id` of a Receita. */
export const layer = (recipe, id) => recipe.layers.find((l) => l.id === id);

/** The texts of the Camadas still in the burger, bottom to top: "Pão com gergelim, … e maionese." */
export const description = (recipe, removed = []) =>
  new Intl.ListFormat('pt-BR').format(
    new Set(recipe.layers.filter((l) => l.text && !removed.includes(l.id)).map((l) => l.text)),
  ) + '.';

/**
 * The Ingredientes retirados, bottom to top, in lower case: "Sem picles e cebola"; none, "Todos os ingredientes".
 * The one wording for both the Carrinho's Item and the Ver ingredientes status line.
 */
export const removedLine = (recipe, removed = []) => {
  const names = recipe.layers.filter((l) => removed.includes(l.id)).map((l) => l.name.toLowerCase());
  return names.length ? 'Sem ' + new Intl.ListFormat('pt-BR').format(names) : 'Todos os ingredientes';
};
